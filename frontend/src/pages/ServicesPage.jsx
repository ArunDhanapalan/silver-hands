import React from 'react';
import { Sparkles } from 'lucide-react';
import { useLocation } from '../context/LocationContext';

export default function ServicesPage() {
  const { selectedCity } = useLocation();
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-base-content">Managed Service Bouquets</h1>
        <p className="text-sm text-base-content/70">1-on-1 Online Tuition, Bookkeeping Mentoring & Traditional Arts in {selectedCity.name}</p>
      </div>
      <div className="p-8 text-center bg-base-100 rounded-2xl border border-base-300">
        <Sparkles className="w-10 h-10 text-accent mx-auto mb-2" />
        <h3 className="font-bold">Services Directory</h3>
        <p className="text-xs text-base-content/70">Managed bookings & learning sessions...</p>
      </div>
    </div>
  );
}
