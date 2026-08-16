from typing import List, Optional
from pydantic import BaseModel, Field

class StartConversationRequest(BaseModel):
    recipient_id: str = Field(..., description="Target user ID to start conversation with")
    context_type: str = Field(..., description="Access context: collaboration | need_post | interview_invite")
    context_title: Optional[str] = Field(None, description="Optional title or topic of discussion")
    initial_message: Optional[str] = Field(None, description="Optional first message content")

class SendMessageRequest(BaseModel):
    content: str = Field(..., min_length=1, max_length=2000, description="Message text")

class ChatMessageResponse(BaseModel):
    id: str
    conversation_id: str
    sender_id: str
    sender_name: str
    sender_role: str
    content: str
    created_at: str
    is_read: bool = False
    is_flagged: bool = False
    safety_warning: Optional[str] = None

class ConversationResponse(BaseModel):
    id: str
    participant_ids: List[str]
    other_user_id: str
    other_user_name: str
    other_user_role: str
    context_type: str
    context_title: Optional[str] = None
    last_message: Optional[str] = None
    last_message_time: Optional[str] = None
    unread_count: int = 0
    updated_at: str
