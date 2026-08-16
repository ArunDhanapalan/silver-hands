import datetime
import logging
from typing import Dict, Any, List, Optional
from fastapi import HTTPException, status
from bson import ObjectId

from app.database import db_manager
from app.schemas.chat import (
    StartConversationRequest,
    SendMessageRequest,
    ChatMessageResponse,
    ConversationResponse
)
from app.services.chat_safety_service import chat_safety_filter

logger = logging.getLogger("silverhands.chat_service")

class ChatService:
    def _conv_col(self):
        return db_manager.get_collection("chat_conversations")

    def _msg_col(self):
        return db_manager.get_collection("chat_messages")

    def _users_col(self):
        return db_manager.get_collection("users")

    def _seniors_col(self):
        return db_manager.get_collection("senior_profiles")

    async def _get_user_info(self, user_id: str) -> Dict[str, str]:
        """Fetch user display name and role."""
        users_col = self._users_col()
        # Try finding by sub/id
        doc = await users_col.find_one({"$or": [{"_id": user_id}, {"sub": user_id}]})
        if not doc and ObjectId.is_valid(user_id):
            doc = await users_col.find_one({"_id": ObjectId(user_id)})
            
        if doc:
            return {
                "name": doc.get("full_name", "Community Member"),
                "role": doc.get("role", "customer")
            }
        
        # Fallback check senior profiles
        seniors_col = self._seniors_col()
        s_doc = await seniors_col.find_one({"$or": [{"user_id": user_id}, {"_id": user_id}]})
        if s_doc:
            return {
                "name": s_doc.get("full_name", "Senior Elder"),
                "role": "senior"
            }

        return {"name": "SilverHands Member", "role": "customer"}

    async def start_or_get_conversation(
        self,
        current_user: Dict[str, Any],
        req: StartConversationRequest
    ) -> ConversationResponse:
        user_id = str(current_user.get("sub"))
        recipient_id = str(req.recipient_id)

        if user_id == recipient_id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Cannot start a conversation with yourself."
            )

        conv_col = self._conv_col()
        now = datetime.datetime.now(datetime.timezone.utc).isoformat()

        # Find existing conversation between these two participants with this context
        existing = await conv_col.find_one({
            "participant_ids": {"$all": [user_id, recipient_id]},
            "context_type": req.context_type
        })

        if not existing:
            # Also check if any existing conversation between these two exists regardless of context
            existing = await conv_col.find_one({
                "participant_ids": {"$all": [user_id, recipient_id]}
            })

        if existing:
            conv_id = str(existing["_id"])
            # If initial message provided, send it
            if req.initial_message:
                await self.send_message(
                    current_user=current_user,
                    conversation_id=conv_id,
                    req=SendMessageRequest(content=req.initial_message)
                )

            other_info = await self._get_user_info(recipient_id)
            return ConversationResponse(
                id=conv_id,
                participant_ids=existing.get("participant_ids", [user_id, recipient_id]),
                other_user_id=recipient_id,
                other_user_name=other_info["name"],
                other_user_role=other_info["role"],
                context_type=existing.get("context_type", req.context_type),
                context_title=existing.get("context_title", req.context_title),
                last_message=existing.get("last_message"),
                last_message_time=existing.get("last_message_time"),
                unread_count=0,
                updated_at=existing.get("updated_at", now)
            )

        # Create new conversation
        other_info = await self._get_user_info(recipient_id)
        my_info = await self._get_user_info(user_id)

        new_doc = {
            "participant_ids": [user_id, recipient_id],
            "participant_details": {
                user_id: my_info,
                recipient_id: other_info
            },
            "context_type": req.context_type,
            "context_title": req.context_title or "Direct Connection",
            "last_message": req.initial_message or "Conversation started.",
            "last_message_time": now,
            "created_at": now,
            "updated_at": now
        }

        res = await conv_col.insert_one(new_doc)
        conv_id = str(res.inserted_id)

        if req.initial_message:
            await self.send_message(
                current_user=current_user,
                conversation_id=conv_id,
                req=SendMessageRequest(content=req.initial_message)
            )

        return ConversationResponse(
            id=conv_id,
            participant_ids=[user_id, recipient_id],
            other_user_id=recipient_id,
            other_user_name=other_info["name"],
            other_user_role=other_info["role"],
            context_type=req.context_type,
            context_title=req.context_title,
            last_message=req.initial_message or "Conversation started.",
            last_message_time=now,
            unread_count=0,
            updated_at=now
        )

    async def get_user_conversations(self, current_user: Dict[str, Any]) -> List[ConversationResponse]:
        user_id = str(current_user.get("sub"))
        conv_col = self._conv_col()
        msg_col = self._msg_col()

        cursor = conv_col.find({"participant_ids": user_id}).sort("updated_at", -1)
        docs = await cursor.to_list(100)

        results = []
        for d in docs:
            conv_id = str(d["_id"])
            participants = d.get("participant_ids", [])
            other_id = next((p for p in participants if p != user_id), user_id)
            
            # Fetch latest info for other user
            other_info = await self._get_user_info(other_id)

            # Count unread messages for current user in this conversation
            unread_c = await msg_col.count_documents({
                "conversation_id": conv_id,
                "receiver_id": user_id,
                "is_read": False
            })

            results.append(
                ConversationResponse(
                    id=conv_id,
                    participant_ids=participants,
                    other_user_id=other_id,
                    other_user_name=other_info["name"],
                    other_user_role=other_info["role"],
                    context_type=d.get("context_type", "direct"),
                    context_title=d.get("context_title"),
                    last_message=d.get("last_message"),
                    last_message_time=d.get("last_message_time"),
                    unread_count=unread_c,
                    updated_at=d.get("updated_at", "")
                )
            )

        return results

    async def get_messages(self, current_user: Dict[str, Any], conversation_id: str) -> List[ChatMessageResponse]:
        user_id = str(current_user.get("sub"))
        conv_col = self._conv_col()
        msg_col = self._msg_col()

        # Validate participation
        conv_obj = ObjectId(conversation_id) if ObjectId.is_valid(conversation_id) else conversation_id
        conv = await conv_col.find_one({"$or": [{"_id": conv_obj}, {"_id": conversation_id}]})
        if not conv:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Conversation thread not found."
            )
        participants = [str(p) for p in conv.get("participant_ids", [])]
        if str(user_id) not in participants:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied to this conversation thread."
            )

        cursor = msg_col.find({"conversation_id": conversation_id}).sort("created_at", 1)
        docs = await cursor.to_list(200)

        # Mark all incoming messages as read
        await msg_col.update_many(
            {"conversation_id": conversation_id, "receiver_id": user_id, "is_read": False},
            {"$set": {"is_read": True}}
        )

        return [
            ChatMessageResponse(
                id=str(m["_id"]),
                conversation_id=m["conversation_id"],
                sender_id=m["sender_id"],
                sender_name=m["sender_name"],
                sender_role=m.get("sender_role", "customer"),
                content=m["content"],
                created_at=m["created_at"],
                is_read=m.get("is_read", True),
                is_flagged=m.get("is_flagged", False),
                safety_warning=m.get("safety_warning")
            )
            for m in docs
        ]

    async def send_message(
        self,
        current_user: Dict[str, Any],
        conversation_id: str,
        req: SendMessageRequest
    ) -> ChatMessageResponse:
        user_id = str(current_user.get("sub"))
        conv_col = self._conv_col()
        msg_col = self._msg_col()

        conv_obj = ObjectId(conversation_id) if ObjectId.is_valid(conversation_id) else conversation_id
        conv = await conv_col.find_one({"$or": [{"_id": conv_obj}, {"_id": conversation_id}]})
        if not conv:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Conversation thread not found."
            )

        participants = [str(p) for p in conv.get("participant_ids", [])]
        logger.info("send_message check: user_id=%s, participants=%s, conv_id=%s", user_id, participants, conversation_id)
        if str(user_id) not in participants:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Access denied to send message in this conversation. user_id={user_id} not in {participants}"
            )

        receiver_id = next((p for p in participants if p != str(user_id)), str(user_id))

        # Run NLP Scam / Phishing Safety Filter
        safety_result = chat_safety_filter.scan_message(req.content)
        content_to_store = safety_result["sanitized_content"]
        is_flagged = safety_result["is_flagged"]
        warning_msg = safety_result["warning_message"]

        sender_info = await self._get_user_info(user_id)
        now = datetime.datetime.now(datetime.timezone.utc).isoformat()

        msg_doc = {
            "conversation_id": conversation_id,
            "sender_id": user_id,
            "sender_name": sender_info["name"],
            "sender_role": sender_info["role"],
            "receiver_id": receiver_id,
            "content": content_to_store,
            "is_read": False,
            "is_flagged": is_flagged,
            "safety_warning": warning_msg,
            "created_at": now
        }

        res = await msg_col.insert_one(msg_doc)
        msg_id = str(res.inserted_id)

        # Update parent conversation summary
        await conv_col.update_one(
            {"$or": [{"_id": conv_obj}, {"_id": conversation_id}]},
            {
                "$set": {
                    "last_message": content_to_store,
                    "last_message_time": now,
                    "updated_at": now
                }
            }
        )

        return ChatMessageResponse(
            id=msg_id,
            conversation_id=conversation_id,
            sender_id=user_id,
            sender_name=sender_info["name"],
            sender_role=sender_info["role"],
            content=content_to_store,
            created_at=now,
            is_read=False,
            is_flagged=is_flagged,
            safety_warning=warning_msg
        )

    async def mark_conversation_as_read(self, current_user: Dict[str, Any], conversation_id: str):
        user_id = str(current_user.get("sub"))
        msg_col = self._msg_col()
        await msg_col.update_many(
            {"conversation_id": conversation_id, "receiver_id": user_id, "is_read": False},
            {"$set": {"is_read": True}}
        )
        return {"status": "ok", "conversation_id": conversation_id}

    async def get_total_unread_count(self, current_user: Dict[str, Any]) -> Dict[str, int]:
        user_id = str(current_user.get("sub"))
        msg_col = self._msg_col()
        count = await msg_col.count_documents({"receiver_id": user_id, "is_read": False})
        return {"unread_count": count}

chat_service = ChatService()
