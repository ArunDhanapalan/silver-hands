from typing import List, Optional, Dict, Any
from fastapi import APIRouter, Depends, Query, status
from app.schemas.service import (
    ServiceCreateRequest,
    ServiceResponse,
    BookingCreateRequest,
    BookingResponse,
    BookingStatusUpdateRequest,
    BookingReviewRequest
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
    search: Optional[str] = Query(None)
):
    """
    Public directory of managed services across language tuition, mentoring, culinary & handicrafts.
    """
    return await service_booking_service.list_services(
        category=category,
        subcategory=subcategory,
        mode=mode,
        city=city,
        search=search
    )

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
