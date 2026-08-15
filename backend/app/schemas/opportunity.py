from typing import Optional, List
from pydantic import BaseModel, Field

class OpportunityBase(BaseModel):
    title: str
    type: str # job, service_request, mentoring, collaboration, festival_work
    posted_by_name: str
    company_id: Optional[str] = None
    description: str
    required_skills: List[str]
    locality: str = "Adyar"
    city: str = "Chennai"
    distance_km: Optional[float] = 2.5
    work_mode: str = "offline" # online, offline, home
    schedule: str = "Part-time (Evenings)"
    pay_amount: int
    pay_unit: str = "month" # month, session, hour, project
    languages: List[str] = ["en", "ta"]
    is_festival_special: bool = False
    festival_tag: Optional[str] = None

class OpportunityResponse(OpportunityBase):
    id: str
    match_score: int = 85
    match_explanation: str = "Your experience and skill profile align with this opportunity."
    status: Optional[str] = None # None, applied, passed, accepted

class SwipeActionRequest(BaseModel):
    action: str = Field(..., pattern="^(interested|pass)$")

class SwipeActionResponse(BaseModel):
    success: bool
    opportunity_id: str
    action: str
    message: str

class ApplicationItemResponse(BaseModel):
    id: str
    opportunity_id: str
    opportunity_title: str
    type: str
    posted_by_name: str
    pay_amount: int
    pay_unit: str
    status: str # applied, accepted, in_progress, completed, passed
    match_score: int
    match_explanation: str
    applied_at: str
