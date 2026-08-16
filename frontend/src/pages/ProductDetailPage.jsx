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
  RotateCcw,
  MessageSquarePlus,
  Send
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../api/client';
import ErrorAlert from '../components/common/ErrorAlert';
import LoadingSpinner from '../components/common/LoadingSpinner';

export default function ProductDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  
  const [product, setProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [toastMsg, setToastMsg] = useState('');

  // Review Form
  const [ratingInput, setRatingInput] = useState(5);
  const [commentInput, setCommentInput] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewError, setReviewError] = useState('');

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

  useEffect(() => {
    fetchProduct();
  }, [id]);

  const handleAddToCart = () => {
    if (!product) return;
    const existingCart = JSON.parse(localStorage.getItem('silverhands_cart') || '[]');
    const existingIndex = existingCart.findIndex(item => item.product_id === product.id);

    if (existingIndex > -1) {
      existingCart[existingIndex].quantity = Math.min(10, existingCart[existingIndex].quantity + quantity);
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

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      alert('Please sign in to submit customer feedback.');
      return;
    }
    if (!commentInput.trim()) {
      setReviewError('Please write a brief comment with your review.');
      return;
    }

    setSubmittingReview(true);
    setReviewError('');
    try {
      await api.post(`/store/products/${id}/reviews`, {
        rating: Number(ratingInput),
        comment: commentInput.trim()
      });
      setToastMsg('Thank you! Your verified review and rating were published.');
      setTimeout(() => setToastMsg(''), 3500);
      setCommentInput('');
      setRatingInput(5);
      fetchProduct();
    } catch (err) {
      setReviewError(err.message || 'Failed to submit review.');
    } finally {
      setSubmittingReview(false);
    }
  };

  if (loading) return <LoadingSpinner message="Fetching handcrafted product details..." />;
  if (error) return <ErrorAlert message={error} onRetry={fetchProduct} />;
  if (!product) return null;

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-16">
      
      {/* Toast Notification */}
      {toastMsg && (
        <div className="toast toast-top toast-center z-50">
          <div className="alert alert-success text-white font-bold text-xs shadow-lg rounded-xl flex items-center gap-2">
            <Check className="w-4 h-4" />
            <span>{toastMsg}</span>
          </div>
        </div>
      )}

      {/* Back to Store Nav */}
      <div>
        <Link 
          to="/store" 
          className="btn btn-ghost btn-sm gap-2 rounded-2xl text-xs font-bold text-base-content/70 hover:text-base-content"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Storefront
        </Link>
      </div>

      {/* Product Hero Layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 bg-base-100 p-6 sm:p-8 rounded-3xl border border-base-300 shadow-sm">
        
        {/* Left: Product Images */}
        <div className="space-y-4">
          <div className="relative aspect-square w-full rounded-2xl overflow-hidden bg-base-200 border border-base-300">
            <img 
              src={product.images[0] || 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=600&auto=format&fit=crop&q=80'} 
              alt={product.title}
              className="w-full h-full object-cover"
            />
            {product.is_festival_special && (
              <span className="badge badge-secondary badge-lg font-bold text-white absolute top-4 left-4 shadow-md gap-1.5">
                <Sparkles className="w-4 h-4" /> {product.festival_tag || 'Festive Special'}
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
              {(product.seller_rating || product.rating) ? (
                <span className="flex items-center gap-1 font-bold text-sm text-base-content/80">
                  <Star className="w-4 h-4 text-warning fill-warning" /> {product.seller_rating || product.rating} Seller Rating
                </span>
              ) : (
                <span className="text-xs font-bold text-base-content/60">New Seller</span>
              )}
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
                  onClick={() => setQuantity(Math.min(10, quantity + 1))}
                  className="join-item btn min-h-[44px] btn-ghost px-4 text-base font-bold"
                >
                  +
                </button>
              </div>
            </div>

            {/* Order limit badge */}
            <div className="text-xs">
              <span className="badge badge-neutral badge-sm font-semibold">
                Small-Batch Elder Craft • Max 10 items per order
              </span>
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
              {product.rating ? (
                <>
                  <Star className="w-6 h-6 fill-warning" /> {product.rating}
                </>
              ) : (
                <span className="text-xs font-bold text-base-content/60">No ratings</span>
              )}
            </span>
            <div className="text-left">
              <span className="text-xs font-bold text-base-content block">Verified Score</span>
              <span className="text-[10px] text-base-content/60 font-semibold">{product.total_reviews || 0} Review(s)</span>
            </div>
          </div>
        </div>

        {/* Review Submission Form */}
        {isAuthenticated && user?.id !== product.seller_id && (
          <form onSubmit={handleSubmitReview} className="bg-base-200/50 border border-base-300 rounded-2xl p-4 sm:p-5 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-base-content flex items-center gap-1.5">
                <MessageSquarePlus className="w-4 h-4 text-primary" /> Leave Your Feedback for {product.seller_name}
              </span>
              <div className="flex items-center gap-1">
                <span className="text-[11px] font-bold text-base-content/70 mr-1">Your Rating:</span>
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRatingInput(star)}
                    className="btn btn-ghost btn-xs btn-circle text-warning p-0"
                  >
                    <Star className={`w-4 h-4 ${star <= ratingInput ? 'fill-warning text-warning' : 'text-base-content/30'}`} />
                  </button>
                ))}
              </div>
            </div>

            <textarea
              rows={2}
              value={commentInput}
              onChange={(e) => setCommentInput(e.target.value)}
              placeholder="Share what you loved about this homemade product..."
              className="textarea textarea-bordered w-full rounded-xl text-xs bg-base-100"
            />

            {reviewError && (
              <p className="text-xs text-error font-semibold">{reviewError}</p>
            )}

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={submittingReview}
                className="btn btn-primary btn-sm rounded-xl text-white font-bold text-xs gap-1.5 shadow-xs"
              >
                <Send className="w-3.5 h-3.5" /> Submit Review
              </button>
            </div>
          </form>
        )}

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
