from pydantic import BaseModel, EmailStr
from typing import List, Optional
import datetime


# ─── Auth ────────────────────────────────────────────────────────────────────

class UserCreate(BaseModel):
    username: str
    email: str
    password: str


class UserLogin(BaseModel):
    email: str
    password: str


class UserOut(BaseModel):
    id: int
    username: str
    email: str

    class Config:
        from_attributes = True


class Token(BaseModel):
    access_token: str
    token_type: str
    user: UserOut


# ─── Notes ───────────────────────────────────────────────────────────────────

class NoteBase(BaseModel):
    title: str
    content: Optional[str] = None


class NoteCreate(NoteBase):
    pass


class NoteUpdate(BaseModel):
    title: Optional[str] = None
    content: Optional[str] = None


class Note(NoteBase):
    id: int
    user_id: int
    tags: List = []
    last_reviewed_at: Optional[datetime.datetime] = None
    review_count: int = 0
    created_at: Optional[datetime.datetime] = None

    class Config:
        from_attributes = True


# ─── Tags ────────────────────────────────────────────────────────────────────

class TagBase(BaseModel):
    name: str


class TagCreate(TagBase):
    pass


class Tag(TagBase):
    id: int

    class Config:
        from_attributes = True


# ─── Search ──────────────────────────────────────────────────────────────────

class SearchRequest(BaseModel):
    query: str
