import React from 'react';
import { Layers } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function SeniorDashboardPage() {
  const { user } = useAuth();
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-base-content">Welcome, {user?.full_name || 'Senior'}</h1>
        <p className="text-sm text-base-content/70">Explore personalized nearby opportunities and managed livelihood requests</p>
      </div>
      <div className="p-8 text-center bg-base-100 rounded-2xl border border-base-300">
        <Layers className="w-10 h-10 text-warning mx-auto mb-2" />
        <h3 className="font-bold">Opportunity Deck</h3>
        <p className="text-xs text-base-content/70">Swipe through matched jobs, tutoring & local work...</p>
      </div>
    </div>
  );
}
