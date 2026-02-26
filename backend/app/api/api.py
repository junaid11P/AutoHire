from fastapi import APIRouter
from app.api.endpoints import auth, resume, jobs, applications, interviews

api_router = APIRouter()
api_router.include_router(auth.router, prefix="/auth", tags=["Authentication"])
api_router.include_router(resume.router, prefix="/resume", tags=["Resume Parser & Vector Storage"])
api_router.include_router(jobs.router, prefix="/jobs", tags=["Jobs & Semantic Matching"])
api_router.include_router(applications.router, prefix="/applications", tags=["Job Applications Tracking"])
api_router.include_router(interviews.router, prefix="/interviews", tags=["Live AI Interview Evaluations"])
