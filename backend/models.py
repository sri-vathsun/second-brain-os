from sqlalchemy import Column, Integer, String, Text, ForeignKey, Table, DateTime
from sqlalchemy.orm import relationship
from database import Base
import datetime

note_tags = Table(
    "note_tags",
    Base.metadata,
    Column("note_id", Integer, ForeignKey("notes.id", ondelete="CASCADE")),
    Column("tag_id", Integer, ForeignKey("tags.id", ondelete="CASCADE")),
)


class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    email = Column(String, unique=True, index=True)
    password_hash = Column(String)
    notes = relationship("Note", back_populates="owner", cascade="all, delete-orphan")


class Note(Base):
    __tablename__ = "notes"
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, index=True)
    content = Column(Text)
    user_id = Column(Integer, ForeignKey("users.id"))
    owner = relationship("User", back_populates="notes")
    tags = relationship("Tag", secondary=note_tags, back_populates="notes")
    last_reviewed_at = Column(DateTime, nullable=True)
    review_count = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)


class Tag(Base):
    __tablename__ = "tags"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, index=True)
    notes = relationship("Note", secondary=note_tags, back_populates="tags")
