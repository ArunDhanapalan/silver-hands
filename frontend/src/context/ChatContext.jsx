import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import api from '../api/client';

const ChatContext = createContext({
  conversations: [],
  activeConversation: null,
  messages: [],
  isChatDrawerOpen: false,
  totalUnreadCount: 0,
  loading: false,
  openChatDrawer: () => {},
  closeChatDrawer: () => {},
  openChatWith: () => {},
  selectConversation: () => {},
  sendMessage: () => {},
  refreshConversations: () => {}
});

export function ChatProvider({ children }) {
  const { user, isAuthenticated } = useAuth();
  
  const [conversations, setConversations] = useState([]);
  const [activeConversation, setActiveConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [isChatDrawerOpen, setIsChatDrawerOpen] = useState(false);
  const [totalUnreadCount, setTotalUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);

  const currentUserId = user?.id || user?.sub || user?._id;

  const clearChatState = () => {
    setConversations([]);
    setActiveConversation(null);
    setMessages([]);
    setTotalUnreadCount(0);
    setIsChatDrawerOpen(false);
  };

  const fetchConversations = async () => {
    if (!isAuthenticated || !currentUserId) {
      clearChatState();
      return;
    }
    try {
      const data = await api.get('/chat/conversations').catch(() => []);
      const convList = Array.isArray(data) ? data : [];
      setConversations(convList);
      
      const unreadTotal = convList.reduce((acc, c) => acc + (c.unread_count || 0), 0);
      setTotalUnreadCount(unreadTotal);

      // Maintain active conversation without wiping unread count on startup
      setActiveConversation(prev => {
        if (prev && convList.some(c => String(c.id) === String(prev.id))) {
          return prev;
        }
        return convList.length > 0 ? convList[0] : null;
      });
    } catch (err) {
      console.warn('Failed to load conversations:', err);
    }
  };

  const fetchMessages = async (convId, markAsRead = false) => {
    if (!convId || !isAuthenticated) return;
    try {
      const data = await api.get(`/chat/conversations/${convId}/messages`);
      setMessages(Array.isArray(data) ? data : []);

      // Only clear unread count if user actively opened the chat drawer
      if (markAsRead) {
        setConversations(prev => {
          const updated = prev.map(c => String(c.id) === String(convId) ? { ...c, unread_count: 0 } : c);
          const unreadTotal = updated.reduce((acc, c) => acc + (c.unread_count || 0), 0);
          setTotalUnreadCount(unreadTotal);
          return updated;
        });
      }
    } catch (err) {
      console.error('Failed to load messages for conversation:', err);
    }
  };

  // When user logs out or switches accounts, immediately wipe all existing messages and state
  useEffect(() => {
    if (!isAuthenticated || !currentUserId) {
      clearChatState();
    } else {
      fetchConversations();
      const interval = setInterval(fetchConversations, 5000);
      return () => clearInterval(interval);
    }
  }, [isAuthenticated, currentUserId]);

  useEffect(() => {
    if (isChatDrawerOpen && activeConversation?.id && isAuthenticated) {
      fetchMessages(activeConversation.id, true);
      const interval = setInterval(() => {
        fetchMessages(activeConversation.id, true);
      }, 3000);
      return () => clearInterval(interval);
    }
  }, [activeConversation?.id, isAuthenticated, isChatDrawerOpen]);

  const openChatDrawer = async (initialConv = null) => {
    if (!isAuthenticated) return;
    setIsChatDrawerOpen(true);
    try {
      const data = await api.get('/chat/conversations').catch(() => []);
      const convList = Array.isArray(data) ? data : [];
      setConversations(convList);

      let targetConv = initialConv;
      if (!targetConv && convList.length > 0) {
        targetConv = activeConversation && convList.some(c => String(c.id) === String(activeConversation.id))
          ? activeConversation
          : convList[0];
      }

      if (targetConv) {
        setActiveConversation(targetConv);
        await fetchMessages(targetConv.id);
      }
    } catch (e) {
      console.warn('Error opening chat drawer:', e);
    }
  };

  const closeChatDrawer = () => {
    setIsChatDrawerOpen(false);
  };

  const selectConversation = (conv) => {
    if (!conv) {
      setActiveConversation(null);
      setMessages([]);
      return;
    }
    setActiveConversation(conv);
    if (conv?.id) {
      fetchMessages(conv.id);
    }
  };

  const openChatWith = async (recipientId, contextType = 'collaboration', contextTitle = 'Direct Connection', initialMessage = '') => {
    if (!isAuthenticated) {
      alert('Please sign in to start a direct message.');
      return;
    }
    setLoading(true);
    try {
      const conv = await api.post('/chat/conversations', {
        recipient_id: recipientId,
        context_type: contextType,
        context_title: contextTitle,
        initial_message: initialMessage || undefined
      });
      
      await fetchConversations();
      setActiveConversation(conv);
      setIsChatDrawerOpen(true);
      if (conv?.id) {
        await fetchMessages(conv.id);
      }
    } catch (err) {
      console.error('Failed to start chat conversation:', err);
      alert(err.message || 'Unable to open conversation thread.');
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async (content) => {
    if (!activeConversation?.id || !content.trim()) return;
    try {
      const newMsg = await api.post(`/chat/conversations/${activeConversation.id}/messages`, {
        content: content.trim()
      });
      setMessages(prev => [...prev, newMsg]);
      fetchConversations();
      return newMsg;
    } catch (err) {
      console.error('Failed to send message:', err);
      throw err;
    }
  };

  return (
    <ChatContext.Provider
      value={{
        conversations,
        activeConversation,
        messages,
        isChatDrawerOpen,
        totalUnreadCount,
        loading,
        openChatDrawer,
        closeChatDrawer,
        openChatWith,
        selectConversation,
        sendMessage,
        refreshConversations: fetchConversations
      }}
    >
      {children}
    </ChatContext.Provider>
  );
}

export const useChat = () => useContext(ChatContext);
