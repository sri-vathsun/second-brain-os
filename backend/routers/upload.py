from fastapi import APIRouter, UploadFile, File, Depends, HTTPException
from sqlalchemy.orm import Session
import httpx
import crud
import schemas
import models
from dependencies import get_db, get_current_user

router = APIRouter()


@router.post("/upload")
async def upload_file(
    file: UploadFile = File(...),
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    content_type = file.content_type or ""
    file_bytes = await file.read()

    if "pdf" in content_type:
        try:
            import fitz  # PyMuPDF

            doc = fitz.open(stream=file_bytes, filetype="pdf")
            text = "".join(page.get_text() for page in doc)
        except ImportError:
            raise HTTPException(
                status_code=503,
                detail="PDF parsing library not installed. Run: pip install PyMuPDF",
            )

        note = schemas.NoteCreate(title=file.filename or "Uploaded PDF", content=text)
        db_note = crud.create_note(db=db, note=note, user_id=current_user.id)

        # Best-effort AI embedding
        try:
            async with httpx.AsyncClient(timeout=10.0) as client:
                await client.post(
                    "http://localhost:8001/add",
                    json={"note_id": str(db_note.id), "text": text},
                )
        except Exception:
            pass

        return {
            "filename": file.filename,
            "note_id": db_note.id,
            "characters": len(text),
        }

    raise HTTPException(
        status_code=400, detail="Only PDF files are supported at this time"
    )
