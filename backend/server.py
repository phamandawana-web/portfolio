from fastapi import FastAPI, APIRouter, HTTPException, Query
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
import os
import logging
from pathlib import Path

# Load environment
ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# Import routes
from routes.auth import router as auth_router
from routes.courses import router as courses_router
from routes.users import router as users_router
from routes.quizzes import router as quizzes_router
from routes.forums import router as forums_router
from routes.notifications import router as notifications_router
from routes.progress import router as progress_router
from services.scholar_service import fetch_scholar_publications, clear_cache

# Create app
app = FastAPI(title="LMS Platform API")

# Create uploads directory
UPLOAD_DIR = "/app/uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

# API router
api_router = APIRouter(prefix="/api")

@api_router.get("/")
async def root():
    return {"message": "Prince Academic Portfolio API"}

@api_router.get("/health")
async def health_check():
    return {"status": "healthy"}

# Google Scholar endpoints
@api_router.get("/publications/scholar/{scholar_id}")
async def get_scholar_publications(
    scholar_id: str,
    max_publications: int = Query(default=50, ge=1, le=100)
):
    try:
        result = await fetch_scholar_publications(scholar_id, max_publications)
        return result
    except Exception as e:
        logger.error(f"Error fetching scholar publications: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@api_router.delete("/publications/scholar/cache/{scholar_id}")
async def clear_scholar_cache(scholar_id: str):
    try:
        result = await clear_cache(scholar_id)
        return result
    except Exception as e:
        logger.error(f"Error clearing cache: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@api_router.delete("/publications/scholar/cache")
async def clear_all_scholar_cache():
    try:
        result = await clear_cache()
        return result
    except Exception as e:
        logger.error(f"Error clearing all caches: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# Serve uploaded files
@api_router.get("/uploads/{filename}")
async def get_upload(filename: str):
    file_path = os.path.join(UPLOAD_DIR, filename)
    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="File not found")
    return FileResponse(file_path)

# Include routers
app.include_router(api_router)
app.include_router(auth_router)
app.include_router(courses_router)
app.include_router(users_router)
app.include_router(quizzes_router)
app.include_router(forums_router)
app.include_router(notifications_router)
app.include_router(progress_router)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

# Logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)
