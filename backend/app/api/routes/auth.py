from fastapi import APIRouter, Depends, Response
from sqlalchemy.orm import Session
from app.api.deps import get_db, get_current_user
from app.models.user import User
from app.schemas.user import UserCreate, UserRead, UserLogin
from app.schemas.token import Token
from app.core.security import get_password_hash, verify_password, create_access_token
from app.core.exceptions import BadRequestException, UnauthorizedException

router = APIRouter()

@router.post("/register", response_model=UserRead, status_code=201)
def register(user_in: UserCreate, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == user_in.email).first()
    if user:
        raise BadRequestException("User with this email already exists.")
    
    hashed_password = get_password_hash(user_in.password)
    db_user = User(
        email=user_in.email,
        name=user_in.name,
        hashed_password=hashed_password
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

@router.post("/login", response_model=Token)
def login(user_in: UserLogin, response: Response, db: Session = Depends(get_db)):
    # Simple JSON login for MVP. UserLogin has email/password.
    user = db.query(User).filter(User.email == user_in.email).first()
    if not user or not verify_password(user_in.password, user.hashed_password):
        raise UnauthorizedException("Incorrect email or password")
    
    access_token = create_access_token(subject=str(user.id))
    response.set_cookie(
        key="access_token",
        value=access_token,
        httponly=True,
        max_age=604800, # 7 days
        samesite="lax",
    )
    return {"access_token": access_token, "token_type": "bearer"}

@router.post("/logout")
def logout(response: Response, current_user: User = Depends(get_current_user)):
    response.delete_cookie("access_token")
    return {"message": "Logged out successfully"}

@router.get("/me", response_model=UserRead)
def read_current_user(current_user: User = Depends(get_current_user)):
    return current_user
