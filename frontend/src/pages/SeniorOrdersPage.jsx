import React, { useState, useEffect } from 'react';
import { 
  Package, 
  CheckCircle2, 
  Clock, 
  MapPin, 
  ArrowRight, 
  ChefHat, 
  Truck,
  Phone,
  RefreshCw
} from 'lucide-react';
import api from '../api/client';
import ErrorAlert from '../components/common/ErrorAlert';
import LoadingSpinner from '../components/common/LoadingSpinner';

const NEXT_STATUS_MAP = {
  pending: { next: 'accepted', label: 'Accept Order', color: 'btn-primary' },
  accepted: { next: 'preparing', label: 'Start Preparing', color: 'btn-warning' },
  preparing: { next: 'ready', label: 'Mark Ready for Pickup', color: 'btn-accent' },
  ready: { next: 'delivered', label: 'Handover / Delivered', color: 'btn-success text-white' },
  delivered: { next: 'completed', label: 'Complete & Payout', color: 'btn-success text-white' },
  completed: null
};

export default function SeniorOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);
  const [error, setError] = useState('');
  const [toastMsg, setToastMsg] = useState('');

  const fetchSeniorOrders = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await api.get('/store/orders/senior-orders');
      setOrders(data || []);
    } catch (err) {
      setError(err.message || 'Failed to fetch incoming orders.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSeniorOrders();
  }, []);

  const handleUpdateStatus = async (orderId, nextStatus) => {
    setUpdatingId(orderId);
    try {
      await api.put(`/store/orders/${orderId}/status`, { status: nextStatus });
      setToastMsg(`Order transitioned to "${nextStatus.toUpperCase()}"!`);
      setTimeout(() => setToastMsg(''), 3000);
      fetchSeniorOrders();
    } catch (err) {
      setError(err.message || 'Failed to update order status.');
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      
      {/* Toast */}
      {toastMsg && (
        <div className="toast toast-top toast-center z-50">
          <div className="alert alert-success text-white font-bold text-xs shadow-lg rounded-xl flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" />
            <span>{toastMsg}</span>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-base-200">
        <div>
          <div className="flex items-center gap-2">
            <span className="badge badge-secondary badge-sm font-bold text-white">Seller Hub</span>
            <span className="text-xs text-base-content/60 font-semibold">{orders.length} Orders in Pipeline</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-base-content mt-1">
            Customer Orders Management
          </h1>
          <p className="text-xs sm:text-sm text-base-content/70">
            Accept incoming customer requests and advance product preparation through the live pipeline.
          </p>
        </div>

        <button 
          onClick={fetchSeniorOrders} 
          className="btn btn-ghost btn-sm rounded-xl gap-1 text-xs self-start sm:self-auto"
        >
          <RefreshCw className="w-3.5 h-3.5" /> Refresh
        </button>
      </div>

      <ErrorAlert message={error} onRetry={fetchSeniorOrders} />

      {loading ? (
        <LoadingSpinner message="Fetching customer orders..." />
      ) : orders.length === 0 ? (
        <div className="bg-base-100 rounded-3xl border border-base-300 p-12 text-center space-y-3">
          <Package className="w-14 h-14 text-base-content/30 mx-auto" />
          <h3 className="text-lg font-bold text-base-content">No active customer orders right now</h3>
          <p className="text-xs text-base-content/60 max-w-sm mx-auto">
            When customers place orders for your pickles, festive sweets, or tailored items, they will appear here live!
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => {
            const nextAction = NEXT_STATUS_MAP[order.status];

            return (
              <div 
                key={order.id}
                className="card bg-base-100 border border-base-300 rounded-3xl p-6 shadow-xs space-y-4"
              >
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-base-200">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-xs text-primary">{order.order_number}</span>
                      <span className="badge badge-sm badge-neutral font-bold capitalize">
                        Status: {order.status}
                      </span>
                    </div>
                    <p className="text-xs font-semibold text-base-content/80 mt-1">
                      Customer: <strong>{order.customer_name}</strong> • Phone: {order.customer_phone}
                    </p>
                  </div>

                  <div className="text-right">
                    <span className="text-sm font-extrabold text-success block">
                      Payout: ₹{order.total_amount.toLocaleString('en-IN')}
                    </span>
                    <span className="text-[11px] text-base-content/50">
                      {new Date(order.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>

                {/* Items */}
                <div className="bg-base-200/60 p-3.5 rounded-2xl space-y-1 text-xs">
                  {order.items.map((it, idx) => (
                    <div key={idx} className="flex justify-between items-center text-base-content/90 font-medium">
                      <span>{it.quantity}x {it.product_title}</span>
                      <span className="font-bold">₹{it.price_per_unit * it.quantity}</span>
                    </div>
                  ))}
                  {order.special_notes && (
                    <p className="text-[11px] text-base-content/70 italic pt-1 border-t border-base-300/50 mt-1">
                      📝 Note: "{order.special_notes}"
                    </p>
                  )}
                </div>

                {/* Delivery Locality */}
                <div className="flex items-center justify-between text-xs text-base-content/70">
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-secondary shrink-0" />
                    {order.delivery_address}, {order.delivery_locality}, {order.delivery_city}
                  </span>
                </div>

                {/* State Machine Transition Action Button */}
                <div className="pt-2 flex items-center justify-between">
                  {order.status !== 'completed' && order.status !== 'cancelled' ? (
                    <button
                      type="button"
                      onClick={() => handleUpdateStatus(order.id, 'cancelled')}
                      className="btn btn-ghost btn-sm min-h-[44px] text-error font-bold rounded-xl"
                    >
                      Reject / Cancel Order
                    </button>
                  ) : <div></div>}

                  {nextAction && (
                    <button
                      type="button"
                      disabled={updatingId === order.id}
                      onClick={() => handleUpdateStatus(order.id, nextAction.next)}
                      className={`btn btn-sm rounded-xl font-bold text-xs gap-1.5 shadow-sm ${nextAction.color}`}
                    >
                      {updatingId === order.id ? (
                        <span className="loading loading-spinner loading-xs"></span>
                      ) : (
                        <>
                          <CheckCircle2 className="w-4 h-4" />
                          {nextAction.label} <ArrowRight className="w-3.5 h-3.5" />
                        </>
                      )}
                    </button>
                  )}
                </div>

              </div>
            );
          })}
        </div>
      )}

    </div>
  );
}
