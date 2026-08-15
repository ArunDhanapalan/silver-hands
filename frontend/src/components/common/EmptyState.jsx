import React from 'react';
import { PackageOpen } from 'lucide-react';

export default function EmptyState({ 
  icon: Icon = PackageOpen, 
  title = "Nothing found here yet", 
  description = "Check back soon or try adjusting your search or filters.", 
  actionLabel, 
  onAction 
}) {
  return (
    <div className="flex flex-col items-center justify-center p-10 text-center bg-base-100/60 rounded-2xl border border-base-300 my-6">
      <div className="w-16 h-16 rounded-full bg-base-200 flex items-center justify-center text-primary/80 mb-4">
        <Icon className="w-8 h-8" />
      </div>
      <h3 className="text-lg font-bold text-base-content">{title}</h3>
      <p className="text-sm text-base-content/70 max-w-sm mt-1 mb-5">{description}</p>
      {actionLabel && onAction && (
        <button onClick={onAction} className="btn btn-primary btn-sm rounded-lg">
          {actionLabel}
        </button>
      )}
    </div>
  );
}
