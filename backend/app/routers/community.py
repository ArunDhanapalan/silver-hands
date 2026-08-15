from typing import List, Optional, Dict, Any
from fastapi import APIRouter, Depends, Query, status
from app.schemas.community import (
    PostCreateRequest,
    PostResponse,
    CommentCreateRequest,
    CommentResponse,
    CollaborationPairResponse,
    ConnectCollaborationRequest,
    DemandSignalResponse
)
from app.services.community_service import community_service
from app.security import get_current_user, require_role

router = APIRouter(prefix="/community", tags=["Regional Community & Collaborations"])

@router.get("/posts", response_model=List[PostResponse])
async def list_posts(
    city: Optional[str] = Query(None),
    locality: Optional[str] = Query(None),
    type: Optional[str] = Query(None)
):
    """
    Public regional community posts feed (Needs, Offers, Workshops, Collaborations).
    """
    return await community_service.list_posts(city=city, locality=locality, post_type=type)

@router.post("/posts", response_model=PostResponse, status_code=status.HTTP_201_CREATED)
async def create_post(
    req: PostCreateRequest,
    current_user: Dict[str, Any] = Depends(get_current_user)
):
    """
    Creates a new community post. 'Need' posts automatically generate demand signals.
    """
    return await community_service.create_post(current_user, req)

@router.get("/posts/{id}/comments", response_model=List[CommentResponse])
async def list_comments(id: str):
    """
    Retrieves comments for a specific community post.
    """
    return await community_service.list_comments(id)

@router.post("/posts/{id}/comments", response_model=CommentResponse, status_code=status.HTTP_201_CREATED)
async def add_comment(
    id: str,
    req: CommentCreateRequest,
    current_user: Dict[str, Any] = Depends(get_current_user)
):
    """
    Adds a comment to a community post.
    """
    return await community_service.add_comment(current_user, id, req)

@router.get("/collaborations", response_model=List[CollaborationPairResponse])
async def get_collaborations(
    current_user: Dict[str, Any] = Depends(require_role(["senior"]))
):
    """
    AI-driven senior-to-senior complementary skill match recommendations.
    """
    return await community_service.get_collaboration_matches(current_user)

@router.post("/collaborations/connect")
async def connect_collaboration(
    req: ConnectCollaborationRequest,
    current_user: Dict[str, Any] = Depends(require_role(["senior"]))
):
    """
    Proposes collaboration to a complementary senior partner.
    """
    return await community_service.connect_collaboration(current_user, req)
