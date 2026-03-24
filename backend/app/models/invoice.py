import enum
from datetime import date, datetime

from sqlalchemy import Date, DateTime, Enum, ForeignKey, Numeric, String, Text, UniqueConstraint
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import TimestampUUIDMixin


class InvoiceStatus(str, enum.Enum):
    draft = "draft"
    sent = "sent"
    paid = "paid"
    overdue = "overdue"


class Invoice(TimestampUUIDMixin):
    __tablename__ = "invoices"
    __table_args__ = (UniqueConstraint("user_id", "invoice_number", name="uq_user_invoice_number"),)

    user_id: Mapped[str] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id"), index=True)
    client_id: Mapped[str] = mapped_column(UUID(as_uuid=True), ForeignKey("clients.id"), index=True)
    invoice_number: Mapped[str] = mapped_column(String(50))
    status: Mapped[InvoiceStatus] = mapped_column(Enum(InvoiceStatus), default=InvoiceStatus.draft)
    issue_date: Mapped[date] = mapped_column(Date)
    due_date: Mapped[date] = mapped_column(Date)
    payment_method: Mapped[str | None] = mapped_column(String(100), nullable=True)
    subtotal: Mapped[float] = mapped_column(Numeric(12, 2), default=0.00)
    tax_rate: Mapped[float] = mapped_column(Numeric(5, 2), default=0.00)
    tax_amount: Mapped[float] = mapped_column(Numeric(12, 2), default=0.00)
    total: Mapped[float] = mapped_column(Numeric(12, 2), default=0.00)
    sent_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    paid_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    pdf_url: Mapped[str | None] = mapped_column(String(500), nullable=True)
    notes: Mapped[str | None] = mapped_column(Text, nullable=True)

    user = relationship("User", back_populates="invoices")
    client = relationship("Client", back_populates="invoices")
    items = relationship("InvoiceItem", back_populates="invoice", cascade="all, delete-orphan")
