from fastapi import APIRouter, Body, Depends, HTTPException, status
from sqlalchemy.orm import Session

from ..services import user_service, auth_service
from .. import schemas
from ..auth_crypto import decrypt_client_secret, get_public_key_pem
from ..dependencies import get_db

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
def login(
    user_credentials: schemas.UserLogin = Body(...), db: Session = Depends(get_db)
):
    resolved_password = decrypt_client_secret(user_credentials.password)
    user = user_service.authenticate_user(
        db, user_credentials.username, resolved_password
    )
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials"
        )
    access_token = auth_service.create_access_token(data={"sub": user.email})
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "email": user.email,
        "full_name": user.full_name,
    }
