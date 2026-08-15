from typing import List, Dict, Any
from fastapi import APIRouter, Depends, status
from app.schemas.opportunity import (
    OpportunityResponse,
    SwipeActionRequest,
    SwipeActionResponse,
    ApplicationItemResponse
)
from app.services.matching_service import matching_service
from app.security import require_role

router = APIRouter(prefix="/opportunities", tags=["Livelihood & Opportunity Matching"])

@router.get("/deck", response_model=List[OpportunityResponse])
async def get_deck(
    current_user: Dict[str, Any] = Depends(require_role(["senior"]))
):
    """
    Returns un-swiped opportunities matched to the senior's stored skills, location, and radius.
    """
    return await matching_service.get_opportunity_deck(current_user)

@router.post("/{id}/swipe", response_model=SwipeActionResponse)
async def swipe_opportunity(
    id: str,
    req: SwipeActionRequest,
    current_user: Dict[str, Any] = Depends(require_role(["senior"]))
):
    """
    Records a Left (pass) or Right (interested/applied) swipe on an opportunity card.
    """
    return await matching_service.record_swipe(current_user, id, req)

@router.get("/my-applications", response_model=List[ApplicationItemResponse])
async def get_my_applications(
    current_user: Dict[str, Any] = Depends(require_role(["senior"]))
):
    """
    Returns all active / accepted opportunities for the senior.
    """
    return await matching_service.get_my_applications(current_user)

@router.post("/reset-deck")
async def reset_deck(
    current_user: Dict[str, Any] = Depends(require_role(["senior"]))
):
    """
    Resets previously passed cards so the senior can review them again.
    """
    return await matching_service.reset_deck_swipes(current_user)
