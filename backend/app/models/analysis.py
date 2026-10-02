from datetime import datetime

from sqlalchemy import (
    JSON,
    DateTime,
    Float,
    ForeignKey,
    Integer,
    String,
    Text,
    func,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base


class Analysis(Base):
    __tablename__ = "analyses"

    id: Mapped[int] = mapped_column(primary_key=True)

    user_id: Mapped[int] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"),
        index=True,
    )

    title: Mapped[str] = mapped_column(
        String(200),
        default="Untitled analysis",
    )

    category: Mapped[str] = mapped_column(
        String(40),
        default="Other",
        index=True,
    )

    input_type: Mapped[str] = mapped_column(
        String(20),
        default="problem",
    )

    status: Mapped[str] = mapped_column(
        String(20),
        default="pending",
        index=True,
    )

    confidence: Mapped[float | None] = mapped_column(
        Float,
        nullable=True,
    )

    summary: Mapped[str] = mapped_column(
        Text,
        default="",
    )

    result_json: Mapped[dict | None] = mapped_column(
        JSON,
        nullable=True,
    )

    error_message: Mapped[str | None] = mapped_column(
        Text,
        nullable=True,
    )

    processing_time_ms: Mapped[int | None] = mapped_column(
        Integer,
        nullable=True,
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        index=True,
    )

    completed_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True),
        nullable=True,
    )

    # User
    user = relationship(
        "User",
        back_populates="analyses",
    )

    # Findings
    findings = relationship(
        "Finding",
        back_populates="analysis",
        cascade="all, delete-orphan",
        passive_deletes=True,
        order_by="Finding.id",
    )

    # Action Plans
    action_plans = relationship(
        "ActionPlan",
        back_populates="analysis",
        cascade="all, delete-orphan",
        passive_deletes=True,
        order_by="ActionPlan.id",
    )

    # Reasoning Logs
    reasoning_logs = relationship(
        "ReasoningLog",
        back_populates="analysis",
        cascade="all, delete-orphan",
        passive_deletes=True,
        order_by="ReasoningLog.id",
    )

    # Evidence Files
    evidence = relationship(
        "EvidenceFile",
        back_populates="analysis",
        cascade="all, delete-orphan",
        passive_deletes=True,
        order_by="EvidenceFile.id",
    )
