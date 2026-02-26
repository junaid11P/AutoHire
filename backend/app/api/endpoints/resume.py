from fastapi import APIRouter, UploadFile, File, HTTPException, Form, Depends
from app.api.deps import get_current_user
from app.services.pdf_parser import parse_document_to_markdown
from app.services.embedding import process_resume_embeddings
from app.services.llm import extract_skills_with_llm
from app.services.vector_store import vector_store
from app.db.mongodb import get_database
from motor.motor_asyncio import AsyncIOMotorGridFSBucket
from datetime import datetime
from bson import ObjectId
import logging

router = APIRouter()

@router.post("/upload")
async def upload_resume(
    file: UploadFile = File(...),
    current_user: dict = Depends(get_current_user)
):
    user_id = str(current_user["_id"])
    """
    1. Uploads PDF/DOCX resume file & saves securely to MongoDB GridFS
    2. Parses to Markdown
    3. Extracts LLM features (skills)
    4. Generates Vector Embeddings
    5. Saves into MongoDB Atlas Vector Search
    """
    if not file.filename.endswith(('.pdf', '.docx')):
        raise HTTPException(status_code=400, detail="Only PDF and DOCX files are supported.")
        
    try:
        content = await file.read()
        
        # Step 0: Save the original File to MongoDB GridFS safely
        db = get_database()
        fs = AsyncIOMotorGridFSBucket(db)
        
        # Checking if user already has an old resume and potentially delete it (basic cleanup)
        # For now, we simply upload a new document revision
        grid_id = await fs.upload_from_stream(
            file.filename,
            content,
            metadata={"user_id": user_id, "content_type": file.content_type}
        )
        
        # Step 1: Parse Document
        markdown_text = parse_document_to_markdown(content, file.filename)
        
        # Step 2: Extract structured data with Llama 3
        candidate_data = extract_skills_with_llm(markdown_text)
        
        # Step 3: Chunk and Embed for Vector Search
        embeddings_payload = process_resume_embeddings(markdown_text)
        
        # Step 4: Save to MongoDB Atlas Vector Database
        await vector_store.store_embeddings(
            user_id=user_id,
            filename=file.filename,
            metadata=candidate_data,
            chunks_payload=embeddings_payload
        )
        
        # Step 5: Update Seeker's core profile with extracted skills!
        await db["seekers"].update_one(
            {"_id": ObjectId(user_id)},
            {"$set": {
                "skills": candidate_data.get("skills", []),
                "parsed_resume_id": str(grid_id),
                "last_updated": datetime.utcnow()
            }}
        )
        
        return {
            "status": "success",
            "filename": file.filename,
            "parsed_profile": candidate_data,
            "embedded_chunks": len(embeddings_payload)
        }
        
    except Exception as e:
        logging.error(f"Error during upload_resume: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to process resume: {str(e)}")
