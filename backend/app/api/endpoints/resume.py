from fastapi import APIRouter, UploadFile, File, HTTPException, Form
from app.services.pdf_parser import parse_document_to_markdown
from app.services.embedding import process_resume_embeddings
from app.services.llm import extract_skills_with_llm
from app.services.vector_store import vector_store
import logging

router = APIRouter()

@router.post("/upload")
async def upload_resume(
    file: UploadFile = File(...),
    user_id: str = Form("anonymous")
):
    """
    1. Uploads PDF/DOCX resume file
    2. Parses to Markdown
    3. Extracts LLM features (skills)
    4. Generates Vector Embeddings
    5. Saves into MongoDB Atlas Vector Search
    """
    if not file.filename.endswith(('.pdf', '.docx')):
        raise HTTPException(status_code=400, detail="Only PDF and DOCX files are supported.")
        
    try:
        content = await file.read()
        
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
        
        return {
            "status": "success",
            "filename": file.filename,
            "parsed_profile": candidate_data,
            "embedded_chunks": len(embeddings_payload)
        }
        
    except Exception as e:
        logging.error(f"Error during upload_resume: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to process resume: {str(e)}")
