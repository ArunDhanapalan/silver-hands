import React from 'react';
import { CheckCircle2, Clock, Truck, ChefHat, Package, Check, X, AlertCircle } from 'lucide-react';

const ORDER_STEPS = [
  { key: 'pending', label: 'Placed', icon: Clock },
  { key: 'accepted', label: 'Accepted', icon: Check },
  { key: 'preparing', label: 'Preparing', icon: ChefHat },
  { key: 'ready', label: 'Ready', icon: Package },
  { key: 'delivered', label: 'Handover', icon: Truck },
  { key: 'completed', label: 'Completed', icon: CheckCircle2 }
];

const SERVICE_STEPS = [
  { key: 'requested', label: 'Requested', icon: Clock },
  { key: 'accepted', label: 'Accepted', icon: Check },
  { key: 'in_progress', label: 'Classes In Progress', icon: ChefHat },
  { key: 'completed', label: 'Completed', icon: CheckCircle2 }
];

export default function StatusFlowBar({ currentStatus, type = 'order', totalSessions = 1, completedSessions = 0 }) {
  const steps = type === 'service' ? SERVICE_STEPS : ORDER_STEPS;
  const isCancelled = currentStatus === 'cancelled';

  if (isCancelled) {
    return (
      <div className="bg-error/10 border border-error/25 rounded-2xl p-3 flex items-center gap-2.5 text-error text-xs font-bold">
        <AlertCircle className="w-4 h-4 shrink-0" />
        <span>This {type === 'service' ? 'class booking' : 'order'} was cancelled / declined.</span>
      </div>
    );
  }

  // Find index of current status
  const currentIdx = steps.findIndex(s => s.key === currentStatus);
  const activeIdx = currentIdx >= 0 ? currentIdx : 0;

  return (
    <div className="w-full py-2">
      <div className="flex items-center justify-between relative">
        
        {/* Background Connecting Bar */}
        <div className="absolute top-1/2 left-4 right-4 h-1 bg-base-300 -translate-y-1/2 z-0" />

        {/* Active Progress Bar */}
        <div 
          className="absolute top-1/2 left-4 h-1 bg-success -translate-y-1/2 transition-all duration-500 z-0"
          style={{ width: `${(activeIdx / (steps.length - 1)) * 100}%` }}
        />

        {/* Steps */}
        {steps.map((step, idx) => {
          const isPassed = idx < activeIdx;
          const isCurrent = idx === activeIdx;
          const isUpcoming = idx > activeIdx;

          return (
            <div key={step.key} className="flex flex-col items-center relative z-10">
              <div 
                className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-xs font-black transition-all ${
                  isPassed 
                    ? 'bg-success text-white ring-2 ring-success/30' 
                    : isCurrent 
                    ? 'bg-primary text-white ring-4 ring-primary/25 shadow-md scale-110' 
                    : 'bg-base-200 text-base-content/40 border border-base-300'
                }`}
              >
                {isPassed ? (
                  <Check className="w-3.5 h-3.5 sm:w-4 sm:h-4 stroke-[3]" />
                ) : (
                  <span>{idx + 1}</span>
                )}
              </div>

              <span className={`text-[10px] sm:text-[11px] font-bold mt-1.5 whitespace-nowrap text-center ${
                isCurrent 
                  ? 'text-primary font-black scale-105' 
                  : isPassed 
                  ? 'text-success' 
                  : 'text-base-content/50'
              }`}>
                {step.key === 'in_progress' && totalSessions > 1 
                  ? `Class (${completedSessions}/${totalSessions})`
                  : step.label
                }
              </span>
            </div>
          );
        })}

      </div>
    </div>
  );
}
