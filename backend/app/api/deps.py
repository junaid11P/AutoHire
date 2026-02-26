from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import jwt, JWTError
from pydantic import ValidationError
from typing import Mapping

from app.core.config import settings
from app.db.mongodb import get_database
from bson import ObjectId

# Setting up OAuth2 dependency mapper (looks in Headers 'Authorization: Bearer <token>')
oauth2_scheme = OAuth2PasswordBearer(
    tokenUrl=f"/api/v1/auth/login"
)

async def get_current_user(token: str = Depends(oauth2_scheme)) -> Mapping:
    """
    Dependency returning the currently logged in User dictionary wrapper from Mongo.
    """
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    try:
        # Decode the string JSON Web Token mapping algorithms to decrypt
        payload = jwt.decode(
            token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM]
        )
        user_id: str = payload.get("sub")
        if user_id is None:
            raise credentials_exception
    except (JWTError, ValidationError):
        raise credentials_exception
        
    db = get_database()
    # Search for user_id in both collections
    user = await db["seekers"].find_one({"_id": ObjectId(user_id)})
    if not user:
        user = await db["companies"].find_one({"_id": ObjectId(user_id)})
    
    if user is None:
        raise credentials_exception
        
    return user

async def get_current_active_company(current_user: Mapping = Depends(get_current_user)):
    """
    Role-based control constraint logic allowing ONLY Company requests.
    """
    if current_user.get("role") != "company":
        raise HTTPException(status_code=403, detail="The user doesn't have enough privileges")
    return current_user
