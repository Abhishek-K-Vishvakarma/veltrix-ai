from fastapi.testclient import TestClient

from app.main import app


def test_health():
    r = TestClient(app).get("/api/health")
    assert r.status_code == 200
    body = r.json()
    assert body["status"] in {"ok", "degraded"}
    assert body["database"]["status"] in {"ok", "error"}
    assert set(body["tesseract"]) == {"available", "version", "languages"}
    assert set(body["gemini"]) == {"configured", "model", "availability"}
    assert body["gemini"]["availability"] == "not_tested"
