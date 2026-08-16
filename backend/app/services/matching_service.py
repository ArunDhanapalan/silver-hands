import datetime
import logging
import random
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
from app.services.location_utils import (
    parse_radius_km,
    compute_distance_km_async,
    is_within_radius_async,
    get_coords_async,
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
        senior_locality = senior_doc.get("locality", "") if senior_doc else ""
        senior_city = senior_doc.get("city", "Chennai") if senior_doc else "Chennai"

        # Parse travel radius using shared utility
        max_km = parse_radius_km(senior_radius_str)

        # Find existing swipes/applications
        apps_cursor = self._apps_col().find({"user_id": user_id})
        swiped_apps = await apps_cursor.to_list(100)
        swiped_ids = {a["opportunity_id"] for a in swiped_apps}

        # Fetch all active opportunities
        opps_cursor = self._opps_col().find({})
        all_opps = await opps_cursor.to_list(100)

        # Pre-resolve senior coordinates (stored or dynamically geocoded)
        senior_coords = None
        if senior_doc and "latitude" in senior_doc and "longitude" in senior_doc:
            senior_coords = (float(senior_doc["latitude"]), float(senior_doc["longitude"]))
        else:
            senior_coords = await get_coords_async(senior_locality, senior_city)

        results: List[OpportunityResponse] = []

        for opp in all_opps:
            opp_id = str(opp.get("_id"))
            if opp_id in swiped_ids:
                continue  # Already swiped

            opp_skills = [s.lower() for s in opp.get("required_skills", [])]
            work_mode = opp.get("work_mode", "offline")
            opp_locality = opp.get("locality", "")
            opp_city = opp.get("city", "Chennai")
            opp_languages = [l.lower() for l in opp.get("languages", ["en"])]

            opp_coords = None
            if "latitude" in opp and "longitude" in opp:
                opp_coords = (float(opp["latitude"]), float(opp["longitude"]))

            # ---- Distance-based filtering ----------------------------------------
            is_offline = work_mode in ("offline", "both")
            is_online  = work_mode in ("online", "home")

            if is_offline and not is_online:
                # Pure in-person/offline: filter by senior's travel radius
                within_rad = await is_within_radius_async(
                    senior_locality, senior_city,
                    opp_locality, opp_city,
                    max_km,
                    senior_coords=senior_coords,
                    item_coords=opp_coords
                )
                if not within_rad:
                    continue  # Too far – skip this gig

            # Compute actual distance for scoring & display
            dist_km: float
            if is_online:
                dist_km = 0.0
            else:
                computed = await compute_distance_km_async(
                    senior_locality, senior_city,
                    opp_locality, opp_city,
                    from_coords=senior_coords,
                    to_coords=opp_coords
                )
                dist_km = computed if computed is not None else opp.get("distance_km", 2.5)
            # -----------------------------------------------------------------------

            # 1. Skill Match Score (0 – 55 pts)
            common_skills = [s for s in opp_skills if any(s in sk or sk in s for sk in senior_skills)]
            skill_score = (len(common_skills) / max(len(opp_skills), 1)) * 55

            # 2. Distance Score (0 – 25 pts)
            if is_online or max_km == 0.0:
                dist_score = 25
            else:
                dist_score = 25 - (dist_km / max(max_km, 1)) * 10
                dist_score = max(dist_score, 5)  # floor at 5

            # 3. Language & Schedule (0 – 20 pts)
            lang_common = [l for l in opp_languages if l in senior_languages]
            lang_score = 15 if lang_common else 5
            sched_score = 5

            total_score = min(int(skill_score + dist_score + lang_score + sched_score), 99)
            if total_score < 40:
                total_score = 45  # Baseline minimum relevance

            # Explainable rationale
            matched_skill_names = [s.title() for s in common_skills]
            dist_label = f"{dist_km:.1f} km away" if dist_km > 0 else "Remote"
            if matched_skill_names:
                explanation = (
                    f"{total_score}% Match: Aligns with your {', '.join(matched_skill_names[:2])} skills "
                    f"({dist_label}, {work_mode} mode)."
                )
            else:
                explanation = (
                    f"{total_score}% Match: Nearby opportunity in {opp_locality or opp_city} "
                    f"({dist_label}) matching your availability."
                )

            results.append(OpportunityResponse(
                id=opp_id,
                title=opp["title"],
                type=opp["type"],
                posted_by_name=opp["posted_by_name"],
                company_id=opp.get("company_id"),
                description=opp["description"],
                required_skills=opp["required_skills"],
                locality=opp_locality,
                city=opp_city,
                distance_km=round(dist_km, 2),
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

    def _build_id_filter(self, id_str: str) -> Dict[str, Any]:
        filters = [{"_id": id_str}, {"id": id_str}]
        if ObjectId.is_valid(id_str):
            filters.append({"_id": ObjectId(id_str)})
        return {"$or": filters}

    async def record_swipe(self, user_payload: Dict[str, Any], opp_id: str, req: SwipeActionRequest) -> SwipeActionResponse:
        user_id = user_payload.get("sub")
        opp = await self._opps_col().find_one(self._build_id_filter(opp_id))
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
        cursor = self._apps_col().find({"user_id": user_id, "status": {"$nin": ["passed", "cancelled"]}})
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
                interview_link=a.get("interview_link"),
                interview_date=a.get("interview_date"),
                applied_at=a.get("applied_at", "")
            ) for a in apps
        ]

    async def invite_candidate(self, user_payload: Dict[str, Any], req: Any) -> Dict[str, Any]:
        company_name = user_payload.get("full_name") or user_payload.get("company_name") or "Corporate Employer"
        now = datetime.datetime.now(datetime.timezone.utc).isoformat()
        room_code = random.randint(100000, 999999)
        meeting_link = f"https://meet.silverhands.in/interview-{room_code}"

        app_doc = {
            "user_id": req.senior_id,
            "opportunity_id": req.opportunity_id,
            "opportunity_title": req.role_title,
            "type": "job",
            "posted_by_name": company_name,
            "pay_amount": 18000,
            "pay_unit": "month",
            "status": "interview_invited",
            "match_score": 95,
            "match_explanation": f"Official interview invitation received from {company_name}: {req.message}",
            "interview_link": meeting_link,
            "interview_date": req.interview_date or "Next Available Slot",
            "applied_at": now,
            "updated_at": now
        }

        await self._apps_col().update_one(
            {"user_id": req.senior_id, "opportunity_id": req.opportunity_id},
            {"$set": app_doc},
            upsert=True
        )
        return {
            "success": True, 
            "message": f"Interview invitation sent with video link {meeting_link}",
            "interview_link": meeting_link
        }

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

        # Geocode opportunity locality to store lat/lng at creation time
        coords = await get_coords_async(req.locality, req.city)

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
            "latitude": coords[0] if coords else None,
            "longitude": coords[1] if coords else None,
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
        opp_doc["_id"] = str(res.inserted_id)
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
            req_skills = [s.lower().strip() for s in opp.get("required_skills", [])]
            opp_city = opp.get("city", "Chennai").lower()

            matched_seniors = []
            for sr in all_seniors:
                sr_skills = [s.lower().strip() for s in sr.get("skills", [])]
                # Check actual intersection
                common = [s for s in req_skills if any(s in sk or sk in s for sk in sr_skills)]
                
                # CRITICAL (Issue #8): Only match if senior actually has matching skills!
                if not common and req_skills:
                    continue

                skill_ratio = len(common) / max(len(req_skills), 1) if req_skills else 0.5
                skill_score = int(skill_ratio * 75)
                same_city = sr.get("city", "").lower() == opp_city
                city_bonus = 15 if same_city else 5
                total_score = min(skill_score + city_bonus + 10, 98)

                if total_score >= 50:
                    matched_seniors.append({
                        "senior_id": sr.get("user_id") or str(sr.get("_id")),
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
                "category": opp.get("category", "General"),
                "locality": opp.get("locality", "Adyar"),
                "city": opp.get("city", "Chennai"),
                "work_mode": opp.get("work_mode", "offline"),
                "pay_amount": opp.get("pay_amount", 15000),
                "pay_unit": opp.get("pay_unit", "month"),
                "required_skills": opp.get("required_skills", []),
                "matched_candidates": matched_seniors
            })

        return results

    async def get_interviews(self, user_payload: Dict[str, Any]) -> List[ApplicationItemResponse]:
        user_id = user_payload.get("sub")
        role = user_payload.get("role", "senior")
        
        col = self._apps_col()
        if role == "senior":
            cursor = col.find({"user_id": user_id, "interview_link": {"$exists": True, "$ne": None}}).sort("applied_at", -1)
        else:
            company_name = user_payload.get("full_name") or user_payload.get("company_name") or ""
            cursor = col.find({"posted_by_name": company_name, "interview_link": {"$exists": True, "$ne": None}}).sort("applied_at", -1)
            
        apps = await cursor.to_list(100)
        return [
            ApplicationItemResponse(
                id=str(a.get("_id", a["opportunity_id"])),
                opportunity_id=a["opportunity_id"],
                opportunity_title=a["opportunity_title"],
                type=a.get("type", "job"),
                posted_by_name=a.get("posted_by_name", "Corporate Employer"),
                pay_amount=a.get("pay_amount", 18000),
                pay_unit=a.get("pay_unit", "month"),
                status=a.get("status", "interview_invited"),
                match_score=a.get("match_score", 95),
                match_explanation=a.get("match_explanation", "Interview Scheduled"),
                interview_link=a.get("interview_link"),
                interview_date=a.get("interview_date", "Upcoming Weekday"),
                applied_at=a.get("applied_at", "")
            ) for a in apps
        ]

    async def cancel_application(self, user_payload: Dict[str, Any], app_id: str) -> Dict[str, Any]:
        col = self._apps_col()
        filter_q = self._build_id_filter(app_id)
        
        # If not found by _id, check opportunity_id
        doc = await col.find_one(filter_q)
        if not doc:
            doc = await col.find_one({"opportunity_id": app_id})
            if doc:
                filter_q = {"opportunity_id": app_id}
                
        if not doc:
            raise HTTPException(status_code=404, detail="Application or interview not found")
            
        now = datetime.datetime.now(datetime.timezone.utc).isoformat()
        await col.update_one(filter_q, {"$set": {"status": "cancelled", "updated_at": now}})
        return {"success": True, "message": "Application / Interview cancelled successfully"}

    async def delete_opportunity(self, user_payload: Dict[str, Any], opp_id: str) -> Dict[str, Any]:
        user_id = user_payload.get("sub")
        filter_q = self._build_id_filter(opp_id)
        opp = await self._opps_col().find_one(filter_q)
        if not opp:
            raise HTTPException(status_code=404, detail="Opportunity not found")
        
        # Check ownership unless admin
        if opp.get("company_id") and opp.get("company_id") != user_id and user_payload.get("role") != "admin":
            raise HTTPException(status_code=403, detail="You are not authorized to delete this opportunity")
            
        await self._opps_col().delete_one(filter_q)
        await self._apps_col().delete_many({"opportunity_id": opp_id})
        return {"success": True, "message": "Opportunity deleted successfully", "id": opp_id}

matching_service = MatchingService()
