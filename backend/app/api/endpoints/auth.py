from fastapi import APIRouter
from pydantic import BaseModel
from app.models.user import UserCreate, UserResponse

router = APIRouter()

class Token(BaseModel):
    access_token: str
    token_type: str

@router.post("/register", response_model=UserResponse, status_code=201)
async def register(user_in: UserCreate):
    """
    Register a new user (Seeker or Company).
    """
    # Validation and DB insertion logic will go here
    
    return UserResponse(
        id="mock_id_123",
        name=user_in.name,
        email=user_in.email,
        role=user_in.role,
        company_name=user_in.company_name
    )

@router.post("/login", response_model=Token)
async def login():
    """
    OAuth2 compatible token login.
    """
    # Password verification and JWT generation goes here
    
    return Token(
        access_token="mock_jwt_token",
        token_type="bearer"
    )
