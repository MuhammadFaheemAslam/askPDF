from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from .database import Base, engine
from .routers import auth, pdf
from .config import MEDIA_DIR

# Create database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="askPDF API",
    description="API for askPDF - Upload and interact with PDF documents",
    version="1.0.0",
)

# CORS middleware for frontend communication
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount static files for media
app.mount("/media", StaticFiles(directory=MEDIA_DIR), name="media")

# Include routers
app.include_router(auth.router)
app.include_router(pdf.router)


@app.get("/")
def root():
    return {"message": "Welcome to askPDF API", "docs": "/docs"}


@app.get("/health")
def health_check():
    return {"status": "healthy"}
