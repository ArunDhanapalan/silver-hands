import React from 'react';
import { Users } from 'lucide-react';
import { useLocation } from '../context/LocationContext';

export default function CommunityPage() {
  const { selectedCity } = useLocation();
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-base-content">Regional Skill Community</h1>
        <p className="text-sm text-base-content/70">Local requests, workshops & complementary skill collaborations in {selectedCity.name}</p>
      </div>
      <div className="p-8 text-center bg-base-100 rounded-2xl border border-base-300">
        <Users className="w-10 h-10 text-primary mx-auto mb-2" />
        <h3 className="font-bold">Community Board</h3>
        <p className="text-xs text-base-content/70">Connecting local demand with experienced hands...</p>
      </div>
    </div>
  );
}
