from fastapi import APIRouter
from app.database import db_manager
from app.config import settings

router = APIRouter(prefix="/health", tags=["Health"])

@router.get("")
async def health_check():
    return {
        "status": "ok",
        "app": settings.APP_NAME,
        "environment": settings.APP_ENV,
        "database": {
            "connected": db_manager.is_connected,
            "mode": "in_memory_async" if db_manager.is_in_memory else "live_mongodb",
            "name": settings.DATABASE_NAME
        },
        "version": "2.0.0"
    }
