from datetime import datetime, timedelta, timezone

from jose import jwt
import bcrypt

from app.config import settings

# pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def hash_password(password: str) -> str:
    salt = bcrypt.gensalt()
    return bcrypt.hashpw(password.encode("utf-8"), salt).decode("utf-8")


def verify_password(plain_password: str, hashed_password: str) -> bool:
    try:
        return bcrypt.checkpw(plain_password.encode("utf-8"), hashed_password.encode("utf-8"))
    except Exception:
        return False


def create_access_token(user_id: str) -> str:
    expires = datetime.now(timezone.utc) + timedelta(days=settings.access_token_expire_days)
    payload = {"sub": user_id, "exp": expires}
    return jwt.encode(payload, settings.secret_key, algorithm="HS256")
