from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.invoice import Invoice


async def next_invoice_number(db: AsyncSession, user_id: str, prefix: str) -> str:
    query = select(func.count(Invoice.id)).where(Invoice.user_id == user_id)
    count = (await db.execute(query)).scalar_one()
    return f"{prefix}{count + 1:03d}"
