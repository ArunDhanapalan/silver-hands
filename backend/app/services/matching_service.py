import datetime
import logging
from typing import Dict, Any, List, Optional
from fastapi import HTTPException, status
from bson import ObjectId

from app.database import db_manager
from app.schemas.opportunity import (
    OpportunityResponse,
    SwipeActionRequest,
    SwipeActionResponse,
    ApplicationItemResponse
)

logger = logging.getLogger("silverhands.matching_service")

class MatchingService:
    def _opps_col(self):
        return db_manager.get_collection("opportunities")

    def _apps_col(self):
        return db_manager.get_collection("opportunity_applications")

    def _senior_col(self):
        return db_manager.get_collection("senior_profiles")

    async def get_opportunity_deck(self, user_payload: Dict[str, Any]) -> List[OpportunityResponse]:
        user_id = user_payload.get("sub")
        senior_doc = await self._senior_col().find_one({"user_id": user_id})
        
        senior_skills = [s.lower() for s in senior_doc.get("skills", [])] if senior_doc else ["accounting", "mentoring"]
        senior_languages = [l.lower() for l in senior_doc.get("languages", ["en", "ta"])] if senior_doc else ["en", "ta"]
        senior_radius_str = senior_doc.get("travel_radius", "5 km") if senior_doc else "5 km"
        
        # Parse radius num
        max_km = 5.0
        try:
            if "2" in senior_radius_str: max_km = 2.0
            elif "5" in senior_radius_str: max_km = 5.0
            elif "10" in senior_radius_str: max_km = 10.0
            elif "home" in senior_radius_str.lower() or "online" in senior_radius_str.lower(): max_km = 0.0
            elif "flexible" in senior_radius_str.lower(): max_km = 50.0
        except Exception:
            max_km = 5.0

        # Find existing swipes/applications
        apps_cursor = self._apps_col().find({"user_id": user_id})
        swiped_apps = await apps_cursor.to_list(100)
        swiped_ids = {a["opportunity_id"] for a in swiped_apps}

        # Fetch all active opportunities
        opps_cursor = self._opps_col().find({})
        all_opps = await opps_cursor.to_list(100)

        results: List[OpportunityResponse] = []

        for opp in all_opps:
            opp_id = str(opp.get("_id"))
            if opp_id in swiped_ids:
                continue # Already swiped

            opp_skills = [s.lower() for s in opp.get("required_skills", [])]
            dist_km = opp.get("distance_km", 0.0)
            work_mode = opp.get("work_mode", "offline")
            opp_languages = [l.lower() for l in opp.get("languages", ["en"])]

            # 1. Skill Match Score (0 - 55 pts)
            common_skills = [s for s in opp_skills if any(s in sk or sk in s for sk in senior_skills)]
            skill_score = (len(common_skills) / max(len(opp_skills), 1)) * 55

            # 2. Distance Score (0 - 25 pts)
            if work_mode == "online" or work_mode == "home" or max_km == 0.0:
                dist_score = 25
            elif dist_km <= max_km:
                dist_score = 25 - (dist_km / max(max_km, 1)) * 10
            else:
                dist_score = 5 # Deprioritized distance

            # 3. Language & Schedule (0 - 20 pts)
            lang_common = [l for l in opp_languages if l in senior_languages]
            lang_score = 15 if lang_common else 5
            sched_score = 5

            total_score = min(int(skill_score + dist_score + lang_score + sched_score), 99)
            if total_score < 40:
                total_score = 45 # Baseline minimum relevance

            # Generate Explainable Rationale
            matched_skill_names = [s.title() for s in common_skills]
            if matched_skill_names:
                explanation = f"{total_score}% Match: Matches your strengths in {', '.join(matched_skill_names[:2])} and {work_mode} schedule."
            else:
                explanation = f"{total_score}% Match: Suitable nearby opportunity in {opp.get('locality', 'Chennai')} matching your availability."

            results.append(OpportunityResponse(
                id=opp_id,
                title=opp["title"],
                type=opp["type"],
                posted_by_name=opp["posted_by_name"],
                company_id=opp.get("company_id"),
                description=opp["description"],
                required_skills=opp["required_skills"],
                locality=opp.get("locality", "Adyar"),
                city=opp.get("city", "Chennai"),
                distance_km=dist_km,
                work_mode=work_mode,
                schedule=opp.get("schedule", "Flexible"),
                pay_amount=opp["pay_amount"],
                pay_unit=opp.get("pay_unit", "month"),
                languages=opp.get("languages", ["en", "ta"]),
                is_festival_special=opp.get("is_festival_special", False),
                festival_tag=opp.get("festival_tag"),
                match_score=total_score,
                match_explanation=explanation
            ))

        # Sort deck by match_score desc
        results.sort(key=lambda x: x.match_score, reverse=True)
        return results

    async def record_swipe(self, user_payload: Dict[str, Any], opp_id: str, req: SwipeActionRequest) -> SwipeActionResponse:
        user_id = user_payload.get("sub")
        opp = await self._opps_col().find_one({"_id": opp_id})
        if not opp:
            raise HTTPException(status_code=404, detail="Opportunity not found")

        now = datetime.datetime.now(datetime.timezone.utc).isoformat()
        status_val = "accepted" if req.action in ["interested", "right"] else "passed"

        app_doc = {
            "user_id": user_id,
            "opportunity_id": opp_id,
            "opportunity_title": opp["title"],
            "type": opp["type"],
            "posted_by_name": opp["posted_by_name"],
            "pay_amount": opp["pay_amount"],
            "pay_unit": opp.get("pay_unit", "month"),
            "status": status_val,
            "match_score": 92,
            "match_explanation": "Opportunity accepted and placed in active work schedule.",
            "applied_at": now,
            "updated_at": now
        }

        await self._apps_col().update_one(
            {"user_id": user_id, "opportunity_id": opp_id},
            {"$set": app_doc},
            upsert=True
        )

        msg = "Opportunity marked as Interested! Added to your Active Work." if req.action == "interested" else "Opportunity passed."
        return SwipeActionResponse(
            success=True,
            opportunity_id=opp_id,
            action=req.action,
            message=msg
        )

    async def get_my_applications(self, user_payload: Dict[str, Any]) -> List[ApplicationItemResponse]:
        user_id = user_payload.get("sub")
        cursor = self._apps_col().find({"user_id": user_id, "status": {"$ne": "passed"}})
        apps = await cursor.to_list(100)
        
        return [
            ApplicationItemResponse(
                id=str(a.get("_id", a["opportunity_id"])),
                opportunity_id=a["opportunity_id"],
                opportunity_title=a["opportunity_title"],
                type=a.get("type", "job"),
                posted_by_name=a.get("posted_by_name", "Local Business"),
                pay_amount=a.get("pay_amount", 0),
                pay_unit=a.get("pay_unit", "month"),
                status=a.get("status", "applied"),
                match_score=a.get("match_score", 90),
                match_explanation=a.get("match_explanation", "Active opportunity matching your profile."),
                applied_at=a.get("applied_at", "")
            ) for a in apps
        ]

    async def reset_deck_swipes(self, user_payload: Dict[str, Any]) -> Dict[str, Any]:
        user_id = user_payload.get("sub")
        await self._apps_col().delete_many({"user_id": user_id, "status": "passed"})
        return {"success": True, "message": "Passed opportunities restored to deck."}

    async def create_opportunity(self, user_payload: Dict[str, Any], req: Any) -> Dict[str, Any]:
        user_id = user_payload.get("sub")
        users_col = db_manager.get_collection("users")
        user_doc = await users_col.find_one({"_id": user_id})
        company_name = user_doc.get("company_name") or user_doc.get("full_name", "Local Employer") if user_doc else "Local Employer"
        
        now = datetime.datetime.now(datetime.timezone.utc).isoformat()
        opp_doc = {
            "title": req.title,
            "description": req.description,
            "type": req.type,
            "category": getattr(req, "category", "General"),
            "posted_by_name": company_name,
            "company_id": user_id,
            "required_skills": req.required_skills,
            "locality": req.locality,
            "city": req.city,
            "distance_km": 2.5,
            "work_mode": req.work_mode,
            "schedule": req.schedule,
            "pay_amount": req.pay_amount,
            "pay_unit": req.pay_unit,
            "languages": req.languages,
            "is_festival_special": req.is_festival_special,
            "festival_tag": req.festival_tag,
            "created_at": now
        }
        res = await self._opps_col().insert_one(opp_doc)
        opp_doc["id"] = str(res.inserted_id)
        return opp_doc

    async def get_company_postings(self, user_payload: Dict[str, Any]) -> List[Dict[str, Any]]:
        user_id = user_payload.get("sub")
        cursor = self._opps_col().find({"company_id": user_id})
        opps = await cursor.to_list(100)
        
        if not opps:
            # If no custom postings yet, return all opportunities with company tag
            cursor = self._opps_col().find({})
            opps = await cursor.to_list(100)

        # For each opportunity, find real matching registered senior candidates in MongoDB
        seniors_cursor = self._senior_col().find({})
        all_seniors = await seniors_cursor.to_list(100)

        results = []
        for opp in opps:
            opp_id = str(opp.get("_id"))
            req_skills = [s.lower() for s in opp.get("required_skills", [])]
            opp_city = opp.get("city", "Chennai").lower()

            matched_seniors = []
            for sr in all_seniors:
                sr_skills = [s.lower() for s in sr.get("skills", [])]
                common = [s for s in req_skills if any(s in sk or sk in s for sk in sr_skills)]
                
                # Base score + skill match
                base_score = 60
                skill_bonus = int((len(common) / max(len(req_skills), 1)) * 35) if req_skills else 25
                city_bonus = 5 if sr.get("city", "").lower() == opp_city else 0
                total_score = min(base_score + skill_bonus + city_bonus, 98)

                if total_score >= 65:
                    matched_seniors.append({
                        "senior_id": str(sr.get("_id")),
                        "full_name": sr.get("full_name", "Senior Guru"),
                        "locality": sr.get("locality", "Adyar"),
                        "city": sr.get("city", "Chennai"),
                        "skills": sr.get("skills", []),
                        "match_score": total_score,
                        "bio": sr.get("bio", "Experienced professional ready to contribute."),
                        "is_age_verified": True
                    })

            # Sort matched candidates by score desc
            matched_seniors.sort(key=lambda x: x["match_score"], reverse=True)

            results.append({
                "id": opp_id,
                "title": opp["title"],
                "description": opp["description"],
                "type": opp.get("type", "job"),
                "locality": opp.get("locality", "Adyar"),
                "city": opp.get("city", "Chennai"),
                "work_mode": opp.get("work_mode", "offline"),
                "pay_amount": opp.get("pay_amount", 15000),
                "pay_unit": opp.get("pay_unit", "month"),
                "required_skills": opp.get("required_skills", []),
                "matched_candidates": matched_seniors
            })

        return results

matching_service = MatchingService()
