from datetime import datetime, timezone
import csv
import io

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import FileResponse, StreamingResponse
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.database import get_db
from app.dependencies import get_current_user
from app.models.client import Client
from app.models.invoice import Invoice, InvoiceStatus
from app.models.invoice_item import InvoiceItem
from app.models.user import User
from app.schemas.invoice import InvoiceCreate, InvoiceOut, InvoiceStatusUpdate, InvoiceUpdate
from app.services.email import send_invoice_email
from app.services.pdf import generate_invoice_pdf
from app.utils.invoice_number import next_invoice_number

router = APIRouter(prefix="/invoices", tags=["invoices"])


def _validate_transition(current: InvoiceStatus, new: InvoiceStatus) -> bool:
    if new == InvoiceStatus.draft:
        return current != InvoiceStatus.paid
    transitions = {
        InvoiceStatus.draft: {InvoiceStatus.sent},
        InvoiceStatus.sent: {InvoiceStatus.paid, InvoiceStatus.overdue},
        InvoiceStatus.overdue: {InvoiceStatus.paid},
        InvoiceStatus.paid: set(),
    }
    return new in transitions[current]


def _calculate_totals(items: list[dict], tax_rate: float) -> tuple[float, float, float, list[dict]]:
    subtotal = 0.0
    normalized_items = []
    for item in items:
        amount = round(float(item["quantity"]) * float(item["unit_price"]), 2)
        subtotal += amount
        normalized_items.append({**item, "amount": amount})
    tax_amount = round(subtotal * (float(tax_rate) / 100), 2)
    total = round(subtotal + tax_amount, 2)
    return round(subtotal, 2), tax_amount, total, normalized_items


@router.get("/", response_model=list[InvoiceOut])
async def list_invoices(db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)):
    query = select(Invoice).options(selectinload(Invoice.items)).where(Invoice.user_id == current_user.id)
    return (await db.execute(query.order_by(Invoice.created_at.desc()))).scalars().all()


@router.post("/", response_model=InvoiceOut, status_code=status.HTTP_201_CREATED)
async def create_invoice(payload: InvoiceCreate, db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)):
    client = (await db.execute(select(Client).where(Client.id == payload.client_id))).scalar_one_or_none()
    if not client:
        raise HTTPException(status_code=404, detail="Client not found")
    if client.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Forbidden")

    invoice_number = payload.invoice_number or await next_invoice_number(db, str(current_user.id), current_user.invoice_prefix)
    subtotal, tax_amount, total, normalized_items = _calculate_totals(
        [item.model_dump() for item in payload.items], payload.tax_rate
    )
    invoice = Invoice(
        user_id=current_user.id,
        client_id=payload.client_id,
        invoice_number=invoice_number,
        issue_date=payload.issue_date,
        due_date=payload.due_date,
        payment_method=payload.payment_method,
        notes=payload.notes,
        tax_rate=payload.tax_rate,
        subtotal=subtotal,
        tax_amount=tax_amount,
        total=total,
    )
    db.add(invoice)
    await db.flush()
    for item in normalized_items:
        db.add(InvoiceItem(invoice_id=invoice.id, **item))
    await db.commit()
    invoice = (
        await db.execute(select(Invoice).options(selectinload(Invoice.items)).where(Invoice.id == invoice.id))
    ).scalar_one()
    return invoice


@router.get("/{invoice_id}", response_model=InvoiceOut)
async def get_invoice(invoice_id: str, db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)):
    invoice = (
        await db.execute(select(Invoice).options(selectinload(Invoice.items)).where(Invoice.id == invoice_id))
    ).scalar_one_or_none()
    if not invoice:
        raise HTTPException(status_code=404, detail="Invoice not found")
    if invoice.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Forbidden")
    return invoice


@router.put("/{invoice_id}", response_model=InvoiceOut)
async def update_invoice(
    invoice_id: str, payload: InvoiceUpdate, db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)
):
    invoice = (
        await db.execute(select(Invoice).options(selectinload(Invoice.items)).where(Invoice.id == invoice_id))
    ).scalar_one_or_none()
    if not invoice:
        raise HTTPException(status_code=404, detail="Invoice not found")
    if invoice.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Forbidden")
    if invoice.status != InvoiceStatus.draft:
        raise HTTPException(status_code=400, detail="Only draft invoices can be updated")

    subtotal, tax_amount, total, normalized_items = _calculate_totals(
        [item.model_dump() for item in payload.items], payload.tax_rate
    )
    invoice.client_id = payload.client_id
    invoice.issue_date = payload.issue_date
    invoice.due_date = payload.due_date
    invoice.payment_method = payload.payment_method
    invoice.notes = payload.notes
    invoice.tax_rate = payload.tax_rate
    invoice.subtotal = subtotal
    invoice.tax_amount = tax_amount
    invoice.total = total
    for existing in invoice.items:
        await db.delete(existing)
    await db.flush()
    for item in normalized_items:
        db.add(InvoiceItem(invoice_id=invoice.id, **item))
    await db.commit()
    return (
        await db.execute(select(Invoice).options(selectinload(Invoice.items)).where(Invoice.id == invoice.id))
    ).scalar_one()


