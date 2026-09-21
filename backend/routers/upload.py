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
            from io import BytesIO
            from pypdf import PdfReader

            reader = PdfReader(BytesIO(file_bytes))
            text = "\n\n".join(page.extract_text() or "" for page in reader.pages).strip()
        except Exception as exc:
            raise HTTPException(status_code=400, detail=f"Could not read PDF: {exc}") from exc

        if not text:
            raise HTTPException(
                status_code=422,
                detail="No selectable text found in this PDF. Scanned PDFs need OCR before upload.",
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
