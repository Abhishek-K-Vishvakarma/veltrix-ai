"""Evidence facts with traceable source and extraction metadata."""

from pydantic import BaseModel, Field


class EvidenceItem(BaseModel):
	label: str
	value: str
	source: str
	page: int | None = None
	location: str | None = None
	extraction_method: str | None = None
	confidence: float | None = Field(default=None, ge=0, le=100)
	unit: str | None = None
