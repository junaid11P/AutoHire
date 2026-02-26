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
