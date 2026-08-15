import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';

export default function ErrorAlert({ message, onRetry }) {
  if (!message) return null;
  return (
    <div className="alert alert-error shadow-sm rounded-xl my-4 text-sm" role="alert">
      <AlertCircle className="w-5 h-5 shrink-0" />
      <span className="flex-1 font-medium">{message}</span>
      {onRetry && (
        <button 
          onClick={onRetry} 
          className="btn btn-xs btn-outline btn-neutral gap-1"
          aria-label="Retry operation"
        >
          <RefreshCw className="w-3.5 h-3.5" /> Retry
        </button>
      )}
    </div>
  );
}
