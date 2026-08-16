import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  ShoppingBag, 
  Sparkles, 
  BookOpen, 
  Package, 
  CheckCircle2, 
  Plus, 
  Trash2, 
  ExternalLink, 
  RefreshCw, 
  Calendar, 
  Video, 
  MapPin, 
  TrendingUp, 
  Award, 
  Clock, 
  Tag, 
  Layers, 
  Check, 
  X, 
  AlertCircle,
  Truck,
  ChefHat,
  Phone,
  ShieldCheck,
  ChevronRight
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLocation } from '../context/LocationContext';
import api from '../api/client';
import AddProductModal from '../components/modals/AddProductModal';
import AddServiceModal from '../components/modals/AddServiceModal';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ErrorAlert from '../components/common/ErrorAlert';

const NEXT_ORDER_STATUS_MAP = {
  pending: { next: 'accepted', label: 'Accept Order', color: 'btn-primary' },
  accepted: { next: 'preparing', label: 'Start Preparing', color: 'btn-warning' },
  preparing: { next: 'ready', label: 'Mark Ready for Pickup', color: 'btn-accent' },
  ready: { next: 'delivered', label: 'Handover / Delivered', color: 'btn-success text-white' },
  delivered: { next: 'completed', label: 'Complete & Payout', color: 'btn-success text-white' },
  completed: null
};

