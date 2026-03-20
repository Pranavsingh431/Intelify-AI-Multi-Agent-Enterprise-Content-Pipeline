from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from services.compliance import ComplianceServiceError, run_compliance_check
from services.llm import LLMServiceError, generate_content

router = APIRouter()


class ProcessRequest(BaseModel):
    text: str


@router.post("/process")
def process_text(payload: ProcessRequest) -> dict:
    try:
        generated_content = generate_content(payload.text)
        compliance = run_compliance_check(generated_content)
    except (LLMServiceError, ComplianceServiceError) as exc:
        raise HTTPException(status_code=502, detail=str(exc)) from exc

    return {
        "status": "success",
        "generated_content": generated_content,
        "compliance": compliance,
    }
