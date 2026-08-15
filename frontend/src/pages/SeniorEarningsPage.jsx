import React from 'react';
import { TrendingUp } from 'lucide-react';

export default function SeniorEarningsPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Earnings & Work Summary</h1>
      <div className="p-8 text-center bg-base-100 rounded-2xl border border-base-300">
        <TrendingUp className="w-10 h-10 text-success mx-auto mb-2" />
        <h3 className="font-bold">Livelihood Summary</h3>
        <p className="text-xs text-base-content/70">Track completed tuition sessions, products sold & work payouts...</p>
      </div>
    </div>
  );
}
