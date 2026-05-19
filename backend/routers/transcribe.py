from fastapi import APIRouter, UploadFile, File, Depends, HTTPException
from sqlalchemy.orm import Session
import httpx
import crud
from dependencies import get_db, get_current_user
from schemas import NoteCreate
import models

router = APIRouter()


@router.post("/transcribe")
async def transcribe_and_create_note(
    file: UploadFile = File(...),
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    async with httpx.AsyncClient() as client:
        files = {"audio_file": (file.filename, await file.read(), file.content_type)}
        try:
            response = await client.post(
                "http://localhost:8001/transcribe", files=files, timeout=300.0
            )
            response.raise_for_status()
            transcribed_text = response.json().get("transcription", "")
        except httpx.RequestError as exc:
            raise HTTPException(
                status_code=503, detail=f"AI service unavailable: {exc}"
            )
        except Exception as e:
            raise HTTPException(status_code=500, detail=str(e))

    if not transcribed_text:
        raise HTTPException(status_code=500, detail="Transcription returned empty text")

    note = NoteCreate(title="Voice Note", content=transcribed_text)
    created_note = crud.create_note(db=db, note=note, user_id=current_user.id)

    # Best-effort embedding (don't fail if AI service is down)
    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            await client.post(
                "http://localhost:8001/add",
                json={"note_id": str(created_note.id), "text": created_note.content},
            )
    except Exception:
        pass

    return created_note
