from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import or_, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.dependencies import get_current_user
from app.models.client import Client
from app.models.user import User
from app.schemas.client import ClientCreate, ClientOut, ClientUpdate

router = APIRouter(prefix="/clients", tags=["clients"])


@router.get("/", response_model=list[ClientOut])
async def list_clients(
    search: str | None = Query(default=None),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    query = select(Client).where(Client.user_id == current_user.id)
    if search:
        query = query.where(or_(Client.name.ilike(f"%{search}%"), Client.email.ilike(f"%{search}%")))
    return (await db.execute(query.order_by(Client.created_at.desc()))).scalars().all()


@router.post("/", response_model=ClientOut, status_code=status.HTTP_201_CREATED)
async def create_client(payload: ClientCreate, db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)):
    client = Client(user_id=current_user.id, **payload.model_dump())
    db.add(client)
    await db.commit()
    await db.refresh(client)
    return client


@router.get("/{client_id}", response_model=ClientOut)
async def get_client(client_id: str, db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)):
    client = (await db.execute(select(Client).where(Client.id == client_id))).scalar_one_or_none()
    if not client:
        raise HTTPException(status_code=404, detail="Client not found")
    if client.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Forbidden")
    return client


@router.put("/{client_id}", response_model=ClientOut)
async def update_client(
    client_id: str, payload: ClientUpdate, db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)
):
    client = (await db.execute(select(Client).where(Client.id == client_id))).scalar_one_or_none()
    if not client:
        raise HTTPException(status_code=404, detail="Client not found")
    if client.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Forbidden")
    for key, value in payload.model_dump().items():
        setattr(client, key, value)
    await db.commit()
    await db.refresh(client)
    return client


@router.delete("/{client_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_client(client_id: str, db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)):
    client = (await db.execute(select(Client).where(Client.id == client_id))).scalar_one_or_none()
    if not client:
        raise HTTPException(status_code=404, detail="Client not found")
    if client.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Forbidden")
    await db.delete(client)
    await db.commit()
