import json
from groq import Groq
from app.core.config import settings

def extract_skills_with_llm(markdown_content: str):
    """
    Sends the resume content to Groq's Llama 3 to structured JSON extraction.
    """
    if not settings.GROQ_API_KEY or settings.GROQ_API_KEY == "your_groq_api_key_here":
        # Mock Response if no API key is set
        return {
            "name": "Jane Doe",
            "skills": ["Python", "FastAPI", "React", "Docker", "Machine Learning"],
            "experience_years": 4
        }
        
    client = Groq(api_key=settings.GROQ_API_KEY)
    
    prompt = f"""
    You are an expert technical recruiter analyzing a parsed resume.
    Extract the candidate's name, core technical skills, and years of experience into a JSON object.
    
    Resume Markdown:
    {markdown_content[:3000]} # Truncated to avoid context limits
    
    Respond ONLY with a valid JSON document containing: 
    "name" (string), "skills" (list of strings), and "experience_years" (integer).
    """
    
    try:
        chat_completion = client.chat.completions.create(
            messages=[{"role": "user", "content": prompt}],
            model="llama-3.3-70b-versatile",
            temperature=0.1,
            response_format={"type": "json_object"}
        )
        return json.loads(chat_completion.choices[0].message.content)
    except Exception as e:
        print(f"Error fetching from Groq: {e}")
        return {"name": "Unknown", "skills": [], "experience_years": 0}

def extract_job_details_from_resume_with_llm(markdown_content: str):
    """
    Reverse-engineers a Job Description from an ideal candidate's resume using Groq's Llama 3.
    """
    if not settings.GROQ_API_KEY or settings.GROQ_API_KEY == "your_groq_api_key_here":
        return {
            "title": "Software Engineer",
            "description": "We are looking for a Software Engineer with experience in Python and React. You will be responsible for building scalable web applications.",
            "required_skills": ["Python", "FastAPI", "React"],
            "tech_stack": ["Docker", "MongoDB", "PostgreSQL"],
            "experience_level": "Mid",
            "dsa_level": "Medium",
            "interview_difficulty": "Medium"
        }
        
    client = Groq(api_key=settings.GROQ_API_KEY)
    
    prompt = f"""
    You are an expert technical recruiter and engineering manager.
    Given this parsed Resume (ATS Format) of an ideal candidate, extract the details to automatically create a Job Posting.
    
    Resume Markdown:
    {markdown_content[:3500]} 

    Respond ONLY with a valid JSON document containing EXACTLY these keys:
    - "title" (string: logical job title based on the resume, e.g. "Senior Python Engineer")
    - "description" (string: a 2-3 sentence markdown formatted job description summary derived from the candidate's achievements)
    - "required_skills" (list of strings: up to 8 core skills)
    - "tech_stack" (list of strings: up to 8 tools/frameworks)
    - "experience_level" (string: strictly one of "Entry", "Mid", "Senior")
    - "dsa_level" (string: strictly one of "Easy", "Medium", "Hard", inferring from the complexity of their work)
    - "interview_difficulty" (string: strictly one of "Easy", "Medium", "Hard")
    """
    
    try:
        chat_completion = client.chat.completions.create(
            messages=[{"role": "user", "content": prompt}],
            model="llama-3.3-70b-versatile",
            temperature=0.1,
            response_format={"type": "json_object"}
        )
        return json.loads(chat_completion.choices[0].message.content)
    except Exception as e:
        print(f"Error fetching from Groq (Job Extraction): {e}")
        return {
            "title": "Software Engineer",
            "description": "Failed to generate description, please manually update.",
            "required_skills": ["Python", "React"],
            "tech_stack": ["Git"],
            "experience_level": "Mid",
            "dsa_level": "Medium",
            "interview_difficulty": "Medium"
        }
