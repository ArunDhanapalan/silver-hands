import React, { useState, useMemo, useRef } from 'react';
import TinderCard from 'react-tinder-card';
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
  const [currentIndex, setCurrentIndex] = useState(opportunities.length - 1);
  const [selectedOpp, setSelectedOpp] = useState(null);
  const [lastDirection, setLastDirection] = useState(null);
  
  // Sync index when opportunities change
  React.useEffect(() => {
    setCurrentIndex(opportunities.length - 1);
  }, [opportunities]);

  const currentIndexRef = useRef(currentIndex);
  currentIndexRef.current = currentIndex;

  const childRefs = useMemo(
    () =>
      Array(opportunities.length)
        .fill(0)
        .map(() => React.createRef()),
    [opportunities.length]
  );

  const handleSwiped = (direction, opp, index) => {
    setLastDirection(direction);
    const action = direction === 'right' ? 'interested' : 'pass';
    
    if (direction === 'right') {
      try {
        confetti({
          particleCount: 40,
          spread: 60,
          origin: { y: 0.7 }
        });
      } catch (e) {}
    }

    onSwipe(opp.id, action);
    setCurrentIndex(index - 1);
  };

  const swipeCard = async (dir) => {
    if (currentIndex >= 0 && currentIndex < opportunities.length) {
      const cardRef = childRefs[currentIndex];
      if (cardRef && cardRef.current) {
        await cardRef.current.swipe(dir);
      } else {
        // Fallback programmatic swipe
        handleSwiped(dir, opportunities[currentIndex], currentIndex);
      }
    }
  };

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
            You can check your accepted opportunities in Active Work or review passed cards again.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-2 pt-2">
          <button 
            onClick={onReset}
            className="btn btn-outline btn-sm rounded-xl gap-1 text-xs w-full sm:w-auto"
          >
            <RotateCcw className="w-3.5 h-3.5" /> Re-open Deck
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center w-full max-w-md mx-auto space-y-4">
      
      {/* Deck Swiping Stage */}
      <div className="relative w-full h-[470px]">
        {opportunities.map((opp, index) => {
          const isTopCard = index === currentIndex;
          if (index < currentIndex - 1) return null; // Only render top 2 cards for performance

          return (
            <div
              key={opp.id}
              className={`absolute top-0 left-0 w-full h-full select-none ${
                isTopCard ? 'z-20' : 'z-10 opacity-75 scale-95 translate-y-3'
              }`}
            >
              <TinderCard
                ref={childRefs[index]}
                className="w-full h-full cursor-grab active:cursor-grabbing"
                onSwipe={(dir) => handleSwiped(dir, opp, index)}
                preventSwipe={['up', 'down']}
              >
                <div className="w-full h-full bg-base-100 rounded-3xl border border-base-300 shadow-xl p-5 flex flex-col justify-between overflow-hidden relative transition-all">
                  
                  {/* Festival or Match Header */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <span className="badge badge-primary badge-sm font-bold gap-1 text-[11px] py-2 px-2.5">
                        <Sparkles className="w-3 h-3" /> {opp.match_score}% Match
                      </span>
                      
                      <span className={`badge badge-sm font-bold text-[10px] uppercase py-2 px-2 ${
                        opp.work_mode === 'online' ? 'badge-accent' : 'badge-neutral'
                      }`}>
                        {opp.work_mode === 'online' ? '💻 Online' : `📍 ${opp.distance_km} km away`}
                      </span>
                    </div>

                    <h3 className="text-lg sm:text-xl font-extrabold text-base-content line-clamp-2 leading-snug pt-1">
                      {opp.title}
                    </h3>
                    
                    <p className="text-xs text-base-content/60 flex items-center gap-1">
                      <Building className="w-3.5 h-3.5 text-primary shrink-0" />
                      <span className="font-semibold text-base-content/80">{opp.posted_by_name}</span>
                      <span>•</span>
                      <span>{opp.locality}, {opp.city}</span>
                    </p>
                  </div>

                  {/* Explainable AI Rationale Pill */}
                  <div className="bg-primary/10 border border-primary/20 rounded-2xl p-3 text-[11px] text-base-content/85 space-y-1">
                    <p className="font-bold text-primary flex items-center gap-1">
                      <Sparkles className="w-3.5 h-3.5" /> Why this matches you:
                    </p>
                    <p className="leading-tight text-base-content/80">
                      {opp.match_explanation}
                    </p>
                  </div>

                  {/* Skills tags */}
                  <div className="space-y-1.5">
                    <div className="flex flex-wrap gap-1.5 max-h-16 overflow-hidden">
                      {opp.required_skills.map((skill, i) => (
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
                        ₹{opp.pay_amount.toLocaleString('en-IN')}
                        <span className="text-xs font-semibold text-base-content/70 ml-1">/ {opp.pay_unit}</span>
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] text-base-content/60 uppercase font-bold block">Schedule</span>
                      <span className="text-xs font-bold text-base-content/80">{opp.schedule}</span>
                    </div>
                  </div>

                </div>
              </TinderCard>
            </div>
          );
        })}
      </div>

      {/* Accessible Action Buttons: Pass ❌ | Details ℹ️ | Interested 💚 */}
      <div className="flex items-center justify-center gap-4 pt-2">
        <button
          type="button"
          onClick={() => swipeCard('left')}
          className="btn btn-circle btn-lg bg-base-100 border-2 border-error/40 text-error hover:bg-error hover:text-white shadow-md transition-all active:scale-95"
          aria-label="Pass this opportunity (Swipe Left)"
        >
          <X className="w-7 h-7" />
        </button>

        <button
          type="button"
          onClick={() => setSelectedOpp(opportunities[currentIndex])}
          className="btn btn-circle btn-md bg-base-100 border border-base-300 text-base-content/70 hover:bg-base-200 shadow-sm"
          aria-label="View Opportunity Details"
        >
          <Info className="w-5 h-5" />
        </button>

        <button
          type="button"
          onClick={() => swipeCard('right')}
          className="btn btn-circle btn-lg bg-primary text-white hover:bg-primary/90 shadow-lg ring-4 ring-primary/20 transition-all active:scale-95"
          aria-label="Interested in this opportunity (Swipe Right)"
        >
          <Check className="w-7 h-7 stroke-[3]" />
        </button>
      </div>

      <p className="text-[11px] text-base-content/50 font-medium">
        👈 Swipe Left to Pass • Swipe Right to Accept 👉
      </p>

      {/* Details Modal */}
      {selectedOpp && (
        <div className="modal modal-open z-50">
          <div className="modal-box rounded-3xl max-w-lg p-6 space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <span className="badge badge-primary badge-sm font-bold mb-1">{selectedOpp.match_score}% Match</span>
                <h3 className="text-lg font-bold text-base-content">{selectedOpp.title}</h3>
                <p className="text-xs text-base-content/70">{selectedOpp.posted_by_name} • {selectedOpp.locality}, {selectedOpp.city}</p>
              </div>
              <button 
                onClick={() => setSelectedOpp(null)}
                className="btn btn-sm btn-circle btn-ghost"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs text-base-content/80 leading-relaxed">
              <div>
                <h4 className="font-bold text-base-content mb-1">Description:</h4>
                <p>{selectedOpp.description}</p>
              </div>

              <div className="bg-base-200 p-3 rounded-xl space-y-1">
                <span className="font-bold text-primary block">AI Recommendation Analysis:</span>
                <p>{selectedOpp.match_explanation}</p>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div><strong>Remuneration:</strong> ₹{selectedOpp.pay_amount} / {selectedOpp.pay_unit}</div>
                <div><strong>Schedule:</strong> {selectedOpp.schedule}</div>
                <div><strong>Work Mode:</strong> {selectedOpp.work_mode}</div>
                <div><strong>Distance:</strong> {selectedOpp.distance_km} km</div>
              </div>
            </div>

            <div className="modal-action flex items-center justify-between">
              <button 
                onClick={() => { setSelectedOpp(null); swipeCard('left'); }} 
                className="btn btn-outline btn-error btn-sm rounded-xl"
              >
                <X className="w-3.5 h-3.5" /> Pass
              </button>
              <button 
                onClick={() => { setSelectedOpp(null); swipeCard('right'); }} 
                className="btn btn-primary btn-sm rounded-xl text-white font-bold"
              >
                <Check className="w-3.5 h-3.5" /> I'm Interested & Apply
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
