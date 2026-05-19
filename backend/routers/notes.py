from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
import crud
import schemas
import models
from dependencies import get_db, get_current_user

router = APIRouter()


@router.get("/notes", response_model=list[schemas.Note])
def read_notes(
    skip: int = 0,
    limit: int = 200,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return crud.get_notes_by_user(db, user_id=current_user.id, skip=skip, limit=limit)


@router.post("/notes", response_model=schemas.Note)
def create_note(
    note: schemas.NoteCreate,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return crud.create_note(db=db, note=note, user_id=current_user.id)


@router.patch("/notes/{note_id}", response_model=schemas.Note)
def update_note(
    note_id: int,
    note_update: schemas.NoteUpdate,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    db_note = crud.get_note(db, note_id)
    if not db_note or db_note.user_id != current_user.id:
        raise HTTPException(status_code=404, detail="Note not found")
    return crud.update_note(db, note_id, note_update)


@router.delete("/notes/{note_id}")
def delete_note(
    note_id: int,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    db_note = crud.get_note(db, note_id)
    if not db_note or db_note.user_id != current_user.id:
        raise HTTPException(status_code=404, detail="Note not found")
    crud.delete_note(db, note_id)
    return {"message": "Note deleted"}
