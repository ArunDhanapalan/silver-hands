import React from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag, Filter } from 'lucide-react';
import { useLocation } from '../context/LocationContext';

export default function StorePage() {
  const { selectedCity } = useLocation();
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-base-content">Local Store</h1>
          <p className="text-sm text-base-content/70">Authentic homemade products from verified seniors in {selectedCity.name}</p>
        </div>
      </div>
      <div className="p-8 text-center bg-base-100 rounded-2xl border border-base-300">
        <ShoppingBag className="w-10 h-10 text-secondary mx-auto mb-2" />
        <h3 className="font-bold">Store Module</h3>
        <p className="text-xs text-base-content/70">Preparing local marketplace inventory...</p>
      </div>
    </div>
  );
}
