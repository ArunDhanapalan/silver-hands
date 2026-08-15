from typing import Dict, Any
from fastapi import APIRouter, Depends, status
from app.schemas.senior import (
    StoryAnalysisRequest,
    StoryAnalysisResponse,
    SeniorOnboardRequest,
    SeniorProfileResponse
)
from app.services.senior_service import senior_service
from app.security import get_current_user, require_role

router = APIRouter(prefix="/senior", tags=["Senior Livelihood & Skills"])

@router.post("/analyze-story", response_model=StoryAnalysisResponse)
async def analyze_story(req: StoryAnalysisRequest):
    """
    Publicly accessible endpoint for Life-to-Skill AI extraction from spoken or typed story.
    """
    return await senior_service.extract_skills_from_story(req)

@router.post("/onboard", response_model=SeniorProfileResponse)
async def onboard_senior(
    req: SeniorOnboardRequest,
    current_user: Dict[str, Any] = Depends(require_role(["senior"]))
):
    """
    Saves confirmed skills, travel radius, availability, and profile bio to MongoDB.
    """
    return await senior_service.save_senior_onboarding(current_user, req)

@router.get("/profile", response_model=SeniorProfileResponse)
async def get_my_profile(
    current_user: Dict[str, Any] = Depends(require_role(["senior"]))
):
    """
    Retrieves authenticated senior's livelihood profile.
    """
    return await senior_service.get_senior_profile(current_user["sub"])

@router.get("/earnings")
async def get_my_earnings(
    current_user: Dict[str, Any] = Depends(require_role(["senior"]))
):
    """
    Retrieves real dynamic earnings, wallet balance, and transaction ledger for the logged-in senior.
    """
    return await senior_service.get_senior_earnings_ledger(current_user["sub"])
