import React, { useState, useEffect, useRef } from 'react';
import { 
  X, 
  Send, 
  ShieldCheck, 
  ShieldAlert, 
  MessageSquare, 
  User, 
  Briefcase, 
  Sparkles, 
  ArrowLeft,
  Clock,
  CheckCheck,
  AlertTriangle
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useChat } from '../../context/ChatContext';

export default function ChatDrawer() {
  const { user } = useAuth();
  const { 
    conversations, 
    activeConversation, 
    messages, 
    isChatDrawerOpen, 
    closeChatDrawer, 
    selectConversation, 
    sendMessage 
  } = useChat();

  const [inputContent, setInputContent] = useState('');
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isChatDrawerOpen) {
      scrollToBottom();
    }
  }, [messages, isChatDrawerOpen]);

  if (!isChatDrawerOpen) return null;

  const handleSend = async (e) => {
    e.preventDefault();
    if (!inputContent.trim() || sending) return;
    setSending(true);
    try {
      await sendMessage(inputContent);
      setInputContent('');
    } catch (err) {
      alert(err.message || 'Failed to send message.');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[999999] bg-black/70 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200">
      <div className="bg-base-100 border border-base-300 w-full sm:max-w-4xl h-[92vh] sm:h-[80vh] rounded-t-3xl sm:rounded-3xl shadow-2xl flex flex-col overflow-hidden">
        
        {/* Top Header */}
        <div className="p-4 bg-base-200/80 border-b border-base-300 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-primary/10 text-primary flex items-center justify-center font-bold text-lg">
              💬
            </div>
            <div>
              <h2 className="font-extrabold text-base text-base-content flex items-center gap-2">
                SilverHands Safe Direct Chat
                <span className="badge badge-success badge-xs font-bold text-white text-[10px] gap-1 px-1.5 py-0.5">
                  <ShieldCheck className="w-3 h-3" /> Anti-Scam Guard
                </span>
              </h2>
              <p className="text-[11px] text-base-content/60">
                Encrypted connections for skill collaborations, local needs, & verified interview invites.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={closeChatDrawer}
            className="btn btn-ghost btn-sm btn-circle text-base-content/70 hover:text-base-content min-h-[40px] min-w-[40px]"
            aria-label="Close messages"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body: Split View (Conversations List on Left, Active Chat on Right) */}
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
          
          {/* Left Sidebar: Threads List */}
          <div className={`w-full md:w-80 border-r border-base-300 bg-base-100 flex flex-col ${activeConversation ? 'hidden md:flex' : 'flex'}`}>
            <div className="p-3 border-b border-base-200 text-xs font-bold text-base-content/70 uppercase">
              Conversations ({conversations.length})
            </div>

            <div className="flex-1 overflow-y-auto divide-y divide-base-200">
              {conversations.length === 0 ? (
                <div className="p-6 text-center text-xs text-base-content/60 space-y-2">
                  <p>No active conversations yet.</p>
                  <p className="text-[11px]">
                    Connect with seniors via Skill Passport Collab cards, Community Need posts, or Company Interview invites.
                  </p>
                </div>
              ) : (
                conversations.map((conv) => {
                  const isSelected = activeConversation?.id === conv.id;
                  return (
                    <button
                      key={conv.id}
                      type="button"
                      onClick={() => selectConversation(conv)}
                      className={`w-full p-3.5 text-left transition-all flex items-start gap-3 min-h-[64px] ${
                        isSelected 
                          ? 'bg-primary/10 border-l-4 border-primary' 
                          : 'hover:bg-base-200/60'
                      }`}
                    >
                      <div className="w-10 h-10 rounded-2xl bg-base-300 text-base-content flex items-center justify-center font-bold text-sm shrink-0">
                        {conv.other_user_name?.charAt(0) || 'U'}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-0.5">
                          <h4 className="font-extrabold text-xs text-base-content truncate">
                            {conv.other_user_name}
                          </h4>
                          <span className="badge badge-ghost badge-xs text-[10px] font-bold">
                            {conv.other_user_role}
                          </span>
                        </div>

                        {conv.context_title && (
                          <span className="text-[10px] font-semibold text-primary block truncate mb-1">
                            {conv.context_type === 'collaboration' && '🤝 Collab: '}
                            {conv.context_type === 'need_post' && '📢 Need: '}
                            {conv.context_type === 'interview_invite' && '💼 Interview: '}
                            {conv.context_title}
                          </span>
                        )}

                        <p className="text-[11px] text-base-content/60 truncate">
                          {conv.last_message || 'Conversation thread'}
                        </p>
                      </div>

                      {conv.unread_count > 0 && (
                        <span className="badge badge-error badge-xs text-white font-bold text-[10px] min-w-[18px] h-[18px] rounded-full p-0 flex items-center justify-center">
                          {conv.unread_count}
                        </span>
                      )}
                    </button>
                  );
                })
              )}
            </div>
          </div>

          {/* Right Main Pane: Active Chat Messages */}
          <div className={`flex-1 flex flex-col bg-base-200/30 ${!activeConversation ? 'hidden md:flex items-center justify-center p-8 text-center text-base-content/60' : 'flex'}`}>
            {!activeConversation ? (
              <div className="space-y-2">
                <MessageSquare className="w-12 h-12 text-base-content/30 mx-auto" />
                <h3 className="font-bold text-base text-base-content">Select a conversation</h3>
                <p className="text-xs text-base-content/60 max-w-sm">
                  Start a direct chat from community collaboration cards, need postings, or candidate profiles.
                </p>
              </div>
            ) : (
              <>
                {/* Active Chat Header */}
                <div className="p-3.5 bg-base-100 border-b border-base-200 flex items-center justify-between shadow-xs">
                  <div className="flex items-center gap-2.5">
                    <button
                      type="button"
                      onClick={() => selectConversation(null)}
                      className="md:hidden btn btn-ghost btn-xs btn-circle"
                      aria-label="Back to conversations"
                    >
                      <ArrowLeft className="w-4 h-4" />
                    </button>

                    <div className="w-9 h-9 rounded-xl bg-primary text-white flex items-center justify-center font-bold text-xs">
                      {activeConversation.other_user_name?.charAt(0) || 'U'}
                    </div>

                    <div>
                      <div className="flex items-center gap-1.5">
                        <h3 className="font-extrabold text-xs sm:text-sm text-base-content">
                          {activeConversation.other_user_name}
                        </h3>
                        <span className="badge badge-primary badge-outline badge-xs text-[10px] font-bold">
                          {activeConversation.other_user_role}
                        </span>
                      </div>
                      <span className="text-[10px] text-base-content/60 block truncate">
                        Topic: <strong>{activeConversation.context_title || 'Direct Chat'}</strong>
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 text-[10px] font-bold text-success bg-success/10 px-2 py-1 rounded-xl">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>Protected</span>
                  </div>
                </div>

                {/* Safety Advisory Banner */}
                <div className="bg-warning/10 border-b border-warning/20 px-4 py-2 text-[11px] text-base-content/80 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-warning shrink-0" />
                  <span>
                    <strong>Elder Safety Reminder:</strong> Never share OTPs, bank passwords, or UPI PINs. SilverHands verifies members for mutual safety.
                  </span>
                </div>

                {/* Messages Stream */}
                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                  {messages.length === 0 ? (
                    <div className="text-center py-8 text-xs text-base-content/50 italic">
                      No messages yet in this discussion. Say hello!
                    </div>
                  ) : (
                    messages.map((msg) => {
                      const isMe = msg.sender_id === user?.sub;
                      return (
                        <div
                          key={msg.id}
                          className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                        >
                          <div className="flex items-center gap-1.5 mb-0.5 px-1">
                            <span className="text-[10px] font-bold text-base-content/70">
                              {isMe ? 'You' : msg.sender_name}
                            </span>
                            <span className="text-[9px] text-base-content/40">
                              {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>

                          <div
                            className={`p-3 rounded-2xl max-w-[85%] text-xs sm:text-sm leading-relaxed ${
                              isMe
                                ? 'bg-primary text-white rounded-br-none shadow-xs'
                                : 'bg-base-100 text-base-content border border-base-300 rounded-bl-none shadow-xs'
                            }`}
                          >
                            {msg.content}
                          </div>

                          {/* Scam Warning Banner if message was flagged */}
                          {msg.is_flagged && msg.safety_warning && (
                            <div className="mt-1 max-w-[85%] bg-error/15 border border-error/30 text-error rounded-xl p-2 text-[10px] flex items-start gap-1.5">
                              <ShieldAlert className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                              <span>{msg.safety_warning}</span>
                            </div>
                          )}
                        </div>
                      );
                    })
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Message Input Form */}
                <form onSubmit={handleSend} className="p-3 bg-base-100 border-t border-base-200 flex items-center gap-2">
                  <input
                    type="text"
                    value={inputContent}
                    onChange={(e) => setInputContent(e.target.value)}
                    placeholder="Type your message (OTPs/PINs strictly filtered for safety)..."
                    className="input input-bordered flex-1 rounded-2xl text-xs sm:text-sm min-h-[46px] focus:border-primary"
                    disabled={sending}
                  />
                  <button
                    type="submit"
                    disabled={!inputContent.trim() || sending}
                    className="btn btn-primary rounded-2xl text-white min-h-[46px] px-5 font-bold text-xs gap-1.5 shadow-sm"
                    aria-label="Send message"
                  >
                    {sending ? (
                      <span className="loading loading-spinner loading-xs"></span>
                    ) : (
                      <>
                        <Send className="w-4 h-4" /> Send
                      </>
                    )}
                  </button>
                </form>

              </>
            )}
          </div>

        </div>

      </div>
    </div>
  );
}
