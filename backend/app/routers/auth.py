from fastapi import APIRouter, Body, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from uuid import uuid4

from ..agents import agent_runner
from ..services import user_service, auth_service
from .. import models, schemas
from ..auth_crypto import decrypt_client_secret, get_public_key_pem
from ..dependencies import get_current_user, get_db, get_session_id

router = APIRouter(prefix="/auth", tags=["auth"])


@router.get("/public-key")
def get_auth_public_key():
    return {"public_key": get_public_key_pem()}


@router.post("/register", response_model=schemas.UserRead)
def register(user_data: schemas.UserCreate, db: Session = Depends(get_db)):
    resolved_user_data = user_data.model_copy(
        update={"password": decrypt_client_secret(user_data.password)}
    )
    existing = user_service.get_user_by_email(db, resolved_user_data.email)
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    return user_service.create_user(db, resolved_user_data)


@router.post("/login", response_model=schemas.UserToken)
async def login(
    user_credentials: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db),
):
    resolved_password = decrypt_client_secret(user_credentials.password)
    user = user_service.authenticate_user(
        db, user_credentials.username, resolved_password
    )
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials"
        )
    session_id = str(uuid4())
    await agent_runner.create_session(user.id, session_id)
    access_token = auth_service.create_access_token(data={"sub": user.email})
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "email": user.email,
        "full_name": user.full_name,
        "session_id": session_id,
    }
