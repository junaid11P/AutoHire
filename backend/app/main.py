from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.db.mongodb import connect_to_mongo, close_mongo_connection

def start_application():
    app = FastAPI(title=settings.PROJECT_NAME, version=settings.VERSION)
    
    # Set up CORS for frontend communication
    app.add_middleware(
        CORSMiddleware,
        allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"], 
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )
    
    # Database lifecycle
    app.add_event_handler("startup", connect_to_mongo)
    app.add_event_handler("shutdown", close_mongo_connection)
    
    from app.api.api import api_router
    app.include_router(api_router, prefix="/api/v1")
    
    return app

app = start_application()

@app.get("/")
def root():
    return {"message": "Welcome to AutoHire Backend API", "status": "operational"}
