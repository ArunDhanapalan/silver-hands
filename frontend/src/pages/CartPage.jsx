import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  ShoppingBag, 
  Trash2, 
  ArrowRight, 
  CheckCircle2, 
  Clock, 
  ShieldCheck, 
  Package, 
  MapPin, 
  Truck,
  RotateCcw
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLocation } from '../context/LocationContext';
import api from '../api/client';
import ErrorAlert from '../components/common/ErrorAlert';
import LoadingSpinner from '../components/common/LoadingSpinner';

const STATUS_STEPS = ['pending', 'accepted', 'preparing', 'ready', 'delivered', 'completed'];

export default function CartPage() {
  const { user, isAuthenticated } = useAuth();
  const { selectedCity, selectedLocality } = useLocation();
  const navigate = useNavigate();

  const [cartItems, setCartItems] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('cart'); // cart or orders
  const [successOrder, setSuccessOrder] = useState(null);

  // Delivery Form
  const [deliveryForm, setDeliveryForm] = useState({
    name: user?.full_name || 'Ananya Sharma',
    phone: user?.phone || '+91 98840 56789',
    address: 'Flat 4B, Green Meadows Apartment, Gandhi Nagar',
    locality: selectedLocality !== 'All Areas' ? selectedLocality : 'Adyar',
    city: selectedCity.name,
    paymentMethod: 'UPI / NetBanking',
    notes: 'Please pack carefully in sustainable materials.'
  });

  const loadCart = () => {
    const saved = localStorage.getItem('silverhands_cart');
    setCartItems(saved ? JSON.parse(saved) : []);
  };

  const fetchOrders = async () => {
    if (!isAuthenticated) return;
    setLoadingOrders(true);
    try {
      const data = await api.get('/store/orders/my-orders');
      setOrders(data || []);
    } catch (err) {
      console.error('Fetch orders error:', err);
    } finally {
      setLoadingOrders(false);
    }
  };

  useEffect(() => {
    loadCart();
    fetchOrders();
  }, [isAuthenticated]);

  const updateQuantity = (productId, delta) => {
    const updated = cartItems.map(item => {
      if (item.product_id === productId) {
        const newQ = item.quantity + delta;
        return newQ > 0 ? { ...item, quantity: newQ } : null;
      }
      return item;
    }).filter(Boolean);

    setCartItems(updated);
    localStorage.setItem('silverhands_cart', JSON.stringify(updated));
  };

  const removeItem = (productId) => {
    const updated = cartItems.filter(item => item.product_id !== productId);
    setCartItems(updated);
    localStorage.setItem('silverhands_cart', JSON.stringify(updated));
  };

  const clearCart = () => {
    setCartItems([]);
    localStorage.removeItem('silverhands_cart');
  };

  const handleCheckout = async (e) => {
    e.preventDefault();
    if (!cartItems.length) return;
    setError('');
    setSubmitting(true);

    try {
      const payload = {
        items: cartItems.map(item => ({
          product_id: item.product_id,
          product_title: item.product_title,
          quantity: item.quantity,
          price_per_unit: item.price_per_unit,
          seller_id: item.seller_id,
          seller_name: item.seller_name
        })),
        delivery_name: deliveryForm.name,
        delivery_phone: deliveryForm.phone,
        delivery_address: deliveryForm.address,
        delivery_city: deliveryForm.city,
        delivery_locality: deliveryForm.locality,
        payment_method: deliveryForm.paymentMethod,
        special_notes: deliveryForm.notes
      };

      const res = await api.post('/store/orders', payload);
      setSuccessOrder(res);
      clearCart();
      fetchOrders();
      setActiveTab('orders');
    } catch (err) {
      setError(err.message || 'Checkout failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const subtotal = cartItems.reduce((acc, item) => acc + (item.price_per_unit * item.quantity), 0);
  const deliveryFee = subtotal > 500 ? 0 : 40;
  const grandTotal = subtotal + deliveryFee;

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12">
      
      {/* Header & Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-base-200">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-base-content">
            Shopping Cart & Orders
          </h1>
          <p className="text-xs text-base-content/70">
            Managed local delivery directly from verified seniors in {selectedCity.name}
          </p>
        </div>

        <div className="join bg-base-100 border border-base-300 rounded-xl p-1 shadow-xs">
          <button 
            type="button" 
            onClick={() => setActiveTab('cart')}
            className={`join-item btn btn-sm rounded-lg text-xs gap-1.5 ${activeTab === 'cart' ? 'btn-primary' : 'btn-ghost'}`}
          >
            <ShoppingBag className="w-3.5 h-3.5" /> Cart ({cartItems.length})
          </button>
          <button 
            type="button" 
            onClick={() => { setActiveTab('orders'); fetchOrders(); }}
            className={`join-item btn btn-sm rounded-lg text-xs gap-1.5 ${activeTab === 'orders' ? 'btn-primary' : 'btn-ghost'}`}
          >
            <Package className="w-3.5 h-3.5" /> My Orders ({orders.length})
          </button>
        </div>
      </div>

      <ErrorAlert message={error} />

      {/* TAB 1: Cart & Checkout */}
      {activeTab === 'cart' && (
        <div className="space-y-6">
          {cartItems.length === 0 ? (
            <div className="bg-base-100 rounded-3xl border border-base-300 p-12 text-center space-y-4">
              <ShoppingBag className="w-16 h-16 text-base-content/30 mx-auto" />
              <h3 className="text-lg font-bold text-base-content">Your cart is empty</h3>
              <p className="text-xs text-base-content/60 max-w-sm mx-auto">
                Explore our local store to discover homemade pickles, festival gift hampers, and custom tailoring!
              </p>
              <Link to="/store" className="btn btn-primary btn-sm rounded-xl text-white font-bold gap-1 text-xs">
                Explore Store <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              
              {/* Left: Cart Items List */}
              <div className="lg:col-span-7 space-y-3">
                <div className="flex items-center justify-between pb-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-base-content/60">
                    Items from verified local makers ({cartItems.length})
                  </span>
                  <button onClick={clearCart} className="text-xs text-error font-semibold hover:underline">
                    Clear Cart
                  </button>
                </div>

                {cartItems.map((item) => (
                  <div 
                    key={item.product_id}
                    className="card bg-base-100 border border-base-300 p-4 rounded-2xl shadow-xs flex flex-row items-center justify-between gap-4"
                  >
                    <div className="flex items-center gap-3">
                      {item.image && (
                        <img 
                          src={item.image} 
                          alt={item.product_title} 
                          className="w-14 h-14 rounded-xl object-cover bg-base-200 shrink-0" 
                        />
                      )}
                      <div>
                        <h4 className="font-bold text-sm text-base-content leading-snug">{item.product_title}</h4>
                        <p className="text-[11px] text-base-content/60">By {item.seller_name}</p>
                        <span className="text-xs font-extrabold text-primary block mt-0.5">
                          ₹{item.price_per_unit} each
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      {/* Quantity selector */}
                      <div className="join border border-base-300 rounded-lg bg-base-200">
                        <button 
                          onClick={() => updateQuantity(item.product_id, -1)}
                          className="join-item btn btn-xs btn-ghost px-2 font-bold"
                        >
                          -
                        </button>
                        <span className="join-item px-2.5 flex items-center justify-center text-xs font-bold">
                          {item.quantity}
                        </span>
                        <button 
                          onClick={() => updateQuantity(item.product_id, 1)}
                          className="join-item btn btn-xs btn-ghost px-2 font-bold"
                        >
                          +
                        </button>
                      </div>

                      <button 
                        onClick={() => removeItem(item.product_id)}
                        className="btn btn-ghost btn-xs btn-circle text-base-content/50 hover:text-error"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}

                {/* Trust signal */}
                <div className="bg-success/10 border border-success/20 rounded-2xl p-3 text-xs text-success-content flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-success shrink-0" />
                  <span className="text-[11px] font-medium text-base-content">
                    Direct local livelihood impact: 100% of proceeds go directly to senior makers.
                  </span>
                </div>
              </div>

              {/* Right: Checkout & Delivery Form */}
              <div className="lg:col-span-5 space-y-6">
                
                <div className="card bg-base-100 border border-base-300 p-6 rounded-3xl shadow-sm space-y-4">
                  <h3 className="font-bold text-base text-base-content">Delivery & Order Summary</h3>
                  
                  <form onSubmit={handleCheckout} className="space-y-3 text-xs">
                    <div className="form-control">
                      <label className="label text-[11px] font-semibold">Recipient Name</label>
                      <input 
                        type="text" 
                        required
                        value={deliveryForm.name}
                        onChange={(e) => setDeliveryForm(prev => ({ ...prev, name: e.target.value }))}
                        className="input input-bordered input-sm w-full rounded-xl"
                      />
                    </div>

                    <div className="form-control">
                      <label className="label text-[11px] font-semibold">Contact Phone</label>
                      <input 
                        type="tel" 
                        required
                        value={deliveryForm.phone}
                        onChange={(e) => setDeliveryForm(prev => ({ ...prev, phone: e.target.value }))}
                        className="input input-bordered input-sm w-full rounded-xl"
                      />
                    </div>

                    <div className="form-control">
                      <label className="label text-[11px] font-semibold">Delivery Address</label>
                      <textarea 
                        rows={2}
                        required
                        value={deliveryForm.address}
                        onChange={(e) => setDeliveryForm(prev => ({ ...prev, address: e.target.value }))}
                        className="textarea textarea-bordered w-full text-xs rounded-xl"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div className="form-control">
                        <label className="label text-[11px] font-semibold">City</label>
                        <input 
                          type="text" 
                          readOnly 
                          value={deliveryForm.city}
                          className="input input-bordered input-sm w-full rounded-xl bg-base-200 font-medium"
                        />
                      </div>
                      <div className="form-control">
                        <label className="label text-[11px] font-semibold">Locality</label>
                        <input 
                          type="text" 
                          required
                          value={deliveryForm.locality}
                          onChange={(e) => setDeliveryForm(prev => ({ ...prev, locality: e.target.value }))}
                          className="input input-bordered input-sm w-full rounded-xl"
                        />
                      </div>
                    </div>

                    {/* Cost Breakdown */}
                    <div className="pt-3 border-t border-base-200 space-y-1.5 text-xs">
                      <div className="flex justify-between text-base-content/70">
                        <span>Items Subtotal:</span>
                        <span>₹{subtotal.toLocaleString('en-IN')}</span>
                      </div>
                      <div className="flex justify-between text-base-content/70">
                        <span>Local Delivery:</span>
                        <span>{deliveryFee === 0 ? <strong className="text-success">FREE</strong> : `₹${deliveryFee}`}</span>
                      </div>
                      <div className="flex justify-between font-extrabold text-sm text-base-content pt-1 border-t border-base-200">
                        <span>Total Payable:</span>
                        <span className="text-primary">₹{grandTotal.toLocaleString('en-IN')}</span>
                      </div>
                    </div>

                    <button 
                      type="submit" 
                      disabled={submitting}
                      className="btn btn-primary w-full rounded-xl text-white font-bold text-xs gap-2 mt-2 shadow-md"
                    >
                      {submitting ? <span className="loading loading-spinner loading-xs"></span> : <>Place Managed Order <ArrowRight className="w-4 h-4" /></>}
                    </button>
                  </form>
                </div>

              </div>

            </div>
          )}
        </div>
      )}

      {/* TAB 2: Live Orders State Tracker */}
      {activeTab === 'orders' && (
        <div className="space-y-6">
          {loadingOrders ? (
            <LoadingSpinner message="Fetching order history and status..." />
          ) : orders.length === 0 ? (
            <div className="bg-base-100 rounded-3xl border border-base-300 p-12 text-center space-y-3">
              <Package className="w-12 h-12 text-base-content/30 mx-auto" />
              <h3 className="font-bold text-base text-base-content">No active or past orders found</h3>
              <p className="text-xs text-base-content/60">Place your first order from our authentic local store!</p>
            </div>
          ) : (
            <div className="space-y-6">
              {orders.map((ord) => {
                const currentStatusIndex = STATUS_STEPS.indexOf(ord.status);

                return (
                  <div 
                    key={ord.id}
                    className="card bg-base-100 border border-base-300 rounded-3xl p-6 shadow-xs space-y-4"
                  >
                    {/* Order Head */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-base-200">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-xs text-primary">{ord.order_number}</span>
                          <span className="badge badge-sm badge-success text-white font-bold capitalize">
                            {ord.status}
                          </span>
                        </div>
                        <p className="text-[11px] text-base-content/60 mt-0.5">
                          Ordered on {new Date(ord.created_at).toLocaleString()}
                        </p>
                      </div>

                      <span className="text-base font-extrabold text-base-content">
                        Total: ₹{ord.total_amount.toLocaleString('en-IN')}
                      </span>
                    </div>

                    {/* State Machine Visual Timeline */}
                    <div className="py-2">
                      <span className="text-[11px] font-bold text-base-content/70 uppercase tracking-wider block mb-2">
                        Live Order Progress:
                      </span>
                      
                      <div className="grid grid-cols-5 gap-1 text-center">
                        {['pending', 'accepted', 'preparing', 'ready', 'delivered'].map((step, idx) => {
                          const isDone = currentStatusIndex >= idx;
                          const isCurrent = ord.status === step;

                          return (
                            <div key={step} className="space-y-1">
                              <div className={`h-2 rounded-full transition-all ${
                                isDone ? 'bg-primary' : 'bg-base-300'
                              } ${isCurrent ? 'ring-2 ring-primary/40' : ''}`}></div>
                              <span className={`text-[10px] font-bold capitalize block ${
                                isDone ? 'text-primary' : 'text-base-content/40'
                              }`}>
                                {step}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Order Items */}
                    <div className="bg-base-200/60 p-3.5 rounded-2xl space-y-2 text-xs">
                      {ord.items.map((it, i) => (
                        <div key={i} className="flex justify-between items-center text-base-content/80">
                          <span>{it.quantity}x {it.product_title} (by {it.seller_name})</span>
                          <span className="font-bold">₹{it.price_per_unit * it.quantity}</span>
                        </div>
                      ))}
                    </div>

                    {/* Delivery Info */}
                    <div className="text-xs text-base-content/70 flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-secondary shrink-0" />
                      <span>Delivering to: <strong>{ord.delivery_address}, {ord.delivery_locality}, {ord.delivery_city}</strong></span>
                    </div>

                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

    </div>
  );
}
