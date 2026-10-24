"""OCR-first reading of evidence. Cheap, fast, local. Gemini vision is only the fallback."""

import io
import re
from dataclasses import dataclass

from app.core.config import settings

OCR_MIN_CONF = 70.0  # below this the image goes to Gemini vision instead
OCR_MIN_CHARS = 20  # almost no text found -> let vision try


@dataclass
class OcrResult:
    text: str
    confidence: float  # 0-100 (mean word confidence); 100 for digital text
    engine: str  # "tesseract" | "pdf-text" | "none"

    @property
    def usable(self) -> bool:
        words = re.findall(r"[A-Za-z]{3,}", self.text)
        # needs real sentences: photos of meters/displays are mostly digits -> go to vision instead
        return (
            len(words) >= 4
            and len(self.text.strip()) >= OCR_MIN_CHARS
            and self.confidence >= OCR_MIN_CONF
        )


NONE = OcrResult("", 0.0, "none")


def _set_cmd(pytesseract) -> None:
    cmd = getattr(settings, "TESSERACT_CMD", "")
    if cmd:
        pytesseract.pytesseract.tesseract_cmd = cmd


def tesseract_ok() -> bool:
    try:
        import pytesseract

        _set_cmd(pytesseract)
        pytesseract.get_tesseract_version()
        return True
    except Exception:  # noqa: BLE001
        return False


def _prepare(img):
    from PIL import Image, ImageOps

    img = ImageOps.exif_transpose(img).convert("L")  # fix phone rotation, grayscale
    if max(img.size) < 1600:  # small photos: upscale for digits
        k = 1600 / max(img.size)
        img = img.resize((int(img.width * k), int(img.height * k)), Image.LANCZOS)
    return ImageOps.autocontrast(img)


def ocr_image(data: bytes) -> OcrResult:
    try:
        import pytesseract
        from PIL import Image

        _set_cmd(pytesseract)
        img = _prepare(Image.open(io.BytesIO(data)))
        d = pytesseract.image_to_data(
            img, config="--oem 3 --psm 6", output_type=pytesseract.Output.DICT
        )
    except Exception:  # noqa: BLE001  (tesseract missing, corrupt image...)
        return NONE
    words, confs, lines = [], [], {}
    for i, w in enumerate(d["text"]):
        c = float(d["conf"][i])
        if w.strip() and c >= 0:
            words.append(w)
            confs.append(c)
            lines.setdefault(
                (d["block_num"][i], d["par_num"][i], d["line_num"][i]), []
            ).append(w)
    if not words:
        return NONE
    text = "\n".join(" ".join(v) for v in lines.values())
    return OcrResult(text[:30000], round(sum(confs) / len(confs), 1), "tesseract")


def read_pdf(data: bytes) -> OcrResult:
    """Digital PDFs already contain text: no OCR needed. Scanned PDFs return NONE -> vision."""
    try:
        from pypdf import PdfReader

        pages = [p.extract_text() or "" for p in PdfReader(io.BytesIO(data)).pages]
    except Exception:  # noqa: BLE001
        return NONE
    text = "\n".join(f"[Page {index + 1}]\n{page}" for index, page in enumerate(pages)).strip()
    if len(re.sub(r"\s", "", text)) < 40 * max(
        len(pages), 1
    ):  # too little text = scanned
        return NONE
    return OcrResult(text[:30000], 100.0, "pdf-text")


def extract(mime: str, data: bytes) -> OcrResult:
    if mime.startswith("image/"):
        return ocr_image(data)
    if mime == "application/pdf":
        return read_pdf(data)
    return NONE


# ---------------------------------------------------------------------------
# Meter / digit-display reading (electricity, water, gas meters, odometers)
# ---------------------------------------------------------------------------
def _variants(img):
    """Different clean-ups of the same photo; real meter photos need more than one try."""
    from PIL import Image, ImageFilter, ImageOps

    g = ImageOps.exif_transpose(img).convert("L")
    k = max(1.0, 1200 / max(g.size))
    g = g.resize((int(g.width * k), int(g.height * k)), Image.LANCZOS)
    g = ImageOps.autocontrast(g, cutoff=2)
    out = [g, ImageOps.invert(g)]
    for t in (110, 150):
        b = g.point(lambda p, t=t: 255 if p > t else 0)
        out += [b, ImageOps.invert(b)]
    out.append(g.filter(ImageFilter.MedianFilter(3)))
    return [ImageOps.expand(v, border=30, fill=255) for v in out]


def read_digits(data: bytes) -> tuple[str, int, int]:
    """Best digit string in a photo of a meter/display -> (digits, votes, passes).
    Runs several clean-ups x page modes with a digits-only whitelist and takes a majority vote.
    """
    try:
        import pytesseract
        from PIL import Image

        cmd = getattr(settings, "TESSERACT_CMD", "")
        if cmd:
            pytesseract.pytesseract.tesseract_cmd = cmd
        img = Image.open(io.BytesIO(data))
        variants = _variants(img)
    except Exception:  # noqa: BLE001
        return "", 0, 0
    votes: dict[str, int] = {}
    passes = 0
    for v in variants:
        for psm in (7, 8, 11, 6):
            passes += 1
            try:
                txt = pytesseract.image_to_string(
                    v,
                    config=f"--oem 3 --psm {psm} -c tessedit_char_whitelist=0123456789",
                )
            except Exception:  # noqa: BLE001
                continue
            for run in re.findall(r"\d{3,8}", txt):
                votes[run] = votes.get(run, 0) + 1
    if not votes:
        return "", 0, passes
    best = max(votes, key=lambda k: (votes[k], len(k)))
    return best, votes[best], passes


def tesseract_ok() -> bool:
    try:
        import pytesseract

        cmd = getattr(settings, "TESSERACT_CMD", "")
        if cmd:
            pytesseract.pytesseract.tesseract_cmd = cmd
        pytesseract.get_tesseract_version()
        return True
    except Exception:  # noqa: BLE001
        return False
