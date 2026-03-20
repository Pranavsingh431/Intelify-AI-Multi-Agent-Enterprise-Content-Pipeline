from fastapi import APIRouter
from pydantic import BaseModel

router = APIRouter()


class ProcessRequest(BaseModel):
    text: str


@router.post("/process")
def process_text(payload: ProcessRequest) -> dict[str, str]:
    return {
        "status": "success",
        "input": payload.text,
        "output": "This is a dummy response",
    }
