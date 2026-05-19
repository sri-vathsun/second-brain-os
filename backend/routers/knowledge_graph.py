from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
import models
import crud
from dependencies import get_db, get_current_user

router = APIRouter()


@router.get("/knowledge-graph")
def get_knowledge_graph_data(
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Build a knowledge graph from the user's real notes.
    Nodes = notes. Edges = notes that share words in their titles."""
    user_notes = crud.get_notes_by_user(db, user_id=current_user.id, limit=50)

    if not user_notes:
        return {"nodes": [], "edges": []}

    # Build nodes
    nodes = []
    cols = 4
    for i, note in enumerate(user_notes):
        x = (i % cols) * 220 + 50
        y = (i // cols) * 140 + 50
        nodes.append(
            {
                "id": str(note.id),
                "data": {"label": note.title[:30] + ("…" if len(note.title) > 30 else "")},
                "position": {"x": x, "y": y},
                "type": "default",
            }
        )

    # Build edges: connect notes that share keywords (words > 3 chars in title or content)
    def extract_keywords(note):
        text = f"{note.title} {note.content or ''}"
        return {w.lower() for w in text.split() if len(w) > 3}

    edges = []
    seen = set()
    for i, note_a in enumerate(user_notes):
        words_a = extract_keywords(note_a)
        for j, note_b in enumerate(user_notes):
            if i >= j:
                continue
            words_b = extract_keywords(note_b)
            pair = (str(note_a.id), str(note_b.id))
            if words_a & words_b and pair not in seen:
                seen.add(pair)
                edges.append(
                    {
                        "id": f"e{note_a.id}-{note_b.id}",
                        "source": str(note_a.id),
                        "target": str(note_b.id),
                        "animated": True,
                    }
                )

    return {"nodes": nodes, "edges": edges}
