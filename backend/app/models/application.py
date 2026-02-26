from pydantic import BaseModel
from typing import Optional, Dict, Any
from datetime import datetime

class ApplicationBase(BaseModel):
    job_id: str
    match_percentage: float

class ApplicationCreate(ApplicationBase):
    pass

class CalibrationData(BaseModel):
    facial_baseline: Optional[Dict[str, Any]] = None
    eye_range: Optional[Dict[str, Any]] = None
    body_positions: Optional[Dict[str, Any]] = None
    voice_fingerprint_id: Optional[str] = None
    screen_share_status: bool = False
    calibrated_at: Optional[datetime] = None

class ApplicationResponse(ApplicationBase):
    id: str
    user_id: str
    seeker_name: Optional[str] = None
    job_title: Optional[str] = None
    status: str 
    calibration: Optional[CalibrationData] = None
    round1_scores: Optional[Dict[str, Any]] = None
    round2_scores: Optional[Dict[str, Any]] = None
    final_integrity_score: Optional[float] = None
    created_at: datetime

class EvaluationScore(BaseModel):
    aptitude_score: Optional[int] = None
    coding_score: Optional[int] = None
    technical_score: Optional[int] = None
    integrity_score: Optional[int] = None
    
class InterviewSessionCreate(BaseModel):
    application_id: str

class InterviewSessionResponse(InterviewSessionCreate):
    id: str
    user_id: str
    job_id: str
    status: str # 'In Progress', 'Completed'
    scores: EvaluationScore
    ai_feedback: Optional[Dict[str, Any]] = None # Strengths, Weaknesses, Skill Gap Analysis
    created_at: datetime
