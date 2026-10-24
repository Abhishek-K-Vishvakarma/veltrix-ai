import re
import uuid
from pathlib import Path

from app.core.config import settings


def _base() -> Path:
    return Path(getattr(settings, "UPLOAD_DIR", "uploads"))


def save_bytes(subdir: str, filename: str, data: bytes) -> str:
    safe = re.sub(r"[^A-Za-z0-9._-]", "_", Path(filename).name) or "file"
    folder = _base() / subdir
    folder.mkdir(parents=True, exist_ok=True)
    path = folder / f"{uuid.uuid4().hex[:8]}_{safe}"
    path.write_bytes(data)
    return str(path)


def read_bytes(path: str) -> bytes:
    return Path(path).read_bytes()
