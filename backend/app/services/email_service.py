import os
import smtplib
from email.message import EmailMessage

EMAIL_HOST = os.getenv("EMAIL_HOST")
EMAIL_PORT = int(os.getenv("EMAIL_PORT", "587"))
EMAIL_USER = os.getenv("EMAIL_USER")
EMAIL_PASSWORD = os.getenv("EMAIL_PASSWORD")
EMAIL_FROM = os.getenv("EMAIL_FROM", "noreply@expense-tracker.local")
EMAIL_ENABLED = os.getenv("EMAIL_ENABLED", "false").lower() in ("true", "1", "yes")


def send_email(subject: str, body: str, recipient: str) -> bool:
    if not EMAIL_ENABLED or not EMAIL_HOST or not EMAIL_USER or not EMAIL_PASSWORD:
        return False

    message = EmailMessage()
    message["Subject"] = subject
    message["From"] = EMAIL_FROM
    message["To"] = recipient
    message.set_content(body)

    try:
        with smtplib.SMTP(EMAIL_HOST, EMAIL_PORT) as smtp:
            smtp.starttls()
            smtp.login(EMAIL_USER, EMAIL_PASSWORD)
            smtp.send_message(message)
        return True
    except Exception:
        return False
