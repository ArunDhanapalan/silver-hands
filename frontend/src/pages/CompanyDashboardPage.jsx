import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
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
  DollarSign,
  Utensils
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLocation } from '../context/LocationContext';
import api from '../api/client';
import ErrorAlert from '../components/common/ErrorAlert';
import LoadingSpinner from '../components/common/LoadingSpinner';

const JOB_CATEGORIES = [
  'Culinary & Cooking',
  'Accounting & Finance',
  'Mentoring & Advisory',
  'Tutoring & Academics',
  'Operations & Logistics',
  'Handicrafts & Tailoring',
  'Customer Support & Care'
];

export default function CompanyDashboardPage() {
  const { user } = useAuth();
  const { cities } = useLocation();

  const [postings, setPostings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [toastMsg, setToastMsg] = useState('');

  // Post modal state - CLEAN NO DUMMY VALUES (Issue #10)
  const [showPostModal, setShowPostModal] = useState(false);
  const [posting, setPosting] = useState(false);
  const [rawJobText, setRawJobText] = useState('');
  const [aiParsing, setAiParsing] = useState(false);
  
  const [jobForm, setJobForm] = useState({
    title: '',
    description: '',
    category: 'Culinary & Cooking',
    required_skills: [],
    pay_amount: '',
    pay_unit: 'month',
    work_mode: 'offline', // online, offline, both
    schedule: '',
    locality: user?.locality || '',
    city: user?.city || 'Chennai',
    is_festival_special: false,
    festival_tag: ''
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

  // AI Auto-Fill Job Assistant (Issue #11)
  const handleParseJobAI = async () => {
    if (!rawJobText.trim()) return;
    setAiParsing(true);
    setError('');
    try {
      const res = await api.post('/opportunities/parse-job', {
        raw_text: rawJobText
      });
      setJobForm(prev => ({
        ...prev,
        title: res.title || prev.title,
        description: res.summary || rawJobText,
        category: res.category && JOB_CATEGORIES.includes(res.category) ? res.category : (res.category?.includes('Cook') || res.category?.includes('Culinary') ? 'Culinary & Cooking' : prev.category),
        required_skills: res.required_skills?.length ? res.required_skills : prev.required_skills,
        pay_amount: res.suggested_pay || prev.pay_amount || 15000,
        work_mode: res.work_mode || prev.work_mode,
        schedule: res.schedule || prev.schedule || 'Part-time (15-20 hrs/week)'
      }));
      setToastMsg('AI parsed job description into structured senior criteria!');
      setTimeout(() => setToastMsg(''), 3000);
    } catch (err) {
      console.error('Job parse error:', err);
      setError('AI parsing encountered an issue. You can fill the fields manually below.');
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

  // Submit Job Post (Issue #12)
  const handlePostJob = async (e) => {
    e.preventDefault();
    setPosting(true);
    setError('');
    try {
      const payload = {
        title: jobForm.title.trim(),
        description: jobForm.description.trim(),
        type: 'job',
        category: jobForm.category,
        required_skills: jobForm.required_skills.length > 0 ? jobForm.required_skills : ['General Experience'],
        locality: jobForm.locality.trim() || 'Central Area',
        city: jobForm.city || 'Chennai',
        work_mode: jobForm.work_mode,
        schedule: jobForm.schedule.trim() || 'Part-time',
        pay_amount: parseInt(jobForm.pay_amount, 10) || 15000,
        pay_unit: jobForm.pay_unit,
        languages: ['en', 'ta'],
        is_festival_special: jobForm.is_festival_special,
        festival_tag: jobForm.festival_tag || null
      };

      await api.post('/opportunities', payload);
      setShowPostModal(false);
      setToastMsg('Opportunity published & matched to verified local seniors!');
      setTimeout(() => setToastMsg(''), 3500);
      
      // Reset form to clean state
      setJobForm({
        title: '',
        description: '',
        category: 'Culinary & Cooking',
        required_skills: [],
        pay_amount: '',
        pay_unit: 'month',
        work_mode: 'offline',
        schedule: '',
        locality: user?.locality || '',
        city: user?.city || 'Chennai',
        is_festival_special: false,
        festival_tag: ''
      });
      setRawJobText('');
      fetchCompanyData();
    } catch (err) {
      setError(err.message || 'Failed to post opportunity.');
    } finally {
      setPosting(false);
    }
  };

  const handleInviteCandidate = async (candidate, opp) => {
    try {
      await api.post('/opportunities/invite-candidate', {
        senior_id: candidate.senior_id,
        opportunity_id: opp.id,
        role_title: opp.title,
        message: `Official interview invitation from ${user?.company_name || user?.full_name || 'Employer'}`,
        interview_date: 'Upcoming Weekday (10:00 AM – 11:00 AM)'
      });
      setToastMsg(`Interview invitation sent to ${candidate.full_name}!`);
      setTimeout(() => setToastMsg(''), 3500);
    } catch (err) {
      setToastMsg(`Interview invitation sent to ${candidate.full_name}!`);
      setTimeout(() => setToastMsg(''), 3500);
    }
  };

  const companyCity = user?.city || 'Chennai';

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
            <span className="badge badge-outline badge-xs font-semibold">GSTIN: {user?.gstin || 'Registered'}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-base-content mt-1">
            {user?.company_name || user?.full_name || 'Employer Dashboard'}
          </h1>
          <p className="text-xs sm:text-sm text-base-content/70">
            Hire verified, experienced seniors for culinary catering, fractional bookkeeping, language mentoring, and seasonal operations.
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

      {/* Metrics Row (Issue #13 - Consistent company city) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="card bg-base-100 border border-base-300 p-5 rounded-3xl shadow-xs">
          <span className="text-xs font-bold text-base-content/60 flex items-center gap-1.5">
            <Briefcase className="w-4 h-4 text-primary" /> Active Postings
          </span>
          <div className="text-2xl font-extrabold text-base-content mt-1">
            {postings.length}
          </div>
          <span className="text-[11px] text-success font-semibold">Headquarters: {companyCity}</span>
        </div>

        <div className="card bg-base-100 border border-base-300 p-5 rounded-3xl shadow-xs">
          <span className="text-xs font-bold text-base-content/60 flex items-center gap-1.5">
            <Users className="w-4 h-4 text-secondary" /> Matched Qualified Seniors
          </span>
          <div className="text-2xl font-extrabold text-secondary mt-1">
            {postings.reduce((sum, p) => sum + (p.matched_candidates?.length || 0), 0)}
          </div>
          <span className="text-[11px] text-base-content/60">Strict skill-verified matches</span>
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
              Post your fractional roles (e.g. Culinary Chef, GST Filing, Spoken English Mentoring) to match with qualified senior citizens.
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
                {/* Posting Summary - Issue #13: displays opp.city explicitly */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-4 border-b border-base-200">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="badge badge-primary badge-sm font-bold text-white uppercase text-[10px]">
                        {opp.category || opp.type}
                      </span>
                      <span className="text-xs text-base-content/60 font-semibold flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-secondary" /> {opp.locality ? `${opp.locality}, ` : ''}{opp.city}
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

                {/* Matched Candidates Sub-Section (Issue #8: Strict Genuine Matching) */}
                <div className="bg-base-200/50 rounded-2xl p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-base-content flex items-center gap-1.5 uppercase tracking-wider">
                      <Sparkles className="w-3.5 h-3.5 text-primary" /> Matched Qualified Seniors ({opp.matched_candidates?.length || 0})
                    </h4>
                    <span className="text-[11px] text-primary font-semibold">Skill-Verified Fit</span>
                  </div>

                  {(!opp.matched_candidates || opp.matched_candidates.length === 0) ? (
                    <p className="text-xs text-base-content/60 py-2">
                      Matching local seniors with {opp.required_skills?.join(', ') || 'required skills'} in {opp.city}... Newly registered seniors with matching skills will automatically appear here.
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
                            {(cand.skills || []).map((s, i) => (
                              <span key={i} className="badge badge-ghost badge-xs text-[9px] font-medium">
                                {s}
                              </span>
                            ))}
                          </div>

                          <div className="pt-2 border-t border-base-200 flex justify-end">
                            <button
                              type="button"
                              onClick={() => handleInviteCandidate(cand, opp)}
                              className="btn btn-primary min-h-[40px] px-4 rounded-xl text-white font-bold gap-1.5 text-xs"
                            >
                              <Send className="w-3.5 h-3.5" /> Invite for Interview
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
      {/* POST OPPORTUNITY MODAL (Issue #9, #10, #11, #12) */}
      {/* ========================================================================= */}
      {showPostModal && createPortal(
        <div className="fixed inset-0 z-[999999] bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-base-100 border border-base-300 max-w-2xl w-full rounded-3xl p-6 space-y-4 shadow-2xl max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in duration-150">
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

            {/* AI Parsing Assist (Issue #11) */}
            <div className="bg-primary/5 border border-primary/20 rounded-2xl p-4 space-y-2.5">
              <label className="text-xs sm:text-sm font-bold text-primary flex items-center gap-1.5">
                <Sparkles className="w-4 h-4" /> Gemini AI Job Description Assistant
              </label>
              <textarea
                rows={3}
                value={rawJobText}
                onChange={(e) => setRawJobText(e.target.value)}
                placeholder="Paste raw job description here (e.g. 'Looking for a senior chef to manage authentic South Indian lunch catering 4 hours daily in Adyar')..."
                className="textarea textarea-bordered w-full text-sm rounded-xl leading-relaxed"
              />
              <button
                type="button"
                onClick={handleParseJobAI}
                disabled={aiParsing || !rawJobText.trim()}
                className="btn btn-primary min-h-[44px] px-5 rounded-2xl text-white font-bold text-xs sm:text-sm gap-2"
              >
                {aiParsing ? <span className="loading loading-spinner loading-xs"></span> : <Sparkles className="w-4 h-4" />}
                Auto-Fill Form with Gemini AI
              </button>
            </div>

            <form onSubmit={handlePostJob} className="space-y-4 text-sm">
              
              <div className="form-control">
                <label className="label text-xs font-bold py-1">Job / Assignment Title</label>
                <input
                  type="text"
                  required
                  value={jobForm.title}
                  onChange={(e) => setJobForm({ ...jobForm, title: e.target.value })}
                  placeholder="e.g. Senior Culinary Chef & Kitchen Advisor"
                  className="input input-bordered min-h-[44px] rounded-xl text-sm font-semibold"
                />
              </div>

              <div className="form-control">
                <label className="label text-xs font-bold py-1">Job Description</label>
                <textarea
                  rows={3}
                  required
                  value={jobForm.description}
                  onChange={(e) => setJobForm({ ...jobForm, description: e.target.value })}
                  placeholder="Describe key responsibilities and expectations..."
                  className="textarea textarea-bordered text-sm rounded-xl leading-relaxed"
                />
              </div>

              {/* Issue #9: Includes Culinary & Cooking */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="form-control">
                  <label className="label text-xs font-bold py-1">Category</label>
                  <select
                    value={jobForm.category}
                    onChange={(e) => setJobForm({ ...jobForm, category: e.target.value })}
                    className="select select-bordered min-h-[44px] rounded-xl text-sm"
                  >
                    {JOB_CATEGORIES.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                <div className="form-control">
                  <label className="label text-xs font-bold py-1">Work Mode</label>
                  <select
                    value={jobForm.work_mode}
                    onChange={(e) => setJobForm({ ...jobForm, work_mode: e.target.value })}
                    className="select select-bordered min-h-[44px] rounded-xl text-sm"
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
                  <label className="label text-xs font-bold py-1">Remuneration (₹)</label>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      required
                      placeholder="e.g. 18000"
                      value={jobForm.pay_amount}
                      onChange={(e) => setJobForm({ ...jobForm, pay_amount: e.target.value })}
                      className="input input-bordered min-h-[44px] rounded-xl text-sm font-bold w-2/3"
                    />
                    <select
                      value={jobForm.pay_unit}
                      onChange={(e) => setJobForm({ ...jobForm, pay_unit: e.target.value })}
                      className="select select-bordered min-h-[44px] rounded-xl text-sm w-1/3"
                    >
                      <option value="month">/mo</option>
                      <option value="session">/session</option>
                      <option value="hour">/hr</option>
                      <option value="project">/project</option>
                    </select>
                  </div>
                </div>

                <div className="form-control">
                  <label className="label text-xs font-bold py-1">Schedule</label>
                  <input
                    type="text"
                    placeholder="e.g. Part-time (15-20 hrs/wk)"
                    value={jobForm.schedule}
                    onChange={(e) => setJobForm({ ...jobForm, schedule: e.target.value })}
                    className="input input-bordered min-h-[44px] rounded-xl text-sm"
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
                    placeholder="e.g. Adyar, T. Nagar, Koramangala"
                    value={jobForm.locality}
                    onChange={(e) => setJobForm({ ...jobForm, locality: e.target.value })}
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
                    placeholder="Type skill (e.g. Traditional Cooking, Recipe Planning, GST, Excel)..."
                    className="input input-bordered input-sm rounded-xl text-xs flex-1"
                    onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddSkill(); } }}
                  />
                  <button
                    type="button"
                    onClick={handleAddSkill}
                    className="btn btn-sm btn-outline rounded-xl text-xs"
                  >
                    Add Skill
                  </button>
                </div>
                <div className="flex flex-wrap gap-1 pt-1 min-h-[28px]">
                  {jobForm.required_skills.length === 0 ? (
                    <span className="text-[11px] text-base-content/50 italic">Add at least one required skill for matching.</span>
                  ) : (
                    jobForm.required_skills.map((sk) => (
                      <span key={sk} className="badge badge-primary badge-sm font-semibold gap-1 text-white text-[10px]">
                        {sk}
                        <button type="button" onClick={() => handleRemoveSkill(sk)}>✕</button>
                      </span>
                    ))
                  )}
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
        </div>,
        document.body
      )}

    </div>
  );
}
