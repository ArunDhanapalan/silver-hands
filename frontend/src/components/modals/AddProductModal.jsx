import React, { useState, useRef } from 'react';
import { createPortal } from 'react-dom';
import { 
  Sparkles, 
  ShoppingBag, 
  MapPin, 
  DollarSign, 
  CheckCircle2, 
  X, 
  Image as ImageIcon, 
  Upload,
  Camera,
  Trash2,
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
        category: res.suggested_category || prev.category,
        price: res.suggested_price || res.price || prev.price,
        unit: res.unit || prev.unit
      }));
    } catch (err) {
      console.error('Product AI suggest error:', err);
      setError('NLP assistant encountered an issue. You can fill in the fields manually below.');
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
    setSubmitting(true);
    setError('');
    try {
      const payload = {
        title: productForm.title.trim(),
        description: productForm.description.trim(),
        category: productForm.category,
        price: parseInt(productForm.price, 10) || 350,
        unit: productForm.unit.trim() || 'Pack',
        stock_quantity: parseInt(productForm.stock, 10) || 20,
        images: productForm.images && productForm.images.length > 0 ? productForm.images : ['https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=600&auto=format&fit=crop&q=80'],
        locality: productForm.locality || 'Adyar',
        city: productForm.city || 'Chennai',
        is_festival_special: productForm.is_festival_special,
        festival_tag: productForm.festival_tag,
        keywords: [productForm.category, 'Handmade', 'Authentic']
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
      <div className="bg-base-100 border border-base-300 rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-base-200">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-secondary/10 text-secondary flex items-center justify-center">
              <ShoppingBag className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-extrabold text-lg text-base-content">Add Product for Sale</h3>
              <p className="text-[11px] text-base-content/60">Share your homemade delicacies, apparel, or crafts</p>
            </div>
          </div>
          <button type="button" onClick={onClose} className="btn btn-sm btn-circle btn-ghost">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* NLP Auto-Generation Helper */}
        <div className="bg-gradient-to-r from-secondary/10 to-primary/10 p-3.5 rounded-2xl border border-secondary/20 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-base-content flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-secondary" /> AI Listing Assistant (NLP)
            </span>
            <span className="text-[10px] text-base-content/60">Type item name & click Generate</span>
          </div>
          <div className="flex gap-2">
            <input 
              type="text" 
              value={rawIdea}
              onChange={(e) => setRawIdea(e.target.value)}
              placeholder="e.g. Traditional Sun-Dried Mango Pickle or Silk Potli Bags"
              className="input input-bordered input-sm flex-1 text-xs rounded-xl"
              onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAiSuggest(); } }}
            />
            <button
              type="button"
              onClick={handleAiSuggest}
              disabled={aiLoading || !rawIdea.trim()}
              className="btn btn-secondary btn-sm text-white rounded-xl font-bold text-xs gap-1"
            >
              {aiLoading ? <span className="loading loading-spinner loading-xs"></span> : <Sparkles className="w-3.5 h-3.5" />}
              Auto-Fill
            </button>
          </div>
        </div>

        <ErrorAlert message={error} />

        <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
          
          {/* Title */}
          <div className="form-control">
            <label className="label text-[11px] font-bold text-base-content/80">Product Title</label>
            <input 
              type="text" 
              required
              value={productForm.title}
              onChange={(e) => setProductForm(prev => ({ ...prev, title: e.target.value }))}
              placeholder="e.g. Authentic Homemade Sun-Dried Mango Pickle"
              className="input input-bordered input-sm w-full rounded-xl font-semibold"
            />
          </div>

          {/* Category & Unit */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <div className="form-control">
              <label className="label text-[11px] font-bold text-base-content/80">Category</label>
              <select 
                value={productForm.category}
                onChange={(e) => setProductForm(prev => ({ ...prev, category: e.target.value }))}
                className="select select-bordered select-sm w-full rounded-xl text-xs"
              >
                {PRODUCT_CATEGORIES.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div className="form-control">
              <label className="label text-[11px] font-bold text-base-content/80">Packaging / Unit</label>
              <input 
                type="text" 
                required
                value={productForm.unit}
                onChange={(e) => setProductForm(prev => ({ ...prev, unit: e.target.value }))}
                placeholder="e.g. 500g Jar, Pack of 2, 1 Piece"
                className="input input-bordered input-sm w-full rounded-xl text-xs"
              />
            </div>
          </div>

          {/* Price & Stock */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <div className="form-control">
              <label className="label text-[11px] font-bold text-base-content/80">Price (₹ INR)</label>
              <input 
                type="number" 
                required
                min="10"
                value={productForm.price}
                onChange={(e) => setProductForm(prev => ({ ...prev, price: parseInt(e.target.value, 10) || 0 }))}
                className="input input-bordered input-sm w-full rounded-xl text-xs font-bold"
              />
            </div>

            <div className="form-control">
              <label className="label text-[11px] font-bold text-base-content/80">Initial Stock</label>
              <input 
                type="number" 
                required
                min="1"
                value={productForm.stock}
                onChange={(e) => setProductForm(prev => ({ ...prev, stock: parseInt(e.target.value, 10) || 1 }))}
                className="input input-bordered input-sm w-full rounded-xl text-xs"
              />
            </div>
          </div>

          {/* Description */}
          <div className="form-control">
            <label className="label text-[11px] font-bold text-base-content/80">Description & Care</label>
            <textarea 
              rows={2}
              required
              value={productForm.description}
              onChange={(e) => setProductForm(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Describe your authentic traditional ingredients, preparation method, and flavor profile..."
              className="textarea textarea-bordered text-xs w-full rounded-xl leading-relaxed"
            />
          </div>

          {/* Image Upload Section */}
          <div className="space-y-2">
            <label className="label text-xs font-bold py-0 flex items-center justify-between">
              <span className="flex items-center gap-1"><Camera className="w-3.5 h-3.5 text-primary" /> Product Photos</span>
              <span className="text-[10px] text-base-content/60 font-normal">Upload photo or use defaults</span>
            </label>

            {/* Photo Previews */}
            <div className="flex flex-wrap items-center gap-2">
              {productForm.images.map((imgUrl, idx) => (
                <div key={idx} className="relative w-16 h-16 rounded-xl border border-base-300 overflow-hidden group shadow-xs">
                  <img src={imgUrl} alt="Product" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => removeImage(idx)}
                    className="absolute top-1 right-1 bg-black/70 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}

              {/* Upload Trigger Button */}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-16 h-16 rounded-xl border-2 border-dashed border-base-300 hover:border-secondary flex flex-col items-center justify-center text-base-content/60 hover:text-secondary transition-colors text-[10px] font-bold gap-1"
              >
                <Upload className="w-4 h-4" />
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

          <div className="grid grid-cols-2 gap-3">
            <div className="form-control">
              <label className="label text-xs font-bold py-1">Category</label>
              <select
                value={productForm.category}
                onChange={(e) => setProductForm(prev => ({ ...prev, category: e.target.value }))}
                className="select select-bordered select-sm w-full rounded-xl font-medium"
              >
                {PRODUCT_CATEGORIES.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div className="form-control">
              <label className="label text-xs font-bold py-1">Selling Price (₹)</label>
              <input
                type="number"
                required
                min={10}
                value={productForm.price}
                onChange={(e) => setProductForm(prev => ({ ...prev, price: parseInt(e.target.value, 10) || 0 }))}
                className="input input-bordered input-sm w-full rounded-xl font-bold text-primary"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="form-control">
              <label className="label text-xs font-bold py-1">Unit / Packaging</label>
              <input
                type="text"
                value={productForm.unit}
                onChange={(e) => setProductForm(prev => ({ ...prev, unit: e.target.value }))}
                placeholder="e.g. 500g Box, 350g Jar, Piece"
                className="input input-bordered input-sm w-full rounded-xl"
              />
            </div>

            <div className="form-control">
              <label className="label text-xs font-bold py-1">Locality Area</label>
              <input
                type="text"
                value={productForm.locality}
                onChange={(e) => setProductForm(prev => ({ ...prev, locality: e.target.value }))}
                placeholder="e.g. Adyar, Mylapore"
                className="input input-bordered input-sm w-full rounded-xl"
              />
            </div>
          </div>

          <div className="form-control pt-1">
            <label className="cursor-pointer label justify-start gap-2">
              <input
                type="checkbox"
                checked={productForm.is_festival_special}
                onChange={(e) => setProductForm(prev => ({ ...prev, is_festival_special: e.target.checked }))}
                className="checkbox checkbox-sm checkbox-secondary rounded"
              />
              <span className="label-text text-xs font-bold">Tag as Festive Special Offering</span>
            </label>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-between pt-3 border-t border-base-200">
            <button type="button" onClick={onClose} className="btn btn-ghost btn-sm rounded-xl">
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting || !productForm.title.trim()}
              className="btn btn-secondary btn-sm text-white rounded-xl font-extrabold px-5 shadow-sm"
            >
              {submitting ? <span className="loading loading-spinner loading-xs"></span> : 'Publish to Store'}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}
