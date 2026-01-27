import os
import uuid
from typing import List

from fastapi import APIRouter, Depends, File, HTTPException, Query, UploadFile, status
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session

from typing import Optional

from jose import JWTError, jwt

from ..auth import get_current_user, get_user_by_username
from ..config import SECRET_KEY, ALGORITHM
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


@router.get("/{pdf_id}", response_model=PDFResponse)
def get_pdf(
    pdf_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get single PDF metadata"""
    pdf = db.query(PDF).filter(PDF.id == pdf_id, PDF.owner_id == current_user.id).first()
    if not pdf:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="PDF not found",
        )
    return pdf


@router.get("/{pdf_id}/view")
def view_pdf(
    pdf_id: int,
    token: Optional[str] = Query(None),
    db: Session = Depends(get_db),
):
    """Stream PDF file with authentication via query parameter"""
    # Verify token
    if not token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication required",
        )

    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token",
            )
    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token",
        )

    # Get user
    user = get_user_by_username(db, username)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found",
        )

    # Get PDF with ownership check
    pdf = db.query(PDF).filter(PDF.id == pdf_id, PDF.owner_id == user.id).first()
    if not pdf:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="PDF not found",
        )

    if not os.path.exists(pdf.filepath):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="PDF file not found on disk",
        )

    return FileResponse(
        pdf.filepath,
        media_type="application/pdf",
        filename=pdf.filename,
        headers={
            "Content-Disposition": f"inline; filename=\"{pdf.filename}\"",
            "Cache-Control": "private, max-age=3600",
        }
    )
