import datetime
import logging
from typing import Dict, Any, List, Optional
from fastapi import HTTPException, status
from bson import ObjectId

from app.database import db_manager
from app.schemas.community import (
    PostCreateRequest,
    PostResponse,
    CommentCreateRequest,
    CommentResponse,
    CollaborationPairResponse,
    ConnectCollaborationRequest,
    DemandSignalResponse
)

logger = logging.getLogger("silverhands.community_service")

class CommunityService:
    def _posts_col(self):
        return db_manager.get_collection("community_posts")

    def _comments_col(self):
        return db_manager.get_collection("community_comments")

    def _collabs_col(self):
        return db_manager.get_collection("collaborations")

    def _demand_col(self):
        return db_manager.get_collection("demand_signals")

    def _senior_col(self):
        return db_manager.get_collection("senior_profiles")

    async def list_posts(
        self,
        city: Optional[str] = None,
        locality: Optional[str] = None,
        post_type: Optional[str] = None
    ) -> List[PostResponse]:
        col = self._posts_col()
        filter_doc: Dict[str, Any] = {}

        if city and city.lower() != "all":
            filter_doc["city"] = {"$regex": city, "$options": "i"}

        if locality and locality.lower() != "all areas":
            filter_doc["locality"] = locality

        if post_type and post_type.lower() != "all":
            filter_doc["type"] = post_type

        cursor = col.find(filter_doc).sort("created_at", -1)
        docs = await cursor.to_list(100)

        results = []
        comments_col = self._comments_col()
        for d in docs:
            p_id = str(d.get("_id"))
            # Real-time accurate comments count from comments collection
            real_comments_count = await comments_col.count_documents({"post_id": p_id})

            results.append(
                PostResponse(
                    id=p_id,
                    user_id=d.get("user_id", ""),
                    author_name=d.get("author_name", "Community Member"),
                    author_role=d.get("author_role", "customer"),
                    is_age_verified=d.get("is_age_verified", False),
                    title=d["title"],
                    content=d["content"],
                    type=d["type"],
                    tags=d.get("tags", []),
                    locality=d.get("locality", "Adyar"),
                    city=d.get("city", "Chennai"),
                    comments_count=real_comments_count,
                    likes_count=d.get("likes_count", 0),
                    demand_signal_generated=d.get("demand_signal_generated", False),
                    matched_skills=d.get("matched_skills", []),
                    created_at=d.get("created_at", "")
                )
            )

        return results

    async def create_post(self, user_payload: Dict[str, Any], req: PostCreateRequest) -> PostResponse:
        user_id = user_payload.get("sub")
        col = self._posts_col()
        now = datetime.datetime.now(datetime.timezone.utc).isoformat()

        is_need = req.type == "need"
        matched_skills = []

        # Analyze Demand Signal if it's a "Need" post
        if is_need:
            content_lower = (req.title + " " + req.content).lower()
            if "telugu" in content_lower or "tamil" in content_lower or "tutor" in content_lower:
                matched_skills.extend(["Language Tuition", "Telugu", "Mentoring"])
            if "sweet" in content_lower or "cook" in content_lower or "pickle" in content_lower:
                matched_skills.extend(["Traditional Cooking", "Diwali Sweets"])
            if "account" in content_lower or "gst" in content_lower or "excel" in content_lower:
                matched_skills.extend(["Accounting", "GST Basics"])
            if "stitch" in content_lower or "tailor" in content_lower or "blouse" in content_lower:
                matched_skills.extend(["Bespoke Tailoring", "Embroidery"])

            # Store Demand Signal
            demand_col = self._demand_col()
            await demand_col.insert_one({
                "city": req.city,
                "locality": req.locality,
                "category": "Community Demand",
                "skills_demanded": matched_skills,
                "urgency": "High",
                "source_text": req.title,
                "created_at": now
            })

        doc = {
            "user_id": user_id,
            "author_name": user_payload.get("full_name", "Community Member"),
            "author_role": user_payload.get("role", "customer"),
            "is_age_verified": True if user_payload.get("role") == "senior" else False,
            "title": req.title,
            "content": req.content,
            "type": req.type,
            "tags": req.tags if req.tags else ["Community"],
            "locality": req.locality,
            "city": req.city,
            "comments_count": 0,
            "likes_count": 0,
            "demand_signal_generated": is_need,
            "matched_skills": matched_skills,
            "created_at": now
        }

        res = await col.insert_one(doc)
        doc["_id"] = str(res.inserted_id)

        return PostResponse(
            id=str(doc["_id"]),
            user_id=doc["user_id"],
            author_name=doc["author_name"],
            author_role=doc["author_role"],
            is_age_verified=doc["is_age_verified"],
            title=doc["title"],
            content=doc["content"],
            type=doc["type"],
            tags=doc["tags"],
            locality=doc["locality"],
            city=doc["city"],
            comments_count=0,
            likes_count=0,
            demand_signal_generated=is_need,
            matched_skills=matched_skills,
            created_at=now
        )

    async def list_comments(self, post_id: str) -> List[CommentResponse]:
        col = self._comments_col()
        cursor = col.find({"post_id": post_id}).sort("created_at", 1)
        docs = await cursor.to_list(50)
        return [
            CommentResponse(
                id=str(d.get("_id")),
                post_id=d["post_id"],
                user_id=d["user_id"],
                author_name=d["author_name"],
                author_role=d.get("author_role", "customer"),
                content=d["content"],
                created_at=d["created_at"]
            )
            for d in docs
        ]

    async def add_comment(self, user_payload: Dict[str, Any], post_id: str, req: CommentCreateRequest) -> CommentResponse:
        user_id = user_payload.get("sub")
        col = self._comments_col()
        now = datetime.datetime.now(datetime.timezone.utc).isoformat()

        doc = {
            "post_id": post_id,
            "user_id": user_id,
            "author_name": user_payload.get("full_name", "Community Member"),
            "author_role": user_payload.get("role", "customer"),
            "content": req.content,
            "created_at": now
        }

        res = await col.insert_one(doc)
        doc["_id"] = str(res.inserted_id)

        # Increment comments_count on post safely with ObjectId or str
        post_obj = ObjectId(post_id) if ObjectId.is_valid(post_id) else post_id
        await self._posts_col().update_one(
            {"$or": [{"_id": post_obj}, {"_id": post_id}]},
            {"$inc": {"comments_count": 1}}
        )

        return CommentResponse(
            id=str(doc["_id"]),
            post_id=post_id,
            user_id=user_id,
            author_name=doc["author_name"],
            author_role=doc["author_role"],
            content=doc["content"],
            created_at=now
        )

    async def get_collaboration_matches(self, user_payload: Dict[str, Any]) -> List[CollaborationPairResponse]:
        user_id = user_payload.get("sub")
        seniors_col = self._senior_col()
        collabs_col = self._collabs_col()
        now = datetime.datetime.now(datetime.timezone.utc).isoformat()

        # Fetch current senior profile
        current_sr = await seniors_col.find_one({"user_id": user_id})
        current_city = current_sr.get("city", "Chennai") if current_sr else "Chennai"
        current_name = current_sr.get("full_name", "Senior Guru") if current_sr else "Senior Member"
        current_skills = current_sr.get("skills", ["Mentoring"]) if current_sr else ["Accounting"]

        # Fetch other seniors in the same city or across region
        other_seniors = await seniors_col.find({"user_id": {"$ne": user_id}}).to_list(20)
        
        matches = []
        for other in other_seniors:
            other_skills = other.get("skills", [])
            other_name = other.get("full_name", "Senior Partner")
            other_id = str(other.get("user_id", other.get("_id")))

            # Determine synergy pattern
            curr_str = " ".join(current_skills).lower()
            other_str = " ".join(other_skills).lower()

            venture_title = f"{current_name} & {other_name} Local Venture"
            synergy_reason = f"Combined expertise of {', '.join(current_skills[:2])} and {', '.join(other_skills[:2])} for local services."

            if ("account" in curr_str or "excel" in curr_str or "gst" in curr_str) and ("cook" in other_str or "sweet" in other_str or "pickle" in other_str):
                venture_title = "Heritage Taste & Home-Delivery Micro Kitchen"
                synergy_reason = f"{other_name}'s authentic culinary mastery combined with {current_name}'s financial & GST management."
            elif ("tailor" in curr_str or "stitch" in curr_str) and ("embroidery" in other_str or "aari" in other_str or "design" in other_str):
                venture_title = "Bespoke Festive Apparel & Traditional Embroidery Studio"
                synergy_reason = f"Custom garment tailoring and heritage hand embroidery synergy."
            elif ("teach" in curr_str or "tuition" in curr_str or "math" in curr_str) and ("mentoring" in other_str or "language" in other_str):
                venture_title = "Bilingual Academic & Student Mentoring Hub"
                synergy_reason = f"Personalized 1-on-1 language lessons and conceptual academic coaching."

            matches.append(CollaborationPairResponse(
                id=f"collab-{user_id[:6]}-{other_id[:6]}",
                senior_a_id=user_id,
                senior_a_name=current_name,
                senior_a_skills=current_skills,
                senior_b_id=other_id,
                senior_b_name=other_name,
                senior_b_skills=other_skills,
                city=other.get("city", current_city),
                locality=other.get("locality", "Adyar"),
                venture_title=venture_title,
                ai_synergy_reason=synergy_reason,
                status="suggested"
            ))

        if not matches:
            # Fallback pre-seeded synergy pair
            matches.append(CollaborationPairResponse(
                id="collab-ramesh-lakshmi-01",
                senior_a_id=user_id,
                senior_a_name="Ramesh Krishnan",
                senior_a_skills=["Accounting", "GST Filing", "Bookkeeping"],
                senior_b_id="sr-lakshmi-01",
                senior_b_name="Lakshmi Venkatesh",
                senior_b_skills=["Traditional Cooking", "Homemade Pickles", "Diwali Sweets"],
                city=current_city,
                locality="Mylapore",
                venture_title="Heritage Taste & Home-Delivery Kitchen",
                ai_synergy_reason="Lakshmi's culinary heritage combined with Ramesh's accounting & GST compliance.",
                status="suggested"
            ))

        return matches[:2]

    async def connect_collaboration(self, user_payload: Dict[str, Any], req: ConnectCollaborationRequest) -> Dict[str, Any]:
        user_id = user_payload.get("sub")
        col = self._collabs_col()
        now = datetime.datetime.now(datetime.timezone.utc).isoformat()

        doc = {
            "requester_id": user_id,
            "target_senior_id": req.target_senior_id,
            "venture_title": req.venture_title,
            "status": "connected",
            "connected_at": now
        }
        await col.insert_one(doc)

        return {
            "success": True,
            "message": f"Collaboration invitation successfully sent for '{req.venture_title}'!"
        }

community_service = CommunityService()
