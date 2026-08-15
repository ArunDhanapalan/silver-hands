import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  BookOpen, 
  Video, 
  Clock, 
  Star, 
  CheckCircle2, 
  ExternalLink, 
  ArrowLeft, 
  AlertCircle,
  Sparkles,
  Calendar,
  X
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../api/client';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ErrorAlert from '../components/common/ErrorAlert';

export default function CustomerServicesPage() {
  const { user } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [toastMsg, setToastMsg] = useState('');

  // Review Modal state
  const [reviewBookingId, setReviewBookingId] = useState(null);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  const fetchBookings = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await api.get('/services/bookings/my-bookings');
      setBookings(data || []);
    } catch (err) {
      setError(err.message || 'Failed to load booked services');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const handleCancel = async (bookingId) => {
    if (!window.confirm('Are you sure you want to cancel this booking?')) return;
    try {
      await api.put(`/services/bookings/${bookingId}/cancel`, {});
      setToastMsg('Booking cancelled successfully.');
      setTimeout(() => setToastMsg(''), 3500);
      fetchBookings();
    } catch (err) {
      setError(err.message || 'Failed to cancel booking');
    }
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    setSubmittingReview(true);
    try {
      await api.post(`/services/bookings/${reviewBookingId}/review`, {
        rating: reviewRating,
        comment: reviewComment
      });
      setToastMsg('Thank you for rating your Senior Guru!');
      setTimeout(() => setToastMsg(''), 3500);
      setReviewBookingId(null);
      setReviewComment('');
      fetchBookings();
    } catch (err) {
      setError(err.message || 'Failed to submit review');
    } finally {
      setSubmittingReview(false);
    }
  };

  if (loading) {
    return <LoadingSpinner message="Loading your booked mentor & language sessions..." />;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-16">
      
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
          <h1 className="text-2xl sm:text-3xl font-extrabold text-base-content">
            My Booked Sessions & Classes
          </h1>
          <p className="text-xs text-base-content/70 mt-1">
            Track your 1-on-1 language lessons, view class progress, join live video classrooms, and rate your mentors.
          </p>
        </div>

        <Link to="/services" className="btn btn-primary btn-sm rounded-xl text-white font-bold text-xs gap-1.5 shadow-sm">
          <Sparkles className="w-4 h-4" /> Explore More Gurus
        </Link>
      </div>

      <ErrorAlert message={error} />

      {bookings.length === 0 ? (
        <div className="card bg-base-100 border border-base-300 rounded-3xl p-10 text-center space-y-3">
          <BookOpen className="w-12 h-12 text-base-content/30 mx-auto" />
          <h3 className="font-bold text-base text-base-content">You haven't booked any sessions yet</h3>
          <p className="text-xs text-base-content/60 max-w-md mx-auto">
            Discover senior masters who teach spoken Telugu, Tamil, Vedic maths, Carnatic music, and culinary skills.
          </p>
          <Link to="/services" className="btn btn-primary btn-sm rounded-xl text-white font-bold mt-2">
            Browse Managed Services
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {bookings.map((b) => {
            const total = b.sessions_count || 1;
            const done = b.completed_sessions_count || 0;
            const progressPct = Math.min(100, Math.round((done / total) * 100));

            return (
              <div key={b.id} className="card bg-base-100 border-2 border-base-300 rounded-3xl p-5 shadow-xs space-y-4">
                
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-[10px] font-bold text-primary">{b.booking_reference}</span>
                      <span className="badge badge-outline badge-xs font-semibold">{b.category}</span>
                    </div>
                    <h3 className="font-extrabold text-base text-base-content mt-1">{b.service_title}</h3>
                    <p className="text-xs text-base-content/70">
                      Senior Guru: <strong>{b.senior_name}</strong> • Student: <strong>{b.student_name}</strong>
                    </p>
                    <p className="text-xs text-base-content/60 flex items-center gap-1 mt-0.5">
                      <Clock className="w-3 h-3 text-accent" /> {b.scheduled_slot}
                    </p>
                  </div>

                  <div className="flex flex-col sm:items-end gap-1">
                    <span className={`badge badge-sm font-bold uppercase text-[10px] ${
                      b.status === 'completed' ? 'badge-success text-white' :
                      b.status === 'cancelled' ? 'badge-error text-white' :
                      'badge-accent text-white'
                    }`}>
                      {b.status}
                    </span>
                    <span className="text-sm font-extrabold text-primary">₹{b.total_amount?.toLocaleString('en-IN')}</span>
                  </div>
                </div>

                {/* Progress bar */}
                {b.status !== 'cancelled' && (
                  <div className="bg-base-200/60 rounded-2xl p-3 space-y-1.5 border border-base-300">
                    <div className="flex items-center justify-between text-xs font-bold">
                      <span className="text-base-content/70">Curriculum Progress:</span>
                      <span className="text-primary">{done} of {total} Classes Done ({progressPct}%)</span>
                    </div>
                    <progress className="progress progress-primary w-full h-2 rounded-full" value={progressPct} max="100"></progress>
                  </div>
                )}

                {/* Actions */}
                <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-base-200">
                  <div className="flex items-center gap-2">
                    {b.meeting_link && b.status !== 'cancelled' && b.status !== 'completed' && (
                      <a
                        href={b.meeting_link}
                        target="_blank"
                        rel="noreferrer"
                        className="btn btn-primary btn-sm min-h-[44px] rounded-xl text-white font-bold gap-1"
                      >
                        <Video className="w-3.5 h-3.5" /> Enter Live Video Classroom
                      </a>
                    )}

                    {b.status === 'completed' && !b.review_rating && (
                      <button
                        type="button"
                        onClick={() => setReviewBookingId(b.id)}
                        className="btn btn-warning btn-sm min-h-[44px] rounded-xl text-black font-bold gap-1"
                      >
                        <Star className="w-3.5 h-3.5" /> Rate & Review Guru
                      </button>
                    )}

                    {b.review_rating && (
                      <span className="text-xs font-bold text-warning flex items-center gap-1">
                        <Star className="w-3.5 h-3.5 fill-warning" /> Your Rating: {b.review_rating}/5
                      </span>
                    )}
                  </div>

                  {b.status !== 'completed' && b.status !== 'cancelled' && (
                    <button
                      type="button"
                      onClick={() => handleCancel(b.id)}
                      className="btn btn-ghost btn-sm min-h-[44px] text-error font-bold rounded-xl"
                    >
                      Cancel Booking
                    </button>
                  )}
                </div>

              </div>
            );
          })}
        </div>
      )}

      {/* Rate & Review Modal */}
      {reviewBookingId && (
        <div className="fixed inset-0 z-[999999] bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-base-100 border border-base-300 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-base-200 pb-2">
              <h3 className="font-extrabold text-base text-base-content flex items-center gap-1.5">
                <Star className="w-4 h-4 text-warning" /> Rate Your Guru
              </h3>
              <button onClick={() => setReviewBookingId(null)} className="btn btn-ghost btn-sm min-h-[44px] btn-circle">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmitReview} className="space-y-4">
              <div className="form-control">
                <label className="label text-xs font-bold">Rating (1 to 5 Stars)</label>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      type="button"
                      key={star}
                      onClick={() => setReviewRating(star)}
                      className="btn btn-ghost btn-circle btn-sm p-0"
                    >
                      <Star className={`w-6 h-6 ${star <= reviewRating ? 'text-warning fill-warning' : 'text-base-content/30'}`} />
                    </button>
                  ))}
                  <span className="font-bold text-sm ml-2">{reviewRating} Stars</span>
                </div>
              </div>

              <div className="form-control">
                <label className="label text-xs font-bold">Your Feedback / Review</label>
                <textarea
                  rows={3}
                  required
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  placeholder="How was the teaching style, patience, and curriculum clarity?"
                  className="textarea textarea-bordered text-xs rounded-xl"
                />
              </div>

              <div className="modal-action pt-2">
                <button type="button" onClick={() => setReviewBookingId(null)} className="btn btn-ghost btn-sm rounded-xl">
                  Cancel
                </button>
                <button type="submit" disabled={submittingReview} className="btn btn-primary btn-sm rounded-xl text-white font-bold">
                  {submittingReview ? <span className="loading loading-spinner loading-xs"></span> : 'Submit Rating'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