export default function SeniorStorefrontPage() {
  const { user } = useAuth();
  const { selectedCity, activeFestival } = useLocation();

  const [products, setProducts] = useState([]);
  const [services, setServices] = useState([]);
  const [orders, setOrders] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [festivalSuggestions, setFestivalSuggestions] = useState(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [toastMsg, setToastMsg] = useState('');

  // Modals
  const [showProductModal, setShowProductModal] = useState(false);
  const [showServiceModal, setShowServiceModal] = useState(false);
  const [modalSkillHint, setModalSkillHint] = useState('');

  // Active Tab: 'overview' | 'products' | 'services' | 'orders'
  const [activeTab, setActiveTab] = useState('overview');
  // Sub-filter for festive specials
  const [festivalOnly, setFestivalOnly] = useState(false);
  const [updatingOrderId, setUpdatingOrderId] = useState(null);

  const fetchData = async () => {
    setLoading(true);
    setError('');
    try {
      const [prodsData, srvsData, ordsData, bksData, festData] = await Promise.all([
        api.get('/store/my-products').catch(() => []),
        api.get('/services/my-offerings').catch(() => []),
        api.get('/store/orders/senior-orders').catch(() => []),
        api.get('/services/bookings/senior-sessions').catch(() => []),
        api.get('/festival/suggestions?role=senior').catch(() => null)
      ]);
      setProducts(prodsData || []);
      setServices(srvsData || []);
      setOrders(ordsData || []);
      setBookings(bksData || []);
      setFestivalSuggestions(festData);
    } catch (err) {
      console.error('Storefront data fetch error:', err);
      setError(err.message || 'Failed to load storefront catalog.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
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
      fetchData();
    } catch (err) {
      setError(err.message || 'Failed to remove product.');
    }
  };

  // Order status transition
  const handleUpdateOrderStatus = async (orderId, nextStatus) => {
    setUpdatingOrderId(orderId);
    try {
      await api.put(`/store/orders/${orderId}/status`, { status: nextStatus });
      showToast(`Order transitioned to "${nextStatus.toUpperCase()}"!`);
      fetchData();
    } catch (err) {
      setError(err.message || 'Failed to update order status.');
    } finally {
      setUpdatingOrderId(null);
    }
  };

  // Service session status transition
  const handleUpdateBookingStatus = async (bookingId, newStatus) => {
    try {
      const payload = {
        status: newStatus,
        meeting_link: `https://meet.silverhands.in/room-${Math.floor(100000 + Math.random() * 900000)}`
      };
      await api.put(`/services/bookings/${bookingId}/status`, payload);
      showToast(`Session marked as ${newStatus}!`);
      fetchData();
    } catch (err) {
      setError(err.message || 'Failed to update session');
    }
  };

  // Mark Class progress
  const handleMarkClassProgress = async (bookingId, currentCompleted, totalSessions) => {
    const nextCompleted = currentCompleted + 1;
    try {
      await api.put(`/services/bookings/${bookingId}/progress`, {
        completed_sessions: nextCompleted
      });
      if (nextCompleted >= totalSessions) {
        showToast(`🎉 All ${totalSessions} classes completed! Fee added to your earnings ledger.`);
      } else {
        showToast(`Class ${nextCompleted} of ${totalSessions} marked completed!`);
      }
      fetchData();
    } catch (err) {
      setError(err.message || 'Failed to update class progress');
    }
  };

  // Filtered Products
  const displayedProducts = festivalOnly 
    ? products.filter(p => p.is_festival_special) 
    : products;

  const totalFestiveItems = products.filter(p => p.is_festival_special).length;
  const activeOrdersCount = orders.filter(o => o.status !== 'completed' && o.status !== 'cancelled').length;
  const activeSessionsCount = bookings.filter(b => b.status !== 'completed' && b.status !== 'cancelled').length;

  if (loading && products.length === 0 && services.length === 0) {
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
      <div className="bg-gradient-to-r from-primary/15 via-base-100 to-secondary/15 border border-primary/20 rounded-3xl p-6 sm:p-8 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="badge badge-primary badge-sm font-extrabold text-white uppercase text-[10px] tracking-wider px-2.5 py-2">
                🏪 Senior Storefront
              </span>
              <span className="badge badge-secondary badge-outline badge-sm font-bold text-[10px]">
                {selectedCity?.name || 'Chennai'} • {selectedCity?.localities?.[0] || 'Adyar'}
              </span>
              <span className="badge badge-accent badge-sm text-white font-bold text-[10px] flex items-center gap-1">
                <ShieldCheck className="w-3 h-3" /> Age & Wisdom Verified
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-base-content tracking-tight">
              {user?.full_name || 'Senior Guru'}'s Storefront
            </h1>
            <p className="text-xs sm:text-sm text-base-content/70 max-w-2xl leading-relaxed">
              Your personalized hub for handcrafted delicacies, tailored ethnic wear, and 1-on-1 managed classes. Sell directly to your city with zero listing fees.
            </p>
          </div>

          {/* Action CTAs with High Touch Targets */}
          <div className="flex flex-wrap sm:flex-nowrap items-center gap-2.5 shrink-0">
            <button
              type="button"
              onClick={() => {
                setModalSkillHint('');
                setShowProductModal(true);
              }}
              className="btn btn-secondary min-h-[48px] px-5 rounded-2xl text-white font-extrabold text-xs sm:text-sm gap-2 shadow-md hover:scale-[1.02] transition-transform flex-1 sm:flex-none"
            >
              <ShoppingBag className="w-4 h-4" /> + Add Product
            </button>
            <button
              type="button"
              onClick={() => {
                setModalSkillHint('');
                setShowServiceModal(true);
              }}
              className="btn btn-accent min-h-[48px] px-5 rounded-2xl text-white font-extrabold text-xs sm:text-sm gap-2 shadow-md hover:scale-[1.02] transition-transform flex-1 sm:flex-none"
            >
              <Sparkles className="w-4 h-4" /> + Offer Live Class
            </button>
            <button
              type="button"
              onClick={fetchData}
              className="btn btn-ghost min-h-[48px] w-12 rounded-2xl border border-base-300 hover:bg-base-200"
              title="Refresh Storefront"
              aria-label="Refresh Storefront"
            >
              <RefreshCw className="w-4 h-4 text-base-content/70" />
            </button>
          </div>
        </div>
      </div>

      <ErrorAlert message={error} onRetry={fetchData} />

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
                {activeFestival} Festive Edition Storefront
              </h2>
              <p className="text-xs text-base-content/75 max-w-xl">
                {festivalSuggestions?.festival_theme || `Demand is peaking for authentic homemade ${activeFestival} sweets, traditional pooja essentials, bespoke garments, and sloka chanting.`}
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
          onClick={() => setActiveTab('overview')}
          className={`min-h-[44px] px-4 py-2 rounded-2xl font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'overview'
              ? 'bg-primary text-white shadow-md'
              : 'bg-base-200/60 hover:bg-base-200 text-base-content/75'
          }`}
        >
          <Layers className="w-4 h-4" />
          Catalog Overview
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('products')}
          className={`min-h-[44px] px-4 py-2 rounded-2xl font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'products'
              ? 'bg-secondary text-white shadow-md'
              : 'bg-base-200/60 hover:bg-base-200 text-base-content/75'
          }`}
        >
          <ShoppingBag className="w-4 h-4" />
          My Products ({products.length})
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('services')}
          className={`min-h-[44px] px-4 py-2 rounded-2xl font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'services'
              ? 'bg-accent text-white shadow-md'
              : 'bg-base-200/60 hover:bg-base-200 text-base-content/75'
          }`}
        >
          <Sparkles className="w-4 h-4" />
          My Live Classes ({services.length})
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('orders')}
          className={`min-h-[44px] px-4 py-2 rounded-2xl font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'orders'
              ? 'bg-neutral text-neutral-content shadow-md'
              : 'bg-base-200/60 hover:bg-base-200 text-base-content/75'
          }`}
        >
          <Package className="w-4 h-4" />
          Orders & Sessions ({activeOrdersCount + activeSessionsCount} active)
        </button>
      </div>

      {/* TAB 1: OVERVIEW */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          
          {/* Quick Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="card bg-base-100 border border-base-300 rounded-3xl p-4 sm:p-5 shadow-xs">
              <div className="flex items-center gap-2 text-secondary text-xs font-bold uppercase">
                <ShoppingBag className="w-4 h-4" /> Products Listed
              </div>
              <div className="text-2xl sm:text-3xl font-black text-base-content mt-2">
                {products.length}
              </div>
              <div className="text-[11px] text-base-content/60 mt-0.5">
                {totalFestiveItems} festival specials
              </div>
            </div>

            <div className="card bg-base-100 border border-base-300 rounded-3xl p-4 sm:p-5 shadow-xs">
              <div className="flex items-center gap-2 text-accent text-xs font-bold uppercase">
                <Sparkles className="w-4 h-4" /> Live Classes
              </div>
              <div className="text-2xl sm:text-3xl font-black text-base-content mt-2">
                {services.length}
              </div>
              <div className="text-[11px] text-base-content/60 mt-0.5">
                Language, Arts & Tuition
              </div>
            </div>

            <div className="card bg-base-100 border border-base-300 rounded-3xl p-4 sm:p-5 shadow-xs">
              <div className="flex items-center gap-2 text-primary text-xs font-bold uppercase">
                <Package className="w-4 h-4" /> Store Orders
              </div>
              <div className="text-2xl sm:text-3xl font-black text-base-content mt-2">
                {orders.length}
              </div>
              <div className="text-[11px] text-primary font-bold mt-0.5">
                {activeOrdersCount} in preparation
              </div>
            </div>

            <div className="card bg-base-100 border border-base-300 rounded-3xl p-4 sm:p-5 shadow-xs">
              <div className="flex items-center gap-2 text-success text-xs font-bold uppercase">
                <BookOpen className="w-4 h-4" /> Teaching Sessions
              </div>
              <div className="text-2xl sm:text-3xl font-black text-base-content mt-2">
                {bookings.length}
              </div>
              <div className="text-[11px] text-success font-bold mt-0.5">
                {activeSessionsCount} scheduled
              </div>
            </div>
          </div>

          {/* Quick Dual Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Products Preview Card */}
            <div className="card bg-base-100 border border-base-300 rounded-3xl p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ShoppingBag className="w-5 h-5 text-secondary" />
                  <h3 className="font-extrabold text-lg text-base-content">Homemade Products</h3>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveTab('products')}
                  className="btn btn-ghost btn-xs text-secondary font-bold gap-1"
                >
                  View All ({products.length}) <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>

              {products.length === 0 ? (
                <div className="bg-base-200/40 rounded-2xl p-6 text-center space-y-3">
                  <div className="text-3xl">🛍️</div>
                  <p className="text-xs text-base-content/70">
                    You haven't listed any homemade delicacies or products yet.
                  </p>
                  <button
                    type="button"
                    onClick={() => setShowProductModal(true)}
                    className="btn btn-secondary btn-sm rounded-xl text-white font-bold text-xs gap-1.5"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add Your First Product
                  </button>
                </div>
              ) : (
                <div className="space-y-2.5">
                  {products.slice(0, 3).map((prod) => (
                    <div key={prod.id} className="flex items-center justify-between p-3 rounded-2xl bg-base-200/50 hover:bg-base-200 border border-base-300 gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <img 
                          src={prod.images?.[0] || 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=200'} 
                          alt={prod.title} 
                          className="w-12 h-12 rounded-xl object-cover shrink-0"
                        />
                        <div className="min-w-0">
                          <h4 className="font-bold text-xs text-base-content truncate">{prod.title}</h4>
                          <div className="flex items-center gap-2 text-[11px] text-base-content/60">
                            <span className="font-extrabold text-primary">₹{prod.price}</span>
                            <span>•</span>
                            <span>{prod.unit}</span>
                            {prod.is_festival_special && (
                              <span className="badge badge-warning badge-xs font-bold text-white">Festive</span>
                            )}
                          </div>
                        </div>
                      </div>
                      <Link to={`/store/${prod.id}`} className="btn btn-ghost btn-circle btn-sm shrink-0" title="View in Store">
                        <ExternalLink className="w-3.5 h-3.5 text-base-content/70" />
                      </Link>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Services Preview Card */}
            <div className="card bg-base-100 border border-base-300 rounded-3xl p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-accent" />
                  <h3 className="font-extrabold text-lg text-base-content">Managed Live Classes</h3>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveTab('services')}
                  className="btn btn-ghost btn-xs text-accent font-bold gap-1"
                >
                  View All ({services.length}) <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>

              {services.length === 0 ? (
                <div className="bg-base-200/40 rounded-2xl p-6 text-center space-y-3">
                  <div className="text-3xl">🎓</div>
                  <p className="text-xs text-base-content/70">
                    You haven't published any managed 1-on-1 classes or tuition yet.
                  </p>
                  <button
                    type="button"
                    onClick={() => setShowServiceModal(true)}
                    className="btn btn-accent btn-sm rounded-xl text-white font-bold text-xs gap-1.5"
                  >
                    <Plus className="w-3.5 h-3.5" /> Offer a Live Class
                  </button>
                </div>
              ) : (
                <div className="space-y-2.5">
                  {services.slice(0, 3).map((srv) => (
                    <div key={srv.id} className="flex items-center justify-between p-3 rounded-2xl bg-base-200/50 hover:bg-base-200 border border-base-300 gap-3">
                      <div className="min-w-0">
                        <h4 className="font-bold text-xs text-base-content truncate">{srv.title}</h4>
                        <div className="flex items-center gap-2 text-[11px] text-base-content/60">
                          <span className="font-extrabold text-accent">₹{srv.price_per_session}/session</span>
                          <span>•</span>
                          <span>{srv.duration_mins} mins</span>
                          <span>•</span>
                          <span className="capitalize">{srv.mode}</span>
                        </div>
                      </div>
                      <Link to={`/services/${srv.id}`} className="btn btn-ghost btn-circle btn-sm shrink-0" title="View Service Offering">
                        <ExternalLink className="w-3.5 h-3.5 text-base-content/70" />
                      </Link>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>

        </div>
      )}

      {/* TAB 2: PRODUCTS CATALOG */}
      {activeTab === 'products' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-black text-base-content flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-secondary" />
                My Homemade & Artisanal Products ({displayedProducts.length})
              </h2>
              <p className="text-xs text-base-content/60">
                Manage your listed food, tailoring, crafts, and festive packs.
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
              <h3 className="font-extrabold text-base text-base-content">No products listed</h3>
              <p className="text-xs text-base-content/60 max-w-sm mx-auto">
                {festivalOnly ? `You haven't tagged any product for ${activeFestival}.` : 'List your traditional sweets, pickles, tailored blouses, or handmade items.'}
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
                        <span>Stock: <strong className="text-base-content">{prod.stock_quantity || 25}</strong></span>
                        <span>Rating: <strong className="text-warning">★ {prod.rating || 4.9}</strong></span>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 pt-0 flex items-center justify-between gap-2">
                    <Link
                      to={`/store/${prod.id}`}
                      className="btn btn-outline btn-sm rounded-xl text-xs font-bold flex-1 gap-1 min-h-[38px]"
                    >
                      <ExternalLink className="w-3.5 h-3.5" /> View
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

      {/* TAB 3: SERVICES CATALOG */}
      {activeTab === 'services' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-black text-base-content flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-accent" />
                My Managed Live Classes & Tutoring ({services.length})
              </h2>
              <p className="text-xs text-base-content/60">
                1-on-1 language classes, music, academic mentoring, and cultural guidance.
              </p>
            </div>

            <button
              type="button"
              onClick={() => {
                setModalSkillHint('');
                setShowServiceModal(true);
              }}
              className="btn btn-accent min-h-[44px] px-4 rounded-xl text-white font-bold text-xs gap-1.5 self-start sm:self-auto"
            >
              <Plus className="w-4 h-4" /> Offer New Class
            </button>
          </div>

          {services.length === 0 ? (
            <div className="card bg-base-100 border border-base-300 rounded-3xl p-10 text-center space-y-3">
              <div className="text-4xl">🎓</div>
              <h3 className="font-extrabold text-base text-base-content">No classes or services offered yet</h3>
              <p className="text-xs text-base-content/60 max-w-sm mx-auto">
                Turn your language fluency, career wisdom, or traditional crafts into high-earning 1-on-1 sessions.
              </p>
              <button
                type="button"
                onClick={() => setShowServiceModal(true)}
                className="btn btn-accent btn-sm rounded-xl text-white font-bold text-xs gap-1 mx-auto"
              >
                <Plus className="w-3.5 h-3.5" /> Package Service with Gemini AI
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {services.map((srv) => (
                <div key={srv.id} className="card bg-base-100 border border-base-300 rounded-3xl p-5 shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <span className="badge badge-accent badge-sm font-bold text-white uppercase text-[10px]">
                        {srv.category}
                      </span>
                      <span className="text-xs font-black text-accent">
                        ₹{srv.price_per_session} / session
                      </span>
                    </div>

                    <h3 className="font-extrabold text-base text-base-content">{srv.title}</h3>
                    <p className="text-xs text-base-content/70 leading-relaxed line-clamp-3">{srv.description}</p>

                    <div className="grid grid-cols-2 gap-2 text-xs pt-2 border-t border-base-200">
                      <div className="flex items-center gap-1.5 text-base-content/75 font-semibold">
                        <Clock className="w-3.5 h-3.5 text-accent" />
                        <span>{srv.duration_mins} mins / class</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-base-content/75 font-semibold">
                        <Video className="w-3.5 h-3.5 text-primary" />
                        <span className="capitalize">{srv.mode} mode</span>
                      </div>
                    </div>

                    {srv.target_audience && (
                      <div className="text-[11px] text-base-content/60">
                        Audience: <strong className="text-base-content/80">{srv.target_audience}</strong>
                      </div>
                    )}
                  </div>

                  <div className="pt-3 border-t border-base-200 flex items-center justify-between gap-2">
                    <Link
                      to={`/services/${srv.id}`}
                      className="btn btn-outline btn-accent btn-sm rounded-xl text-xs font-bold flex-1 gap-1 min-h-[38px]"
                    >
                      <ExternalLink className="w-3.5 h-3.5" /> View Public Offering
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 4: ORDERS & SESSIONS PIPELINE */}
      {activeTab === 'orders' && (
        <div className="space-y-8">
          
          {/* Section A: Product Orders Pipeline */}
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-base-200">
              <div className="flex items-center gap-2">
                <Package className="w-5 h-5 text-primary" />
                <h3 className="font-extrabold text-lg text-base-content">Customer Product Orders Pipeline</h3>
              </div>
              <span className="badge badge-primary badge-sm font-bold text-white">
                {orders.length} Total Orders
              </span>
            </div>

            {orders.length === 0 ? (
              <div className="bg-base-200/40 rounded-2xl p-6 text-center text-xs text-base-content/60">
                No customer orders received yet. Once customers order your homemade products, they will appear here in the live state machine.
              </div>
            ) : (
              <div className="space-y-3">
                {orders.map((ord) => {
                  const statusInfo = NEXT_ORDER_STATUS_MAP[ord.status];
                  return (
                    <div key={ord.id} className="card bg-base-100 border border-base-300 rounded-3xl p-5 shadow-xs space-y-3">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-base-200">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-extrabold text-sm text-base-content">Order #{ord.order_number || ord.id.slice(-6).toUpperCase()}</span>
                            <span className={`badge badge-sm font-bold uppercase text-[10px] ${
                              ord.status === 'completed' ? 'badge-success text-white' :
                              ord.status === 'delivered' ? 'badge-accent text-white' :
                              ord.status === 'ready' ? 'badge-secondary text-white' :
                              ord.status === 'preparing' ? 'badge-warning text-white' :
                              'badge-neutral text-white'
                            }`}>
                              {ord.status}
                            </span>
                          </div>
                          <div className="text-[11px] text-base-content/60 flex items-center gap-2 mt-0.5">
                            <span>Customer: <strong>{ord.customer_name}</strong></span>
                            <span>•</span>
                            <span>{ord.delivery_locality || 'Adyar'}, {ord.delivery_city || 'Chennai'}</span>
                          </div>
                        </div>

                        <div className="text-right">
                          <div className="text-base font-black text-primary">₹{ord.total_amount}</div>
                          <span className="text-[10px] text-success font-bold">Paid via UPI / COD</span>
                        </div>
                      </div>

                      {/* Items */}
                      <div className="space-y-1 text-xs">
                        {ord.items?.map((item, i) => (
                          <div key={i} className="flex items-center justify-between text-base-content/80">
                            <span>{item.product_title} × {item.quantity}</span>
                            <span className="font-semibold">₹{item.price_per_unit * item.quantity}</span>
                          </div>
                        ))}
                      </div>

                      {/* Action State Transition */}
                      <div className="flex items-center justify-end gap-2 pt-2 border-t border-base-200">
                        {statusInfo ? (
                          <button
                            type="button"
                            disabled={updatingOrderId === ord.id}
                            onClick={() => handleUpdateOrderStatus(ord.id, statusInfo.next)}
                            className={`btn btn-sm rounded-xl font-extrabold text-xs min-h-[40px] px-5 ${statusInfo.color}`}
                          >
                            {updatingOrderId === ord.id ? (
                              <span className="loading loading-spinner loading-xs"></span>
                            ) : (
                              <>
                                <Check className="w-3.5 h-3.5" />
                                {statusInfo.label}
                              </>
                            )}
                          </button>
                        ) : (
                          <span className="text-xs font-extrabold text-success flex items-center gap-1">
                            <CheckCircle2 className="w-4 h-4" /> Completed & Payout Settled
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Section B: Managed Class Sessions */}
          <div className="space-y-4 pt-4 border-t border-base-200">
            <div className="flex items-center justify-between pb-2 border-b border-base-200">
              <div className="flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-accent" />
                <h3 className="font-extrabold text-lg text-base-content">Teaching Sessions & Student Bookings</h3>
              </div>
              <span className="badge badge-accent badge-sm font-bold text-white">
                {bookings.length} Bookings
              </span>
            </div>

            {bookings.length === 0 ? (
              <div className="bg-base-200/40 rounded-2xl p-6 text-center text-xs text-base-content/60">
                No student bookings received yet. When parents or adult learners book your live coaching classes, their requests appear here.
              </div>
            ) : (
              <div className="space-y-3">
                {bookings.map((bk) => (
                  <div key={bk.id} className="card bg-base-100 border border-base-300 rounded-3xl p-5 shadow-xs space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-base-200">
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-extrabold text-sm text-base-content">{bk.service_title}</h4>
                          <span className={`badge badge-sm font-bold uppercase text-[10px] ${
                            bk.status === 'completed' ? 'badge-success text-white' :
                            bk.status === 'in_progress' ? 'badge-warning text-white' :
                            bk.status === 'accepted' ? 'badge-accent text-white' :
                            'badge-primary text-white'
                          }`}>
                            {bk.status}
                          </span>
                        </div>
                        <div className="text-[11px] text-base-content/60 mt-0.5">
                          Student: <strong>{bk.student_name}</strong> ({bk.student_age_group}) • {bk.preferred_time_slot || 'Evenings'}
                        </div>
                      </div>

                      <div className="text-right">
                        <div className="text-base font-black text-accent">₹{bk.total_amount}</div>
                        <span className="text-[10px] text-base-content/60">{bk.completed_sessions_count || 0} / {bk.sessions_count || 1} Classes Done</span>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-3 text-xs pt-1">
                      <div className="text-base-content/70">
                        {bk.meeting_link && (
                          <a 
                            href={bk.meeting_link} 
                            target="_blank" 
                            rel="noreferrer" 
                            className="btn btn-primary btn-xs rounded-lg text-white font-bold gap-1"
                          >
                            <Video className="w-3.5 h-3.5" /> Open Class Video Room
                          </a>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        {bk.status === 'requested' && (
                          <button
                            type="button"
                            onClick={() => handleUpdateBookingStatus(bk.id, 'accepted')}
                            className="btn btn-accent btn-sm rounded-xl text-white font-bold text-xs min-h-[40px] px-4"
                          >
                            <Check className="w-3.5 h-3.5" /> Accept Student Booking
                          </button>
                        )}

                        {(bk.status === 'accepted' || bk.status === 'in_progress') && (
                          <button
                            type="button"
                            onClick={() => handleMarkClassProgress(bk.id, bk.completed_sessions_count || 0, bk.sessions_count || 1)}
                            className="btn btn-success btn-sm rounded-xl text-white font-bold text-xs min-h-[40px] px-4"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" /> Mark Class {(bk.completed_sessions_count || 0) + 1} Done
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      )}

      {/* Embedded Modals with Gemini AI Assist */}
      <AddProductModal
        isOpen={showProductModal}
        initialSkill={modalSkillHint}
        onClose={() => setShowProductModal(false)}
        onProductCreated={() => {
          showToast('Product added to your storefront!');
          fetchData();
        }}
      />

      <AddServiceModal
        isOpen={showServiceModal}
        initialSkill={modalSkillHint}
        onClose={() => setShowServiceModal(false)}
        onServiceCreated={() => {
          showToast('Live class offering published to storefront!');
          fetchData();
        }}
      />

    </div>
  );
}
