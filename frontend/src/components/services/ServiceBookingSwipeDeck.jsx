import React, { useState, useEffect } from 'react';
import { 
  Check, 
  X, 
  BookOpen, 
  Clock, 
  MapPin, 
  Sparkles, 
  Video, 
  User, 
  Calendar,
  Layers
} from 'lucide-react';
import confetti from 'canvas-confetti';

export default function ServiceBookingSwipeDeck({ bookings = [], onAccept, onDecline, loading }) {
  const [currentIndex, setCurrentIndex] = useState(() => bookings.length - 1);
  const [swipeOffset, setSwipeOffset] = useState({ x: 0, y: 0, rotating: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  useEffect(() => {
    setCurrentIndex(bookings.length - 1);
  }, [bookings]);

  const handleAction = (direction) => {
    if (currentIndex < 0 || currentIndex >= bookings.length) return;
    const booking = bookings[currentIndex];

    if (direction === 'right') {
      try {
        confetti({
          particleCount: 45,
          spread: 65,
          origin: { y: 0.7 }
        });
      } catch (e) {}
      onAccept(booking.id);
    } else {
      onDecline(booking.id);
    }

    setCurrentIndex(prev => prev - 1);
    setSwipeOffset({ x: 0, y: 0, rotating: 0 });
  };

  // Drag handlers
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

    if (swipeOffset.x > 75) {
      handleAction('right');
    } else if (swipeOffset.x < -75) {
      handleAction('left');
    } else {
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
        <span className="loading loading-spinner loading-lg text-accent"></span>
        <p className="mt-4 text-xs font-semibold text-base-content/70">Checking incoming student bookings...</p>
      </div>
    );
  }

  if (!bookings.length || currentIndex < 0) {
    return (
      <div className="card bg-base-100 border border-base-300 shadow-sm rounded-3xl p-8 text-center max-w-md mx-auto space-y-4">
        <div className="w-16 h-16 rounded-full bg-accent/10 text-accent flex items-center justify-center mx-auto text-2xl">
          🎓
        </div>
        <div>
          <h3 className="text-lg font-extrabold text-base-content">All Student Requests Reviewed!</h3>
          <p className="text-xs text-base-content/70 mt-1 max-w-xs mx-auto">
            Accepted classes and video rooms are ready in your live teaching pipeline.
          </p>
        </div>
      </div>
    );
  }

  const currentBooking = bookings[currentIndex];
  const nextBooking = currentIndex > 0 ? bookings[currentIndex - 1] : null;

  return (
    <div className="flex flex-col items-center justify-center w-full max-w-md mx-auto space-y-4">
      
      {/* Swipe Deck Stage */}
      <div className="relative w-full h-[470px] select-none">
        
        {/* Next Card Background Preview */}
        {nextBooking && (
          <div className="absolute top-0 left-0 w-full h-full z-10 opacity-70 scale-95 translate-y-3 pointer-events-none transition-all">
            <div className="w-full h-full bg-base-100 rounded-3xl border border-base-300 shadow-md p-6 flex flex-col justify-between overflow-hidden">
              <div>
                <span className="badge badge-accent badge-sm font-bold text-[10px]">
                  {nextBooking.booking_reference}
                </span>
                <h3 className="text-lg font-black text-base-content mt-1">{nextBooking.service_title}</h3>
                <p className="text-xs text-base-content/60">Student: {nextBooking.student_name} ({nextBooking.student_age_group})</p>
              </div>
            </div>
          </div>
        )}

        {/* Current Active Top Card */}
        <div
          onMouseDown={handleTouchStart}
          onTouchStart={handleTouchStart}
          style={{
            transform: `translate3d(${swipeOffset.x}px, ${swipeOffset.y * 0.4}px, 0) rotate(${swipeOffset.rotating}deg)`,
            transition: isDragging ? 'none' : 'transform 0.25s ease-out',
            cursor: isDragging ? 'grabbing' : 'grab'
          }}
          className="absolute top-0 left-0 w-full h-full z-20 bg-base-100 rounded-3xl border-2 border-accent/40 shadow-xl p-6 flex flex-col justify-between overflow-hidden"
        >
          {/* Swipe Stamp Indicators */}
          {swipeOffset.x > 30 && (
            <div 
              className="absolute top-6 left-6 z-30 border-4 border-success text-success px-4 py-1.5 rounded-2xl font-black text-lg tracking-widest rotate-[-12deg] bg-base-100/90 shadow-md"
              style={{ opacity: Math.min(1, (swipeOffset.x - 30) / 45) }}
            >
              ACCEPT CLASS
            </div>
          )}

          {swipeOffset.x < -30 && (
            <div 
              className="absolute top-6 right-6 z-30 border-4 border-error text-error px-4 py-1.5 rounded-2xl font-black text-lg tracking-widest rotate-[12deg] bg-base-100/90 shadow-md"
              style={{ opacity: Math.min(1, Math.abs(swipeOffset.x + 30) / 45) }}
            >
              DECLINE
            </div>
          )}

          {/* Card Content */}
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-base-200">
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-accent">
                  Student Class Booking Request
                </span>
                <h3 className="text-xl font-black text-base-content mt-0.5 line-clamp-1">
                  {currentBooking.service_title}
                </h3>
              </div>
              <div className="text-right">
                <div className="text-2xl font-black text-accent">₹{currentBooking.total_amount}</div>
                <span className="text-[10px] text-base-content/60 font-semibold">{currentBooking.sessions_count} sessions</span>
              </div>
            </div>

            {/* Student Details */}
            <div className="bg-base-200/70 rounded-2xl p-3.5 space-y-1.5 text-xs border border-base-300">
              <div className="flex justify-between">
                <span className="text-base-content/60">Student:</span>
                <strong className="text-base-content">{currentBooking.student_name} ({currentBooking.student_age_group})</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-base-content/60">Booked By:</span>
                <strong className="text-base-content">{currentBooking.customer_name}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-base-content/60">Preferred Time:</span>
                <strong className="text-accent">{currentBooking.scheduled_slot}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-base-content/60">Mode:</span>
                <span className="badge badge-xs uppercase font-bold">{currentBooking.mode}</span>
              </div>
            </div>

            <div className="bg-accent/10 border border-accent/20 rounded-xl p-2.5 text-xs text-base-content/80 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-accent shrink-0" />
              <span>1-click video classroom link will be generated upon acceptance.</span>
            </div>
          </div>

          {/* Bottom Guidance */}
          <div className="text-center pt-2 border-t border-base-200">
            <span className="text-[11px] text-base-content/60 font-semibold">
              👈 Swipe Left (Decline) • Swipe Right (Accept Class) 👉
            </span>
          </div>

        </div>

      </div>

      {/* Manual Action Buttons */}
      <div className="flex items-center justify-center gap-6 pt-2">
        <button
          type="button"
          onClick={() => handleAction('left')}
          className="btn btn-circle btn-lg btn-outline btn-error shadow-md hover:scale-110 transition-transform"
          title="Decline Booking"
          aria-label="Decline Booking"
        >
          <X className="w-6 h-6 stroke-[3]" />
        </button>

        <button
          type="button"
          onClick={() => handleAction('right')}
          className="btn btn-circle btn-lg btn-accent text-white shadow-lg hover:scale-110 transition-transform ring-4 ring-accent/20"
          title="Accept Class Booking"
          aria-label="Accept Class Booking"
        >
          <Check className="w-6 h-6 stroke-[3]" />
        </button>
      </div>

    </div>
  );
}
