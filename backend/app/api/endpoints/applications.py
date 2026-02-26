from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel
from app.db.mongodb import get_database
from app.models.application import ApplicationCreate, ApplicationResponse
from app.api.deps import get_current_user
from datetime import datetime
from bson import ObjectId
from typing import List

router = APIRouter()

@router.post("/", response_model=ApplicationResponse, status_code=201)
async def create_application(app_in: ApplicationCreate, current_user: dict = Depends(get_current_user)):
    """
    Called when a Job Seeker hits 'Apply'. 
    Creates the tracking pipeline for their upcoming auto-interview rounds.
    """
    if current_user["role"] != "seeker":
        raise HTTPException(status_code=403, detail="Only Job Seekers can apply.")
        
    db = get_database()
    
    # Check if job exists
    job = await db["jobs"].find_one({"_id": ObjectId(app_in.job_id)})
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")

    app_doc = {
        "job_id": app_in.job_id,
        "user_id": str(current_user["_id"]),
        "match_percentage": app_in.match_percentage,
        "status": "Applied",
        "created_at": datetime.utcnow()
    }
    
    result = await db["applications"].insert_one(app_doc)
    
    return ApplicationResponse(
        id=str(result.inserted_id),
        **app_doc
    )

@router.get("/", response_model=List[ApplicationResponse])
async def list_applications(current_user: dict = Depends(get_current_user)):
    """
    Returns the applications belonging to either a seeker or a company.
    """
    db = get_database()
    
    if current_user["role"] == "seeker":
        # Return jobs a seeker applied to
        cursor = db["applications"].find({"user_id": str(current_user["_id"])})
    else:
        # Complex Join: Companies fetching applications mapped to jobs they own
        job_ids = [str(j["_id"]) for j in await db["jobs"].find({"company_id": str(current_user["_id"])}).to_list(100)]
        cursor = db["applications"].find({"job_id": {"$in": job_ids}})
        
    documents = await cursor.to_list(length=100)
    
    results = []
    for doc in documents:
        # Fetch Seeker Name
        seeker = await db["seekers"].find_one({"_id": ObjectId(doc["user_id"])})
        # Fetch Job Title
        job = await db["jobs"].find_one({"_id": ObjectId(doc["job_id"])})
        
        results.append(ApplicationResponse(
            id=str(doc["_id"]),
            seeker_name=seeker["name"] if seeker else "Unknown",
            job_title=job["title"] if job else "Unknown",
            **doc
        ))
    
    return results
class UpdateStatusPayload(BaseModel):
    status: str # 'Shortlisted', 'Hired', 'Rejected'

@router.patch("/{application_id}/status", response_model=ApplicationResponse)
async def update_application_status(
    application_id: str, 
    payload: UpdateStatusPayload, 
    current_user: dict = Depends(get_current_user)
):
    """
    Allows recruiters to update application status (Shortlist/Reject).
    """
    db = get_database()
    
    # Optional: Verify user owns the job related to this application (omitted for brevity in demo)
    
    result = await db["applications"].find_one_and_update(
        {"_id": ObjectId(application_id)},
        {"$set": {"status": payload.status}},
        return_document=True
    )
    
    if not result:
        raise HTTPException(status_code=404, detail="Application not found")
        
    return ApplicationResponse(id=str(result["_id"]), **result)
