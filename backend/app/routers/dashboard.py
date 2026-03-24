from fastapi import APIRouter, Depends
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.dependencies import get_current_user
from app.models.client import Client
from app.models.invoice import Invoice, InvoiceStatus
from app.models.user import User
from app.schemas.dashboard import DashboardStats

router = APIRouter(prefix="/dashboard", tags=["dashboard"])


@router.get("/stats", response_model=DashboardStats)
async def stats(db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)):
    paid_sum = (
        await db.execute(
            select(func.coalesce(func.sum(Invoice.total), 0)).where(
                Invoice.user_id == current_user.id, Invoice.status == InvoiceStatus.paid
            )
        )
    ).scalar_one()
    outstanding_sum = (
        await db.execute(
            select(func.coalesce(func.sum(Invoice.total), 0)).where(
                Invoice.user_id == current_user.id, Invoice.status == InvoiceStatus.sent
            )
        )
    ).scalar_one()
    overdue_sum = (
        await db.execute(
            select(func.coalesce(func.sum(Invoice.total), 0)).where(
                Invoice.user_id == current_user.id, Invoice.status == InvoiceStatus.overdue
            )
        )
    ).scalar_one()
    client_count = (await db.execute(select(func.count(Client.id)).where(Client.user_id == current_user.id))).scalar_one()
    invoice_count = (await db.execute(select(func.count(Invoice.id)).where(Invoice.user_id == current_user.id))).scalar_one()

    recent = (
        await db.execute(
            select(Invoice).where(Invoice.user_id == current_user.id).order_by(Invoice.created_at.desc()).limit(5)
        )
    ).scalars()
    recent_invoices = [
        {
            "id": str(row.id),
            "invoice_number": row.invoice_number,
            "status": row.status.value,
            "total": float(row.total),
            "issue_date": row.issue_date.isoformat(),
        }
        for row in recent
    ]
    return {
        "total_earned": float(paid_sum),
        "outstanding": float(outstanding_sum),
        "overdue": float(overdue_sum),
        "client_count": client_count,
        "invoice_count": invoice_count,
        "recent_invoices": recent_invoices,
    }
