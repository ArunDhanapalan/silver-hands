import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  ArrowRight,
  Sparkles, 
  Video, 
  MapPin, 
  Clock, 
  Star, 
  ShieldCheck, 
  Calendar, 
  CheckCircle2, 
  User, 
  BookOpen, 
  ExternalLink,
  RotateCcw,
  MessageSquare
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../api/client';
import ErrorAlert from '../components/common/ErrorAlert';
import LoadingSpinner from '../components/common/LoadingSpinner';

const TIME_SLOTS = [
  'Morning (9:00 AM – 10:00 AM)',
  'Afternoon (2:00 PM – 3:00 PM)',
  'Evening (5:00 PM – 6:00 PM)',
  'Night (7:00 PM – 8:00 PM)'
];

const AGE_GROUPS = [
  'Child (Age 6-12)',
  'Teenager (Age 13-18)',
  'Adult (Age 19-59)',
  'Senior (Age 60+)'
];

export default function ServiceDetailPage() {
  const { id } = useParams();
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [service, setService] = useState(null);
  const [loading, setLoading] = useState(true);
  const [booking, setBooking] = useState(false);
  const [activeBooking, setActiveBooking] = useState(null);
  const [error, setError] = useState('');
  const [toastMsg, setToastMsg] = useState('');

  // Booking Form State
  const [studentName, setStudentName] = useState(user?.full_name || 'Ananya Sharma');
  const [studentAgeGroup, setStudentAgeGroup] = useState('Child (Age 6-12)');
  const [selectedDays, setSelectedDays] = useState(['Monday', 'Wednesday', 'Friday']);
  const [selectedSlot, setSelectedSlot] = useState(TIME_SLOTS[2]);
  const [sessionsCount, setSessionsCount] = useState(3);
  const [contactPhone, setContactPhone] = useState(user?.phone || '+91 98840 56789');
  const [specialGoals, setSpecialGoals] = useState('Spoken Telugu conversation practice for school & conversational fluency');

  // Review State
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('Outstanding patience and clear explanations! Very helpful for beginners.');
  const [submittingReview, setSubmittingReview] = useState(false);

  useEffect(() => {
    const fetchService = async () => {
      setLoading(true);
      setError('');
      try {
        const data = await api.get(`/services/${id}`);
        setService(data);
      } catch (err) {
        setError(err.message || 'Service not found');
      } finally {
        setLoading(false);
      }
    };
    fetchService();
  }, [id]);

  const handleToggleDay = (day) => {
    if (selectedDays.includes(day)) {
      if (selectedDays.length > 1) setSelectedDays(selectedDays.filter(d => d !== day));
    } else {
      setSelectedDays([...selectedDays, day]);
    }
  };

  const handleCreateBooking = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    setBooking(true);
    setError('');

    try {
      const payload = {
        service_id: id,
        student_name: studentName,
        student_age_group: studentAgeGroup,
        preferred_days: selectedDays,
        preferred_time_slot: selectedSlot,
        sessions_count: sessionsCount,
        special_goals: specialGoals,
        contact_phone: contactPhone
      };

      const res = await api.post('/services/bookings', payload);
      setActiveBooking(res);
      setToastMsg('Managed service session requested successfully!');
      setTimeout(() => setToastMsg(''), 3000);
    } catch (err) {
      setError(err.message || 'Failed to submit booking.');
    } finally {
      setBooking(false);
    }
  };

  // Senior Accept / Advance state simulation for interactive testing
  const handleSimulateState = async (nextStatus) => {
    if (!activeBooking) return;
    try {
      const res = await api.put(`/services/bookings/${activeBooking.id}/status`, {
        status: nextStatus,
        meeting_link: `https://meet.silverhands.in/session-${activeBooking.booking_reference.toLowerCase()}`
      });
      setActiveBooking(res);
      setToastMsg(`Status updated to: ${nextStatus.toUpperCase()}`);
      setTimeout(() => setToastMsg(''), 3000);
    } catch (err) {
      console.error('Status update error:', err);
    }
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!activeBooking) return;
    setSubmittingReview(true);
    try {
      const res = await api.post(`/services/bookings/${activeBooking.id}/review`, {
        rating: reviewRating,
        comment: reviewComment
      });
      setActiveBooking(res);
      setToastMsg('Thank you! Your verified review has been published.');
      setTimeout(() => setToastMsg(''), 3000);
    } catch (err) {
      setError(err.message || 'Failed to submit review.');
    } finally {
      setSubmittingReview(false);
    }
  };

  if (loading) {
    return <LoadingSpinner message="Loading managed service details..." />;
  }

  if (error || !service) {
    return (
      <div className="space-y-4 max-w-xl mx-auto py-8">
        <Link to="/services" className="btn btn-ghost btn-sm gap-1">
          <ArrowLeft className="w-4 h-4" /> Back to Services
        </Link>
        <ErrorAlert message={error || "Service not found"} />
      </div>
    );
  }

  const totalPrice = service.price_per_session * sessionsCount;

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      
      {/* Toast */}
      {toastMsg && (
        <div className="toast toast-top toast-center z-50">
          <div className="alert alert-success text-white font-bold text-xs shadow-lg rounded-xl flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" />
            <span>{toastMsg}</span>
          </div>
        </div>
      )}

      {/* Breadcrumb Back */}
      <Link to="/services" className="btn btn-ghost btn-sm rounded-xl gap-1 text-xs">
        <ArrowLeft className="w-4 h-4" /> Back to Services Directory
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left: Service Details & Guru Info */}
        <div className="lg:col-span-7 space-y-6">
          
          <div className="card bg-base-100 border border-base-300 rounded-3xl p-6 sm:p-8 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <span className="badge badge-accent badge-sm font-bold text-white uppercase">{service.category}</span>
              <span className={`badge badge-sm font-bold uppercase text-[10px] ${
                service.mode === 'online' ? 'badge-info text-white' : 'badge-neutral'
              }`}>
                {service.mode === 'online' ? '💻 Online 1-on-1 Video' : '📍 In-Person'}
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-base-content leading-tight">
              {service.title}
            </h1>

            <div className="flex items-center gap-4 text-xs font-semibold text-base-content/70">
              <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5 text-primary" /> {service.duration_mins} Minutes / Session</span>
              <span>•</span>
              <span className="flex items-center gap-1"><BookOpen className="w-3.5 h-3.5 text-secondary" /> {service.target_audience}</span>
            </div>

            <p className="text-xs sm:text-sm text-base-content/80 leading-relaxed pt-2">
              {service.description}
            </p>

            {/* Guru Story Profile Card */}
            <div className="bg-base-200/70 border border-base-300 rounded-2xl p-4 space-y-2 mt-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-sm text-base-content">{service.senior_name}</h4>
                  <p className="text-[11px] text-base-content/60 flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-secondary" /> {service.senior_locality}, {service.senior_city}
                  </p>
                </div>

                <span className="badge badge-success badge-sm text-white font-bold gap-1 text-[10px]">
                  <ShieldCheck className="w-3.5 h-3.5" /> Age Verified Guru
                </span>
              </div>

              <div className="flex items-center gap-4 text-xs pt-1">
                <span className="flex items-center gap-1 font-bold text-base-content">
                  <Star className="w-3.5 h-3.5 text-warning fill-warning" /> {service.senior_rating} Rating
                </span>
                <span>•</span>
                <span className="text-base-content/60 font-medium">
                  {service.total_sessions_conducted} Verified Sessions Delivered
                </span>
              </div>
            </div>

            {/* Managed Platform Guarantee */}
            <div className="bg-accent/10 border border-accent/20 rounded-2xl p-3.5 text-xs text-accent-content flex items-start gap-2.5">
              <Sparkles className="w-4 h-4 text-accent shrink-0 mt-0.5" />
              <div>
                <strong className="text-base-content block">SilverHands Managed Workflow Guarantee</strong>
                <span className="text-[11px] text-base-content/75 leading-tight">
                  We handle the entire journey: automatic matching, scheduling, HD video room generation, reminder alerts, and post-session review.
                </span>
              </div>
            </div>

          </div>

        </div>

        {/* Right: Booking Form or Active Booking State Tracker */}
        <div className="lg:col-span-5 space-y-6">
          
          {!activeBooking ? (
            /* Booking Form */
            <div className="card bg-base-100 border border-base-300 rounded-3xl p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-base-200">
                <h3 className="font-bold text-base text-base-content">Schedule a Managed Session</h3>
                <span className="text-base font-extrabold text-primary">
                  ₹{service.price_per_session} <span className="text-xs font-normal text-base-content/60">/ session</span>
                </span>
              </div>

              <form onSubmit={handleCreateBooking} className="space-y-3.5 text-xs">
                
                <div className="form-control">
                  <label className="label text-[11px] font-semibold">Student / Learner Name</label>
                  <input 
                    type="text" 
                    required
                    value={studentName}
                    onChange={(e) => setStudentName(e.target.value)}
                    className="input input-bordered input-sm w-full rounded-xl"
                  />
                </div>

                <div className="form-control">
                  <label className="label text-[11px] font-semibold">Age Group</label>
                  <select 
                    value={studentAgeGroup}
                    onChange={(e) => setStudentAgeGroup(e.target.value)}
                    className="select select-bordered select-sm w-full rounded-xl text-xs"
                  >
                    {AGE_GROUPS.map(ag => <option key={ag} value={ag}>{ag}</option>)}
                  </select>
                </div>

                {/* Preferred Days */}
                <div className="space-y-1.5">
                  <label className="text-[11px] font-semibold text-base-content block">Preferred Days</label>
                  <div className="flex flex-wrap gap-1.5">
                    {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(day => (
                      <button
                        key={day}
                        type="button"
                        onClick={() => handleToggleDay(day)}
                        className={`px-2.5 py-1 rounded-lg text-[10px] font-bold border transition-all ${
                          selectedDays.includes(day)
                            ? 'bg-accent text-white border-accent'
                            : 'bg-base-200 border-base-300 text-base-content/70'
                        }`}
                      >
                        {day.slice(0, 3)}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Preferred Time Slot */}
                <div className="form-control">
                  <label className="label text-[11px] font-semibold">Preferred Time Slot</label>
                  <select 
                    value={selectedSlot}
                    onChange={(e) => setSelectedSlot(e.target.value)}
                    className="select select-bordered select-sm w-full rounded-xl text-xs"
                  >
                    {TIME_SLOTS.map(slot => <option key={slot} value={slot}>{slot}</option>)}
                  </select>
                </div>

                {/* Number of Sessions */}
                <div className="form-control">
                  <label className="label text-[11px] font-semibold">Number of Sessions</label>
                  <div className="join w-full">
                    {[1, 3, 5, 10].map(cnt => (
                      <button
                        key={cnt}
                        type="button"
                        onClick={() => setSessionsCount(cnt)}
                        className={`join-item btn btn-xs flex-1 ${sessionsCount === cnt ? 'btn-accent text-white font-bold' : 'btn-ghost border-base-300'}`}
                      >
                        {cnt} {cnt === 1 ? 'Session' : 'Sessions'}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Contact Phone */}
                <div className="form-control">
                  <label className="label text-[11px] font-semibold">WhatsApp / Phone for Meeting Link</label>
                  <input 
                    type="tel" 
                    required
                    value={contactPhone}
                    onChange={(e) => setContactPhone(e.target.value)}
                    className="input input-bordered input-sm w-full rounded-xl"
                  />
                </div>

                {/* Total Summary */}
                <div className="pt-3 border-t border-base-200 flex items-center justify-between text-xs font-bold">
                  <span>Total Payable ({sessionsCount} sessions):</span>
                  <span className="text-base font-extrabold text-primary">
                    ₹{totalPrice.toLocaleString('en-IN')}
                  </span>
                </div>

                <button
                  type="submit"
                  disabled={booking}
                  className="btn btn-accent w-full rounded-xl text-white font-bold text-xs gap-2 mt-2 shadow-md"
                >
                  {booking ? <span className="loading loading-spinner loading-xs"></span> : <>Request Managed Session <ArrowRight className="w-4 h-4" /></>}
                </button>
              </form>
            </div>
          ) : (
            /* Active Managed Booking State Machine Tracker */
            <div className="card bg-base-100 border-2 border-accent/40 rounded-3xl p-6 shadow-md space-y-5">
              
              <div className="flex items-center justify-between pb-3 border-b border-base-200">
                <div>
                  <span className="font-mono text-xs font-bold text-accent">{activeBooking.booking_reference}</span>
                  <h3 className="font-bold text-sm text-base-content mt-0.5">{activeBooking.service_title}</h3>
                </div>
                <span className="badge badge-accent badge-sm text-white font-bold uppercase">
                  {activeBooking.status}
                </span>
              </div>

              {/* State Machine Step Progress */}
              <div className="space-y-1.5 text-center">
                <div className="grid grid-cols-4 gap-1">
                  {['requested', 'accepted', 'scheduled', 'completed'].map((st, i) => {
                    const isDone = ['requested', 'accepted', 'scheduled', 'completed'].indexOf(activeBooking.status) >= i;
                    return (
                      <div key={st} className="space-y-1">
                        <div className={`h-2 rounded-full ${isDone ? 'bg-accent' : 'bg-base-300'}`}></div>
                        <span className={`text-[9px] font-bold uppercase ${isDone ? 'text-accent' : 'text-base-content/40'}`}>
                          {st}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Scheduled details & Meeting link */}
              <div className="bg-base-200 p-3.5 rounded-2xl space-y-2 text-xs">
                <p><strong>Learner:</strong> {activeBooking.student_name} ({activeBooking.student_age_group})</p>
                <p><strong>Scheduled Time:</strong> {activeBooking.scheduled_slot}</p>
                
                {activeBooking.meeting_link && (
                  <div className="pt-2 border-t border-base-300/50">
                    <span className="font-bold text-primary block mb-1">Live Online Video Room:</span>
                    <a 
                      href={activeBooking.meeting_link} 
                      target="_blank" 
                      rel="noreferrer"
                      className="btn btn-primary btn-xs rounded-lg text-white font-bold gap-1 w-full"
                    >
                      <Video className="w-3 h-3" /> Enter Video Classroom <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                )}
              </div>

              {/* Judge Interactive Simulator to advance state */}
              <div className="bg-base-200/60 p-3 rounded-2xl space-y-2 text-xs">
                <span className="text-[10px] font-bold text-base-content/60 uppercase block">
                  Workflow Simulator (Judge / Demo):
                </span>
                <div className="grid grid-cols-3 gap-1.5">
                  <button 
                    onClick={() => handleSimulateState('accepted')} 
                    className="btn btn-xs btn-outline btn-accent rounded-lg text-[10px]"
                  >
                    1. Accept
                  </button>
                  <button 
                    onClick={() => handleSimulateState('scheduled')} 
                    className="btn btn-xs btn-outline btn-primary rounded-lg text-[10px]"
                  >
                    2. Schedule Link
                  </button>
                  <button 
                    onClick={() => handleSimulateState('completed')} 
                    className="btn btn-xs btn-outline btn-success rounded-lg text-[10px]"
                  >
                    3. Complete
                  </button>
                </div>
              </div>

              {/* Review Form after Completion */}
              {activeBooking.status === 'completed' && !activeBooking.review_rating && (
                <form onSubmit={handleSubmitReview} className="space-y-3 pt-2 border-t border-base-200 text-xs">
                  <h4 className="font-bold text-base-content flex items-center gap-1">
                    <Star className="w-4 h-4 text-warning fill-warning" /> Rate & Review {service.senior_name}:
                  </h4>

                  <div className="flex items-center gap-2">
                    {[1, 2, 3, 4, 5].map(star => (
                      <button 
                        key={star} 
                        type="button" 
                        onClick={() => setReviewRating(star)}
                        className={`text-lg ${star <= reviewRating ? 'text-warning' : 'text-base-300'}`}
                      >
                        ★
                      </button>
                    ))}
                    <span className="font-bold text-xs ml-2">{reviewRating} / 5 Stars</span>
                  </div>

                  <textarea
                    rows={2}
                    required
                    value={reviewComment}
                    onChange={(e) => setReviewComment(e.target.value)}
                    placeholder="Share your experience..."
                    className="textarea textarea-bordered w-full text-xs rounded-xl"
                  />

                  <button
                    type="submit"
                    disabled={submittingReview}
                    className="btn btn-primary btn-sm w-full rounded-xl text-white font-bold text-xs gap-1"
                  >
                    Submit Review & Add to Guru Reputation
                  </button>
                </form>
              )}

              {/* Review Done & Rebook */}
              {activeBooking.review_rating && (
                <div className="bg-success/10 border border-success/30 p-3 rounded-2xl text-xs text-center space-y-2">
                  <div className="flex items-center justify-center gap-1 text-success font-bold">
                    <CheckCircle2 className="w-4 h-4" /> Review Published ({activeBooking.review_rating} ★)
                  </div>
                  <p className="text-base-content/75 italic text-[11px]">"{activeBooking.review_comment}"</p>
                  
                  <button
                    type="button"
                    onClick={() => setActiveBooking(null)}
                    className="btn btn-accent btn-sm rounded-xl text-white font-bold text-xs gap-1 w-full"
                  >
                    <RotateCcw className="w-3.5 h-3.5" /> 1-Click Rebook Next Lesson
                  </button>
                </div>
              )}

            </div>
          )}

        </div>

      </div>

    </div>
  );
}
