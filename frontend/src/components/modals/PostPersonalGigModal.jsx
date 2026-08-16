import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { 
  Briefcase, 
  Sparkles, 
  MapPin, 
  DollarSign, 
  CheckCircle2, 
  X, 
  Clock, 
  Plus, 
  Trash2,
  Users,
  HeartHandshake
} from 'lucide-react';
import api from '../../api/client';
import ErrorAlert from '../common/ErrorAlert';

const GIG_CATEGORIES = [
  'Culinary & Cooking',
  'Accounting & Finance',
  'Mentoring & Advisory',
  'Tutoring & Academics',
  'Home & Practical Assistance',
  'Handicrafts & Tailoring',
  'Care & Companionship'
];

export default function PostPersonalGigModal({ isOpen, onClose, onGigPosted }) {
  const [rawText, setRawText] = useState('');
  const [aiParsing, setAiParsing] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const [gigForm, setGigForm] = useState({
    title: '',
    description: '',
    category: 'Tutoring & Academics',
    work_mode: 'offline', // offline, online, both
    pay_amount: '',
    pay_unit: 'month', // hour, session, day, month, project
    locality: 'Adyar',
    city: 'Chennai',
    schedule: 'Flexible / Part-time',
    required_skills: []
  });

  const [skillInput, setSkillInput] = useState('');

  if (!isOpen) return null;

  const handleAiParse = async () => {
    if (!rawText.trim()) return;
    setAiParsing(true);
    setError('');
    try {
      const res = await api.post('/opportunities/parse-job', { raw_text: rawText });
      setGigForm(prev => ({
        ...prev,
        title: res.title || prev.title,
        description: res.summary || rawText,
        category: res.category && GIG_CATEGORIES.includes(res.category) ? res.category : prev.category,
        pay_amount: res.suggested_salary ? String(res.suggested_salary) : prev.pay_amount,
        pay_unit: res.salary_period || prev.pay_unit,
        work_mode: res.is_remote ? 'online' : 'offline',
        required_skills: res.extracted_skills || prev.required_skills
      }));
    } catch (err) {
      console.error('Personal gig parse error:', err);
      setError('AI assistant encountered a brief issue. You can fill out the form directly.');
    } finally {
      setAiParsing(false);
    }
  };

  const addSkill = () => {
    if (skillInput.trim() && !gigForm.required_skills.includes(skillInput.trim())) {
      setGigForm(prev => ({
        ...prev,
        required_skills: [...prev.required_skills, skillInput.trim()]
      }));
      setSkillInput('');
    }
  };

  const removeSkill = (index) => {
    setGigForm(prev => ({
      ...prev,
      required_skills: prev.required_skills.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!gigForm.title.trim() || !gigForm.description.trim()) {
      setError('Please provide a title and description for this gig.');
      return;
    }

    setSubmitting(true);
    setError('');
    try {
      const payload = {
        title: gigForm.title.trim(),
        description: gigForm.description.trim(),
        type: 'gig',
        category: gigForm.category,
        required_skills: gigForm.required_skills.length > 0 ? gigForm.required_skills : ['Patience', 'Reliability'],
        pay_amount: parseInt(gigForm.pay_amount, 10) || 5000,
        pay_unit: gigForm.pay_unit,
        is_remote: gigForm.work_mode === 'online',
        work_type: 'part_time',
        city: gigForm.city,
        locality: gigForm.locality,
        duration_weeks: 4
      };

      const res = await api.post('/opportunities', payload);
      if (onGigPosted) onGigPosted(res);
      onClose();
    } catch (err) {
      console.error('Failed to create personal gig:', err);
      setError(err.message || 'Failed to post gig. Please try again.');
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
            <div className="w-10 h-10 rounded-2xl bg-warning/20 text-warning flex items-center justify-center font-bold text-lg">
              <HeartHandshake className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-xl text-base-content">Offer a Personal / Local Gig</h3>
              <p className="text-xs text-base-content/60">Hire verified seniors for tutoring, pooja feasts, bookkeeping & care</p>
            </div>
          </div>
          <button type="button" onClick={onClose} className="btn btn-sm btn-circle btn-ghost">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Gemini AI Helper */}
        <div className="bg-gradient-to-r from-warning/10 to-primary/10 border border-warning/25 rounded-2xl p-4 space-y-2.5">
          <label className="text-xs sm:text-sm font-bold text-warning-content flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-warning" /> Gemini AI Gig Assistant:
          </label>
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={rawText}
              onChange={(e) => setRawText(e.target.value)}
              placeholder="e.g. Need weekend spoken Telugu tutor for my 10yo child in Adyar, 2 days/week"
              className="input input-bordered min-h-[44px] flex-1 text-sm rounded-xl"
              onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAiParse(); } }}
            />
            <button
              type="button"
              onClick={handleAiParse}
              disabled={aiParsing || !rawText.trim()}
              className="btn btn-warning min-h-[44px] text-white rounded-xl font-bold text-xs shrink-0 shadow-xs gap-1.5 px-4"
            >
              {aiParsing ? <span className="loading loading-spinner loading-xs"></span> : <Sparkles className="w-4 h-4" />}
              Auto-Fill
            </button>
          </div>
        </div>

        <ErrorAlert message={error} />

        <form onSubmit={handleSubmit} className="space-y-4 text-sm">
          
          <div className="form-control">
            <label className="label text-xs font-bold py-1">Gig Title</label>
            <input
              type="text"
              required
              value={gigForm.title}
              onChange={(e) => setGigForm({ ...gigForm, title: e.target.value })}
              placeholder="e.g. Weekend Math & Science Tutor for Grade 8"
              className="input input-bordered min-h-[44px] w-full rounded-xl font-semibold text-sm"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="form-control">
              <label className="label text-xs font-bold py-1">Category</label>
              <select
                value={gigForm.category}
                onChange={(e) => setGigForm({ ...gigForm, category: e.target.value })}
                className="select select-bordered min-h-[44px] rounded-xl text-sm"
              >
                {GIG_CATEGORIES.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div className="form-control">
              <label className="label text-xs font-bold py-1">Work Mode</label>
              <select
                value={gigForm.work_mode}
                onChange={(e) => setGigForm({ ...gigForm, work_mode: e.target.value })}
                className="select select-bordered min-h-[44px] rounded-xl text-sm font-semibold"
              >
                <option value="offline">In-Person (Neighborhood)</option>
                <option value="online">Online / Remote</option>
                <option value="both">Flexible / Hybrid</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="form-control">
              <label className="label text-xs font-bold py-1">Offer Compensation (₹ INR)</label>
              <input
                type="number"
                required
                min="200"
                value={gigForm.pay_amount}
                onChange={(e) => setGigForm({ ...gigForm, pay_amount: e.target.value })}
                placeholder="e.g. 500"
                className="input input-bordered min-h-[44px] rounded-xl font-bold text-sm text-primary"
              />
            </div>

            <div className="form-control">
              <label className="label text-xs font-bold py-1">Pay Frequency</label>
              <select
                value={gigForm.pay_unit}
                onChange={(e) => setGigForm({ ...gigForm, pay_unit: e.target.value })}
                className="select select-bordered min-h-[44px] rounded-xl text-sm"
              >
                <option value="hour">per hour</option>
                <option value="session">per session / class</option>
                <option value="day">per day</option>
                <option value="month">per month</option>
                <option value="project">per project</option>
              </select>
            </div>
          </div>

          <div className="form-control">
            <label className="label text-xs font-bold py-1">Description & Requirements</label>
            <textarea
              rows={3}
              required
              value={gigForm.description}
              onChange={(e) => setGigForm({ ...gigForm, description: e.target.value })}
              placeholder="Describe the hours, location details, what assistance is needed, and any specific experience preferred..."
              className="textarea textarea-bordered text-sm rounded-xl leading-relaxed"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="form-control">
              <label className="label text-xs font-bold py-1">Locality</label>
              <input
                type="text"
                value={gigForm.locality}
                onChange={(e) => setGigForm({ ...gigForm, locality: e.target.value })}
                className="input input-bordered min-h-[44px] rounded-xl text-sm"
              />
            </div>

            <div className="form-control">
              <label className="label text-xs font-bold py-1">City</label>
              <input
                type="text"
                value={gigForm.city}
                onChange={(e) => setGigForm({ ...gigForm, city: e.target.value })}
                className="input input-bordered min-h-[44px] rounded-xl text-sm"
              />
            </div>
          </div>

          {/* Required Skills */}
          <div className="space-y-2">
            <label className="label text-xs font-bold py-1">Preferred Skills / Specialization</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={skillInput}
                onChange={(e) => setSkillInput(e.target.value)}
                placeholder="e.g. Spoken Telugu, Tally, South Indian Cooking"
                className="input input-bordered min-h-[40px] flex-1 text-xs rounded-xl"
                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addSkill(); } }}
              />
              <button
                type="button"
                onClick={addSkill}
                className="btn btn-neutral btn-sm min-h-[40px] rounded-xl text-xs"
              >
                <Plus className="w-4 h-4" /> Add
              </button>
            </div>
            {gigForm.required_skills.length > 0 && (
              <div className="flex flex-wrap gap-1.5 pt-1">
                {gigForm.required_skills.map((s, idx) => (
                  <span key={idx} className="badge badge-neutral gap-1.5 py-2.5 px-3 rounded-xl text-xs font-medium">
                    {s}
                    <button type="button" onClick={() => removeSkill(idx)} className="hover:text-error">
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
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
              disabled={submitting || !gigForm.title.trim()}
              className="btn btn-warning min-h-[44px] px-6 rounded-2xl text-white font-extrabold shadow-sm text-sm"
            >
              {submitting ? <span className="loading loading-spinner loading-xs"></span> : 'Post Personal Gig'}
            </button>
          </div>

        </form>

      </div>
    </div>,
    document.body
  );
}
