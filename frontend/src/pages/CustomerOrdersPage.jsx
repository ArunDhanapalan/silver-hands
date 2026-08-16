import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Package, 
  Clock, 
  MapPin, 
  CheckCircle2, 
  ShoppingBag, 
  Star, 
  X, 
  ArrowLeft, 
  AlertCircle,
  Truck
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../api/client';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ErrorAlert from '../components/common/ErrorAlert';
import StatusFlowBar from '../components/common/StatusFlowBar';

export default function CustomerOrdersPage() {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [toastMsg, setToastMsg] = useState('');

  // Product Rating Modal
  const [ratingProduct, setRatingProduct] = useState(null); // { productId, title }
  const [starRating, setStarRating] = useState(5);
  const [ratingComment, setRatingComment] = useState('');
  const [submittingRating, setSubmittingRating] = useState(false);

  const fetchOrders = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await api.get('/store/orders/my-orders');
      setOrders(data || []);
    } catch (err) {
      setError(err.message || 'Failed to load your orders');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleCancelOrder = async (orderId) => {
    if (!window.confirm('Are you sure you want to cancel this order?')) return;
    try {
      await api.put(`/store/orders/${orderId}/cancel`, {});
      setToastMsg('Order cancelled successfully.');
      setTimeout(() => setToastMsg(''), 3500);
      fetchOrders();
    } catch (err) {
      setError(err.message || 'Failed to cancel order');
    }
  };

  const handleSubmitProductReview = async (e) => {
    e.preventDefault();
    if (!ratingProduct) return;
    setSubmittingRating(true);
    try {
      await api.post(`/store/products/${ratingProduct.product_id}/review`, {
        rating: starRating,
        comment: ratingComment
      });
      setToastMsg(`Thank you! Review submitted for "${ratingProduct.product_title}".`);
      setTimeout(() => setToastMsg(''), 3500);
      setRatingProduct(null);
      setRatingComment('');
    } catch (err) {
      setError(err.message || 'Failed to submit review');
    } finally {
      setSubmittingRating(false);
    }
  };

  if (loading) {
    return <LoadingSpinner message="Loading your local store orders..." />;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-16">
      
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
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-base-200">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-base-content">
            My Local Store Orders
          </h1>
          <p className="text-xs text-base-content/70 mt-1">
            Track handmade food, festive sweets, tailored garments, and crafts made by verified senior artisans.
          </p>
        </div>

        <Link to="/store" className="btn btn-primary btn-sm rounded-xl text-white font-bold text-xs gap-1.5 shadow-sm">
          <ShoppingBag className="w-4 h-4" /> Explore Local Store
        </Link>
      </div>

      <ErrorAlert message={error} />

      {orders.length === 0 ? (
        <div className="card bg-base-100 border border-base-300 rounded-3xl p-10 text-center space-y-3">
          <ShoppingBag className="w-12 h-12 text-base-content/30 mx-auto" />
          <h3 className="font-bold text-base text-base-content">No orders placed yet</h3>
          <p className="text-xs text-base-content/60 max-w-md mx-auto">
            Browse homemade traditional pickles, sweets, handicrafts, and tailored wear made by local seniors.
          </p>
          <Link to="/store" className="btn btn-primary btn-sm rounded-xl text-white font-bold mt-2">
            Visit Marketplace
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((ord) => (
            <div key={ord.id} className="card bg-base-100 border-2 border-base-300 rounded-3xl p-5 shadow-xs space-y-4">
              
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-extrabold text-primary">#{ord.order_number}</span>
                    <span className="text-[11px] text-base-content/60">{ord.created_at?.slice(0, 10)}</span>
                  </div>
                  <p className="text-xs text-base-content/70 mt-0.5">
                    Delivery to: <strong>{ord.delivery_address}</strong>, {ord.delivery_locality}, {ord.delivery_city}
                  </p>
                </div>

                <div className="flex flex-col sm:items-end gap-1">
                  <span className={`badge badge-sm font-bold uppercase text-[10px] ${
                    ord.status === 'completed' || ord.status === 'delivered' ? 'badge-success text-white' :
                    ord.status === 'cancelled' ? 'badge-error text-white' :
                    'badge-primary text-white'
                  }`}>
                    {ord.status}
                  </span>
                  <span className="text-base font-extrabold text-primary">₹{ord.total_amount?.toLocaleString('en-IN')}</span>
                </div>
              </div>

              {/* Status Flow Progress Bar */}
              <div className="bg-base-200/50 rounded-2xl p-4 border border-base-300">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-base-content/60 block mb-1">
                  Live Delivery Pipeline:
                </span>
                <StatusFlowBar currentStatus={ord.status} type="order" />
              </div>

              {/* Order Items */}
              <div className="bg-base-200/60 rounded-2xl p-3.5 space-y-2 border border-base-300">
                <span className="text-[11px] font-bold text-base-content/70 uppercase">Ordered Products:</span>
                <div className="space-y-2">
                  {ord.items.map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between text-sm pt-2 border-t border-base-300/50">
                      <div>
                        <span className="font-bold text-base-content">{item.product_title}</span>
                        <span className="text-base-content/60 ml-2">x{item.quantity} (by {item.seller_name})</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="font-semibold text-primary">₹{item.price_per_unit * item.quantity}</span>
                        
                        {/* Rate Product Button — ONLY after delivery/completion */}
                        {(ord.status === 'completed' || ord.status === 'delivered') && (
                          <button
                            type="button"
                            onClick={() => setRatingProduct(item)}
                            className="btn btn-sm min-h-[44px] text-warning font-bold gap-1.5 rounded-xl hover:bg-warning/10 border border-warning/30"
                          >
                            <Star className="w-4 h-4 fill-warning" /> Rate
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Order Actions */}
              <div className="flex items-center justify-between pt-2 border-t border-base-200 text-sm">
                <span className="text-base-content/60">Payment: <strong>{ord.payment_method}</strong></span>
                {ord.status !== 'completed' && ord.status !== 'delivered' && ord.status !== 'cancelled' && (
                  <button
                    type="button"
                    onClick={() => handleCancelOrder(ord.id)}
                    className="btn btn-sm min-h-[44px] text-error font-bold rounded-xl border border-error/30"
                  >
                    Cancel Order
                  </button>
                )}
              </div>

            </div>
          ))}
        </div>
      )}

      {/* Rate Product Modal */}
      {ratingProduct && (
        <div className="fixed inset-0 z-[999999] bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-base-100 border border-base-300 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-base-200 pb-2">
              <div>
                <h3 className="font-extrabold text-base text-base-content flex items-center gap-1.5">
                  <Star className="w-4 h-4 text-warning" /> Rate Homemade Product
                </h3>
                <p className="text-xs text-base-content/60">{ratingProduct.product_title}</p>
              </div>
              <button onClick={() => setRatingProduct(null)} className="btn btn-ghost btn-xs btn-circle">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmitProductReview} className="space-y-4">
              <div className="form-control">
                <label className="label text-xs font-bold">Rating (1 to 5 Stars)</label>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      type="button"
                      key={star}
                      onClick={() => setStarRating(star)}
                      className="btn btn-ghost btn-circle btn-sm p-0"
                    >
                      <Star className={`w-6 h-6 ${star <= starRating ? 'text-warning fill-warning' : 'text-base-content/30'}`} />
                    </button>
                  ))}
                  <span className="font-bold text-sm ml-2">{starRating} Stars</span>
                </div>
              </div>

              <div className="form-control">
                <label className="label text-xs font-bold">Your Review & Taste Feedback</label>
                <textarea
                  rows={3}
                  required
                  value={ratingComment}
                  onChange={(e) => setRatingComment(e.target.value)}
                  placeholder="How was the freshness, taste, authenticity, and packaging?"
                  className="textarea textarea-bordered text-xs rounded-xl"
                />
              </div>

              <div className="modal-action pt-2">
                <button type="button" onClick={() => setRatingProduct(null)} className="btn btn-ghost btn-sm rounded-xl">
                  Cancel
                </button>
                <button type="submit" disabled={submittingRating} className="btn btn-primary btn-sm rounded-xl text-white font-bold">
                  {submittingRating ? <span className="loading loading-spinner loading-xs"></span> : 'Submit Product Review'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
