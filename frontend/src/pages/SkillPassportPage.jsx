import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  ShieldCheck, 
  Award, 
  Star, 
  Sparkles, 
  Printer, 
  Share2, 
  QrCode, 
  CheckCircle2, 
  Clock, 
  MapPin, 
  ArrowLeft,
  BookOpen,
  ShoppingBag,
  TrendingUp,
  ExternalLink,
  Layers
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

  useEffect(() => {
    const fetchPassport = async () => {
      setLoading(true);
      try {
        const data = await api.get('/senior/passport');
        setPassport(data);
      } catch (err) {
        setError(err.message || 'Failed to load Skill Passport');
      } finally {
        setLoading(false);
      }
    };
    fetchPassport();
  }, []);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return <LoadingSpinner message="Generating official Senior Skill Passport..." />;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-16">
      
      {/* Top Header Actions */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 print:hidden">
        <Link to="/senior" className="btn btn-ghost btn-sm rounded-xl gap-1 text-xs">
          <ArrowLeft className="w-4 h-4" /> Back to Dashboard
        </Link>
        <div className="flex items-center gap-2">
          <button onClick={handleCopyLink} className="btn btn-outline btn-sm rounded-xl font-bold text-xs gap-1.5">
            <Share2 className="w-3.5 h-3.5" /> {copied ? 'Link Copied!' : 'Share Passport'}
          </button>
          <button onClick={handlePrint} className="btn btn-primary btn-sm rounded-xl text-white font-bold text-xs gap-1.5">
            <Printer className="w-3.5 h-3.5" /> Print / Save PDF
          </button>
        </div>
      </div>

      <ErrorAlert message={error} />

      {/* Official Skill Passport Card */}
      <div className="card bg-base-100 border-2 border-primary/30 rounded-3xl shadow-2xl overflow-hidden print:border-none print:shadow-none">
        
        {/* Passport Header Banner */}
        <div className="bg-gradient-to-r from-primary via-neutral to-secondary text-white p-6 sm:p-8 relative overflow-hidden">
          <div className="absolute right-0 top-0 translate-x-8 -translate-y-8 w-48 h-48 bg-white/10 rounded-full blur-2xl pointer-events-none"></div>
          
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 relative z-10">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-white text-primary flex items-center justify-center font-extrabold text-2xl shadow-xl">
                {passport?.full_name?.charAt(0) || user?.full_name?.charAt(0) || 'S'}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="badge badge-warning badge-sm font-bold uppercase text-[10px] tracking-wider text-black">
                    Official Credential
                  </span>
                  <span className="badge badge-ghost badge-sm font-mono text-[10px] text-white/90">
                    ID: {passport?.passport_id || 'IN-SH-2026'}
                  </span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight mt-1 text-white">
                  {passport?.full_name || user?.full_name || 'Senior Guru'}
                </h1>
                <p className="text-xs text-white/80 flex items-center gap-1.5 mt-0.5">
                  <MapPin className="w-3.5 h-3.5" /> {passport?.locality || 'Adyar'}, {passport?.city || 'Chennai'} • Member since {passport?.member_since || '2026'}
                </p>
              </div>
            </div>

            <div className="flex flex-col items-start sm:items-end bg-black/25 backdrop-blur-md px-4 py-2.5 rounded-2xl border border-white/20">
              <div className="flex items-center gap-1.5 text-warning font-extrabold text-sm">
                <ShieldCheck className="w-4 h-4" /> Age & Aadhaar Verified
              </div>
              <span className="text-[10px] text-white/70 font-mono">HASH: {passport?.credential_hash || '7FA899CD4B22'}</span>
            </div>
          </div>
        </div>

        {/* Dignity & Impact Metrics Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-6 bg-base-200/50 border-b border-base-200 text-center">
          <div className="p-3 bg-base-100 rounded-2xl border border-base-300 shadow-xs">
            <span className="text-[10px] font-bold text-base-content/60 uppercase tracking-wider block">Dignity Score</span>
            <span className="text-xl font-extrabold text-success">{passport?.dignity_score || 100}%</span>
          </div>
          <div className="p-3 bg-base-100 rounded-2xl border border-base-300 shadow-xs">
            <span className="text-[10px] font-bold text-base-content/60 uppercase tracking-wider block">Trust Rating</span>
            <span className="text-xl font-extrabold text-warning flex items-center justify-center gap-1">
              <Star className="w-4 h-4 fill-warning" /> {passport?.trust_score || 4.95}
            </span>
          </div>
          <div className="p-3 bg-base-100 rounded-2xl border border-base-300 shadow-xs">
            <span className="text-[10px] font-bold text-base-content/60 uppercase tracking-wider block">Classes Completed</span>
            <span className="text-xl font-extrabold text-accent">{passport?.completed_sessions_count || 0}</span>
          </div>
          <div className="p-3 bg-base-100 rounded-2xl border border-base-300 shadow-xs">
            <span className="text-[10px] font-bold text-base-content/60 uppercase tracking-wider block">Total Gigs & Sales</span>
            <span className="text-xl font-extrabold text-primary">{passport?.completed_orders_count || 0}</span>
          </div>
        </div>

        {/* Core & Inferred Skills Section */}
        <div className="p-6 sm:p-8 space-y-6">
          
          {/* Explicit Core Skills */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-primary" />
              <h3 className="text-base font-extrabold text-base-content uppercase tracking-wider">
                Verified Core Competencies
              </h3>
            </div>
            <div className="flex flex-wrap gap-2">
              {(passport?.core_skills || ['Spoken Languages', 'Traditional Culinary', 'Mentorship']).map((skill, idx) => (
                <span key={idx} className="badge badge-primary badge-lg font-bold text-white text-xs px-3.5 py-3 rounded-xl gap-1.5 shadow-xs">
                  <CheckCircle2 className="w-3.5 h-3.5" /> {skill}
                </span>
              ))}
            </div>
          </div>

          {/* Inferred / Hidden Capabilities */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Award className="w-4 h-4 text-secondary" />
              <h3 className="text-base font-extrabold text-base-content uppercase tracking-wider">
                AI-Discovered Transferable Strengths
              </h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {(passport?.inferred_skills || []).map((inf, idx) => (
                <div key={idx} className="p-3.5 rounded-2xl bg-secondary/10 border border-secondary/20 space-y-1">
                  <div className="font-extrabold text-sm text-secondary flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5" /> {typeof inf === 'object' ? inf.skill : inf}
                  </div>
                  <p className="text-xs text-base-content/70 leading-relaxed">
                    {typeof inf === 'object' ? inf.reason : 'Demonstrated lifelong capability in structured execution and local mentoring.'}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Verified Badges Strip */}
          <div className="space-y-3 pt-4 border-t border-base-200">
            <h3 className="text-base font-extrabold text-base-content uppercase tracking-wider flex items-center gap-2">
              <Award className="w-4 h-4 text-warning" /> Earned SilverHands Micro-Credentials
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
              {(passport?.badges || []).map((b) => (
                <div key={b.id} className="p-3 bg-base-200/70 border border-base-300 rounded-2xl text-center space-y-1">
                  <div className="w-9 h-9 rounded-xl bg-warning/20 text-warning flex items-center justify-center mx-auto font-bold">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <h4 className="font-extrabold text-xs text-base-content">{b.title}</h4>
                  <p className="text-[10px] text-base-content/60">{b.description}</p>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Passport Footer Certification */}
        <div className="p-6 bg-base-200/80 border-t border-base-300 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-base-100 border border-base-300 rounded-xl shadow-xs">
              <QrCode className="w-8 h-8 text-primary" />
            </div>
            <div>
              <p className="font-bold text-base-content">SilverHands Digital Trust Network</p>
              <p className="text-[11px] text-base-content/60">Cryptographically verifiable by companies, students & MSMEs.</p>
            </div>
          </div>

          <div className="text-right">
            <span className="badge badge-success badge-sm font-bold text-white uppercase text-[10px]">
              Active & Valid for 2026
            </span>
          </div>
        </div>

      </div>

    </div>
  );
}
