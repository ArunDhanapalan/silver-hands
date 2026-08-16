from typing import List, Dict, Any
from fastapi import APIRouter, Depends, status
from app.schemas.opportunity import (
    OpportunityResponse,
    SwipeActionRequest,
    SwipeActionResponse,
    ApplicationItemResponse,
    OpportunityCreateRequest,
    JobParseRequest,
    InviteCandidateRequest
)
from app.services.matching_service import matching_service
from app.security import require_role

router = APIRouter(prefix="/opportunities", tags=["Livelihood & Opportunity Matching"])

@router.get("/deck", response_model=List[OpportunityResponse])
async def get_deck(
    current_user: Dict[str, Any] = Depends(require_role(["senior"]))
):
    """
    Returns un-swiped opportunities matched to the senior's stored skills, location, and radius.
    """
    return await matching_service.get_opportunity_deck(current_user)

@router.post("/{id}/swipe", response_model=SwipeActionResponse)
async def swipe_opportunity(
    id: str,
    req: SwipeActionRequest,
    current_user: Dict[str, Any] = Depends(require_role(["senior"]))
):
    """
    Records a Left (pass) or Right (interested/applied) swipe on an opportunity card.
    """
    return await matching_service.record_swipe(current_user, id, req)

@router.get("/my-applications", response_model=List[ApplicationItemResponse])
async def get_my_applications(
    current_user: Dict[str, Any] = Depends(require_role(["senior"]))
):
    """
    Returns all active / accepted opportunities for the senior.
    """
    return await matching_service.get_my_applications(current_user)

@router.post("/reset-deck")
async def reset_deck(
    current_user: Dict[str, Any] = Depends(require_role(["senior"]))
):
    """
    Resets previously passed cards so the senior can review them again.
    """
    return await matching_service.reset_deck_swipes(current_user)

@router.post("", status_code=status.HTTP_201_CREATED)
async def create_opportunity(
    req: OpportunityCreateRequest,
    current_user: Dict[str, Any] = Depends(require_role(["company", "senior", "customer"]))
):
    """
    Allows companies to post livelihood opportunities and auto-match them with qualified seniors.
    """
    return await matching_service.create_opportunity(current_user, req)

@router.get("/company-postings")
async def get_company_postings(
    current_user: Dict[str, Any] = Depends(require_role(["company"]))
):
    """
    Retrieves all company postings and active matched senior candidates.
    """
    return await matching_service.get_company_postings(current_user)

@router.post("/invite-candidate")
async def invite_candidate(
    req: InviteCandidateRequest,
    current_user: Dict[str, Any] = Depends(require_role(["company"]))
):
    """
    Company sends an official interview invitation with video classroom link to a matched senior candidate.
    """
    return await matching_service.invite_candidate(current_user, req)

@router.get("/interviews", response_model=List[ApplicationItemResponse])
async def get_interviews(
    current_user: Dict[str, Any] = Depends(require_role(["senior", "company"]))
):
    """
    Retrieves all scheduled corporate interviews with live video room links.
    """
    return await matching_service.get_interviews(current_user)

@router.put("/applications/{id}/cancel")
async def cancel_application(
    id: str,
    current_user: Dict[str, Any] = Depends(require_role(["senior", "company"]))
):
    """
    Cancels or withdraws an application / interview invitation.
    """
    return await matching_service.cancel_application(current_user, id)

@router.post("/parse-job")
async def parse_job_description(
    req: JobParseRequest,
    current_user: Dict[str, Any] = Depends(require_role(["company", "customer"]))
):
    """
    AI parser for unstructured job posts.
    """
    from app.ai.job_description_ai import job_description_ai
    return await job_description_ai.parse_job_posting(req.raw_text)
