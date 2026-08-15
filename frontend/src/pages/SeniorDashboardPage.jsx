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
  Users,
  ShoppingBag,
  BookOpen
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLocation } from '../context/LocationContext';
import api from '../api/client';
import OpportunityDeck from '../components/opportunity/OpportunityDeck';
import AddServiceModal from '../components/modals/AddServiceModal';
import AddProductModal from '../components/modals/AddProductModal';
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

  // Modals for Offer Service & Sell Product
  const [showServiceModal, setShowServiceModal] = useState(false);
  const [showProductModal, setShowProductModal] = useState(false);

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
  }, [selectedCity?.name]);

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
              <ShieldCheck className="w-3.5 h-3.5" /> Age Verified Senior
            </span>
            <span className="text-xs text-base-content/60 font-medium">
              📍 {selectedCity?.name || 'Chennai'} • Travel Radius: 5 km
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-base-content">
            Vanakkam, {user?.full_name || 'Senior Guru'}!
          </h1>
          <p className="text-xs sm:text-sm text-base-content/70">
            Swipe matching neighborhood livelihood opportunities, or launch your own managed tuition & homemade products.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2">
          <button 
            type="button"
            onClick={() => setShowServiceModal(true)}
            className="btn btn-accent btn-sm rounded-xl text-white font-bold text-xs gap-1.5 shadow-sm"
          >
            <Sparkles className="w-3.5 h-3.5" /> Offer a Service
          </button>
          <button 
            type="button"
            onClick={() => setShowProductModal(true)}
            className="btn btn-secondary btn-sm rounded-xl text-white font-bold text-xs gap-1.5 shadow-sm"
          >
            <ShoppingBag className="w-3.5 h-3.5" /> Sell Product
          </button>
          <Link to="/senior/earnings" className="btn btn-primary btn-sm text-white rounded-xl font-bold text-xs gap-1 shadow-sm">
            <TrendingUp className="w-3.5 h-3.5" /> My Earnings
          </Link>
        </div>
      </div>

      <ErrorAlert message={error} onRetry={fetchData} />

      {/* AI Livelihood Quick Generator Hub */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="card bg-gradient-to-r from-accent/15 via-base-100 to-base-100 border border-accent/30 rounded-3xl p-5 shadow-xs flex flex-col justify-between space-y-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="badge badge-accent badge-sm font-bold text-white uppercase text-[10px]">Managed Tuition & Consulting</span>
            </div>
            <h3 className="font-extrabold text-base text-base-content">Teach Spoken Language or Consult</h3>
            <p className="text-xs text-base-content/70">
              Create a personalized learning package in minutes with AI. SilverHands manages student bookings and video links.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setShowServiceModal(true)}
            className="btn btn-accent btn-sm rounded-xl text-white font-bold text-xs gap-1.5 self-start"
          >
            <Sparkles className="w-3.5 h-3.5" /> Create Service Offering with AI
          </button>
        </div>

        <div className="card bg-gradient-to-r from-secondary/15 via-base-100 to-base-100 border border-secondary/30 rounded-3xl p-5 shadow-xs flex flex-col justify-between space-y-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="badge badge-secondary badge-sm font-bold text-white uppercase text-[10px]">Artisanal Marketplace</span>
            </div>
            <h3 className="font-extrabold text-base text-base-content">Sell Homemade Pickles, Sweets & Crafts</h3>
            <p className="text-xs text-base-content/70">
              List your authentic delicacies or bespoke tailoring for {activeFestival}. AI drafts your story and optimal price.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setShowProductModal(true)}
            className="btn btn-secondary btn-sm rounded-xl text-white font-bold text-xs gap-1.5 self-start"
          >
            <ShoppingBag className="w-3.5 h-3.5" /> List Product with AI
          </button>
        </div>
      </div>

      {/* Main Opportunity Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left: Tinder-style Swipe Deck */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Layers className="w-5 h-5 text-primary" />
              <h2 className="text-lg font-extrabold text-base-content">Nearby Opportunities For You</h2>
            </div>
            <span className="text-xs text-base-content/60 font-semibold">
              {deck.length} Available
            </span>
          </div>

          <OpportunityDeck 
            opportunities={deck} 
            onSwipe={handleSwipe} 
            loading={loading} 
            onResetDeck={handleResetDeck}
          />
        </div>

        {/* Right: Active Work & Applications */}
        <div className="lg:col-span-5 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Briefcase className="w-5 h-5 text-secondary" />
              <h2 className="text-lg font-extrabold text-base-content">My Active Work & Matches</h2>
            </div>
            <span className="badge badge-primary badge-sm font-bold">{activeApps.length}</span>
          </div>

          {activeApps.length === 0 ? (
            <div className="bg-base-100 rounded-3xl border border-base-300 p-8 text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-base-200 flex items-center justify-center mx-auto text-base-content/40">
                <Briefcase className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-sm text-base-content">No active work yet</h3>
              <p className="text-xs text-base-content/60">
                Swipe right on opportunities in the deck or offer a service above to get started.
              </p>
            </div>
          ) : (
            <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
              {activeApps.map((app) => (
                <div 
                  key={app.id}
                  className="bg-base-100 border border-base-300 rounded-2xl p-4 shadow-xs hover:shadow-sm transition-all space-y-2.5"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h4 className="font-bold text-sm text-base-content">{app.opportunity_title}</h4>
                      <p className="text-xs text-base-content/60">Posted by {app.posted_by_name}</p>
                    </div>
                    <span className="badge badge-success badge-sm font-bold text-white text-[10px] uppercase">
                      {app.status}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-xs pt-1 border-t border-base-200">
                    <span className="font-extrabold text-primary">
                      ₹{app.pay_amount?.toLocaleString('en-IN')}/{app.pay_unit}
                    </span>
                    <span className="text-[11px] text-base-content/60">
                      {app.match_score}% Skill Match
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>

      {/* Modals */}
      <AddServiceModal
        isOpen={showServiceModal}
        onClose={() => setShowServiceModal(false)}
        onServiceCreated={() => {
          setToastMsg('Service offering published successfully!');
          setTimeout(() => setToastMsg(''), 3500);
        }}
      />

      <AddProductModal
        isOpen={showProductModal}
        onClose={() => setShowProductModal(false)}
        onProductCreated={() => {
          setToastMsg('Homemade product listed in store successfully!');
          setTimeout(() => setToastMsg(''), 3500);
        }}
      />

    </div>
  );
}
