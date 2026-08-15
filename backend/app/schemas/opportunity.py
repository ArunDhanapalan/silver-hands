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
    action: str = Field(..., pattern="^(interested|pass|right|left)$")

class SwipeActionResponse(BaseModel):
    success: bool
    opportunity_id: str
    action: str
    message: str

class OpportunityCreateRequest(BaseModel):
    title: str
    description: str
    type: str = "job"
    category: Optional[str] = "General"
    required_skills: List[str] = ["Communication"]
    locality: str = "Adyar"
    city: str = "Chennai"
    work_mode: str = "both" # online, offline, both
    schedule: str = "Part-time (Flexible)"
    pay_amount: int = 15000
    pay_unit: str = "month" # month, session, hour, project
    languages: List[str] = ["en", "ta"]
    is_festival_special: bool = False
    festival_tag: Optional[str] = None

class JobParseRequest(BaseModel):
    raw_text: str

class MatchedCandidateResponse(BaseModel):
    senior_id: str
    full_name: str
    locality: str
    city: str
    skills: List[str]
    match_score: int
    bio: str
    is_age_verified: bool = True

class ApplicationItemResponse(BaseModel):
    id: str
    opportunity_id: str
    opportunity_title: str
    type: str
    posted_by_name: str
    pay_amount: int
    pay_unit: str
    status: str # applied, accepted, interview_invited, in_progress, completed, passed
    match_score: int
    match_explanation: str
    interview_link: Optional[str] = None
    interview_date: Optional[str] = None
    applied_at: str

class InviteCandidateRequest(BaseModel):
    senior_id: str
    opportunity_id: str
    role_title: str
    message: Optional[str] = "We would love to invite you for a flexible discussion regarding this senior role."
    interview_date: Optional[str] = "Upcoming Weekday (Flexible Slot)"
