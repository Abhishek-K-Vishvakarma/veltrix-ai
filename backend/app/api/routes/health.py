import logging

from fastapi import APIRouter, Depends
from sqlalchemy import text
from sqlalchemy.orm import Session

from app.core.config import settings
from app.db.session import get_db
from app.tools.ocr import tesseract_diagnostics

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/health", tags=["Health"])


@router.get("")
def health_check(db: Session = Depends(get_db)):
    try:
        db.execute(text("SELECT 1"))
        database_status = "ok"
    except Exception as exc:  # noqa: BLE001 - health reports degraded dependencies
        logger.error(
            "Health database check failed: exception_type=%s",
            type(exc).__name__,
        )
        database_status = "error"
    tesseract = tesseract_diagnostics()
    return {
        "status": "ok" if database_status == "ok" else "degraded",
        "service": "VELTRIX API",
        "environment": settings.ENVIRONMENT,
        "database": {"status": database_status},
        "tesseract": tesseract,
        "gemini": {
            "configured": bool(settings.GEMINI_API_KEY),
            "model": settings.GEMINI_MODEL,
            "availability": "not_tested",
        },
    }
