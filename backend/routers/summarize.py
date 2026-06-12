from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
import models
from dependencies import get_current_user
from ai_engine import summarize_text

router = APIRouter()


class SummarizeRequest(BaseModel):
    text: str


@router.post("/summarize")
async def get_summary(
    request: SummarizeRequest,
    current_user: models.User = Depends(get_current_user),
):
    if not request.text.strip():
        raise HTTPException(status_code=400, detail="Text cannot be empty")

    summary = await summarize_text(request.text)
    return {"summary": summary}
