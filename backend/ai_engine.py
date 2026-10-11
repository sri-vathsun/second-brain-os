"""AI helpers for summarization, transcription, and note similarity."""

import asyncio
import httpx
import logging
import tempfile
from pathlib import Path
from threading import Lock

from config import settings

logger = logging.getLogger(__name__)

HF_API_TOKEN = settings.hf_api_token
HF_API_URL = "https://router.huggingface.co/hf-inference/models"

# Models used (all free via HF Inference API)
EMBEDDING_MODEL = "sentence-transformers/all-MiniLM-L6-v2"
SUMMARIZATION_MODEL = "facebook/bart-large-cnn"
LOCAL_TRANSCRIPTION_MODEL = "tiny.en"

_transcriber = None
_transcriber_lock = Lock()


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

def _get_local_transcriber():
    """Load the local Whisper model once, on the first transcription request."""
    global _transcriber
    if _transcriber is None:
        with _transcriber_lock:
            if _transcriber is None:
                try:
                    from faster_whisper import WhisperModel

                    _transcriber = WhisperModel(
                        LOCAL_TRANSCRIPTION_MODEL,
                        device="cpu",
                        compute_type="int8",
                    )
                except Exception as error:
                    raise RuntimeError(
                        "Local transcription is unavailable. "
                        "Install backend requirements and retry."
                    ) from error
    return _transcriber


def _transcribe_local(audio_bytes: bytes) -> str:
    if not audio_bytes:
        raise RuntimeError("The recording was empty. Please record again.")

    temporary_path = None
    try:
        with tempfile.NamedTemporaryFile(suffix=".wav", delete=False) as audio_file:
            audio_file.write(audio_bytes)
            temporary_path = Path(audio_file.name)

        model = _get_local_transcriber()
        segments, _ = model.transcribe(str(temporary_path), beam_size=5)
        return " ".join(segment.text.strip() for segment in segments).strip()
    except RuntimeError:
        raise
    except Exception as error:
        logger.exception("Local Whisper transcription failed")
        raise RuntimeError("Local transcription failed. Please try recording again.") from error
    finally:
        if temporary_path is not None:
            temporary_path.unlink(missing_ok=True)


async def transcribe_audio(audio_bytes: bytes) -> str:
    """Transcribe audio locally without Hugging Face hosted inference credits."""
    return await asyncio.to_thread(_transcribe_local, audio_bytes)


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
