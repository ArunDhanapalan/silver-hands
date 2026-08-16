import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { 
  Sparkles, 
  Video, 
  MapPin, 
  Clock, 
  DollarSign, 
  CheckCircle2, 
  X, 
  BookOpen,
  Calendar,
  Users
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

const DAYS_OPTIONS = [
  'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'
];

const TIME_SLOT_OPTIONS = [
  'Morning (9:00 AM – 10:00 AM)',
  'Morning (10:00 AM – 11:00 AM)',
  'Afternoon (2:00 PM – 3:00 PM)',
  'Evening (4:00 PM – 5:00 PM)',
  'Evening (5:00 PM – 6:00 PM)',
  'Evening (6:00 PM – 7:00 PM)',
  'Night (7:00 PM – 8:00 PM)'
];

export default function AddServiceModal({ isOpen, onClose, onServiceCreated, initialSkill = '', initialData = null }) {
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
    available_days: ['Monday', 'Wednesday', 'Friday'],
    time_slot: 'Evening (5:00 PM – 6:00 PM)',
    venue_address: '',
    locality: 'Adyar',
    city: 'Chennai',
    languages: ['en', 'ta']
  });

  useEffect(() => {
    if (isOpen && initialData && initialData.title) {
      const priceNum = typeof initialData.price_range === 'string'
        ? parseInt(initialData.price_range.replace(/[^\d]/g, '')) || 400
        : initialData.suggested_price || initialData.price_per_session || 400;
      const durationNum = typeof initialData.duration === 'string'
        ? parseInt(initialData.duration.replace(/[^\d]/g, '')) || 45
        : initialData.duration_mins || 45;

      setServiceForm(prev => ({
        ...prev,
        title: initialData.title || prev.title,
        description: initialData.description || prev.description,
        category: initialData.category && SERVICE_CATEGORIES.includes(initialData.category) ? initialData.category : prev.category,
        subcategory: initialData.subcategory || prev.subcategory,
        mode: initialData.mode || prev.mode,
        price_per_session: priceNum,
        duration_mins: durationNum,
        target_audience: initialData.target_audience || prev.target_audience,
        available_days: initialData.available_days || prev.available_days,
        time_slot: initialData.time_slot || prev.time_slot
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
      const res = await api.post('/services/ai-suggest', { raw_idea: rawIdea });
      setServiceForm(prev => ({
        ...prev,
        title: res.title || prev.title,
        description: res.description || prev.description,
        category: res.category && SERVICE_CATEGORIES.includes(res.category) ? res.category : prev.category,
        subcategory: res.subcategory || prev.subcategory,
        mode: res.mode || prev.mode,
        price_per_session: res.suggested_price || res.price_per_session || prev.price_per_session,
        duration_mins: res.duration_mins || prev.duration_mins,
        target_audience: res.target_audience || prev.target_audience,
        available_days: res.available_days || prev.available_days,
        time_slot: res.time_slot || prev.time_slot
      }));
    } catch (err) {
      console.error('Service AI suggest error:', err);
      setError('AI assistant encountered a brief issue. You can fill out the form directly.');
    } finally {
      setAiLoading(false);
    }
  };

  const toggleDay = (day) => {
    setServiceForm(prev => {
      const exists = prev.available_days.includes(day);
      if (exists) {
        if (prev.available_days.length <= 1) return prev; // keep at least 1 day
        return { ...prev, available_days: prev.available_days.filter(d => d !== day) };
      } else {
        return { ...prev, available_days: [...prev.available_days, day] };
      }
    });
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
        available_days: serviceForm.available_days,
        time_slot: serviceForm.time_slot,
        venue_address: serviceForm.venue_address.trim() || undefined,
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
              <h3 className="font-extrabold text-xl text-base-content">Offer a Managed Class or Service</h3>
              <p className="text-xs text-base-content/60">Teach languages, share wisdom, mentor students, or teach arts (Max 10 students/batch)</p>
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
              placeholder="e.g. 1-on-1 & Small Group Spoken Telugu for Children"
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
            <label className="label text-xs font-bold py-1">Detailed Description & Syllabus</label>
            <textarea
              rows={3}
              required
              value={serviceForm.description}
              onChange={(e) => setServiceForm({ ...serviceForm, description: e.target.value })}
              placeholder="Describe your teaching style, interactive exercises, lesson outline, and what students will gain."
              className="textarea textarea-bordered text-sm rounded-xl leading-relaxed"
            />
          </div>

          {/* Days of Week Selection */}
          <div className="space-y-1.5">
            <label className="label text-xs font-bold py-1 flex items-center justify-between">
              <span className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5 text-primary" /> Class Days of the Week:</span>
              <span className="text-[11px] text-base-content/60 font-normal">Select active teaching days</span>
            </label>
            <div className="flex flex-wrap gap-1.5">
              {DAYS_OPTIONS.map((day) => {
                const active = serviceForm.available_days.includes(day);
                return (
                  <button
                    key={day}
                    type="button"
                    onClick={() => toggleDay(day)}
                    className={`btn btn-xs rounded-lg px-2.5 py-1 text-xs font-bold transition-all ${
                      active ? 'btn-primary text-white shadow-xs' : 'btn-ghost bg-base-200 text-base-content/70 hover:bg-base-300'
                    }`}
                  >
                    {day.slice(0, 3)}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Time Slot Selection */}
          <div className="form-control">
            <label className="label text-xs font-bold py-1 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-secondary" /> Daily Schedule Time Slot:
            </label>
            <select
              value={serviceForm.time_slot}
              onChange={(e) => setServiceForm({ ...serviceForm, time_slot: e.target.value })}
              className="select select-bordered min-h-[44px] rounded-xl text-sm font-semibold"
            >
              {TIME_SLOT_OPTIONS.map((slot) => (
                <option key={slot} value={slot}>{slot}</option>
              ))}
            </select>
          </div>

          {/* Mode, Duration & Pricing */}
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
              <label className="label text-xs font-bold py-1">Fee / Student (₹)</label>
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

          {/* Max Capacity Notice */}
          <div className="bg-primary/10 border border-primary/20 rounded-2xl p-3 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-primary" />
              <span className="font-bold text-base-content">Max Class Batch Capacity:</span>
            </div>
            <span className="badge badge-primary badge-sm font-black text-white">10 Students Max</span>
          </div>

          {/* Physical Venue Address (if offline or both) */}
          {serviceForm.mode !== 'online' && (
            <div className="form-control">
              <label className="label text-xs font-bold py-1 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-secondary" /> Physical Studio / Venue Address:
              </label>
              <input
                type="text"
                value={serviceForm.venue_address}
                onChange={(e) => setServiceForm({ ...serviceForm, venue_address: e.target.value })}
                placeholder="e.g. Flat 4B, 2nd Main Road, Gandhi Nagar, Adyar"
                className="input input-bordered min-h-[44px] rounded-xl text-sm"
              />
            </div>
          )}

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
              {submitting ? <span className="loading loading-spinner loading-xs"></span> : 'Publish Class / Service'}
            </button>
          </div>

        </form>

      </div>
    </div>,
    document.body
  );
}
