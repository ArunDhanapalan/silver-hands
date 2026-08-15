import React, { useState } from 'react';
import { 
  Sparkles, 
  Video, 
  MapPin, 
  Clock, 
  DollarSign, 
  CheckCircle2, 
  X, 
  BookOpen, 
  Layers 
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

  return (
    <div className="fixed inset-0 z-[99999] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-base-100 border border-base-300 max-w-2xl w-full rounded-3xl p-6 space-y-4 shadow-2xl max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in duration-150">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-base-200 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-accent/15 text-accent flex items-center justify-center font-bold">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-lg text-base-content">Offer a Managed Service</h3>
              <p className="text-xs text-base-content/60">Teach, mentor, or consult on your schedule. SilverHands manages bookings.</p>
            </div>
          </div>
          <button onClick={onClose} className="btn btn-sm btn-circle btn-ghost">
            <X className="w-4 h-4" />
          </button>
        </div>

        <ErrorAlert message={error} />

        {/* AI Assistant Banner */}
        <div className="bg-accent/10 border border-accent/25 rounded-2xl p-4 space-y-2">
          <label className="text-xs font-bold text-accent-content flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-accent" /> AI Service Package Assistant
          </label>
          <p className="text-[11px] text-base-content/70">
            Tell us in your own words what you can teach or offer. AI will generate an enticing title, curriculum summary, and session fee.
          </p>
          <div className="flex gap-2">
            <input
              type="text"
              value={rawIdea}
              onChange={(e) => setRawIdea(e.target.value)}
              placeholder="e.g. Spoken Telugu for school children, Carnatic vocal basics, MSME GST tax consultation..."
              className="input input-bordered input-sm flex-1 text-xs rounded-xl"
              onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAiSuggest(); } }}
            />
            <button
              type="button"
              onClick={handleAiSuggest}
              disabled={aiLoading || !rawIdea.trim()}
              className="btn btn-accent btn-sm rounded-xl text-white font-bold text-xs gap-1.5"
            >
              {aiLoading ? <span className="loading loading-spinner loading-xs"></span> : <Sparkles className="w-3.5 h-3.5" />}
              Generate with AI
            </button>
          </div>
        </div>

        {/* Manual Refinement Form */}
        <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
          
          <div className="form-control">
            <label className="label text-[11px] font-semibold">Service / Course Title</label>
            <input
              type="text"
              required
              value={serviceForm.title}
              onChange={(e) => setServiceForm({ ...serviceForm, title: e.target.value })}
              placeholder="e.g. 1-on-1 Conversational Telugu & Fluency Masterclass"
              className="input input-bordered input-sm rounded-xl"
            />
          </div>

          <div className="form-control">
            <label className="label text-[11px] font-semibold">Service Description & Curriculum</label>
            <textarea
              rows={3}
              required
              value={serviceForm.description}
              onChange={(e) => setServiceForm({ ...serviceForm, description: e.target.value })}
              placeholder="Describe your teaching approach, what the student will learn, and why your experience helps..."
              className="textarea textarea-bordered rounded-xl text-xs"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="form-control">
              <label className="label text-[11px] font-semibold">Category</label>
              <select
                value={serviceForm.category}
                onChange={(e) => setServiceForm({ ...serviceForm, category: e.target.value })}
                className="select select-bordered select-sm rounded-xl text-xs"
              >
                {SERVICE_CATEGORIES.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div className="form-control">
              <label className="label text-[11px] font-semibold">Delivery Mode</label>
              <select
                value={serviceForm.mode}
                onChange={(e) => setServiceForm({ ...serviceForm, mode: e.target.value })}
                className="select select-bordered select-sm rounded-xl text-xs"
              >
                <option value="online">Online Video (Zoom/Google Meet managed)</option>
                <option value="offline">In-Person (Local neighborhood)</option>
                <option value="both">Both Online & In-Person</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="form-control">
              <label className="label text-[11px] font-semibold">Fee per Session (₹)</label>
              <input
                type="number"
                required
                min={50}
                value={serviceForm.price_per_session}
                onChange={(e) => setServiceForm({ ...serviceForm, price_per_session: parseInt(e.target.value) || 0 })}
                className="input input-bordered input-sm rounded-xl"
              />
            </div>

            <div className="form-control">
              <label className="label text-[11px] font-semibold">Duration (Minutes)</label>
              <input
                type="number"
                required
                value={serviceForm.duration_mins}
                onChange={(e) => setServiceForm({ ...serviceForm, duration_mins: parseInt(e.target.value) || 45 })}
                className="input input-bordered input-sm rounded-xl"
              />
            </div>

            <div className="form-control">
              <label className="label text-[11px] font-semibold">Target Audience</label>
              <input
                type="text"
                value={serviceForm.target_audience}
                onChange={(e) => setServiceForm({ ...serviceForm, target_audience: e.target.value })}
                placeholder="e.g. Children (Age 6-15)"
                className="input input-bordered input-sm rounded-xl"
              />
            </div>
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
              className="btn btn-accent btn-sm rounded-xl text-white font-bold"
            >
              {submitting ? <span className="loading loading-spinner loading-xs"></span> : 'Publish Managed Service'}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}
