import resend

from app.config import settings

if settings.resend_api_key:
    resend.api_key = settings.resend_api_key


def send_invoice_email(to_email: str, subject: str, html: str, pdf_path: str) -> None:
    with open(pdf_path, "rb") as file_obj:
        resend.Emails.send(
            {
                "from": settings.from_email,
                "to": [to_email],
                "subject": subject,
                "html": html,
                "attachments": [{"filename": "invoice.pdf", "content": file_obj.read()}],
            }
        )
