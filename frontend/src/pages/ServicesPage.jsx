import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Sparkles, 
  Video, 
  MapPin, 
  Clock, 
  Star, 
  ShieldCheck, 
  Search, 
  X, 
  Check, 
  BookOpen, 
  ArrowRight,
  Plus,
  CheckCircle2
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLocation } from '../context/LocationContext';
import api from '../api/client';
import AddServiceModal from '../components/modals/AddServiceModal';
import ErrorAlert from '../components/common/ErrorAlert';
import LoadingSpinner from '../components/common/LoadingSpinner';

const CATEGORIES = [
  'All',
  'Education & Learning',
  'Knowledge & Mentoring',
  'Home & Practical Skills',
  'Culture & Tradition',
  'Family & Care'
];

export default function ServicesPage() {
  const { user } = useAuth();
  const { selectedCity } = useLocation();

  const [services, setServices] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedMode, setSelectedMode] = useState('all'); // all, online, offline
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [toastMsg, setToastMsg] = useState('');

  const fetchServices = async () => {
    setLoading(true);
    setError('');
    try {
      const params = {};
      if (selectedCategory !== 'All') params.category = selectedCategory;
      if (selectedMode !== 'all') params.mode = selectedMode;
      if (searchQuery.trim()) params.search = searchQuery.trim();
      params.city = selectedCity.name;

      const data = await api.get('/services', { params });
      setServices(data || []);
    } catch (err) {
      setError(err.message || 'Failed to load managed services.');
    } finally {
      setLoading(false);
    }
  };

  const visibleServices = services.filter(s => !user || s.senior_id !== user.id);

  useEffect(() => {
    fetchServices();
  }, [selectedCategory, selectedMode, searchQuery, selectedCity?.name]);

  return (
    <div className="space-y-8 pb-12">
      
      {/* Toast */}
      {toastMsg && (
        <div className="toast toast-top toast-center z-50">
          <div className="alert alert-success text-white font-bold text-xs shadow-lg rounded-xl flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" />
            <span>{toastMsg}</span>
          </div>
        </div>
      )}

      {/* Header & Managed Promise */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="badge badge-accent badge-sm font-bold text-white uppercase">Managed Services</span>
            <span className="text-xs text-base-content/60 font-semibold flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-secondary" /> {selectedCity?.name || 'Chennai'} & Online Nationwide
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-base-content mt-1">
            Learn & Consult with Verified Senior Gurus
          </h1>
          <p className="text-xs sm:text-sm text-base-content/70">
            SilverHands fully manages your scheduling, meeting links, and session fulfillment end-to-end.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start md:self-auto">
          {/* Senior Action Button */}
          {user?.role === 'senior' && (
            <button
              type="button"
              onClick={() => setShowAddModal(true)}
              className="btn btn-accent btn-sm rounded-xl text-white font-bold text-xs gap-1 shadow-sm"
            >
              <Plus className="w-3.5 h-3.5" /> Offer a Service
            </button>
          )}

          {/* Mode Toggle */}
          <div className="join bg-base-100 border border-base-300 rounded-xl p-1 shadow-xs text-xs">
            <button 
              type="button" 
              onClick={() => setSelectedMode('all')}
              className={`join-item btn btn-xs rounded-lg ${selectedMode === 'all' ? 'btn-primary text-white font-bold' : 'btn-ghost'}`}
            >
              All
            </button>
            <button 
              type="button" 
              onClick={() => setSelectedMode('online')}
              className={`join-item btn btn-xs rounded-lg gap-1 ${selectedMode === 'online' ? 'btn-accent text-white font-bold' : 'btn-ghost'}`}
            >
              <Video className="w-3 h-3" /> Online
            </button>
            <button 
              type="button" 
              onClick={() => setSelectedMode('offline')}
              className={`join-item btn btn-xs rounded-lg gap-1 ${selectedMode === 'offline' ? 'btn-secondary text-white font-bold' : 'btn-ghost'}`}
            >
              <MapPin className="w-3 h-3" /> In-Person
            </button>
          </div>
        </div>
      </div>

      {/* Featured Reference Service Hero: Telugu Tuition */}
      <div className="card bg-gradient-to-r from-accent/15 via-base-100 to-primary/15 border border-accent/30 rounded-3xl p-6 sm:p-8 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2 max-w-xl">
          <div className="flex items-center gap-2">
            <span className="badge badge-accent badge-sm font-bold text-white">⭐ Flagship Managed Service</span>
            <span className="badge badge-outline badge-xs text-[10px] font-bold">1-on-1 Personalized</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-base-content leading-tight">
            1-on-1 Spoken Telugu & Cultural Fluency with Guru Ananya
          </h2>
          <p className="text-xs sm:text-sm text-base-content/80 leading-relaxed">
            Personalized spoken language coaching for school children and adults. SilverHands handles the scheduling, automated WhatsApp reminders, and HD video room creation.
          </p>
          <div className="flex items-center gap-4 text-xs font-semibold text-base-content/70 pt-1">
            <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5 text-primary" /> 45 Mins / Session</span>
            <span>•</span>
            <span className="flex items-center gap-1"><Star className="w-3.5 h-3.5 text-warning fill-warning" /> 4.95 (38 reviews)</span>
          </div>
        </div>

        <div className="bg-base-100 p-5 rounded-2xl border border-base-300 shadow-xs flex flex-col items-center space-y-3 shrink-0 w-full sm:w-auto">
          <div className="text-center">
            <span className="text-[10px] text-base-content/60 uppercase font-bold block">Session Fee</span>
            <span className="text-2xl font-black text-primary">₹400</span>
          </div>
          <Link 
            to="/services/srv-telugu-tuition-01" 
            className="btn btn-accent btn-sm rounded-xl text-white font-bold text-xs gap-1.5 shadow-md w-full"
          >
            Book Reference Session <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>

      {/* Search & Category Filter */}
      <div className="space-y-4">
        <div className="relative max-w-xl">
          <Search className="w-4 h-4 text-base-content/40 absolute left-3.5 top-3.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search Telugu tuition, Carnatic music, GST advisory, knitting..."
            className="input input-bordered w-full pl-10 text-sm rounded-2xl bg-base-100"
          />
          {searchQuery && (
            <button 
              onClick={() => setSearchQuery('')}
              className="btn btn-ghost btn-xs btn-circle absolute right-2.5 top-2.5"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3.5 py-1.5 rounded-full font-bold whitespace-nowrap transition-all ${
                selectedCategory === cat
                  ? 'bg-accent text-white shadow-xs'
                  : 'bg-base-100 border border-base-300 text-base-content/70 hover:bg-base-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      <ErrorAlert message={error} onRetry={fetchServices} />

      {/* Services Grid */}
      {loading ? (
        <LoadingSpinner message="Loading verified senior gurus..." />
      ) : visibleServices.length === 0 ? (
        <div className="bg-base-100 rounded-3xl border border-base-300 p-12 text-center space-y-3">
          <Sparkles className="w-12 h-12 text-base-content/30 mx-auto" />
          <h3 className="text-lg font-bold text-base-content">No services matching your criteria</h3>
          <p className="text-xs text-base-content/60 max-w-sm mx-auto">
            Try switching delivery mode to "All" or exploring different subject categories.
          </p>
          <button 
            onClick={() => { setSelectedCategory('All'); setSelectedMode('all'); setSearchQuery(''); }}
            className="btn btn-outline btn-sm rounded-xl text-xs"
          >
            Clear Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {visibleServices.map((service) => (
            <div 
              key={service.id}
              className="card bg-base-100 border border-base-300 rounded-3xl p-6 shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-4"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="badge badge-accent badge-outline badge-sm font-bold text-[11px]">
                    {service.category}
                  </span>
                  <span className={`badge badge-sm font-bold text-[10px] uppercase ${
                    service.mode === 'online' ? 'badge-info text-white' : 'badge-neutral'
                  }`}>
                    {service.mode === 'online' ? '💻 1-on-1 Online' : service.mode === 'offline' ? '📍 In-Person' : '🌐 Online / Offline'}
                  </span>
                </div>

                <Link to={`/services/${service.id}`} className="hover:underline block">
                  <h3 className="font-extrabold text-lg text-base-content leading-snug">
                    {service.title}
                  </h3>
                </Link>

                <p className="text-xs text-base-content/70 line-clamp-3 leading-relaxed">
                  {service.description}
                </p>

                {/* Guru Trust & Location */}
                <div className="bg-base-200/70 p-3 rounded-2xl flex items-center justify-between text-xs">
                  <div>
                    <span className="font-bold text-base-content block">{service.senior_name}</span>
                    <span className="text-[11px] text-base-content/60 flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-secondary" /> {service.locality}, {service.city}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="flex items-center gap-1 font-bold text-base-content">
                      <Star className="w-3.5 h-3.5 text-warning fill-warning" /> {service.senior_rating}
                    </span>
                    <span className="text-[10px] text-base-content/50">
                      {service.total_sessions_conducted} sessions completed
                    </span>
                  </div>
                </div>
              </div>

              {/* Price & Action */}
              <div className="pt-3 border-t border-base-200 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-base-content/60 uppercase font-bold block">Session Fee</span>
                  <span className="text-lg font-extrabold text-primary">
                    ₹{service.price_per_session?.toLocaleString('en-IN')}
                    <span className="text-xs font-semibold text-base-content/60 ml-1">/ {service.duration_mins} mins</span>
                  </span>
                </div>

                <Link 
                  to={`/services/${service.id}`}
                  className="btn btn-accent btn-sm rounded-xl text-white font-bold text-xs gap-1.5 shadow-xs"
                >
                  Book Session <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>

            </div>
          ))}
        </div>
      )}

      {/* Add Service Modal */}
      <AddServiceModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onServiceCreated={() => {
          setToastMsg('Service offering published successfully!');
          setTimeout(() => setToastMsg(''), 3500);
          fetchServices();
        }}
      />

    </div>
  );
}
