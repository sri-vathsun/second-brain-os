from datetime import datetime, timedelta
from sqlalchemy.orm import Session
import models
import requests

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
    Find related notes using the AI search service.
    """
    try:
        response = requests.post(
            "http://127.0.0.1:8001/search",
            json={"query": note.title, "n_results": 3},
            timeout=2.0
        )
        response.raise_for_status()
        search_results = response.json()
        
        # Extract note IDs from search results
        if search_results and 'ids' in search_results and search_results['ids']:
            suggested_note_ids = [int(id_str) for id_str in search_results['ids'][0] if int(id_str) != note.id]
            
            # Fetch the actual notes from the database
            suggested_notes = db.query(models.Note).filter(
                models.Note.id.in_(suggested_note_ids),
                models.Note.user_id == user_id
            ).all()
            return suggested_notes
    except requests.exceptions.RequestException:
        return [] # Return empty list if AI service fails
    
    return []
