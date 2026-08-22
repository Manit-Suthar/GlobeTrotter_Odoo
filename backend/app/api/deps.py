import jwt
from typing import Generator
from fastapi import Depends, Request
from sqlalchemy.orm import Session
from app.db.database import SessionLocal
from app.core.config import settings
from app.core.exceptions import UnauthorizedException
from app.models.user import User

def get_db() -> Generator:
    try:
        db = SessionLocal()
        yield db
    finally:
        db.close()

def get_current_user(request: Request, db: Session = Depends(get_db)) -> User:
    token = request.cookies.get("access_token")
    if not token:
        auth_header = request.headers.get("Authorization")
        if auth_header and auth_header.startswith("Bearer "):
            token = auth_header.split(" ")[1]
            
    if not token:
        raise UnauthorizedException("Not authenticated")
        
    try:
        payload = jwt.decode(token, settings.JWT_SECRET, algorithms=[settings.ALGORITHM])
        user_id = payload.get("sub")
        if user_id is None:
            raise UnauthorizedException("Invalid token payload")
    except jwt.PyJWTError:
        raise UnauthorizedException("Could not validate credentials")
        
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise UnauthorizedException("User not found")
        
    return user

