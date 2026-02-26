from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from typing import List, Dict, Any, Optional
from datetime import datetime
from app.db.mongodb import get_database
from app.services.sandbox import secure_run_python_code
from app.api.deps import get_current_user
from bson import ObjectId
from groq import Groq
import json
import io

from app.services.tts import generate_tiktok_tts, generate_lip_sync_json, TIKTOK_VOICES
from app.core.config import settings
from app.services.vector_store import vector_store

router = APIRouter()

class CalibrationPayload(BaseModel):
    application_id: str
    facial_baseline: Optional[Dict[str, Any]] = None
    eye_range: Optional[Dict[str, Any]] = None
    body_positions: Optional[Dict[str, Any]] = None
    voice_fingerprint_id: Optional[str] = None
    screen_share_status: bool

class SubmitRound1Payload(BaseModel):
    application_id: str
    aptitude_score: int
    coding_score: int
    proctoring_score: int
    proctoring_logs: List[str]

class SubmitRound2Payload(BaseModel):
    application_id: str
    technical_score: int
    final_feedback: str
    proctoring_score: int
    proctoring_logs: List[str]

@router.post("/calibrate")
async def save_calibration_data(payload: CalibrationPayload, current_user: dict = Depends(get_current_user)):
    """
    Saves candidate's proctoring baselines before interview rounds start.
    """
    db = get_database()
    calibration_data = {
        "facial_baseline": payload.facial_baseline,
        "eye_range": payload.eye_range,
        "body_positions": payload.body_positions,
        "voice_fingerprint_id": payload.voice_fingerprint_id,
        "screen_share_status": payload.screen_share_status,
        "calibrated_at": datetime.utcnow()
    }
    
    await db["applications"].update_one(
        {"_id": ObjectId(payload.application_id)},
        {"$set": {"calibration": calibration_data, "status": "Calibrated"}}
    )
    return {"status": "Calibration successful"}

@router.get("/aptitude/{application_id}")
async def generate_aptitude_questions(application_id: str, current_user: dict = Depends(get_current_user)):
    db = get_database()
    app_doc = await db["applications"].find_one({"_id": ObjectId(application_id)})
    if not app_doc:
        raise HTTPException(status_code=404, detail="Application not found.")
        
    job_id = app_doc["job_id"]
    job_doc = await db["jobs"].find_one({"_id": ObjectId(job_id)})
    
    if not job_doc:
        raise HTTPException(status_code=404, detail="Job Context missing.")

    system_prompt = f"""
    Generate exactly 3 multiple-choice aptitude and logical reasoning questions tailored for a {job_doc['experience_level']} level software engineer. 
    The questions should focus on the tech stack: {', '.join(job_doc['tech_stack'])} and Data Structures at a {job_doc['dsa_level']} difficulty.
    Return ONLY valid JSON in this format:
    [{{"question": "Text...", "options": ["A", "B", "C", "D"], "answer": "The exact string of the correct option"}}, ...]
    """
    
    try:
        client = Groq(api_key=settings.GROQ_API_KEY)
        completion = client.chat.completions.create(
            messages=[{"role": "system", "content": "You are a JSON API returning JSON questions."}, {"role": "user", "content": system_prompt}],
            model="llama-3.3-70b-versatile",
            temperature=0.3,
            response_format={"type": "json_object"} # Workaround/Ensures structured if prompt is strict
        )
        # Attempt to parse
        content = completion.choices[0].message.content.strip()
        # Ensure it's an array for robustness even if structured format wraps it
        if "{" in content and "[" not in content[0:5]:
            # Simple fallback if groq hallucinates wrapper obj
             return {"questions": json.loads(content).get("questions", [])}
             
        return {"questions": json.loads(content)}
    except Exception as e:
        # Fallback dummy questions if LLM fails
        return {"questions": [
            {"question": "What is the time complexity of searching in a perfectly balanced binary search tree?", "options": ["O(1)", "O(n)", "O(log n)", "O(n log n)"], "answer": "O(log n)"}
        ]}


class CodePayload(BaseModel):
    source_code: str
    application_id: str

@router.post("/execute")
async def execute_round1_coding(payload: CodePayload, current_user: dict = Depends(get_current_user)):
    """
    Round 1: Python Code Execution Sandbox
    Secured to the current active Job Seeker
    """
    if current_user["role"] != "seeker":
         raise HTTPException(status_code=403, detail="Companies cannot take interviews")
         
    execution_result = secure_run_python_code(payload.source_code)
    
    # Ideally, right here we intercept execution_result to score correctness against predefined Unit tests.
    
    return execution_result

class ChatPayload(BaseModel):
    application_id: str
    user_transcript: str

