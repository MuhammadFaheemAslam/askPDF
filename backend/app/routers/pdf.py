import os
import uuid
from typing import List

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile, status
from sqlalchemy.orm import Session

from ..auth import get_current_user
from ..config import PDF_DIR
from ..database import get_db
from ..models import PDF, User
from ..schemas import PDFResponse

router = APIRouter(prefix="/pdf", tags=["pdf"])

ALLOWED_EXTENSIONS = {".pdf"}
MAX_FILE_SIZE = 10 * 1024 * 1024  # 10MB


def validate_pdf(file: UploadFile) -> None:
    # Check file extension
    ext = os.path.splitext(file.filename)[1].lower()
    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Only PDF files are allowed",
        )


@router.post("/upload", response_model=PDFResponse, status_code=status.HTTP_201_CREATED)
async def upload_pdf(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    validate_pdf(file)

    # Generate unique filename
    unique_filename = f"{uuid.uuid4()}_{file.filename}"
    filepath = os.path.join(PDF_DIR, unique_filename)

    # Save file
    content = await file.read()
    if len(content) > MAX_FILE_SIZE:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="File size exceeds 10MB limit",
        )

    with open(filepath, "wb") as f:
        f.write(content)

    # Save to database
    db_pdf = PDF(
        filename=file.filename,
        filepath=filepath,
        owner_id=current_user.id,
    )
    db.add(db_pdf)
    db.commit()
    db.refresh(db_pdf)

    return db_pdf


@router.get("/list", response_model=List[PDFResponse])
def list_pdfs(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    pdfs = db.query(PDF).filter(PDF.owner_id == current_user.id).all()
    return pdfs


@router.delete("/{pdf_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_pdf(
    pdf_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    pdf = db.query(PDF).filter(PDF.id == pdf_id, PDF.owner_id == current_user.id).first()
    if not pdf:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="PDF not found",
        )

    # Delete file from disk
    if os.path.exists(pdf.filepath):
        os.remove(pdf.filepath)

    # Delete from database
    db.delete(pdf)
    db.commit()
