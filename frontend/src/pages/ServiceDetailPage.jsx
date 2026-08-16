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
  MessageSquare,
  Users
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../api/client';
import ErrorAlert from '../components/common/ErrorAlert';
import LoadingSpinner from '../components/common/LoadingSpinner';

const TIME_SLOTS = [
  'Morning (9:00 AM – 10:00 AM)',
  'Morning (10:00 AM – 11:00 AM)',
  'Afternoon (2:00 PM – 3:00 PM)',
  'Evening (4:00 PM – 5:00 PM)',
  'Evening (5:00 PM – 6:00 PM)',
  'Evening (6:00 PM – 7:00 PM)',
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
  const [studentName, setStudentName] = useState(user?.full_name || '');
  const [studentAgeGroup, setStudentAgeGroup] = useState('Child (Age 6-12)');
  const [selectedDays, setSelectedDays] = useState(['Monday', 'Wednesday', 'Friday']);
  const [selectedSlot, setSelectedSlot] = useState(TIME_SLOTS[4]);
  const [sessionsCount, setSessionsCount] = useState(1);
  const [contactPhone, setContactPhone] = useState(user?.phone || '');
  const [specialGoals, setSpecialGoals] = useState('Spoken language conversation practice & conversational fluency');

  useEffect(() => {
    if (user?.full_name && !studentName) setStudentName(user.full_name);
    if (user?.phone && !contactPhone) setContactPhone(user.phone);
  }, [user]);

  // Review State
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  useEffect(() => {
    const fetchService = async () => {
      setLoading(true);
      setError('');
      try {
        const data = await api.get(`/services/${id}`);
        setService(data);
        if (data.available_days?.length) setSelectedDays(data.available_days);
        if (data.time_slot) setSelectedSlot(data.time_slot);
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
      setToastMsg('Student enrolled into class batch successfully!');
      setTimeout(() => setToastMsg(''), 3500);
    } catch (err) {
      setError(err.message || 'Failed to submit booking.');
    } finally {
      setBooking(false);
    }
  };

  const handleSimulateState = async (nextStatus) => {
    if (!activeBooking) return;
    try {
      const res = await api.put(`/services/bookings/${activeBooking.id}/status`, {
        status: nextStatus
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
    return <LoadingSpinner message="Loading managed class details..." />;
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

  const enrolledCount = service.enrolled_students_count || 0;
  const isBatchFull = enrolledCount >= (service.max_students_capacity || 10);
  const remainingSeats = Math.max(0, (service.max_students_capacity || 10) - enrolledCount);
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
      <Link 
        to={user?.role === 'senior' ? '/senior/services' : '/services'} 
        className="btn btn-ghost btn-sm rounded-xl gap-1 text-xs font-bold text-base-content/70 hover:text-base-content"
      >
        <ArrowLeft className="w-4 h-4" /> {user?.role === 'senior' ? 'Back to Manage Services' : 'Back to Services Directory'}
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left: Service Details & Guru Info */}
        <div className="lg:col-span-7 space-y-6">
          
          <div className="card bg-base-100 border border-base-300 rounded-3xl p-6 sm:p-8 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <span className="badge badge-accent badge-sm font-bold text-white uppercase">{service.category}</span>
              <span className={`badge badge-sm font-bold uppercase text-[10px] ${
                service.mode === 'online' ? 'badge-primary text-white' : service.mode === 'offline' ? 'badge-neutral' : 'badge-secondary text-white'
              }`}>
                {service.mode === 'online' ? '💻 Online Video Class' : service.mode === 'offline' ? '📍 In-Person Studio' : '🔄 Hybrid (Both)'}
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-base-content leading-tight">
              {service.title}
            </h1>

            {/* Class Schedule & Days */}
            <div className="bg-base-200/60 rounded-2xl p-3.5 space-y-2 border border-base-300">
              <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                <span className="flex items-center gap-1.5 font-bold text-primary">
                  <Calendar className="w-3.5 h-3.5" />
                  {(service.available_days || []).join(', ') || 'Mon, Wed, Fri'}
                </span>
                <span className="flex items-center gap-1 font-semibold text-base-content/80">
                  <Clock className="w-3.5 h-3.5 text-secondary" />
                  {service.time_slot || 'Evening (5:00 PM – 6:00 PM)'}
                </span>
              </div>

              <div className="flex items-center justify-between text-xs pt-1 border-t border-base-300">
                <span className="flex items-center gap-1.5 font-bold text-base-content">
                  <Users className="w-3.5 h-3.5 text-accent" /> Batch Capacity: {enrolledCount} / 10 Students
                </span>
                <span className={`badge badge-sm font-bold text-[10px] ${
                  isBatchFull ? 'badge-error text-white' : 'badge-success text-white'
                }`}>
                  {isBatchFull ? 'Batch Full' : `${remainingSeats} Seats Available`}
                </span>
              </div>

              {service.mode !== 'online' && service.venue_address && (
                <p className="text-[11px] text-base-content/70 flex items-center gap-1 pt-1 border-t border-base-300">
                  <MapPin className="w-3 h-3 text-secondary shrink-0" />
                  <span>Physical Venue: <strong>{service.venue_address}</strong></span>
                </p>
              )}
            </div>

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
                {(service.senior_rating || service.rating) ? (
                  <span className="flex items-center gap-1 font-bold text-base-content">
                    <Star className="w-3.5 h-3.5 text-warning fill-warning" /> {service.senior_rating || service.rating} Rating
                    {service.total_reviews > 0 && <span className="text-base-content/60 font-normal">({service.total_reviews} reviews)</span>}
                  </span>
                ) : (
                  <span className="text-base-content/60 font-bold">New Guru (Awaiting 1st review)</span>
                )}
                <span>•</span>
                <span className="text-base-content/60 font-medium">
                  {service.total_sessions_conducted ? `${service.total_sessions_conducted} Verified Sessions Delivered` : 'Open for enrollments'}
                </span>
              </div>
            </div>

            {/* Managed Platform Guarantee */}
            <div className="bg-accent/10 border border-accent/20 rounded-2xl p-3.5 text-xs text-accent-content flex items-start gap-2.5">
              <Sparkles className="w-4 h-4 text-accent shrink-0 mt-0.5" />
              <div>
                <strong className="text-base-content block">SilverHands Managed Class Guarantee</strong>
                <span className="text-[11px] text-base-content/75 leading-tight">
                  We handle the entire journey: automatic matching, scheduling, HD video room generation, reminder alerts, and post-session review.
                </span>
              </div>
            </div>

          </div>

        </div>

        {/* Right: Booking Form or Active Booking State Tracker */}
        <div className="lg:col-span-5 space-y-6">
          
          {user?.role === 'senior' ? (
            <div className="card bg-base-100 border border-base-300 rounded-3xl p-6 shadow-sm space-y-3 text-center">
              <span className="badge badge-accent badge-sm font-bold text-white uppercase mx-auto">Senior Guru Mode</span>
              <h3 className="font-bold text-base text-base-content">Service Catalog View</h3>
              <p className="text-xs text-base-content/70 leading-relaxed">
                Learner enrollment is enabled for customers and parents. To manage your active class batches and student rosters, visit your <strong>Manage Services</strong> hub.
              </p>
              <Link to="/senior/services" className="btn btn-accent btn-sm rounded-xl text-white font-bold text-xs gap-1 mt-2">
                Go to Manage Services Hub
              </Link>
            </div>
          ) : !activeBooking ? (
            /* Booking Form */
            <div className="card bg-base-100 border border-base-300 rounded-3xl p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-base-200">
                <h3 className="font-bold text-base text-base-content">Enroll into Class Batch</h3>
                <span className="text-base font-extrabold text-primary">
                  ₹{service.price_per_session} <span className="text-xs font-normal text-base-content/60">/ session</span>
                </span>
              </div>

              {isBatchFull ? (
                <div className="p-4 rounded-2xl bg-error/10 border border-error/20 text-center space-y-2">
                  <span className="badge badge-error text-white font-extrabold">Batch Full</span>
                  <p className="text-xs font-bold text-error">
                    This class batch has reached its maximum limit of 10 students. Please check back later or explore other guru classes.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleCreateBooking} className="space-y-4 text-sm">
                  
                  <div className="form-control">
                    <label className="label text-xs font-bold py-1">Student / Learner Name</label>
                    <input 
                      type="text" 
                      required
                      value={studentName}
                      onChange={(e) => setStudentName(e.target.value)}
                      className="input input-bordered min-h-[44px] w-full rounded-xl text-sm"
                    />
                  </div>

                  <div className="form-control">
                    <label className="label text-xs font-bold py-1">Age Group</label>
                    <select 
                      value={studentAgeGroup}
                      onChange={(e) => setStudentAgeGroup(e.target.value)}
                      className="select select-bordered min-h-[44px] w-full rounded-xl text-sm"
                    >
                      {AGE_GROUPS.map(ag => <option key={ag} value={ag}>{ag}</option>)}
                    </select>
                  </div>

                  {/* Allotted Class Days */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-base-content block py-1 flex items-center justify-between">
                      <span>Scheduled Class Days (Allotted by Senior)</span>
                      <span className="text-[10px] text-accent font-semibold">Select your attending days</span>
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {(service.available_days && service.available_days.length > 0 ? service.available_days : ['Monday', 'Wednesday', 'Friday']).map(day => (
                        <button
                          key={day}
                          type="button"
                          onClick={() => handleToggleDay(day)}
                          className={`min-h-[38px] px-3.5 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                            selectedDays.includes(day)
                              ? 'bg-accent text-white border-accent shadow-xs'
                              : 'bg-base-200 border-base-300 text-base-content/70 hover:bg-base-300'
                          }`}
                        >
                          {day}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Allotted Time Slot */}
                  <div className="form-control">
                    <label className="label text-xs font-bold py-1">Class Schedule Time Slot</label>
                    <input
                      type="text"
                      readOnly
                      value={service.time_slot || 'Evening (5:00 PM – 6:00 PM)'}
                      className="input input-bordered min-h-[44px] w-full rounded-xl text-sm font-bold bg-base-200 text-primary cursor-default"
                    />
                  </div>

                  {/* Number of Sessions Chooser */}
                  <div className="form-control">
                    <label className="label text-xs font-bold py-1">Number of Sessions</label>
                    <div className="grid grid-cols-4 gap-1.5 w-full">
                      {[1, 3, 5, 10].map(cnt => (
                        <button
                          key={cnt}
                          type="button"
                          onClick={() => setSessionsCount(cnt)}
                          className={`min-h-[40px] px-1.5 py-1.5 rounded-xl text-xs font-bold border transition-all text-center truncate ${
                            sessionsCount === cnt 
                              ? 'bg-accent text-white border-accent shadow-xs' 
                              : 'bg-base-200 border-base-300 text-base-content/70 hover:bg-base-300'
                          }`}
                        >
                          {cnt} {cnt === 1 ? 'Class' : 'Classes'}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Contact Phone */}
                  <div className="form-control">
                    <label className="label text-xs font-bold py-1">WhatsApp / Phone for Class Link</label>
                    <input 
                      type="tel" 
                      required
                      value={contactPhone}
                      onChange={(e) => setContactPhone(e.target.value)}
                      className="input input-bordered min-h-[44px] w-full rounded-xl text-sm"
                    />
                  </div>

                  {/* Total Summary */}
                  <div className="pt-3 border-t border-base-200 flex items-center justify-between text-sm font-bold">
                    <span>Total Payable ({sessionsCount} sessions):</span>
                    <span className="text-xl font-extrabold text-primary">
                      ₹{totalPrice.toLocaleString('en-IN')}
                    </span>
                  </div>

                  <button
                    type="submit"
                    disabled={booking}
                    className="btn btn-accent min-h-[48px] w-full rounded-2xl text-white font-bold text-sm gap-2 mt-2 shadow-md"
                  >
                    {booking ? <span className="loading loading-spinner loading-xs"></span> : <>Enroll into Class Batch <ArrowRight className="w-4 h-4" /></>}
                  </button>
                </form>
              )}
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

              {/* Action Buttons */}
              <div className="flex items-center justify-between gap-2 pt-2 border-t border-base-200">
                <Link to="/customer/services" className="btn btn-primary btn-sm rounded-xl text-white font-bold text-xs w-full">
                  View All My Booked Classes
                </Link>
              </div>

            </div>
          )}

        </div>

      </div>

      {/* Customer Reviews & Feedback Section */}
      <div className="card bg-base-100 border border-base-300 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-base-200">
          <div>
            <h2 className="text-lg font-extrabold text-base-content flex items-center gap-2">
              <Star className="w-5 h-5 text-warning fill-warning" /> Customer Reviews & Guru Feedback
            </h2>
            <p className="text-xs text-base-content/60 mt-0.5">
              Authentic feedback from learners and parents in your community.
            </p>
          </div>

          <div className="flex items-center gap-3 bg-warning/10 border border-warning/25 px-4 py-2 rounded-2xl">
            <span className="text-2xl font-black text-warning flex items-center gap-1">
              {(service.rating || service.senior_rating) ? (
                <>
                  <Star className="w-6 h-6 fill-warning" /> {service.rating || service.senior_rating}
                </>
              ) : (
                <span className="text-xs font-bold text-base-content/60">New</span>
              )}
            </span>
            <div className="text-left">
              <span className="text-xs font-bold text-base-content block">Guru Rating</span>
              <span className="text-[10px] text-base-content/60 font-semibold">{service.reviews?.length || service.total_reviews || 0} Review(s)</span>
            </div>
          </div>
        </div>

        {/* Reviews List */}
        {(!service.reviews || service.reviews.length === 0) ? (
          <div className="p-6 bg-base-200/50 rounded-2xl text-center space-y-1">
            <p className="text-xs font-bold text-base-content">Open for Enrollments</p>
            <p className="text-[11px] text-base-content/60">Enroll in this class batch to learn and leave the first verified review!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {service.reviews.map((rev, idx) => (
              <div key={idx} className="bg-base-200/50 border border-base-300 rounded-2xl p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-base-content">{rev.customer_name || 'Verified Learner'}</span>
                  <div className="flex items-center gap-0.5 text-warning">
                    {[...Array(Number(rev.rating) || 5)].map((_, i) => (
                      <Star key={i} className="w-3.5 h-3.5 fill-warning" />
                    ))}
                  </div>
                </div>
                <p className="text-xs text-base-content/80 italic leading-relaxed">"{rev.comment}"</p>
                {rev.created_at && <span className="text-[10px] text-base-content/40 block">{rev.created_at.slice(0, 10)}</span>}
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}
