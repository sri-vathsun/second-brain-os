from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
import crud
import schemas
from security import verify_password, create_access_token
from dependencies import get_db, get_current_user

router = APIRouter()


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


@router.get("/me", response_model=schemas.UserOut)
def get_me(current_user=Depends(get_current_user)):
    return current_user
