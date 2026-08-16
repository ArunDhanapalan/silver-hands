import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  ShoppingBag, 
  Sparkles, 
  Package, 
  CheckCircle2, 
  Plus, 
  Trash2, 
  ExternalLink, 
  RefreshCw, 
  Calendar, 
  MapPin, 
  TrendingUp, 
  Clock, 
  Tag, 
  Check, 
  X, 
  AlertCircle,
  Truck,
  ChefHat,
  Phone,
  ShieldCheck,
  ChevronRight,
  ArrowRight,
  ArrowLeft,
  Archive
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLocation } from '../context/LocationContext';
import api from '../api/client';
import AddProductModal from '../components/modals/AddProductModal';
import StatusFlowBar from '../components/common/StatusFlowBar';
import OrderSwipeDeck from '../components/store/OrderSwipeDeck';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ErrorAlert from '../components/common/ErrorAlert';

const NEXT_STATUS_MAP = {
  accepted: { next: 'preparing', label: 'Start Preparing', color: 'btn-warning' },
  preparing: { next: 'ready', label: 'Mark Ready for Pickup', color: 'btn-accent' },
  ready: { next: 'delivered', label: 'Handover / Delivered', color: 'btn-success text-white' },
  delivered: { next: 'completed', label: 'Complete & Payout', color: 'btn-success text-white' }
};

