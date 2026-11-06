import io

import pytest
from PIL import Image, ImageDraw, ImageFont

from app.core import config
from app.core.config import Settings, settings
from app.tools import ocr


def _readable_png() -> bytes:
    image = Image.new("RGB", (400, 100), "white")
    ImageDraw.Draw(image).text((12, 35), "TOTAL 125.50", fill="black", font=ImageFont.load_default())
    output = io.BytesIO()
    image.save(output, format="PNG")
    return output.getvalue()


def test_ocr_extracts_words_from_valid_image(monkeypatch):
    def fake_image_to_data(image, **kwargs):
        assert image.mode == "L"
        return {
            "text": ["TOTAL", "125.50"],
            "conf": ["92", "95"],
            "block_num": [1, 1],
            "par_num": [1, 1],
            "line_num": [1, 1],
        }

    monkeypatch.setattr(ocr.pytesseract, "image_to_data", fake_image_to_data)

    result = ocr.ocr_image(_readable_png())

    assert result.engine == "tesseract"
    assert result.text == "TOTAL 125.50"
    assert result.confidence == 93.5


def test_ocr_reads_image_containing_text():
    if not ocr.tesseract_ok():
        pytest.skip("Tesseract is not installed in the test environment")
    if "eng" not in ocr.tesseract_diagnostics()["languages"]:
        pytest.skip("The Tesseract English language pack is not installed")

    result = ocr.ocr_image(_readable_png())

    assert "TOTAL" in result.text.upper()
    assert "125.50" in result.text


def test_missing_tesseract_binary_is_reported_and_ocr_falls_back(
    monkeypatch, caplog
):
    monkeypatch.setattr(settings, "tesseract_cmd", "missing-tesseract-binary")

    assert ocr.tesseract_ok() is False
    result = ocr.ocr_image(_readable_png())

    assert result == ocr.NONE
    assert "Image OCR failed" in caplog.text


def test_tesseract_configuration_is_platform_aware(monkeypatch):
    windows_path = r"C:\Program Files\Tesseract-OCR\tesseract.exe"
    monkeypatch.setattr(config.platform, "system", lambda: "Linux")
    linux_settings = Settings(tesseract_cmd=windows_path, _env_file=None)
    assert linux_settings.TESSERACT_CMD == "tesseract"

    monkeypatch.setattr(config.platform, "system", lambda: "Windows")
    windows_settings = Settings(tesseract_cmd=windows_path, _env_file=None)
    assert windows_settings.TESSERACT_CMD == windows_path


def test_gemini_api_key_is_loaded_from_environment(monkeypatch):
    monkeypatch.setenv("GEMINI_API_KEY", "unit-test-key")

    env_settings = Settings(ENVIRONMENT="test", _env_file=None)

    assert env_settings.GEMINI_API_KEY == "unit-test-key"
