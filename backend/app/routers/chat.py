from typing import List, Dict, Any
from fastapi import APIRouter, Depends, status
from app.schemas.chat import (
    StartConversationRequest,
    SendMessageRequest,
    ChatMessageResponse,
    ConversationResponse
)
from app.services.chat_service import chat_service
from app.security import get_current_user

router = APIRouter(prefix="/chat", tags=["Direct Messaging & Elder Safe Chat"])

@router.post("/conversations", response_model=ConversationResponse, status_code=status.HTTP_201_CREATED)
async def start_or_get_conversation(
    req: StartConversationRequest,
    current_user: Dict[str, Any] = Depends(get_current_user)
):
    """
    Starts or opens an existing conversation between two users in allowed contexts:
    skill-based senior matching (collab), community need/collab posts, or company interview invites.
    """
    return await chat_service.start_or_get_conversation(current_user, req)

@router.get("/conversations", response_model=List[ConversationResponse])
async def list_conversations(
    current_user: Dict[str, Any] = Depends(get_current_user)
):
    """
    Lists all active conversation threads for the authenticated user.
    """
    return await chat_service.get_user_conversations(current_user)

@router.get("/conversations/{id}/messages", response_model=List[ChatMessageResponse])
async def get_conversation_messages(
    id: str,
    current_user: Dict[str, Any] = Depends(get_current_user)
):
    """
    Retrieves message history for a conversation thread and marks incoming messages as read.
    """
    return await chat_service.get_messages(current_user, id)

@router.post("/conversations/{id}/messages", response_model=ChatMessageResponse, status_code=status.HTTP_201_CREATED)
async def send_message(
    id: str,
    req: SendMessageRequest,
    current_user: Dict[str, Any] = Depends(get_current_user)
):
    """
    Sends a direct message through NLP scam/phishing filter for elder financial and identity safety.
    """
    return await chat_service.send_message(current_user, id, req)

@router.put("/conversations/{id}/read")
async def mark_read(
    id: str,
    current_user: Dict[str, Any] = Depends(get_current_user)
):
    """
    Marks all unread messages in the conversation as read.
    """
    return await chat_service.mark_conversation_as_read(current_user, id)

@router.get("/unread-count")
async def get_unread_count(
    current_user: Dict[str, Any] = Depends(get_current_user)
):
    """
    Returns total unread direct messages count for current user to display in profile card.
    """
    return await chat_service.get_total_unread_count(current_user)
