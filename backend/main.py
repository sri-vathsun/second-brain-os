import os
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import auth, notes, upload, search, summarize, knowledge_graph, daily_briefing, transcribe
from database import engine
import models


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Auto-create all tables on startup — wrapped in try/except
    # so a DB hiccup doesn't crash the entire serverless function
    try:
        models.Base.metadata.create_all(bind=engine)
    except Exception as e:
        print(f"Warning: Could not create tables on startup: {e}")
    yield


app = FastAPI(
    title="Second Brain OS API",
    description="AI-Powered Digital Memory Layer — store, organise and retrieve your knowledge.",
    version="1.0.0",
    lifespan=lifespan,
)

# Determine allowed origins from environment or use defaults
_extra_origins = os.getenv("CORS_ORIGINS", "").split(",")
_origins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "https://second-brain-os.vercel.app",
    "https://second-brain-os-ecru.vercel.app",
] + [o.strip() for o in _extra_origins if o.strip()]

app.add_middleware(
    CORSMiddleware,
    allow_origins=_origins,
    allow_origin_regex=r"https://second-brain-os.*\.vercel\.app",  # Vercel previews
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/auth", tags=["auth"])
app.include_router(notes.router, prefix="/notes", tags=["notes"])
app.include_router(upload.router, prefix="/upload", tags=["upload"])
app.include_router(search.router, prefix="/search", tags=["search"])
app.include_router(summarize.router, prefix="/summarize", tags=["summarize"])
app.include_router(knowledge_graph.router, prefix="/api", tags=["knowledge_graph"])
app.include_router(daily_briefing.router, prefix="/api", tags=["daily_briefing"])
app.include_router(transcribe.router, prefix="/api", tags=["transcribe"])


@app.get("/")
def read_root():
    return {"message": "Second Brain OS API v1.0.0", "docs": "/docs"}
