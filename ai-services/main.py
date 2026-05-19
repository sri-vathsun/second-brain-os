from fastapi import FastAPI, UploadFile, File
from pydantic import BaseModel
from pipeline import ai_pipeline

app = FastAPI()

# ... existing request models ...
class AddRequest(BaseModel):
    note_id: str
    text: str

class SearchRequest(BaseModel):
    query: str
    n_results: int = 5

class SummarizeRequest(BaseModel):
    text: str

@app.post("/add")
# ... existing add_embedding endpoint ...
def add_embedding(request: AddRequest):
    ai_pipeline.add_embedding(note_id=request.note_id, text=request.text)
    return {"message": "Embedding added successfully"}

@app.post("/search")
# ... existing search endpoint ...
def search(request: SearchRequest):
    results = ai_pipeline.search(query=request.query, n_results=request.n_results)
    return results

@app.post("/summarize")
# ... existing summarize endpoint ...
def summarize(request: SummarizeRequest):
    summary = ai_pipeline.summarize(text=request.text)
    return {"summary": summary}

@app.post("/transcribe")
async def transcribe_audio(audio_file: UploadFile = File(...)):
    audio_data = await audio_file.read()
    transcribed_text = ai_pipeline.transcribe_audio(audio_data)
    return {"transcription": transcribed_text}

@app.get("/")
# ... existing read_root endpoint ...
def read_root():
    return {"message": "AI Services are running"}
