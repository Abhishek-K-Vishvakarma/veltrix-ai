from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException, Request
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.core.security import create_access_token, hash_password, verify_password
from app.db.session import get_db
from app.models.user import User
from app.models.user_preference import UserPreference
from app.schemas.user import (
    PasswordChange,
    ProfileUpdate,
    Token,
    UserCreate,
    UserOut,
    UserPreferencesOut,
    UserPreferencesUpdate,
)
from app.services.activity_service import log_activity

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/register", response_model=UserOut, status_code=201)
def register(body: UserCreate, db: Session = Depends(get_db)):
    email = body.email.lower()
    if db.scalar(select(User).where(User.email == email)):
        raise HTTPException(409, "Email already registered")
    user = User(
        email=email,
        full_name=body.full_name,
        hashed_password=hash_password(body.password),
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    log_activity(db, user.id, "user.register", "user", f"{email} registered")
    return user


@router.post("/login", response_model=Token)
def login(
    request: Request,
    form: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db),
):
    ip = request.client.host if request.client else None
    user = db.scalar(select(User).where(User.email == form.username.lower()))
    if not user or not verify_password(form.password, user.hashed_password):
        log_activity(
            db,
            user.id if user else None,
            "auth.login_failed",
            "user",
            f"Failed login: {form.username}",
            "warning",
            ip,
        )
        raise HTTPException(401, "Incorrect email or password")
    if not user.is_active:
        raise HTTPException(403, "Account is disabled")
    user.last_login_at = datetime.now(timezone.utc)
    db.commit()
    log_activity(
        db, user.id, "auth.login", "user", f"{user.email} logged in", "info", ip
    )
    return Token(
        access_token=create_access_token(user.id, user.role),
        user=UserOut.model_validate(user),
    )


@router.get("/me", response_model=UserOut)
def me(user: User = Depends(get_current_user)):
    return user


@router.patch("/profile", response_model=UserOut)
def update_profile(
    body: ProfileUpdate,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    user.full_name = body.full_name.strip()
    if not user.full_name:
        raise HTTPException(422, "Full name cannot be empty")
    db.commit()
    db.refresh(user)
    return user


@router.get("/preferences", response_model=UserPreferencesOut)
def get_preferences(
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    record = db.scalar(
        select(UserPreference).where(UserPreference.user_id == user.id)
    )
    if record is None:
        record = UserPreference(user_id=user.id)
        db.add(record)
        db.commit()
        db.refresh(record)
    return record.preferences


@router.put("/preferences", response_model=UserPreferencesOut)
def update_preferences(
    body: UserPreferencesUpdate,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    record = db.scalar(
        select(UserPreference).where(UserPreference.user_id == user.id)
    )
    if record is None:
        record = UserPreference(user_id=user.id, preferences=body.model_dump())
        db.add(record)
    else:
        record.preferences = body.model_dump()
    db.commit()
    db.refresh(record)
    return record.preferences


@router.post("/change-password")
def change_password(
    body: PasswordChange,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if not verify_password(body.current_password, user.hashed_password):
        raise HTTPException(400, "Current password is incorrect")
    if verify_password(body.new_password, user.hashed_password):
        raise HTTPException(400, "Choose a password different from your current one")
    user.hashed_password = hash_password(body.new_password)
    db.commit()
    return {"message": "Password updated successfully"}
