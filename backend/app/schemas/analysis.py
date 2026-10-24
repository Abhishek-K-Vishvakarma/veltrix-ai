"""Shared structured analysis output schema."""

from pydantic import BaseModel, Field, model_validator

from app.schemas.evidence import EvidenceItem
from app.schemas.finding import FindingItem


class CalcItem(BaseModel):
	label: str
	expression: str
	inputs: list[str] = Field(default_factory=list)
	unit: str | None = None


class SourceItem(BaseModel):
	filename: str
	page: int | None = None
	reference: str | None = None


class AnalysisOutput(BaseModel):
	title: str
	category: str
	summary: str
	analysis_type: str = ""
	answer: str = ""
	reasoning_summary: str = ""
	confidence: float = Field(ge=0, le=100)
	needs_more_evidence: bool
	missing_evidence_message: str = ""
	evidence: list[EvidenceItem] = Field(default_factory=list)
	calculations: list[CalcItem] = Field(default_factory=list)
	findings: list[FindingItem] = Field(default_factory=list)
	actions: list[str] = Field(default_factory=list)
	uncertainties: list[str] = Field(default_factory=list)
	missing_evidence: list[str] = Field(default_factory=list)
	follow_up_questions: list[str] = Field(default_factory=list)
	sources: list[SourceItem] = Field(default_factory=list)

	@model_validator(mode="after")
	def fill_compatible_fields(self):
		if not self.analysis_type:
			self.analysis_type = self.category
		if not self.answer:
			self.answer = self.summary
		return self
