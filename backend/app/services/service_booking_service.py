import random
import datetime
from typing import List, Optional, Dict, Any
from bson import ObjectId
from fastapi import HTTPException
from app.database import db_manager
from app.schemas.service import (
    ServiceCreateRequest,
    ServiceResponse,
    ServiceReviewItem,
    BookingCreateRequest,
    BookingResponse,
    BookingStatusUpdateRequest,
    BookingReviewRequest,
    MarkSessionProgressRequest,
    ClassBatchRosterResponse
)

class ServiceBookingService:
    def _services_col(self):
        return db_manager.get_collection("managed_services")

    def _bookings_col(self):
        return db_manager.get_collection("service_bookings")

    def _senior_col(self):
        return db_manager.get_collection("senior_profiles")

    def _build_id_filter(self, id_str: str) -> Dict[str, Any]:
        filters = [{"_id": id_str}, {"id": id_str}]
        if ObjectId.is_valid(id_str):
            filters.append({"_id": ObjectId(id_str)})
        return {"$or": filters}

    def _format_service(self, doc: Dict[str, Any]) -> ServiceResponse:
        raw_reviews = [ServiceReviewItem(**r) if isinstance(r, dict) else r for r in doc.get("reviews", [])]
        ratings_list = [r.rating for r in raw_reviews if hasattr(r, 'rating') and r.rating]
        calc_rating = round(sum(ratings_list) / len(ratings_list), 2) if len(ratings_list) > 0 else None
        srv_id = str(doc.get("_id"))

        # Default unique meeting link per class if online
        meeting_link = doc.get("meeting_link")
        mode = doc.get("mode", "online")
        if not meeting_link and mode in ["online", "both"]:
            clean_id = srv_id[-8:].upper() if len(srv_id) >= 8 else "ROOM"
            meeting_link = f"https://meet.jit.si/SilverHands-Class-{clean_id}"

        return ServiceResponse(
            id=srv_id,
            senior_id=doc.get("senior_id", doc.get("provider_id", "")),
            senior_name=doc.get("senior_name", "Senior Guru"),
            senior_locality=doc.get("senior_locality", "Adyar"),
            senior_city=doc.get("senior_city", "Chennai"),
            senior_rating=calc_rating,
            is_age_verified=doc.get("is_age_verified", True),
            title=doc["title"],
            category=doc["category"],
            subcategory=doc.get("subcategory", "Language Tuition"),
            description=doc["description"],
            mode=mode,
            duration_mins=doc.get("duration_mins", 45),
            price_per_session=doc["price_per_session"],
            languages=doc.get("languages", ["en", "ta"]),
            target_audience=doc.get("target_audience", "Beginners"),
            available_days=doc.get("available_days", ["Monday", "Wednesday", "Friday"]),
            time_slot=doc.get("time_slot", "Evening (5:00 PM – 6:00 PM)"),
            max_students_capacity=doc.get("max_students_capacity", 10),
            enrolled_students_count=doc.get("enrolled_students_count", 0),
            meeting_link=meeting_link,
            venue_address=doc.get("venue_address") or f"Flat 4B, 2nd Main Road, {doc.get('locality', 'Adyar')}, {doc.get('city', 'Chennai')}",
            locality=doc.get("locality", "Adyar"),
            city=doc.get("city", "Chennai"),
            total_sessions_conducted=doc.get("total_sessions_conducted", 0),
            rating=calc_rating,
            total_reviews=len(raw_reviews),
            reviews=raw_reviews,
            created_at=doc.get("created_at", "")
        )

    def _format_booking(self, d: Dict[str, Any]) -> BookingResponse:
        return BookingResponse(
            id=str(d.get("_id")),
            booking_reference=d.get("booking_reference", "SH-BKG"),
            service_id=d["service_id"],
            service_title=d["service_title"],
            category=d.get("category", "Education & Learning"),
            mode=d.get("mode", "online"),
            customer_id=d["customer_id"],
            customer_name=d["customer_name"],
            customer_phone=d.get("customer_phone", ""),
            senior_id=d["senior_id"],
            senior_name=d["senior_name"],
            student_name=d["student_name"],
            student_age_group=d["student_age_group"],
            scheduled_slot=d.get("scheduled_slot", "Evening (5:00 PM – 6:00 PM)"),
            available_days=d.get("preferred_days", ["Monday", "Wednesday", "Friday"]),
            sessions_count=d.get("sessions_count", 1),
            completed_sessions_count=d.get("completed_sessions_count", 0),
            price_per_session=d.get("price_per_session", 0),
            total_amount=d.get("total_amount", 0),
            meeting_link=d.get("meeting_link"),
            venue_address=d.get("venue_address"),
            status=d.get("status", "requested"),
            review_rating=d.get("review_rating"),
            review_comment=d.get("review_comment"),
            created_at=d.get("created_at", ""),
            updated_at=d.get("updated_at", "")
        )

    async def list_services(
        self,
        category: Optional[str] = None,
        subcategory: Optional[str] = None,
        mode: Optional[str] = None,
        city: Optional[str] = None,
        search: Optional[str] = None
    ) -> List[ServiceResponse]:
        col = self._services_col()
        query = {}
        if category and category != "All":
            query["category"] = category
        if subcategory:
            query["subcategory"] = subcategory
        if mode and mode != "all":
            query["mode"] = mode
        if city:
            query["city"] = city
        if search:
            query["$or"] = [
                {"title": {"$regex": search, "$options": "i"}},
                {"description": {"$regex": search, "$options": "i"}},
                {"senior_name": {"$regex": search, "$options": "i"}}
            ]

        cursor = col.find(query).sort("created_at", -1)
        docs = await cursor.to_list(100)
        return [self._format_service(d) for d in docs]

    async def get_service_by_id(self, service_id: str) -> ServiceResponse:
        col = self._services_col()
        filter_q = self._build_id_filter(service_id)
        doc = await col.find_one(filter_q)
        if not doc:
            raise HTTPException(status_code=404, detail="Managed service not found")

        # Calculate live enrolled count
        bookings_col = self._bookings_col()
        enrolled_count = await bookings_col.count_documents({
            "service_id": service_id,
            "status": {"$in": ["requested", "accepted", "scheduled", "in_progress", "completed"]}
        })
        doc["enrolled_students_count"] = enrolled_count

        return self._format_service(doc)

    async def delete_service(self, user_payload: Dict[str, Any], service_id: str) -> Dict[str, Any]:
        user_id = user_payload.get("sub")
        col = self._services_col()
        srv = await col.find_one(self._build_id_filter(service_id))
        if not srv:
            raise HTTPException(status_code=404, detail="Service offering not found")
        if srv.get("senior_id") != user_id and srv.get("provider_id") != user_id:
            raise HTTPException(status_code=403, detail="You are not authorized to delete this offering")
        await col.delete_one(self._build_id_filter(service_id))
        return {"message": "Service offering removed successfully", "id": service_id}

    async def create_service(self, user_payload: Dict[str, Any], req: ServiceCreateRequest) -> ServiceResponse:
        user_id = user_payload.get("sub")
        col = self._services_col()
        now = datetime.datetime.now(datetime.timezone.utc).isoformat()

        doc = {
            "senior_id": user_id,
            "senior_name": user_payload.get("full_name", "Senior Guru"),
            "senior_locality": req.locality,
            "senior_city": req.city,
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
            "available_days": req.available_days,
            "time_slot": req.time_slot,
            "max_students_capacity": 10,
            "enrolled_students_count": 0,
            "venue_address": req.venue_address or f"Studio 4B, 2nd Main Road, {req.locality}, {req.city}",
            "locality": req.locality,
            "city": req.city,
            "total_sessions_conducted": 0,
            "reviews": [],
            "created_at": now
        }

        res = await col.insert_one(doc)
        doc["_id"] = str(res.inserted_id)

        # Unique meeting link for this specific class
        clean_id = str(res.inserted_id)[-8:].upper()
        meeting_link = f"https://meet.jit.si/SilverHands-Class-{clean_id}"
        await col.update_one({"_id": res.inserted_id}, {"$set": {"meeting_link": meeting_link}})
        doc["meeting_link"] = meeting_link

        return self._format_service(doc)

    async def create_booking(self, user_payload: Optional[Dict[str, Any]], req: BookingCreateRequest) -> BookingResponse:
        service = await self.get_service_by_id(req.service_id)
        col = self._bookings_col()
        now = datetime.datetime.now(datetime.timezone.utc).isoformat()
        ref_num = f"SH-BKG-2026-{random.randint(1000, 9999)}"

        customer_id = user_payload.get("sub") if user_payload else "guest_customer"
        customer_name = user_payload.get("full_name", req.student_name) if user_payload else req.student_name

        # Enforce strict 10 student cap per class batch
        active_students = await col.count_documents({
            "service_id": req.service_id,
            "status": {"$in": ["requested", "accepted", "scheduled", "in_progress", "completed"]}
        })
        if active_students >= (service.max_students_capacity or 10):
            raise HTTPException(status_code=400, detail="This class batch is currently full (Maximum 10 students per batch).")

        total_amount = service.price_per_session * req.sessions_count

        booking_doc = {
            "booking_reference": ref_num,
            "service_id": req.service_id,
            "service_title": service.title,
            "category": service.category,
            "mode": service.mode,
            "customer_id": customer_id,
            "customer_name": customer_name,
            "customer_phone": req.contact_phone,
            "senior_id": service.senior_id,
            "senior_name": service.senior_name,
            "student_name": req.student_name,
            "student_age_group": req.student_age_group,
            "preferred_days": req.preferred_days or service.available_days,
            "scheduled_slot": req.preferred_time_slot or service.time_slot,
            "sessions_count": req.sessions_count,
            "completed_sessions_count": 0,
            "price_per_session": service.price_per_session,
            "total_amount": total_amount,
            "meeting_link": service.meeting_link,
            "venue_address": service.venue_address,
            "status": "requested",
            "special_goals": req.special_goals,
            "review_rating": None,
            "review_comment": None,
            "created_at": now,
            "updated_at": now
        }

        res = await col.insert_one(booking_doc)
        booking_doc["_id"] = str(res.inserted_id)

        # Update service enrolled count
        await self._services_col().update_one(
            self._build_id_filter(req.service_id),
            {"$inc": {"enrolled_students_count": 1}}
        )

        return self._format_booking(booking_doc)

    async def update_booking_status(
        self,
        user_payload: Dict[str, Any],
        booking_id: str,
        req: BookingStatusUpdateRequest
    ) -> BookingResponse:
        col = self._bookings_col()
        filter_q = self._build_id_filter(booking_id)
        doc = await col.find_one(filter_q)
        if not doc:
            raise HTTPException(status_code=404, detail="Booking not found")

        now = datetime.datetime.now(datetime.timezone.utc).isoformat()
        update_fields: Dict[str, Any] = {"status": req.status, "updated_at": now}
        if req.meeting_link:
            update_fields["meeting_link"] = req.meeting_link

        previous_status = doc.get("status", "requested")

        # Block invalid transitions
        if previous_status in ("completed", "cancelled"):
            raise HTTPException(status_code=400, detail=f"Cannot change status of {previous_status} booking")

        await col.update_one(filter_q, {"$set": update_fields})
        doc.update(update_fields)

        # Credit individual student's fee to senior earnings once this student is completed
        if req.status == "completed" and previous_status != "completed":
            senior_id = doc.get("senior_id")
            if senior_id:
                senior_col = self._senior_col()
                await senior_col.update_one(
                    {"user_id": senior_id},
                    {"$inc": {"earnings_total": doc["total_amount"], "completed_jobs_count": 1}}
                )
            if doc.get("service_id"):
                await self._services_col().update_one(
                    self._build_id_filter(doc["service_id"]),
                    {"$inc": {"total_sessions_conducted": 1}}
                )

        return self._format_booking(doc)

    async def get_senior_class_rosters(self, user_payload: Dict[str, Any]) -> List[ClassBatchRosterResponse]:
        user_id = user_payload.get("sub")
        services = await self.get_senior_services(user_payload)
        bookings_col = self._bookings_col()

        rosters = []
        for s in services:
            cursor = bookings_col.find({"service_id": s.id}).sort("created_at", -1)
            b_docs = await cursor.to_list(100)
            student_bookings = [self._format_booking(b) for b in b_docs]
            
            active_students = [b for b in student_bookings if b.status != "cancelled"]
            completed_students = [b for b in student_bookings if b.status == "completed"]
            total_earnings = sum(b.total_amount for b in completed_students)

            rosters.append(ClassBatchRosterResponse(
                service=s,
                max_capacity=s.max_students_capacity or 10,
                enrolled_count=len(active_students),
                completed_count=len(completed_students),
                total_class_earnings=total_earnings,
                meeting_link=s.meeting_link,
                venue_address=s.venue_address,
                students=student_bookings
            ))
        return rosters

    async def get_customer_bookings(self, user_payload: Dict[str, Any]) -> List[BookingResponse]:
        user_id = user_payload.get("sub")
        col = self._bookings_col()
        cursor = col.find({"customer_id": user_id}).sort("created_at", -1)
        docs = await cursor.to_list(100)
        return [self._format_booking(d) for d in docs]

    async def get_senior_bookings(self, user_payload: Dict[str, Any]) -> List[BookingResponse]:
        user_id = user_payload.get("sub")
        col = self._bookings_col()
        cursor = col.find({"$or": [{"senior_id": user_id}, {"provider_id": user_id}]}).sort("created_at", -1)
        docs = await cursor.to_list(100)
        return [self._format_booking(d) for d in docs]

    get_senior_sessions = get_senior_bookings

    async def mark_session_progress(self, user_payload: Dict[str, Any], booking_id: str, req: Any) -> BookingResponse:
        col = self._bookings_col()
        filter_q = self._build_id_filter(booking_id)
        doc = await col.find_one(filter_q)
        if not doc:
            raise HTTPException(status_code=404, detail="Booking not found")

        current_status = doc.get("status", "requested")
        if current_status in ("completed", "cancelled"):
            raise HTTPException(status_code=400, detail=f"Cannot update progress of {current_status} booking")

        now = datetime.datetime.now(datetime.timezone.utc).isoformat()
        completed_cnt = req.completed_sessions
        total_cnt = doc.get("sessions_count", 1)

        completed_cnt = max(0, min(completed_cnt, total_cnt))
        was_already_completed = current_status == "completed"
        new_status = "completed" if completed_cnt >= total_cnt else "in_progress" if completed_cnt > 0 else doc.get("status", "scheduled")

        await col.update_one(
            filter_q,
            {"$set": {"completed_sessions_count": completed_cnt, "status": new_status, "updated_at": now}}
        )
        doc["completed_sessions_count"] = completed_cnt
        doc["status"] = new_status
        doc["updated_at"] = now

        if new_status == "completed" and not was_already_completed:
            senior_id = doc.get("senior_id")
            if senior_id:
                senior_col = self._senior_col()
                await senior_col.update_one(
                    {"user_id": senior_id},
                    {"$inc": {"earnings_total": doc["total_amount"], "completed_jobs_count": 1}}
                )

        return self._format_booking(doc)

    async def cancel_booking(self, user_payload: Dict[str, Any], booking_id: str) -> BookingResponse:
        col = self._bookings_col()
        filter_q = self._build_id_filter(booking_id)
        doc = await col.find_one(filter_q)
        if not doc:
            raise HTTPException(status_code=404, detail="Booking not found")

        now = datetime.datetime.now(datetime.timezone.utc).isoformat()
        await col.update_one(filter_q, {"$set": {"status": "cancelled", "updated_at": now}})
        doc["status"] = "cancelled"
        doc["updated_at"] = now

        # Decrement service enrolled count
        if doc.get("service_id"):
            await self._services_col().update_one(
                self._build_id_filter(doc["service_id"]),
                {"$inc": {"enrolled_students_count": -1}}
            )

        return self._format_booking(doc)

    async def submit_booking_review(self, user_payload: Dict[str, Any], booking_id: str, req: BookingReviewRequest) -> BookingResponse:
        col = self._bookings_col()
        filter_q = self._build_id_filter(booking_id)
        doc = await col.find_one(filter_q)
        if not doc:
            raise HTTPException(status_code=404, detail="Booking not found")

        now = datetime.datetime.now(datetime.timezone.utc).isoformat()
        customer_name = user_payload.get("full_name") or doc.get("customer_name", "Student / Client")
        customer_id = user_payload.get("sub", "")

        await col.update_one(
            filter_q,
            {"$set": {"review_rating": req.rating, "review_comment": req.comment, "updated_at": now}}
        )

        service_id = doc.get("service_id")
        if service_id:
            services_col = self._services_col()
            srv_filter = self._build_id_filter(service_id)
            srv_doc = await services_col.find_one(srv_filter)
            if srv_doc:
                review_item = {
                    "customer_id": customer_id,
                    "customer_name": customer_name,
                    "rating": req.rating,
                    "comment": req.comment,
                    "created_at": now
                }
                existing_reviews = srv_doc.get("reviews", [])
                existing_reviews.append(review_item)
                ratings_list = [r["rating"] for r in existing_reviews if isinstance(r, dict) and "rating" in r]
                new_cnt = len(ratings_list)
                new_avg = round(sum(ratings_list) / new_cnt, 2) if new_cnt > 0 else req.rating

                await services_col.update_one(
                    srv_filter,
                    {
                        "$set": {"rating": new_avg, "total_reviews": new_cnt, "senior_rating": new_avg},
                        "$push": {"reviews": review_item}
                    }
                )

        doc["review_rating"] = req.rating
        doc["review_comment"] = req.comment
        doc["updated_at"] = now

        return self._format_booking(doc)

    async def get_senior_services(self, user_payload: Dict[str, Any]) -> List[ServiceResponse]:
        user_id = user_payload.get("sub")
        col = self._services_col()
        cursor = col.find({"$or": [{"senior_id": user_id}, {"provider_id": user_id}]}).sort("created_at", -1)
        docs = await cursor.to_list(100)
        return [self._format_service(d) for d in docs]

service_booking_service = ServiceBookingService()
