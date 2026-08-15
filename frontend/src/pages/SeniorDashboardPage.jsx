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
  BookOpen,
  Video,
  ExternalLink,
  Check,
  Award
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
  const [seniorSessions, setSeniorSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [toastMsg, setToastMsg] = useState('');
  const [skillTwins, setSkillTwins] = useState([]);

  // Modals for Offer Service & Sell Product
  const [showServiceModal, setShowServiceModal] = useState(false);
  const [showProductModal, setShowProductModal] = useState(false);

  const [seniorFestivalSuggestions, setSeniorFestivalSuggestions] = useState(null);

  const fetchData = async () => {
    setLoading(true);
    setError('');
    try {
      const [deckData, appsData, sessionsData, twinsData, festData] = await Promise.all([
        api.get('/opportunities/deck').catch(() => []),
        api.get('/opportunities/my-applications').catch(() => []),
        api.get('/services/bookings/senior-sessions').catch(() => []),
        api.get('/senior/twins').catch(() => []),
        api.get('/festival/suggestions?role=senior').catch(() => null)
      ]);
      setDeck(deckData || []);
      setActiveApps(appsData || []);
      setSeniorSessions(sessionsData || []);
      setSkillTwins(twinsData || []);
      setSeniorFestivalSuggestions(festData);
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
      setToastMsg(res.message || 'Updated');
      setTimeout(() => setToastMsg(''), 3500);

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
      fetchData();
    } catch (err) {
      console.error('Reset error:', err);
    }
  };

  // Senior Accepts or Completes a Service Booking
  const handleUpdateBookingStatus = async (bookingId, newStatus) => {
    try {
      const payload = {
        status: newStatus,
        meeting_link: `https://meet.silverhands.in/room-${Math.floor(100000 + Math.random() * 900000)}`
      };
      await api.put(`/services/bookings/${bookingId}/status`, payload);
      setToastMsg(`Booking marked as ${newStatus}!`);
      setTimeout(() => setToastMsg(''), 3500);
      
      const updatedSessions = await api.get('/services/bookings/senior-sessions');
      setSeniorSessions(updatedSessions || []);
    } catch (err) {
      setError(err.message || 'Failed to update booking status.');
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
      <div className="card bg-gradient-to-r from-primary/10 via-base-100 to-secondary/10 border border-base-300 rounded-3xl p-6 sm:p-8 shadow-sm">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-5">
          
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-primary text-white flex items-center justify-center text-2xl font-extrabold shadow-md shrink-0">
              {user?.full_name?.charAt(0) || 'S'}
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-xl sm:text-2xl font-extrabold text-base-content">
                  Vanakkam, {user?.full_name || 'Senior Guru'}!
                </h1>
                <span className="badge badge-primary font-bold text-white gap-1 text-xs px-2.5 py-1">
                  <ShieldCheck className="w-3.5 h-3.5" /> Verified Senior
                </span>
              </div>
              <p className="text-xs sm:text-sm text-base-content/70 mt-1">
                Active in <strong>{user?.locality || selectedCity?.name || 'Chennai'}</strong> • Travel Radius: <strong>{user?.travel_radius || '5 km'}</strong> • {activeFestival} Edition Active 🪔
              </p>
            </div>
          </div>

          {/* Quick Action Buttons with accessible 44px min height */}
          <div className="flex flex-wrap items-center gap-2.5 w-full lg:w-auto">
            <Link to="/senior/passport" className="btn btn-outline btn-warning min-h-[44px] px-4 rounded-2xl font-bold text-xs sm:text-sm gap-2 shadow-xs">
              <Award className="w-4 h-4 text-warning" /> Skill Passport
            </Link>
            <Link to="/senior/services" className="btn btn-outline btn-accent min-h-[44px] px-4 rounded-2xl font-bold text-xs sm:text-sm gap-2">
              <BookOpen className="w-4 h-4 text-accent" /> Manage Classes
            </Link>
            <Link to="/senior/earnings" className="btn btn-outline btn-neutral min-h-[44px] px-4 rounded-2xl font-bold text-xs sm:text-sm gap-2">
              <TrendingUp className="w-4 h-4 text-success" /> View Earnings
            </Link>
            <Link to="/senior/orders" className="btn btn-outline btn-primary min-h-[44px] px-4 rounded-2xl font-bold text-xs sm:text-sm gap-2">
              <Package className="w-4 h-4 text-primary" /> Store Orders
            </Link>
          </div>

        </div>
      </div>

      <ErrorAlert message={error} />

      {/* FESTIVE GIG OPPORTUNITIES FOR SENIOR (Date-Aware) */}
      {seniorFestivalSuggestions && seniorFestivalSuggestions.suggestions && seniorFestivalSuggestions.suggestions.length > 0 && (
        <div className="card bg-gradient-to-r from-warning/15 via-base-100 to-secondary/15 border-2 border-warning/30 rounded-3xl p-6 shadow-sm space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center gap-2.5">
              <span className="text-2xl">{seniorFestivalSuggestions.festival_icon || '🪔'}</span>
              <div>
                <h3 className="font-extrabold text-base text-base-content">
                  {seniorFestivalSuggestions.festival_name} Surge Preparation (Starts {seniorFestivalSuggestions.days_until >= 0 ? `in ${seniorFestivalSuggestions.days_until} days` : 'now'})
                </h3>
                <p className="text-xs text-base-content/70">
                  Customers in {selectedCity?.name || 'your area'} are actively searching for festive specialties! Earn {Math.round((seniorFestivalSuggestions.surge_multiplier - 1) * 100)}% festive surge bonus.
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
            {seniorFestivalSuggestions.suggestions.map((sug, sidx) => (
              <div key={sidx} className="bg-base-100/90 border border-warning/30 rounded-2xl p-3 space-y-1">
                <span className="text-xs font-bold text-warning-content flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-warning" /> High Demand Idea #{sidx + 1}
                </span>
                <p className="text-xs text-base-content/80 font-medium leading-relaxed">{sug}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Senior Micro-Gig Creator Buttons with accessible 44px+ min touch targets */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        
        {/* Sell Homemade Products */}
        <div className="card bg-base-100 border-2 border-secondary/20 hover:border-secondary/50 rounded-3xl p-6 shadow-xs transition-all flex flex-col justify-between space-y-4">
          <div className="flex items-start gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-secondary/15 text-secondary flex items-center justify-center font-bold shrink-0 text-xl">
              <ShoppingBag className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-extrabold text-lg text-base-content">Sell Homemade Products</h3>
              <p className="text-xs sm:text-sm text-base-content/70 mt-1">
                List festive sweets, traditional pickles, tailored clothes, or handloom crafts with 0% platform commission.
              </p>
            </div>
          </div>
          <button 
            type="button" 
            onClick={() => setShowProductModal(true)}
            className="btn btn-secondary min-h-[44px] rounded-2xl text-white font-bold text-sm gap-2 shadow-xs"
          >
            <Plus className="w-4 h-4" /> Create Product Listing with Gemini AI
          </button>
        </div>

        {/* Offer Mentoring or Tuition */}
        <div className="card bg-base-100 border-2 border-accent/20 hover:border-accent/50 rounded-3xl p-6 shadow-xs transition-all flex flex-col justify-between space-y-4">
          <div className="flex items-start gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-accent/15 text-accent flex items-center justify-center font-bold shrink-0 text-xl">
              <BookOpen className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-extrabold text-lg text-base-content">Offer 1-on-1 Classes & Mentoring</h3>
              <p className="text-xs sm:text-sm text-base-content/70 mt-1">
                Offer regional language lessons (Tamil, Telugu, Hindi), bookkeeping advisory, gardening, or heritage cooking masterclasses.
              </p>
            </div>
          </div>
          <button 
            type="button" 
            onClick={() => setShowServiceModal(true)}
            className="btn btn-accent min-h-[44px] rounded-2xl text-white font-bold text-sm gap-2 shadow-xs"
          >
            <Plus className="w-4 h-4" /> Publish Class / Service Bouquet
          </button>
        </div>

      </div>

      {/* Main Opportunity Deck & Active Work */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left: Swipe Deck */}
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

        {/* Right: Active Work, Interview Invites & Service Bookings */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* 1. Incoming Teaching & Service Bookings */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-accent" />
                <h2 className="text-base font-extrabold text-base-content">Student & Client Bookings</h2>
              </div>
              <span className="badge badge-accent badge-sm font-bold text-white">{seniorSessions.length}</span>
            </div>

            {seniorSessions.length === 0 ? (
              <div className="bg-base-100 rounded-3xl border border-base-300 p-6 text-center space-y-2">
                <BookOpen className="w-8 h-8 text-base-content/30 mx-auto" />
                <p className="text-xs text-base-content/60">No pending student session bookings right now.</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-[350px] overflow-y-auto pr-1">
                {seniorSessions.map((session) => (
                  <div key={session.id} className="bg-base-100 border border-base-300 rounded-2xl p-4 shadow-xs space-y-2.5">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <span className="font-mono text-[10px] font-bold text-accent">{session.booking_reference}</span>
                        <h4 className="font-bold text-sm text-base-content">{session.service_title}</h4>
                        <p className="text-xs text-base-content/70">Student: <strong>{session.student_name}</strong> ({session.student_age_group})</p>
                        <p className="text-[11px] text-base-content/60">Time: {session.scheduled_slot}</p>
                      </div>
                      <span className="badge badge-sm uppercase font-bold text-[10px] badge-accent text-white">
                        {session.status}
                      </span>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-base-200">
                      <span className="font-extrabold text-primary text-xs">
                        ₹{session.total_amount?.toLocaleString('en-IN')} ({session.sessions_count} sessions)
                      </span>
                      
                      <div className="flex items-center gap-1.5">
                        {session.status === 'requested' && (
                          <button
                            type="button"
                            onClick={() => handleUpdateBookingStatus(session.id, 'scheduled')}
                            className="btn btn-accent btn-xs rounded-lg text-white font-bold gap-1"
                          >
                            <Check className="w-3 h-3" /> Accept & Schedule
                          </button>
                        )}

                        {session.status === 'scheduled' && (
                          <>
                            {session.meeting_link && (
                              <a
                                href={session.meeting_link}
                                target="_blank"
                                rel="noreferrer"
                                className="btn btn-primary btn-xs rounded-lg text-white font-bold gap-1"
                              >
                                <Video className="w-3 h-3" /> Start Video Classroom
                              </a>
                            )}
                            <button
                              type="button"
                              onClick={() => handleUpdateBookingStatus(session.id, 'completed')}
                              className="btn btn-success btn-xs rounded-lg text-white font-bold"
                            >
                              Complete
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 2. Corporate Job Matches & Interview Invitations */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Briefcase className="w-5 h-5 text-secondary" />
                <h2 className="text-base font-extrabold text-base-content">Interview Invites & Active Work</h2>
              </div>
              <span className="badge badge-primary badge-sm font-bold">{activeApps.length}</span>
            </div>

            {activeApps.length === 0 ? (
              <div className="bg-base-100 rounded-3xl border border-base-300 p-6 text-center space-y-2">
                <Briefcase className="w-8 h-8 text-base-content/30 mx-auto" />
                <p className="text-xs text-base-content/60">No corporate work matches yet. Swipe right on the deck to apply.</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-[350px] overflow-y-auto pr-1">
                {activeApps.map((app) => (
                  <div key={app.id} className="bg-base-100 border border-base-300 rounded-2xl p-4 shadow-xs space-y-2.5">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h4 className="font-bold text-sm text-base-content">{app.opportunity_title}</h4>
                        <p className="text-xs text-base-content/60">Company: {app.posted_by_name}</p>
                      </div>
                      <span className={`badge badge-sm font-bold text-white text-[10px] uppercase ${app.status === 'interview_invited' ? 'badge-secondary' : 'badge-success'}`}>
                        {app.status === 'interview_invited' ? '🎉 Interview Invited' : app.status}
                      </span>
                    </div>

                    {app.interview_link && (
                      <div className="bg-secondary/10 p-2.5 rounded-xl border border-secondary/20 space-y-1">
                        <span className="text-[11px] font-bold text-secondary flex items-center gap-1">
                          <Video className="w-3.5 h-3.5" /> Scheduled Interview: {app.interview_date || 'Upcoming Slot'}
                        </span>
                        <a
                          href={app.interview_link}
                          target="_blank"
                          rel="noreferrer"
                          className="btn btn-secondary btn-xs rounded-lg text-white font-bold w-full gap-1"
                        >
                          Join Corporate Video Interview <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    )}

                    <div className="flex items-center justify-between text-xs pt-1 border-t border-base-200">
                      <span className="font-extrabold text-primary">
                        ₹{app.pay_amount?.toLocaleString('en-IN')}/{app.pay_unit}
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] text-base-content/60">
                          {app.match_score}% Match
                        </span>
                        <button
                          type="button"
                          onClick={async () => {
                            if (!window.confirm('Withdraw this application / interview?')) return;
                            try {
                              await api.put(`/opportunities/applications/${app.id}/cancel`);
                              setToastMsg('Application withdrawn.');
                              setTimeout(() => setToastMsg(''), 3000);
                              fetchData();
                            } catch (err) {
                              setError(err.message || 'Failed to withdraw');
                            }
                          }}
                          className="btn btn-ghost btn-xs text-error font-bold rounded-lg text-[10px]"
                        >
                          Withdraw
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

      </div>

      {/* 3. Skill-Twin Peer Collaborators */}
      {skillTwins.length > 0 && (
        <div className="card bg-gradient-to-r from-accent/5 via-base-100 to-primary/5 border border-base-300 rounded-3xl p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-accent" />
            <h2 className="text-base font-extrabold text-base-content">Skill-Twin Peer Collaborators</h2>
            <span className="badge badge-accent badge-sm font-bold text-white">{skillTwins.length}</span>
          </div>
          <p className="text-xs text-base-content/60">Seniors with complementary skills matched by Gemini AI for potential joint ventures.</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {skillTwins.map((twin, idx) => (
              <div key={idx} className="bg-base-100 border border-base-300 rounded-2xl p-4 shadow-xs space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-sm text-base-content">{twin.peer_name}</h4>
                  <span className="badge badge-primary badge-sm font-bold text-white">{twin.synergy_score}% Synergy</span>
                </div>
                <p className="text-xs text-base-content/70 font-semibold">{twin.venture_title}</p>
                <p className="text-[11px] text-base-content/60">{twin.rationale}</p>
                <div className="flex flex-wrap gap-1 pt-1">
                  {(twin.shared_keywords || []).slice(0, 4).map((kw, ki) => (
                    <span key={ki} className="badge badge-ghost badge-xs text-[9px] font-medium">#{kw}</span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modals */}
      <AddServiceModal
        isOpen={showServiceModal}
        onClose={() => setShowServiceModal(false)}
        onServiceCreated={() => {
          setToastMsg('Service offering published successfully!');
          setTimeout(() => setToastMsg(''), 3500);
          fetchData();
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
