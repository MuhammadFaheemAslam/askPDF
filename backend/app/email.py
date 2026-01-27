import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

from .config import SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASSWORD, EMAIL_FROM, FRONTEND_URL


def send_password_reset_email(to_email: str, reset_token: str) -> bool:
    reset_link = f"{FRONTEND_URL}/reset-password?token={reset_token}"

    subject = "Reset Your Password - askPDF"
    html_body = f"""
    <html>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
            <h2 style="color: #667eea;">Reset Your Password</h2>
            <p>You requested to reset your password for your askPDF account.</p>
            <p>Click the button below to reset your password:</p>
            <a href="{reset_link}"
               style="display: inline-block; padding: 12px 24px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; text-decoration: none; border-radius: 25px; margin: 20px 0;">
                Reset Password
            </a>
            <p>Or copy and paste this link into your browser:</p>
            <p style="word-break: break-all; color: #667eea;">{reset_link}</p>
            <p style="color: #666; font-size: 14px;">This link will expire in 15 minutes.</p>
            <p style="color: #666; font-size: 14px;">If you didn't request this, please ignore this email.</p>
            <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
            <p style="color: #999; font-size: 12px;">askPDF - Your PDF Assistant</p>
        </div>
    </body>
    </html>
    """

    text_body = f"""
    Reset Your Password - askPDF

    You requested to reset your password for your askPDF account.

    Click the link below to reset your password:
    {reset_link}

    This link will expire in 15 minutes.

    If you didn't request this, please ignore this email.
    """

    if not SMTP_USER or not SMTP_PASSWORD:
        print(f"[DEV MODE] Password reset link for {to_email}: {reset_link}")
        return True

    try:
        msg = MIMEMultipart("alternative")
        msg["Subject"] = subject
        msg["From"] = EMAIL_FROM
        msg["To"] = to_email

        msg.attach(MIMEText(text_body, "plain"))
        msg.attach(MIMEText(html_body, "html"))

        with smtplib.SMTP(SMTP_HOST, SMTP_PORT) as server:
            server.starttls()
            server.login(SMTP_USER, SMTP_PASSWORD)
            server.sendmail(EMAIL_FROM, to_email, msg.as_string())

        return True
    except Exception as e:
        print(f"Failed to send email: {e}")
        return False
