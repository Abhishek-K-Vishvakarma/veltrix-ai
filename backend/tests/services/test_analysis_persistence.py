import pytest
from fastapi import HTTPException
from sqlalchemy import create_engine, select
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from app.db.base import Base
from app.llm.gemini_client import AnalysisOutput, CalcItem, EvidenceItem, FindingItem, Usage
from app.models import Analysis, AnalysisMetric, EvidenceFile, User
from app.services import analysis_service


@pytest.fixture
def analysis_db(monkeypatch):
    engine = create_engine(
        "sqlite://",
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )
    Base.metadata.create_all(engine)
    factory = sessionmaker(bind=engine, autoflush=False, autocommit=False)
    monkeypatch.setattr(analysis_service, "SessionLocal", factory)
    with factory() as session:
        yield session
    Base.metadata.drop_all(engine)
    engine.dispose()


def test_pipeline_persists_partial_structured_output_and_checks_owner(analysis_db, monkeypatch):
    owner = User(email="owner@example.test", hashed_password="unused")
    other_user = User(email="other@example.test", hashed_password="unused")
    analysis_db.add_all([owner, other_user])
    analysis_db.commit()

    analysis = Analysis(
        user_id=owner.id,
        title="Receipt review",
        category="Other",
        input_type="document",
        status="processing",
        result_json={"problem": "Check amount"},
    )
    analysis_db.add(analysis)
    analysis_db.flush()
    analysis_db.add(EvidenceFile(
        analysis_id=analysis.id,
        filename="receipt.txt",
        content_type="text/plain",
        size_bytes=20,
        storage_path="unused",
    ))
    analysis_db.commit()
    analysis_id = analysis.id

    output = AnalysisOutput(
        title="Receipt total",
        category="Financial",
        analysis_type="Expense check",
        summary="The listed amounts total 20.",
        answer="The listed amounts total 20.",
        reasoning_summary="The two source amounts were added deterministically.",
        confidence=36,
        needs_more_evidence=False,
        evidence=[EvidenceItem(
            label="Amount",
            value="15",
            source="receipt.txt",
            extraction_method="document text",
            confidence=90,
            unit="USD",
        )],
        calculations=[CalcItem(
            label="Total",
            expression="15 + 5",
            inputs=["15", "5"],
            unit="USD",
        )],
        findings=[FindingItem(
            title="Amounts total 20",
            description="The displayed line items add up to 20.",
            source="receipt.txt",
        )],
        actions=["Check the source receipt"],
        uncertainties=["One line item is user supplied."],
        follow_up_questions=["Is the tax included?"],
    )
    monkeypatch.setattr(analysis_service, "get_active_model", lambda: "gemini-test")
    monkeypatch.setattr(analysis_service, "read_bytes", lambda path: b"receipt contents")
    monkeypatch.setattr(
        analysis_service,
        "analyze",
        lambda problem, files, model: (
            output,
            Usage(provider_status="fallback", error_message="Gemini denied access."),
        ),
    )

    analysis_service.run_pipeline(analysis_id)
    analysis_db.expire_all()
    persisted = analysis_db.get(Analysis, analysis_id)
    detail = analysis_service.analysis_detail(persisted)
    metric = analysis_db.scalar(select(AnalysisMetric).where(AnalysisMetric.analysis_id == analysis_id))

    assert persisted.status == "partial"
    assert persisted.result_json["analysis_type"] == "Expense check"
    assert persisted.result_json["provider_status"] == "fallback"
    assert detail["answer"] == "The listed amounts total 20."
    assert detail["evidence"][0]["source"] == "receipt.txt"
    assert detail["calculations"][0]["result"] == 20
    assert detail["uncertainties"] == ["One line item is user supplied."]
    assert metric.success is False
    assert metric.error_message == "Gemini denied access."
    with pytest.raises(HTTPException) as error:
        analysis_service.get_owned(analysis_db, other_user, analysis_id)
    assert error.value.status_code == 404