import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Lock, Mail, Building, MapPin, ArrowRight, ShieldCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLocation } from '../context/LocationContext';
import ErrorAlert from '../components/common/ErrorAlert';

export default function RegisterPage() {
  const { register } = useAuth();
  const { selectedCity } = useLocation();
  const navigate = useNavigate();
  
  const [role, setRole] = useState('senior'); // senior, company, customer
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [gstin, setGstin] = useState('');
  const [locality, setLocality] = useState(selectedCity.localities[0] || 'Adyar');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const payload = {
        email,
        password,
        full_name: fullName,
        role,
        phone,
        city: selectedCity.name,
        locality,
        gstin: role === 'company' ? gstin : undefined,
      };
      const user = await register(payload);
      if (user.role === 'senior') navigate('/senior/onboarding');
      else if (user.role === 'company') navigate('/company');
      else navigate('/');
    } catch (err) {
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-lg mx-auto my-6 space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-extrabold text-base-content">Join SilverHands</h1>
        <p className="text-xs text-base-content/70">Select your account type to get started</p>
      </div>

      <div className="card bg-base-100 border border-base-300 shadow-sm rounded-2xl p-6">
        <ErrorAlert message={error} />

        {/* Role Selector Cards */}
        <div className="grid grid-cols-3 gap-2 mb-5">
          <button
            type="button"
            onClick={() => setRole('senior')}
            className={`p-3 rounded-xl border text-center transition-all ${
              role === 'senior' 
                ? 'border-primary bg-primary/10 text-primary font-bold shadow-xs' 
                : 'border-base-300 bg-base-200/50 hover:bg-base-200 text-base-content/70'
            }`}
          >
            <span className="text-xl block mb-1">👴</span>
            <span className="text-xs block leading-tight">Senior / Homemaker</span>
          </button>

          <button
            type="button"
            onClick={() => setRole('company')}
            className={`p-3 rounded-xl border text-center transition-all ${
              role === 'company' 
                ? 'border-accent bg-accent/10 text-accent font-bold shadow-xs' 
                : 'border-base-300 bg-base-200/50 hover:bg-base-200 text-base-content/70'
            }`}
          >
            <span className="text-xl block mb-1">🏢</span>
            <span className="text-xs block leading-tight">Company / Employer</span>
          </button>

          <button
            type="button"
            onClick={() => setRole('customer')}
            className={`p-3 rounded-xl border text-center transition-all ${
              role === 'customer' 
                ? 'border-secondary bg-secondary/10 text-secondary font-bold shadow-xs' 
                : 'border-base-300 bg-base-200/50 hover:bg-base-200 text-base-content/70'
            }`}
          >
            <span className="text-xl block mb-1">🛍️</span>
            <span className="text-xs block leading-tight">Customer / Buyer</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="form-control">
            <label className="label text-xs font-semibold">
              {role === 'company' ? 'Company Name' : 'Full Name'}
            </label>
            <input 
              type="text" 
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder={role === 'company' ? 'TechLocal Solutions Pvt Ltd' : 'e.g. Ramesh Krishnan'}
              className="input input-bordered w-full text-sm rounded-xl"
            />
          </div>

          <div className="form-control">
            <label className="label text-xs font-semibold">Email Address</label>
            <input 
              type="email" 
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@example.com" 
              className="input input-bordered w-full text-sm rounded-xl"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="form-control">
              <label className="label text-xs font-semibold">Password</label>
              <input 
                type="password" 
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••" 
                className="input input-bordered w-full text-sm rounded-xl"
              />
            </div>
            <div className="form-control">
              <label className="label text-xs font-semibold">Phone Number</label>
              <input 
                type="tel" 
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+91 98765 43210" 
                className="input input-bordered w-full text-sm rounded-xl"
              />
            </div>
          </div>

          {role === 'company' && (
            <div className="form-control">
              <label className="label text-xs font-semibold">GSTIN (Required for Companies)</label>
              <input 
                type="text" 
                required
                value={gstin}
                onChange={(e) => setGstin(e.target.value)}
                placeholder="33AAAAA0000A1Z5" 
                className="input input-bordered w-full text-sm rounded-xl uppercase font-mono"
              />
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div className="form-control">
              <label className="label text-xs font-semibold">City</label>
              <input 
                type="text" 
                readOnly
                value={`${selectedCity.name} (${selectedCity.tier})`} 
                className="input input-bordered w-full text-sm rounded-xl bg-base-200 font-medium"
              />
            </div>
            <div className="form-control">
              <label className="label text-xs font-semibold">Area / Locality</label>
              <select 
                value={locality}
                onChange={(e) => setLocality(e.target.value)}
                className="select select-bordered w-full text-sm rounded-xl"
              >
                {selectedCity.localities.map(loc => (
                  <option key={loc} value={loc}>{loc}</option>
                ))}
              </select>
            </div>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="btn btn-primary w-full rounded-xl text-white font-bold gap-2 mt-2 shadow-sm"
          >
            {loading ? <span className="loading loading-spinner loading-sm"></span> : <>Create Account <ArrowRight className="w-4 h-4" /></>}
          </button>
        </form>

        <div className="text-center mt-5 text-xs text-base-content/70">
          Already have an account?{' '}
          <Link to="/login" className="font-bold text-primary hover:underline">
            Sign in
          </Link>
        </div>
      </div>
    </div>
  );
}
