import React, { useState } from 'react';
import { 
  Sparkles, 
  ShoppingBag, 
  MapPin, 
  DollarSign, 
  CheckCircle2, 
  X, 
  Image, 
  Layers 
} from 'lucide-react';
import api from '../../api/client';
import ErrorAlert from '../common/ErrorAlert';

const PRODUCT_CATEGORIES = [
  'Festive Sweets & Snacks',
  'Food & Preserves',
  'Tailoring & Apparel',
  'Handicrafts & Decor',
  'Wellness & Herbal'
];

export default function AddProductModal({ isOpen, onClose, onProductCreated, initialSkill = '' }) {
  const [rawIdea, setRawIdea] = useState(initialSkill);
  const [aiLoading, setAiLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const [productForm, setProductForm] = useState({
    title: '',
    description: '',
    category: 'Festive Sweets & Snacks',
    price: 350,
    unit: '500g Box',
    stock: 25,
    images: ['https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=600&auto=format&fit=crop&q=80'],
    locality: 'Adyar',
    city: 'Chennai',
    is_festival_special: true,
    festival_tag: 'Diwali'
  });

  if (!isOpen) return null;

  const handleAiSuggest = async () => {
    if (!rawIdea.trim()) return;
    setAiLoading(true);
    setError('');
    try {
      const res = await api.post('/store/products/ai-suggest', { raw_idea: rawIdea });
      setProductForm(prev => ({
        ...prev,
        title: res.title || prev.title,
        description: res.description || prev.description,
        category: res.suggested_category && PRODUCT_CATEGORIES.includes(res.suggested_category) ? res.suggested_category : prev.category,
        price: res.suggested_price || prev.price,
        unit: res.unit || prev.unit
      }));
    } catch (err) {
      console.error('Product AI suggest error:', err);
      setError('AI assistant encountered a brief issue. You can fill out the fields manually below.');
    } finally {
      setAiLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      const payload = {
        title: productForm.title.trim(),
        description: productForm.description.trim(),
        category: productForm.category,
        price: parseInt(productForm.price, 10) || 350,
        unit: productForm.unit.trim() || 'Pack',
        stock: parseInt(productForm.stock, 10) || 20,
        images: productForm.images,
        locality: productForm.locality || 'Adyar',
        city: productForm.city || 'Chennai',
        is_festival_special: productForm.is_festival_special,
        festival_tag: productForm.is_festival_special ? (productForm.festival_tag || 'Festive Special') : null
      };
      const created = await api.post('/store/products', payload);
      if (onProductCreated) onProductCreated(created);
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to list product in store.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[99999] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-base-100 border border-base-300 max-w-2xl w-full rounded-3xl p-6 space-y-4 shadow-2xl max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in duration-150">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-base-200 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-secondary/15 text-secondary flex items-center justify-center font-bold">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-lg text-base-content">Sell Homemade Product / Craft</h3>
              <p className="text-xs text-base-content/60">List your traditional pickles, sweets, tailoring, or artwork directly to local customers.</p>
            </div>
          </div>
          <button onClick={onClose} className="btn btn-sm btn-circle btn-ghost">
            <X className="w-4 h-4" />
          </button>
        </div>

        <ErrorAlert message={error} />

        {/* AI Assistant Banner */}
        <div className="bg-secondary/10 border border-secondary/25 rounded-2xl p-4 space-y-2">
          <label className="text-xs font-bold text-secondary flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-secondary" /> AI Product Catalog Assistant
          </label>
          <p className="text-[11px] text-base-content/70">
            Describe what you make (e.g. "pure ghee Mysore pak with roasted gram flour" or "hand-stitched silk potli gift bags"). AI will draft a compelling story and price.
          </p>
          <div className="flex gap-2">
            <input
              type="text"
              value={rawIdea}
              onChange={(e) => setRawIdea(e.target.value)}
              placeholder="e.g. Traditional tender mango pickle in cold-pressed oil, silk saree blouse tailoring..."
              className="input input-bordered input-sm flex-1 text-xs rounded-xl"
              onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAiSuggest(); } }}
            />
            <button
              type="button"
              onClick={handleAiSuggest}
              disabled={aiLoading || !rawIdea.trim()}
              className="btn btn-secondary btn-sm rounded-xl text-white font-bold text-xs gap-1.5"
            >
              {aiLoading ? <span className="loading loading-spinner loading-xs"></span> : <Sparkles className="w-3.5 h-3.5" />}
              Generate with AI
            </button>
          </div>
        </div>

        {/* Manual Refinement Form */}
        <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
          
          <div className="form-control">
            <label className="label text-[11px] font-semibold">Product Title</label>
            <input
              type="text"
              required
              value={productForm.title}
              onChange={(e) => setProductForm({ ...productForm, title: e.target.value })}
              placeholder="e.g. Heritage Pure Ghee Festive Mysore Pak Box"
              className="input input-bordered input-sm rounded-xl"
            />
          </div>

          <div className="form-control">
            <label className="label text-[11px] font-semibold">Product Story & Description</label>
            <textarea
              rows={3}
              required
              value={productForm.description}
              onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
              placeholder="Describe your authentic ingredients, preparation recipe, or handcrafted process..."
              className="textarea textarea-bordered rounded-xl text-xs"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="form-control">
              <label className="label text-[11px] font-semibold">Category</label>
              <select
                value={productForm.category}
                onChange={(e) => setProductForm({ ...productForm, category: e.target.value })}
                className="select select-bordered select-sm rounded-xl text-xs"
              >
                {PRODUCT_CATEGORIES.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div className="form-control">
              <label className="label text-[11px] font-semibold">Unit / Packaging</label>
              <input
                type="text"
                required
                value={productForm.unit}
                onChange={(e) => setProductForm({ ...productForm, unit: e.target.value })}
                placeholder="e.g. 500g Box, 350g Jar, Piece, Set of 3"
                className="input input-bordered input-sm rounded-xl"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="form-control">
              <label className="label text-[11px] font-semibold">Selling Price (₹)</label>
              <input
                type="number"
                required
                min={10}
                value={productForm.price}
                onChange={(e) => setProductForm({ ...productForm, price: parseInt(e.target.value) || 0 })}
                className="input input-bordered input-sm rounded-xl"
              />
            </div>

            <div className="form-control">
              <label className="label text-[11px] font-semibold">Initial Stock Batch</label>
              <input
                type="number"
                required
                min={1}
                value={productForm.stock}
                onChange={(e) => setProductForm({ ...productForm, stock: parseInt(e.target.value) || 10 })}
                className="input input-bordered input-sm rounded-xl"
              />
            </div>
          </div>

          <div className="flex items-center gap-3 pt-2">
            <label className="label cursor-pointer gap-2 p-0">
              <input
                type="checkbox"
                checked={productForm.is_festival_special}
                onChange={(e) => setProductForm({ ...productForm, is_festival_special: e.target.checked })}
                className="checkbox checkbox-secondary checkbox-sm rounded-md"
              />
              <span className="text-xs font-semibold text-base-content">Tag as Festival Special</span>
            </label>
          </div>

          <div className="modal-action pt-2 border-t border-base-200">
            <button
              type="button"
              onClick={onClose}
              className="btn btn-ghost btn-sm rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="btn btn-secondary btn-sm rounded-xl text-white font-bold"
            >
              {submitting ? <span className="loading loading-spinner loading-xs"></span> : 'List Product in Marketplace'}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}
