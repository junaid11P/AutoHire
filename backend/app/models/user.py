from pydantic import BaseModel, EmailStr
from typing import Optional, List

class UserBase(BaseModel):
    name: str
    email: EmailStr
    role: str # 'seeker' or 'company'

class UserCreate(UserBase):
    password: str
    company_name: Optional[str] = None

    
class UserResponse(UserBase):
    id: str
    company_name: Optional[str] = None
