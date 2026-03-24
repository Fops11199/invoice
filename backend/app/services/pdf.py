from pathlib import Path

from jinja2 import Environment, FileSystemLoader
from weasyprint import HTML

from app.config import settings
from app.models.invoice import Invoice
from app.models.user import User


def generate_invoice_pdf(invoice: Invoice, user: User, client_name: str) -> tuple[bytes, str]:
    templates_dir = Path(__file__).resolve().parent.parent / "templates"
    env = Environment(loader=FileSystemLoader(str(templates_dir)))
    template = env.get_template("invoice.html")
    html = template.render(invoice=invoice, user=user, client_name=client_name)
    pdf_bytes = HTML(string=html).write_pdf()

    storage_dir = Path(settings.storage_path) / "pdfs" / str(user.id)
    storage_dir.mkdir(parents=True, exist_ok=True)
    pdf_path = storage_dir / f"{invoice.invoice_number}.pdf"
    pdf_path.write_bytes(pdf_bytes)
    return pdf_bytes, str(pdf_path)
