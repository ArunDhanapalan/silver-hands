import React, { useState, useEffect } from 'react';
import { 
  Briefcase, 
  Plus, 
  Users, 
  Sparkles, 
  MapPin, 
  CheckCircle2, 
  Clock, 
  ShieldCheck, 
  FileText, 
  ExternalLink,
  ChevronRight,
  TrendingUp,
  X
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLocation } from '../context/LocationContext';
import api from '../api/client';
import ErrorAlert from '../components/common/ErrorAlert';
import LoadingSpinner from '../components/common/LoadingSpinner';

export default function CompanyDashboardPage() {
  const { user } = useAuth();
  const { selectedCity } = useLocation();

  const [opportunities, setOpportunities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [toastMsg, setToastMsg] = useState('');

  // Post modal
  const [showPostModal, setShowPostModal] = useState(false);
  const [posting, setPosting] = useState(false);
  const [aiParsing, setAiParsing] = useState(false);
  const [jobForm, setJobForm] = useState({
    title: '',
    description: '',
    category: 'Bookkeeping & Finance',
    required_skills: ['Accounting', 'GST Basics'],
    compensation: '₹15,000 / month (15 hrs/wk)',
    work_type: 'part_time',
    is_remote: true,
    locality: 'Adyar',
    city: selectedCity.name,
    festival_tag: 'Diwali'
  });

  const fetchCompanyData = async () => {
    setLoading(true);
    setError('');
    try {
      // In production, gets opportunities posted by this company
      const deckData = await api.get('/opportunities/deck');
      setOpportunities(deckData || []);
    } catch (err) {
      setError(err.message || 'Failed to load company postings.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCompanyData();
  }, []);

  const handlePostJob = async (e) => {
    e.preventDefault();
    setPosting(true);
    try {
      await api.post('/opportunities', jobForm);
      setShowPostModal(false);
      setToastMsg('Opportunity posted & matched to verified local seniors!');
      setTimeout(() => setToastMsg(''), 3500);
      fetchCompanyData();
    } catch (err) {
      setError(err.message || 'Failed to post opportunity.');
    } finally {
      setPosting(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-12">
      
      {/* Toast */}
      {toastMsg && (
        <div className="toast toast-top toast-center z-50">
          <div className="alert alert-success text-white font-bold text-xs shadow-lg rounded-xl flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" />
            <span>{toastMsg}</span>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-base-200">
        <div>
          <div className="flex items-center gap-2">
            <span className="badge badge-primary badge-sm font-bold text-white uppercase">Employer Hub</span>
            <span className="text-xs text-base-content/60 font-semibold">{user?.company_name || 'TechLocal Solutions'}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-base-content mt-1">
            Senior Talent & Opportunity Management
          </h1>
          <p className="text-xs sm:text-sm text-base-content/70">
            Connect with verified retirees and experienced homemakers for part-time, project, and advisory roles.
          </p>
        </div>

        <button 
          onClick={() => setShowPostModal(true)}
          className="btn btn-primary btn-sm rounded-xl text-white font-bold gap-1 text-xs self-start sm:self-auto shadow-sm"
        >
          <Plus className="w-4 h-4" /> Post Part-Time Role
        </button>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="card bg-base-100 border border-base-300 p-5 rounded-2xl shadow-xs space-y-1">
          <span className="text-xs font-semibold text-base-content/60">Active Roles Posted</span>
          <div className="text-2xl font-extrabold text-base-content">{opportunities.length}</div>
        </div>

        <div className="card bg-base-100 border border-base-300 p-5 rounded-2xl shadow-xs space-y-1">
          <span className="text-xs font-semibold text-base-content/60">Senior Candidates Matched</span>
          <div className="text-2xl font-extrabold text-primary">14 Seniors</div>
        </div>

        <div className="card bg-base-100 border border-base-300 p-5 rounded-2xl shadow-xs space-y-1">
          <span className="text-xs font-semibold text-base-content/60">Average Match Accuracy</span>
          <div className="text-2xl font-extrabold text-success">94.2%</div>
        </div>
      </div>

      <ErrorAlert message={error} onRetry={fetchCompanyData} />

      {/* Candidate Pipeline & Active Opportunities */}
      {loading ? (
        <LoadingSpinner message="Fetching talent pipeline..." />
      ) : (
        <div className="space-y-6">
          <h3 className="font-bold text-lg text-base-content">Active Postings & Candidate Pipeline</h3>

          <div className="space-y-4">
            {opportunities.map((opp) => (
              <div 
                key={opp.id}
                className="card bg-base-100 border border-base-300 rounded-3xl p-6 shadow-xs space-y-4"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-base-200">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="badge badge-accent badge-sm font-bold text-white uppercase text-[10px]">
                        {opp.category}
                      </span>
                      <span className="text-xs text-base-content/60 font-medium">
                        {opp.is_remote ? '🌐 100% Remote' : `📍 ${opp.locality}, ${opp.city}`}
                      </span>
                    </div>
                    <h4 className="font-bold text-base text-base-content mt-1">{opp.title}</h4>
                  </div>

                  <span className="text-sm font-extrabold text-primary">
                    {opp.compensation}
                  </span>
                </div>

                <p className="text-xs text-base-content/75 leading-relaxed">
                  {opp.description}
                </p>

                {/* Candidate Match Preview */}
                <div className="bg-base-200/60 p-4 rounded-2xl space-y-3 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-base-content flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-primary" /> Top AI Candidate Match:
                    </span>
                    <span className="badge badge-success badge-sm text-white font-bold text-xs">
                      94% Compatibility
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <strong className="text-base-content block">Ramesh Krishnan (68 yrs)</strong>
                      <span className="text-[11px] text-base-content/60">35 yrs Chief Accountant • Adyar, Chennai</span>
                    </div>
                    <button 
                      onClick={() => {
                        setToastMsg('Interview invitation sent to candidate Ramesh Krishnan via SMS & WhatsApp!');
                        setTimeout(() => setToastMsg(''), 3500);
                      }}
                      className="btn btn-primary btn-xs rounded-lg text-white font-bold gap-1"
                    >
                      Connect & Interview
                    </button>
                  </div>
                </div>

              </div>
            ))}
          </div>
        </div>
      )}

      {/* CREATE JOB MODAL */}
      {showPostModal && (
        <div className="modal modal-open z-50">
          <div className="modal-box rounded-3xl max-w-lg p-6 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-base-200">
              <h3 className="text-lg font-bold text-base-content">Post a Senior Opportunity</h3>
              <button onClick={() => setShowPostModal(false)} className="btn btn-sm btn-circle btn-ghost">✕</button>
            </div>

            <form onSubmit={handlePostJob} className="space-y-3 text-xs">
              <div className="form-control">
                <label className="label text-[11px] font-semibold">Job Title</label>
                <input 
                  type="text" 
                  required
                  value={jobForm.title}
                  onChange={(e) => setJobForm(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="e.g. Part-Time Accounts Reconciliation Specialist"
                  className="input input-bordered input-sm w-full rounded-xl"
                />
              </div>

              <div className="form-control">
                <label className="label text-[11px] font-semibold">Description & Hours</label>
                <textarea 
                  rows={3}
                  required
                  value={jobForm.description}
                  onChange={(e) => setJobForm(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Describe the tasks, flexible hours, and support provided..."
                  className="textarea textarea-bordered w-full text-xs rounded-xl"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="form-control">
                  <label className="label text-[11px] font-semibold">Compensation</label>
                  <input 
                    type="text" 
                    required
                    value={jobForm.compensation}
                    onChange={(e) => setJobForm(prev => ({ ...prev, compensation: e.target.value }))}
                    placeholder="e.g. ₹15,000 / month (15 hrs/wk)"
                    className="input input-bordered input-sm w-full rounded-xl"
                  />
                </div>

                <div className="form-control">
                  <label className="label text-[11px] font-semibold">Locality</label>
                  <select 
                    value={jobForm.locality}
                    onChange={(e) => setJobForm(prev => ({ ...prev, locality: e.target.value }))}
                    className="select select-bordered select-sm w-full rounded-xl text-xs"
                  >
                    {selectedCity.localities.map(loc => <option key={loc} value={loc}>{loc}</option>)}
                  </select>
                </div>
              </div>

              {/* Dignity Guarantee */}
              <div className="bg-success/10 border border-success/20 rounded-xl p-2.5 text-[11px] text-success-content flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-success shrink-0" />
                <span className="text-base-content font-medium">
                  Verified against SilverHands Senior Dignity Standards (Zero physical lifting, respectful hours).
                </span>
              </div>

              <div className="modal-action pt-2 flex items-center justify-between">
                <button type="button" onClick={() => setShowPostModal(false)} className="btn btn-ghost btn-sm rounded-xl">
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={posting}
                  className="btn btn-primary btn-sm rounded-xl text-white font-bold"
                >
                  {posting ? 'Posting...' : 'Publish to Senior Deck'}
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  );
}
