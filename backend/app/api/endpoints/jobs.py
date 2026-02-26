from fastapi import APIRouter, Depends, HTTPException, Query, UploadFile, File
from app.db.mongodb import get_database
from app.models.job import JobCreate, JobResponse
from app.api.deps import get_current_active_company, get_current_user
from app.services.embedding import generate_embeddings
from app.services.pdf_parser import parse_document_to_markdown
from app.services.llm import extract_job_details_from_resume_with_llm
from datetime import datetime
from bson import ObjectId
from typing import List

router = APIRouter()

@router.post("/", response_model=JobResponse, status_code=201)
async def create_job(job_in: JobCreate, current_company: dict = Depends(get_current_active_company)):
    """
    Create a new job posting. (Companies only).
    """
    db = get_database()
    
    # Compress the requirements list into a continuous string chunk to FastEmbed
    req_text = "\\n".join(job_in.required_skills + job_in.tech_stack)
    
    # Generate Vector Embedding for Resume RAG Matching!
    job_embedding = generate_embeddings([req_text])[0]
    
    job_doc = {
        "title": job_in.title,
        "description": job_in.description,
        "company_id": str(current_company["_id"]),
        "company_name": current_company.get("company_name", "Unknown Company"),
        "required_skills": job_in.required_skills,
        "experience_level": job_in.experience_level,
        "dsa_level": job_in.dsa_level,
        "tech_stack": job_in.tech_stack,
        "interview_difficulty": job_in.interview_difficulty,
        "requirements_embedding": job_embedding, # Hidden inside DB for algorithm matching
        "status": "Open",
        "created_at": datetime.utcnow()
    }
    
    result = await db["jobs"].insert_one(job_doc)
    
    return JobResponse(
        id=str(result.inserted_id),
        **job_doc
    )

@router.get("/", response_model=List[JobResponse])
async def read_jobs(skip: int = Query(0), limit: int = Query(20)):
    """
    List all active jobs. Available to seekers safely fetching data omitting the raw vectors.
    """
    db = get_database()
    jobs = await db["jobs"].find({"status": "Open"}).skip(skip).limit(limit).to_list(length=limit)
    
    # Strip arrays & return cleanly formatted JSONs
    return [
        JobResponse(id=str(job["_id"]), **job)
        for job in jobs
    ]

@router.post("/parse-resume")
async def parse_resume_to_job(
    file: UploadFile = File(...),
    current_company: dict = Depends(get_current_active_company)
):
    """
    Take an ideal candidate's ATS-format resume and automatically pre-fill the job parameters.
    """
    if not file.filename.endswith(('.pdf', '.docx')):
        raise HTTPException(status_code=400, detail="Only PDF and DOCX files are supported.")
        
    try:
        content = await file.read()
        
        # 1. Parse File to MD
        markdown_text = parse_document_to_markdown(content, file.filename)
        
        # 2. Extract Data
        job_details = extract_job_details_from_resume_with_llm(markdown_text)
        
        return job_details
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to process file: {str(e)}")
