"""Usage (from backend/):  python -m scripts.ocr_check path/to/photo.jpg"""

import sys

from app.core.config import settings
from app.tools import ocr

print("Tesseract installed :", ocr.tesseract_ok())
print("Gemini key loaded   :", bool(settings.GEMINI_API_KEY))
if len(sys.argv) > 1:
    data = open(sys.argv[1], "rb").read()
    r = ocr.ocr_image(data)
    print("Normal OCR          :", r.engine, r.confidence, repr(r.text[:80]))
    d, votes, passes = ocr.read_digits(data)
    print("Meter digits        :", d or "(nothing)", f"({votes}/{passes} votes)")
