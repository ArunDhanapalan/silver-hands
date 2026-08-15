import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { 
  Sparkles, 
  Video, 
  MapPin, 
  Clock, 
  DollarSign, 
  CheckCircle2, 
  X, 
  BookOpen 
} from 'lucide-react';
import api from '../../api/client';
import ErrorAlert from '../common/ErrorAlert';

const SERVICE_CATEGORIES = [
  'Education & Learning',
  'Knowledge & Mentoring',
  'Home & Practical Skills',
  'Culture & Tradition',
  'Family & Care'
];

export default function AddServiceModal({ isOpen, onClose, onServiceCreated, initialSkill = '' }) {
  const [rawIdea, setRawIdea] = useState(initialSkill);
  const [aiLoading, setAiLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const [serviceForm, setServiceForm] = useState({
    title: '',
    category: 'Education & Learning',
    subcategory: 'Language Tuition',
    description: '',
    mode: 'online',
    duration_mins: 45,
    price_per_session: 400,
    target_audience: 'Children & Working Adults',
    locality: 'Adyar',
    city: 'Chennai',
    languages: ['en', 'ta']
  });

  if (!isOpen) return null;

  const handleAiSuggest = async () => {
    if (!rawIdea.trim()) return;
    setAiLoading(true);
    setError('');
    try {
      const res = await api.post('/services/ai-suggest', { raw_idea: rawIdea });
      setServiceForm(prev => ({
        ...prev,
        title: res.title || prev.title,
        description: res.description || prev.description,
        category: res.category && SERVICE_CATEGORIES.includes(res.category) ? res.category : prev.category,
        subcategory: res.subcategory || prev.subcategory,
        mode: res.mode || prev.mode,
        price_per_session: res.suggested_price || prev.price_per_session,
        duration_mins: res.duration_mins || prev.duration_mins,
        target_audience: res.target_audience || prev.target_audience
      }));
    } catch (err) {
      console.error('Service AI suggest error:', err);
      setError('AI assistant encountered a brief issue. You can fill out the form directly.');
    } finally {
      setAiLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!serviceForm.title.trim() || !serviceForm.description.trim()) {
      setError('Please provide a title and description for your class or service.');
      return;
    }

    setSubmitting(true);
    setError('');
    try {
      const payload = {
        title: serviceForm.title.trim(),
        category: serviceForm.category,
        subcategory: serviceForm.subcategory.trim() || 'General Mentoring',
        description: serviceForm.description.trim(),
        mode: serviceForm.mode,
        duration_mins: parseInt(serviceForm.duration_mins, 10) || 45,
        price_per_session: parseInt(serviceForm.price_per_session, 10) || 400,
        target_audience: serviceForm.target_audience.trim() || 'All Ages',
        locality: serviceForm.locality || 'Adyar',
        city: serviceForm.city || 'Chennai',
        languages: serviceForm.languages
      };
      const created = await api.post('/services', payload);
      if (onServiceCreated) onServiceCreated(created);
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to publish service offering.');
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
            <div className="w-10 h-10 rounded-2xl bg-accent/15 text-accent flex items-center justify-center font-bold text-lg">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-xl text-base-content">Offer a Managed Service</h3>
              <p className="text-xs text-base-content/60">Teach languages, share wisdom, mentor students, or teach arts</p>
            </div>
          </div>
          <button type="button" onClick={onClose} className="btn btn-sm btn-circle btn-ghost">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Gemini AI Assist Box */}
        <div className="bg-gradient-to-r from-accent/10 to-primary/10 border border-accent/25 rounded-2xl p-4 space-y-2.5">
          <label className="text-xs sm:text-sm font-bold text-accent flex items-center gap-1.5">
            <Sparkles className="w-4 h-4" /> Gemini AI Service Assistant:
          </label>
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={rawIdea}
              onChange={(e) => setRawIdea(e.target.value)}
              placeholder="e.g. Spoken Telugu for Children or MSME Accounting & GST Guidance"
              className="input input-bordered min-h-[44px] flex-1 text-sm rounded-xl"
              onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAiSuggest(); } }}
            />
            <button
              type="button"
              onClick={handleAiSuggest}
              disabled={aiLoading || !rawIdea.trim()}
              className="btn btn-accent min-h-[44px] text-white rounded-xl font-bold text-xs sm:text-sm shrink-0 shadow-xs gap-1.5 px-4"
            >
              {aiLoading ? <span className="loading loading-spinner loading-xs"></span> : <Sparkles className="w-4 h-4" />}
              Auto-Fill
            </button>
          </div>
        </div>

        <ErrorAlert message={error} />

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4 text-sm">
          
          <div className="form-control">
            <label className="label text-xs font-bold py-1">Service Title</label>
            <input
              type="text"
              required
              value={serviceForm.title}
              onChange={(e) => setServiceForm({ ...serviceForm, title: e.target.value })}
              placeholder="e.g. 1-on-1 Spoken Telugu & Cultural Storytelling for Children"
              className="input input-bordered min-h-[44px] w-full rounded-xl font-semibold text-sm"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="form-control">
              <label className="label text-xs font-bold py-1">Category</label>
              <select
                value={serviceForm.category}
                onChange={(e) => setServiceForm({ ...serviceForm, category: e.target.value })}
                className="select select-bordered min-h-[44px] rounded-xl text-sm"
              >
                {SERVICE_CATEGORIES.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div className="form-control">
              <label className="label text-xs font-bold py-1">Subcategory</label>
              <input
                type="text"
                value={serviceForm.subcategory}
                onChange={(e) => setServiceForm({ ...serviceForm, subcategory: e.target.value })}
                placeholder="e.g. Language Tuition"
                className="input input-bordered min-h-[44px] rounded-xl text-sm"
              />
            </div>
          </div>

          <div className="form-control">
            <label className="label text-xs font-bold py-1">Detailed Description & What Students Will Learn</label>
            <textarea
              rows={3}
              required
              value={serviceForm.description}
              onChange={(e) => setServiceForm({ ...serviceForm, description: e.target.value })}
              placeholder="Describe your teaching style, interactive exercises, lesson outline, and what students will gain."
              className="textarea textarea-bordered text-sm rounded-xl leading-relaxed"
            />
          </div>

          <div className="grid grid-cols-3 gap-2.5">
            <div className="form-control">
              <label className="label text-xs font-bold py-1">Delivery Mode</label>
              <select
                value={serviceForm.mode}
                onChange={(e) => setServiceForm({ ...serviceForm, mode: e.target.value })}
                className="select select-bordered min-h-[44px] rounded-xl text-xs sm:text-sm font-semibold"
              >
                <option value="online">Online Video</option>
                <option value="offline">In-Person</option>
                <option value="both">Both (Hybrid)</option>
              </select>
            </div>

            <div className="form-control">
              <label className="label text-xs font-bold py-1">Duration (Mins)</label>
              <input
                type="number"
                min="15"
                step="15"
                value={serviceForm.duration_mins}
                onChange={(e) => setServiceForm({ ...serviceForm, duration_mins: parseInt(e.target.value, 10) || 45 })}
                className="input input-bordered min-h-[44px] rounded-xl text-sm"
              />
            </div>

            <div className="form-control">
              <label className="label text-xs font-bold py-1">Fee / Session (₹)</label>
              <input
                type="number"
                min="100"
                step="50"
                value={serviceForm.price_per_session}
                onChange={(e) => setServiceForm({ ...serviceForm, price_per_session: parseInt(e.target.value, 10) || 300 })}
                className="input input-bordered min-h-[44px] rounded-xl font-bold text-sm text-primary"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="form-control">
              <label className="label text-xs font-bold py-1">Locality</label>
              <input
                type="text"
                value={serviceForm.locality}
                onChange={(e) => setServiceForm({ ...serviceForm, locality: e.target.value })}
                className="input input-bordered min-h-[44px] rounded-xl text-sm"
              />
            </div>

            <div className="form-control">
              <label className="label text-xs font-bold py-1">Target Audience</label>
              <input
                type="text"
                value={serviceForm.target_audience}
                onChange={(e) => setServiceForm({ ...serviceForm, target_audience: e.target.value })}
                placeholder="e.g. Children (Age 6-15)"
                className="input input-bordered min-h-[44px] rounded-xl text-sm"
              />
            </div>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-base-200">
            <button
              type="button"
              onClick={onClose}
              className="btn btn-ghost min-h-[44px] px-5 rounded-2xl text-sm font-bold"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="btn btn-accent min-h-[44px] px-6 rounded-2xl text-white font-extrabold shadow-sm text-sm"
            >
              {submitting ? <span className="loading loading-spinner loading-xs"></span> : 'Publish Managed Service'}
            </button>
          </div>

        </form>

      </div>
    </div>,
    document.body
  );
}
