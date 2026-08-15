from typing import Optional
from fastapi import APIRouter, Query
from app.schemas.festival import FestivalInfo, FestivalCalendarResponse
from app.services.festival_service import festival_service

router = APIRouter(prefix="/festival", tags=["Festival & Regional Context Engine"])

@router.get("/current", response_model=FestivalInfo)
async def get_current_festival(
    festival: Optional[str] = Query("Diwali")
):
    """
    Returns active festival metadata, surge rules, and multilingual greetings.
    """
    return festival_service.get_current_festival(festival)

@router.get("/calendar", response_model=FestivalCalendarResponse)
async def get_festival_calendar(
    active: Optional[str] = Query("Diwali")
):
    """
    Returns full festival calendar across all Indian cultural traditions.
    """
    return festival_service.get_festival_calendar(active)
