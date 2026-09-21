import datetime
import smtplib
from email.message import EmailMessage

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
import crud
import models
import schemas
from config import settings
from security import (
    create_access_token,
    create_password_reset_token,
    hash_password,
    hash_password_reset_token,
    verify_password,
)
from dependencies import get_db, get_current_user

router = APIRouter()


def send_password_reset_email(email: str, reset_url: str) -> None:
    smtp_host = settings.smtp_host
    smtp_port = settings.smtp_port
    smtp_username = settings.smtp_username
    smtp_password = settings.smtp_password
    from_email = settings.smtp_from or smtp_username or "no-reply@localhost"

    if not all((smtp_host, smtp_username, smtp_password)):
        print(f"Password reset link for {email}: {reset_url}")
        return

    message = EmailMessage()
    message["Subject"] = "Reset your Second Brain OS password"
    message["From"] = from_email
    message["To"] = email
    message.set_content(
        f"Use this link to reset your password. It expires in 15 minutes:\n\n{reset_url}"
    )
    with smtplib.SMTP(smtp_host, smtp_port) as smtp:
        smtp.starttls()
        smtp.login(smtp_username, smtp_password)
        smtp.send_message(message)


@router.post("/signup", response_model=schemas.Token)
def signup(user: schemas.UserCreate, db: Session = Depends(get_db)):
    if crud.get_user_by_email(db, user.email):
        raise HTTPException(status_code=400, detail="Email already registered")
    if crud.get_user_by_username(db, user.username):
        raise HTTPException(status_code=400, detail="Username already taken")
    db_user = crud.create_user(db, user)
    access_token = create_access_token(data={"sub": db_user.email})
    return {"access_token": access_token, "token_type": "bearer", "user": db_user}


@router.post("/login", response_model=schemas.Token)
def login(credentials: schemas.UserLogin, db: Session = Depends(get_db)):
    user = crud.get_user_by_email(db, credentials.email)
    if not user or not verify_password(credentials.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    access_token = create_access_token(data={"sub": user.email})
    return {"access_token": access_token, "token_type": "bearer", "user": user}


@router.post("/forgot-password")
def forgot_password(request: schemas.ForgotPasswordRequest, db: Session = Depends(get_db)):
    user = crud.get_user_by_email(db, request.email)
    response = {"message": "If that email exists, a reset link has been sent."}
    if not user:
        return response

    raw_token = create_password_reset_token()
    reset_token = models.PasswordResetToken(
        user_id=user.id,
        token_hash=hash_password_reset_token(raw_token),
        expires_at=datetime.datetime.utcnow() + datetime.timedelta(minutes=15),
    )
    db.add(reset_token)
    db.commit()

    reset_url = f"{settings.frontend_url}/auth/reset-password?token={raw_token}"
    send_password_reset_email(user.email, reset_url)
    return response


@router.post("/reset-password")
def reset_password(request: schemas.ResetPasswordRequest, db: Session = Depends(get_db)):
    if len(request.new_password) < 6:
        raise HTTPException(status_code=400, detail="Password must be at least 6 characters")

    token_hash = hash_password_reset_token(request.token)
    reset_token = (
        db.query(models.PasswordResetToken)
        .filter(
            models.PasswordResetToken.token_hash == token_hash,
            models.PasswordResetToken.used_at.is_(None),
            models.PasswordResetToken.expires_at > datetime.datetime.utcnow(),
        )
        .first()
    )
    if not reset_token:
        raise HTTPException(status_code=400, detail="Reset link is invalid or expired")

    reset_token.user.password_hash = hash_password(request.new_password)
    reset_token.used_at = datetime.datetime.utcnow()
    db.commit()
    return {"message": "Password reset successfully. You can now sign in."}


@router.get("/me", response_model=schemas.UserOut)
def get_me(current_user=Depends(get_current_user)):
    return current_user
