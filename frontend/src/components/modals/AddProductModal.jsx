import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { 
  Sparkles, 
  ShoppingBag, 
  MapPin, 
  CheckCircle2, 
  X, 
  Upload,
  Camera,
  Trash2
} from 'lucide-react';
import api from '../../api/client';
import ErrorAlert from '../common/ErrorAlert';
import { useLocation } from '../../context/LocationContext';

const PRODUCT_CATEGORIES = [
  'Festive Sweets & Snacks',
  'Food & Preserves',
  'Tailoring & Apparel',
  'Handicrafts & Decor',
  'Plants & Gardening',
  'Digital Products',
  'Gifting'
];

export default function AddProductModal({ isOpen, onClose, onProductCreated, initialSkill = '', initialData = null }) {
  const { activeFestival, currentFestivalInfo } = useLocation();
  const [rawIdea, setRawIdea] = useState(initialSkill);
  const [aiLoading, setAiLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);

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
    festival_tag: activeFestival || 'Festive Special'
  });

  // Pre-populate form from launchpad AI data when modal opens
  useEffect(() => {
    if (isOpen && initialData && initialData.title) {
      const priceNum = typeof initialData.price === 'string'
        ? parseInt(initialData.price.replace(/[^\d]/g, '')) || 350
        : (initialData.price || initialData.suggested_price || 350);

      setProductForm(prev => ({
        ...prev,
        title: initialData.title || prev.title,
        description: initialData.description || prev.description,
        category: initialData.category && PRODUCT_CATEGORIES.includes(initialData.category) ? initialData.category : (prev.category || 'Festive Sweets & Snacks'),
        price: priceNum,
        unit: initialData.unit || prev.unit || '500g Box'
      }));
      setRawIdea(initialData.title || initialSkill);
    } else if (isOpen && initialSkill) {
      setRawIdea(initialSkill);
    }
  }, [isOpen, initialData, initialSkill]);

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
        category: res.suggested_category && PRODUCT_CATEGORIES.includes(res.suggested_category) ? res.suggested_category : (res.category || prev.category),
        price: res.suggested_price || res.price || prev.price,
        unit: res.unit || prev.unit
      }));
    } catch (err) {
      console.error('Product AI suggest error:', err);
      setError('AI assistant encountered an issue. You can fill in the fields manually below.');
    } finally {
      setAiLoading(false);
    }
  };

  const handleImageFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setError('Image file is too large (max 5MB). Please choose a smaller photo.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64Url = event.target.result;
      setProductForm(prev => ({
        ...prev,
        images: [base64Url, ...(prev.images.slice(0, 2))]
      }));
    };
    reader.readAsDataURL(file);
  };

  const removeImage = (indexToRemove) => {
    setProductForm(prev => ({
      ...prev,
      images: prev.images.filter((_, idx) => idx !== indexToRemove)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!productForm.title.trim() || !productForm.description.trim()) {
      setError('Please provide a title and description for your product.');
      return;
    }

    setSubmitting(true);
    setError('');
    try {
      const payload = {
        title: productForm.title.trim(),
        description: productForm.description.trim(),
        category: productForm.category,
        price: Number(productForm.price),
        unit: productForm.unit.trim(),
        stock_quantity: Number(productForm.stock),
        images: productForm.images,
        locality: productForm.locality,
        city: productForm.city,
        is_festival_special: Boolean(productForm.is_festival_special),
        festival_tag: productForm.is_festival_special ? (activeFestival || currentFestivalInfo?.name || 'Festive Special') : null
      };

      const res = await api.post('/store/products', payload);
      if (onProductCreated) onProductCreated(res);
      onClose();
    } catch (err) {
      console.error('Failed to create product:', err);
      setError(err.message || 'Failed to list product in store. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return createPortal(
    <div className="fixed inset-0 z-[999999] bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-base-100 border border-base-300 rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-base-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-secondary/15 text-secondary flex items-center justify-center font-bold text-lg">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-xl text-base-content">Add Product for Sale</h3>
              <p className="text-xs text-base-content/60">Share your homemade delicacies, apparel, or crafts</p>
            </div>
          </div>
          <button type="button" onClick={onClose} className="btn btn-sm btn-circle btn-ghost">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Gemini AI Auto-Generation Helper */}
        <div className="bg-gradient-to-r from-secondary/10 to-primary/10 p-4 rounded-2xl border border-secondary/20 space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-xs sm:text-sm font-bold text-base-content flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-secondary" /> Gemini AI Listing Assistant
            </span>
            <span className="text-xs text-base-content/60">Type item name & click Generate</span>
          </div>
          <div className="flex items-center gap-2">
            <input 
              type="text" 
              value={rawIdea}
              onChange={(e) => setRawIdea(e.target.value)}
              placeholder="e.g. Kai Murukku, Mysore Pak, or Silk Blouse"
              className="input input-bordered min-h-[44px] flex-1 text-sm rounded-xl"
              onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAiSuggest(); } }}
            />
            <button
              type="button"
              onClick={handleAiSuggest}
              disabled={aiLoading || !rawIdea.trim()}
              className="btn btn-secondary min-h-[44px] text-white rounded-xl font-bold text-xs sm:text-sm shrink-0 shadow-xs gap-1.5 px-4"
            >
              {aiLoading ? <span className="loading loading-spinner loading-xs"></span> : <Sparkles className="w-4 h-4" />}
              Generate
            </button>
          </div>
        </div>

        <ErrorAlert message={error} />

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4 text-sm">
          
          <div className="form-control">
            <label className="label text-xs font-bold py-1">Product Title</label>
            <input 
              type="text" 
              required
              value={productForm.title}
              onChange={(e) => setProductForm({ ...productForm, title: e.target.value })}
              placeholder="e.g. Handmade Mysore Pak with Pure Ghee"
              className="input input-bordered min-h-[44px] w-full rounded-xl font-semibold text-sm"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="form-control">
              <label className="label text-xs font-bold py-1">Category</label>
              <select 
                value={productForm.category}
                onChange={(e) => setProductForm({ ...productForm, category: e.target.value })}
                className="select select-bordered min-h-[44px] rounded-xl text-sm"
              >
                {PRODUCT_CATEGORIES.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div className="form-control">
              <label className="label text-xs font-bold py-1">Unit / Packaging</label>
              <input 
                type="text" 
                value={productForm.unit}
                onChange={(e) => setProductForm({ ...productForm, unit: e.target.value })}
                placeholder="e.g. 500g Box, 1 Piece, 1 Set"
                className="input input-bordered min-h-[44px] rounded-xl text-sm"
              />
            </div>
          </div>

          <div className="form-control">
            <label className="label text-xs font-bold py-1">Description & Ingredients / Craft Details</label>
            <textarea 
              rows={3}
              required
              value={productForm.description}
              onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
              placeholder="Detail your authentic preparation methods, pure ingredients, or handloom craftsmanship."
              className="textarea textarea-bordered text-sm rounded-xl leading-relaxed"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="form-control">
              <label className="label text-xs font-bold py-1">Price (₹)</label>
              <input 
                type="number" 
                min="10"
                step="10"
                value={productForm.price}
                onChange={(e) => setProductForm({ ...productForm, price: parseInt(e.target.value, 10) || 0 })}
                className="input input-bordered min-h-[44px] rounded-xl font-bold text-sm text-primary"
              />
            </div>

            <div className="form-control">
              <label className="label text-xs font-bold py-1">Locality</label>
              <input 
                type="text" 
                value={productForm.locality}
                onChange={(e) => setProductForm({ ...productForm, locality: e.target.value })}
                className="input input-bordered min-h-[44px] rounded-xl text-sm"
              />
            </div>
          </div>

          {/* Image Upload / URL Input */}
          <div className="space-y-2">
            <label className="label text-xs font-bold py-1">Product Images (Upload or Paste Photo)</label>
            
            <div className="flex flex-wrap items-center gap-3">
              {productForm.images.map((imgUrl, idx) => (
                <div key={idx} className="relative w-20 h-20 rounded-2xl overflow-hidden border-2 border-base-300 group">
                  <img src={imgUrl} alt={`Product ${idx}`} className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => removeImage(idx)}
                    className="absolute top-1 right-1 bg-black/70 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-20 h-20 rounded-2xl border-2 border-dashed border-base-300 hover:border-secondary flex flex-col items-center justify-center text-base-content/60 hover:text-secondary transition-colors text-xs font-bold gap-1"
              >
                <Upload className="w-5 h-5" />
                Upload
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageFileUpload}
                className="hidden"
              />
            </div>
          </div>

          <div className="form-control pt-1">
            <label className="cursor-pointer label justify-start gap-2.5">
              <input
                type="checkbox"
                checked={productForm.is_festival_special}
                onChange={(e) => setProductForm(prev => ({ ...prev, is_festival_special: e.target.checked }))}
                className="checkbox checkbox-md checkbox-secondary rounded-lg"
              />
              <span className="label-text text-sm font-bold">
                Tag as Festive Special Offering ({activeFestival || currentFestivalInfo?.name || 'Active Festival'})
              </span>
            </label>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-between pt-4 border-t border-base-200">
            <button type="button" onClick={onClose} className="btn btn-ghost min-h-[44px] px-5 rounded-2xl text-sm font-bold">
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting || !productForm.title.trim()}
              className="btn btn-secondary min-h-[44px] text-white rounded-2xl font-extrabold px-6 shadow-sm text-sm"
            >
              {submitting ? <span className="loading loading-spinner loading-xs"></span> : 'Publish to Store'}
            </button>
          </div>

        </form>

      </div>
    </div>,
    document.body
  );
}
