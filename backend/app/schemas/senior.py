from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field

class StoryAnalysisRequest(BaseModel):
    story_text: str = Field(..., min_length=2)
    language: str = "en"

class InferredSkillItem(BaseModel):
    skill: str
    reason: str

class StoryAnalysisResponse(BaseModel):
    explicit_skills: List[str]
    inferred_skills: List[InferredSkillItem]
    keywords: List[str]
    bio: str
    recommended_categories: List[str]
    suggested_service_product_title: Optional[str] = None
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
    rating: float = 5.0
    review_count: int = 0
