import os
from datetime import timedelta

SECRET_KEY = os.getenv("SECRET_KEY", "your-secret-key-change-in-production")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

MEDIA_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "media")
PDF_DIR = os.path.join(MEDIA_DIR, "pdfs")

os.makedirs(PDF_DIR, exist_ok=True)
