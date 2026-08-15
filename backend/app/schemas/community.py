from typing import Optional, List
from pydantic import BaseModel, Field

class CommentCreateRequest(BaseModel):
    content: str = Field(..., min_length=2)

class CommentResponse(BaseModel):
    id: str
    post_id: str
    user_id: str
    author_name: str
    author_role: str
    content: str
    created_at: str

class PostCreateRequest(BaseModel):
    title: str = Field(..., min_length=3)
    content: str = Field(..., min_length=10)
    type: str = Field(..., pattern="^(need|offer|collaboration|event|discussion)$")
    tags: List[str] = []
    locality: str = "Adyar"
    city: str = "Chennai"

class PostResponse(BaseModel):
    id: str
    user_id: str
    author_name: str
    author_role: str
    is_age_verified: bool = False
    title: str
    content: str
    type: str # need, offer, collaboration, event, discussion
    tags: List[str]
    locality: str
    city: str
    comments_count: int = 0
    likes_count: int = 0
    demand_signal_generated: bool = False
    matched_skills: List[str] = []
    created_at: str

class CollaborationPairResponse(BaseModel):
    id: str
    senior_a_id: str
    senior_a_name: str
    senior_a_skills: List[str]
    senior_b_id: str
    senior_b_name: str
    senior_b_skills: List[str]
    city: str
    locality: str
    venture_title: str
    ai_synergy_reason: str
    status: str = "suggested" # suggested, connected

class ConnectCollaborationRequest(BaseModel):
    target_senior_id: str
    venture_title: str
    message: Optional[str] = None

class DemandSignalResponse(BaseModel):
    id: str
    post_id: str
    city: str
    locality: str
    category: str
    skills_demanded: List[str]
    urgency: str = "Normal"
    created_at: str
