from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import auth, notes, upload, search, summarize, knowledge_graph, daily_briefing, transcribe
from database import engine
import models

# Auto-create all tables on startup
models.Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Second Brain OS API",
    description="AI-Powered Digital Memory Layer — store, organise and retrieve your knowledge.",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origin_regex="https?://(localhost|127\.0\.0\.1|192\.168\.\d+\.\d+):\d+",
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
