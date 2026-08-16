import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Briefcase, 
  Sparkles, 
  Layers, 
  MapPin, 
  TrendingUp, 
  ShieldCheck, 
  Clock, 
  CheckCircle2, 
  ArrowRight, 
  Plus, 
  Check, 
  X, 
  ExternalLink, 
  Video, 
  Calendar, 
  Award,
  AlertCircle,
  RefreshCw,
  HeartHandshake
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLocation } from '../context/LocationContext';
import { useChat } from '../context/ChatContext';
import api from '../api/client';
import OpportunityDeck from '../components/opportunity/OpportunityDeck';
import ErrorAlert from '../components/common/ErrorAlert';
import LoadingSpinner from '../components/common/LoadingSpinner';

export default function SeniorDashboardPage() {
  const { user } = useAuth();
  const { selectedCity } = useLocation();
  const { openChatWith } = useChat();

  const [deck, setDeck] = useState([]);
  const [activeApps, setActiveApps] = useState([]);
  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [toastMsg, setToastMsg] = useState('');

  const fetchOpportunities = async () => {
    setLoading(true);
    setError('');
    try {
      const [deckData, appsData, intData] = await Promise.all([
        api.get('/opportunities/deck').catch(() => []),
        api.get('/opportunities/my-applications').catch(() => []),
        api.get('/opportunities/interviews').catch(() => [])
      ]);
      setDeck(deckData || []);
      setActiveApps(appsData || []);
      setInterviews(intData || []);
    } catch (err) {
      setError(err.message || 'Failed to load job opportunities');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOpportunities();
  }, [selectedCity?.name]);

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 3500);
  };

  const handleSwipe = async (oppId, action) => {
    try {
      const res = await api.post(`/opportunities/${oppId}/swipe`, { action });
      if (action === 'right' || action === 'interested') {
        showToast('🎯 Application submitted! Matching company notified.');
      } else {
        showToast('Passed opportunity.');
      }

      // Refresh applications and deck list
      const updatedApps = await api.get('/opportunities/my-applications');
      setActiveApps(updatedApps || []);
    } catch (err) {
      console.error('Swipe error:', err);
    }
  };

  const handleResetDeck = async () => {
    try {
      await api.post('/opportunities/reset-deck');
      showToast('Opportunities restored to deck.');
      fetchOpportunities();
    } catch (err) {
      console.error('Reset error:', err);
    }
  };

  const handleCancelApplication = async (appId) => {
    if (!window.confirm('Withdraw this job application?')) return;
    try {
      setActiveApps(prev => prev.filter(a => a.id !== appId && a.opportunity_id !== appId));
      await api.put(`/opportunities/applications/${appId}/cancel`);
      showToast('Application withdrawn.');
      fetchOpportunities();
    } catch (err) {
      setError(err.message || 'Failed to withdraw application');
      fetchOpportunities();
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-16">
      
      {/* Toast notification */}
      {toastMsg && (
        <div className="toast toast-top toast-center z-50">
          <div className="alert alert-success text-white font-bold text-xs shadow-lg rounded-2xl flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" />
            <span>{toastMsg}</span>
          </div>
        </div>
      )}

      {/* Header Profile Summary — Focus ONLY on Jobs & Livelihood */}
      <div className="bg-gradient-to-r from-primary/15 via-base-100 to-warning/15 border border-primary/20 rounded-3xl p-6 sm:p-8 shadow-sm">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-5">
          
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-primary text-white flex items-center justify-center text-2xl font-black shadow-md shrink-0">
              {user?.full_name?.charAt(0) || 'S'}
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="badge badge-primary badge-sm font-extrabold text-white uppercase text-[10px]">
                  💼 Livelihood & Gigs
                </span>
                <span className="badge badge-accent badge-sm text-white font-bold text-[10px] flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3" /> Age Verified
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-base-content tracking-tight">
                Hello, {user?.full_name || 'Senior Guru'}!
              </h1>
              <p className="text-xs sm:text-sm text-base-content/70 mt-0.5">
                Targeting job opportunities in <strong>{user?.locality || selectedCity?.name || 'Chennai'}</strong> within <strong>{user?.travel_radius || '5 km'}</strong> radius.
              </p>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex flex-wrap items-center gap-2.5 w-full lg:w-auto shrink-0">
            <Link to="/senior/passport" className="btn btn-warning min-h-[44px] px-5 rounded-2xl font-black text-white text-xs sm:text-sm gap-2 shadow-xs">
              <Award className="w-4 h-4" /> My Skill Passport
            </Link>
            <button
              type="button"
              onClick={fetchOpportunities}
              className="btn btn-ghost min-h-[44px] w-11 rounded-2xl border border-base-300 hover:bg-base-200"
              title="Refresh Opportunities"
              aria-label="Refresh Opportunities"
            >
              <RefreshCw className="w-4 h-4 text-base-content/70" />
            </button>
          </div>

        </div>
      </div>

      <ErrorAlert message={error} onRetry={fetchOpportunities} />

      {/* Main Opportunity Deck & Active Work (Strictly Job Opportunities) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left: Swipe Deck for Nearby Jobs & Gigs */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between pb-1 border-b border-base-200">
            <div className="flex items-center gap-2">
              <Briefcase className="w-5 h-5 text-warning" />
              <h2 className="text-lg font-black text-base-content">Nearby Job Opportunities Matching Your Skills</h2>
            </div>
            <span className="badge badge-warning badge-sm font-bold text-white">
              {deck.length} In Deck
            </span>
          </div>

          <OpportunityDeck 
            opportunities={deck} 
            onSwipe={handleSwipe} 
            loading={loading} 
            onResetDeck={handleResetDeck}
          />
        </div>

        {/* Right: Active Applications & Interview Invitations */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* 1. Scheduled Corporate Interviews */}
          {interviews.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-warning">
                  <Video className="w-4 h-4" />
                  <h3 className="font-extrabold text-sm uppercase tracking-wider text-base-content">Scheduled Interviews</h3>
                </div>
                <span className="badge badge-warning badge-xs font-bold text-white">{interviews.length}</span>
              </div>

              <div className="space-y-2.5">
                {interviews.map((iv) => (
                  <div key={iv.id} className="card bg-base-100 border-2 border-warning/40 rounded-2xl p-4 shadow-xs space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h4 className="font-bold text-sm text-base-content">{iv.opportunity_title}</h4>
                        <p className="text-xs text-base-content/70">Employer: <strong>{iv.posted_by_name}</strong></p>
                        <p className="text-[11px] text-warning font-semibold mt-0.5">Time: {iv.interview_date || 'Scheduled'}</p>
                      </div>
                      <span className="badge badge-warning badge-sm font-bold text-white text-[10px]">
                        Interview
                      </span>
                    </div>

                    <div className="pt-2 border-t border-base-200 flex items-center justify-between gap-2 flex-wrap">
                      <button
                        type="button"
                        onClick={() => openChatWith(
                          iv.posted_by_id || iv.company_id || 'user_techlocal_04',
                          'interview_invite',
                          iv.opportunity_title,
                          `Hello! I received your interview invitation for "${iv.opportunity_title}".`
                        )}
                        className="btn btn-outline btn-primary btn-xs rounded-xl font-bold gap-1 min-h-[36px] px-3"
                      >
                        💬 Chat with Employer
                      </button>

                      {iv.interview_link && (
                        <a 
                          href={iv.interview_link}
                          target="_blank"
                          rel="noreferrer"
                          className="btn btn-warning btn-xs rounded-xl text-white font-bold gap-1 min-h-[36px] px-3"
                        >
                          <Video className="w-3.5 h-3.5" /> Join Video Room
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 2. My Applications & Gig Matches */}
          <div className="space-y-3">
            <div className="flex items-center justify-between pb-1 border-b border-base-200">
              <div className="flex items-center gap-2">
                <Layers className="w-5 h-5 text-primary" />
                <h3 className="font-extrabold text-base text-base-content">My Active Applications ({activeApps.length})</h3>
              </div>
              <span className="text-xs text-base-content/60">Swiped Right</span>
            </div>

            {activeApps.length === 0 ? (
              <div className="bg-base-100 rounded-3xl border border-base-300 p-6 text-center space-y-2">
                <Briefcase className="w-8 h-8 text-base-content/30 mx-auto" />
                <h4 className="font-bold text-sm text-base-content">No active applications yet</h4>
                <p className="text-xs text-base-content/60 max-w-xs mx-auto">
                  Swipe right on opportunity cards in the deck to apply directly to neighborhood gigs and corporate postings.
                </p>
              </div>
            ) : (
              <div className="space-y-3 max-h-[480px] overflow-y-auto pr-1">
                {activeApps.map((app) => (
                  <div key={app.id} className="card bg-base-100 border border-base-300 rounded-2xl p-4 shadow-xs space-y-2 hover:border-primary/40 transition-colors">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h4 className="font-bold text-sm text-base-content">{app.opportunity_title}</h4>
                        <p className="text-xs text-base-content/70">Posted by: <strong>{app.posted_by_name}</strong></p>
                      </div>
                      <span className={`badge badge-sm uppercase font-bold text-[10px] ${
                        app.status === 'accepted' || app.status === 'hired' ? 'badge-success text-white' :
                        app.status === 'interview_invited' ? 'badge-warning text-white' :
                        'badge-neutral text-white'
                      }`}>
                        {app.status}
                      </span>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-base-200 text-xs">
                      <span className="font-bold text-primary">
                        ₹{app.pay_amount?.toLocaleString('en-IN')} / {app.pay_unit || 'month'}
                      </span>
                      <span className="text-[11px] text-success font-semibold flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Match Score: {app.match_score || 90}%
                      </span>
                    </div>

                    <div className="flex justify-end pt-1">
                      <button
                        type="button"
                        onClick={() => handleCancelApplication(app.id)}
                        className="btn btn-ghost btn-xs text-error text-[11px] rounded-lg hover:bg-error/10"
                      >
                        Withdraw Application
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

      </div>

    </div>
  );
}
