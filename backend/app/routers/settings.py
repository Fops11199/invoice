from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select, update
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.dependencies import get_current_user
from app.models.payment_method import PaymentMethod
from app.models.user import User

router = APIRouter(prefix="/settings", tags=["settings"])


@router.get("/payment-methods")
async def list_payment_methods(db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)):
    rows = (
        await db.execute(select(PaymentMethod).where(PaymentMethod.user_id == current_user.id).order_by(PaymentMethod.created_at.desc()))
    ).scalars()
    return [
        {
            "id": str(pm.id),
            "type": pm.type,
            "label": pm.label,
            "account_name": pm.account_name,
            "account_number": pm.account_number,
            "is_default": pm.is_default,
        }
        for pm in rows
    ]


@router.post("/payment-methods", status_code=status.HTTP_201_CREATED)
async def create_payment_method(payload: dict, db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)):
    pm = PaymentMethod(user_id=current_user.id, **payload)
    db.add(pm)
    await db.commit()
    await db.refresh(pm)
    return {"id": str(pm.id), **payload, "is_default": pm.is_default}


@router.put("/payment-methods/{payment_method_id}")
async def update_payment_method(
    payment_method_id: str, payload: dict, db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)
):
    pm = (await db.execute(select(PaymentMethod).where(PaymentMethod.id == payment_method_id))).scalar_one_or_none()
    if not pm:
        raise HTTPException(status_code=404, detail="Payment method not found")
    if pm.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Forbidden")
    for key, value in payload.items():
        setattr(pm, key, value)
    await db.commit()
    await db.refresh(pm)
    return {"id": str(pm.id), **payload, "is_default": pm.is_default}


@router.delete("/payment-methods/{payment_method_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_payment_method(payment_method_id: str, db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)):
    pm = (await db.execute(select(PaymentMethod).where(PaymentMethod.id == payment_method_id))).scalar_one_or_none()
    if not pm:
        raise HTTPException(status_code=404, detail="Payment method not found")
    if pm.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Forbidden")
    await db.delete(pm)
    await db.commit()


@router.patch("/payment-methods/{payment_method_id}/default")
async def set_default_payment_method(
    payment_method_id: str, db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)
):
    pm = (await db.execute(select(PaymentMethod).where(PaymentMethod.id == payment_method_id))).scalar_one_or_none()
    if not pm:
        raise HTTPException(status_code=404, detail="Payment method not found")
    if pm.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Forbidden")
    await db.execute(update(PaymentMethod).where(PaymentMethod.user_id == current_user.id).values(is_default=False))
    pm.is_default = True
    await db.commit()
    return {"success": True}
