from sqlalchemy import Numeric, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import TimestampUUIDMixin


class User(TimestampUUIDMixin):
    __tablename__ = "users"

    email: Mapped[str] = mapped_column(String(255), unique=True, index=True)
    password_hash: Mapped[str] = mapped_column(String(255))
    full_name: Mapped[str] = mapped_column(String(255))
    business_name: Mapped[str] = mapped_column(String(255))
    business_address: Mapped[str | None] = mapped_column(Text, nullable=True)
    phone: Mapped[str | None] = mapped_column(String(50), nullable=True)
    logo_url: Mapped[str | None] = mapped_column(String(500), nullable=True)
    currency: Mapped[str] = mapped_column(String(10), default="XAF")
    default_tax_rate: Mapped[float] = mapped_column(Numeric(5, 2), default=0.00)
    invoice_prefix: Mapped[str] = mapped_column(String(20), default="INV-")
    default_due_days: Mapped[int] = mapped_column(default=14)
    default_notes: Mapped[str | None] = mapped_column(Text, nullable=True)

    clients = relationship("Client", back_populates="user", cascade="all, delete-orphan")
    invoices = relationship("Invoice", back_populates="user", cascade="all, delete-orphan")
    payment_methods = relationship("PaymentMethod", back_populates="user", cascade="all, delete-orphan")
