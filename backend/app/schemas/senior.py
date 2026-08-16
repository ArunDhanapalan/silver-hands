from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field


class StoryAnalysisRequest(BaseModel):
    story_text: str = Field(..., min_length=2)
    language: str = "en"


class InferredSkillItem(BaseModel):
    skill: str
    reason: str


class LaunchpadServiceIdea(BaseModel):
    title: str
    description: str
    category: str = "Education & Learning"
    price_range: str = "₹400–₹800 / session"
    duration: str = "45 mins"
    mode: str = "online"


class LaunchpadProductIdea(BaseModel):
    title: str
    description: str
    category: str = "Food & Preserves"
    price: int = 350
    unit: str = "Pack"


class StoryAnalysisResponse(BaseModel):
    explicit_skills: List[str]
    inferred_skills: List[InferredSkillItem]
    keywords: List[str]
    bio: str
    recommended_categories: List[str]
    suggested_service_product_title: Optional[str] = None
    launchpad_service_idea: Optional[LaunchpadServiceIdea] = None
    launchpad_product_idea: Optional[LaunchpadProductIdea] = None
    analysis_engine: str = "hybrid_nlp_engine"


class SeniorOnboardRequest(BaseModel):
    full_name: Optional[str] = None
    story_text: Optional[str] = None
    language: str = "en"
    skills: List[str] = []
    inferred_skills: List[InferredSkillItem] = []
    keywords: List[str] = []
    bio: str
    travel_radius: str = "5 km"
    locality: str = "Adyar"
    city: str = "Chennai"
    work_mode: str = "both" # home, online, offline, both
    availability: str = "Flexible"


class SeniorProfileResponse(BaseModel):
    id: Optional[str] = None
    user_id: str
    full_name: str
    bio: str
    skills: List[str]
    inferred_skills: List[InferredSkillItem]
    keywords: List[str]
    languages: List[str] = ["en"]
    travel_radius: str = "5 km"
    locality: str = "Adyar"
    city: str = "Chennai"
    work_mode: str = "both"
    availability: str = "Flexible"
    is_age_verified: bool = True
    earnings_total: float = 0.0
    completed_jobs_count: int = 0
    rating: Optional[float] = None
    review_count: int = 0


class SkillPassportBadge(BaseModel):
    id: str
    title: str
    icon: str
    description: str


class SkillPassportResponse(BaseModel):
    passport_id: str
    senior_id: str
    full_name: str
    locality: str
    city: str
    member_since: str
    is_age_verified: bool = True
    trust_score: Optional[float] = None
    review_count: int = 0
    completed_orders_count: int = 0
    completed_sessions_count: int = 0
    total_earnings: float = 0.0
    core_skills: List[str]
    inferred_skills: List[InferredSkillItem]
    keywords: List[str]
    badges: List[SkillPassportBadge]
    reviews: List[Dict[str, Any]] = []
    credential_hash: str


class SeniorTwinResponse(BaseModel):
    senior_id: str
    full_name: str
    locality: str
    city: str
    primary_skill: str
    skills: List[str]
    synergy_score: int
    collaboration_title: str
    collaboration_rationale: str
    matched_keywords: List[str]
