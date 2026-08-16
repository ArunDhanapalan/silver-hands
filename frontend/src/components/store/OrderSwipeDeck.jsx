import React, { useState, useEffect } from 'react';
import { 
  Check, 
  X, 
  Package, 
  MapPin, 
  Clock, 
  RotateCcw, 
  DollarSign, 
  Sparkles,
  Phone,
  ChefHat
} from 'lucide-react';
import confetti from 'canvas-confetti';

export default function OrderSwipeDeck({ orders = [], onAccept, onDecline, loading }) {
  const [currentIndex, setCurrentIndex] = useState(() => orders.length - 1);
  const [swipeOffset, setSwipeOffset] = useState({ x: 0, y: 0, rotating: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  useEffect(() => {
    setCurrentIndex(orders.length - 1);
  }, [orders]);

  const handleAction = (direction) => {
    if (currentIndex < 0 || currentIndex >= orders.length) return;
    const order = orders[currentIndex];

    if (direction === 'right') {
      try {
        confetti({
          particleCount: 45,
          spread: 65,
          origin: { y: 0.7 }
        });
      } catch (e) {}
      onAccept(order.id);
    } else {
      onDecline(order.id);
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
        <span className="loading loading-spinner loading-lg text-secondary"></span>
        <p className="mt-4 text-xs font-semibold text-base-content/70">Checking incoming customer orders...</p>
      </div>
    );
  }

  if (!orders.length || currentIndex < 0) {
    return (
      <div className="card bg-base-100 border border-base-300 shadow-sm rounded-3xl p-8 text-center max-w-md mx-auto space-y-4">
        <div className="w-16 h-16 rounded-full bg-secondary/10 text-secondary flex items-center justify-center mx-auto text-2xl">
          📦
        </div>
        <div>
          <h3 className="text-lg font-extrabold text-base-content">All Incoming Orders Reviewed!</h3>
          <p className="text-xs text-base-content/70 mt-1 max-w-xs mx-auto">
            Accepted orders are ready in your live preparation pipeline.
          </p>
        </div>
      </div>
    );
  }

  const currentOrder = orders[currentIndex];
  const nextOrder = currentIndex > 0 ? orders[currentIndex - 1] : null;

  return (
    <div className="flex flex-col items-center justify-center w-full max-w-md mx-auto space-y-4">
      
      {/* Swipe Deck Stage */}
      <div className="relative w-full h-[460px] select-none">
        
        {/* Next Card Background Preview */}
        {nextOrder && (
          <div className="absolute top-0 left-0 w-full h-full z-10 opacity-70 scale-95 translate-y-3 pointer-events-none transition-all">
            <div className="w-full h-full bg-base-100 rounded-3xl border border-base-300 shadow-md p-6 flex flex-col justify-between overflow-hidden">
              <div>
                <span className="badge badge-secondary badge-sm font-bold text-[10px]">
                  Order #{nextOrder.order_number || nextOrder.id.slice(-6).toUpperCase()}
                </span>
                <h3 className="text-lg font-black text-base-content mt-1">₹{nextOrder.total_amount} • {nextOrder.customer_name}</h3>
                <p className="text-xs text-base-content/60">{nextOrder.items?.map(i => `${i.product_title} × ${i.quantity}`).join(', ')}</p>
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
          className="absolute top-0 left-0 w-full h-full z-20 bg-base-100 rounded-3xl border-2 border-secondary/40 shadow-xl p-6 flex flex-col justify-between overflow-hidden"
        >
          {/* Swipe Stamp Indicators */}
          {swipeOffset.x > 30 && (
            <div 
              className="absolute top-6 left-6 z-30 border-4 border-success text-success px-4 py-1.5 rounded-2xl font-black text-lg tracking-widest rotate-[-12deg] bg-base-100/90 shadow-md"
              style={{ opacity: Math.min(1, (swipeOffset.x - 30) / 45) }}
            >
              ACCEPT ORDER
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
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-secondary">
                  Customer Order Request
                </span>
                <h3 className="text-xl font-black text-base-content mt-0.5">
                  #{currentOrder.order_number || currentOrder.id.slice(-6).toUpperCase()}
                </h3>
              </div>
              <div className="text-right">
                <div className="text-2xl font-black text-primary">₹{currentOrder.total_amount}</div>
                <span className="text-[10px] text-success font-bold">UPI / Cash on Delivery</span>
              </div>
            </div>

            {/* Customer & Address */}
            <div className="bg-base-200/70 rounded-2xl p-3.5 space-y-1.5 text-xs border border-base-300">
              <div className="flex justify-between">
                <span className="text-base-content/60">Customer:</span>
                <strong className="text-base-content">{currentOrder.customer_name}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-base-content/60">Delivery:</span>
                <strong className="text-base-content text-right max-w-[200px] truncate">{currentOrder.delivery_address || 'Adyar'}, {currentOrder.delivery_locality || 'Chennai'}</strong>
              </div>
              {currentOrder.customer_phone && (
                <div className="flex justify-between">
                  <span className="text-base-content/60">Phone:</span>
                  <strong className="text-base-content">{currentOrder.customer_phone}</strong>
                </div>
              )}
            </div>

            {/* Items List */}
            <div className="space-y-1.5">
              <span className="text-[11px] font-bold text-base-content/70 uppercase">Ordered Products:</span>
              <div className="space-y-1 max-h-36 overflow-y-auto pr-1">
                {currentOrder.items?.map((item, i) => (
                  <div key={i} className="flex items-center justify-between text-xs p-2 rounded-xl bg-base-200/50">
                    <span className="font-semibold text-base-content">{item.product_title} × {item.quantity}</span>
                    <span className="font-bold text-primary">₹{item.price_per_unit * item.quantity}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Bottom Swipe Guidance */}
          <div className="text-center pt-2 border-t border-base-200">
            <span className="text-[11px] text-base-content/60 font-semibold">
              👈 Swipe Left (Decline) • Swipe Right (Accept) 👉
            </span>
          </div>

        </div>

      </div>

      {/* Manual Button Triggers */}
      <div className="flex items-center justify-center gap-6 pt-2">
        <button
          type="button"
          onClick={() => handleAction('left')}
          className="btn btn-circle btn-lg btn-outline btn-error shadow-md hover:scale-110 transition-transform"
          title="Decline Order"
          aria-label="Decline Order"
        >
          <X className="w-6 h-6 stroke-[3]" />
        </button>

        <button
          type="button"
          onClick={() => handleAction('right')}
          className="btn btn-circle btn-lg btn-success text-white shadow-lg hover:scale-110 transition-transform ring-4 ring-success/20"
          title="Accept Order"
          aria-label="Accept Order"
        >
          <Check className="w-6 h-6 stroke-[3]" />
        </button>
      </div>

    </div>
  );
}
