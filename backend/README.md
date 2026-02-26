# AutoHire Backend 🚀

This is the Python FastAPI backend driving the AI Interview Platform.

## Architecture Structure

```text
backend/
├── app/
│   ├── api/                 # API endpoint routers
│   ├── core/                # Configuration and security (JWT setup)
│   ├── db/                  # MongoDB client connection manager
│   ├── models/              # Pydantic models for request/response validation
│   ├── services/            # Core logic (Resume RAG parsing, LLM generation)
│   └── main.py              # Application entry point
├── requirements.txt         # Python dependencies
└── .env                     # Environment variables
```

## Setup Instructions

1. **Verify Python**: Ensure you have Python 3.10+ installed.
2. **Create a Virtual Environment**:
   ```bash
   cd backend
   python -m venv .venv
   source .venv/bin/activate  # On MacOS/Linux
   ```
3. **Install Dependencies**:
   ```bash
   pip install -r requirements.txt
   ```
4. **Environment Variables**:
   Duplicate `.env.example` as `.env`, and provide your real `MONGODB_URL` and `GROQ_API_KEY`.
5. **Start Server**:
   ```bash
   uvicorn app.main:app --reload
   ```

The API docs will be instantly available at `http://127.0.0.1:8000/docs`.
