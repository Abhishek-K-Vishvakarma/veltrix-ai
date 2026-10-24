from datetime import datetime

from sqlalchemy import JSON, DateTime, ForeignKey, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base


def _default_preferences() -> dict:
    return {
        "theme": "light",
        "language": "en",
        "analysis_detail": "detailed",
        "notifications": {
            "analysis_completed": True,
            "analysis_failed": True,
            "weekly_summary": False,
        },
    }


class UserPreference(Base):
    __tablename__ = "user_preferences"

    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[int] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"), unique=True, index=True
    )
    preferences: Mapped[dict] = mapped_column(JSON, default=_default_preferences)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )
    user = relationship("User", back_populates="preferences")