@router.post("/chat")
async def generate_ai_interview_round2(payload: ChatPayload, current_user: dict = Depends(get_current_user)):
    """
    Round 2: Dynamic Vector RAG AI Interview Generation
    Queries Groq (Llama 3) based on the specific job requirements and the applicant's RAG resume context.
    """
    db = get_database()
    
    # 1. Fetch Application matching the Session Context
    app_doc = await db["applications"].find_one({"_id": ObjectId(payload.application_id)})
    if not app_doc:
         raise HTTPException(status_code=404, detail="Application Context Missing.")
         
    job_id = app_doc["job_id"]
    job_doc = await db["jobs"].find_one({"_id": ObjectId(job_id)})
    
    if not job_doc:
         raise HTTPException(status_code=404, detail="Original Job missing. Cannot construct context.")

    # 2. Extract Job Requirements vector to construct resume RAG context dynamically
    job_embedding = job_doc["requirements_embedding"]
    seeker_id = str(app_doc["user_id"])
    
    # 3. Retrieve Candidate's localized Resume Vectors specifically matched to the Job Req Vectors
    matched_resume_chunks = await vector_store.search_similar_chunks(job_embedding, user_id=seeker_id, limit=3)
    
    # Compress those vectors back into string English text chunks for Llama 3!
    context_chunks = "\\n".join([c["text"] for c in matched_resume_chunks])
    
    # 4. Generate the Advanced Prompt!
    system_prompt = f"""
    You are an AI Technical Interviewer representing {job_doc['company_name']} for the position of {job_doc['title']}.
    This is an interactive, conversational round. Given the candidate's previous response, you must assess them 
    using BOTH the required tech stack and their specific resume chunks mapped via RAG similarity search.
    
    Job Tech Stack: {', '.join(job_doc['tech_stack'])}
    Job Difficulty: {job_doc['interview_difficulty']}
    
    Candidate's Extracted Resume Context:
    "{context_chunks}"
    
    Their Latest Answer: '{payload.user_transcript}'
    
    Generate your next dynamic follow-up technical question (under 3 sentences) in natural conversation format.
    Do NOT output JSON. Output strictly the English dialogue your 3D avatar should speak.
    """
    
    client = Groq(api_key=settings.GROQ_API_KEY)
    chat_completion = client.chat.completions.create(
        messages=[{"role": "system", "content": "You are a realistic, friendly but rigorous AI interviewer."}, {"role": "user", "content": system_prompt}],
        model="llama-3.3-70b-versatile",
        temperature=0.5,
        max_tokens=150
    )
    
    response_text = chat_completion.choices[0].message.content.strip()
    
    # 5. Generate Text-to-Speech & Lip Sync
    audio_b64 = generate_tiktok_tts(response_text, voice=TIKTOK_VOICES.get("female"))
    
    # Pass a dummy stream just to mock the rhubarb structure per user spec
    dummy_stream = io.BytesIO(b"fake_audio_stream")
    lip_sync_data = generate_lip_sync_json(dummy_stream)
    
    return {
        "reply_text": response_text,
        "audio_base64": audio_b64,
        "lip_sync": lip_sync_data
    }

@router.post("/submit-round1")
async def submit_round1_results(payload: SubmitRound1Payload, current_user: dict = Depends(get_current_user)):
    """
    Submits Aptitude and Coding scores alongside Proctoring integrity logs for Round 1
    """
    db = get_database()
    update_data = {
        "round1_completed": True,
        "round1_scores": {
            "aptitude": payload.aptitude_score,
            "coding": payload.coding_score,
            "proctoring_score": payload.proctoring_score,
            "logs": payload.proctoring_logs,
            "timestamp": datetime.utcnow()
        },
        "status": "Round 1 Completed"
    }
    
    await db["applications"].update_one(
        {"_id": ObjectId(payload.application_id)},
        {"$set": update_data}
    )
    return {"status": "Round 1 Saved"}

@router.post("/submit-round2")
async def submit_round2_results(payload: SubmitRound2Payload, current_user: dict = Depends(get_current_user)):
    """
    Submits AI Technical Interview scores, final evaluations, and creates Final Report.
    """
    db = get_database()
    
    # Calculate combined integrity
    app_doc = await db["applications"].find_one({"_id": ObjectId(payload.application_id)})
    if not app_doc:
        raise HTTPException(status_code=404, detail="Application missing")
        
    r1_proc = app_doc.get("round1_scores", {}).get("proctoring_score", 100)
    final_integrity = (r1_proc + payload.proctoring_score) / 2
    
    update_data = {
        "round2_completed": True,
        "round2_scores": {
            "technical": payload.technical_score,
            "feedback": payload.final_feedback,
            "proctoring_score": payload.proctoring_score,
            "logs": payload.proctoring_logs,
            "timestamp": datetime.utcnow()
        },
        "final_integrity_score": final_integrity,
        "status": "Interview Evaluation Complete"
    }
    
    await db["applications"].update_one(
        {"_id": ObjectId(payload.application_id)},
        {"$set": update_data}
    )
    return {"status": "Round 2 Finalized", "integrity_score": final_integrity}
