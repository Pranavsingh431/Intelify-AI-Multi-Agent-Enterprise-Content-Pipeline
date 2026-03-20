from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from agents.orchestrator import run_pipeline
from services.compliance import ComplianceServiceError
from services.llm import LLMServiceError

router = APIRouter()


class ProcessRequest(BaseModel):
    text: str


@router.post("/process")
def process_text(payload: ProcessRequest) -> dict:
    try:
        pipeline_result = run_pipeline(payload.text)
    except (LLMServiceError, ComplianceServiceError) as exc:
        raise HTTPException(status_code=502, detail=str(exc)) from exc

    return {
        "status": "success",
        "data": pipeline_result,
    }
