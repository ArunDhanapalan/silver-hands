from typing import Optional, List
from pydantic import BaseModel, EmailStr, Field

class UserRegisterRequest(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=6)
    full_name: str = Field(..., min_length=2)
    role: str = Field(..., pattern="^(senior|company|customer)$")
    phone: Optional[str] = None
    city: str = "Chennai"
    locality: str = "Adyar"
    preferred_language: Optional[str] = "en"
    
    # Company specific
    gstin: Optional[str] = None
    company_name: Optional[str] = None
    
    # Senior / Customer specific
    age: Optional[int] = None
    aadhaar_number: Optional[str] = None
    id_doc_type: Optional[str] = "Aadhaar"

class UserLoginRequest(BaseModel):
    email: EmailStr
    password: str

class UserResponse(BaseModel):
    id: str
    email: str
    full_name: str
    role: str
    phone: Optional[str] = None
    city: str
    locality: str
    preferred_language: Optional[str] = "en"
    is_age_verified: bool = False
    gstin: Optional[str] = None
    masked_aadhaar: Optional[str] = None
    created_at: Optional[str] = None

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse
