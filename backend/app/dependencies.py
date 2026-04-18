from fastapi import Depends, HTTPException, status, Header
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from google.adk.sessions import InMemorySessionService
from . import models
from .services import auth_service, user_service
from .database import SessionLocal


oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")
APP_NAME = "expenso"  # temp
USER_ID = "user1234"  # temp


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def get_current_user(
    token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)
) -> models.User:
    payload = auth_service.decode_access_token(token)
    if payload is None or "sub" not in payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication token",
        )
    user = user_service.get_user_by_email(db, payload["sub"])
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, detail="User not found"
        )
    return user


# Dependency to get or validate the Session ID
async def get_session_id(x_session_id: str = Header(None)):
    if not x_session_id:
        # You could also generate one here if it's a new user
        raise HTTPException(status_code=400, detail="X-Session-ID header missing")

    return x_session_id
