from sqlalchemy import (
    Float,
    ForeignKey,
    String,
    Text,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base


class Finding(Base):
    __tablename__ = "findings"

    id: Mapped[int] = mapped_column(primary_key=True)

    analysis_id: Mapped[int] = mapped_column(
        ForeignKey("analyses.id", ondelete="CASCADE"),
        index=True,
    )

    title: Mapped[str] = mapped_column(String(200))

    description: Mapped[str] = mapped_column(
        Text,
        default="",
    )

    source: Mapped[str | None] = mapped_column(
        String(200),
        nullable=True,
    )

    confidence: Mapped[float | None] = mapped_column(
        Float,
        nullable=True,
    )

    analysis = relationship(
        "Analysis",
        back_populates="findings",
    )
