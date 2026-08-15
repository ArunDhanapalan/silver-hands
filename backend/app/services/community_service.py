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

        return [
            PostResponse(
                id=str(d.get("_id")),
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
                comments_count=d.get("comments_count", 0),
                likes_count=d.get("likes_count", 0),
                demand_signal_generated=d.get("demand_signal_generated", False),
                matched_skills=d.get("matched_skills", []),
                created_at=d.get("created_at", "")
            )
            for d in docs
        ]

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

        # Increment comments_count on post
        await self._posts_col().update_one({"_id": post_id}, {"$inc": {"comments_count": 1}})

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
        col = self._collabs_col()
        
        cursor = col.find({"$or": [{"senior_a_id": user_id}, {"senior_b_id": user_id}, {"status": "suggested"}]})
        docs = await cursor.to_list(10)

        return [
            CollaborationPairResponse(
                id=str(d.get("_id")),
                senior_a_id=d["senior_a_id"],
                senior_a_name=d["senior_a_name"],
                senior_a_skills=d.get("senior_a_skills", []),
                senior_b_id=d["senior_b_id"],
                senior_b_name=d["senior_b_name"],
                senior_b_skills=d.get("senior_b_skills", []),
                city=d.get("city", "Chennai"),
                locality=d.get("locality", "Adyar"),
                venture_title=d["venture_title"],
                ai_synergy_reason=d["ai_synergy_reason"],
                status=d.get("status", "suggested")
            )
            for d in docs
        ]

    async def connect_collaboration(self, user_payload: Dict[str, Any], req: ConnectCollaborationRequest) -> Dict[str, Any]:
        user_id = user_payload.get("sub")
        col = self._collabs_col()
        now = datetime.datetime.now(datetime.timezone.utc).isoformat()

        await col.update_one(
            {"$or": [{"senior_a_id": user_id}, {"senior_b_id": user_id}]},
            {"$set": {"status": "connected", "connected_at": now}}
        )

        return {
            "success": True,
            "message": f"Collaboration invitation sent to {req.target_senior_id} for '{req.venture_title}'!"
        }

community_service = CommunityService()
