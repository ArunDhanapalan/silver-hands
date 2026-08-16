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

  const currentUserId = String(user?.id || user?.sub || user?._id || '');
  const currentUserEmail = String(user?.email || '');
  const currentUserName = String(user?.full_name || user?.company_name || '');

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isChatDrawerOpen) {
      scrollToBottom();
    }
  }, [messages, isChatDrawerOpen]);

  // Ensure first conversation is automatically selected and highlighted when drawer opens
  useEffect(() => {
    if (isChatDrawerOpen && conversations.length > 0) {
      const isSelectedInList = activeConversation && conversations.some(c => String(c.id) === String(activeConversation.id));
      if (!activeConversation || !isSelectedInList) {
        selectConversation(conversations[0]);
      }
    }
  }, [isChatDrawerOpen, conversations, activeConversation]);

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
    <div className="fixed inset-0 z-[999999] bg-black/80 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 overflow-hidden animate-in fade-in duration-200">
      <div className="bg-base-100 border border-base-300 w-full max-w-4xl h-[92vh] max-h-[850px] rounded-2xl sm:rounded-3xl shadow-2xl flex flex-col overflow-hidden min-h-0">
        
        {/* Top Header Bar */}
        <div className="px-4 py-3 bg-base-200 border-b border-base-300 flex items-center justify-between shrink-0 shadow-xs">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-2xl bg-primary text-white flex items-center justify-center font-black text-lg shadow-sm shrink-0">
              💬
            </div>
            <div className="min-w-0">
              <h2 className="font-black text-sm sm:text-base text-base-content flex items-center gap-2 truncate">
                <span>SilverHands Safe Direct Chat</span>
                <span className="badge badge-success badge-xs font-bold text-white text-[10px] gap-1 px-2 py-1 shrink-0">
                  <ShieldCheck className="w-3 h-3" /> Anti-Scam Guard
                </span>
              </h2>
              <p className="text-[11px] text-base-content/60 hidden sm:block truncate">
                Encrypted elder-safe chat with automated scam, phone, bank & threat word filtering.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={closeChatDrawer}
            className="btn btn-ghost btn-circle text-base-content/70 hover:text-base-content min-h-[44px] min-w-[44px] flex items-center justify-center shrink-0"
            aria-label="Close messages"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Body: Split View (Conversations List on Left, Active Chat on Right) */}
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden min-h-0 relative">
          
          {/* Left Sidebar: Threads List (Full width on mobile when no chat active, hidden on mobile when chat is active) */}
          <div className={`w-full md:w-80 border-r border-base-300 bg-base-100 flex-col shrink-0 min-h-0 ${activeConversation ? 'hidden md:flex' : 'flex'}`}>
            <div className="p-3.5 border-b border-base-200 text-xs font-extrabold text-base-content/70 uppercase tracking-wider flex items-center justify-between bg-base-200/50 shrink-0">
              <span>Direct Threads</span>
              <span className="badge badge-neutral badge-xs font-bold px-2 py-0.5">{conversations.length}</span>
            </div>

            <div className="flex-1 overflow-y-auto overflow-x-hidden divide-y divide-base-200 min-h-0">
              {conversations.length === 0 ? (
                <div className="p-6 text-center text-xs text-base-content/60 space-y-2">
                  <p className="font-bold text-sm text-base-content">No active conversations yet.</p>
                  <p className="text-xs">
                    Connect with seniors via Skill Passport Collab cards, Community Need posts, or Company Interview invites.
                  </p>
                </div>
              ) : (
                conversations.map((conv) => {
                  const isSelected = Boolean(activeConversation && String(activeConversation.id) === String(conv.id));
                  return (
                    <button
                      key={conv.id}
                      type="button"
                      onClick={() => selectConversation(conv)}
                      className={`w-full p-3.5 text-left transition-all flex items-start gap-3 min-h-[68px] ${
                        isSelected 
                          ? 'bg-primary/20 border-l-4 border-primary shadow-xs' 
                          : 'hover:bg-base-200/80 border-l-4 border-transparent'
                      }`}
                    >
                      <div className={`w-10 h-10 rounded-2xl flex items-center justify-center font-black text-sm shrink-0 ${
                        isSelected ? 'bg-primary text-white shadow-sm' : 'bg-base-300 text-base-content'
                      }`}>
                        {conv.other_user_name?.charAt(0)?.toUpperCase() || 'U'}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-0.5">
                          <h4 className={`text-xs sm:text-sm truncate ${isSelected ? 'font-black text-primary' : 'font-extrabold text-base-content'}`}>
                            {conv.other_user_name}
                          </h4>
                          <span className="badge badge-ghost badge-xs text-[9px] font-bold uppercase shrink-0">
                            {conv.other_user_role}
                          </span>
                        </div>

                        {conv.context_title && (
                          <span className="text-[11px] font-bold text-primary block truncate mb-0.5">
                            {conv.context_type === 'collaboration' && '🤝 Collab: '}
                            {conv.context_type === 'need_post' && '📢 Need: '}
                            {conv.context_type === 'interview_invite' && '💼 Interview: '}
                            {conv.context_title}
                          </span>
                        )}

                        <p className="text-xs text-base-content/60 truncate">
                          {conv.last_message || 'Conversation thread'}
                        </p>
                      </div>

                      {conv.unread_count > 0 && (
                        <span className="badge badge-error badge-xs text-white font-black text-[10px] min-w-[18px] h-[18px] rounded-full p-0 flex items-center justify-center shrink-0">
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
          <div className={`flex-1 flex flex-col bg-base-200/50 min-w-0 min-h-0 overflow-hidden ${!activeConversation ? 'hidden md:flex items-center justify-center p-8 text-center text-base-content/60' : 'flex'}`}>
            {!activeConversation ? (
              <div className="space-y-3 text-center p-6 my-auto">
                <MessageSquare className="w-16 h-16 text-base-content/30 mx-auto" />
                <h3 className="font-extrabold text-lg text-base-content">Select a conversation</h3>
                <p className="text-xs text-base-content/60 max-w-sm mx-auto">
                  Start a direct chat from community collaboration cards, need postings, or candidate profiles.
                </p>
              </div>
            ) : (
              <>
                {/* Active Chat Header */}
                <div className="px-4 py-2.5 bg-base-100 border-b border-base-200 flex items-center justify-between shadow-xs shrink-0 min-w-0">
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <button
                      type="button"
                      onClick={() => selectConversation(null)}
                      className="md:hidden btn btn-ghost btn-circle min-h-[40px] min-w-[40px] shrink-0"
                      aria-label="Back to conversations list"
                    >
                      <ArrowLeft className="w-5 h-5" />
                    </button>

                    <div className="w-9 h-9 rounded-xl bg-primary text-white flex items-center justify-center font-black text-xs shrink-0 shadow-sm">
                      {activeConversation.other_user_name?.charAt(0)?.toUpperCase() || 'U'}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-black text-xs sm:text-sm text-base-content truncate">
                          {activeConversation.other_user_name}
                        </h3>
                        <span className="badge badge-primary badge-outline badge-xs text-[9px] font-bold uppercase shrink-0">
                          {activeConversation.other_user_role}
                        </span>
                      </div>
                      <span className="text-[10px] text-base-content/60 block truncate">
                        Topic: <strong>{activeConversation.context_title || 'Direct Chat'}</strong>
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 text-[10px] font-bold text-success bg-success/15 px-2.5 py-1 rounded-xl shrink-0">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Protected</span>
                  </div>
                </div>

                {/* Safety Advisory Banner */}
                <div className="bg-warning/15 border-b border-warning/20 px-3.5 py-1.5 text-[11px] text-base-content/90 flex items-center gap-2 shrink-0 min-w-0">
                  <AlertTriangle className="w-3.5 h-3.5 text-warning shrink-0" />
                  <span className="text-[10px] sm:text-[11px] font-medium truncate">
                    <strong>Elder Safety Guard:</strong> Aadhaar, PAN, bank accounts, mobile numbers & threats are strictly redacted.
                  </span>
                </div>

                {/* Messages Stream with Strict Left vs Right, Color Separation, and Overflow Bounds */}
                <div className="flex-1 overflow-y-auto overflow-x-hidden p-4 space-y-3.5 min-h-0 min-w-0">
                  {messages.length === 0 ? (
                    <div className="text-center py-16 text-xs text-base-content/50 italic space-y-2">
                      <p className="font-bold text-sm">No messages yet in this discussion.</p>
                      <p className="text-xs">Type a greeting below to start collaborating!</p>
                    </div>
                  ) : (
                    messages.map((msg) => {
                      const isMe = Boolean(
                        (currentUserId && (String(msg.sender_id) === currentUserId || String(msg.sender_id) === String(user?.id) || String(msg.sender_id) === String(user?.sub))) ||
                        (currentUserEmail && String(msg.sender_id) === currentUserEmail) ||
                        (currentUserName && String(msg.sender_name).trim().toLowerCase() === currentUserName.trim().toLowerCase())
                      );

                      return (
                        <div
                          key={msg.id}
                          className={`w-full flex flex-col min-w-0 ${isMe ? 'items-end' : 'items-start'}`}
                        >
                          {/* Sender Meta Info */}
                          <div className={`flex items-center gap-1.5 mb-1 px-1 text-[11px] font-extrabold max-w-[80%] ${isMe ? 'text-primary justify-end' : 'text-base-content/70 justify-start'}`}>
                            <span className="truncate">{isMe ? 'You (Sent)' : msg.sender_name}</span>
                            <span className="text-base-content/40 text-[10px] font-normal shrink-0">
                              {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>

                          {/* Distinct Left vs Right Message Bubbles with Word Break and Boundary Locks */}
                          <div
                            className={`p-3.5 sm:p-4 rounded-3xl text-xs sm:text-sm font-medium leading-relaxed max-w-[85%] sm:max-w-[75%] break-words whitespace-pre-wrap shadow-xs ${
                              isMe
                                ? 'bg-primary text-white rounded-tr-xs shadow-md ml-auto'
                                : 'bg-base-100 text-base-content border-2 border-base-300 rounded-tl-xs shadow-xs mr-auto'
                            }`}
                            style={{ overflowWrap: 'anywhere', wordBreak: 'break-word' }}
                          >
                            {msg.content}
                          </div>

                          {/* Scam Warning Banner if message was flagged */}
                          {msg.is_flagged && msg.safety_warning && (
                            <div className={`mt-1.5 max-w-[85%] sm:max-w-[75%] bg-error/15 border border-error/30 text-error rounded-2xl p-2.5 text-[11px] flex items-start gap-2 break-words ${isMe ? 'ml-auto' : 'mr-auto'}`}>
                              <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" />
                              <span className="font-semibold">{msg.safety_warning}</span>
                            </div>
                          )}
                        </div>
                      );
                    })
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Message Input Form */}
                <form onSubmit={handleSend} className="p-3 bg-base-100 border-t border-base-200 flex items-center gap-2 shrink-0 min-w-0">
                  <input
                    type="text"
                    value={inputContent}
                    onChange={(e) => setInputContent(e.target.value)}
                    placeholder="Type message (Aadhaar/PAN/Bank/Phone filtered for safety)..."
                    className="input input-bordered flex-1 rounded-2xl text-xs sm:text-sm min-h-[46px] focus:border-primary bg-base-100 min-w-0"
                    disabled={sending}
                  />
                  <button
                    type="submit"
                    disabled={!inputContent.trim() || sending}
                    className="btn btn-primary rounded-2xl text-white min-h-[46px] px-5 font-extrabold text-xs sm:text-sm gap-1.5 shadow-md shrink-0"
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
