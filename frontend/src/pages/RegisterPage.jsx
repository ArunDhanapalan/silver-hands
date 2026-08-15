import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  User, 
  Lock, 
  Mail, 
  Building, 
  MapPin, 
  ArrowRight, 
  ShieldCheck, 
  Phone, 
  FileText, 
  Globe, 
  Check, 
  Sparkles,
  Edit3
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { useLocation } from '../context/LocationContext';
import ErrorAlert from '../components/common/ErrorAlert';

export default function RegisterPage() {
  const { register } = useAuth();
  const { language, setLanguage, languages } = useLanguage();
  const { cities, selectedCity, setSelectedCity, selectedLocality, setSelectedLocality, setCustomLocality } = useLocation();
  const navigate = useNavigate();
  
  const [role, setRole] = useState('senior'); // senior, company, customer
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  
  // City & Locality (Two-way with LocationContext)
  const [cityInput, setCityInput] = useState(selectedCity.name);
  const [localityInput, setLocalityInput] = useState(selectedLocality !== 'All Areas' ? selectedLocality : (selectedCity.localities[0] || 'Adyar'));
  const [isCustomLocality, setIsCustomLocality] = useState(false);

  // Verification IDs
  const [aadhaarNumber, setAadhaarNumber] = useState('');
  const [gstin, setGstin] = useState('');
  const [companyName, setCompanyName] = useState('');

  // UI state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showWelcomeLangModal, setShowWelcomeLangModal] = useState(false);
  const [registeredUser, setRegisteredUser] = useState(null);

  const handleCityChange = (cityName) => {
    setCityInput(cityName);
    setSelectedCity(cityName);
    const matched = cities.find(c => c.name.toLowerCase() === cityName.toLowerCase());
    if (matched && matched.localities.length > 0) {
      setLocalityInput(matched.localities[0]);
      setSelectedLocality(matched.localities[0]);
    } else {
      setLocalityInput('Central Area');
      setSelectedLocality('Central Area');
    }
  };

  const handleLocalityChange = (loc) => {
    if (loc === '__custom__') {
      setIsCustomLocality(true);
      setLocalityInput('');
    } else {
      setIsCustomLocality(false);
      setLocalityInput(loc);
      setSelectedLocality(loc);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validations
    if (role === 'company' && (!gstin || gstin.trim().length < 10)) {
      setError('Please provide a valid 15-character GSTIN number for company registration.');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        email,
        password,
        full_name: fullName,
        role,
        phone,
        city: cityInput,
        locality: localityInput || 'Central Area',
        preferred_language: language,
        aadhaar_number: (role === 'senior' || role === 'customer') ? aadhaarNumber : undefined,
        gstin: role === 'company' ? gstin.trim().toUpperCase() : undefined,
        company_name: role === 'company' ? (companyName || fullName) : undefined,
      };

      const user = await register(payload);
      setRegisteredUser(user);
      navigate('/welcome');
    } catch (err) {
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleFinishWelcome = (selectedLangCode) => {
    setLanguage(selectedLangCode);
    setShowWelcomeLangModal(false);
    
    if (registeredUser?.role === 'senior') {
      navigate('/senior/onboarding');
    } else if (registeredUser?.role === 'company') {
      navigate('/company');
    } else {
      navigate('/');
    }
  };

  return (
    <div className="max-w-lg mx-auto my-6 space-y-6">
      <div className="text-center space-y-2">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-primary to-secondary text-white font-bold text-2xl flex items-center justify-center mx-auto shadow-md">
          🤝
        </div>
        <h1 className="text-2xl font-extrabold text-base-content">Join SilverHands</h1>
        <p className="text-xs text-base-content/70">Dignified livelihood, authentic local commerce, and generational work</p>
      </div>

      <div className="card bg-base-100 border border-base-300 shadow-sm rounded-3xl p-6">
        <ErrorAlert message={error} />

        {/* Role Selector Cards */}
        <div className="grid grid-cols-3 gap-2 mb-5">
          <button
            type="button"
            onClick={() => setRole('senior')}
            className={`p-3 rounded-2xl border text-center transition-all ${
              role === 'senior' 
                ? 'border-primary bg-primary/10 text-primary font-bold shadow-xs' 
                : 'border-base-300 bg-base-200/50 hover:bg-base-200 text-base-content/70'
            }`}
          >
            <span className="text-2xl block mb-1">👴</span>
            <span className="text-xs block font-bold leading-tight">Senior / Guru</span>
          </button>

          <button
            type="button"
            onClick={() => setRole('company')}
            className={`p-3 rounded-2xl border text-center transition-all ${
              role === 'company' 
                ? 'border-accent bg-accent/10 text-accent font-bold shadow-xs' 
                : 'border-base-300 bg-base-200/50 hover:bg-base-200 text-base-content/70'
            }`}
          >
            <span className="text-2xl block mb-1">🏢</span>
            <span className="text-xs block font-bold leading-tight">Company / MSME</span>
          </button>

          <button
            type="button"
            onClick={() => setRole('customer')}
            className={`p-3 rounded-2xl border text-center transition-all ${
              role === 'customer' 
                ? 'border-secondary bg-secondary/10 text-secondary font-bold shadow-xs' 
                : 'border-base-300 bg-base-200/50 hover:bg-base-200 text-base-content/70'
            }`}
          >
            <span className="text-2xl block mb-1">🛍️</span>
            <span className="text-xs block font-bold leading-tight">Buyer / Parent</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Full Name / Company Name */}
          <div className="form-control">
            <label className="label text-xs font-semibold">
              {role === 'company' ? 'Company Name / Authorized Signatory' : 'Full Name (as per ID)'}
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-base-content/40 absolute left-3 top-3.5" />
              <input 
                type="text" 
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder={role === 'company' ? 'e.g. TechLocal Solutions / R. Sundaram' : 'e.g. Ramesh Krishnan'}
                className="input input-bordered w-full pl-9 text-sm rounded-xl"
              />
            </div>
          </div>

          {/* Email */}
          <div className="form-control">
            <label className="label text-xs font-semibold">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-base-content/40 absolute left-3 top-3.5" />
              <input 
                type="email" 
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com" 
                className="input input-bordered w-full pl-9 text-sm rounded-xl"
              />
            </div>
          </div>

          {/* Password */}
          <div className="form-control">
            <label className="label text-xs font-semibold">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-base-content/40 absolute left-3 top-3.5" />
              <input 
                type="password" 
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••" 
                className="input input-bordered w-full pl-9 text-sm rounded-xl"
              />
            </div>
          </div>

          {/* Phone */}
          <div className="form-control">
            <label className="label text-xs font-semibold">Mobile Number</label>
            <div className="relative">
              <Phone className="w-4 h-4 text-base-content/40 absolute left-3 top-3.5" />
              <input 
                type="tel" 
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+91 98840 12345" 
                className="input input-bordered w-full pl-9 text-sm rounded-xl"
              />
            </div>
          </div>

          {/* Two-Way City & Locality Selection */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="form-control">
              <label className="label text-xs font-semibold">City (Two-Way Synced)</label>
              <select
                value={cityInput}
                onChange={(e) => handleCityChange(e.target.value)}
                className="select select-bordered select-sm w-full text-xs rounded-xl"
              >
                {cities.map(c => (
                  <option key={c.id} value={c.name}>{c.name} ({c.tier})</option>
                ))}
              </select>
            </div>

            <div className="form-control">
              <label className="label text-xs font-semibold">Neighborhood / Area</label>
              {!isCustomLocality ? (
                <select
                  value={localityInput}
                  onChange={(e) => handleLocalityChange(e.target.value)}
                  className="select select-bordered select-sm w-full text-xs rounded-xl"
                >
                  {(selectedCity.localities || []).map(loc => (
                    <option key={loc} value={loc}>{loc}</option>
                  ))}
                  <option value="__custom__">+ Enter Custom Locality...</option>
                </select>
              ) : (
                <div className="flex gap-1">
                  <input
                    type="text"
                    required
                    placeholder="Type locality name..."
                    value={localityInput}
                    onChange={(e) => {
                      setLocalityInput(e.target.value);
                      setSelectedLocality(e.target.value);
                    }}
                    className="input input-bordered input-sm w-full text-xs rounded-xl"
                  />
                  <button
                    type="button"
                    onClick={() => setIsCustomLocality(false)}
                    className="btn btn-xs btn-ghost"
                  >
                    List
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Role Specific ID Verification */}
          {role === 'company' ? (
            <div className="form-control bg-accent/10 border border-accent/20 rounded-2xl p-3.5 space-y-2">
              <label className="label p-0 text-xs font-bold text-accent flex items-center gap-1">
                <Building className="w-3.5 h-3.5" /> Company GSTIN Registration *
              </label>
              <input 
                type="text" 
                required
                maxLength={15}
                value={gstin}
                onChange={(e) => setGstin(e.target.value)}
                placeholder="e.g. 33AAAAA0000A1Z5" 
                className="input input-bordered input-sm w-full text-xs font-mono uppercase rounded-xl"
              />
              <span className="text-[10px] text-base-content/60 block">
                Required for verified corporate hiring and MSME service contracts.
              </span>
            </div>
          ) : (
            <div className="form-control bg-base-200/60 border border-base-300 rounded-2xl p-3.5 space-y-2">
              <label className="label p-0 text-xs font-bold text-base-content/80 flex items-center justify-between">
                <span className="flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-success" /> 
                  {role === 'senior' ? 'Senior Verification (Aadhaar / ID)' : 'Aadhaar ID (Optional)'}
                </span>
                <span className="badge badge-xs badge-success text-white font-bold">Privacy Masked</span>
              </label>
              <input 
                type="text" 
                maxLength={14}
                value={aadhaarNumber}
                onChange={(e) => setAadhaarNumber(e.target.value)}
                placeholder="12-digit Aadhaar (e.g. 1234 5678 9012)" 
                className="input input-bordered input-sm w-full text-xs rounded-xl"
              />
              <span className="text-[10px] text-base-content/60 block">
                🔒 Stored strictly in masked format (XXXX-XXXX-1234). Raw identity numbers are never persisted.
              </span>
            </div>
          )}

          <button 
            type="submit" 
            disabled={loading}
            className="btn btn-primary w-full text-white font-bold rounded-2xl shadow-md gap-1.5 mt-2"
          >
            {loading ? <span className="loading loading-spinner loading-sm"></span> : (
              <>
                Create Account <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="text-center mt-5 pt-4 border-t border-base-200">
          <p className="text-xs text-base-content/70">
            Already have an account?{' '}
            <Link to="/login" className="text-primary font-bold hover:underline">
              Sign In
            </Link>
          </p>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* POST-REGISTRATION WELCOME LANGUAGE SELECTION MODAL */}
      {/* ========================================================================= */}
      {showWelcomeLangModal && (
        <div className="modal modal-open z-50">
          <div className="modal-box max-w-xl rounded-3xl p-6 space-y-4">
            <div className="text-center space-y-1">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-primary to-accent text-white font-bold text-2xl flex items-center justify-center mx-auto shadow-md">
                🎉
              </div>
              <h3 className="font-extrabold text-xl text-base-content">
                Welcome, {registeredUser?.full_name || 'Member'}!
              </h3>
              <p className="text-xs text-base-content/70">
                Choose your primary language. SilverHands will translate everything for you across all visits:
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 max-h-60 overflow-y-auto pr-1">
              {languages.map((l) => {
                const isSelected = language === l.code;
                return (
                  <button
                    key={l.code}
                    type="button"
                    onClick={() => setLanguage(l.code)}
                    className={`p-3 rounded-2xl border text-left transition-all flex flex-col justify-between ${
                      isSelected 
                        ? 'border-primary bg-primary/10 text-primary font-bold shadow-xs' 
                        : 'border-base-300 bg-base-100 hover:border-primary/40 hover:bg-base-200/50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-base font-extrabold text-base-content">{l.native}</span>
                      {isSelected && <Check className="w-4 h-4 text-primary" />}
                    </div>
                    <span className="text-[11px] text-base-content/60">{l.name}</span>
                  </button>
                );
              })}
            </div>

            <div className="modal-action pt-2">
              <button
                type="button"
                onClick={() => handleFinishWelcome(language)}
                className="btn btn-primary w-full text-white font-bold rounded-2xl gap-2 text-sm shadow-md"
              >
                Continue in {languages.find(l => l.code === language)?.native || 'English'} <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
