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
  X
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLocation } from '../context/LocationContext';
import api from '../api/client';
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

  // Senior Create Product Modal
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [creating, setCreating] = useState(false);
  const [createIdea, setCreateIdea] = useState('');
  const [suggesting, setSuggesting] = useState(false);
  
  const [productForm, setProductForm] = useState({
    title: '',
    description: '',
    category: 'Food & Preserves',
    price: 250,
    unit: 'Jar',
    locality: selectedCity.localities[0] || 'Mylapore',
    city: selectedCity.name,
    is_festival_special: false,
    festival_tag: activeFestival,
    images: []
  });

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

  useEffect(() => {
    fetchProducts();
  }, [selectedCity, selectedCategory, showFestivalOnly, searchQuery]);

  const handleAddToCart = (product) => {
    const existingCart = JSON.parse(localStorage.getItem('silverhands_cart') || '[]');
    const existingIndex = existingCart.findIndex(item => item.product_id === product.id);

    if (existingIndex > -1) {
      existingCart[existingIndex].quantity += 1;
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
    setToastMsg(`Added "${product.title}" to your cart!`);
    setTimeout(() => setToastMsg(''), 3000);
  };

  // AI Product Assistant
  const handleAISuggest = async () => {
    if (!createIdea.trim()) return;
    setSuggesting(true);
    try {
      const res = await api.post('/store/products/ai-suggest', {
        raw_idea: createIdea
      });
      setProductForm(prev => ({
        ...prev,
        title: res.title,
        description: res.description,
        category: res.suggested_category,
        price: res.suggested_price
      }));
    } catch (err) {
      console.error('AI suggest error:', err);
    } finally {
      setSuggesting(false);
    }
  };

  const handleCreateProduct = async (e) => {
    e.preventDefault();
    setCreating(true);
    try {
      await api.post('/store/products', productForm);
      setShowCreateModal(false);
      setToastMsg('Product published successfully!');
      setTimeout(() => setToastMsg(''), 3000);
      fetchProducts();
    } catch (err) {
      setError(err.message || 'Failed to create product.');
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="space-y-8 pb-12">
      
      {/* Toast */}
      {toastMsg && (
        <div className="toast toast-top toast-center z-50">
          <div className="alert alert-success text-white font-bold text-xs shadow-lg rounded-xl flex items-center gap-2">
            <Check className="w-4 h-4" />
            <span>{toastMsg}</span>
          </div>
        </div>
      )}

      {/* Header & Festival Context */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="badge badge-primary badge-sm font-bold text-white">Local-First Commerce</span>
            <span className="text-xs text-base-content/60 font-semibold flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-secondary" /> {selectedCity.name} ({selectedCity.tier})
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-base-content mt-1">
            Authentic Local Store
          </h1>
          <p className="text-xs sm:text-sm text-base-content/70">
            Handmade foods, heritage sweets, and bespoke tailoring from verified seniors in {selectedCity.name}
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          {user?.role === 'senior' && (
            <button
              onClick={() => setShowCreateModal(true)}
              className="btn btn-primary btn-sm rounded-xl text-white font-bold gap-1 shadow-sm"
            >
              <Plus className="w-4 h-4" /> Sell My Product
            </button>
          )}

          <Link to="/cart" className="btn btn-outline btn-neutral btn-sm rounded-xl font-bold gap-1 text-xs">
            <ShoppingBag className="w-4 h-4 text-secondary" /> View Cart
          </Link>
        </div>
      </div>

      {/* Festival Quick Filter Banner */}
      <div className="bg-gradient-to-r from-secondary/15 via-base-100 to-primary/15 border border-secondary/30 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs">
        <div className="flex items-center gap-3">
          <span className="text-2xl">🪔</span>
          <div className="text-xs">
            <span className="font-bold text-secondary uppercase block">{activeFestival} Festive Edition</span>
            <p className="text-base-content/80 font-medium">
              Discover authentic handmade delicacies, puja sweets, and festive gifts crafted by local grandmothers & artisans.
            </p>
          </div>
        </div>

        <button
          onClick={() => setShowFestivalOnly(!showFestivalOnly)}
          className={`btn btn-xs rounded-lg font-bold gap-1 shrink-0 ${
            showFestivalOnly ? 'btn-secondary text-white' : 'btn-outline btn-secondary'
          }`}
        >
          <Sparkles className="w-3 h-3" /> {showFestivalOnly ? 'Showing Festival Only' : `Show ${activeFestival} Items`}
        </button>
      </div>

      {/* Search & Category Filter Bar */}
      <div className="space-y-4">
        
        {/* Search Bar */}
        <div className="relative max-w-xl">
          <Search className="w-4 h-4 text-base-content/40 absolute left-3.5 top-3.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search mango pickle, Mysore Pak, tailoring, silk potli..."
            className="input input-bordered w-full pl-10 text-sm rounded-2xl bg-base-100"
          />
          {searchQuery && (
            <button 
              onClick={() => setSearchQuery('')}
              className="btn btn-ghost btn-xs btn-circle absolute right-2.5 top-2.5"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3.5 py-1.5 rounded-full font-bold whitespace-nowrap transition-all ${
                selectedCategory === cat
                  ? 'bg-primary text-white shadow-xs'
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
      ) : products.length === 0 ? (
        <div className="bg-base-100 rounded-3xl border border-base-300 p-12 text-center space-y-3">
          <ShoppingBag className="w-12 h-12 text-base-content/30 mx-auto" />
          <h3 className="text-lg font-bold text-base-content">No products matching your search in {selectedCity.name}</h3>
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
          {products.map((product) => (
            <div 
              key={product.id}
              className="card bg-base-100 border border-base-300 shadow-xs hover:shadow-md transition-all rounded-3xl overflow-hidden flex flex-col justify-between group"
            >
              {/* Product Image & Festival Badge */}
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
                    <span className="flex items-center gap-1 font-bold text-base-content/80">
                      <Star className="w-3 h-3 text-warning fill-warning" /> {product.seller_rating}
                    </span>
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
                    <span className="badge badge-ghost badge-xs text-[9px] font-bold text-success border-success/30">
                      <ShieldCheck className="w-3 h-3 mr-0.5" /> Age Verified
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
                      className="btn btn-primary btn-sm rounded-xl text-white font-bold text-xs gap-1.5 shadow-xs"
                      aria-label={`Add ${product.title} to cart`}
                    >
                      <ShoppingBag className="w-3.5 h-3.5" /> Add
                    </button>
                  </div>
                </div>

              </div>

            </div>
          ))}
        </div>
      )}

      {/* SENIOR CREATE PRODUCT MODAL */}
      {showCreateModal && (
        <div className="modal modal-open z-50">
          <div className="modal-box rounded-3xl max-w-lg p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-2 border-b border-base-200">
              <div>
                <h3 className="text-lg font-bold text-base-content">Create & Publish a Product</h3>
                <p className="text-xs text-base-content/60">Share your homemade goods or crafts with nearby customers</p>
              </div>
              <button onClick={() => setShowCreateModal(false)} className="btn btn-sm btn-circle btn-ghost">✕</button>
            </div>

            {/* AI Assist Box */}
            <div className="bg-primary/10 border border-primary/20 rounded-2xl p-3.5 space-y-2">
              <label className="text-xs font-bold text-primary flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" /> AI Product Assistant (Optional):
              </label>
              <div className="flex items-center gap-2">
                <input 
                  type="text" 
                  value={createIdea}
                  onChange={(e) => setCreateIdea(e.target.value)}
                  placeholder="e.g. Traditional Mysore Pak with pure ghee for Diwali"
                  className="input input-sm input-bordered w-full text-xs rounded-xl"
                />
                <button 
                  type="button"
                  onClick={handleAISuggest}
                  disabled={suggesting || !createIdea.trim()}
                  className="btn btn-sm btn-primary text-white rounded-xl text-xs font-bold shrink-0"
                >
                  {suggesting ? 'Generating...' : 'Auto-Fill'}
                </button>
              </div>
            </div>

            <form onSubmit={handleCreateProduct} className="space-y-3 text-xs">
              <div className="form-control">
                <label className="label text-xs font-semibold">Product Title</label>
                <input 
                  type="text" 
                  required
                  value={productForm.title}
                  onChange={(e) => setProductForm(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="e.g. Authentic Thanjavur Mango Pickle"
                  className="input input-bordered input-sm w-full rounded-xl"
                />
              </div>

              <div className="form-control">
                <label className="label text-xs font-semibold">Description</label>
                <textarea 
                  rows={3}
                  required
                  value={productForm.description}
                  onChange={(e) => setProductForm(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Describe your authentic family recipe, ingredients, or craftsmanship..."
                  className="textarea textarea-bordered w-full text-xs rounded-xl"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="form-control">
                  <label className="label text-xs font-semibold">Category</label>
                  <select 
                    value={productForm.category}
                    onChange={(e) => setProductForm(prev => ({ ...prev, category: e.target.value }))}
                    className="select select-bordered select-sm w-full rounded-xl"
                  >
                    {CATEGORIES.filter(c => c !== 'All').map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                <div className="form-control">
                  <label className="label text-xs font-semibold">Price (₹)</label>
                  <input 
                    type="number" 
                    required
                    min={10}
                    value={productForm.price}
                    onChange={(e) => setProductForm(prev => ({ ...prev, price: parseInt(e.target.value) || 0 }))}
                    className="input input-bordered input-sm w-full rounded-xl"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="form-control">
                  <label className="label text-xs font-semibold">Unit Type</label>
                  <input 
                    type="text" 
                    value={productForm.unit}
                    onChange={(e) => setProductForm(prev => ({ ...prev, unit: e.target.value }))}
                    placeholder="e.g. 350g Jar / Piece / Gift Box"
                    className="input input-bordered input-sm w-full rounded-xl"
                  />
                </div>

                <div className="form-control">
                  <label className="label text-xs font-semibold">Area / Locality</label>
                  <select 
                    value={productForm.locality}
                    onChange={(e) => setProductForm(prev => ({ ...prev, locality: e.target.value }))}
                    className="select select-bordered select-sm w-full rounded-xl"
                  >
                    {selectedCity.localities.map(loc => (
                      <option key={loc} value={loc}>{loc}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="form-control pt-1">
                <label className="cursor-pointer label justify-start gap-2">
                  <input 
                    type="checkbox"
                    checked={productForm.is_festival_special}
                    onChange={(e) => setProductForm(prev => ({ ...prev, is_festival_special: e.target.checked }))}
                    className="checkbox checkbox-sm checkbox-primary rounded"
                  />
                  <span className="label-text text-xs font-bold">Tag as {activeFestival} Special Offering</span>
                </label>
              </div>

              <div className="modal-action pt-2 flex items-center justify-between">
                <button type="button" onClick={() => setShowCreateModal(false)} className="btn btn-ghost btn-sm rounded-xl">
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={creating}
                  className="btn btn-primary btn-sm rounded-xl text-white font-bold"
                >
                  {creating ? 'Publishing...' : 'Publish to Store'}
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  );
}
