import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  ShoppingBag, 
  Sparkles, 
  ShieldCheck, 
  Star, 
  MapPin, 
  Check, 
  Heart,
  Truck,
  RotateCcw
} from 'lucide-react';
import api from '../api/client';
import ErrorAlert from '../components/common/ErrorAlert';
import LoadingSpinner from '../components/common/LoadingSpinner';

export default function ProductDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [toastMsg, setToastMsg] = useState('');

  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      setError('');
      try {
        const data = await api.get(`/store/products/${id}`);
        setProduct(data);
      } catch (err) {
        setError(err.message || 'Product not found');
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  const handleAddToCart = () => {
    if (!product) return;
    const existingCart = JSON.parse(localStorage.getItem('silverhands_cart') || '[]');
    const existingIndex = existingCart.findIndex(item => item.product_id === product.id);

    if (existingIndex > -1) {
      existingCart[existingIndex].quantity += quantity;
    } else {
      existingCart.push({
        product_id: product.id,
        product_title: product.title,
        price_per_unit: product.price,
        quantity: quantity,
        unit: product.unit,
        seller_id: product.seller_id,
        seller_name: product.seller_name,
        image: product.images[0]
      });
    }

    localStorage.setItem('silverhands_cart', JSON.stringify(existingCart));
    setToastMsg(`Added ${quantity} item(s) to your cart!`);
    setTimeout(() => setToastMsg(''), 3000);
  };

  const handleBuyNow = () => {
    handleAddToCart();
    navigate('/cart');
  };

  if (loading) {
    return <LoadingSpinner message="Loading authentic product details..." />;
  }

  if (error || !product) {
    return (
      <div className="space-y-4 max-w-xl mx-auto py-8">
        <Link to="/store" className="btn btn-ghost btn-sm gap-1">
          <ArrowLeft className="w-4 h-4" /> Back to Store
        </Link>
        <ErrorAlert message={error || "Product not found"} />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      
      {/* Toast */}
      {toastMsg && (
        <div className="toast toast-top toast-center z-50">
          <div className="alert alert-success text-white font-bold text-xs shadow-lg rounded-xl flex items-center gap-2">
            <Check className="w-4 h-4" />
            <span>{toastMsg}</span>
          </div>
        </div>
      )}

      {/* Breadcrumb Back */}
      <Link to="/store" className="btn btn-ghost btn-sm rounded-xl gap-1 text-xs">
        <ArrowLeft className="w-4 h-4" /> Back to Store Catalog
      </Link>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 bg-base-100 border border-base-300 rounded-3xl p-6 sm:p-8 shadow-sm">
        
        {/* Left: Image Container */}
        <div className="space-y-3">
          <div className="relative h-72 sm:h-96 w-full rounded-2xl overflow-hidden bg-base-200 shadow-inner">
            <img 
              src={product.images[0] || 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=600&auto=format&fit=crop&q=80'}
              alt={product.title}
              className="w-full h-full object-cover"
            />
            {product.is_festival_special && (
              <span className="badge badge-secondary badge-md font-bold text-white absolute top-4 left-4 shadow-md gap-1">
                <Sparkles className="w-3.5 h-3.5" /> {product.festival_tag || 'Festival Special'}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2 text-xs text-base-content/60">
            <Truck className="w-4 h-4 text-primary" />
            <span>Prepared and packaged locally in <strong>{product.locality}, {product.city}</strong></span>
          </div>
        </div>

        {/* Right: Product & Seller Details */}
        <div className="flex flex-col justify-between space-y-6">
          
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="badge badge-primary badge-outline text-xs font-bold">{product.category}</span>
              <span className="flex items-center gap-1 font-bold text-sm text-base-content/80">
                <Star className="w-4 h-4 text-warning fill-warning" /> {product.seller_rating} Seller Rating
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-base-content leading-tight">
              {product.title}
            </h1>

            <div className="text-2xl font-extrabold text-primary flex items-baseline gap-1.5">
              ₹{product.price.toLocaleString('en-IN')}
              <span className="text-xs font-semibold text-base-content/60">/ {product.unit}</span>
            </div>

            <p className="text-xs sm:text-sm text-base-content/75 leading-relaxed pt-2">
              {product.description}
            </p>

            {/* Seller Story / Trust Card */}
            <div className="bg-base-200/70 border border-base-300 rounded-2xl p-4 space-y-1.5 mt-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-base-content">Handcrafted by {product.seller_name}</span>
                <span className="badge badge-success badge-xs text-white font-bold gap-1">
                  <ShieldCheck className="w-3 h-3" /> Age Verified
                </span>
              </div>
              <p className="text-[11px] text-base-content/65">
                📍 {product.seller_locality}, {product.seller_city} • Small-batch traditional preparation
              </p>
            </div>
          </div>

          {/* Quantity & Buy Controls */}
          <div className="space-y-4 pt-4 border-t border-base-200">
            
            <div className="flex items-center gap-3">
              <span className="text-sm font-bold text-base-content">Quantity:</span>
              <div className="join border border-base-300 rounded-2xl bg-base-100">
                <button 
                  type="button" 
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="join-item btn min-h-[44px] btn-ghost px-4 text-base font-bold"
                >
                  -
                </button>
                <span className="join-item px-5 flex items-center justify-center font-extrabold text-sm">
                  {quantity}
                </span>
                <button 
                  type="button" 
                  onClick={() => setQuantity(quantity + 1)}
                  className="join-item btn min-h-[44px] btn-ghost px-4 text-base font-bold"
                >
                  +
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                type="button"
                onClick={handleAddToCart}
                className="btn btn-outline btn-neutral min-h-[48px] rounded-2xl font-bold text-sm gap-2"
              >
                <ShoppingBag className="w-5 h-5" /> Add to Cart
              </button>

              <button
                type="button"
                onClick={handleBuyNow}
                className="btn btn-primary min-h-[48px] rounded-2xl text-white font-bold text-sm gap-2 shadow-md"
              >
                Instant Buy (₹{(product.price * quantity).toLocaleString('en-IN')})
              </button>
            </div>

          </div>

        </div>

      </div>

      {/* Customer Ratings & Reviews Section */}
      <div className="card bg-base-100 border border-base-300 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-base-200">
          <div>
            <h2 className="text-lg font-extrabold text-base-content flex items-center gap-2">
              <Star className="w-5 h-5 text-warning fill-warning" /> Customer Reviews & Ratings
            </h2>
            <p className="text-xs text-base-content/60 mt-0.5">
              Verified feedback from local neighborhood food lovers & customers.
            </p>
          </div>

          <div className="flex items-center gap-3 bg-warning/10 border border-warning/25 px-4 py-2 rounded-2xl">
            <span className="text-2xl font-black text-warning flex items-center gap-1">
              <Star className="w-6 h-6 fill-warning" /> {product.rating || 4.9}
            </span>
            <div className="text-left">
              <span className="text-xs font-bold text-base-content block">Average Rating</span>
              <span className="text-[10px] text-base-content/60 font-semibold">{product.total_reviews || 1} Verified Review(s)</span>
            </div>
          </div>
        </div>

        {/* Review List */}
        {(!product.reviews || product.reviews.length === 0) ? (
          <div className="p-6 bg-base-200/50 rounded-2xl text-center space-y-1">
            <p className="text-xs font-bold text-base-content">Authentic Heritage Quality</p>
            <p className="text-[11px] text-base-content/60">Be the first to order and review this authentic handmade product!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {product.reviews.map((rev, idx) => (
              <div key={idx} className="bg-base-200/50 border border-base-300 rounded-2xl p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-base-content">{rev.customer_name}</span>
                  <div className="flex items-center gap-0.5 text-warning">
                    {[...Array(rev.rating || 5)].map((_, i) => (
                      <Star key={i} className="w-3.5 h-3.5 fill-warning" />
                    ))}
                  </div>
                </div>
                <p className="text-xs text-base-content/80 italic leading-relaxed">"{rev.comment}"</p>
                <span className="text-[10px] text-base-content/40 block">{rev.created_at?.slice(0, 10)}</span>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}
