import datetime
import logging
import random
from typing import Dict, Any, List, Optional
from fastapi import HTTPException, status
from bson import ObjectId

from app.database import db_manager
from app.schemas.service import (
    ServiceCreateRequest,
    ServiceResponse,
    BookingCreateRequest,
    BookingResponse,
    BookingStatusUpdateRequest,
    BookingReviewRequest
)

logger = logging.getLogger("silverhands.service_booking_service")

class ServiceBookingService:
    def _services_col(self):
        return db_manager.get_collection("services")

    def _bookings_col(self):
        return db_manager.get_collection("service_bookings")

    def _senior_col(self):
        return db_manager.get_collection("senior_profiles")

    async def list_services(
        self,
        category: Optional[str] = None,
        subcategory: Optional[str] = None,
        mode: Optional[str] = None,
        city: Optional[str] = None,
        search: Optional[str] = None
    ) -> List[ServiceResponse]:
        col = self._services_col()
        filter_doc: Dict[str, Any] = {}

        if category and category.lower() != "all":
            filter_doc["category"] = category

        if subcategory and subcategory.lower() != "all":
            filter_doc["subcategory"] = subcategory

        if mode and mode.lower() != "all":
            filter_doc["mode"] = {"$in": [mode, "both"]}

        if city and city.lower() != "all":
            filter_doc["city"] = {"$regex": city, "$options": "i"}

        if search and search.strip():
            filter_doc["$or"] = [
                {"title": {"$regex": search, "$options": "i"}},
                {"description": {"$regex": search, "$options": "i"}},
                {"subcategory": {"$regex": search, "$options": "i"}}
            ]

        cursor = col.find(filter_doc)
        docs = await cursor.to_list(100)

        return [
            ServiceResponse(
                id=str(d.get("_id")),
                senior_id=d.get("senior_id", ""),
                senior_name=d.get("senior_name", "Senior Guru"),
                senior_locality=d.get("senior_locality", "Adyar"),
                senior_city=d.get("senior_city", "Chennai"),
                senior_rating=d.get("senior_rating", 4.95),
                is_age_verified=d.get("is_age_verified", True),
                title=d["title"],
                category=d["category"],
                subcategory=d.get("subcategory", "Language Tuition"),
                description=d["description"],
                mode=d.get("mode", "online"),
                duration_mins=d.get("duration_mins", 45),
                price_per_session=d["price_per_session"],
                languages=d.get("languages", ["en", "ta"]),
                target_audience=d.get("target_audience", "Beginners"),
                locality=d.get("locality", "Adyar"),
                city=d.get("city", "Chennai"),
                total_sessions_conducted=d.get("total_sessions_conducted", 12),
                created_at=d.get("created_at", "")
            )
            for d in docs
        ]

    async def get_service_by_id(self, service_id: str) -> ServiceResponse:
        col = self._services_col()
        doc = await col.find_one({"_id": service_id})
        if not doc:
            raise HTTPException(status_code=404, detail="Managed service not found")

        return ServiceResponse(
            id=str(doc.get("_id")),
            senior_id=doc.get("senior_id", ""),
            senior_name=doc.get("senior_name", "Senior Guru"),
            senior_locality=doc.get("senior_locality", "Adyar"),
            senior_city=doc.get("senior_city", "Chennai"),
            senior_rating=doc.get("senior_rating", 4.95),
            is_age_verified=doc.get("is_age_verified", True),
            title=doc["title"],
            category=doc["category"],
            subcategory=doc.get("subcategory", "Language Tuition"),
            description=doc["description"],
            mode=doc.get("mode", "online"),
            duration_mins=doc.get("duration_mins", 45),
            price_per_session=doc["price_per_session"],
            languages=doc.get("languages", ["en", "ta"]),
            target_audience=doc.get("target_audience", "Beginners"),
            locality=doc.get("locality", "Adyar"),
            city=doc.get("city", "Chennai"),
            total_sessions_conducted=doc.get("total_sessions_conducted", 12),
            created_at=doc.get("created_at", "")
        )

    async def create_service(self, user_payload: Dict[str, Any], req: ServiceCreateRequest) -> ServiceResponse:
        user_id = user_payload.get("sub")
        col = self._services_col()
        now = datetime.datetime.now(datetime.timezone.utc).isoformat()

        doc = {
            "senior_id": user_id,
            "senior_name": user_payload.get("full_name", "Senior Guru"),
            "senior_locality": req.locality,
            "senior_city": req.city,
            "senior_rating": 5.0,
            "is_age_verified": True,
            "title": req.title,
            "category": req.category,
            "subcategory": req.subcategory,
            "description": req.description,
            "mode": req.mode,
            "duration_mins": req.duration_mins,
            "price_per_session": req.price_per_session,
            "languages": req.languages,
            "target_audience": req.target_audience,
            "locality": req.locality,
            "city": req.city,
            "total_sessions_conducted": 0,
            "created_at": now
        }

        res = await col.insert_one(doc)
        doc["_id"] = str(res.inserted_id)

        return ServiceResponse(
            id=str(doc["_id"]),
            senior_id=doc["senior_id"],
            senior_name=doc["senior_name"],
            senior_locality=doc["senior_locality"],
            senior_city=doc["senior_city"],
            senior_rating=doc["senior_rating"],
            is_age_verified=doc["is_age_verified"],
            title=doc["title"],
            category=doc["category"],
            subcategory=doc["subcategory"],
            description=doc["description"],
            mode=doc["mode"],
            duration_mins=doc["duration_mins"],
            price_per_session=doc["price_per_session"],
            languages=doc["languages"],
            target_audience=doc["target_audience"],
            locality=doc["locality"],
            city=doc["city"],
            total_sessions_conducted=doc["total_sessions_conducted"],
            created_at=doc["created_at"]
        )

    async def create_booking(self, user_payload: Dict[str, Any], req: BookingCreateRequest) -> BookingResponse:
        service_doc = await self._services_col().find_one({"_id": req.service_id})
        if not service_doc:
            raise HTTPException(status_code=404, detail="Service offering not found")

        now = datetime.datetime.now(datetime.timezone.utc).isoformat()
        ref_num = f"SH-SRV-{random.randint(1000, 9999)}"
        customer_id = user_payload.get("sub")
        total_amt = service_doc["price_per_session"] * req.sessions_count

        booking_doc = {
            "booking_reference": ref_num,
            "service_id": req.service_id,
            "service_title": service_doc["title"],
            "category": service_doc["category"],
            "mode": service_doc["mode"],
            "customer_id": customer_id,
            "customer_name": user_payload.get("full_name", "Student / Learner"),
            "customer_phone": req.contact_phone,
            "senior_id": service_doc["senior_id"],
            "senior_name": service_doc["senior_name"],
            "student_name": req.student_name,
            "student_age_group": req.student_age_group,
            "scheduled_slot": f"{', '.join(req.preferred_days)} @ {req.preferred_time_slot}",
            "sessions_count": req.sessions_count,
            "total_amount": total_amt,
            "meeting_link": f"https://meet.silverhands.in/session-{ref_num.lower()}" if service_doc["mode"] in ["online", "both"] else None,
            "status": "requested",
            "review_rating": None,
            "review_comment": None,
            "created_at": now,
            "updated_at": now
        }

        col = self._bookings_col()
        res = await col.insert_one(booking_doc)
        booking_doc["_id"] = str(res.inserted_id)

        return BookingResponse(
            id=str(booking_doc["_id"]),
            booking_reference=booking_doc["booking_reference"],
            service_id=booking_doc["service_id"],
            service_title=booking_doc["service_title"],
            category=booking_doc["category"],
            mode=booking_doc["mode"],
            customer_id=booking_doc["customer_id"],
            customer_name=booking_doc["customer_name"],
            customer_phone=booking_doc["customer_phone"],
            senior_id=booking_doc["senior_id"],
            senior_name=booking_doc["senior_name"],
            student_name=booking_doc["student_name"],
            student_age_group=booking_doc["student_age_group"],
            scheduled_slot=booking_doc["scheduled_slot"],
            sessions_count=booking_doc["sessions_count"],
            total_amount=booking_doc["total_amount"],
            meeting_link=booking_doc["meeting_link"],
            status=booking_doc["status"],
            created_at=booking_doc["created_at"],
            updated_at=booking_doc["updated_at"]
        )

    async def update_booking_status(
        self,
        user_payload: Dict[str, Any],
        booking_id: str,
        req: BookingStatusUpdateRequest
    ) -> BookingResponse:
        col = self._bookings_col()
        doc = await col.find_one({"_id": booking_id})
        if not doc:
            raise HTTPException(status_code=404, detail="Booking not found")

        now = datetime.datetime.now(datetime.timezone.utc).isoformat()
        update_fields: Dict[str, Any] = {"status": req.status, "updated_at": now}
        if req.meeting_link:
            update_fields["meeting_link"] = req.meeting_link

        await col.update_one({"_id": booking_id}, {"$set": update_fields})
        doc.update(update_fields)

        # If completed, credit senior earnings and session count
        if req.status == "completed":
            senior_id = doc["senior_id"]
            senior_col = self._senior_col()
            await senior_col.update_one(
                {"user_id": senior_id},
                {"$inc": {"earnings_total": doc["total_amount"], "completed_jobs_count": 1}}
            )
            # Increment service total_sessions_conducted
            await self._services_col().update_one(
                {"_id": doc["service_id"]},
                {"$inc": {"total_sessions_conducted": 1}}
            )

        return BookingResponse(
            id=str(doc.get("_id")),
            booking_reference=doc["booking_reference"],
            service_id=doc["service_id"],
            service_title=doc["service_title"],
            category=doc["category"],
            mode=doc["mode"],
            customer_id=doc["customer_id"],
            customer_name=doc["customer_name"],
            customer_phone=doc["customer_phone"],
            senior_id=doc["senior_id"],
            senior_name=doc["senior_name"],
            student_name=doc["student_name"],
            student_age_group=doc["student_age_group"],
            scheduled_slot=doc["scheduled_slot"],
            sessions_count=doc["sessions_count"],
            total_amount=doc["total_amount"],
            meeting_link=doc.get("meeting_link"),
            status=doc["status"],
            review_rating=doc.get("review_rating"),
            review_comment=doc.get("review_comment"),
            created_at=doc["created_at"],
            updated_at=doc["updated_at"]
        )

    async def submit_booking_review(
        self,
        user_payload: Dict[str, Any],
        booking_id: str,
        req: BookingReviewRequest
    ) -> BookingResponse:
        col = self._bookings_col()
        doc = await col.find_one({"_id": booking_id})
        if not doc:
            raise HTTPException(status_code=404, detail="Booking not found")

        now = datetime.datetime.now(datetime.timezone.utc).isoformat()
        await col.update_one(
            {"_id": booking_id},
            {"$set": {"review_rating": req.rating, "review_comment": req.comment, "updated_at": now}}
        )
        doc["review_rating"] = req.rating
        doc["review_comment"] = req.comment

        # Update senior rating
        senior_id = doc["senior_id"]
        senior_col = self._senior_col()
        await senior_col.update_one(
            {"user_id": senior_id},
            {"$inc": {"review_count": 1}}
        )

        return BookingResponse(
            id=str(doc.get("_id")),
            booking_reference=doc["booking_reference"],
            service_id=doc["service_id"],
            service_title=doc["service_title"],
            category=doc["category"],
            mode=doc["mode"],
            customer_id=doc["customer_id"],
            customer_name=doc["customer_name"],
            customer_phone=doc["customer_phone"],
            senior_id=doc["senior_id"],
            senior_name=doc["senior_name"],
            student_name=doc["student_name"],
            student_age_group=doc["student_age_group"],
            scheduled_slot=doc["scheduled_slot"],
            sessions_count=doc["sessions_count"],
            total_amount=doc["total_amount"],
            meeting_link=doc.get("meeting_link"),
            status=doc["status"],
            review_rating=doc["review_rating"],
            review_comment=doc["review_comment"],
            created_at=doc["created_at"],
            updated_at=doc["updated_at"]
        )

    async def get_customer_bookings(self, user_payload: Dict[str, Any]) -> List[BookingResponse]:
        user_id = user_payload.get("sub")
        col = self._bookings_col()
        cursor = col.find({"customer_id": user_id}).sort("created_at", -1)
        docs = await cursor.to_list(100)
        return [
            BookingResponse(
                id=str(d.get("_id")),
                booking_reference=d["booking_reference"],
                service_id=d["service_id"],
                service_title=d["service_title"],
                category=d["category"],
                mode=d["mode"],
                customer_id=d["customer_id"],
                customer_name=d["customer_name"],
                customer_phone=d["customer_phone"],
                senior_id=d["senior_id"],
                senior_name=d["senior_name"],
                student_name=d["student_name"],
                student_age_group=d["student_age_group"],
                scheduled_slot=d["scheduled_slot"],
                sessions_count=d["sessions_count"],
                total_amount=d["total_amount"],
                meeting_link=d.get("meeting_link"),
                status=d["status"],
                review_rating=d.get("review_rating"),
                review_comment=d.get("review_comment"),
                created_at=d["created_at"],
                updated_at=d["updated_at"]
            )
            for d in docs
        ]

    async def get_senior_sessions(self, user_payload: Dict[str, Any]) -> List[BookingResponse]:
        user_id = user_payload.get("sub")
        col = self._bookings_col()
        cursor = col.find({"senior_id": user_id}).sort("created_at", -1)
        docs = await cursor.to_list(100)
        return [
            BookingResponse(
                id=str(d.get("_id")),
                booking_reference=d["booking_reference"],
                service_id=d["service_id"],
                service_title=d["service_title"],
                category=d["category"],
                mode=d["mode"],
                customer_id=d["customer_id"],
                customer_name=d["customer_name"],
                customer_phone=d["customer_phone"],
                senior_id=d["senior_id"],
                senior_name=d["senior_name"],
                student_name=d["student_name"],
                student_age_group=d["student_age_group"],
                scheduled_slot=d["scheduled_slot"],
                sessions_count=d["sessions_count"],
                total_amount=d["total_amount"],
                meeting_link=d.get("meeting_link"),
                status=d["status"],
                review_rating=d.get("review_rating"),
                review_comment=d.get("review_comment"),
                created_at=d["created_at"],
                updated_at=d["updated_at"]
            )
            for d in docs
        ]

service_booking_service = ServiceBookingService()