@router.delete("/{invoice_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_invoice(invoice_id: str, db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)):
    invoice = (await db.execute(select(Invoice).where(Invoice.id == invoice_id))).scalar_one_or_none()
    if not invoice:
        raise HTTPException(status_code=404, detail="Invoice not found")
    if invoice.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Forbidden")
    if invoice.status != InvoiceStatus.draft:
        raise HTTPException(status_code=400, detail="Only draft invoices can be deleted")
    await db.delete(invoice)
    await db.commit()


@router.patch("/{invoice_id}/status", response_model=InvoiceOut)
async def update_status(
    invoice_id: str, payload: InvoiceStatusUpdate, db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)
):
    invoice = (
        await db.execute(select(Invoice).options(selectinload(Invoice.items)).where(Invoice.id == invoice_id))
    ).scalar_one_or_none()
    if not invoice:
        raise HTTPException(status_code=404, detail="Invoice not found")
    if invoice.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Forbidden")
    if not _validate_transition(invoice.status, payload.status):
        raise HTTPException(status_code=400, detail="Invalid status transition")
    invoice.status = payload.status
    if payload.status == InvoiceStatus.paid:
        invoice.paid_at = datetime.now(timezone.utc)
    await db.commit()
    await db.refresh(invoice)
    return (
        await db.execute(select(Invoice).options(selectinload(Invoice.items)).where(Invoice.id == invoice.id))
    ).scalar_one()


@router.get("/{invoice_id}/pdf")
async def get_invoice_pdf(invoice_id: str, db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)):
    invoice = (
        await db.execute(select(Invoice).options(selectinload(Invoice.items), selectinload(Invoice.client)).where(Invoice.id == invoice_id))
    ).scalar_one_or_none()
    if not invoice:
        raise HTTPException(status_code=404, detail="Invoice not found")
    if invoice.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Forbidden")
    _, file_path = generate_invoice_pdf(invoice, current_user, invoice.client.name if invoice.client else "Client")
    invoice.pdf_url = file_path
    await db.commit()
    return FileResponse(file_path, media_type="application/pdf", filename=f"{invoice.invoice_number}.pdf")


@router.post("/{invoice_id}/send")
async def send_invoice(invoice_id: str, db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)):
    invoice = (
        await db.execute(select(Invoice).options(selectinload(Invoice.items), selectinload(Invoice.client)).where(Invoice.id == invoice_id))
    ).scalar_one_or_none()
    if not invoice:
        raise HTTPException(status_code=404, detail="Invoice not found")
    if invoice.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Forbidden")
    if not invoice.client or not invoice.client.email:
        raise HTTPException(status_code=400, detail="Client email is required")

    _, file_path = generate_invoice_pdf(invoice, current_user, invoice.client.name)
    try:
        send_invoice_email(
            to_email=invoice.client.email,
            subject=f"Invoice {invoice.invoice_number} from {current_user.business_name}",
            html=f"<p>Please find attached invoice {invoice.invoice_number}.</p>",
            pdf_path=file_path,
        )
    except Exception as exc:
        raise HTTPException(status_code=502, detail=f"Failed to send email: {exc}") from exc

    invoice.status = InvoiceStatus.sent
    invoice.sent_at = datetime.now(timezone.utc)
    invoice.pdf_url = file_path
    await db.commit()
    return {"success": True}


@router.get("/{invoice_id}/csv")
async def get_invoice_csv(invoice_id: str, db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)):
    invoice = (
        await db.execute(select(Invoice).options(selectinload(Invoice.items), selectinload(Invoice.client)).where(Invoice.id == invoice_id))
    ).scalar_one_or_none()
    if not invoice:
        raise HTTPException(status_code=404, detail="Invoice not found")
    if invoice.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Forbidden")

    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow(["Description", "Quantity", "Unit Price", "Amount"])
    for item in invoice.items:
        writer.writerow([item.description, item.quantity, item.unit_price, f"{float(item.quantity) * float(item.unit_price):.2f}"])
    
    writer.writerow([])
    writer.writerow(["", "", "Subtotal", invoice.subtotal])
    writer.writerow(["", "", f"Tax ({invoice.tax_rate}%)", invoice.tax_amount])
    writer.writerow(["", "", "Total", invoice.total])

    output.seek(0)
    return StreamingResponse(
        iter([output.getvalue()]),
        media_type="text/csv",
        headers={"Content-Disposition": f"attachment; filename={invoice.invoice_number}.csv"}
    )
