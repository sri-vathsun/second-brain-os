from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
import httpx
import models
from dependencies import get_current_user
from config import settings

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

    try:
        async with httpx.AsyncClient(timeout=60.0) as client:
            response = await client.post(
                f"{settings.ai_service_url}/summarize",
                json={"text": request.text},
            )
            response.raise_for_status()
            return response.json()
    except httpx.RequestError:
        # AI service is down — return a graceful stub
        words = request.text.split()
        short = " ".join(words[:40]) + ("..." if len(words) > 40 else "")
        return {"summary": short}
    except Exception:
        raise HTTPException(status_code=503, detail="Summarization service unavailable")
