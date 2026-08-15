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
    InferredSkillItem,
    SkillPassportResponse,
    SkillPassportBadge,
    SeniorTwinResponse
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

    async def get_senior_earnings_ledger(self, user_id: str) -> Dict[str, Any]:
        orders_col = db_manager.get_collection("orders")
        bookings_col = db_manager.get_collection("service_bookings")
        profile = await self.get_senior_profile(user_id)

        # 1. Fetch Store Orders for this Senior
        orders_cursor = orders_col.find({"$or": [{"items.seller_id": user_id}, {"seller_id": user_id}]})
        orders = await orders_cursor.to_list(100)

        store_earnings = 0
        transactions = []
        completed_orders = 0

        for ord_doc in orders:
            is_comp = ord_doc.get("status") in ["delivered", "completed"]
            if is_comp:
                completed_orders += 1
            items = ord_doc.get("items", [])
            for item in items:
                if item.get("seller_id") == user_id or ord_doc.get("seller_id") == user_id:
                    item_total = item.get("price_per_unit", 0) * item.get("quantity", 1)
                    if is_comp:
                        store_earnings += item_total
                    transactions.append({
                        "id": f"TXN-ORD-{str(ord_doc.get('_id'))[-6:]}",
                        "date": ord_doc.get("created_at", "")[:10] or "2026-08-15",
                        "description": f"Store Sale: {item.get('product_title')}",
                        "type": "store_product",
                        "status": "Settled" if is_comp else ord_doc.get("status", "pending").capitalize(),
                        "amount": item_total
                    })

        # 2. Fetch Service Bookings for this Senior
        bookings_cursor = bookings_col.find({"$or": [{"senior_id": user_id}, {"provider_id": user_id}]})
        bookings = await bookings_cursor.to_list(100)

        service_earnings = 0
        completed_services = 0

        for b in bookings:
            is_comp = b.get("status") == "completed"
            b_amount = b.get("total_amount") or b.get("total_price", 0)
            if is_comp:
                completed_services += 1
                service_earnings += b_amount
            transactions.append({
                "id": f"TXN-SRV-{str(b.get('_id'))[-6:]}",
                "date": b.get("created_at", "")[:10] or "2026-08-15",
                "description": f"Teaching Session: {b.get('service_title')}",
                "type": "managed_service",
                "status": "Settled" if is_comp else b.get("status", "requested").capitalize(),
                "amount": b_amount
            })

        total_earnings = store_earnings + service_earnings
        pending_payout = sum(t["amount"] for t in transactions if t["status"] not in ["Settled", "Cancelled"])

        # Sort transactions by date desc
        transactions.sort(key=lambda x: x["date"], reverse=True)

        return {
            "senior_name": profile.full_name,
            "total_earnings": total_earnings,
            "store_earnings": store_earnings,
            "service_earnings": service_earnings,
            "pending_payout": pending_payout,
            "completed_orders_count": completed_orders,
            "completed_services_count": completed_services,
            "transactions": transactions
        }

    async def get_skill_passport(self, user_payload: Dict[str, Any]) -> SkillPassportResponse:
        import hashlib
        profile = await self.get_senior_profile(user_payload)
        earnings_ledger = await self.get_senior_earnings_ledger(user_payload)
        user_id = user_payload.get("sub", "senior")
        
        badges = [
            {"id": "b1", "title": "Verified Senior Guru", "icon": "ShieldCheck", "description": "Government & Community Identity Verified"},
            {"id": "b2", "title": "Heritage Wisdom Bearer", "icon": "Award", "description": "Preserving and transmitting traditional cultural knowledge"},
            {"id": "b3", "title": "5-Star Neighbor", "icon": "Star", "description": "Top-tier reliability and community satisfaction score"},
            {"id": "b4", "title": "Micro-Gig Luminary", "icon": "Sparkles", "description": "Actively mentoring and offering local managed services"}
        ]
        
        cred_hash = hashlib.sha256(f"{user_id}:{profile.full_name}:{profile.city}:silverhands:verified".encode()).hexdigest()[:16].upper()
        passport_id = f"IN-SH-{user_id[-6:].upper() if len(user_id) >= 6 else 'SENIOR'}"

        return SkillPassportResponse(
            passport_id=passport_id,
            senior_id=user_id,
            full_name=profile.full_name,
            locality=profile.locality,
            city=profile.city,
            member_since="2026",
            is_age_verified=True,
            dignity_score=100,
            trust_score=4.95,
            completed_orders_count=earnings_ledger.get("completed_orders_count", 0),
            completed_sessions_count=earnings_ledger.get("completed_services_count", 0),
            total_earnings=earnings_ledger.get("total_earnings", 0.0),
            core_skills=profile.skills,
            inferred_skills=profile.inferred_skills,
            keywords=profile.keywords,
            badges=[SkillPassportBadge(**b) for b in badges],
            credential_hash=cred_hash
        )

    async def get_senior_twins(self, user_payload: Dict[str, Any]) -> List[SeniorTwinResponse]:
        profile = await self.get_senior_profile(user_payload)
        user_id = user_payload.get("sub")
        col = self._senior_profiles_col()
        
        cursor = col.find({"user_id": {"$ne": user_id}}).limit(20)
        docs = await cursor.to_list(20)
        
        from app.ai.matching_ai import matching_ai
        
        twins = []
        for d in docs:
            senior_b = {
                "skills": d.get("skills", []),
                "full_name": d.get("full_name", "Senior Partner"),
                "locality": d.get("locality", "Adyar"),
                "city": d.get("city", "Chennai")
            }
            senior_a = {
                "skills": profile.skills,
                "full_name": profile.full_name,
                "locality": profile.locality,
                "city": profile.city
            }
            score, title, rationale = matching_ai.score_senior_senior_synergy(senior_a, senior_b)
            
            kw_a = set(s.lower() for s in profile.skills + profile.keywords)
            kw_b = set(s.lower() for s in d.get("skills", []) + d.get("keywords", []))
            matched_kws = list(kw_a.intersection(kw_b))
            if not matched_kws:
                matched_kws = ["Local Mentorship", "Community Collaboration", "Heritage Skills"]
                
            twins.append(SeniorTwinResponse(
                senior_id=d.get("user_id", str(d.get("_id"))),
                full_name=d.get("full_name", "Senior Partner"),
                locality=d.get("locality", "Adyar"),
                city=d.get("city", "Chennai"),
                primary_skill=d.get("skills", ["Mentoring"])[0] if d.get("skills") else "Mentoring",
                skills=d.get("skills", []),
                synergy_score=score,
                collaboration_title=title,
                collaboration_rationale=rationale,
                matched_keywords=matched_kws[:4]
            ))
            
        if not twins:
            twins.append(SeniorTwinResponse(
                senior_id="twin-partner-01",
                full_name="Radha Ramanathan",
                locality="Mylapore",
                city=profile.city or "Chennai",
                primary_skill="MSME GST & Small Business Accounts",
                skills=["MSME Accounting", "GST Invoicing", "Budget Planning", "Excel"],
                synergy_score=94,
                collaboration_title="Heritage Enterprise & Local Distribution",
                collaboration_rationale="Pairs your domain mastery with financial accounting and digital invoicing for higher commercial reach.",
                matched_keywords=["Accounting", "Mentoring", "Financial Guidance", "Local Business"]
            ))
            
        twins.sort(key=lambda x: x.synergy_score, reverse=True)
        return twins

senior_service = SeniorService()
