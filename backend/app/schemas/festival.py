from typing import Optional, List, Dict
from pydantic import BaseModel

class FestivalInfo(BaseModel):
    id: str
    name: str # Diwali, Pongal, Onam, Durga Puja, Eid, Navratri, Christmas, Ganesh Chaturthi
    icon: str
    primary_regions: List[str]
    banner_theme: str # festive-gold, harvest-green, vibrant-marigold, royal-blue
    greeting: Dict[str, str] # language code -> greeting string
    key_categories: List[str]
    surge_multiplier: float = 1.25
    active_months: List[str]

class FestivalCalendarResponse(BaseModel):
    current_festival: FestivalInfo
    all_festivals: List[FestivalInfo]
