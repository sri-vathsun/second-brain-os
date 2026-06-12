from fastapi import APIRouter, UploadFile, File, Depends, HTTPException
from sqlalchemy.orm import Session
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
            # Fallback: try to extract raw text from PDF bytes
            text = file_bytes.decode("utf-8", errors="ignore")
            if len(text.strip()) < 20:
                raise HTTPException(
                    status_code=503,
                    detail="PDF parsing library not available on this server.",
                )

        note = schemas.NoteCreate(title=file.filename or "Uploaded PDF", content=text)
        db_note = crud.create_note(db=db, note=note, user_id=current_user.id)

        return {
            "filename": file.filename,
            "note_id": db_note.id,
            "characters": len(text),
        }

    raise HTTPException(
        status_code=400, detail="Only PDF files are supported at this time"
    )
