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

  const fetchConversations = async () => {
    if (!isAuthenticated) {
      setConversations([]);
      setTotalUnreadCount(0);
      return;
    }
    try {
      const data = await api.get('/chat/conversations').catch(() => []);
      const convList = Array.isArray(data) ? data : [];
      setConversations(convList);
      
      const unreadTotal = convList.reduce((acc, c) => acc + (c.unread_count || 0), 0);
      setTotalUnreadCount(unreadTotal);
    } catch (err) {
      console.warn('Failed to load conversations:', err);
    }
  };

  const fetchMessages = async (convId) => {
    if (!convId || !isAuthenticated) return;
    try {
      const data = await api.get(`/chat/conversations/${convId}/messages`);
      setMessages(Array.isArray(data) ? data : []);
      // Refresh conversations to update unread status
      fetchConversations();
    } catch (err) {
      console.error('Failed to load messages for conversation:', err);
    }
  };

  useEffect(() => {
    fetchConversations();
  }, [isAuthenticated, user?.sub]);

  useEffect(() => {
    if (activeConversation?.id) {
      fetchMessages(activeConversation.id);
      const interval = setInterval(() => {
        fetchMessages(activeConversation.id);
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [activeConversation?.id]);

  const openChatDrawer = (initialConv = null) => {
    setIsChatDrawerOpen(true);
    fetchConversations();
    if (initialConv) {
      setActiveConversation(initialConv);
    } else if (!activeConversation && conversations.length > 0) {
      setActiveConversation(conversations[0]);
    }
  };

  const closeChatDrawer = () => {
    setIsChatDrawerOpen(false);
  };

  const selectConversation = (conv) => {
    setActiveConversation(conv);
    fetchMessages(conv.id);
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
        fetchMessages(conv.id);
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
