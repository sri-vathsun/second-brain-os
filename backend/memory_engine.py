from datetime import datetime, timedelta
from sqlalchemy.orm import Session
import models
from ai_engine import find_similar_notes_by_text

# This is a simplified implementation of a forgetting curve model.
# In a real-world scenario, this would be a more sophisticated algorithm.
def calculate_memory_strength(note: models.Note) -> float:
    """
    Calculates a memory strength score between 0.0 and 1.0.
    A higher score means the memory is stronger.
    """
    if not note.last_reviewed_at:
        return 0.1  # New, unreviewed notes have low strength

    time_since_review = datetime.utcnow() - note.last_reviewed_at
    days_since_review = time_since_review.days

    # Simple exponential decay model
    # The half-life is influenced by the number of reviews
    half_life = 2 ** (note.review_count)  # Doubles with each review
    strength = 0.5 ** (days_since_review / half_life)
    
    return strength

def get_notes_for_review(db: Session, user_id: int, strength_threshold: float = 0.5):
    """
    Get a list of notes that have fallen below a certain memory strength.
    """
    user_notes = db.query(models.Note).filter(models.Note.user_id == user_id).all()
    notes_to_review = []
    for note in user_notes:
        strength = calculate_memory_strength(note)
        if strength < strength_threshold:
            notes_to_review.append(note)
    return notes_to_review

def get_smart_suggestions(db: Session, note: models.Note, user_id: int):
    """
    Find related notes using keyword-based similarity (no external AI service needed).
    """
    try:
        all_notes = (
            db.query(models.Note)
            .filter(models.Note.user_id == user_id, models.Note.id != note.id)
            .all()
        )
        return find_similar_notes_by_text(all_notes, note.title, n_results=3)
    except Exception:
        return []
