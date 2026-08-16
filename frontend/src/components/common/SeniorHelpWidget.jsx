import React, { useState } from 'react';
import { 
  HelpCircle, 
  X, 
  Send, 
  MessageSquare, 
  Phone, 
  ShieldCheck, 
  Sparkles, 
  CheckCircle2,
  Clock,
  HeartHandshake
} from 'lucide-react';

export default function SeniorHelpWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: 'bot',
      text: 'Hello! Welcome to SilverHands Senior Care & Help Desk. How can our team assist you today?',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [submittedQuery, setSubmittedQuery] = useState(false);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    const userMsg = {
      id: Date.now(),
      sender: 'user',
      text: inputText.trim(),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setInputText('');
    setSubmittedQuery(true);

    // Friendly automated coordinator response
    setTimeout(() => {
      setMessages(prev => [
        ...prev,
        {
          id: Date.now() + 1,
          sender: 'bot',
          text: `Thank you! Ticket #SH-HLP-${Math.floor(1000 + Math.random() * 9000)} has been logged. Our senior volunteer coordinator has received your message and will review it shortly.`,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    }, 600);
  };

  const handleQuickQuestion = (question) => {
    setInputText(question);
  };

  return (
    <>
      {/* Floating Help Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`btn btn-circle shadow-xl border-2 transition-all flex items-center justify-center min-h-[48px] min-w-[48px] ${
          isOpen 
            ? 'btn-neutral text-white border-base-300' 
            : 'bg-primary text-white border-primary/30 hover:scale-105 hover:bg-primary/90 shadow-primary/20'
        }`}
        aria-label="SilverHands Help Desk & Senior Assistance"
        title="SilverHands Help Desk & Senior Assistance"
      >
        {isOpen ? <X className="w-5 h-5 stroke-[2.5]" /> : <HelpCircle className="w-6 h-6 stroke-[2.5]" />}
      </button>

      {/* Senior-Friendly Simple Chat Popover */}
      {isOpen && (
        <div className="absolute bottom-16 right-0 w-80 sm:w-96 max-w-[calc(100vw-2rem)] bg-base-100 border-2 border-primary/30 rounded-3xl p-4 sm:p-5 shadow-2xl space-y-4 animate-in fade-in slide-in-from-bottom-3 duration-200 z-[99999]">
          
          {/* Header */}
          <div className="flex items-center justify-between pb-3 border-b border-base-200">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-2xl bg-primary/10 text-primary flex items-center justify-center font-bold">
                <HeartHandshake className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-extrabold text-sm text-base-content flex items-center gap-1.5">
                  SilverHands Help Desk
                  <span className="w-2 h-2 rounded-full bg-success animate-pulse"></span>
                </h3>
                <p className="text-[10px] text-base-content/60">Live Assistance for Seniors & Members</p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="btn btn-ghost btn-xs btn-circle text-base-content/70 hover:text-base-content min-h-[32px] min-w-[32px]"
              aria-label="Close help desk"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Chat Stream */}
          <div className="space-y-3 max-h-60 overflow-y-auto pr-1 text-xs">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
              >
                <div
                  className={`p-3 rounded-2xl max-w-[85%] leading-relaxed ${
                    msg.sender === 'user'
                      ? 'bg-primary text-white rounded-br-none shadow-sm'
                      : 'bg-base-200/80 text-base-content border border-base-300 rounded-bl-none'
                  }`}
                >
                  {msg.text}
                </div>
                <span className="text-[9px] text-base-content/40 mt-1 px-1">{msg.time}</span>
              </div>
            ))}
          </div>

          {/* Quick FAQ Chips */}
          <div className="space-y-1.5 pt-1 border-t border-base-200">
            <span className="text-[10px] font-bold text-base-content/60 uppercase">Quick Questions:</span>
            <div className="flex flex-wrap gap-1.5">
              <button
                type="button"
                onClick={() => handleQuickQuestion('How do I accept a class booking?')}
                className="btn btn-xs btn-outline rounded-xl text-[10px] min-h-[28px]"
              >
                Accepting classes
              </button>
              <button
                type="button"
                onClick={() => handleQuickQuestion('When is payout settled to my ledger?')}
                className="btn btn-xs btn-outline rounded-xl text-[10px] min-h-[28px]"
              >
                Earnings & payout
              </button>
              <button
                type="button"
                onClick={() => handleQuickQuestion('How to list homemade food or crafts?')}
                className="btn btn-xs btn-outline rounded-xl text-[10px] min-h-[28px]"
              >
                Listing products
              </button>
            </div>
          </div>

          {/* Input Form */}
          <form onSubmit={handleSendMessage} className="flex items-center gap-2 pt-2 border-t border-base-200">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Type your question or query here..."
              className="input input-sm input-bordered flex-1 rounded-2xl text-xs min-h-[42px] focus:border-primary"
            />
            <button
              type="submit"
              disabled={!inputText.trim()}
              className="btn btn-primary btn-sm rounded-2xl text-white min-h-[42px] px-3.5 shadow-sm"
              aria-label="Send query"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>

        </div>
      )}
    </>
  );
}
