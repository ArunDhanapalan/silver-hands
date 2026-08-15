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
  Users
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../api/client';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ErrorAlert from '../components/common/ErrorAlert';
import AddServiceModal from '../components/modals/AddServiceModal';

export default function SeniorManageServicesPage() {
  const { user } = useAuth();
  const [offerings, setOfferings] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [toastMsg, setToastMsg] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [activeTab, setActiveTab] = useState('bookings'); // 'bookings' | 'offerings'

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
  }, []);

  const handleUpdateStatus = async (bookingId, newStatus) => {
    try {
      const payload = {
        status: newStatus,
        meeting_link: `https://meet.silverhands.in/room-${Math.floor(100000 + Math.random() * 900000)}`
      };
      await api.put(`/services/bookings/${bookingId}/status`, payload);
      setToastMsg(`Session marked as ${newStatus}!`);
      setTimeout(() => setToastMsg(''), 3500);
      fetchData();
    } catch (err) {
      setError(err.message || 'Failed to update session');
    }
  };

  const handleMarkClassProgress = async (bookingId, currentCompleted, totalSessions) => {
    const nextCompleted = currentCompleted + 1;
    try {
      await api.put(`/services/bookings/${bookingId}/progress`, {
        completed_sessions: nextCompleted
      });
      if (nextCompleted >= totalSessions) {
        setToastMsg(`🎉 All ${totalSessions} classes completed! Fee added to your earnings ledger.`);
      } else {
        setToastMsg(`Class ${nextCompleted} of ${totalSessions} marked completed!`);
      }
      setTimeout(() => setToastMsg(''), 3500);
      fetchData();
    } catch (err) {
      setError(err.message || 'Failed to update class progress');
    }
  };

  const handleCancelBooking = async (bookingId) => {
    if (!window.confirm('Are you sure you want to cancel this booking?')) return;
    try {
      await api.put(`/services/bookings/${bookingId}/cancel`, {});
      setToastMsg('Booking cancelled.');
      setTimeout(() => setToastMsg(''), 3500);
      fetchData();
    } catch (err) {
      setError(err.message || 'Failed to cancel booking');
    }
  };

  if (loading) {
    return <LoadingSpinner message="Loading your teaching services & student bookings..." />;
  }

  const activeBookings = bookings.filter(b => b.status !== 'completed' && b.status !== 'cancelled');
  const completedBookings = bookings.filter(b => b.status === 'completed');

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-16">
      
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
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-base-200">
        <div>
          <div className="flex items-center gap-2">
            <Link to="/senior" className="btn btn-ghost btn-xs btn-circle">
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-base-content">
              Manage Services & Live Classes
            </h1>
          </div>
          <p className="text-xs text-base-content/70 mt-1">
            Conduct 1-on-1 language coaching, track class completions, start video sessions, and manage your teaching packages.
          </p>
        </div>

        <button 
          type="button" 
          onClick={() => setShowAddModal(true)}
          className="btn btn-accent btn-sm rounded-xl text-white font-bold text-xs gap-1.5 shadow-sm"
        >
          <Plus className="w-4 h-4" /> Offer New Service (NLP Auto-Fill)
        </button>
      </div>

      <ErrorAlert message={error} />

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-base-200">
        <button
          onClick={() => setActiveTab('bookings')}
          className={`pb-3 px-4 font-extrabold text-sm border-b-2 transition-all flex items-center gap-2 ${
            activeTab === 'bookings'
              ? 'border-accent text-accent'
              : 'border-transparent text-base-content/60 hover:text-base-content'
          }`}
        >
          <BookOpen className="w-4 h-4" /> Student Bookings & Classes
          <span className="badge badge-accent badge-sm font-bold text-white">{activeBookings.length}</span>
        </button>

        <button
          onClick={() => setActiveTab('offerings')}
          className={`pb-3 px-4 font-extrabold text-sm border-b-2 transition-all flex items-center gap-2 ${
            activeTab === 'offerings'
              ? 'border-accent text-accent'
              : 'border-transparent text-base-content/60 hover:text-base-content'
          }`}
        >
          <Layers className="w-4 h-4" /> My Published Offerings ({offerings.length})
        </button>
      </div>

      {/* Tab 1: Bookings & Class Tracker */}
      {activeTab === 'bookings' && (
        <div className="space-y-6">
          
          {/* Active Bookings */}
          <div className="space-y-3">
            <h2 className="text-base font-extrabold text-base-content flex items-center gap-2">
              <Clock className="w-4 h-4 text-accent" /> Active & Upcoming Student Sessions ({activeBookings.length})
            </h2>

            {activeBookings.length === 0 ? (
              <div className="card bg-base-100 border border-base-300 rounded-3xl p-8 text-center space-y-2">
                <BookOpen className="w-10 h-10 text-base-content/30 mx-auto" />
                <h3 className="font-bold text-sm text-base-content">No active student bookings right now</h3>
                <p className="text-xs text-base-content/60">
                  When learners book your spoken language or mentoring classes, they will appear here.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {activeBookings.map((b) => {
                  const total = b.sessions_count || 1;
                  const done = b.completed_sessions_count || 0;
                  const progressPct = Math.min(100, Math.round((done / total) * 100));

                  return (
                    <div key={b.id} className="card bg-base-100 border-2 border-accent/20 rounded-3xl p-5 shadow-xs space-y-4">
                      
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <span className="font-mono text-[10px] font-bold text-accent">{b.booking_reference}</span>
                          <h3 className="font-extrabold text-base text-base-content">{b.service_title}</h3>
                          <p className="text-xs text-base-content/70">
                            Student: <strong>{b.student_name}</strong> ({b.student_age_group})
                          </p>
                          <p className="text-xs text-base-content/60">Time Slot: {b.scheduled_slot}</p>
                        </div>
                        <span className="badge badge-accent badge-sm font-bold text-white uppercase text-[10px]">
                          {b.status}
                        </span>
                      </div>

                      {/* Class Progress Tracker */}
                      <div className="bg-base-200/60 rounded-2xl p-3.5 space-y-2 border border-base-300">
                        <div className="flex items-center justify-between text-xs font-bold">
                          <span className="text-base-content/80">Class Completion Progress:</span>
                          <span className="text-accent">{done} of {total} Classes Done ({progressPct}%)</span>
                        </div>
                        <progress className="progress progress-accent w-full h-2 rounded-full" value={progressPct} max="100"></progress>
                        
                        <div className="flex items-center justify-between pt-1">
                          <span className="text-[11px] text-base-content/60">
                            Total Fee: <strong>₹{b.total_amount?.toLocaleString('en-IN')}</strong>
                          </span>
                          {done < total && (
                            <button
                              type="button"
                              onClick={() => handleMarkClassProgress(b.id, done, total)}
                              className="btn btn-accent btn-xs rounded-xl text-white font-bold gap-1"
                            >
                              <Check className="w-3 h-3" /> Mark Class {done + 1} Done
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Action Controls */}
                      <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-base-200">
                        <div className="flex items-center gap-1.5">
                          {b.status === 'requested' && (
                            <button
                              type="button"
                              onClick={() => handleUpdateStatus(b.id, 'scheduled')}
                              className="btn btn-accent btn-xs rounded-xl text-white font-bold"
                            >
                              Accept & Schedule
                            </button>
                          )}

                          {b.meeting_link && (
                            <a
                              href={b.meeting_link}
                              target="_blank"
                              rel="noreferrer"
                              className="btn btn-primary btn-xs rounded-xl text-white font-bold gap-1"
                            >
                              <Video className="w-3.5 h-3.5" /> Start Video Classroom
                            </a>
                          )}
                        </div>

                        <button
                          type="button"
                          onClick={() => handleCancelBooking(b.id)}
                          className="btn btn-ghost btn-xs text-error font-bold rounded-xl"
                        >
                          Cancel Booking
                        </button>
                      </div>

                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Completed Bookings */}
          {completedBookings.length > 0 && (
            <div className="space-y-3 pt-6 border-t border-base-200">
              <h2 className="text-base font-extrabold text-base-content flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-success" /> Completed Sessions ({completedBookings.length})
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {completedBookings.map((b) => (
                  <div key={b.id} className="card bg-base-100 border border-base-300 rounded-2xl p-4 space-y-2 opacity-90">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h4 className="font-bold text-sm text-base-content">{b.service_title}</h4>
                        <p className="text-xs text-base-content/60">Student: {b.student_name} ({b.sessions_count} sessions)</p>
                      </div>
                      <span className="badge badge-success badge-sm font-bold text-white text-[10px]">
                        COMPLETED
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-xs pt-1 border-t border-base-200">
                      <span className="font-bold text-success">Settled: ₹{b.total_amount?.toLocaleString('en-IN')}</span>
                      <span className="text-[11px] text-base-content/60">{b.scheduled_slot}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      )}

      {/* Tab 2: Published Offerings */}
      {activeTab === 'offerings' && (
        <div className="space-y-4">
          {offerings.length === 0 ? (
            <div className="card bg-base-100 border border-base-300 rounded-3xl p-8 text-center space-y-2">
              <Sparkles className="w-10 h-10 text-accent/40 mx-auto" />
              <h3 className="font-bold text-sm text-base-content">No managed services listed yet</h3>
              <p className="text-xs text-base-content/60">
                Click "Offer New Service" above to list spoken language lessons, cooking classes, or accounting mentorship.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {offerings.map((srv) => (
                <div key={srv.id} className="card bg-base-100 border border-base-300 rounded-3xl p-5 shadow-xs space-y-3 flex flex-col justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="badge badge-outline badge-xs font-semibold">{srv.category}</span>
                      <span className="badge badge-primary badge-xs font-bold text-white uppercase">{srv.mode}</span>
                    </div>
                    <h3 className="font-extrabold text-sm text-base-content line-clamp-2">{srv.title}</h3>
                    <p className="text-xs text-base-content/70 line-clamp-3">{srv.description}</p>
                  </div>

                  <div className="pt-2 border-t border-base-200 flex items-center justify-between">
                    <div>
                      <span className="font-extrabold text-primary text-sm">₹{srv.price_per_session}</span>
                      <span className="text-[10px] text-base-content/60"> / {srv.duration_mins}m</span>
                    </div>
                    <Link to={`/services/${srv.id}`} className="btn btn-ghost btn-xs text-accent font-bold rounded-lg gap-1">
                      View Public Page <ExternalLink className="w-3 h-3" />
                    </Link>
                  </div>
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
          setToastMsg('Managed service published successfully!');
          setTimeout(() => setToastMsg(''), 3500);
          fetchData();
        }}
      />

    </div>
  );
}
