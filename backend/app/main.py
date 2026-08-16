import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.config import settings
from app.database import db_manager
from app.routers import health, auth, senior, opportunities, store, services, community, festival, chat

# Setup logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s"
)
logger = logging.getLogger("silverhands.main")

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    logger.info("Initializing SilverHands 2.0 Backend...")
    await db_manager.connect()
    
    # Auto-seed initial demo dataset if collections empty
    try:
        from app.services.seed_service import seed_initial_data, backfill_reviews_if_needed
        await seed_initial_data()
        await backfill_reviews_if_needed()
    except Exception as e:
        logger.warning(f"Seed note (will retry once seed service is loaded): {e}")

    yield
    
    # Shutdown
    logger.info("Shutting down SilverHands 2.0 Backend...")
    await db_manager.disconnect()

app = FastAPI(
    title=settings.APP_NAME,
    version="2.0.0",
    lifespan=lifespan,
    docs_url="/api/docs",
    openapi_url="/api/openapi.json"
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # Allow all for local dev & preview
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global Exception Handler
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error(f"Global error on {request.method} {request.url.path}: {str(exc)}", exc_info=True)
    return JSONResponse(
        status_code=500,
        content={
            "detail": "An internal server error occurred. Please try again or check the request parameters.",
            "error_type": exc.__class__.__name__
        }
    )

# Include Routers
app.include_router(health.router, prefix=settings.API_V1_STR)
app.include_router(auth.router, prefix=settings.API_V1_STR)
app.include_router(senior.router, prefix=settings.API_V1_STR)
app.include_router(opportunities.router, prefix=settings.API_V1_STR)
app.include_router(store.router, prefix=settings.API_V1_STR)
app.include_router(services.router, prefix=settings.API_V1_STR)
app.include_router(community.router, prefix=settings.API_V1_STR)
app.include_router(festival.router, prefix=settings.API_V1_STR)
app.include_router(chat.router, prefix=settings.API_V1_STR)

@app.get("/")
async def root():
    return {
        "message": "Welcome to SilverHands 2.0 API — Empowering Experience & Local Livelihoods",
        "docs": "/api/docs",
        "health": "/api/health"
    }
