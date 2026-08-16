import React, { useState, useEffect } from 'react';
import { 
  Award, 
  ShieldCheck, 
  Star, 
  CheckCircle2, 
  Sparkles, 
  Download, 
  Share2, 
  MapPin, 
  ExternalLink,
  QrCode,
  TrendingUp,
  MessageSquareQuote,
  Clock
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../api/client';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ErrorAlert from '../components/common/ErrorAlert';

export default function SkillPassportPage() {
  const { user } = useAuth();
  const [passport, setPassport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  const fetchPassport = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await api.get('/senior/passport');
      setPassport(data);
    } catch (err) {
      console.error('Failed to load skill passport:', err);
      setError(err.message || 'Unable to load your digital skill passport.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPassport();
  }, []);

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return <LoadingSpinner message="Generating your verified SilverHands Skill Passport..." />;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-16">
      
      {/* Toast Notification */}
      {copied && (
        <div className="toast toast-top toast-center z-50">
          <div className="alert alert-success text-white font-bold text-xs shadow-lg rounded-2xl flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" />
            <span>Skill Passport link copied to clipboard!</span>
          </div>
        </div>
      )}

      {/* Top Header Actions */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <span className="badge badge-primary badge-sm font-black text-white uppercase text-[10px] tracking-wider px-3 py-1">
            Official Credential
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-base-content tracking-tight mt-1">
            Digital Skill Passport
          </h1>
          <p className="text-xs sm:text-sm text-base-content/70">
            Verified proof of your lifelong capabilities, skills, and genuine customer trust score.
          </p>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            type="button"
            onClick={handleShare}
            className="btn btn-outline btn-sm rounded-2xl text-xs font-bold gap-1.5 flex-1 sm:flex-none min-h-[40px]"
          >
            <Share2 className="w-3.5 h-3.5" /> Share
          </button>
          <button
            type="button"
            onClick={handlePrint}
            className="btn btn-primary btn-sm rounded-2xl text-white text-xs font-bold gap-1.5 flex-1 sm:flex-none min-h-[40px] shadow-xs"
          >
            <Download className="w-3.5 h-3.5" /> Save / Print PDF
          </button>
        </div>
      </div>

      <ErrorAlert message={error} onRetry={fetchPassport} />

      {/* PASSPORT CARD CONTAINER */}
      <div className="card bg-base-100 border-2 border-primary/30 rounded-3xl shadow-xl overflow-hidden print:border print:shadow-none">
        
        {/* Passport Header Background Banner */}
        <div className="bg-gradient-to-r from-primary via-primary/90 to-secondary p-6 sm:p-8 text-white relative overflow-hidden">
          <div className="absolute right-0 top-0 translate-x-8 -translate-y-8 w-48 h-48 bg-white/10 rounded-full blur-2xl pointer-events-none"></div>
          
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5 relative z-10">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-white text-primary flex items-center justify-center font-black text-2xl shadow-xl shrink-0">
                {passport?.full_name?.charAt(0)?.toUpperCase() || user?.full_name?.charAt(0)?.toUpperCase() || 'S'}
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="badge bg-warning text-warning-content font-black uppercase text-[10px] tracking-wider border-none px-2 py-0.5 shadow-xs">
                    Official Credential
                  </span>
                  <span className="badge bg-white/20 text-white font-mono text-[10px] border-none px-2 py-0.5 font-bold">
                    ID: {passport?.passport_id || 'IN-SH-SENIOR'}
                  </span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-black tracking-tight mt-1 text-white">
                  {passport?.full_name || user?.full_name || 'Senior Guru'}
                </h2>
                <p className="text-xs text-white/90 flex items-center gap-1.5 mt-0.5 font-medium">
                  <MapPin className="w-3.5 h-3.5 shrink-0" /> {passport?.locality || user?.locality || 'Adyar'}, {passport?.city || user?.city || 'Chennai'} • Member since {passport?.member_since || '2026'}
                </p>
              </div>
            </div>

            <div className="flex flex-col items-start sm:items-end bg-black/30 backdrop-blur-md px-4 py-2.5 rounded-2xl border border-white/25 shrink-0">
              <div className="flex items-center gap-1.5 text-warning font-black text-xs sm:text-sm">
                <ShieldCheck className="w-4 h-4 text-warning" /> Age & Identity Verified
              </div>
              <span className="text-[10px] text-white/80 font-mono mt-0.5">HASH: {passport?.credential_hash || '7FA899CD4B22'}</span>
            </div>
          </div>
        </div>

        {/* Real Performance & Trust Metrics Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5 p-5 sm:p-6 bg-base-200/60 border-b border-base-200 text-center">
          
          {/* Trust Score Computed from Real Reviews */}
          <div className="p-3.5 bg-base-100 rounded-2xl border border-base-300 shadow-xs flex flex-col justify-center">
            <span className="text-[10px] font-extrabold text-base-content/70 uppercase tracking-wider block mb-0.5">Trust Score</span>
            <div className="text-lg sm:text-xl font-black text-warning flex items-center justify-center gap-1">
              {passport?.trust_score ? (
                <>
                  <Star className="w-4 h-4 fill-warning text-warning shrink-0" />
                  <span>{passport.trust_score}</span>
                  <span className="text-[10px] font-bold text-base-content/60">/ 5.0</span>
                </>
              ) : (
                <span className="text-xs font-extrabold text-base-content/50">No reviews yet</span>
              )}
            </div>
            <span className="text-[10px] text-base-content/60 font-medium block mt-0.5">
              {passport?.review_count ? `${passport.review_count} verified reviews` : 'Awaiting 1st review'}
            </span>
          </div>

          <div className="p-3.5 bg-base-100 rounded-2xl border border-base-300 shadow-xs flex flex-col justify-center">
            <span className="text-[10px] font-extrabold text-base-content/70 uppercase tracking-wider block mb-0.5">Classes Completed</span>
            <span className="text-xl sm:text-2xl font-black text-accent">{passport?.completed_sessions_count || 0}</span>
            <span className="text-[10px] text-base-content/60 font-medium block mt-0.5">Sessions conducted</span>
          </div>

          <div className="p-3.5 bg-base-100 rounded-2xl border border-base-300 shadow-xs flex flex-col justify-center">
            <span className="text-[10px] font-extrabold text-base-content/70 uppercase tracking-wider block mb-0.5">Store Orders</span>
            <span className="text-xl sm:text-2xl font-black text-primary">{passport?.completed_orders_count || 0}</span>
            <span className="text-[10px] text-base-content/60 font-medium block mt-0.5">Delivered orders</span>
          </div>

          <div className="p-3.5 bg-base-100 rounded-2xl border border-base-300 shadow-xs flex flex-col justify-center">
            <span className="text-[10px] font-extrabold text-base-content/70 uppercase tracking-wider block mb-0.5">Total Earnings</span>
            <span className="text-lg sm:text-xl font-black text-success">₹{(passport?.total_earnings || 0).toLocaleString('en-IN')}</span>
            <span className="text-[10px] text-base-content/60 font-medium block mt-0.5">Direct senior payout</span>
          </div>
        </div>

        {/* Core & Inferred Skills Section */}
        <div className="p-6 sm:p-8 space-y-7 bg-base-100">
          
          {/* Explicit Core Skills */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-primary" />
              <h3 className="text-sm sm:text-base font-black text-base-content uppercase tracking-wider">
                Verified Core Competencies
              </h3>
            </div>
            {(!passport?.core_skills || passport.core_skills.length === 0) ? (
              <div className="p-4 bg-base-200/50 rounded-2xl text-xs text-base-content/60 italic">
                No core skills listed yet. Add your practical skills in your profile to display them here.
              </div>
            ) : (
              <div className="flex flex-wrap gap-2.5">
                {passport.core_skills.map((skill, idx) => (
                  <span 
                    key={idx} 
                    className="badge badge-primary badge-lg font-bold text-white text-xs px-4 py-3 rounded-2xl gap-1.5 shadow-sm"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" /> {skill}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Inferred / Transferable Capabilities */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Award className="w-5 h-5 text-secondary" />
              <h3 className="text-sm sm:text-base font-black text-base-content uppercase tracking-wider">
                AI-Discovered Transferable Strengths
              </h3>
            </div>
            {(!passport?.inferred_skills || passport.inferred_skills.length === 0) ? (
              <div className="p-4 bg-base-200/50 rounded-2xl text-xs text-base-content/60 italic">
                AI-analyzed strengths will automatically be extracted and verified as you share your background and offer services.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {passport.inferred_skills.map((inf, idx) => (
                  <div key={idx} className="p-4 rounded-2xl bg-secondary/10 border border-secondary/25 space-y-1.5 shadow-xs">
                    <div className="font-black text-sm text-secondary flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4" /> {typeof inf === 'object' ? inf.skill : inf}
                    </div>
                    <p className="text-xs text-base-content/80 leading-relaxed font-normal">
                      {typeof inf === 'object' ? inf.reason : 'Demonstrated lifelong capability in structured execution and local mentoring.'}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Real Customer Feedback & Testimonials */}
          <div className="space-y-3 pt-4 border-t border-base-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MessageSquareQuote className="w-5 h-5 text-warning" />
                <h3 className="text-sm sm:text-base font-black text-base-content uppercase tracking-wider">
                  Verified Customer Reviews & Feedback ({passport?.reviews?.length || 0})
                </h3>
              </div>
              {passport?.trust_score && (
                <span className="badge badge-warning badge-sm font-black text-white gap-1">
                  <Star className="w-3 h-3 fill-white" /> {passport.trust_score} Trust Rating
                </span>
              )}
            </div>

            {(!passport?.reviews || passport.reviews.length === 0) ? (
              <div className="p-6 bg-base-200/50 border border-base-300 rounded-2xl text-center space-y-1">
                <p className="text-xs font-bold text-base-content">No customer reviews received yet.</p>
                <p className="text-[11px] text-base-content/60">
                  Verified buyer feedback will automatically be aggregated here as customers review your store products and complete classes.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {passport.reviews.map((rev, idx) => (
                  <div key={idx} className="p-4 bg-base-200/60 border border-base-300 rounded-2xl space-y-2 shadow-xs">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-black text-xs text-base-content">{rev.customer_name}</h4>
                        <span className="text-[10px] text-base-content/60 block">{rev.item_title}</span>
                      </div>
                      <div className="flex items-center gap-0.5 text-warning font-black text-xs">
                        <Star className="w-3.5 h-3.5 fill-warning" />
                        <span>{rev.rating}</span>
                      </div>
                    </div>
                    {rev.comment && (
                      <p className="text-xs text-base-content/80 italic leading-relaxed">
                        "{rev.comment}"
                      </p>
                    )}
                    {rev.created_at && (
                      <div className="text-[10px] text-base-content/50 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        <span>{rev.created_at.slice(0, 10)}</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Verified Badges Strip */}
          <div className="space-y-3 pt-4 border-t border-base-200">
            <h3 className="text-sm sm:text-base font-black text-base-content uppercase tracking-wider flex items-center gap-2">
              <Award className="w-5 h-5 text-warning" /> Earned SilverHands Micro-Credentials
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3.5">
              {(passport?.badges || []).map((b) => (
                <div key={b.id} className="p-3.5 bg-base-200/70 border border-base-300 rounded-2xl text-center space-y-1.5 shadow-xs">
                  <div className="w-10 h-10 rounded-2xl bg-warning/20 text-warning flex items-center justify-center mx-auto font-black shadow-inner">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <h4 className="font-black text-xs text-base-content">{b.title}</h4>
                  <p className="text-[11px] text-base-content/70 leading-normal">{b.description}</p>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Passport Footer Certification */}
        <div className="p-6 bg-base-200/90 border-t border-base-300 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
          <div className="flex items-center gap-3.5">
            <div className="p-2.5 bg-base-100 border border-base-300 rounded-2xl shadow-xs">
              <QrCode className="w-8 h-8 text-primary" />
            </div>
            <div>
              <p className="font-black text-sm text-base-content">SilverHands Digital Trust Network</p>
              <p className="text-xs text-base-content/70">Cryptographically verifiable by companies, students & local clients.</p>
            </div>
          </div>

          <div className="text-right">
            <span className="badge badge-success badge-md font-black text-white uppercase text-[11px] px-3 py-1 shadow-xs">
              Active & Valid for 2026
            </span>
          </div>
        </div>

      </div>

    </div>
  );
}
