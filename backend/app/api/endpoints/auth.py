from fastapi import APIRouter, HTTPException, status, Depends
from fastapi.security import OAuth2PasswordRequestForm
from pydantic import BaseModel
from typing import Any
from datetime import timedelta

from app.models.user import UserCreate, UserResponse
from app.db.mongodb import get_database
from app.api.deps import get_current_user
from app.core.security import get_password_hash, verify_password, create_access_token
from app.core.config import settings
from bson import ObjectId
from typing import Mapping

router = APIRouter()

class Token(BaseModel):
    access_token: str
    token_type: str
    user_id: str
    role: str

@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def register(user_in: UserCreate) -> Any:
    """
    Register a new user (Seeker or Company).
    """
    db = get_database()
    # Choose collection based on role
    collection_name = "seekers" if user_in.role == "seeker" else "companies"
    collection = db[collection_name]
    
    # Validation: Check if email already exists in BOTH collections to ensure uniqueness
    if await db["seekers"].find_one({"email": user_in.email}) or \
       await db["companies"].find_one({"email": user_in.email}):
        raise HTTPException(
            status_code=400,
            detail="The user with this username already exists in the system.",
        )
    
    # Hash password explicitly
    hashed_password = get_password_hash(user_in.password)
    
    # Prepare Document Object mapping to Schema
    user_doc = {
        "name": user_in.name,
        "email": user_in.email,
        "role": user_in.role,
        "company_name": user_in.company_name if user_in.role == "company" else None,
        "hashed_password": hashed_password
    }
    
    # Insert safely into selected collection
    result = await collection.insert_one(user_doc)
    
    return UserResponse(
        id=str(result.inserted_id),
        name=user_doc["name"],
        email=user_doc["email"],
        role=user_doc["role"],
        company_name=user_doc.get("company_name", None)
    )

@router.post("/login", response_model=Token)
async def login(form_data: OAuth2PasswordRequestForm = Depends()) -> Any:
    """
    OAuth2 compatible token login. Get an access token for future requests.
    Using 'username' field for the 'email' payload.
    """
    db = get_database()
    
    # Search for user in both collections
    user = await db["seekers"].find_one({"email": form_data.username})
    if not user:
        user = await db["companies"].find_one({"email": form_data.username})
        
    if not user:
        raise HTTPException(status_code=400, detail="Incorrect email or password")
        
    # Verify password
    if not verify_password(form_data.password, user["hashed_password"]):
        raise HTTPException(status_code=400, detail="Incorrect email or password")
        
    # Generate token
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        subject=str(user["_id"]), expires_delta=access_token_expires
    )
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user_id": str(user["_id"]),
        "role": user["role"]
    }

@router.get("/me", response_model=UserResponse)
async def read_current_user(current_user: Mapping = Depends(get_current_user)) -> Any:
    """
    Get current logged in user profile.
    """
    return UserResponse(
        id=str(current_user["_id"]),
        name=current_user["name"],
        email=current_user["email"],
        role=current_user["role"],
        company_name=current_user.get("company_name", None)
    )
