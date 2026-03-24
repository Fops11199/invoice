from pathlib import Path

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.config import settings
from app.dependencies import get_current_user
from app.models.user import User
from app.schemas.auth import TokenResponse, UserLogin, UserOut, UserRegister
from app.services.auth import create_access_token, hash_password, verify_password

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/register", response_model=TokenResponse, status_code=status.HTTP_201_CREATED)
async def register(payload: UserRegister, db: AsyncSession = Depends(get_db)):
    existing = (await db.execute(select(User).where(User.email == payload.email))).scalar_one_or_none()
    if existing:
        raise HTTPException(status_code=400, detail="Email already exists")

    user = User(
        email=payload.email,
        password_hash=hash_password(payload.password),
        full_name=payload.full_name,
        business_name=payload.business_name,
        currency=payload.currency,
    )
    db.add(user)
    await db.commit()
    await db.refresh(user)
    token = create_access_token(str(user.id))
    return {"access_token": token, "token_type": "bearer", "user": UserOut.model_validate(user)}


@router.post("/login", response_model=TokenResponse)
async def login(payload: UserLogin, db: AsyncSession = Depends(get_db)):
    user = (await db.execute(select(User).where(User.email == payload.email))).scalar_one_or_none()
    if not user or not verify_password(payload.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    token = create_access_token(str(user.id))
    return {"access_token": token, "token_type": "bearer", "user": UserOut.model_validate(user)}


@router.get("/me", response_model=UserOut)
async def me(current_user: User = Depends(get_current_user)):
    return UserOut.model_validate(current_user)


@router.put("/me", response_model=UserOut)
async def update_me(payload: dict, current_user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    for field in ["full_name", "business_name", "business_address", "phone", "currency", "invoice_prefix", "default_notes"]:
        if field in payload:
            setattr(current_user, field, payload[field])
    await db.commit()
    await db.refresh(current_user)
    return UserOut.model_validate(current_user)


@router.post("/me/logo")
async def upload_logo(
    file: UploadFile = File(...), current_user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)
):
    file_ext = Path(file.filename).suffix or ".png"
    logos_dir = Path(settings.storage_path) / "logos" / str(current_user.id)
    logos_dir.mkdir(parents=True, exist_ok=True)
    target_path = logos_dir / f"logo{file_ext}"
    target_path.write_bytes(await file.read())
    current_user.logo_url = str(target_path)
    await db.commit()
    return {"logo_url": str(target_path)}
