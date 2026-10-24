from types import ModuleType, SimpleNamespace

import pytest

from app.core.config import settings
from app.llm import gemini_client
from app.llm.gemini_client import AnalysisOutput, LoadedFile
from app.tools.ocr import OcrResult


def _output() -> AnalysisOutput:
    return AnalysisOutput(
        title="Image summary",
        category="Other",
        summary="A chart is visible.",
        confidence=80,
        needs_more_evidence=False,
        evidence=[],
        calculations=[],
        findings=[],
        actions=[],
    )


def _fake_sdk(monkeypatch, generate_content):
    class Part:
        @staticmethod
        def from_text(text):
            return ("text", text)

        @staticmethod
        def from_bytes(data, mime_type):
            return ("bytes", data, mime_type)

    class Content:
        def __init__(self, role, parts):
            self.role = role
            self.parts = parts

    class GenerateContentConfig:
        def __init__(self, **kwargs):
            self.kwargs = kwargs

    types_module = SimpleNamespace(
        Part=Part,
        Content=Content,
        GenerateContentConfig=GenerateContentConfig,
    )
    genai_module = SimpleNamespace(
        Client=lambda **kwargs: SimpleNamespace(
            models=SimpleNamespace(generate_content=generate_content)
        )
    )
    google_module = ModuleType("google")
    google_module.genai = genai_module
    genai_module.types = types_module
    monkeypatch.setitem(__import__("sys").modules, "google", google_module)
    monkeypatch.setitem(__import__("sys").modules, "google.genai", genai_module)
    monkeypatch.setitem(__import__("sys").modules, "google.genai.types", types_module)
    return types_module


def test_ocr_text_does_not_replace_actual_image_payload(monkeypatch):
    seen = {}

    def generate_content(**kwargs):
        seen.update(kwargs)
        return SimpleNamespace(parsed=_output(), usage_metadata=None)

    _fake_sdk(monkeypatch, generate_content)
    monkeypatch.setattr(settings, "GEMINI_API_KEY", "unit-test-key")
    monkeypatch.setattr(
        gemini_client.ocr,
        "extract",
        lambda mime, data: OcrResult("Sales rose 12%", 92, "tesseract"),
    )
    file = LoadedFile("chart.png", "image/png", b"image-bytes")

    output, usage = gemini_client.analyze("Explain the trend", [file], "gemini-test")

    parts = seen["contents"][0].parts
    assert ("bytes", b"image-bytes", "image/png") in parts
    assert any("Sales rose 12%" in part[1] for part in parts if part[0] == "text")
    assert output.summary == "A chart is visible."
    assert usage.provider_status == "ai"


def test_transient_provider_failures_are_retried_with_a_bound(monkeypatch):
    class ProviderError(Exception):
        status_code = 503

    calls = 0

    def generate_content(**kwargs):
        nonlocal calls
        calls += 1
        if calls < 3:
            raise ProviderError("temporarily unavailable")
        return "ok"

    monkeypatch.setattr(gemini_client.time, "sleep", lambda _: None)
    client = SimpleNamespace(models=SimpleNamespace(generate_content=generate_content))

    assert gemini_client._generate(client, [], None, "gemini-test") == "ok"
    assert calls == 3


def test_permanent_provider_failure_is_not_retried(monkeypatch):
    class PermissionError(Exception):
        status_code = 403

    calls = 0

    def generate_content(**kwargs):
        nonlocal calls
        calls += 1
        raise PermissionError("permission denied")

    client = SimpleNamespace(models=SimpleNamespace(generate_content=generate_content))
    with pytest.raises(PermissionError):
        gemini_client._generate(client, [], None, "gemini-test")
    assert calls == 1


def test_offline_image_result_is_limited_and_not_meter_specific(monkeypatch):
    monkeypatch.setattr(settings, "GEMINI_API_KEY", "")
    monkeypatch.setattr(gemini_client.ocr, "extract", lambda mime, data: OcrResult("", 0, "none"))
    file = LoadedFile("object.png", "image/png", b"invalid-image")

    output, usage = gemini_client.analyze("Describe this object", [file], "gemini-test")

    assert output.category == "Other"
    assert output.needs_more_evidence
    assert output.confidence <= 40
    assert output.evidence == []
    assert "vision" in output.missing_evidence_message.lower()
    assert usage.provider_status == "offline"


def test_invalid_model_configuration_is_rejected(monkeypatch):
    monkeypatch.setattr(settings, "GEMINI_MODEL", "not-a-gemini-model")
    monkeypatch.setattr(gemini_client, "_ACTIVE_MODEL", None)

    with pytest.raises(ValueError, match="GEMINI_MODEL"):
        gemini_client.get_active_model()


def test_ground_check_drops_untraceable_calculation():
    output = _output()
    output.calculations = [gemini_client.CalcItem(label="invented", expression="10 * 11")]

    checked = gemini_client.ground_check(output, "The amount is 10")

    assert checked.calculations == []
    assert checked.confidence <= 65
    assert checked.findings[-1].title == "Some numbers could not be traced to the evidence"


def test_number_extraction_uses_the_defined_pattern():
    assert gemini_client._nums("Readings: 12.50 and 4") == {"12.5", "4"}
