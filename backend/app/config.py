import os
from datetime import timedelta

SECRET_KEY = os.getenv("SECRET_KEY", "your-secret-key-change-in-production")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30
PASSWORD_RESET_TOKEN_EXPIRE_MINUTES = 15

# Email configuration
SMTP_HOST = os.getenv("SMTP_HOST", "smtp.gmail.com")
SMTP_PORT = int(os.getenv("SMTP_PORT", "587"))
SMTP_USER = os.getenv("SMTP_USER", "")
SMTP_PASSWORD = os.getenv("SMTP_PASSWORD", "")
EMAIL_FROM = os.getenv("EMAIL_FROM", "noreply@askpdf.com")

# Frontend URL for password reset link
FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:5173")

MEDIA_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "media")
PDF_DIR = os.path.join(MEDIA_DIR, "pdfs")

os.makedirs(PDF_DIR, exist_ok=True)
