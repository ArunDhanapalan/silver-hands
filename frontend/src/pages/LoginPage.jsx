import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShieldCheck, User, Lock, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import ErrorAlert from '../components/common/ErrorAlert';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const user = await login(email, password);
      if (user.role === 'senior') navigate('/senior');
      else if (user.role === 'company') navigate('/company');
      else navigate('/');
    } catch (err) {
      setError(err.message || 'Login failed. Please check credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemo = (demoEmail, demoPass) => {
    setEmail(demoEmail);
    setPassword(demoPass);
  };

  return (
    <div className="max-w-md mx-auto my-6 space-y-6">
      <div className="text-center space-y-2">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-primary to-secondary text-white font-bold text-2xl flex items-center justify-center mx-auto shadow-md">
          🤝
        </div>
        <h1 className="text-2xl font-extrabold text-base-content">Welcome to SilverHands</h1>
        <p className="text-xs text-base-content/70">Sign in to access your role-specific dashboard</p>
      </div>

      <div className="card bg-base-100 border border-base-300 shadow-sm rounded-2xl p-6">
        <ErrorAlert message={error} />
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="form-control">
            <label className="label text-xs font-semibold">Email Address</label>
            <div className="relative">
              <User className="w-4 h-4 text-base-content/40 absolute left-3 top-3.5" />
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

          <div className="form-control">
            <label className="label text-xs font-semibold">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-base-content/40 absolute left-3 top-3.5" />
              <input 
                type="password" 
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••" 
                className="input input-bordered w-full pl-9 text-sm rounded-xl"
              />
            </div>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="btn btn-primary w-full rounded-xl text-white font-bold gap-2 mt-2"
          >
            {loading ? <span className="loading loading-spinner loading-sm"></span> : <>Sign In <ArrowRight className="w-4 h-4" /></>}
          </button>
        </form>

        {/* Demo Fast Login Buttons */}
        <div className="mt-6 pt-5 border-t border-base-200">
          <p className="text-[11px] font-bold text-base-content/60 uppercase tracking-wider mb-2.5">
            Judge & Demo Quick Access:
          </p>
          <div className="grid grid-cols-3 gap-2 text-xs">
            <button 
              type="button"
              onClick={() => handleQuickDemo('ramesh@silverhands.in', 'password123')}
              className="btn btn-xs btn-outline btn-primary rounded-lg text-[10px]"
            >
              👴 Ramesh (Senior)
            </button>
            <button 
              type="button"
              onClick={() => handleQuickDemo('techlocal@silverhands.in', 'password123')}
              className="btn btn-xs btn-outline btn-accent rounded-lg text-[10px]"
            >
              🏢 TechLocal
            </button>
            <button 
              type="button"
              onClick={() => handleQuickDemo('ananya@silverhands.in', 'password123')}
              className="btn btn-xs btn-outline btn-secondary rounded-lg text-[10px]"
            >
              🛍️ Ananya (Gen Z)
            </button>
          </div>
        </div>

        <div className="text-center mt-5 text-xs text-base-content/70">
          Don't have an account?{' '}
          <Link to="/register" className="font-bold text-primary hover:underline">
            Register now
          </Link>
        </div>
      </div>
    </div>
  );
}
