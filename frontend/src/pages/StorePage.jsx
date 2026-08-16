import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  ShoppingBag, 
  Search, 
  Filter, 
  Sparkles, 
  MapPin, 
  Star, 
  ShieldCheck, 
  Plus, 
  Check, 
  ArrowRight,
  SlidersHorizontal,
  X,
  CheckCircle2
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLocation } from '../context/LocationContext';
import api from '../api/client';
import AddProductModal from '../components/modals/AddProductModal';
import ErrorAlert from '../components/common/ErrorAlert';
import LoadingSpinner from '../components/common/LoadingSpinner';

const CATEGORIES = [
  'All',
  'Food & Preserves',
  'Festive Sweets & Snacks',
  'Handicrafts & Decor',
  'Tailoring & Apparel',
  'Gifting'
];

export default function StorePage() {
  const { user, isAuthenticated } = useAuth();
  const { selectedCity, activeFestival, setActiveFestival } = useLocation();
  const navigate = useNavigate();

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Filters
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [showFestivalOnly, setShowFestivalOnly] = useState(false);
  const [toastMsg, setToastMsg] = useState('');
  const [addedId, setAddedId] = useState(null);

  // Senior Create Product Modal
  const [showCreateModal, setShowCreateModal] = useState(false);

  const fetchProducts = async () => {
    setLoading(true);
    setError('');
    try {
      const params = {};
      if (selectedCity?.name) params.city = selectedCity.name;
      if (selectedCategory !== 'All') params.category = selectedCategory;
      if (showFestivalOnly) params.festival = activeFestival;
      if (searchQuery.trim()) params.search = searchQuery.trim();

      const data = await api.get('/store/products', { params });
      setProducts(data || []);
    } catch (err) {
      setError(err.message || 'Failed to load store products.');
    } finally {
      setLoading(false);
    }
  };

  const visibleProducts = products.filter(p => !user || p.seller_id !== user.id);

  useEffect(() => {
    fetchProducts();
  }, [selectedCity?.name, selectedCategory, showFestivalOnly, searchQuery]);

  const handleAddToCart = (product) => {
    const existingCart = JSON.parse(localStorage.getItem('silverhands_cart') || '[]');
    const existingIndex = existingCart.findIndex(item => item.product_id === product.id);

    if (existingIndex > -1) {
      existingCart[existingIndex].quantity = Math.min(10, existingCart[existingIndex].quantity + 1);
    } else {
      existingCart.push({
        product_id: product.id,
        product_title: product.title,
        price_per_unit: product.price,
        quantity: 1,
        unit: product.unit,
        seller_id: product.seller_id,
        seller_name: product.seller_name,
        image: product.images[0]
      });
    }

    localStorage.setItem('silverhands_cart', JSON.stringify(existingCart));
    setAddedId(product.id);
    setTimeout(() => setAddedId(null), 1500);
    setToastMsg(`Added "${product.title}" to your cart!`);
    setTimeout(() => setToastMsg(''), 3000);
  };

  return (
    <div className="space-y-8 pb-12">
      
      {/* Toast Notification */}
      {toastMsg && (
        <div className="toast toast-top toast-center z-50">
          <div className="alert alert-success text-white font-bold text-xs shadow-lg rounded-xl flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" />
            <span>{toastMsg}</span>
          </div>
        </div>
      )}

      {/* Header & Seller Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="badge badge-secondary badge-sm font-bold text-white uppercase">Authentic Marketplace</span>
            <span className="text-xs text-base-content/60 font-semibold flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-secondary" /> {selectedCity?.name || 'Chennai'} Localities
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-base-content mt-1">
            Handcrafted Traditional Treasures
          </h1>
          <p className="text-xs sm:text-sm text-base-content/70">
            Support local senior citizens & homemakers directly. 100% authentic recipes, pure ingredients, and zero preservatives.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 self-start md:self-auto">
          {user?.role === 'senior' && (
            <button
              type="button"
              onClick={() => setShowCreateModal(true)}
              className="btn btn-secondary btn-sm rounded-xl text-white font-bold text-xs gap-1 shadow-sm"
            >
              <Plus className="w-3.5 h-3.5" /> Sell Product with AI
            </button>
          )}

          <Link to="/cart" className="btn btn-outline btn-neutral btn-sm rounded-xl gap-1.5 text-xs font-bold">
            <ShoppingBag className="w-4 h-4 text-primary" /> View Cart
          </Link>
        </div>
      </div>

      {/* Festival Quick Filter Banner */}
      <div className="bg-gradient-to-r from-secondary/15 via-base-100 to-primary/15 border-2 border-secondary/30 rounded-3xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm">
        <div className="flex items-center gap-3">
          <span className="text-3xl">🪔</span>
          <div>
            <span className="font-extrabold text-secondary uppercase text-xs sm:text-sm block">{activeFestival} Festive Edition</span>
            <p className="text-xs sm:text-sm text-base-content/80 font-medium">
              Discover authentic handmade delicacies, puja sweets, and festive gifts crafted by local grandmothers & artisans.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setShowFestivalOnly(!showFestivalOnly)}
          className={`btn min-h-[44px] px-5 rounded-2xl font-bold text-xs sm:text-sm gap-2 shrink-0 shadow-xs ${
            showFestivalOnly ? 'btn-secondary text-white' : 'btn-outline btn-secondary'
          }`}
        >
          <Sparkles className="w-4 h-4" /> {showFestivalOnly ? 'Showing Festival Only' : `Show ${activeFestival} Items`}
        </button>
      </div>

      {/* Search & Category Filter Bar */}
      <div className="space-y-4">
        <div className="relative max-w-xl">
          <Search className="w-4 h-4 text-base-content/40 absolute left-4 top-4" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search mango pickle, Mysore Pak, tailoring, silk potli..."
            className="input input-bordered min-h-[48px] w-full pl-11 text-sm rounded-2xl bg-base-100"
          />
          {searchQuery && (
            <button 
              onClick={() => setSearchQuery('')}
              className="btn btn-ghost btn-sm min-h-[36px] btn-circle absolute right-2 top-2"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-2 text-xs sm:text-sm">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`min-h-[40px] px-4 py-2 rounded-full font-bold whitespace-nowrap transition-all ${
                selectedCategory === cat
                  ? 'bg-primary text-white shadow-sm'
                  : 'bg-base-100 border border-base-300 text-base-content/70 hover:bg-base-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      <ErrorAlert message={error} onRetry={fetchProducts} />

      {/* Products Grid */}
      {loading ? (
        <LoadingSpinner message="Fetching verified local products..." />
      ) : visibleProducts.length === 0 ? (
        <div className="bg-base-100 rounded-3xl border border-base-300 p-12 text-center space-y-3">
          <ShoppingBag className="w-12 h-12 text-base-content/30 mx-auto" />
          <h3 className="text-lg font-bold text-base-content">No products matching your search in {selectedCity?.name || 'this city'}</h3>
          <p className="text-xs text-base-content/60 max-w-sm mx-auto">
            Try choosing "All Categories" or switching your selected city in the top navigation.
          </p>
          <button 
            onClick={() => { setSelectedCategory('All'); setSearchQuery(''); setShowFestivalOnly(false); }}
            className="btn btn-outline btn-sm rounded-xl text-xs"
          >
            Clear Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {visibleProducts.map((product) => (
            <div 
              key={product.id}
              className="card bg-base-100 border border-base-300 shadow-xs hover:shadow-md transition-all rounded-3xl overflow-hidden flex flex-col justify-between group"
            >
              {/* Product Image */}
              <div className="relative h-48 w-full bg-base-200 overflow-hidden">
                <img
                  src={product.images[0] || 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=600&auto=format&fit=crop&q=80'}
                  alt={product.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                
                {product.is_festival_special && (
                  <span className="badge badge-secondary badge-sm font-bold text-white absolute top-3 left-3 shadow-md gap-1">
                    <Sparkles className="w-3 h-3" /> {product.festival_tag || 'Festive'}
                  </span>
                )}

                <span className="badge badge-neutral badge-sm font-semibold absolute bottom-3 right-3 bg-black/60 backdrop-blur text-white border-0 text-[10px]">
                  📍 {product.locality}
                </span>
              </div>

              {/* Card Body */}
              <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-[11px] text-base-content/60">
                    <span className="font-semibold text-primary">{product.category}</span>
                    {(product.seller_rating || product.rating) ? (
                      <span className="flex items-center gap-1 font-bold text-base-content/80">
                        <Star className="w-3 h-3 text-warning fill-warning" /> {product.seller_rating || product.rating}
                        {product.total_reviews > 0 && <span className="font-normal text-[10px] text-base-content/60">({product.total_reviews})</span>}
                      </span>
                    ) : (
                      <span className="text-[10px] text-base-content/50 font-bold">New</span>
                    )}
                  </div>

                  <Link to={`/store/${product.id}`} className="hover:underline block">
                    <h3 className="font-bold text-base text-base-content line-clamp-2 leading-snug">
                      {product.title}
                    </h3>
                  </Link>

                  <p className="text-xs text-base-content/70 line-clamp-2 leading-relaxed">
                    {product.description}
                  </p>
                </div>

                {/* Seller Trust Bar */}
                <div className="pt-3 border-t border-base-200 space-y-3">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-base-content/70 font-medium truncate">
                      By <strong>{product.seller_name}</strong>
                    </span>
                    <span className="text-[10px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-lg">
                      Max 10 / order
                    </span>
                  </div>

                  {/* Price & Add to Cart */}
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-lg font-extrabold text-base-content">
                        ₹{product.price.toLocaleString('en-IN')}
                      </span>
                      <span className="text-[11px] text-base-content/60 ml-1">/ {product.unit}</span>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleAddToCart(product)}
                      className="btn btn-primary min-h-[44px] px-5 rounded-2xl text-white font-bold text-xs sm:text-sm gap-2 shadow-xs"
                      aria-label={`Add ${product.title} to cart`}
                    >
                      {addedId === product.id ? (
                        <>
                          <Check className="w-4 h-4 text-white" /> Added
                        </>
                      ) : (
                        <>
                          <Plus className="w-4 h-4" /> Add
                        </>
                      )}
                    </button>
                  </div>
                </div>

              </div>

            </div>
          ))}
        </div>
      )}

      {/* Add Product Modal */}
      <AddProductModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onProductCreated={() => {
          setToastMsg('Homemade product published successfully!');
          setTimeout(() => setToastMsg(''), 3500);
          fetchProducts();
        }}
      />

    </div>
  );
}
