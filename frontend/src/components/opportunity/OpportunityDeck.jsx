import React, { useState, useRef } from 'react';
import { 
  Check, 
  X, 
  Info, 
  Sparkles, 
  MapPin, 
  Clock, 
  Banknote, 
  Building, 
  ArrowRight,
  RotateCcw,
  Layers,
  ShieldCheck
} from 'lucide-react';
import confetti from 'canvas-confetti';

export default function OpportunityDeck({ opportunities = [], onSwipe, onReset, loading }) {
  const [currentIndex, setCurrentIndex] = useState(() => opportunities.length - 1);
  const [selectedOpp, setSelectedOpp] = useState(null);
  const [swipeOffset, setSwipeOffset] = useState({ x: 0, y: 0, rotating: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  React.useEffect(() => {
    setCurrentIndex(opportunities.length - 1);
  }, [opportunities]);

  const handleAction = (direction) => {
    if (currentIndex < 0 || currentIndex >= opportunities.length) return;
    const opp = opportunities[currentIndex];
    const action = direction === 'right' ? 'interested' : 'pass';

    if (direction === 'right') {
      try {
        confetti({
          particleCount: 45,
          spread: 65,
          origin: { y: 0.7 }
        });
      } catch (e) {}
    }

    onSwipe(opp.id, action);
    setCurrentIndex(prev => prev - 1);
    setSwipeOffset({ x: 0, y: 0, rotating: 0 });
  };

  // Mouse & Touch Drag Handlers
  const handleTouchStart = (e) => {
    const touch = e.touches ? e.touches[0] : e;
    setIsDragging(true);
    setDragStart({ x: touch.clientX, y: touch.clientY });
  };

  const handleTouchMove = (e) => {
    if (!isDragging) return;
    const touch = e.touches ? e.touches[0] : e;
    const deltaX = touch.clientX - dragStart.x;
    const deltaY = touch.clientY - dragStart.y;
    const rot = (deltaX / 250) * 15;
    setSwipeOffset({ x: deltaX, y: deltaY, rotating: rot });
  };

  const handleTouchEnd = () => {
    if (!isDragging) return;
    setIsDragging(false);

    if (swipeOffset.x > 65) {
      // Swiped Right
      handleAction('right');
    } else if (swipeOffset.x < -65) {
      // Swiped Left
      handleAction('left');
    } else {
      // Snap back
      setSwipeOffset({ x: 0, y: 0, rotating: 0 });
    }
  };

  useEffect(() => {
    if (isDragging) {
      const handleGlobalMove = (e) => handleTouchMove(e);
      const handleGlobalEnd = () => handleTouchEnd();
      window.addEventListener('mousemove', handleGlobalMove);
      window.addEventListener('mouseup', handleGlobalEnd);
      window.addEventListener('touchmove', handleGlobalMove);
      window.addEventListener('touchend', handleGlobalEnd);
      return () => {
        window.removeEventListener('mousemove', handleGlobalMove);
        window.removeEventListener('mouseup', handleGlobalEnd);
        window.removeEventListener('touchmove', handleGlobalMove);
        window.removeEventListener('touchend', handleGlobalEnd);
      };
    }
  }, [isDragging, swipeOffset, dragStart]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-12 bg-base-100 rounded-3xl border border-base-300 shadow-sm max-w-md mx-auto">
        <span className="loading loading-spinner loading-lg text-primary"></span>
        <p className="mt-4 text-xs font-semibold text-base-content/70">Matching personalized opportunities...</p>
      </div>
    );
  }

  if (!opportunities.length || currentIndex < 0) {
    return (
      <div className="card bg-base-100 border border-base-300 shadow-sm rounded-3xl p-8 text-center max-w-md mx-auto space-y-4">
        <div className="w-16 h-16 rounded-full bg-primary/10 text-primary flex items-center justify-center mx-auto text-2xl">
          🎉
        </div>
        <div>
          <h3 className="text-lg font-bold text-base-content">You've Reviewed All Current Matches!</h3>
          <p className="text-xs text-base-content/70 mt-1 max-w-xs mx-auto">
            You can review your accepted opportunities in Active Work or reopen the deck.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-2 pt-2">
          <button 
            onClick={onReset}
            className="btn btn-outline btn-sm rounded-xl gap-1 text-xs w-full sm:w-auto font-bold"
          >
            <RotateCcw className="w-3.5 h-3.5" /> Re-open Deck
          </button>
        </div>
      </div>
    );
  }

  const currentOpp = opportunities[currentIndex];
  const nextOpp = currentIndex > 0 ? opportunities[currentIndex - 1] : null;

  return (
    <div className="flex flex-col items-center justify-center w-full max-w-md mx-auto space-y-4">
      
      {/* Deck Stage */}
      <div className="relative w-full h-[470px] select-none">
        
        {/* Next Card Background Preview */}
        {nextOpp && (
          <div className="absolute top-0 left-0 w-full h-full z-10 opacity-70 scale-95 translate-y-3 pointer-events-none transition-all">
            <div className="w-full h-full bg-base-100 rounded-3xl border border-base-300 shadow-md p-5 flex flex-col justify-between overflow-hidden">
              <div className="space-y-2">
                <span className="badge badge-primary badge-sm font-bold text-[11px]">
                  <Sparkles className="w-3 h-3 mr-1" /> {nextOpp.match_score}% Match
                </span>
                <h3 className="text-lg font-extrabold text-base-content line-clamp-2">{nextOpp.title}</h3>
                <p className="text-xs text-base-content/60">{nextOpp.posted_by_name} • {nextOpp.locality}</p>
              </div>
              <div className="text-lg font-extrabold text-success">
                ₹{nextOpp.pay_amount.toLocaleString('en-IN')}/{nextOpp.pay_unit}
              </div>
            </div>
          </div>
        )}

        {/* Top Active Swipe Card */}
        {currentOpp && (
          <div
            onMouseDown={handleTouchStart}
            onMouseMove={handleTouchMove}
            onMouseUp={handleTouchEnd}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            style={{
              transform: `translate3d(${swipeOffset.x}px, ${swipeOffset.y * 0.4}px, 0px) rotate(${swipeOffset.rotating}deg)`,
              transition: isDragging ? 'none' : 'transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
            }}
            className="absolute top-0 left-0 w-full h-full z-20 cursor-grab active:cursor-grabbing"
          >
            <div className="w-full h-full bg-base-100 rounded-3xl border-2 border-base-300 shadow-xl p-5 flex flex-col justify-between overflow-hidden relative">
              
              {/* Swipe Direction Indicators Overlay */}
              {swipeOffset.x > 40 && (
                <div className="absolute top-4 right-4 z-30 badge badge-success badge-lg text-white font-extrabold rotate-12 shadow-lg gap-1">
                  <Check className="w-5 h-5" /> INTERESTED
                </div>
              )}
              {swipeOffset.x < -40 && (
                <div className="absolute top-4 left-4 z-30 badge badge-error badge-lg text-white font-extrabold -rotate-12 shadow-lg gap-1">
                  <X className="w-5 h-5" /> PASS
                </div>
              )}

              {/* Header */}
              <div className="space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <span className="badge badge-primary badge-sm font-bold gap-1 text-[11px] py-2 px-2.5 shadow-xs">
                    <Sparkles className="w-3 h-3" /> {currentOpp.match_score}% Match
                  </span>
                  
                  <span className={`badge badge-sm font-bold text-[10px] uppercase py-2 px-2 ${
                    currentOpp.work_mode === 'online' ? 'badge-accent text-white' : 'badge-neutral'
                  }`}>
                    {currentOpp.work_mode === 'online' ? '💻 Online' : `📍 ${currentOpp.distance_km || 2.5} km away`}
                  </span>
                </div>

                <h3 className="text-lg sm:text-xl font-extrabold text-base-content line-clamp-2 leading-snug pt-1">
                  {currentOpp.title}
                </h3>
                
                <p className="text-xs text-base-content/60 flex items-center gap-1">
                  <Building className="w-3.5 h-3.5 text-primary shrink-0" />
                  <span className="font-semibold text-base-content/80">{currentOpp.posted_by_name}</span>
                  <span>•</span>
                  <span>{currentOpp.locality}, {currentOpp.city}</span>
                </p>
              </div>

              {/* AI Explainable Rationale Pill */}
              <div className="bg-primary/10 border border-primary/20 rounded-2xl p-3 text-[11px] text-base-content/85 space-y-1">
                <p className="font-bold text-primary flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5" /> Why this matches you:
                </p>
                <p className="leading-tight text-base-content/80">
                  {currentOpp.match_explanation}
                </p>
              </div>

              {/* Skills Tags */}
              <div className="space-y-1.5">
                <div className="flex flex-wrap gap-1.5 max-h-16 overflow-hidden">
                  {currentOpp.required_skills.map((skill, i) => (
                    <span key={i} className="badge badge-ghost badge-sm text-[10px] font-medium">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              {/* Pay & Schedule Footer */}
              <div className="pt-3 border-t border-base-200 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-base-content/60 uppercase font-bold block">Remuneration</span>
                  <span className="text-lg font-extrabold text-success flex items-center">
                    ₹{currentOpp.pay_amount.toLocaleString('en-IN')}
                    <span className="text-xs font-semibold text-base-content/70 ml-1">/ {currentOpp.pay_unit}</span>
                  </span>
                </div>

                <div className="text-right">
                  <span className="text-[10px] text-base-content/60 uppercase font-bold block">Schedule</span>
                  <span className="text-xs font-semibold text-base-content/80 flex items-center gap-1">
                    <Clock className="w-3 h-3 text-secondary" /> {currentOpp.schedule}
                  </span>
                </div>
              </div>

            </div>
          </div>
        )}

      </div>

      {/* Tactile Action Buttons for Senior Ergonomics (48x48px min) */}
      <div className="flex items-center justify-center gap-6 pt-2">
        {/* Pass Button */}
        <button
          type="button"
          onClick={() => handleAction('left')}
          className="btn btn-circle btn-lg bg-base-100 hover:bg-error/15 border-2 border-error text-error shadow-md transition-transform hover:scale-110 active:scale-95"
          aria-label="Pass on this opportunity"
        >
          <X className="w-7 h-7 stroke-[2.5]" />
        </button>

        {/* Info Modal Button */}
        <button
          type="button"
          onClick={() => setSelectedOpp(currentOpp)}
          className="btn btn-circle btn-md bg-base-100 hover:bg-base-200 border-2 border-base-300 text-base-content/70 shadow-sm"
          aria-label="View opportunity details"
        >
          <Info className="w-5 h-5" />
        </button>

        {/* Interested / Apply Button */}
        <button
          type="button"
          onClick={() => handleAction('right')}
          className="btn btn-circle btn-lg bg-primary hover:bg-primary-focus border-2 border-primary text-white shadow-lg transition-transform hover:scale-110 active:scale-95"
          aria-label="Interested in this opportunity"
        >
          <Check className="w-7 h-7 stroke-[2.5]" />
        </button>
      </div>

      <div className="text-[11px] text-base-content/50 font-medium flex items-center gap-2 text-center pt-1">
        <span>👈 Drag left to pass</span>
        <span>•</span>
        <span>👉 Drag right if interested</span>
      </div>

      {/* Opportunity Details Modal */}
      {selectedOpp && (
        <div className="modal modal-open z-50">
          <div className="modal-box rounded-3xl max-w-lg p-6 space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <span className="badge badge-primary badge-sm font-bold text-white mb-1">
                  {selectedOpp.match_score}% Match
                </span>
                <h3 className="font-extrabold text-xl text-base-content">{selectedOpp.title}</h3>
                <p className="text-xs text-base-content/60">{selectedOpp.posted_by_name} • {selectedOpp.locality}</p>
              </div>
              <button 
                onClick={() => setSelectedOpp(null)}
                className="btn btn-sm btn-circle btn-ghost"
              >
                ✕
              </button>
            </div>

            <div className="space-y-2 text-xs">
              <h4 className="font-bold text-base-content">Description</h4>
              <p className="text-base-content/80 leading-relaxed">{selectedOpp.description}</p>
            </div>

            <div className="space-y-2 text-xs">
              <h4 className="font-bold text-base-content">Required Skills</h4>
              <div className="flex flex-wrap gap-1">
                {selectedOpp.required_skills.map((s, i) => (
                  <span key={i} className="badge badge-neutral badge-sm text-[11px] font-medium">
                    {s}
                  </span>
                ))}
              </div>
            </div>

            <div className="modal-action flex items-center justify-between pt-2">
              <button 
                type="button"
                onClick={() => setSelectedOpp(null)} 
                className="btn btn-ghost btn-sm rounded-xl text-xs"
              >
                Close
              </button>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    handleAction('left');
                    setSelectedOpp(null);
                  }}
                  className="btn btn-outline btn-error btn-sm rounded-xl text-xs font-bold"
                >
                  Pass
                </button>
                <button
                  type="button"
                  onClick={() => {
                    handleAction('right');
                    setSelectedOpp(null);
                  }}
                  className="btn btn-primary btn-sm rounded-xl text-white font-bold text-xs"
                >
                  Take on Work
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
