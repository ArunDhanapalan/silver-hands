import React from 'react';
import { ShoppingBag } from 'lucide-react';

export default function CartPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Shopping Cart & Bookings</h1>
      <div className="p-8 text-center bg-base-100 rounded-2xl border border-base-300">
        <ShoppingBag className="w-10 h-10 text-secondary mx-auto mb-2" />
        <h3 className="font-bold">Managed Checkout & Order Tracking</h3>
        <p className="text-xs text-base-content/70">Review local authentic products & scheduled services...</p>
      </div>
    </div>
  );
}
