from typing import List, Optional, Dict, Any
from fastapi import APIRouter, Depends, Query, status
from app.schemas.service import (
    ServiceCreateRequest,
    ServiceResponse,
    BookingCreateRequest,
    BookingResponse,
    BookingStatusUpdateRequest,
    BookingReviewRequest,
    MarkSessionProgressRequest,
    ClassBatchRosterResponse,
    AISuggestServiceRequest,
    AISuggestServiceResponse
)
from app.services.service_booking_service import service_booking_service
from app.security import get_current_user, require_role

router = APIRouter(prefix="/services", tags=["Managed Services & Bookings"])

@router.get("", response_model=List[ServiceResponse])
async def list_services(
    category: Optional[str] = Query(None),
    subcategory: Optional[str] = Query(None),
    mode: Optional[str] = Query(None),
    city: Optional[str] = Query(None),
    locality: Optional[str] = Query(None, description="Requester's locality for in-person distance filtering"),
    radius_km: Optional[float] = Query(None, description="Max distance in km for in-person services; omit to disable filtering"),
    search: Optional[str] = Query(None)
):
    """
    Public directory of managed services across language tuition, mentoring, culinary & handicrafts.
    When locality and radius_km are provided, in-person services beyond that radius are excluded.
    Remote/online services are always included regardless of distance.
    """
    return await service_booking_service.list_services(
        category=category,
        subcategory=subcategory,
        mode=mode,
        city=city,
        locality=locality,
        radius_km=radius_km,
        search=search
    )

@router.get("/my-offerings", response_model=List[ServiceResponse])
async def get_my_offerings(
    current_user: Dict[str, Any] = Depends(require_role(["senior"]))
):
    """
    Senior views all their offered managed services.
    """
    return await service_booking_service.get_senior_services(current_user)

@router.get("/my-class-rosters", response_model=List[ClassBatchRosterResponse])
async def get_my_class_rosters(
    current_user: Dict[str, Any] = Depends(require_role(["senior"]))
):
    """
    Senior views class rosters with all enrolled students, capacity limits, and individual progress.
    """
    return await service_booking_service.get_senior_class_rosters(current_user)

@router.get("/{id}", response_model=ServiceResponse)
async def get_service(id: str):
    """
    Public service offering detail endpoint.
    """
    return await service_booking_service.get_service_by_id(id)

@router.post("", response_model=ServiceResponse, status_code=status.HTTP_201_CREATED)
async def create_service(
    req: ServiceCreateRequest,
    current_user: Dict[str, Any] = Depends(require_role(["senior"]))
):
    """
    Senior provider publishes a managed service offering.
    """
    return await service_booking_service.create_service(current_user, req)

@router.delete("/{id}")
async def delete_service(
    id: str,
    current_user: Dict[str, Any] = Depends(require_role(["senior"]))
):
    """
    Senior removes an offered service listing.
    """
    return await service_booking_service.delete_service(current_user, id)

@router.post("/ai-suggest", response_model=AISuggestServiceResponse)
async def suggest_service(req: AISuggestServiceRequest):
    """
    AI assistant converting senior skills into structured managed service packages.
    """
    from app.ai.service_ai import service_ai
    return await service_ai.generate_service(req.raw_idea)

@router.post("/bookings", response_model=BookingResponse, status_code=status.HTTP_201_CREATED)
async def create_booking(
    req: BookingCreateRequest,
    current_user: Dict[str, Any] = Depends(get_current_user)
):
    """
    Customer requests a managed service session (e.g. 1-on-1 Telugu tuition).
    """
    return await service_booking_service.create_booking(current_user, req)

@router.get("/bookings/my-bookings", response_model=List[BookingResponse])
async def get_my_bookings(
    current_user: Dict[str, Any] = Depends(get_current_user)
):
    """
    Customer views their scheduled sessions and completed bookings.
    """
    return await service_booking_service.get_customer_bookings(current_user)

@router.get("/bookings/senior-sessions", response_model=List[BookingResponse])
async def get_senior_sessions(
    current_user: Dict[str, Any] = Depends(require_role(["senior"]))
):
    """
    Senior guru views incoming teaching and mentoring requests.
    """
    return await service_booking_service.get_senior_sessions(current_user)

@router.put("/bookings/{id}/status", response_model=BookingResponse)
async def update_booking_status(
    id: str,
    req: BookingStatusUpdateRequest,
    current_user: Dict[str, Any] = Depends(require_role(["senior"]))
):
    """
    Senior accepts booking or updates session status: requested -> accepted -> scheduled -> in_progress -> completed.
    """
    return await service_booking_service.update_booking_status(current_user, id, req)

@router.put("/bookings/{id}/progress", response_model=BookingResponse)
async def mark_session_progress(
    id: str,
    req: MarkSessionProgressRequest,
    current_user: Dict[str, Any] = Depends(require_role(["senior"]))
):
    """
    Senior guru marks off completed sessions/classes (e.g. 1/3, 2/3, 3/3).
    """
    return await service_booking_service.mark_session_progress(current_user, id, req)

@router.put("/bookings/{id}/cancel", response_model=BookingResponse)
async def cancel_booking(
    id: str,
    current_user: Dict[str, Any] = Depends(get_current_user)
):
    """
    Customer or Senior cancels a service booking.
    """
    return await service_booking_service.cancel_booking(current_user, id)

@router.post("/bookings/{id}/review", response_model=BookingResponse)
async def review_booking(
    id: str,
    req: BookingReviewRequest,
    current_user: Dict[str, Any] = Depends(get_current_user)
):
    """
    Customer submits rating and review after session completion.
    """
    return await service_booking_service.submit_booking_review(current_user, id, req)
