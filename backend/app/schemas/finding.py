"""Pydantic schema for analysis findings."""

from pydantic import BaseModel


class FindingItem(BaseModel):
	title: str
	description: str
	source: str
