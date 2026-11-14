from fastapi import APIRouter, UploadFile, File, Depends, HTTPException
from fastapi.responses import Response
from sqlalchemy.orm import Session
from urllib.parse import quote
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

    text = None
    extraction_error = None
    if "pdf" in content_type or (file.filename or "").lower().endswith(".pdf"):
        try:
            from io import BytesIO
            from pypdf import PdfReader

            reader = PdfReader(BytesIO(file_bytes))
            text = "\n\n".join(page.extract_text() or "" for page in reader.pages).strip()
        except Exception as exc:
            extraction_error = str(exc)
    elif content_type.startswith("text/"):
        text = file_bytes.decode("utf-8", errors="replace")

    db_note = models.Note(
        title=file.filename or "Uploaded document",
        content=text,
        document_data=file_bytes,
        document_filename=file.filename or "uploaded-document",
        document_content_type=content_type or "application/octet-stream",
        user_id=current_user.id,
    )
    db.add(db_note)
    db.commit()
    db.refresh(db_note)

    return {
        "filename": db_note.document_filename,
        "note_id": db_note.id,
        "content_type": db_note.document_content_type,
        "characters": len(text or ""),
        "text_extraction_error": extraction_error,
    }


@router.get("/documents/{note_id}")
def download_document(
    note_id: int,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    note = crud.get_note(db, note_id)
    if not note or note.user_id != current_user.id or note.document_data is None:
        raise HTTPException(status_code=404, detail="Document not found")

    return Response(
        content=note.document_data,
        media_type=note.document_content_type or "application/octet-stream",
        headers={
            "Content-Disposition": (
                "attachment; filename*=UTF-8''"
                f"{quote(note.document_filename or 'document')}"
            )
        },
    )