export default function SeniorStorefrontPage() {
  const { user } = useAuth();
  const { selectedCity, activeFestival } = useLocation();

  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [festivalSuggestions, setFestivalSuggestions] = useState(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [toastMsg, setToastMsg] = useState('');

  // Modals
  const [showProductModal, setShowProductModal] = useState(false);
  const [modalSkillHint, setModalSkillHint] = useState('');

  // Active Tab: 'products' | 'pending_requests' | 'active_pipeline' | 'history'
  const [activeTab, setActiveTab] = useState('products');
  const [festivalOnly, setFestivalOnly] = useState(false);
  const [updatingOrderId, setUpdatingOrderId] = useState(null);

  // Incoming Order Swipe Deck Index
  const [pendingCardIndex, setPendingCardIndex] = useState(0);

  const fetchStorefrontData = async () => {
    setLoading(true);
    setError('');
    try {
      const [prodsData, ordsData, festData] = await Promise.all([
        api.get('/store/my-products').catch(() => []),
        api.get('/store/orders/senior-orders').catch(() => []),
        api.get('/festival/suggestions?role=senior').catch(() => null)
      ]);
      setProducts(prodsData || []);
      setOrders(ordsData || []);
      setFestivalSuggestions(festData);
    } catch (err) {
      console.error('Storefront data fetch error:', err);
      setError(err.message || 'Failed to load storefront catalog.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStorefrontData();
  }, [selectedCity?.name, activeFestival]);

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 3500);
  };

  // Delete product
  const handleDeleteProduct = async (productId) => {
    if (!window.confirm('Are you sure you want to remove this product from your storefront?')) return;
    try {
      await api.delete(`/store/products/${productId}`);
      showToast('Product removed from storefront.');
      fetchStorefrontData();
    } catch (err) {
      setError(err.message || 'Failed to remove product.');
    }
  };

  // Order status transition
  const handleUpdateOrderStatus = async (orderId, nextStatus) => {
    setUpdatingOrderId(orderId);
    try {
      await api.put(`/store/orders/${orderId}/status`, { status: nextStatus });
      if (nextStatus === 'accepted') {
        showToast('🎉 Order accepted! Entered live preparation pipeline.');
      } else if (nextStatus === 'completed') {
        showToast('🎉 Order completed! Payout settled to your earnings ledger.');
      } else {
        showToast(`Order updated to "${nextStatus.toUpperCase()}"!`);
      }
      fetchStorefrontData();
    } catch (err) {
      setError(err.message || 'Failed to update order status.');
    } finally {
      setUpdatingOrderId(null);
    }
  };

  // Decline / Cancel order
  const handleCancelOrder = async (orderId) => {
    if (!window.confirm('Are you sure you want to decline/cancel this order?')) return;
    setUpdatingOrderId(orderId);
    try {
      await api.put(`/store/orders/${orderId}/cancel`, {});
      showToast('Order declined / cancelled.');
      fetchStorefrontData();
    } catch (err) {
      setError(err.message || 'Failed to cancel order.');
    } finally {
      setUpdatingOrderId(null);
    }
  };

  // Segregated Order Groups
  const pendingOrders = orders.filter(o => o.status === 'pending');
  const activeOrders = orders.filter(o => ['accepted', 'preparing', 'ready', 'delivered'].includes(o.status));
  const historyOrders = orders.filter(o => ['completed', 'cancelled'].includes(o.status));

  // Filtered Products
  const displayedProducts = festivalOnly 
    ? products.filter(p => p.is_festival_special) 
    : products;

  const currentPending = pendingOrders[pendingCardIndex] || pendingOrders[0];

  if (loading && products.length === 0 && orders.length === 0) {
    return <LoadingSpinner message="Opening your artisan storefront..." />;
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-16">
      
      {/* Toast */}
      {toastMsg && (
        <div className="toast toast-top toast-center z-50">
          <div className="alert alert-success text-white font-bold text-xs shadow-lg rounded-2xl flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" />
            <span>{toastMsg}</span>
          </div>
        </div>
      )}

      {/* Header Banner */}
      <div className="bg-gradient-to-r from-secondary/15 via-base-100 to-primary/15 border border-secondary/20 rounded-3xl p-6 sm:p-8 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="badge badge-secondary badge-sm font-extrabold text-white uppercase text-[10px] tracking-wider px-2.5 py-2">
                🏪 Artisan Storefront
              </span>
              <span className="badge badge-secondary badge-outline badge-sm font-bold text-[10px]">
                {selectedCity?.name || 'Chennai'} • Direct Local Delivery
              </span>
              <span className="badge badge-accent badge-sm text-white font-bold text-[10px] flex items-center gap-1">
                <ShieldCheck className="w-3 h-3" /> Senior Verified Seller
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-base-content tracking-tight">
              {user?.full_name || 'Senior Guru'}'s Storefront
            </h1>
            <p className="text-xs sm:text-sm text-base-content/70 max-w-2xl leading-relaxed">
              Manage your homemade traditional sweets, savoury snacks, pickles, tailored garments, and crafts. Accept incoming orders, advance orders through the live preparation pipeline, and earn directly.
            </p>
          </div>

          {/* Action CTAs */}
          <div className="flex flex-wrap sm:flex-nowrap items-center gap-2.5 shrink-0">
            <button
              type="button"
              onClick={() => {
                setModalSkillHint('');
                setShowProductModal(true);
              }}
              className="btn btn-secondary min-h-[48px] px-6 rounded-2xl text-white font-extrabold text-xs sm:text-sm gap-2 shadow-md hover:scale-[1.02] transition-transform flex-1 sm:flex-none"
            >
              <ShoppingBag className="w-4 h-4" /> + Add Product (AI Assisted)
            </button>
            <button
              type="button"
              onClick={fetchStorefrontData}
              className="btn btn-ghost min-h-[48px] w-12 rounded-2xl border border-base-300 hover:bg-base-200"
              title="Refresh Storefront"
              aria-label="Refresh Storefront"
            >
              <RefreshCw className="w-4 h-4 text-base-content/70" />
            </button>
          </div>
        </div>
      </div>

      <ErrorAlert message={error} onRetry={fetchStorefrontData} />

      {/* FESTIVAL SHOWCASE BANNER */}
      <div className="bg-gradient-to-r from-warning/15 via-secondary/15 to-primary/15 border-2 border-warning/30 rounded-3xl p-5 sm:p-6 shadow-sm relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
          <div className="flex items-start sm:items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-warning/20 text-warning flex items-center justify-center text-2xl shrink-0 shadow-inner">
              {activeFestival === 'Diwali' ? '🪔' : activeFestival === 'Pongal' ? '🌾' : activeFestival === 'Onam' ? '🌸' : activeFestival === 'Durga Puja' ? '🌺' : activeFestival === 'Eid' ? '🌙' : '✨'}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-extrabold uppercase tracking-wider text-warning">
                  Active Cultural Festival Showcase
                </span>
                <span className="badge badge-warning badge-xs font-black text-white">{activeFestival} Special</span>
              </div>
              <h2 className="text-base sm:text-lg font-extrabold text-base-content">
                {activeFestival} Festive Catalog
              </h2>
              <p className="text-xs text-base-content/75 max-w-xl">
                {festivalSuggestions?.festival_theme || `Demand is surging in ${selectedCity?.name || 'Chennai'} for authentic ${activeFestival} homemade sweets, savouries, pooja hampers, and festive clothing.`}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0 self-start sm:self-center">
            <button
              type="button"
              onClick={() => setFestivalOnly(!festivalOnly)}
              className={`btn min-h-[44px] px-4 rounded-xl text-xs font-bold transition-all ${
                festivalOnly 
                  ? 'btn-warning text-white shadow-md' 
                  : 'btn-outline border-warning/50 text-base-content hover:bg-warning/20'
              }`}
            >
              {festivalOnly ? <Check className="w-4 h-4" /> : '🪔'} {festivalOnly ? 'Showing Festive Items' : 'Filter Festive Specials'}
            </button>
            <button
              type="button"
              onClick={() => {
                setModalSkillHint(`${activeFestival} Traditional Specialty`);
                setShowProductModal(true);
              }}
              className="btn btn-warning min-h-[44px] px-4 rounded-xl text-white font-black text-xs gap-1.5 shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" /> Tag {activeFestival} Item
            </button>
          </div>
        </div>
      </div>

      {/* Main Navigation Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 text-sm border-b border-base-200">
        <button
          type="button"
          onClick={() => setActiveTab('products')}
          className={`min-h-[44px] px-5 py-2.5 rounded-2xl font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'products'
              ? 'bg-secondary text-white shadow-md'
              : 'bg-base-200/60 hover:bg-base-200 text-base-content/75'
          }`}
        >
          <ShoppingBag className="w-4 h-4" />
          My Products Catalog ({products.length})
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('pending_requests')}
          className={`min-h-[44px] px-5 py-2.5 rounded-2xl font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'pending_requests'
              ? 'bg-warning text-white shadow-md'
              : 'bg-base-200/60 hover:bg-base-200 text-base-content/75'
          }`}
        >
          <Clock className="w-4 h-4" />
          Incoming Order Requests ({pendingOrders.length})
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('active_pipeline')}
          className={`min-h-[44px] px-5 py-2.5 rounded-2xl font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'active_pipeline'
              ? 'bg-primary text-white shadow-md'
              : 'bg-base-200/60 hover:bg-base-200 text-base-content/75'
          }`}
        >
          <TrendingUp className="w-4 h-4" />
          Live Order Pipeline ({activeOrders.length})
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('history')}
          className={`min-h-[44px] px-5 py-2.5 rounded-2xl font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'history'
              ? 'bg-neutral text-neutral-content shadow-md'
              : 'bg-base-200/60 hover:bg-base-200 text-base-content/75'
          }`}
        >
          <Archive className="w-4 h-4" />
          Order History & Archive ({historyOrders.length})
        </button>
      </div>

      {/* TAB 1: PRODUCTS CATALOG */}
      {activeTab === 'products' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-black text-base-content flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-secondary" />
                My Listed Homemade Products ({displayedProducts.length})
              </h2>
              <p className="text-xs text-base-content/60">
                Products visible to customers across {selectedCity?.name || 'Chennai'} on SilverHands store.
              </p>
            </div>

            <button
              type="button"
              onClick={() => {
                setModalSkillHint('');
                setShowProductModal(true);
              }}
              className="btn btn-secondary min-h-[44px] px-4 rounded-xl text-white font-bold text-xs gap-1.5 self-start sm:self-auto"
            >
              <Plus className="w-4 h-4" /> Add Product
            </button>
          </div>

          {displayedProducts.length === 0 ? (
            <div className="card bg-base-100 border border-base-300 rounded-3xl p-10 text-center space-y-3">
              <div className="text-4xl">🛍️</div>
              <h3 className="font-extrabold text-base text-base-content">No products listed in catalog</h3>
              <p className="text-xs text-base-content/60 max-w-sm mx-auto">
                {festivalOnly ? `You haven't tagged any product for ${activeFestival}.` : 'List your traditional sweets, sun-dried pickles, tailored garments, or crafts.'}
              </p>
              <button
                type="button"
                onClick={() => setShowProductModal(true)}
                className="btn btn-secondary btn-sm rounded-xl text-white font-bold text-xs gap-1 mx-auto"
              >
                <Plus className="w-3.5 h-3.5" /> List Product with Gemini AI
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {displayedProducts.map((prod) => (
                <div key={prod.id} className="card bg-base-100 border border-base-300 rounded-3xl overflow-hidden shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between">
                  <div>
                    <div className="relative h-44 w-full bg-base-200 overflow-hidden">
                      <img 
                        src={prod.images?.[0] || 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=600'} 
                        alt={prod.title}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute top-2.5 left-2.5 flex flex-wrap gap-1">
                        <span className="badge badge-neutral badge-sm font-bold text-white text-[10px]">
                          {prod.category}
                        </span>
                        {prod.is_festival_special && (
                          <span className="badge badge-warning badge-sm font-black text-white text-[10px]">
                            🪔 {prod.festival_tag || activeFestival}
                          </span>
                        )}
                      </div>
                      <div className="absolute bottom-2 right-2 bg-black/75 backdrop-blur-sm text-white px-2.5 py-1 rounded-xl text-xs font-black">
                        ₹{prod.price} <span className="font-normal text-[10px]">/ {prod.unit}</span>
                      </div>
                    </div>

                    <div className="p-4 space-y-2">
                      <h3 className="font-extrabold text-sm text-base-content line-clamp-1">{prod.title}</h3>
                      <p className="text-xs text-base-content/70 line-clamp-2 leading-relaxed">{prod.description}</p>
                      
                      <div className="flex items-center justify-between text-[11px] text-base-content/60 pt-1 border-t border-base-200">
                        <span>Total Sold: <strong className="text-primary font-bold">{prod.total_sold || 0} units</strong></span>
                        <span className="flex items-center gap-1 font-bold text-warning">
                          ★ {prod.rating || 4.95} <span className="font-normal text-[10px] text-base-content/60">({prod.total_reviews || prod.reviews?.length || 1} revs)</span>
                        </span>
                      </div>

                      {/* Recent Customer Feedback */}
                      {prod.reviews && prod.reviews.length > 0 && (
                        <div className="bg-warning/5 border border-warning/20 rounded-xl p-2.5 text-[11px] text-base-content/80 italic space-y-0.5">
                          <p className="line-clamp-2">"{prod.reviews[0].comment}"</p>
                          <span className="not-italic font-bold text-[10px] text-base-content/60 block text-right">
                            — {prod.reviews[0].customer_name} ({prod.reviews[0].rating} ★)
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="p-4 pt-0 flex items-center justify-between gap-2">
                    <Link
                      to={`/store/${prod.id}`}
                      className="btn btn-outline btn-sm rounded-xl text-xs font-bold flex-1 gap-1 min-h-[38px]"
                    >
                      <ExternalLink className="w-3.5 h-3.5" /> View in Store
                    </Link>
                    <button
                      type="button"
                      onClick={() => handleDeleteProduct(prod.id)}
                      className="btn btn-ghost btn-sm rounded-xl text-error text-xs hover:bg-error/10 min-h-[38px] px-3"
                      title="Remove Product"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: INCOMING ORDER REQUESTS SWIPE DECK (Left = Decline, Right = Accept) */}
      {activeTab === 'pending_requests' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between pb-2 border-b border-base-200">
            <div>
              <h2 className="text-lg font-black text-base-content flex items-center gap-2">
                <Clock className="w-5 h-5 text-warning" />
                Incoming Order Requests ({pendingOrders.length})
              </h2>
              <p className="text-xs text-base-content/60">
                Swipe Left to Decline • Swipe Right to Accept and enter the live preparation pipeline.
              </p>
            </div>
            <span className="badge badge-warning badge-sm font-bold text-white">
              {pendingOrders.length} Awaiting Acceptance
            </span>
          </div>

          <OrderSwipeDeck
            orders={pendingOrders}
            onAccept={(orderId) => handleUpdateOrderStatus(orderId, 'accepted')}
            onDecline={(orderId) => handleCancelOrder(orderId)}
            loading={loading}
          />
        </div>
      )}

      {/* TAB 3: LIVE ORDER PIPELINE (Active Accepted/Preparing/Ready/Delivered Orders) */}
      {activeTab === 'active_pipeline' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between pb-2 border-b border-base-200">
            <div>
              <h2 className="text-lg font-black text-base-content flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-primary" />
                Live Order Pipeline ({activeOrders.length})
              </h2>
              <p className="text-xs text-base-content/60">
                Advance orders stage by stage using the visual status flow bar.
              </p>
            </div>
            <span className="badge badge-primary badge-sm font-bold text-white">
              {activeOrders.length} In Progress
            </span>
          </div>

          {activeOrders.length === 0 ? (
            <div className="card bg-base-100 border border-base-300 rounded-3xl p-10 text-center space-y-3">
              <div className="text-4xl">👨‍🍳</div>
              <h3 className="font-extrabold text-base text-base-content">No active orders in pipeline</h3>
              <p className="text-xs text-base-content/60 max-w-sm mx-auto">
                Once you accept an incoming order request from the review deck, it will enter this live stage pipeline.
              </p>
            </div>
          ) : (
            <div className="space-y-5">
              {activeOrders.map((ord) => {
                const statusInfo = NEXT_STATUS_MAP[ord.status];
                return (
                  <div key={ord.id} className="card bg-base-100 border-2 border-base-300 rounded-3xl p-6 shadow-sm space-y-4">
                    
                    {/* Top Row: Order Header */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-base-200">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-sm font-black text-base-content">
                            Order #{ord.order_number || ord.id.slice(-6).toUpperCase()}
                          </span>
                          <span className="badge badge-primary badge-sm font-bold uppercase text-[10px] text-white">
                            {ord.status}
                          </span>
                        </div>
                        <p className="text-xs text-base-content/60 mt-0.5">
                          Customer: <strong>{ord.customer_name}</strong> • Delivery: {ord.delivery_address || 'Adyar'}, {ord.delivery_locality || 'Chennai'}
                        </p>
                      </div>

                      <div className="text-right">
                        <div className="text-lg font-black text-primary">₹{ord.total_amount}</div>
                        <span className="text-[10px] text-success font-bold">Paid via UPI / COD</span>
                      </div>
                    </div>

                    {/* STATUS FLOW PROGRESS BAR */}
                    <div className="bg-base-200/50 rounded-2xl p-4 border border-base-300">
                      <span className="text-[10px] font-extrabold uppercase tracking-wider text-base-content/60 block mb-1">
                        Live Preparation & Delivery Pipeline:
                      </span>
                      <StatusFlowBar currentStatus={ord.status} type="order" />
                    </div>

                    {/* Items List */}
                    <div className="space-y-1.5 text-xs">
                      {ord.items?.map((item, i) => (
                        <div key={i} className="flex items-center justify-between text-base-content/80 p-2 rounded-xl bg-base-200/30">
                          <span>{item.product_title} × {item.quantity}</span>
                          <span className="font-semibold">₹{item.price_per_unit * item.quantity}</span>
                        </div>
                      ))}
                    </div>

                    {/* Next Action Button */}
                    <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-base-200">
                      <button
                        type="button"
                        onClick={() => handleCancelOrder(ord.id)}
                        className="btn btn-ghost btn-sm text-error text-xs rounded-xl min-h-[40px]"
                      >
                        Cancel Order
                      </button>

                      {statusInfo && (
                        <button
                          type="button"
                          disabled={updatingOrderId === ord.id}
                          onClick={() => handleUpdateOrderStatus(ord.id, statusInfo.next)}
                          className={`btn btn-sm rounded-xl font-black text-xs min-h-[44px] px-6 shadow-sm ${statusInfo.color}`}
                        >
                          {updatingOrderId === ord.id ? (
                            <span className="loading loading-spinner loading-xs"></span>
                          ) : (
                            <>
                              <Check className="w-4 h-4" />
                              Advance: {statusInfo.label}
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
      )}

      {/* TAB 4: ORDER HISTORY & ARCHIVE (Completed & Cancelled Orders) */}
      {activeTab === 'history' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-base-200">
            <div>
              <h2 className="text-lg font-black text-base-content flex items-center gap-2">
                <Archive className="w-5 h-5 text-neutral" />
                Completed & Settled Order History ({historyOrders.length})
              </h2>
              <p className="text-xs text-base-content/60">
                Archived orders that are delivered/completed or cancelled.
              </p>
            </div>
          </div>

          {historyOrders.length === 0 ? (
            <div className="card bg-base-100 border border-base-300 rounded-3xl p-10 text-center space-y-3">
              <div className="text-4xl">📜</div>
              <h3 className="font-extrabold text-base text-base-content">No archived orders</h3>
              <p className="text-xs text-base-content/60 max-w-sm mx-auto">
                Completed or cancelled orders will be archived here.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {historyOrders.map((ord) => (
                <div key={ord.id} className="card bg-base-100 border border-base-300 rounded-3xl p-5 shadow-xs space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-mono text-xs font-bold text-base-content">
                        Order #{ord.order_number || ord.id.slice(-6).toUpperCase()}
                      </span>
                      <p className="text-xs text-base-content/70">Customer: {ord.customer_name}</p>
                    </div>
                    <div className="text-right">
                      <span className={`badge badge-sm font-bold uppercase text-[10px] ${
                        ord.status === 'completed' ? 'badge-success text-white' : 'badge-error text-white'
                      }`}>
                        {ord.status}
                      </span>
                      <div className="text-sm font-black text-primary mt-0.5">₹{ord.total_amount}</div>
                    </div>
                  </div>

                  <div className="text-xs text-base-content/60 pt-1 border-t border-base-200">
                    {ord.items?.map((item, i) => (
                      <span key={i} className="mr-3">{item.product_title} × {item.quantity}</span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Add Product Modal with Gemini AI */}
      <AddProductModal
        isOpen={showProductModal}
        initialSkill={modalSkillHint}
        onClose={() => setShowProductModal(false)}
        onProductCreated={() => {
          showToast('Product added to your storefront!');
          fetchStorefrontData();
        }}
      />

    </div>
  );
}
