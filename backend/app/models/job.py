from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime

class JobBase(BaseModel):
    title: str
    description: str
    required_skills: List[str]
    experience_level: str
    dsa_level: str  # e.g., 'Easy', 'Medium', 'Hard'
    tech_stack: List[str]
    interview_difficulty: str

class JobCreate(JobBase):
    pass

class JobResponse(JobBase):
    id: str
    company_id: str
    company_name: str
    status: str
    created_at: datetime
    
