import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Sparkles, 
  Layers, 
  Briefcase, 
  TrendingUp, 
  ShieldCheck, 
  Clock, 
  CheckCircle2, 
  ArrowRight, 
  Plus,
  Package,
  Calendar,
  AlertCircle,
  Users
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLocation } from '../context/LocationContext';
import api from '../api/client';
import OpportunityDeck from '../components/opportunity/OpportunityDeck';
import ErrorAlert from '../components/common/ErrorAlert';
import LoadingSpinner from '../components/common/LoadingSpinner';

export default function SeniorDashboardPage() {
  const { user } = useAuth();
  const { selectedCity, activeFestival } = useLocation();

  const [deck, setDeck] = useState([]);
  const [activeApps, setActiveApps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [toastMsg, setToastMsg] = useState('');

  const fetchData = async () => {
    setLoading(true);
    setError('');
    try {
      const [deckData, appsData] = await Promise.all([
        api.get('/opportunities/deck'),
        api.get('/opportunities/my-applications')
      ]);
      setDeck(deckData || []);
      setActiveApps(appsData || []);
    } catch (err) {
      setError(err.message || 'Failed to load opportunities');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSwipe = async (oppId, action) => {
    try {
      const res = await api.post(`/opportunities/${oppId}/swipe`, { action });
      setToastMsg(res.message);
      setTimeout(() => setToastMsg(''), 3500);

      // Refresh applications list
      const updatedApps = await api.get('/opportunities/my-applications');
      setActiveApps(updatedApps || []);
    } catch (err) {
      console.error('Swipe error:', err);
    }
  };

  const handleResetDeck = async () => {
    try {
      await api.post('/opportunities/reset-deck');
      fetchData();
    } catch (err) {
      console.error('Reset error:', err);
    }
  };

  return (
    <div className="space-y-8 pb-12">
      
      {/* Toast notification */}
      {toastMsg && (
        <div className="toast toast-top toast-center z-50">
          <div className="alert alert-success text-white font-bold text-xs shadow-lg rounded-xl flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" />
            <span>{toastMsg}</span>
          </div>
        </div>
      )}

      {/* Header Profile Summary */}
      <div className="bg-base-100 border border-base-300 rounded-3xl p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="badge badge-success badge-sm text-white font-bold gap-1 text-[10px]">
              <ShieldCheck className="w-3 h-3" /> Age Verified Senior
            </span>
            <span className="text-xs text-base-content/60 font-medium">
              📍 {selectedCity.name} • Travel Radius: 5 km
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-base-content">
            Vanakkam, {user?.full_name || 'Senior Guru'}!
          </h1>
          <p className="text-xs sm:text-sm text-base-content/70">
            Here are today’s curated nearby opportunities and your active livelihood work.
          </p>
        </div>

        {/* Quick Links */}
        <div className="flex items-center gap-2">
          <Link to="/senior/onboarding" className="btn btn-outline btn-primary btn-sm rounded-xl text-xs font-bold gap-1">
            <Sparkles className="w-3.5 h-3.5" /> Re-tune Skills
          </Link>
          <Link to="/senior/earnings" className="btn btn-primary btn-sm text-white rounded-xl font-bold text-xs gap-1 shadow-sm">
            <TrendingUp className="w-3.5 h-3.5" /> View Earnings
          </Link>
        </div>
      </div>

      <ErrorAlert message={error} onRetry={fetchData} />

      {/* "What Should I Do Now?" AI Focus Banner */}
      <div className="bg-gradient-to-r from-secondary/15 via-base-100 to-primary/15 border border-secondary/30 rounded-2xl p-4 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-secondary/20 flex items-center justify-center text-xl shrink-0">
            💡
          </div>
          <div className="text-xs">
            <span className="font-bold text-secondary uppercase tracking-wider block">Recommended Action Now</span>
            <p className="font-semibold text-base-content">
              {activeFestival} is coming up in {selectedCity.name}! Local MSMEs & shops within 3 km are seeking seasonal bookkeeping & traditional food boxes.
            </p>
          </div>
        </div>
        <Link to="/community" className="btn btn-secondary btn-xs rounded-lg font-bold shrink-0 self-end sm:self-auto">
          Explore Local Needs <ArrowRight className="w-3 h-3" />
        </Link>
      </div>

      {/* Main Grid: Opportunity Deck (Left) & Active Work (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Col: Opportunity Swipe Deck */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Layers className="w-5 h-5 text-warning" />
              <h2 className="text-lg font-bold text-base-content">My Opportunity Deck</h2>
            </div>
            <span className="text-xs text-base-content/60 font-semibold">
              {deck.length} Matches Available
            </span>
          </div>

          <OpportunityDeck 
            opportunities={deck} 
            onSwipe={handleSwipe} 
            onReset={handleResetDeck}
            loading={loading}
          />
        </div>

        {/* Right Col: Active Work & Applications */}
        <div className="lg:col-span-5 space-y-6">
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Briefcase className="w-5 h-5 text-primary" />
              <h2 className="text-lg font-bold text-base-content">My Active Work & Jobs</h2>
            </div>
            <span className="badge badge-primary badge-sm font-bold text-white">
              {activeApps.length} Active
            </span>
          </div>

          {activeApps.length === 0 ? (
            <div className="bg-base-100 rounded-3xl border border-base-300 p-6 text-center space-y-3 shadow-xs">
              <div className="w-12 h-12 rounded-full bg-base-200 flex items-center justify-center mx-auto text-base-content/50">
                <Briefcase className="w-6 h-6" />
              </div>
              <h4 className="font-bold text-sm text-base-content">No accepted work yet</h4>
              <p className="text-xs text-base-content/60 max-w-xs mx-auto">
                Swipe right on any card in the Opportunity Deck to express interest and take on work!
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {activeApps.map((app) => (
                <div 
                  key={app.id}
                  className="card bg-base-100 border border-base-300 shadow-xs rounded-2xl p-4 space-y-2 hover:border-primary/40 transition-colors"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="badge badge-xs badge-success text-white font-bold mb-1">
                        {app.status === 'accepted' ? 'Accepted & Active' : 'Application Sent'}
                      </span>
                      <h4 className="text-sm font-bold text-base-content leading-snug">
                        {app.opportunity_title}
                      </h4>
                      <p className="text-[11px] text-base-content/60">
                        {app.posted_by_name}
                      </p>
                    </div>

                    <span className="text-sm font-bold text-success shrink-0">
                      ₹{app.pay_amount.toLocaleString('en-IN')}/{app.pay_unit}
                    </span>
                  </div>

                  <div className="pt-2 border-t border-base-200 flex items-center justify-between text-[11px] text-base-content/70">
                    <span className="flex items-center gap-1 font-medium text-primary">
                      <Sparkles className="w-3 h-3" /> {app.match_score}% Match
                    </span>
                    <span className="text-base-content/50">
                      {new Date(app.applied_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Complementary Skills Collaboration Teaser */}
          <div className="card bg-gradient-to-tr from-primary/10 via-base-100 to-accent/10 border border-primary/20 rounded-3xl p-5 space-y-3 shadow-xs">
            <div className="flex items-center gap-2 text-primary font-bold text-xs uppercase tracking-wider">
              <Users className="w-4 h-4" />
              Complementary Senior Match
            </div>
            <h4 className="text-sm font-bold text-base-content">
              Partner with Lakshmi Venkatesh (Mylapore)
            </h4>
            <p className="text-xs text-base-content/75 leading-relaxed">
              Lakshmi has 40 years mastery in traditional pickles and festival sweets. Combined with your accounting and GST skills, you could co-launch a local food venture in Chennai!
            </p>
            <Link to="/community" className="btn btn-primary btn-xs rounded-lg text-white font-bold gap-1 self-start">
              Explore Collaboration <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

        </div>

      </div>

    </div>
  );
}
