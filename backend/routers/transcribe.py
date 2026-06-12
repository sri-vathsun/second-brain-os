from fastapi import APIRouter, UploadFile, File, Depends, HTTPException
from sqlalchemy.orm import Session
import crud
from dependencies import get_db, get_current_user
from schemas import NoteCreate
from ai_engine import transcribe_audio
import models

router = APIRouter()


@router.post("/transcribe")
async def transcribe_and_create_note(
    file: UploadFile = File(...),
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    audio_bytes = await file.read()
    transcribed_text = await transcribe_audio(audio_bytes)

    if not transcribed_text:
        raise HTTPException(
            status_code=503,
            detail="Transcription service unavailable. Please try again later.",
        )

    note = NoteCreate(title="Voice Note", content=transcribed_text)
    created_note = crud.create_note(db=db, note=note, user_id=current_user.id)
    return created_note
