import React, { useState } from 'react';
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
  Calendar,
  Search,
  Check,
  ChevronDown,
  X,
  Plus
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { useLocation } from '../../context/LocationContext';

export default function Navbar() {
  const { user, logout, isAuthenticated } = useAuth();
  const { language, setLanguage, languages, t } = useLanguage();
  const { cities, selectedCity, setSelectedCity, selectedLocality, setSelectedLocality, setCustomLocality, activeFestival, setActiveFestival } = useLocation();
  const routerLocation = useRouterLocation();
  const navigate = useNavigate();

  // Modal States
  const [cityModalOpen, setCityModalOpen] = useState(false);
  const [langModalOpen, setLangModalOpen] = useState(false);
  const [festModalOpen, setFestModalOpen] = useState(false);

  // City Search & Custom Locality
  const [citySearch, setCitySearch] = useState('');
  const [customLocalityInput, setCustomLocalityInput] = useState('');
  const [customCityInput, setCustomCityInput] = useState('');
  const [selectedTierFilter, setSelectedTierFilter] = useState('ALL');

  const filteredCities = cities.filter(c => {
    const matchesSearch = c.name.toLowerCase().includes(citySearch.toLowerCase()) || 
                          c.state.toLowerCase().includes(citySearch.toLowerCase());
    const matchesTier = selectedTierFilter === 'ALL' || c.tier === selectedTierFilter;
    return matchesSearch && matchesTier;
  });

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleSelectCity = (city) => {
    setSelectedCity(city);
    setCityModalOpen(false);
    setCitySearch('');
  };

  const handleAddCustomCityOrLocality = (e) => {
    e.preventDefault();
    if (customCityInput.trim()) {
      setSelectedCity(customCityInput.trim());
      if (customLocalityInput.trim()) {
        setCustomLocality(customLocalityInput.trim());
      }
      setCustomCityInput('');
      setCustomLocalityInput('');
      setCityModalOpen(false);
    } else if (customLocalityInput.trim()) {
      setCustomLocality(customLocalityInput.trim());
      setCustomLocalityInput('');
      setCityModalOpen(false);
    }
  };

  const isCompany = user?.role === 'company';

  return (
    <>
      <header className="sticky top-0 z-40 bg-base-100/95 backdrop-blur border-b border-base-300 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            
            {/* Brand */}
            <div className="flex items-center gap-3">
              <Link to={isCompany ? "/company" : "/"} className="flex items-center gap-2.5 group">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-primary to-secondary flex items-center justify-center text-white font-bold text-xl shadow-md group-hover:scale-105 transition-transform">
                  🤝
                </div>
                <div>
                  <span className="font-extrabold text-xl tracking-tight bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                    SilverHands
                  </span>
                  <span className="hidden sm:inline-block ml-2 text-xs font-semibold px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
                    {isCompany ? 'Company Portal' : 'Livelihood 2.0'}
                  </span>
                </div>
              </Link>
            </div>

            {/* Desktop Navigation Links */}
            <nav className="hidden md:flex items-center gap-1 text-sm font-medium">
              
              {/* If Company Profile, ONLY Show Company Hub (Issue #14) */}
              {isCompany ? (
                <Link 
                  to="/company" 
                  className={`btn btn-ghost btn-sm rounded-lg gap-1.5 ${routerLocation.pathname.startsWith('/company') ? 'btn-active text-primary' : ''}`}
                >
                  <Briefcase className="w-4 h-4 text-primary" />
                  Company Hub & Postings
                </Link>
              ) : (
                /* Consumer & Senior Navigation */
                <>
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
                </>
              )}

            </nav>

            {/* Right Controls: Festival Context, City Selector, Language Selector, User Profile */}
            <div className="flex items-center gap-1.5 sm:gap-2">
              
              {/* Festival Context Selector Modal Trigger */}
              {!isCompany && (
                <button
                  type="button"
                  onClick={() => setFestModalOpen(true)}
                  className="btn btn-ghost btn-sm rounded-xl px-2.5 gap-1.5 text-xs font-bold text-secondary bg-secondary/10 border border-secondary/20 hover:bg-secondary/20 transition-all"
                  aria-label="Select Festival Context"
                >
                  <span>{activeFestival === 'Diwali' ? '🪔' : activeFestival === 'Pongal' ? '🌾' : activeFestival === 'Onam' ? '🌸' : activeFestival === 'Durga Puja' ? '🌺' : activeFestival === 'Eid' ? '🌙' : '🎄'}</span>
                  <span className="hidden sm:inline">{activeFestival}</span>
                  <ChevronDown className="w-3 h-3 opacity-60" />
                </button>
              )}

              {/* City Selector Modal Trigger */}
              <button
                type="button"
                onClick={() => setCityModalOpen(true)}
                className="btn btn-ghost btn-sm rounded-xl px-2.5 gap-1.5 text-xs font-semibold hover:bg-base-200 border border-base-300 shadow-xs"
                aria-label="Select City"
              >
                <MapPin className="w-3.5 h-3.5 text-secondary shrink-0" />
                <span className="max-w-[80px] sm:max-w-none truncate font-bold">{selectedCity.name}</span>
                {selectedLocality && selectedLocality !== 'All Areas' && (
                  <span className="text-[10px] text-base-content/60 hidden md:inline">({selectedLocality})</span>
                )}
                <span className="badge badge-xs badge-neutral hidden lg:inline">{selectedCity.tier}</span>
                <ChevronDown className="w-3 h-3 opacity-60" />
              </button>

              {/* Language Selector Modal Trigger */}
              <button
                type="button"
                onClick={() => setLangModalOpen(true)}
                className="btn btn-ghost btn-sm rounded-xl px-2.5 gap-1.5 text-xs font-semibold hover:bg-base-200 border border-base-300 shadow-xs"
                aria-label="Select Language"
              >
                <Globe className="w-3.5 h-3.5 text-accent shrink-0" />
                <span className="uppercase font-bold">{language}</span>
                <span className="text-[11px] text-base-content/70 hidden sm:inline">
                  {languages.find(l => l.code === language)?.native || 'English'}
                </span>
                <ChevronDown className="w-3 h-3 opacity-60" />
              </button>

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

      {/* ========================================================================= */}
      {/* CITY SELECTION POPUP MODAL (FULL SCREEN OVERLAY - FIXED OUTSIDE HEADER) */}
      {/* ========================================================================= */}
      {cityModalOpen && (
        <div className="fixed inset-0 z-[99999] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-base-100 border border-base-300 max-w-2xl w-full rounded-3xl p-6 space-y-4 shadow-2xl max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in duration-150">
            <div className="flex items-center justify-between border-b border-base-200 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                  <MapPin className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-extrabold text-lg text-base-content">Select Your City & Area</h3>
                  <p className="text-xs text-base-content/60">Choose your city or enter a custom locality anywhere in India</p>
                </div>
              </div>
              <button 
                onClick={() => setCityModalOpen(false)}
                className="btn btn-sm btn-circle btn-ghost"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Search Input */}
            <div className="relative">
              <Search className="w-4 h-4 text-base-content/40 absolute left-3.5 top-3.5" />
              <input
                type="text"
                placeholder="Search city (e.g. Chennai, Bengaluru, Mumbai, Jaipur)..."
                value={citySearch}
                onChange={(e) => setCitySearch(e.target.value)}
                className="input input-bordered w-full pl-10 text-sm rounded-2xl"
              />
            </div>

            {/* Tier Filters */}
            <div className="flex items-center gap-2">
              {['ALL', 'T1', 'T2', 'T3'].map(tier => (
                <button
                  key={tier}
                  type="button"
                  onClick={() => setSelectedTierFilter(tier)}
                  className={`btn btn-xs rounded-xl font-bold ${selectedTierFilter === tier ? 'btn-primary text-white' : 'btn-ghost border border-base-300'}`}
                >
                  {tier === 'ALL' ? 'All Cities' : `Tier ${tier.slice(1)}`}
                </button>
              ))}
            </div>

            {/* Cities Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 max-h-56 overflow-y-auto pr-1">
              {filteredCities.map((city) => {
                const isSelected = selectedCity.name === city.name;
                return (
                  <button
                    key={city.id}
                    type="button"
                    onClick={() => handleSelectCity(city)}
                    className={`p-3 rounded-2xl border text-left transition-all flex items-center justify-between ${
                      isSelected 
                        ? 'border-primary bg-primary/10 text-primary font-bold shadow-xs' 
                        : 'border-base-300 bg-base-100 hover:border-primary/40 hover:bg-base-200/50'
                    }`}
                  >
                    <div>
                      <div className="text-sm font-bold text-base-content">{city.name}</div>
                      <div className="text-[11px] text-base-content/60">{city.state}</div>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="badge badge-xs badge-neutral font-semibold">{city.tier}</span>
                      {isSelected && <Check className="w-4 h-4 text-primary" />}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Localities for Current City */}
            {selectedCity.localities && selectedCity.localities.length > 0 && (
              <div className="space-y-2 pt-2 border-t border-base-200">
                <span className="text-xs font-bold text-base-content/70 block">
                  Select Neighborhood in {selectedCity.name}:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  <button
                    type="button"
                    onClick={() => { setSelectedLocality('All Areas'); setCityModalOpen(false); }}
                    className={`btn btn-xs rounded-xl ${selectedLocality === 'All Areas' ? 'btn-secondary text-white font-bold' : 'btn-ghost border border-base-300'}`}
                  >
                    All Areas
                  </button>
                  {selectedCity.localities.map((loc) => (
                    <button
                      key={loc}
                      type="button"
                      onClick={() => { setSelectedLocality(loc); setCityModalOpen(false); }}
                      className={`btn btn-xs rounded-xl ${selectedLocality === loc ? 'btn-secondary text-white font-bold' : 'btn-ghost border border-base-300'}`}
                    >
                      {loc}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Custom City / Locality Entry */}
            <form onSubmit={handleAddCustomCityOrLocality} className="pt-3 border-t border-base-200 space-y-2">
              <span className="text-xs font-bold text-base-content/70 block">
                Don't see your city or neighborhood? Enter custom:
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <input
                  type="text"
                  placeholder="Custom City Name..."
                  value={customCityInput}
                  onChange={(e) => setCustomCityInput(e.target.value)}
                  className="input input-sm input-bordered rounded-xl text-xs"
                />
                <input
                  type="text"
                  placeholder="Custom Locality / Area..."
                  value={customLocalityInput}
                  onChange={(e) => setCustomLocalityInput(e.target.value)}
                  className="input input-sm input-bordered rounded-xl text-xs"
                />
              </div>
              <button
                type="submit"
                className="btn btn-sm btn-primary rounded-xl text-white font-bold text-xs w-full gap-1 mt-1"
              >
                <Plus className="w-3.5 h-3.5" /> Set Custom Location
              </button>
            </form>

          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* LANGUAGE SELECTION POPUP MODAL (11 LANGUAGES) */}
      {/* ========================================================================= */}
      {langModalOpen && (
        <div className="fixed inset-0 z-[99999] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-base-100 border border-base-300 max-w-xl w-full rounded-3xl p-6 space-y-4 shadow-2xl max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in duration-150">
            <div className="flex items-center justify-between border-b border-base-200 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-accent/10 text-accent flex items-center justify-center">
                  <Globe className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-extrabold text-lg text-base-content">Choose Language / மொழி / भाषा</h3>
                  <p className="text-xs text-base-content/60">SilverHands supports 11 Indian regional languages</p>
                </div>
              </div>
              <button 
                onClick={() => setLangModalOpen(false)}
                className="btn btn-sm btn-circle btn-ghost"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* 3-Column Language Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {languages.map((l) => {
                const isSelected = language === l.code;
                return (
                  <button
                    key={l.code}
                    type="button"
                    onClick={() => {
                      setLanguage(l.code);
                      setLangModalOpen(false);
                    }}
                    className={`p-3.5 rounded-2xl border text-left transition-all flex flex-col justify-between h-20 ${
                      isSelected
                        ? 'border-primary bg-primary/10 text-primary shadow-sm font-bold'
                        : 'border-base-300 bg-base-100 hover:border-primary/40 hover:bg-base-200/50'
                    }`}
                  >
                    <div className="flex items-center justify-between w-full">
                      <span className="text-base font-extrabold text-base-content">{l.native}</span>
                      {isSelected && <Check className="w-4 h-4 text-primary" />}
                    </div>
                    <span className="text-xs text-base-content/60 font-medium">{l.name}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* FESTIVAL SELECTION POPUP MODAL */}
      {/* ========================================================================= */}
      {festModalOpen && (
        <div className="fixed inset-0 z-[99999] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-base-100 border border-base-300 max-w-md w-full rounded-3xl p-6 space-y-4 shadow-2xl animate-in fade-in zoom-in duration-150">
            <div className="flex items-center justify-between border-b border-base-200 pb-3">
              <div className="flex items-center gap-2">
                <span className="text-2xl">🪔</span>
                <div>
                  <h3 className="font-extrabold text-lg text-base-content">Cultural & Festive Context</h3>
                  <p className="text-xs text-base-content/60">Adapts opportunities, products, and seasonal demand</p>
                </div>
              </div>
              <button 
                onClick={() => setFestModalOpen(false)}
                className="btn btn-sm btn-circle btn-ghost"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {[
                { name: 'Diwali', icon: '🪔', theme: 'Festival of Lights' },
                { name: 'Pongal', icon: '🌾', theme: 'Harvest Thanksgiving' },
                { name: 'Onam', icon: '🌸', theme: 'Grand Harvest Feast' },
                { name: 'Durga Puja', icon: '🌺', theme: 'Navratri & Sharad Utsav' },
                { name: 'Eid', icon: '🌙', theme: 'Blessings & Gifting' },
                { name: 'Christmas', icon: '🎄', theme: 'Winter Joy & Hampers' }
              ].map((fest) => {
                const isSelected = activeFestival === fest.name;
                return (
                  <button
                    key={fest.name}
                    type="button"
                    onClick={() => {
                      setActiveFestival(fest.name);
                      setFestModalOpen(false);
                    }}
                    className={`p-3 rounded-2xl border text-left transition-all flex items-center justify-between ${
                      isSelected
                        ? 'border-secondary bg-secondary/10 text-secondary font-bold'
                        : 'border-base-300 bg-base-100 hover:border-secondary/40 hover:bg-base-200/50'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-xl">{fest.icon}</span>
                      <div>
                        <div className="text-sm font-bold text-base-content">{fest.name}</div>
                        <div className="text-[10px] text-base-content/60">{fest.theme}</div>
                      </div>
                    </div>
                    {isSelected && <Check className="w-4 h-4 text-secondary" />}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

    </>
  );
}
