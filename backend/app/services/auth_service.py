import datetime
import logging
from typing import Optional, Dict, Any
from fastapi import HTTPException, status
from bson import ObjectId

from app.database import db_manager
from app.security import hash_password, verify_password, create_access_token
from app.schemas.auth import UserRegisterRequest, UserLoginRequest, UserResponse, TokenResponse

logger = logging.getLogger("silverhands.auth_service")

class AuthService:
    def __init__(self):
        pass

    def _users_col(self):
        return db_manager.get_collection("users")

    def _senior_profiles_col(self):
        return db_manager.get_collection("senior_profiles")

    async def register_user(self, req: UserRegisterRequest) -> TokenResponse:
        users = self._users_col()
        
        # Check existing email
        existing = await users.find_one({"email": req.email.lower()})
        if existing:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="A user with this email address is already registered."
            )

        if req.role == "company" and not req.gstin:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="GSTIN number is required for company / employer registration."
            )

        now = datetime.datetime.now(datetime.timezone.utc).isoformat()
        
        # Mask Aadhaar if provided
        masked_aadhaar = None
        if req.aadhaar_number:
            clean_aadhaar = req.aadhaar_number.replace(" ", "").replace("-", "")
            if len(clean_aadhaar) >= 4:
                masked_aadhaar = f"XXXX-XXXX-{clean_aadhaar[-4:]}"
            else:
                masked_aadhaar = "XXXX-XXXX-Verified"

        user_doc = {
            "email": req.email.lower(),
            "hashed_password": hash_password(req.password),
            "full_name": req.full_name,
            "role": req.role,
            "phone": req.phone,
            "city": req.city,
            "locality": req.locality,
            "preferred_language": req.preferred_language or "en",
            "is_age_verified": True if req.role == "senior" else False,
            "gstin": req.gstin.strip().upper() if req.role == "company" and req.gstin else None,
            "company_name": req.company_name or req.full_name if req.role == "company" else None,
            "masked_aadhaar": masked_aadhaar,
            "created_at": now,
            "updated_at": now
        }

        insert_res = await users.insert_one(user_doc)
        user_id = str(insert_res.inserted_id)
        user_doc["_id"] = user_id

        # If Senior, create base senior profile
        if req.role == "senior":
            senior_profiles = self._senior_profiles_col()
            await senior_profiles.insert_one({
                "user_id": user_id,
                "bio": "Experienced professional ready to share skills and contribute locally.",
                "skills": ["Communication", "Mentoring"],
                "inferred_skills": [],
                "keywords": ["Local Support", "Mentoring"],
                "languages": ["en", "ta"],
                "travel_radius": "5 km",
                "locality": req.locality,
                "city": req.city,
                "work_mode": "both", # online, offline, both
                "is_age_verified": True,
                "verification_ref": "VERIFIED-SR-2026",
                "created_at": now
            })

        token_data = {
            "sub": user_id,
            "email": user_doc["email"],
            "role": user_doc["role"],
            "full_name": user_doc["full_name"],
            "city": user_doc["city"]
        }
        access_token = create_access_token(token_data)

        user_resp = UserResponse(
            id=user_id,
            email=user_doc["email"],
            full_name=user_doc["full_name"],
            role=user_doc["role"],
            phone=user_doc.get("phone"),
            city=user_doc["city"],
            locality=user_doc["locality"],
            is_age_verified=user_doc["is_age_verified"],
            gstin=user_doc.get("gstin"),
            created_at=now
        )

        return TokenResponse(access_token=access_token, user=user_resp)

    async def login_user(self, req: UserLoginRequest) -> TokenResponse:
        users = self._users_col()
        user_doc = await users.find_one({"email": req.email.lower()})
        if not user_doc or not verify_password(req.password, user_doc.get("hashed_password", "")):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid email or password. Please check your credentials."
            )

        user_id = str(user_doc["_id"])
        token_data = {
            "sub": user_id,
            "email": user_doc["email"],
            "role": user_doc["role"],
            "full_name": user_doc["full_name"],
            "city": user_doc.get("city", "Chennai")
        }
        access_token = create_access_token(token_data)

        user_resp = UserResponse(
            id=user_id,
            sub=user_id,
            email=user_doc["email"],
            full_name=user_doc["full_name"],
            role=user_doc["role"],
            phone=user_doc.get("phone"),
            city=user_doc.get("city", "Chennai"),
            locality=user_doc.get("locality", "Adyar"),
            is_age_verified=user_doc.get("is_age_verified", False),
            gstin=user_doc.get("gstin"),
            created_at=user_doc.get("created_at")
        )

        return TokenResponse(access_token=access_token, user=user_resp)

    async def get_current_user_profile(self, user_payload: Dict[str, Any]) -> UserResponse:
        users = self._users_col()
        user_id = user_payload.get("sub")
        user_doc = await users.find_one({"_id": user_id})
        if not user_doc:
            # Try ObjectId matching if live Mongo
            try:
                user_doc = await users.find_one({"_id": ObjectId(user_id)})
            except Exception:
                pass

        if not user_doc:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User account not found")

        uid = str(user_doc["_id"])
        return UserResponse(
            id=uid,
            sub=uid,
            email=user_doc["email"],
            full_name=user_doc["full_name"],
            role=user_doc["role"],
            phone=user_doc.get("phone"),
            city=user_doc.get("city", "Chennai"),
            locality=user_doc.get("locality", "Adyar"),
            is_age_verified=user_doc.get("is_age_verified", False),
            gstin=user_doc.get("gstin"),
            created_at=user_doc.get("created_at")
        )

auth_service = AuthService()
