from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
import schemas
import models
import memory_engine
from database import SessionLocal
from dependencies import get_db, get_current_user

router = APIRouter()


@router.get("/daily-briefing", response_model=dict)
def get_daily_briefing(
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    notes_to_review = memory_engine.get_notes_for_review(db, user_id=current_user.id)
    total_notes = (
        db.query(models.Note)
        .filter(models.Note.user_id == current_user.id)
        .count()
    )
    last_note = (
        db.query(models.Note)
        .filter(models.Note.user_id == current_user.id)
        .order_by(models.Note.last_reviewed_at.desc())
        .first()
    )
    suggestions = []
    if last_note:
        suggestions = memory_engine.get_smart_suggestions(
            db, note=last_note, user_id=current_user.id
        )

    return {
        "notes_for_review": [schemas.Note.model_validate(n) for n in notes_to_review],
        "productivity_insights": {
            "total_notes": total_notes,
            "notes_to_review_count": len(notes_to_review),
        },
        "smart_suggestions": [schemas.Note.model_validate(s) for s in suggestions],
    }
