from datetime import date

from pydantic import BaseModel

from app.models.invoice import InvoiceStatus


class InvoiceItemIn(BaseModel):
    description: str
    quantity: float
    unit_price: float


class InvoiceItemOut(InvoiceItemIn):
    id: str
    amount: float

    model_config = {"from_attributes": True}


class InvoiceCreate(BaseModel):
    client_id: str
    invoice_number: str | None = None
    issue_date: date
    due_date: date
    payment_method: str | None = None
    notes: str | None = None
    tax_rate: float = 0.0
    items: list[InvoiceItemIn]


class InvoiceUpdate(InvoiceCreate):
    pass


class InvoiceStatusUpdate(BaseModel):
    status: InvoiceStatus


class InvoiceOut(BaseModel):
    id: str
    invoice_number: str
    status: InvoiceStatus
    issue_date: date
    due_date: date
    subtotal: float
    tax_rate: float
    tax_amount: float
    total: float
    payment_method: str | None = None
    notes: str | None = None
    pdf_url: str | None = None
    client_id: str
    items: list[InvoiceItemOut]

    model_config = {"from_attributes": True}
