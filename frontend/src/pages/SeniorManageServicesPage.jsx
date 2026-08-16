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
  Star,
  Play,
  CheckCheck,
  MapPin
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLocation } from '../context/LocationContext';
import api from '../api/client';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ErrorAlert from '../components/common/ErrorAlert';
import AddServiceModal from '../components/modals/AddServiceModal';

const DAYS_OF_WEEK = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

export default function SeniorManageServicesPage() {
  const { user } = useAuth();
  const { selectedCity } = useLocation();

  const [rosters, setRosters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [toastMsg, setToastMsg] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  
  // Tab: 'classes' | 'requests' | 'schedule' | 'history'
  const [activeTab, setActiveTab] = useState('classes');
  const [updatingId, setUpdatingId] = useState(null);

  const fetchData = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await api.get('/services/my-class-rosters');
      setRosters(data || []);
    } catch (err) {
      setError(err.message || 'Failed to load class rosters');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [selectedCity?.name]);

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 4000);
  };

  // Accept student into class
  const handleAcceptStudent = async (bookingId, studentName) => {
    setUpdatingId(bookingId);
    try {
      await api.put(`/services/bookings/${bookingId}/status`, { status: 'accepted' });
      showToast(`🎉 Accepted ${studentName} into class!`);
      fetchData();
    } catch (err) {
      setError(err.message || 'Failed to accept student');
    } finally {
      setUpdatingId(null);
    }
  };

  // Start class session with student
  const handleStartSession = async (bookingId, studentName) => {
    setUpdatingId(bookingId);
    try {
      await api.put(`/services/bookings/${bookingId}/status`, { status: 'in_progress' });
      showToast(`▶ Class session in progress with ${studentName}!`);
      fetchData();
    } catch (err) {
      setError(err.message || 'Failed to start session');
    } finally {
      setUpdatingId(null);
    }
  };

  // Mark student session completed and credit senior payout
  const handleCompleteStudent = async (bookingId, studentName, amount) => {
    if (!window.confirm(`Mark session completed for ${studentName}? ₹${amount} will be settled into your earnings ledger.`)) return;
    setUpdatingId(bookingId);
    try {
      await api.put(`/services/bookings/${bookingId}/status`, { status: 'completed' });
      showToast(`🎉 Completed session for ${studentName}! ₹${amount} added to your verified earnings.`);
      fetchData();
    } catch (err) {
      setError(err.message || 'Failed to mark completion');
    } finally {
      setUpdatingId(null);
    }
  };

  // Decline / Cancel student booking
  const handleCancelStudent = async (bookingId, studentName) => {
    if (!window.confirm(`Decline / cancel booking for ${studentName}? The seat will be reopened in the batch.`)) return;
    setUpdatingId(bookingId);
    try {
      await api.put(`/services/bookings/${bookingId}/cancel`, {});
      showToast(`Booking cancelled for ${studentName}. Seat reopened.`);
      fetchData();
    } catch (err) {
      setError(err.message || 'Failed to cancel student session');
    } finally {
      setUpdatingId(null);
    }
  };

  // Delete service offering
  const handleDeleteService = async (serviceId, serviceTitle) => {
    if (!window.confirm(`Are you sure you want to delete "${serviceTitle}"? This will remove the class from the public catalog.`)) return;
    try {
      await api.delete(`/services/${serviceId}`);
      showToast(`Class "${serviceTitle}" removed.`);
      fetchData();
    } catch (err) {
      setError(err.message || 'Failed to delete service');
    }
  };

  // Aggregations
  const totalClassesCount = rosters.length;
  const allStudents = rosters.flatMap(r => r.students || []);
  const pendingRequests = allStudents.filter(s => s.status === 'requested');
  const activeStudents = allStudents.filter(s => ['accepted', 'scheduled', 'in_progress'].includes(s.status));
  const completedStudents = allStudents.filter(s => s.status === 'completed');
  const totalClassEarnings = rosters.reduce((acc, r) => acc + (r.total_class_earnings || 0), 0);

  if (loading && rosters.length === 0) {
    return <LoadingSpinner message="Opening your Class Roster & Service Hub..." />;
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
                🎓 Managed Classes & Batches
              </span>
              <span className="badge badge-accent badge-outline badge-sm font-bold text-[10px]">
                Max 10 Students per Class Batch
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-base-content tracking-tight">
              Class Rosters & Student Management
            </h1>
            <p className="text-xs sm:text-sm text-base-content/70 max-w-2xl">
              Manage your active class batches, track student progress individually, join dedicated class video rooms, and earn verified payouts student-by-student.
            </p>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            <button
              type="button"
              onClick={() => setShowAddModal(true)}
              className="btn btn-accent btn-sm min-h-[44px] rounded-2xl text-white font-bold gap-1.5 shadow-sm text-xs px-5 hover:scale-[1.02] transition-transform"
            >
              <Plus className="w-4 h-4" /> Publish New Class
            </button>
            <button
              type="button"
              onClick={fetchData}
              className="btn btn-ghost btn-sm min-h-[44px] rounded-2xl border border-base-300 gap-1 text-xs"
              title="Refresh Roster"
            >
              <RefreshCw className="w-3.5 h-3.5" /> Refresh
            </button>
          </div>
        </div>

        {/* 4 Metric Summary Tiles */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-6">
          <div className="bg-base-100 border border-base-300 rounded-2xl p-3.5 text-center shadow-2xs">
            <span className="text-[11px] font-bold text-base-content/60 block">Active Classes</span>
            <span className="text-xl sm:text-2xl font-black text-accent">{totalClassesCount}</span>
          </div>
          <div className="bg-base-100 border border-base-300 rounded-2xl p-3.5 text-center shadow-2xs">
            <span className="text-[11px] font-bold text-base-content/60 block">Enrolled Students</span>
            <span className="text-xl sm:text-2xl font-black text-primary">{activeStudents.length}</span>
          </div>
          <div className="bg-base-100 border border-base-300 rounded-2xl p-3.5 text-center shadow-2xs">
            <span className="text-[11px] font-bold text-base-content/60 block">Pending Requests</span>
            <span className={`text-xl sm:text-2xl font-black ${pendingRequests.length > 0 ? 'text-warning' : 'text-base-content'}`}>
              {pendingRequests.length}
            </span>
          </div>
          <div className="bg-base-100 border border-base-300 rounded-2xl p-3.5 text-center shadow-2xs">
            <span className="text-[11px] font-bold text-base-content/60 block">Classes Earnings</span>
            <span className="text-xl sm:text-2xl font-black text-success">₹{totalClassEarnings.toLocaleString('en-IN')}</span>
          </div>
        </div>
      </div>

      <ErrorAlert message={error} />

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 text-sm border-b border-base-200">
        <button
          type="button"
          onClick={() => setActiveTab('classes')}
          className={`btn btn-sm rounded-xl gap-1.5 font-bold text-xs min-h-[38px] ${
            activeTab === 'classes' ? 'btn-accent text-white shadow-xs' : 'btn-ghost text-base-content/70'
          }`}
        >
          <BookOpen className="w-3.5 h-3.5" /> Class Batches & Rosters ({rosters.length})
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('requests')}
          className={`btn btn-sm rounded-xl gap-1.5 font-bold text-xs min-h-[38px] ${
            activeTab === 'requests' ? 'btn-accent text-white shadow-xs' : 'btn-ghost text-base-content/70'
          }`}
        >
          <Users className="w-3.5 h-3.5" /> New Student Requests
          {pendingRequests.length > 0 && (
            <span className="badge badge-warning badge-xs font-black text-[10px]">{pendingRequests.length}</span>
          )}
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('schedule')}
          className={`btn btn-sm rounded-xl gap-1.5 font-bold text-xs min-h-[38px] ${
            activeTab === 'schedule' ? 'btn-accent text-white shadow-xs' : 'btn-ghost text-base-content/70'
          }`}
        >
          <Calendar className="w-3.5 h-3.5" /> Weekly Timetable
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('history')}
          className={`btn btn-sm rounded-xl gap-1.5 font-bold text-xs min-h-[38px] ${
            activeTab === 'history' ? 'btn-accent text-white shadow-xs' : 'btn-ghost text-base-content/70'
          }`}
        >
          <CheckCircle2 className="w-3.5 h-3.5" /> Completed Students ({completedStudents.length})
        </button>
      </div>

      {/* TAB 1: CLASS BATCHES & STUDENT ROSTERS */}
      {activeTab === 'classes' && (
        <div className="space-y-6">
          {rosters.length === 0 ? (
            <div className="card bg-base-100 border border-base-300 rounded-3xl p-12 text-center max-w-md mx-auto space-y-4 shadow-sm">
              <div className="w-16 h-16 rounded-full bg-accent/15 text-accent flex items-center justify-center mx-auto text-3xl font-bold">
                🎓
              </div>
              <div>
                <h3 className="font-extrabold text-lg text-base-content">No Classes Created Yet</h3>
                <p className="text-xs text-base-content/60 mt-1">
                  Publish your language tuition, mentorship, or craft classes and teach batches of up to 10 eager students!
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowAddModal(true)}
                className="btn btn-accent btn-sm rounded-xl text-white font-bold gap-1 text-xs"
              >
                <Plus className="w-4 h-4" /> Publish 1st Class
              </button>
            </div>
          ) : (
            rosters.map((roster) => {
              const srv = roster.service;
              const activeInBatch = (roster.students || []).filter(s => s.status !== 'cancelled');
              const capacityPct = Math.min(100, Math.round((activeInBatch.length / 10) * 100));
              const remainingSeats = Math.max(0, 10 - activeInBatch.length);

              return (
                <div 
                  key={srv.id}
                  className="card bg-base-100 border-2 border-base-300 rounded-3xl p-6 sm:p-7 shadow-xs space-y-6"
                >
                  {/* Class Header */}
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-base-200">
                    <div className="space-y-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="badge badge-accent badge-sm font-bold text-white uppercase text-[10px]">
                          {srv.category}
                        </span>
                        <span className={`badge badge-sm font-bold text-[10px] ${
                          srv.mode === 'online' ? 'badge-primary text-white' : srv.mode === 'offline' ? 'badge-neutral' : 'badge-secondary text-white'
                        }`}>
                          {srv.mode === 'online' ? '💻 Online Video Class' : srv.mode === 'offline' ? '📍 In-Person Studio' : '🔄 Hybrid (Both)'}
                        </span>
                        <span className="badge badge-ghost badge-sm text-[10px] font-semibold">
                          ⏱ {srv.duration_mins} Mins
                        </span>
                      </div>

                      <h2 className="text-xl sm:text-2xl font-black text-base-content">
                        {srv.title}
                      </h2>

                      {/* Schedule details */}
                      <div className="flex flex-wrap items-center gap-3 text-xs text-base-content/80 pt-0.5">
                        <span className="flex items-center gap-1 font-bold text-primary">
                          <Calendar className="w-3.5 h-3.5" />
                          {(srv.available_days || []).join(', ') || 'Mon, Wed, Fri'}
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1 font-semibold text-base-content/70">
                          <Clock className="w-3.5 h-3.5 text-secondary" />
                          {srv.time_slot || '5:00 PM – 6:00 PM'}
                        </span>
                        <span>•</span>
                        <span className="font-extrabold text-success text-sm">
                          ₹{srv.price_per_session} <span className="text-[10px] text-base-content/60 font-normal">/ student</span>
                        </span>
                      </div>
                    </div>

                    {/* Actions & Meeting Link */}
                    <div className="flex items-center gap-2 flex-wrap self-start md:self-auto">
                      {srv.mode !== 'offline' && roster.meeting_link && (
                        <a
                          href={roster.meeting_link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn btn-primary btn-sm min-h-[40px] rounded-xl text-white font-bold text-xs gap-1.5 shadow-sm hover:scale-[1.02] transition-transform"
                        >
                          <Video className="w-4 h-4" /> Join Class Room
                          <ExternalLink className="w-3 h-3 opacity-70" />
                        </a>
                      )}
                      <button
                        type="button"
                        onClick={() => handleDeleteService(srv.id, srv.title)}
                        className="btn btn-ghost btn-sm min-h-[40px] rounded-xl text-error hover:bg-error/10 text-xs p-2"
                        title="Delete Class"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Batch Capacity Tracker & Progress Bar */}
                  <div className="bg-base-200/60 border border-base-300 rounded-2xl p-4 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4 text-accent" />
                        <span className="font-extrabold text-base-content">
                          Class Batch Capacity: <span className="text-accent">{activeInBatch.length} / 10</span> Enrolled
                        </span>
                      </div>
                      <span className={`badge badge-sm font-bold text-[10px] ${
                        remainingSeats === 0 ? 'badge-error text-white' : 'badge-success text-white'
                      }`}>
                        {remainingSeats === 0 ? 'Batch Full (10/10)' : `${remainingSeats} Seats Left`}
                      </span>
                    </div>
                    
                    <div className="w-full bg-base-300 rounded-full h-2.5 overflow-hidden">
                      <div 
                        className={`h-2.5 rounded-full transition-all duration-300 ${
                          capacityPct >= 100 ? 'bg-error' : capacityPct >= 70 ? 'bg-warning' : 'bg-accent'
                        }`}
                        style={{ width: `${capacityPct}%` }}
                      ></div>
                    </div>

                    {srv.mode !== 'online' && roster.venue_address && (
                      <p className="text-[11px] text-base-content/70 flex items-center gap-1 pt-1">
                        <MapPin className="w-3 h-3 text-secondary shrink-0" />
                        <span>Studio Venue: <strong>{roster.venue_address}</strong></span>
                      </p>
                    )}
                  </div>

                  {/* Enrolled Students Roster List */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xs font-black uppercase tracking-wider text-base-content/70">
                        Enrolled Students ({roster.students?.length || 0})
                      </h3>
                      <span className="text-[11px] text-base-content/60 font-semibold">
                        Completed Sessions: {roster.completed_count || 0} • Settled: ₹{(roster.total_class_earnings || 0).toLocaleString('en-IN')}
                      </span>
                    </div>

                    {(!roster.students || roster.students.length === 0) ? (
                      <div className="p-6 rounded-2xl bg-base-200/40 border border-dashed border-base-300 text-center space-y-1">
                        <p className="text-xs font-semibold text-base-content/70">No students currently enrolled in this class batch.</p>
                        <p className="text-[11px] text-base-content/50">When students book through the catalog, their names and progress will appear here.</p>
                      </div>
                    ) : (
                      <div className="space-y-2.5">
                        {roster.students.map((student) => {
                          const isUpdating = updatingId === student.id;
                          return (
                            <div 
                              key={student.id}
                              className={`p-4 rounded-2xl border transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                                student.status === 'completed' 
                                  ? 'bg-success/5 border-success/30' 
                                  : student.status === 'in_progress' 
                                  ? 'bg-primary/5 border-primary/30 shadow-xs' 
                                  : student.status === 'requested' 
                                  ? 'bg-warning/5 border-warning/30' 
                                  : 'bg-base-200/50 border-base-300'
                              }`}
                            >
                              {/* Student Info */}
                              <div className="space-y-1">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <strong className="text-sm text-base-content font-extrabold">
                                    {student.student_name}
                                  </strong>
                                  <span className="badge badge-ghost badge-xs text-[10px]">
                                    {student.student_age_group}
                                  </span>
                                  <span className={`badge badge-sm font-bold text-[10px] uppercase ${
                                    student.status === 'completed' ? 'badge-success text-white' :
                                    student.status === 'in_progress' ? 'badge-primary text-white animate-pulse' :
                                    student.status === 'accepted' ? 'badge-accent text-white' :
                                    student.status === 'requested' ? 'badge-warning text-white' : 'badge-neutral'
                                  }`}>
                                    {student.status.replace('_', ' ')}
                                  </span>
                                </div>

                                <div className="text-xs text-base-content/70 flex flex-wrap items-center gap-2">
                                  <span>Guardian: <strong>{student.customer_name}</strong></span>
                                  {student.customer_phone && (
                                    <>
                                      <span>•</span>
                                      <span className="flex items-center gap-0.5"><Phone className="w-3 h-3 text-secondary" /> {student.customer_phone}</span>
                                    </>
                                  )}
                                  <span>•</span>
                                  <span className="font-mono text-[11px] text-base-content/50">Ref: {student.booking_reference}</span>
                                </div>
                              </div>

                              {/* Student Actions */}
                              <div className="flex items-center gap-2 flex-wrap self-end md:self-auto">
                                {student.status === 'requested' && (
                                  <>
                                    <button
                                      type="button"
                                      disabled={isUpdating}
                                      onClick={() => handleAcceptStudent(student.id, student.student_name)}
                                      className="btn btn-success btn-xs min-h-[34px] rounded-xl text-white font-bold gap-1 px-3 shadow-xs"
                                    >
                                      {isUpdating ? <span className="loading loading-spinner loading-xs"></span> : <Check className="w-3.5 h-3.5" />}
                                      Accept Student
                                    </button>
                                    <button
                                      type="button"
                                      disabled={isUpdating}
                                      onClick={() => handleCancelStudent(student.id, student.student_name)}
                                      className="btn btn-ghost btn-xs min-h-[34px] rounded-xl text-error hover:bg-error/10 text-xs px-2"
                                    >
                                      <X className="w-3.5 h-3.5" /> Decline
                                    </button>
                                  </>
                                )}

                                {(student.status === 'accepted' || student.status === 'scheduled') && (
                                  <button
                                    type="button"
                                    disabled={isUpdating}
                                    onClick={() => handleStartSession(student.id, student.student_name)}
                                    className="btn btn-primary btn-xs min-h-[34px] rounded-xl text-white font-bold gap-1 px-3 shadow-xs"
                                  >
                                    {isUpdating ? <span className="loading loading-spinner loading-xs"></span> : <Play className="w-3.5 h-3.5" />}
                                    Start Session
                                  </button>
                                )}

                                {student.status === 'in_progress' && (
                                  <button
                                    type="button"
                                    disabled={isUpdating}
                                    onClick={() => handleCompleteStudent(student.id, student.student_name, student.total_amount || srv.price_per_session)}
                                    className="btn btn-success btn-xs min-h-[34px] rounded-xl text-white font-black gap-1 px-3 shadow-sm"
                                  >
                                    {isUpdating ? <span className="loading loading-spinner loading-xs"></span> : <CheckCheck className="w-3.5 h-3.5" />}
                                    Mark Completed (+₹{student.total_amount || srv.price_per_session})
                                  </button>
                                )}

                                {student.status === 'completed' && (
                                  <span className="badge badge-success badge-sm font-bold text-white text-[11px] py-2 px-2.5">
                                    ★ Settled ₹{student.total_amount || srv.price_per_session}
                                  </span>
                                )}
                              </div>

                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>

                </div>
              );
            })
          )}
        </div>
      )}

      {/* TAB 2: PENDING STUDENT REQUESTS */}
      {activeTab === 'requests' && (
        <div className="space-y-4">
          {pendingRequests.length === 0 ? (
            <div className="card bg-base-100 border border-base-300 rounded-3xl p-12 text-center max-w-md mx-auto space-y-2 shadow-sm">
              <div className="w-14 h-14 rounded-full bg-success/10 text-success flex items-center justify-center mx-auto text-2xl font-bold">
                ✓
              </div>
              <h3 className="font-extrabold text-base text-base-content">No Pending Student Requests</h3>
              <p className="text-xs text-base-content/60">All student class enrollments have been reviewed and accepted!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {pendingRequests.map((req) => (
                <div key={req.id} className="card bg-base-100 border-2 border-warning/40 rounded-3xl p-5 shadow-xs space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="badge badge-warning badge-sm font-bold text-white uppercase text-[10px]">
                      New Student Enrollment
                    </span>
                    <span className="font-extrabold text-primary text-sm">₹{req.total_amount}</span>
                  </div>

                  <div>
                    <h3 className="font-extrabold text-base text-base-content">{req.student_name}</h3>
                    <p className="text-xs text-base-content/60 font-semibold">{req.service_title}</p>
                    <p className="text-xs text-base-content/70 mt-1">Schedule: {req.scheduled_slot}</p>
                  </div>

                  <div className="flex items-center gap-2 pt-2 border-t border-base-200">
                    <button
                      type="button"
                      disabled={updatingId === req.id}
                      onClick={() => handleAcceptStudent(req.id, req.student_name)}
                      className="btn btn-success btn-sm flex-1 rounded-xl text-white font-bold text-xs"
                    >
                      Accept Student
                    </button>
                    <button
                      type="button"
                      disabled={updatingId === req.id}
                      onClick={() => handleCancelStudent(req.id, req.student_name)}
                      className="btn btn-ghost btn-sm rounded-xl text-error hover:bg-error/10 text-xs"
                    >
                      Decline
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: WEEKLY SCHEDULE TIMETABLE */}
      {activeTab === 'schedule' && (
        <div className="card bg-base-100 border border-base-300 rounded-3xl p-6 sm:p-7 shadow-xs space-y-6">
          <div>
            <h2 className="font-extrabold text-xl text-base-content">Weekly Class Timetable</h2>
            <p className="text-xs text-base-content/60">Organized view of your classes across all 7 days of the week.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {DAYS_OF_WEEK.map((day) => {
              const classesOnDay = rosters.filter(r => (r.service.available_days || []).includes(day));
              return (
                <div key={day} className="bg-base-200/50 border border-base-300 rounded-2xl p-4 space-y-3">
                  <div className="flex items-center justify-between pb-2 border-b border-base-300">
                    <span className="font-extrabold text-sm text-base-content">{day}</span>
                    <span className="badge badge-accent badge-xs text-[10px] font-bold">
                      {classesOnDay.length} {classesOnDay.length === 1 ? 'Class' : 'Classes'}
                    </span>
                  </div>

                  {classesOnDay.length === 0 ? (
                    <p className="text-xs text-base-content/40 italic">No classes scheduled</p>
                  ) : (
                    <div className="space-y-2">
                      {classesOnDay.map(c => (
                        <div key={c.service.id} className="bg-base-100 border border-base-300 rounded-xl p-2.5 space-y-1">
                          <p className="text-xs font-bold text-base-content truncate">{c.service.title}</p>
                          <p className="text-[11px] text-secondary font-semibold flex items-center gap-1">
                            <Clock className="w-3 h-3" /> {c.service.time_slot}
                          </p>
                          <p className="text-[10px] text-base-content/60">
                            👥 {c.enrolled_count || 0}/10 Students Enrolled
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 4: COMPLETED STUDENTS & EARNINGS HISTORY */}
      {activeTab === 'history' && (
        <div className="space-y-4">
          {completedStudents.length === 0 ? (
            <div className="card bg-base-100 border border-base-300 rounded-3xl p-12 text-center max-w-md mx-auto space-y-2 shadow-sm">
              <div className="w-14 h-14 rounded-full bg-base-200 text-base-content/60 flex items-center justify-center mx-auto text-2xl">
                📋
              </div>
              <h3 className="font-extrabold text-base text-base-content">No Completed Classes Yet</h3>
              <p className="text-xs text-base-content/60">Once you mark students as completed, their payout history and reviews will appear here.</p>
            </div>
          ) : (
            <div className="card bg-base-100 border border-base-300 rounded-3xl p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-base-200">
                <div>
                  <h3 className="font-extrabold text-base text-base-content">Finished Student Sessions</h3>
                  <p className="text-xs text-base-content/60">Directly settled to your lifetime earnings.</p>
                </div>
                <div className="text-right">
                  <span className="text-xs text-base-content/60 font-bold block">Total Class Payout</span>
                  <span className="text-lg font-black text-success">₹{totalClassEarnings.toLocaleString('en-IN')}</span>
                </div>
              </div>

              <div className="space-y-2.5">
                {completedStudents.map(student => (
                  <div key={student.id} className="p-4 rounded-2xl bg-base-200/50 border border-base-300 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <strong className="text-sm font-extrabold text-base-content">{student.student_name}</strong>
                        <span className="badge badge-success badge-sm font-bold text-white text-[10px]">Completed</span>
                      </div>
                      <p className="text-xs text-base-content/70">{student.service_title} • Guardian: {student.customer_name}</p>
                      {student.review_rating && (
                        <p className="text-xs text-warning flex items-center gap-1 font-bold">
                          <Star className="w-3.5 h-3.5 fill-current" /> {student.review_rating}/5: "{student.review_comment}"
                        </p>
                      )}
                    </div>
                    <div className="text-right self-end sm:self-auto">
                      <span className="text-base font-black text-success">+₹{student.total_amount}</span>
                      <span className="text-[10px] text-base-content/50 block">{new Date(student.updated_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Add Service Modal */}
      <AddServiceModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onServiceCreated={() => {
          showToast('🎉 New class published successfully! Open for up to 10 student enrollments.');
          fetchData();
        }}
      />

    </div>
  );
}
