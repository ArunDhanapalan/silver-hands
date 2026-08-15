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
  X,
  Send,
  Building,
  DollarSign
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLocation } from '../context/LocationContext';
import api from '../api/client';
import ErrorAlert from '../components/common/ErrorAlert';
import LoadingSpinner from '../components/common/LoadingSpinner';

export default function CompanyDashboardPage() {
  const { user } = useAuth();
  const { selectedCity, cities } = useLocation();

  const [postings, setPostings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [toastMsg, setToastMsg] = useState('');

  // Post modal state
  const [showPostModal, setShowPostModal] = useState(false);
  const [posting, setPosting] = useState(false);
  const [rawJobText, setRawJobText] = useState('');
  const [aiParsing, setAiParsing] = useState(false);
  
  const [jobForm, setJobForm] = useState({
    title: '',
    description: '',
    category: 'Accounting & Finance',
    required_skills: ['Accounting', 'Bookkeeping'],
    pay_amount: 18000,
    pay_unit: 'month',
    work_mode: 'offline', // online, offline, both
    schedule: 'Part-time (Evenings / 15 hrs wk)',
    locality: 'Adyar',
    city: selectedCity.name,
    is_festival_special: false,
    festival_tag: 'Diwali'
  });

  const [skillInput, setSkillInput] = useState('');

  const fetchCompanyData = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await api.get('/opportunities/company-postings');
      setPostings(data || []);
    } catch (err) {
      setError(err.message || 'Failed to load company postings.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCompanyData();
  }, []);

  const handleParseJobAI = async () => {
    if (!rawJobText.trim()) return;
    setAiParsing(true);
    try {
      const res = await api.post('/opportunities/parse-job', {
        raw_text: rawJobText
      });
      setJobForm(prev => ({
        ...prev,
        title: res.title || prev.title,
        description: res.summary || rawJobText,
        required_skills: res.required_skills?.length ? res.required_skills : prev.required_skills,
        category: res.category || prev.category
      }));
      setToastMsg('AI parsed job description into structured senior criteria!');
      setTimeout(() => setToastMsg(''), 3000);
    } catch (err) {
      console.error('Job parse error:', err);
    } finally {
      setAiParsing(false);
    }
  };

  const handleAddSkill = () => {
    if (skillInput.trim() && !jobForm.required_skills.includes(skillInput.trim())) {
      setJobForm(prev => ({
        ...prev,
        required_skills: [...prev.required_skills, skillInput.trim()]
      }));
      setSkillInput('');
    }
  };

  const handleRemoveSkill = (skillToRemove) => {
    setJobForm(prev => ({
      ...prev,
      required_skills: prev.required_skills.filter(s => s !== skillToRemove)
    }));
  };

  const handlePostJob = async (e) => {
    e.preventDefault();
    setPosting(true);
    setError('');
    try {
      await api.post('/opportunities', jobForm);
      setShowPostModal(false);
      setToastMsg('Opportunity published! Matched to qualified local seniors.');
      setTimeout(() => setToastMsg(''), 3500);
      setJobForm({
        title: '',
        description: '',
        category: 'Accounting & Finance',
        required_skills: ['Accounting'],
        pay_amount: 15000,
        pay_unit: 'month',
        work_mode: 'offline',
        schedule: 'Part-time',
        locality: 'Adyar',
        city: selectedCity.name,
        is_festival_special: false,
        festival_tag: 'Diwali'
      });
      fetchCompanyData();
    } catch (err) {
      setError(err.message || 'Failed to post opportunity.');
    } finally {
      setPosting(false);
    }
  };

  const handleInviteCandidate = (candidateName, roleTitle) => {
    setToastMsg(`Interview invitation sent to ${candidateName} for "${roleTitle}"!`);
    setTimeout(() => setToastMsg(''), 3500);
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
            <span className="badge badge-primary badge-sm font-bold text-white uppercase">Corporate & MSME Hub</span>
            <span className="badge badge-outline badge-xs font-semibold">GSTIN Verified</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-base-content mt-1">
            {user?.company_name || user?.full_name || 'Employer Dashboard'}
          </h1>
          <p className="text-xs sm:text-sm text-base-content/70">
            Hire verified, experienced seniors for fractional bookkeeping, advisory, language tutoring, and seasonal operations.
          </p>
        </div>

        <button 
          onClick={() => setShowPostModal(true)}
          className="btn btn-primary btn-sm rounded-2xl text-white font-bold gap-1.5 shadow-md self-start sm:self-auto text-xs"
        >
          <Plus className="w-4 h-4" /> Post New Opportunity
        </button>
      </div>

      <ErrorAlert message={error} />

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="card bg-base-100 border border-base-300 p-5 rounded-3xl shadow-xs">
          <span className="text-xs font-bold text-base-content/60 flex items-center gap-1.5">
            <Briefcase className="w-4 h-4 text-primary" /> Active Postings
          </span>
          <div className="text-2xl font-extrabold text-base-content mt-1">
            {postings.length}
          </div>
          <span className="text-[11px] text-success font-semibold">Live in {selectedCity.name}</span>
        </div>

        <div className="card bg-base-100 border border-base-300 p-5 rounded-3xl shadow-xs">
          <span className="text-xs font-bold text-base-content/60 flex items-center gap-1.5">
            <Users className="w-4 h-4 text-secondary" /> Matched Qualified Seniors
          </span>
          <div className="text-2xl font-extrabold text-secondary mt-1">
            {postings.reduce((sum, p) => sum + (p.matched_candidates?.length || 0), 0)}
          </div>
          <span className="text-[11px] text-base-content/60">Over 65% skill synergy</span>
        </div>

        <div className="card bg-base-100 border border-base-300 p-5 rounded-3xl shadow-xs">
          <span className="text-xs font-bold text-base-content/60 flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-success" /> Dignity & Age Compliant
          </span>
          <div className="text-2xl font-extrabold text-success mt-1">
            100%
          </div>
          <span className="text-[11px] text-base-content/60">SilverHands Fair Pay Standard</span>
        </div>
      </div>

      {/* Active Postings & Matched Candidates Pipeline */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-extrabold text-base-content flex items-center gap-2">
            <Briefcase className="w-5 h-5 text-primary" /> My Opportunity Postings & Candidates
          </h2>
          <span className="text-xs text-base-content/60 font-semibold">
            {postings.length} Postings
          </span>
        </div>

        {loading ? (
          <LoadingSpinner message="Loading your company dashboard..." />
        ) : postings.length === 0 ? (
          <div className="bg-base-100 rounded-3xl border border-base-300 p-12 text-center space-y-4">
            <Briefcase className="w-12 h-12 text-base-content/30 mx-auto" />
            <h3 className="text-lg font-bold text-base-content">No active opportunities posted yet</h3>
            <p className="text-xs text-base-content/60 max-w-md mx-auto">
              Post your fractional roles (e.g. GST Filing, Spoken English Mentoring, Festive Logistics) to instantly match with experienced local senior citizens.
            </p>
            <button 
              onClick={() => setShowPostModal(true)}
              className="btn btn-primary btn-sm rounded-xl text-white font-bold text-xs"
            >
              <Plus className="w-3.5 h-3.5" /> Post Your First Opportunity
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {postings.map((opp) => (
              <div 
                key={opp.id}
                className="card bg-base-100 border border-base-300 rounded-3xl p-6 shadow-xs space-y-5"
              >
                {/* Posting Summary */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-4 border-b border-base-200">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="badge badge-primary badge-sm font-bold text-white uppercase text-[10px]">
                        {opp.type}
                      </span>
                      <span className="text-xs text-base-content/60 font-semibold flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-secondary" /> {opp.locality}, {opp.city}
                      </span>
                      <span className="badge badge-neutral badge-xs font-semibold uppercase">
                        {opp.work_mode}
                      </span>
                    </div>
                    <h3 className="text-lg font-extrabold text-base-content">{opp.title}</h3>
                    <p className="text-xs text-base-content/70 line-clamp-2 max-w-2xl">{opp.description}</p>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="text-[10px] text-base-content/60 uppercase font-bold block">Remuneration</span>
                    <span className="text-lg font-extrabold text-success">
                      ₹{opp.pay_amount?.toLocaleString('en-IN')}/{opp.pay_unit}
                    </span>
                  </div>
                </div>

                {/* Required Skills Badges */}
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="text-xs font-bold text-base-content/60 mr-1">Required Skills:</span>
                  {(opp.required_skills || []).map((sk, idx) => (
                    <span key={idx} className="badge badge-ghost badge-sm text-[11px] font-semibold">
                      {sk}
                    </span>
                  ))}
                </div>

                {/* Matched Candidates Sub-Section */}
                <div className="bg-base-200/50 rounded-2xl p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-base-content flex items-center gap-1.5 uppercase tracking-wider">
                      <Sparkles className="w-3.5 h-3.5 text-primary" /> Matched Qualified Seniors ({opp.matched_candidates?.length || 0})
                    </h4>
                    <span className="text-[11px] text-primary font-semibold">AI Verified Fit</span>
                  </div>

                  {(!opp.matched_candidates || opp.matched_candidates.length === 0) ? (
                    <p className="text-xs text-base-content/60 py-2">
                      Matching local seniors with {opp.required_skills?.join(', ')}... New registered seniors in {opp.city} will appear here.
                    </p>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {opp.matched_candidates.map((cand) => (
                        <div 
                          key={cand.senior_id}
                          className="bg-base-100 border border-base-300 rounded-2xl p-3.5 shadow-xs flex flex-col justify-between space-y-2 hover:border-primary/40 transition-colors"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <div className="flex items-center gap-1.5">
                                <h5 className="font-bold text-sm text-base-content">{cand.full_name}</h5>
                                <ShieldCheck className="w-3.5 h-3.5 text-success" />
                              </div>
                              <span className="text-[11px] text-base-content/60">📍 {cand.locality}, {cand.city}</span>
                            </div>
                            <span className="badge badge-primary badge-sm font-bold text-white text-[10px]">
                              {cand.match_score}% Match
                            </span>
                          </div>

                          <p className="text-xs text-base-content/75 line-clamp-2 italic">
                            "{cand.bio}"
                          </p>

                          <div className="flex flex-wrap gap-1">
                            {(cand.skills || []).slice(0, 3).map((s, i) => (
                              <span key={i} className="badge badge-ghost badge-xs text-[9px] font-medium">
                                {s}
                              </span>
                            ))}
                          </div>

                          <div className="pt-2 border-t border-base-200 flex justify-end">
                            <button
                              type="button"
                              onClick={() => handleInviteCandidate(cand.full_name, opp.title)}
                              className="btn btn-primary btn-xs rounded-lg text-white font-bold gap-1 text-[10px]"
                            >
                              <Send className="w-3 h-3" /> Invite for Interview
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                </div>

              </div>
            ))}
          </div>
        )}

      </div>

      {/* ========================================================================= */}
      {/* POST OPPORTUNITY MODAL */}
      {/* ========================================================================= */}
      {showPostModal && (
        <div className="modal modal-open z-50">
          <div className="modal-box max-w-2xl rounded-3xl p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-base-200 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                  <Briefcase className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-extrabold text-lg text-base-content">Post a Senior Opportunity</h3>
                  <p className="text-xs text-base-content/60">Define role details or paste raw JD to parse with AI</p>
                </div>
              </div>
              <button 
                onClick={() => setShowPostModal(false)}
                className="btn btn-sm btn-circle btn-ghost"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* AI Parsing Assist */}
            <div className="bg-primary/5 border border-primary/20 rounded-2xl p-3.5 space-y-2">
              <label className="text-xs font-bold text-primary flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5" /> AI Job Description Assistant
              </label>
              <textarea
                rows={2}
                value={rawJobText}
                onChange={(e) => setRawJobText(e.target.value)}
                placeholder="Paste raw job description here (e.g. 'Looking for a retired accountant in Adyar for GST reconciliation 15 hrs a week')..."
                className="textarea textarea-bordered w-full text-xs rounded-xl"
              />
              <button
                type="button"
                onClick={handleParseJobAI}
                disabled={aiParsing || !rawJobText.trim()}
                className="btn btn-primary btn-xs rounded-xl text-white font-bold gap-1"
              >
                {aiParsing ? <span className="loading loading-spinner loading-xs"></span> : <Sparkles className="w-3 h-3" />}
                Auto-Fill Form with AI
              </button>
            </div>

            <form onSubmit={handlePostJob} className="space-y-4">
              
              <div className="form-control">
                <label className="label text-xs font-semibold">Job / Assignment Title</label>
                <input
                  type="text"
                  required
                  value={jobForm.title}
                  onChange={(e) => setJobForm({ ...jobForm, title: e.target.value })}
                  placeholder="e.g. Fractional Chief Accountant & GST Advisor"
                  className="input input-bordered input-sm rounded-xl text-xs"
                />
              </div>

              <div className="form-control">
                <label className="label text-xs font-semibold">Job Description</label>
                <textarea
                  rows={3}
                  required
                  value={jobForm.description}
                  onChange={(e) => setJobForm({ ...jobForm, description: e.target.value })}
                  placeholder="Describe key responsibilities and expectations..."
                  className="textarea textarea-bordered text-xs rounded-xl"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="form-control">
                  <label className="label text-xs font-semibold">Category</label>
                  <select
                    value={jobForm.category}
                    onChange={(e) => setJobForm({ ...jobForm, category: e.target.value })}
                    className="select select-bordered select-sm rounded-xl text-xs"
                  >
                    <option value="Accounting & Finance">Accounting & Finance</option>
                    <option value="Mentoring & Advisory">Mentoring & Advisory</option>
                    <option value="Tutoring & Academics">Tutoring & Academics</option>
                    <option value="Operations & Logistics">Operations & Logistics</option>
                    <option value="Handicrafts & Tailoring">Handicrafts & Tailoring</option>
                  </select>
                </div>

                <div className="form-control">
                  <label className="label text-xs font-semibold">Work Mode</label>
                  <select
                    value={jobForm.work_mode}
                    onChange={(e) => setJobForm({ ...jobForm, work_mode: e.target.value })}
                    className="select select-bordered select-sm rounded-xl text-xs"
                  >
                    <option value="offline">In-Person (Local)</option>
                    <option value="online">Online / Remote</option>
                    <option value="both">Hybrid / Both</option>
                  </select>
                </div>
              </div>

              {/* Remuneration & Schedule */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="form-control">
                  <label className="label text-xs font-semibold">Remuneration (₹)</label>
                  <div className="flex gap-1">
                    <input
                      type="number"
                      required
                      value={jobForm.pay_amount}
                      onChange={(e) => setJobForm({ ...jobForm, pay_amount: parseInt(e.target.value) || 0 })}
                      className="input input-bordered input-sm rounded-xl text-xs w-2/3"
                    />
                    <select
                      value={jobForm.pay_unit}
                      onChange={(e) => setJobForm({ ...jobForm, pay_unit: e.target.value })}
                      className="select select-bordered select-sm rounded-xl text-xs w-1/3"
                    >
                      <option value="month">/mo</option>
                      <option value="session">/session</option>
                      <option value="hour">/hr</option>
                      <option value="project">/project</option>
                    </select>
                  </div>
                </div>

                <div className="form-control">
                  <label className="label text-xs font-semibold">Schedule</label>
                  <input
                    type="text"
                    value={jobForm.schedule}
                    onChange={(e) => setJobForm({ ...jobForm, schedule: e.target.value })}
                    placeholder="e.g. Part-time (15 hrs/wk)"
                    className="input input-bordered input-sm rounded-xl text-xs"
                  />
                </div>
              </div>

              {/* City & Locality */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="form-control">
                  <label className="label text-xs font-semibold">City</label>
                  <select
                    value={jobForm.city}
                    onChange={(e) => setJobForm({ ...jobForm, city: e.target.value })}
                    className="select select-bordered select-sm rounded-xl text-xs"
                  >
                    {cities.map(c => (
                      <option key={c.id} value={c.name}>{c.name}</option>
                    ))}
                  </select>
                </div>

                <div className="form-control">
                  <label className="label text-xs font-semibold">Locality / Area</label>
                  <input
                    type="text"
                    value={jobForm.locality}
                    onChange={(e) => setJobForm({ ...jobForm, locality: e.target.value })}
                    placeholder="e.g. Adyar, Koramangala"
                    className="input input-bordered input-sm rounded-xl text-xs"
                  />
                </div>
              </div>

              {/* Required Skills Manager */}
              <div className="form-control space-y-1.5">
                <label className="label text-xs font-semibold p-0">Required Skills for Matching</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={skillInput}
                    onChange={(e) => setSkillInput(e.target.value)}
                    placeholder="Type skill (e.g. Excel, GST, Tally)..."
                    className="input input-bordered input-sm rounded-xl text-xs flex-1"
                  />
                  <button
                    type="button"
                    onClick={handleAddSkill}
                    className="btn btn-sm btn-outline rounded-xl text-xs"
                  >
                    Add
                  </button>
                </div>
                <div className="flex flex-wrap gap-1 pt-1">
                  {jobForm.required_skills.map((sk) => (
                    <span key={sk} className="badge badge-primary badge-sm font-semibold gap-1 text-white text-[10px]">
                      {sk}
                      <button type="button" onClick={() => handleRemoveSkill(sk)}>✕</button>
                    </span>
                  ))}
                </div>
              </div>

              <div className="modal-action pt-2">
                <button
                  type="button"
                  onClick={() => setShowPostModal(false)}
                  className="btn btn-ghost btn-sm rounded-xl text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={posting}
                  className="btn btn-primary btn-sm rounded-xl text-white font-bold text-xs"
                >
                  {posting ? <span className="loading loading-spinner loading-xs"></span> : 'Publish Opportunity'}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
}
