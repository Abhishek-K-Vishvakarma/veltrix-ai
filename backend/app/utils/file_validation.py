from pathlib import Path

from fastapi import HTTPException, UploadFile

MAX_FILES = 5
MAX_BYTES = 10 * 1024 * 1024  # 10 MB per file
ALLOWED = {
    ".png": "image/png",
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".webp": "image/webp",
    ".pdf": "application/pdf",
    ".txt": "text/plain",
    ".csv": "text/csv",
    ".docx": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
}


def validate_upload(file: UploadFile, data: bytes) -> str:
    """Returns the mime type, or raises an HTTP error."""
    filename = file.filename or ""
    ext = Path(filename).suffix.lower()
    if ext not in ALLOWED:
        raise HTTPException(415, f"Unsupported file type: {ext or 'unknown'}")
    if len(filename) > 255:
        raise HTTPException(400, "Filename is too long")
    if not data:
        raise HTTPException(400, "Uploaded file is empty")
    if len(data) > MAX_BYTES:
        raise HTTPException(413, "Uploaded file is larger than 10 MB")

    signatures = {
        ".png": data.startswith(b"\x89PNG\r\n\x1a\n"),
        ".jpg": data.startswith(b"\xff\xd8\xff"),
        ".jpeg": data.startswith(b"\xff\xd8\xff"),
        ".webp": (
            len(data) >= 12
            and data[:4] == b"RIFF"
            and data[8:12] == b"WEBP"
        ),
        ".pdf": data.lstrip().startswith(b"%PDF-"),
        ".docx": data.startswith(b"PK\x03\x04"),
    }
    if ext in signatures and not signatures[ext]:
        raise HTTPException(400, "File content does not match its extension")
    return ALLOWED[ext]
