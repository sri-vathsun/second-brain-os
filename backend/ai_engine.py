"""
Lightweight AI engine that uses Hugging Face Inference API.
No heavy local ML models — runs on Render free tier (512 MB RAM).
Falls back gracefully when the HF API is rate-limited or down.
"""

import os
import httpx
from typing import List, Optional
from config import settings

HF_API_TOKEN = settings.hf_api_token
HF_API_URL = "https://router.huggingface.co/hf-inference/models"

# Models used (all free via HF Inference API)
EMBEDDING_MODEL = "sentence-transformers/all-MiniLM-L6-v2"
SUMMARIZATION_MODEL = "facebook/bart-large-cnn"
TRANSCRIPTION_MODEL = "openai/whisper-large-v3-turbo"


def _hf_headers() -> dict:
    headers = {}
    if HF_API_TOKEN:
        headers["Authorization"] = f"Bearer {HF_API_TOKEN}"
    return headers


# ─── Summarization ────────────────────────────────────────────────────────────

async def summarize_text(text: str) -> str:
    """Summarize text using HF Inference API with graceful fallback."""
    if not text or not text.strip():
        return ""

    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.post(
                f"{HF_API_URL}/{SUMMARIZATION_MODEL}",
                headers=_hf_headers(),
                json={
                    "inputs": text[:1024],  # HF has input limits
                    "parameters": {"max_length": 150, "min_length": 30},
                },
            )
            if response.status_code == 200:
                result = response.json()
                if isinstance(result, list) and len(result) > 0:
                    return result[0].get("summary_text", _fallback_summary(text))
            # Model loading (503) or rate limited (429) — fallback
            return _fallback_summary(text)
    except Exception:
        return _fallback_summary(text)


def _fallback_summary(text: str) -> str:
    """Simple extractive fallback: return first ~40 words."""
    words = text.split()
    short = " ".join(words[:40])
    if len(words) > 40:
        short += "..."
    return short


# ─── Transcription ────────────────────────────────────────────────────────────

async def transcribe_audio(audio_bytes: bytes) -> str:
    """Transcribe audio bytes using HF Whisper API."""
    try:
        async with httpx.AsyncClient(timeout=120.0) as client:
            response = await client.post(
                f"{HF_API_URL}/{TRANSCRIPTION_MODEL}",
                headers={**_hf_headers(), "Content-Type": "audio/webm"},
                content=audio_bytes,
            )
            if response.status_code == 200:
                result = response.json()
                return result.get("text", "")
            print(
                f"Hugging Face transcription failed ({response.status_code}): "
                f"{response.text[:500]}"
            )
            return ""
    except Exception as error:
        print(f"Hugging Face transcription request failed: {error}")
        return ""


# ─── Embeddings (simple keyword-based for deployment) ─────────────────────────
# Full vector search would need a vector DB. For the portfolio demo we use
# keyword overlap which works without any external service.

def compute_similarity(text_a: str, text_b: str) -> float:
    """Keyword-based similarity score between two texts (0.0 – 1.0)."""
    words_a = {w.lower() for w in text_a.split() if len(w) > 3}
    words_b = {w.lower() for w in text_b.split() if len(w) > 3}
    if not words_a or not words_b:
        return 0.0
    intersection = words_a & words_b
    union = words_a | words_b
    return len(intersection) / len(union) if union else 0.0


def find_similar_notes_by_text(
    notes: list, query_text: str, n_results: int = 5
) -> list:
    """Find the most similar notes to a query using keyword overlap."""
    scored = []
    for note in notes:
        note_text = f"{note.title} {note.content or ''}"
        score = compute_similarity(note_text, query_text)
        if score > 0:
            scored.append((score, note))
    scored.sort(key=lambda x: x[0], reverse=True)
    return [note for _, note in scored[:n_results]]
