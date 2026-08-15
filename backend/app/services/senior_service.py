import datetime
import logging
from typing import Optional, Dict, Any, List
from fastapi import HTTPException, status
from bson import ObjectId

from app.database import db_manager
from app.ai.skill_extraction import analyze_life_story
from app.schemas.senior import (
    StoryAnalysisRequest,
    StoryAnalysisResponse,
    SeniorOnboardRequest,
    SeniorProfileResponse,
    InferredSkillItem
)

logger = logging.getLogger("silverhands.senior_service")

class SeniorService:
    def _senior_profiles_col(self):
        return db_manager.get_collection("senior_profiles")

    def _users_col(self):
        return db_manager.get_collection("users")

    async def extract_skills_from_story(self, req: StoryAnalysisRequest) -> StoryAnalysisResponse:
        result = await analyze_life_story(req.story_text, req.language)
        inferred = [InferredSkillItem(**item) for item in result.get("inferred_skills", [])]
        return StoryAnalysisResponse(
            explicit_skills=result.get("explicit_skills", []),
            inferred_skills=inferred,
            keywords=result.get("keywords", []),
            bio=result.get("bio", ""),
            recommended_categories=result.get("recommended_categories", []),
            suggested_service_product_title=result.get("suggested_service_product_title"),
            analysis_engine=result.get("analysis_engine", "hybrid_nlp_engine")
        )

    async def save_senior_onboarding(self, user_payload: Dict[str, Any], req: SeniorOnboardRequest) -> SeniorProfileResponse:
        user_id = user_payload.get("sub")
        col = self._senior_profiles_col()
        now = datetime.datetime.now(datetime.timezone.utc).isoformat()

        # Update User doc if full_name changed
        if req.full_name:
            users_col = self._users_col()
            await users_col.update_one(
                {"_id": user_id},
                {"$set": {"full_name": req.full_name, "city": req.city, "locality": req.locality}}
            )

        existing_profile = await col.find_one({"user_id": user_id})
        
        doc = {
            "user_id": user_id,
            "full_name": req.full_name or user_payload.get("full_name", "Senior Citizen"),
            "bio": req.bio,
            "skills": req.skills,
            "inferred_skills": [item.model_dump() for item in req.inferred_skills],
            "keywords": req.keywords,
            "languages": [req.language, "en"],
            "travel_radius": req.travel_radius,
            "locality": req.locality,
            "city": req.city,
            "work_mode": req.work_mode,
            "availability": req.availability,
            "is_age_verified": True,
            "earnings_total": existing_profile.get("earnings_total", 0.0) if existing_profile else 0.0,
            "completed_jobs_count": existing_profile.get("completed_jobs_count", 0) if existing_profile else 0,
            "rating": existing_profile.get("rating", 5.0) if existing_profile else 5.0,
            "review_count": existing_profile.get("review_count", 0) if existing_profile else 0,
            "updated_at": now
        }

        if existing_profile:
            await col.update_one({"user_id": user_id}, {"$set": doc})
            doc["_id"] = str(existing_profile.get("_id"))
        else:
            doc["created_at"] = now
            res = await col.insert_one(doc)
            doc["_id"] = str(res.inserted_id)

        return SeniorProfileResponse(
            id=str(doc.get("_id")),
            user_id=user_id,
            full_name=doc["full_name"],
            bio=doc["bio"],
            skills=doc["skills"],
            inferred_skills=[InferredSkillItem(**item) for item in doc["inferred_skills"]],
            keywords=doc["keywords"],
            languages=doc["languages"],
            travel_radius=doc["travel_radius"],
            locality=doc["locality"],
            city=doc["city"],
            work_mode=doc["work_mode"],
            availability=doc["availability"],
            is_age_verified=doc["is_age_verified"],
            earnings_total=doc["earnings_total"],
            completed_jobs_count=doc["completed_jobs_count"],
            rating=doc["rating"],
            review_count=doc["review_count"]
        )

    async def get_senior_profile(self, user_id: str) -> SeniorProfileResponse:
        col = self._senior_profiles_col()
        doc = await col.find_one({"user_id": user_id})
        if not doc:
            # Check users collection
            users_col = self._users_col()
            user_doc = await users_col.find_one({"_id": user_id})
            if not user_doc:
                raise HTTPException(status_code=404, detail="Senior profile not found")
            
            # Create default profile
            now = datetime.datetime.now(datetime.timezone.utc).isoformat()
            default_doc = {
                "user_id": user_id,
                "full_name": user_doc.get("full_name", "Senior Practitioner"),
                "bio": "Experienced practitioner ready to share practical knowledge and mentor locally.",
                "skills": ["Mentoring", "General Consulting"],
                "inferred_skills": [],
                "keywords": ["Mentoring", "Local Support"],
                "languages": ["en"],
                "travel_radius": "5 km",
                "locality": user_doc.get("locality", "Adyar"),
                "city": user_doc.get("city", "Chennai"),
                "work_mode": "both",
                "availability": "Flexible",
                "is_age_verified": True,
                "earnings_total": 0.0,
                "completed_jobs_count": 0,
                "rating": 5.0,
                "review_count": 0,
                "created_at": now
            }
            res = await col.insert_one(default_doc)
            default_doc["_id"] = str(res.inserted_id)
            doc = default_doc

        return SeniorProfileResponse(
            id=str(doc.get("_id")),
            user_id=user_id,
            full_name=doc["full_name"],
            bio=doc["bio"],
            skills=doc["skills"],
            inferred_skills=[InferredSkillItem(**item) for item in doc.get("inferred_skills", [])],
            keywords=doc["keywords"],
            languages=doc.get("languages", ["en"]),
            travel_radius=doc.get("travel_radius", "5 km"),
            locality=doc.get("locality", "Adyar"),
            city=doc.get("city", "Chennai"),
            work_mode=doc.get("work_mode", "both"),
            availability=doc.get("availability", "Flexible"),
            is_age_verified=doc.get("is_age_verified", True),
            earnings_total=doc.get("earnings_total", 0.0),
            completed_jobs_count=doc.get("completed_jobs_count", 0),
            rating=doc.get("rating", 5.0),
            review_count=doc.get("review_count", 0)
        )

senior_service = SeniorService()
