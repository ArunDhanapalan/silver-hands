import React from 'react';

export default function LoadingSpinner({ message = 'Loading...', size = 'lg' }) {
  const sizeClass = size === 'sm' ? 'loading-sm' : size === 'md' ? 'loading-md' : 'loading-lg';
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center" role="status" aria-live="polite">
      <span className={`loading loading-spinner text-primary ${sizeClass}`}></span>
      {message && <p className="mt-3 text-sm font-medium text-base-content/70">{message}</p>}
    </div>
  );
}
