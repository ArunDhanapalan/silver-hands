import React from 'react';
import { Link, useNavigate, useLocation as useRouterLocation } from 'react-router-dom';
import { 
  ShoppingBag, 
  Sparkles, 
  MapPin, 
  Globe, 
  User, 
  LogOut, 
  Briefcase, 
  Users, 
  Layers, 
  TrendingUp,
  Package,
  Calendar
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { useLocation } from '../../context/LocationContext';

export default function Navbar() {
  const { user, logout, isAuthenticated } = useAuth();
  const { language, setLanguage, languages, t } = useLanguage();
  const { cities, selectedCity, setSelectedCity } = useLocation();
  const routerLocation = useRouterLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header className="sticky top-0 z-40 bg-base-100/95 backdrop-blur border-b border-base-300 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Brand */}
          <div className="flex items-center gap-3">
            <Link to="/" className="flex items-center gap-2.5 group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-primary to-secondary flex items-center justify-center text-white font-bold text-xl shadow-md group-hover:scale-105 transition-transform">
                🤝
              </div>
              <div>
                <span className="font-extrabold text-xl tracking-tight bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                  SilverHands
                </span>
                <span className="hidden sm:inline-block ml-2 text-xs font-semibold px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
                  Livelihood 2.0
                </span>
              </div>
            </Link>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-1 text-sm font-medium">
            <Link 
              to="/store" 
              className={`btn btn-ghost btn-sm rounded-lg gap-1.5 ${routerLocation.pathname.startsWith('/store') ? 'btn-active text-primary' : ''}`}
            >
              <ShoppingBag className="w-4 h-4 text-secondary" />
              {t('nav_store')}
            </Link>

            <Link 
              to="/services" 
              className={`btn btn-ghost btn-sm rounded-lg gap-1.5 ${routerLocation.pathname.startsWith('/services') ? 'btn-active text-primary' : ''}`}
            >
              <Sparkles className="w-4 h-4 text-accent" />
              {t('nav_services')}
            </Link>

            <Link 
              to="/community" 
              className={`btn btn-ghost btn-sm rounded-lg gap-1.5 ${routerLocation.pathname.startsWith('/community') ? 'btn-active text-primary' : ''}`}
            >
              <Users className="w-4 h-4 text-primary" />
              {t('nav_community')}
            </Link>

            {user?.role === 'senior' && (
              <>
                <Link 
                  to="/senior" 
                  className={`btn btn-ghost btn-sm rounded-lg gap-1.5 ${routerLocation.pathname === '/senior' ? 'btn-active text-primary' : ''}`}
                >
                  <Layers className="w-4 h-4 text-warning" />
                  {t('nav_deck')}
                </Link>
                <Link 
                  to="/senior/earnings" 
                  className={`btn btn-ghost btn-sm rounded-lg gap-1.5 ${routerLocation.pathname === '/senior/earnings' ? 'btn-active text-primary' : ''}`}
                >
                  <TrendingUp className="w-4 h-4 text-success" />
                  {t('nav_earnings')}
                </Link>
              </>
            )}

            {user?.role === 'company' && (
              <Link 
                to="/company" 
                className={`btn btn-ghost btn-sm rounded-lg gap-1.5 ${routerLocation.pathname.startsWith('/company') ? 'btn-active text-primary' : ''}`}
              >
                <Briefcase className="w-4 h-4 text-primary" />
                Company Hub
              </Link>
            )}
          </nav>

          {/* Right Controls: City Selector, Language Selector, User Profile */}
          <div className="flex items-center gap-2">
            
            {/* City Selector */}
            <div className="dropdown dropdown-end">
              <div tabIndex={0} role="button" className="btn btn-ghost btn-sm rounded-lg px-2 gap-1 text-xs font-semibold" aria-label="Select City">
                <MapPin className="w-3.5 h-3.5 text-secondary shrink-0" />
                <span className="max-w-[70px] sm:max-w-none truncate">{selectedCity.name}</span>
                <span className="badge badge-xs badge-neutral hidden sm:inline">{selectedCity.tier}</span>
              </div>
              <ul tabIndex={0} className="dropdown-content z-50 menu p-2 shadow-lg bg-base-100 rounded-box w-56 max-h-72 overflow-y-auto border border-base-300 text-xs">
                <li className="menu-title text-base-content/60 font-bold px-2 py-1">Select City (T1, T2, T3)</li>
                {cities.map((city) => (
                  <li key={city.id}>
                    <button 
                      onClick={() => setSelectedCity(city)}
                      className={`flex justify-between py-2 ${selectedCity.id === city.id ? 'active font-bold' : ''}`}
                    >
                      <span>{city.name}, {city.state}</span>
                      <span className="badge badge-xs badge-ghost">{city.tier}</span>
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            {/* Language Selector (11 Indian Languages) */}
            <div className="dropdown dropdown-end">
              <div tabIndex={0} role="button" className="btn btn-ghost btn-sm rounded-lg px-2 gap-1 text-xs font-semibold" aria-label="Select Language">
                <Globe className="w-3.5 h-3.5 text-accent shrink-0" />
                <span className="uppercase">{language}</span>
              </div>
              <ul tabIndex={0} className="dropdown-content z-50 menu p-2 shadow-lg bg-base-100 rounded-box w-48 max-h-72 overflow-y-auto border border-base-300 text-xs">
                <li className="menu-title text-base-content/60 font-bold px-2 py-1">Spoken Language</li>
                {languages.map((lang) => (
                  <li key={lang.code}>
                    <button 
                      onClick={() => setLanguage(lang.code)}
                      className={`flex justify-between py-2 ${language === lang.code ? 'active font-bold' : ''}`}
                    >
                      <span>{lang.native}</span>
                      <span className="text-base-content/50 text-[10px]">{lang.name}</span>
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            {/* User Account / Auth */}
            {isAuthenticated ? (
              <div className="dropdown dropdown-end">
                <div tabIndex={0} role="button" className="btn btn-ghost btn-circle avatar placeholder" aria-label="User menu">
                  <div className="bg-primary text-primary-content rounded-full w-9 shadow-inner flex items-center justify-center font-bold text-sm">
                    {user?.full_name ? user.full_name.charAt(0).toUpperCase() : 'U'}
                  </div>
                </div>
                <ul tabIndex={0} className="dropdown-content z-50 menu p-2 shadow-lg bg-base-100 rounded-box w-56 border border-base-300 text-sm">
                  <li className="px-3 py-2 border-b border-base-200">
                    <p className="font-bold text-base-content truncate">{user?.full_name}</p>
                    <p className="text-xs text-base-content/60 capitalize flex items-center gap-1.5 mt-0.5">
                      <span className="w-2 h-2 rounded-full bg-success"></span>
                      {user?.role === 'senior' ? 'Senior / Homemaker' : user?.role === 'company' ? 'Job Provider' : 'Customer'}
                    </p>
                  </li>
                  {user?.role === 'senior' && (
                    <>
                      <li><Link to="/senior"><Layers className="w-4 h-4 text-warning" /> Opportunity Deck</Link></li>
                      <li><Link to="/senior/onboarding"><Sparkles className="w-4 h-4 text-primary" /> Edit AI Skills</Link></li>
                      <li><Link to="/senior/orders"><Package className="w-4 h-4 text-secondary" /> Customer Orders</Link></li>
                      <li><Link to="/senior/earnings"><TrendingUp className="w-4 h-4 text-success" /> Earnings</Link></li>
                    </>
                  )}
                  {user?.role === 'company' && (
                    <li><Link to="/company"><Briefcase className="w-4 h-4 text-primary" /> Manage Postings</Link></li>
                  )}
                  {user?.role === 'customer' && (
                    <>
                      <li><Link to="/cart"><ShoppingBag className="w-4 h-4 text-secondary" /> My Cart & Orders</Link></li>
                    </>
                  )}
                  <li className="border-t border-base-200 mt-1">
                    <button onClick={handleLogout} className="text-error font-medium">
                      <LogOut className="w-4 h-4" /> {t('logout')}
                    </button>
                  </li>
                </ul>
              </div>
            ) : (
              <div className="flex items-center gap-1.5">
                <Link to="/login" className="btn btn-ghost btn-sm text-xs font-semibold rounded-lg">
                  {t('login')}
                </Link>
                <Link to="/register" className="btn btn-primary btn-sm text-xs font-bold rounded-lg shadow-sm">
                  {t('register')}
                </Link>
              </div>
            )}

          </div>

        </div>
      </div>
    </header>
  );
}
