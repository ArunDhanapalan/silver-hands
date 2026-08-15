from typing import Optional, Dict, Any
from fastapi import APIRouter, Query
from app.schemas.festival import FestivalInfo, FestivalCalendarResponse
from app.services.festival_service import festival_service

router = APIRouter(prefix="/festival", tags=["Festival & Regional Context Engine"])

@router.get("/current", response_model=Optional[FestivalInfo])
async def get_current_festival(
    festival: Optional[str] = Query(None)
):
    """
    Returns active festival metadata (if within 14 days) or requested festival.
    """
    return festival_service.get_current_festival(festival)

@router.get("/suggestions")
async def get_festival_suggestions(
    role: str = Query("customer")
) -> Dict[str, Any]:
    """
    Returns domain-specific product, service, and task suggestions for the upcoming festival.
    """
    return festival_service.get_festival_suggestions(role)

@router.get("/calendar", response_model=FestivalCalendarResponse)
async def get_festival_calendar(
    active: Optional[str] = Query(None)
):
    """
    Returns full festival calendar across all Indian cultural traditions.
    """
    return festival_service.get_festival_calendar(active)
