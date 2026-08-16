import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Sparkles, 
  BookOpen, 
  Video, 
  Calendar, 
  CheckCircle2, 
  Clock, 
  Plus, 
  Check, 
  X, 
  ExternalLink, 
  Layers, 
  ArrowLeft,
  AlertCircle,
  TrendingUp,
  Users,
  Archive,
  RefreshCw,
  Award,
  Phone,
  ShieldCheck,
  CalendarCheck2,
  Lock,
  Unlock,
  Trash2,
  Star
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLocation } from '../context/LocationContext';
import api from '../api/client';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ErrorAlert from '../components/common/ErrorAlert';
import AddServiceModal from '../components/modals/AddServiceModal';
import StatusFlowBar from '../components/common/StatusFlowBar';
import ServiceBookingSwipeDeck from '../components/services/ServiceBookingSwipeDeck';

const STANDARD_TIME_SLOTS = [
  'Morning (9:00 AM – 10:00 AM)',
  'Morning (10:00 AM – 11:00 AM)',
  'Afternoon (2:00 PM – 3:00 PM)',
  'Evening (4:00 PM – 5:00 PM)',
  'Evening (5:00 PM – 6:00 PM)',
  'Night (7:00 PM – 8:00 PM)'
];

export default function SeniorManageServicesPage() {
  const { user } = useAuth();
  const { selectedCity } = useLocation();

  const [offerings, setOfferings] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [toastMsg, setToastMsg] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  
  // Tab: 'offerings' | 'booking_requests' | 'active_sessions' | 'slot_schedule' | 'history'
  const [activeTab, setActiveTab] = useState('active_sessions');
  const [updatingId, setUpdatingId] = useState(null);

  const fetchData = async () => {
    setLoading(true);
    setError('');
    try {
      const [offeringsData, bookingsData] = await Promise.all([
        api.get('/services/my-offerings').catch(() => []),
        api.get('/services/bookings/senior-sessions').catch(() => [])
      ]);
      setOfferings(offeringsData || []);
      setBookings(bookingsData || []);
    } catch (err) {
      setError(err.message || 'Failed to load services data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [selectedCity?.name]);

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 3500);
  };

  // Accept booking (transitions to active pipeline)
  const handleAcceptBooking = async (bookingId) => {
    setUpdatingId(bookingId);
    try {
      const payload = {
        status: 'accepted',
        meeting_link: `https://meet.silverhands.in/room-${Math.floor(100000 + Math.random() * 900000)}`
      };
      await api.put(`/services/bookings/${bookingId}/status`, payload);
      showToast('🎉 Student booking accepted! Slot locked with zero clashes.');
      fetchData();
    } catch (err) {
      setError(err.message || 'Failed to accept booking');
    } finally {
      setUpdatingId(null);
    }
  };

  // Decline / Cancel booking
  const handleCancelBooking = async (bookingId) => {
    if (!window.confirm('Are you sure you want to decline / cancel this class booking?')) return;
    setUpdatingId(bookingId);
    try {
      await api.put(`/services/bookings/${bookingId}/cancel`, {});
      showToast('Booking cancelled & slot freed.');
      fetchData();
    } catch (err) {
      setError(err.message || 'Failed to cancel session');
    } finally {
      setUpdatingId(null);
    }
  };

  // Mark session progress (1/N, 2/N, N/N)
  const handleMarkClassProgress = async (bookingId, currentCompleted, totalSessions) => {
    const nextCompleted = currentCompleted + 1;
    setUpdatingId(bookingId);
    try {
      await api.put(`/services/bookings/${bookingId}/progress`, {
        completed_sessions: nextCompleted
      });
      if (nextCompleted >= totalSessions) {
        showToast(`🎉 All ${totalSessions} classes completed! Payout settled to your earnings ledger.`);
      } else {
        showToast(`Class marked! Progress: ${nextCompleted} of ${totalSessions} completed.`);
      }
      fetchData();
    } catch (err) {
      setError(err.message || 'Failed to update progress');
    } finally {
      setUpdatingId(null);
    }
  };

  // Delete service offering
  const handleDeleteService = async (serviceId) => {
    if (!window.confirm('Are you sure you want to delete this offered class listing? It will be removed from the catalog.')) return;
    try {
      await api.delete(`/services/${serviceId}`);
      showToast('Class offering deleted successfully.');
      fetchData();
    } catch (err) {
      setError(err.message || 'Failed to delete service offering');
    }
  };

  // Segregated Booking Groups
  const pendingRequests = bookings.filter(b => b.status === 'requested');
  const activeSessions = bookings.filter(b => ['accepted', 'scheduled', 'in_progress'].includes(b.status));
  const historyBookings = bookings.filter(b => ['completed', 'cancelled'].includes(b.status));

  // Clustered Grouping by Service Title
  const groupedActiveByService = activeSessions.reduce((acc, booking) => {
    const title = booking.service_title || 'General Mentoring';
    if (!acc[title]) acc[title] = [];
    acc[title].push(booking);
    return acc;
  }, {});

  // Slot Management Map: Slot -> Student info
  const slotOccupancyMap = STANDARD_TIME_SLOTS.reduce((acc, slot) => {
    const occupant = activeSessions.find(b => b.scheduled_slot?.includes(slot) || slot.includes(b.scheduled_slot));
    acc[slot] = occupant || null;
    return acc;
  }, {});

  if (loading && offerings.length === 0 && bookings.length === 0) {
    return <LoadingSpinner message="Opening your Service Hub & Live Class Manager..." />;
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-16">
      
      {/* Toast */}
      {toastMsg && (
        <div className="toast toast-top toast-center z-50">
          <div className="alert alert-success text-white font-bold text-xs shadow-lg rounded-2xl flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" />
            <span>{toastMsg}</span>
          </div>
        </div>
      )}

      {/* Header Banner */}
      <div className="bg-gradient-to-r from-accent/15 via-base-100 to-primary/15 border border-accent/20 rounded-3xl p-6 sm:p-8 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="badge badge-accent badge-sm font-extrabold text-white uppercase text-[10px] tracking-wider px-2.5 py-2">
                🎓 Service Hub & Class Manager
              </span>
              <span className="badge badge-accent badge-outline badge-sm font-bold text-[10px]">
                Automatic Slot Conflict Prevention Active
              </span>
              <span className="badge badge-primary badge-sm text-white font-bold text-[10px] flex items-center gap-1">
                <ShieldCheck className="w-3 h-3" /> Senior Guru Verified
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-base-content tracking-tight">
              {user?.full_name || 'Senior Guru'}'s Service Hub
            </h1>
            <p className="text-xs sm:text-sm text-base-content/70 max-w-2xl leading-relaxed">
              Teach languages, slokas, Vedic math, music, career advisory, and bookkeeping. All enrolled students are grouped under each class title with automated slot scheduling to prevent calendar clashes.
            </p>
          </div>

          <div className="flex flex-wrap sm:flex-nowrap items-center gap-2.5 shrink-0">
            <button
              type="button"
              onClick={() => setShowAddModal(true)}
              className="btn btn-accent min-h-[48px] px-6 rounded-2xl text-white font-extrabold text-xs sm:text-sm gap-2 shadow-md hover:scale-[1.02] transition-transform flex-1 sm:flex-none"
            >
              <BookOpen className="w-4 h-4" /> + Offer a Class (AI Assisted)
            </button>
            <button
              type="button"
              onClick={fetchData}
              className="btn btn-ghost min-h-[48px] w-12 rounded-2xl border border-base-300 hover:bg-base-200"
              title="Refresh Classes"
              aria-label="Refresh Classes"
            >
              <RefreshCw className="w-4 h-4 text-base-content/70" />
            </button>
          </div>
        </div>
      </div>

      <ErrorAlert message={error} onRetry={fetchData} />

      {/* Main Navigation Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 text-sm border-b border-base-200">
        <button
          type="button"
          onClick={() => setActiveTab('active_sessions')}
          className={`min-h-[44px] px-5 py-2.5 rounded-2xl font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'active_sessions'
              ? 'bg-primary text-white shadow-md'
              : 'bg-base-200/60 hover:bg-base-200 text-base-content/75'
          }`}
        >
          <Video className="w-4 h-4" />
          Enrolled Classes ({activeSessions.length} Enrolled)
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('booking_requests')}
          className={`min-h-[44px] px-5 py-2.5 rounded-2xl font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'booking_requests'
              ? 'bg-warning text-white shadow-md'
              : 'bg-base-200/60 hover:bg-base-200 text-base-content/75'
          }`}
        >
          <Clock className="w-4 h-4" />
          Incoming Booking Deck ({pendingRequests.length})
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('slot_schedule')}
          className={`min-h-[44px] px-5 py-2.5 rounded-2xl font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'slot_schedule'
              ? 'bg-accent text-white shadow-md'
              : 'bg-base-200/60 hover:bg-base-200 text-base-content/75'
          }`}
        >
          <CalendarCheck2 className="w-4 h-4" />
          Slot Management & Clash Board
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('offerings')}
          className={`min-h-[44px] px-5 py-2.5 rounded-2xl font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'offerings'
              ? 'bg-secondary text-white shadow-md'
              : 'bg-base-200/60 hover:bg-base-200 text-base-content/75'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          My Published Offerings ({offerings.length})
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('history')}
          className={`min-h-[44px] px-5 py-2.5 rounded-2xl font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'history'
              ? 'bg-neutral text-neutral-content shadow-md'
              : 'bg-base-200/60 hover:bg-base-200 text-base-content/75'
          }`}
        >
          <Archive className="w-4 h-4" />
          Completed Courses ({historyBookings.length})
        </button>
      </div>

      {/* TAB 1: ACTIVE TEACHING PIPELINE — CLUSTERED / GROUPED BY SERVICE TITLE */}
      {activeTab === 'active_sessions' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between pb-2 border-b border-base-200">
            <div>
              <h2 className="text-lg font-black text-base-content flex items-center gap-2">
                <Video className="w-5 h-5 text-primary" />
                Active Teaching Pipeline (Grouped by Course Title)
              </h2>
              <p className="text-xs text-base-content/60">
                All enrolled students are clustered under their respective course offering.
              </p>
            </div>
            <span className="badge badge-primary badge-sm font-bold text-white">
              {Object.keys(groupedActiveByService).length} Active Courses ({activeSessions.length} Students)
            </span>
          </div>

          {Object.keys(groupedActiveByService).length === 0 ? (
            <div className="card bg-base-100 border border-base-300 rounded-3xl p-10 text-center space-y-3">
              <div className="text-4xl">👩‍🏫</div>
              <h3 className="font-extrabold text-base text-base-content">No active student batches enrolled</h3>
              <p className="text-xs text-base-content/60 max-w-sm mx-auto">
                Once you accept student booking requests from the review swipe deck, students will appear grouped under their respective course title.
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {Object.entries(groupedActiveByService).map(([serviceTitle, studentList]) => (
                <div key={serviceTitle} className="card bg-base-100 border-2 border-primary/25 rounded-3xl p-6 shadow-sm space-y-5">
                  
                  {/* Service Title Clustered Header */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-base-200">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center font-black text-xl shrink-0">
                        <BookOpen className="w-6 h-6" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-black text-lg text-base-content">{serviceTitle}</h3>
                          <span className="badge badge-primary badge-sm font-extrabold text-white text-[10px]">
                            {studentList.length} {studentList.length === 1 ? 'Student' : 'Students'}
                          </span>
                        </div>
                        <p className="text-xs text-base-content/60 mt-0.5">
                          Delivery Mode: <span className="font-bold uppercase">{studentList[0]?.mode || 'online'}</span> • Category: {studentList[0]?.category}
                        </p>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="text-xs text-base-content/60">Total Batch Value</span>
                      <div className="text-xl font-black text-primary">
                        ₹{studentList.reduce((sum, s) => sum + (s.total_amount || 0), 0).toLocaleString('en-IN')}
                      </div>
                    </div>
                  </div>

                  {/* All Users / Students Availing This Service */}
                  <div className="space-y-4">
                    <span className="text-[11px] font-extrabold uppercase tracking-wider text-base-content/60">
                      Enrolled Students in this Course:
                    </span>

                    <div className="grid grid-cols-1 gap-4">
                      {studentList.map((b) => (
                        <div key={b.id} className="bg-base-200/50 border border-base-300 rounded-2xl p-4 sm:p-5 space-y-3">
                          
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-mono text-xs font-bold text-accent">{b.booking_reference}</span>
                                <h4 className="font-extrabold text-base text-base-content">{b.student_name}</h4>
                                <span className="badge badge-sm badge-accent text-white font-bold text-[10px]">
                                  {b.student_age_group}
                                </span>
                              </div>
                              <p className="text-xs text-base-content/70 mt-0.5">
                                Booked By: <strong>{b.customer_name}</strong> • Time Slot: <strong className="text-accent">{b.scheduled_slot}</strong>
                              </p>
                            </div>

                            <div className="text-right">
                              <div className="text-base font-black text-accent">₹{b.total_amount}</div>
                              <span className="text-[10px] text-base-content/60 font-semibold">{b.sessions_count} sessions</span>
                            </div>
                          </div>

                          {/* Progress Flow Bar */}
                          <div className="bg-base-100 rounded-xl p-3 border border-base-300">
                            <StatusFlowBar 
                              currentStatus={b.status} 
                              type="service" 
                              totalSessions={b.sessions_count || 1}
                              completedSessions={b.completed_sessions_count || 0}
                            />
                          </div>

                          {/* Class Action Bar */}
                          <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-base-300/50">
                            <div className="flex items-center gap-2">
                              <button
                                type="button"
                                disabled={updatingId === b.id || (b.completed_sessions_count || 0) >= b.sessions_count}
                                onClick={() => handleMarkClassProgress(b.id, b.completed_sessions_count || 0, b.sessions_count)}
                                className="btn btn-accent btn-sm rounded-xl text-white font-bold text-xs min-h-[40px] px-4 shadow-xs"
                              >
                                <CheckCircle2 className="w-4 h-4" />
                                Mark Class #{(b.completed_sessions_count || 0) + 1} Conducted
                              </button>
                            </div>

                            <div className="flex items-center gap-2">
                              {b.meeting_link && (
                                <a
                                  href={b.meeting_link}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="btn btn-outline btn-accent btn-sm rounded-xl font-bold text-xs min-h-[40px] px-4 gap-1.5"
                                >
                                  <Video className="w-3.5 h-3.5" /> Open Video Room
                                </a>
                              )}
                              <button
                                type="button"
                                onClick={() => handleCancelBooking(b.id)}
                                className="btn btn-ghost btn-sm text-error text-xs rounded-xl min-h-[40px]"
                              >
                                Cancel
                              </button>
                            </div>
                          </div>

                        </div>
                      ))}
                    </div>
                  </div>

                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: INCOMING STUDENT BOOKING REQUESTS SWIPE DECK (Interactive Drag & Swipe) */}
      {activeTab === 'booking_requests' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between pb-2 border-b border-base-200">
            <div>
              <h2 className="text-lg font-black text-base-content flex items-center gap-2">
                <Clock className="w-5 h-5 text-warning" />
                Incoming Student Booking Requests ({pendingRequests.length})
              </h2>
              <p className="text-xs text-base-content/60">
                Swipe Left to Decline • Swipe Right to Accept and lock slot into your live teaching pipeline.
              </p>
            </div>
            <span className="badge badge-warning badge-sm font-bold text-white">
              {pendingRequests.length} Awaiting Acceptance
            </span>
          </div>

          <ServiceBookingSwipeDeck
            bookings={pendingRequests}
            onAccept={handleAcceptBooking}
            onDecline={handleCancelBooking}
            loading={loading}
          />
        </div>
      )}

      {/* TAB 3: AUTOMATIC SLOT MANAGEMENT & CLASH BOARD */}
      {activeTab === 'slot_schedule' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between pb-2 border-b border-base-200">
            <div>
              <h2 className="text-lg font-black text-base-content flex items-center gap-2">
                <CalendarCheck2 className="w-5 h-5 text-accent" />
                Automatic Slot Conflict Prevention Board
              </h2>
              <p className="text-xs text-base-content/60">
                Slots booked by students are automatically locked across the platform to prevent overlapping class schedules.
              </p>
            </div>
            <span className="badge badge-accent badge-sm font-bold text-white">Live Slot Shield Active</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {STANDARD_TIME_SLOTS.map((slot) => {
              const occupant = slotOccupancyMap[slot];
              const isOccupied = !!occupant;

              return (
                <div 
                  key={slot}
                  className={`card rounded-3xl p-5 border-2 transition-all space-y-3 ${
                    isOccupied 
                      ? 'bg-accent/5 border-accent/40 shadow-sm' 
                      : 'bg-base-100 border-base-300/80 opacity-80'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-base-content">{slot}</span>
                    {isOccupied ? (
                      <span className="badge badge-accent badge-sm font-bold text-white text-[10px] gap-1">
                        <Lock className="w-3 h-3" /> Locked / Booked
                      </span>
                    ) : (
                      <span className="badge badge-success badge-outline badge-sm font-bold text-[10px] gap-1">
                        <Unlock className="w-3 h-3" /> Available Free
                      </span>
                    )}
                  </div>

                  {isOccupied ? (
                    <div className="bg-base-100 rounded-2xl p-3.5 border border-accent/20 space-y-1.5 text-xs">
                      <div className="flex justify-between font-bold text-base-content">
                        <span>{occupant.service_title}</span>
                        <span className="text-accent">{occupant.completed_sessions_count || 0}/{occupant.sessions_count} Done</span>
                      </div>
                      <p className="text-xs text-base-content/70">Student: <strong>{occupant.student_name}</strong> ({occupant.student_age_group})</p>
                      <p className="text-[11px] text-base-content/50">Parent: {occupant.customer_name}</p>
                      {occupant.meeting_link && (
                        <a 
                          href={occupant.meeting_link}
                          target="_blank"
                          rel="noreferrer"
                          className="btn btn-accent btn-xs rounded-lg text-white font-bold w-full mt-2"
                        >
                          <Video className="w-3 h-3 mr-1" /> Open Classroom
                        </a>
                      )}
                    </div>
                  ) : (
                    <div className="p-4 text-center rounded-2xl bg-base-200/40 text-xs text-base-content/50">
                      Open for new student bookings with zero clash guarantee.
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 4: OFFERINGS & LIVE CLASSES */}
      {activeTab === 'offerings' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-black text-base-content flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-secondary" />
                My Published Classes & Mentoring Offerings ({offerings.length})
              </h2>
              <p className="text-xs text-base-content/60">
                Managed service packages visible to students and parents across {selectedCity?.name || 'Chennai'}.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setShowAddModal(true)}
              className="btn btn-secondary min-h-[44px] px-4 rounded-xl text-white font-bold text-xs gap-1.5 self-start sm:self-auto"
            >
              <Plus className="w-4 h-4" /> Offer New Class
            </button>
          </div>

          {offerings.length === 0 ? (
            <div className="card bg-base-100 border border-base-300 rounded-3xl p-10 text-center space-y-3">
              <div className="text-4xl">📚</div>
              <h3 className="font-extrabold text-base text-base-content">No classes published yet</h3>
              <p className="text-xs text-base-content/60 max-w-sm mx-auto">
                Offer your expertise in languages, Vedic math, career guidance, music, or traditional crafts.
              </p>
              <button
                type="button"
                onClick={() => setShowAddModal(true)}
                className="btn btn-secondary btn-sm rounded-xl text-white font-bold text-xs gap-1 mx-auto"
              >
                <Plus className="w-3.5 h-3.5" /> Package Class with Gemini AI
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {offerings.map((srv) => (
                <div key={srv.id} className="card bg-base-100 border border-base-300 rounded-3xl p-5 shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between space-y-3">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="badge badge-accent badge-sm font-bold text-white text-[10px]">
                        {srv.subcategory || srv.category}
                      </span>
                      <span className="badge badge-outline badge-sm font-semibold text-[10px] uppercase">
                        {srv.mode}
                      </span>
                    </div>

                    <h3 className="font-black text-base text-base-content line-clamp-1">{srv.title}</h3>
                    <p className="text-xs text-base-content/70 line-clamp-2 leading-relaxed">{srv.description}</p>
                    
                    <div className="bg-base-200/60 rounded-xl p-3 space-y-1.5 text-xs">
                      <div className="flex justify-between">
                        <span className="text-base-content/60">Duration:</span>
                        <strong>{srv.duration_mins} mins / session</strong>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-base-content/60">Target:</span>
                        <strong>{srv.target_audience || 'All Ages'}</strong>
                      </div>
                      <div className="flex justify-between text-primary font-bold">
                        <span>Fee:</span>
                        <span>₹{srv.price_per_session} / session</span>
                      </div>
                      <div className="flex items-center justify-between pt-1 border-t border-base-300 text-[11px]">
                        <span className="flex items-center gap-1 font-bold text-warning">
                          <Star className="w-3.5 h-3.5 fill-warning text-warning" /> {srv.rating || srv.senior_rating || 4.95}
                        </span>
                        <span className="text-base-content/60 font-semibold">
                          {srv.total_reviews || srv.reviews?.length || 1} Student Review(s)
                        </span>
                      </div>
                    </div>

                    {/* Recent Student Feedback Comment */}
                    {srv.reviews && srv.reviews.length > 0 && (
                      <div className="bg-warning/5 border border-warning/20 rounded-xl p-2.5 text-[11px] text-base-content/80 italic space-y-0.5">
                        <p className="line-clamp-2">"{srv.reviews[0].comment}"</p>
                        <span className="not-italic font-bold text-[10px] text-base-content/60 block text-right">
                          — {srv.reviews[0].customer_name} ({srv.reviews[0].rating} ★)
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="pt-2 border-t border-base-200 flex items-center justify-between gap-2">
                    <Link
                      to={`/services/${srv.id}`}
                      className="btn btn-outline btn-sm rounded-xl text-xs font-bold flex-1 gap-1 min-h-[38px]"
                    >
                      <ExternalLink className="w-3.5 h-3.5" /> View Public
                    </Link>
                    <button
                      type="button"
                      onClick={() => handleDeleteService(srv.id)}
                      className="btn btn-ghost btn-sm rounded-xl text-xs text-error font-bold min-h-[38px] px-3 gap-1 hover:bg-error/10"
                      title="Delete Class Offering"
                    >
                      <Trash2 className="w-3.5 h-3.5" /> Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 5: COMPLETED COURSE HISTORY & ARCHIVE */}
      {activeTab === 'history' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-base-200">
            <div>
              <h2 className="text-lg font-black text-base-content flex items-center gap-2">
                <Archive className="w-5 h-5 text-neutral" />
                Completed Course History ({historyBookings.length})
              </h2>
              <p className="text-xs text-base-content/60">
                Archived classes that are fully completed or cancelled.
              </p>
            </div>
          </div>

          {historyBookings.length === 0 ? (
            <div className="card bg-base-100 border border-base-300 rounded-3xl p-10 text-center space-y-3">
              <div className="text-4xl">📜</div>
              <h3 className="font-extrabold text-base text-base-content">No archived courses</h3>
              <p className="text-xs text-base-content/60 max-w-sm mx-auto">
                Completed or cancelled courses will appear here.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {historyBookings.map((b) => (
                <div key={b.id} className="card bg-base-100 border border-base-300 rounded-3xl p-5 shadow-xs space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-mono text-xs font-bold text-accent">{b.booking_reference}</span>
                      <h4 className="font-bold text-sm text-base-content">{b.service_title}</h4>
                      <p className="text-xs text-base-content/70">Student: {b.student_name} • Booked by: {b.customer_name}</p>
                    </div>
                    <div className="text-right">
                      <span className={`badge badge-sm font-bold uppercase text-[10px] ${
                        b.status === 'completed' ? 'badge-success text-white' : 'badge-error text-white'
                      }`}>
                        {b.status}
                      </span>
                      <div className="text-sm font-black text-accent mt-0.5">₹{b.total_amount}</div>
                    </div>
                  </div>

                  {b.review_rating && (
                    <div className="text-xs text-warning font-semibold pt-1 border-t border-base-200 flex items-center gap-1.5">
                      <span>★ {b.review_rating} Stars: "{b.review_comment}"</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Add Service Modal */}
      <AddServiceModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onServiceCreated={() => {
          showToast('New class offering published to Service Hub!');
          fetchData();
        }}
      />

    </div>
  );
}
