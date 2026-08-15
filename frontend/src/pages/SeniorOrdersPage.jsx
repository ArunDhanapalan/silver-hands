import React from 'react';
import { Package } from 'lucide-react';

export default function SeniorOrdersPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Manage Customer Orders</h1>
      <div className="p-8 text-center bg-base-100 rounded-2xl border border-base-300">
        <Package className="w-10 h-10 text-secondary mx-auto mb-2" />
        <h3 className="font-bold">Live Order Tracker</h3>
        <p className="text-xs text-base-content/70">Manage state from accepted to preparing to delivered...</p>
      </div>
    </div>
  );
}
