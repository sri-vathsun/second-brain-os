from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
import crud
import schemas
import models
from dependencies import get_db, get_current_user

router = APIRouter()


@router.post("/search", response_model=list[schemas.Note])
def search_notes(
    request: schemas.SearchRequest,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """SQL full-text search across the user's notes (title + content)."""
    if not request.query.strip():
        return crud.get_notes_by_user(db, user_id=current_user.id)
    return crud.search_notes(db, user_id=current_user.id, query=request.query)
