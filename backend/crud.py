from sqlalchemy.orm import Session
from sqlalchemy import or_
import models
import schemas
from security import hash_password


# ─── Users ───────────────────────────────────────────────────────────────────

def get_user_by_email(db: Session, email: str):
    return db.query(models.User).filter(models.User.email == email).first()


def get_user_by_username(db: Session, username: str):
    return db.query(models.User).filter(models.User.username == username).first()


def create_user(db: Session, user: schemas.UserCreate):
    db_user = models.User(
        username=user.username,
        email=user.email,
        password_hash=hash_password(user.password),
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user


# ─── Notes ───────────────────────────────────────────────────────────────────

def get_note(db: Session, note_id: int):
    return db.query(models.Note).filter(models.Note.id == note_id).first()


def get_notes_by_user(db: Session, user_id: int, skip: int = 0, limit: int = 200):
    return (
        db.query(models.Note)
        .filter(models.Note.user_id == user_id)
        .order_by(models.Note.created_at.desc())
        .offset(skip)
        .limit(limit)
        .all()
    )


def get_notes(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.Note).offset(skip).limit(limit).all()


def create_note(db: Session, note: schemas.NoteCreate, user_id: int):
    db_note = models.Note(**note.model_dump(), user_id=user_id)
    db.add(db_note)
    db.commit()
    db.refresh(db_note)
    return db_note


def update_note(db: Session, note_id: int, note_update: schemas.NoteUpdate):
    db_note = get_note(db, note_id)
    if not db_note:
        return None
    update_data = note_update.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_note, key, value)
    db.commit()
    db.refresh(db_note)
    return db_note


def delete_note(db: Session, note_id: int):
    db_note = get_note(db, note_id)
    if db_note:
        db.delete(db_note)
        db.commit()
    return db_note


def search_notes(db: Session, user_id: int, query: str):
    return (
        db.query(models.Note)
        .filter(
            models.Note.user_id == user_id,
            or_(
                models.Note.title.ilike(f"%{query}%"),
                models.Note.content.ilike(f"%{query}%"),
            ),
        )
        .order_by(models.Note.created_at.desc())
        .all()
    )
