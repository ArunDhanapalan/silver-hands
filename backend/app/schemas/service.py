from typing import Optional, List
from pydantic import BaseModel, Field

class ServiceCreateRequest(BaseModel):
    title: str = Field(..., min_length=3)
    category: str = "Education & Learning" # Education & Learning, Knowledge & Mentoring, Home & Practical Skills, Culture & Tradition, Family & Care, Language & Academics
    subcategory: str = "Language Tuition" # Language Tuition, Academic Tutoring, Bookkeeping, Culinary, Tailoring, Gardening
    description: str = Field(..., min_length=10)
    mode: str = "online" # online, offline, both
    duration_mins: int = 45
    price_per_session: int = Field(..., gt=0)
    languages: List[str] = ["en", "ta"]
    target_audience: str = "All Ages / Beginners"
    locality: str = "Adyar"
    city: str = "Chennai"

class AISuggestServiceRequest(BaseModel):
    raw_idea: str

class AISuggestServiceResponse(BaseModel):
    title: str
    description: str
    category: str
    subcategory: str
    mode: str
    suggested_price: int
    price_per_session: Optional[int] = None
    duration_mins: int
    target_audience: str
    deliverables: List[str] = []
    engine: Optional[str] = "gemini_live"

class ServiceReviewItem(BaseModel):
    customer_id: str
    customer_name: str
    rating: int
    comment: str
    created_at: str

class ServiceResponse(BaseModel):
    id: str
    senior_id: str
    senior_name: str
    senior_locality: str
    senior_city: str
    senior_rating: float = 4.95
    is_age_verified: bool = True
    title: str
    category: str
    subcategory: str
    description: str
    mode: str
    duration_mins: int
    price_per_session: int
    languages: List[str]
    target_audience: str
    locality: str
    city: str
    total_sessions_conducted: int = 12
    rating: float = 4.95
    total_reviews: int = 1
    reviews: List[ServiceReviewItem] = []
    created_at: str

class BookingCreateRequest(BaseModel):
    service_id: str
    student_name: str
    student_age_group: str = "Child (Age 6-14)" # Child, Teen, Adult, Senior
    preferred_days: List[str] = ["Monday", "Wednesday", "Friday"]
    preferred_time_slot: str = "Evening (5:00 PM – 6:00 PM)"
    sessions_count: int = 1
    special_goals: Optional[str] = "Conversational basics and pronunciation"
    contact_phone: str = "+91 98840 56789"
    contact_email: Optional[str] = None

class BookingResponse(BaseModel):
    id: str
    booking_reference: str
    service_id: str
    service_title: str
    category: str
    mode: str
    customer_id: str
    customer_name: str
    customer_phone: str
    senior_id: str
    senior_name: str
    student_name: str
    student_age_group: str
    scheduled_slot: str
    sessions_count: int
    completed_sessions_count: int = 0
    total_amount: int
    meeting_link: Optional[str] = None
    status: str # requested, accepted, scheduled, in_progress, completed, cancelled
    review_rating: Optional[int] = None
    review_comment: Optional[str] = None
    created_at: str
    updated_at: str

class BookingStatusUpdateRequest(BaseModel):
    status: str = Field(..., pattern="^(accepted|scheduled|in_progress|completed|cancelled)$")
    meeting_link: Optional[str] = None

class MarkSessionProgressRequest(BaseModel):
    completed_sessions: int = Field(..., ge=0)

class BookingReviewRequest(BaseModel):
    rating: int = Field(..., ge=1, le=5)
    comment: str = Field(..., min_length=3)
