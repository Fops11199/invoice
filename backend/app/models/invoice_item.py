from sqlalchemy import ForeignKey, Numeric, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import TimestampUUIDMixin


class InvoiceItem(TimestampUUIDMixin):
    __tablename__ = "invoice_items"

    invoice_id: Mapped[str] = mapped_column(UUID(as_uuid=True), ForeignKey("invoices.id", ondelete="CASCADE"))
    description: Mapped[str] = mapped_column(Text)
    quantity: Mapped[float] = mapped_column(Numeric(10, 2))
    unit_price: Mapped[float] = mapped_column(Numeric(12, 2))
    amount: Mapped[float] = mapped_column(Numeric(12, 2))

    invoice = relationship("Invoice", back_populates="items")
