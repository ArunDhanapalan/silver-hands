from typing import Optional, List, Dict
from pydantic import BaseModel

class FestivalInfo(BaseModel):
    id: str
    name: str
    icon: str
    primary_regions: List[str]
    banner_theme: str
    greeting: Dict[str, str]
    key_categories: List[str]
    surge_multiplier: float = 1.25
    active_months: Optional[List[str]] = None

class FestivalCalendarResponse(BaseModel):
    current_festival: Optional[FestivalInfo] = None
    all_festivals: List[FestivalInfo]
