import React, { useState } from 'react';
import { Link, useLocation as useRouteLocation } from 'react-router-dom';
import { 
  ShoppingBag, 
  Sparkles, 
  Users, 
  Layers, 
  TrendingUp, 
  MapPin, 
  Globe, 
  Briefcase, 
  ChevronDown, 
  Plus, 
  Check, 
  X,
  ShieldCheck,
  Package,
  Calendar,
  LogOut,
  User,
  SlidersHorizontal,
  Home
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useLocation } from '../../context/LocationContext';
import { useLanguage } from '../../context/LanguageContext';

export default function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();
  const { 
    selectedCity, 
    setSelectedCity, 
    indianCities, 
    activeFestival, 
    setActiveFestival,
    selectedLocality,
    setSelectedLocality,
    setCustomLocality
  } = useLocation();
  const { language, setLanguage, languages, t } = useLanguage();
  const routerLocation = useRouteLocation();

  const [cityModalOpen, setCityModalOpen] = useState(false);
  const [langModalOpen, setLangModalOpen] = useState(false);
  const [festModalOpen, setFestModalOpen] = useState(false);
  const [customCityInput, setCustomCityInput] = useState('');
  const [customLocalityInput, setCustomLocalityInput] = useState('');

  const handleCitySelect = (cityObj) => {
    setSelectedCity(cityObj.name);
    setSelectedLocality('All Areas');
    setCityModalOpen(false);
  };

  const handleLocalitySelect = (locName) => {
    setSelectedLocality(locName);
    setCityModalOpen(false);
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
  const isSenior = user?.role === 'senior';

  return (
    <>
      <header className="sticky top-0 z-40 bg-base-100/95 backdrop-blur border-b border-base-300 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            
            {/* Brand */}
            <div className="flex items-center gap-3">
              <Link to={isCompany ? "/company" : isSenior ? "/senior" : "/"} className="flex items-center gap-2.5 group">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-primary to-secondary flex items-center justify-center text-white font-bold text-xl shadow-md group-hover:scale-105 transition-transform">
                  🤝
                </div>
                <div>
                  <span className="font-extrabold text-xl tracking-tight bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                    SilverHands
                  </span>
                  <span className="hidden sm:inline-block ml-2 text-xs font-semibold px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
                    {isCompany ? 'Company Portal' : isSenior ? 'Senior Guru' : 'Livelihood 2.0'}
                  </span>
                </div>
              </Link>
            </div>

            {/* Desktop Navigation Links */}
            <nav className="hidden md:flex items-center gap-1 text-sm font-medium">
              
              {/* If Company Profile, ONLY Show Company Hub */}
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
                  {/* Opportunities (Front and Center for Seniors and All) */}
                  <Link 
                    to="/senior" 
                    className={`btn btn-ghost btn-sm rounded-lg gap-1.5 font-bold ${routerLocation.pathname === '/senior' ? 'btn-active text-primary bg-primary/10' : ''}`}
                  >
                    <Layers className="w-4 h-4 text-primary" />
                    Opportunities
                  </Link>

                  {/* Community & Collaborations */}
                  <Link 
                    to="/community" 
                    className={`btn btn-ghost btn-sm rounded-lg gap-1.5 font-bold ${routerLocation.pathname.startsWith('/community') ? 'btn-active text-primary bg-primary/10' : ''}`}
                  >
                    <Users className="w-4 h-4 text-secondary" />
                    Community
                  </Link>

                  {/* Store */}
                  <Link 
                    to="/store" 
                    className={`btn btn-ghost btn-sm rounded-lg gap-1.5 ${routerLocation.pathname.startsWith('/store') ? 'btn-active text-primary' : ''}`}
                  >
                    <ShoppingBag className="w-4 h-4 text-accent" />
                    {t('nav_store')}
                  </Link>

                  {/* Services */}
                  <Link 
                    to="/services" 
                    className={`btn btn-ghost btn-sm rounded-lg gap-1.5 ${routerLocation.pathname.startsWith('/services') ? 'btn-active text-primary' : ''}`}
                  >
                    <Sparkles className="w-4 h-4 text-warning" />
                    {t('nav_services')}
                  </Link>

                  {isSenior && (
                    <>
                      <Link 
                        to="/senior/orders" 
                        className={`btn btn-ghost btn-sm rounded-lg gap-1.5 ${routerLocation.pathname === '/senior/orders' ? 'btn-active text-primary' : ''}`}
                      >
                        <Package className="w-4 h-4 text-primary" />
                        My Orders
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
                  <ul tabIndex={0} className="menu menu-sm dropdown-content mt-3 z-50 p-2 shadow-xl bg-base-100 rounded-2xl w-56 border border-base-300 text-xs">
                    <li className="menu-title px-3 py-1 font-bold text-base-content/70 border-b border-base-200">
                      {user?.full_name}
                      <span className="badge badge-xs badge-primary font-normal text-white uppercase ml-1">{user?.role}</span>
                    </li>
                    
                    {user?.role === 'senior' && (
                      <>
                        <li><Link to="/senior"><Layers className="w-4 h-4 text-primary" /> Opportunities Deck</Link></li>
                        <li><Link to="/community"><Users className="w-4 h-4 text-secondary" /> Senior Community</Link></li>
                        <li><Link to="/senior/orders"><Package className="w-4 h-4 text-primary" /> Manage Store Orders</Link></li>
                        <li><Link to="/senior/earnings"><TrendingUp className="w-4 h-4 text-success" /> Earnings & Ledger</Link></li>
                        <li><Link to="/senior/onboarding"><Sparkles className="w-4 h-4 text-secondary" /> Edit Life-to-Skill Story</Link></li>
                      </>
                    )}

                    {user?.role === 'customer' && (
                      <>
                        <li><Link to="/cart"><ShoppingBag className="w-4 h-4 text-primary" /> My Cart</Link></li>
                        <li><Link to="/orders"><Package className="w-4 h-4 text-secondary" /> My Orders</Link></li>
                        <li><Link to="/community"><Users className="w-4 h-4 text-accent" /> Community Feed</Link></li>
                      </>
                    )}

                    {user?.role === 'company' && (
                      <>
                        <li><Link to="/company"><Briefcase className="w-4 h-4 text-primary" /> Company Dashboard</Link></li>
                      </>
                    )}

                    <li className="border-t border-base-200 mt-1">
                      <button onClick={logout} className="text-error font-bold">
                        <LogOut className="w-4 h-4" /> Logout
                      </button>
                    </li>
                  </ul>
                </div>
              ) : (
                <div className="flex items-center gap-1.5">
                  <Link to="/login" className="btn btn-ghost btn-sm text-xs font-bold rounded-xl">
                    {t('nav_login')}
                  </Link>
                  <Link to="/register" className="btn btn-primary btn-sm text-white text-xs font-bold rounded-xl shadow-xs">
                    {t('nav_register')}
                  </Link>
                </div>
              )}

            </div>

          </div>
        </div>
      </header>

      {/* MOBILE BOTTOM NAVIGATION BAR (md:hidden) */}
      {!isCompany && (
        <nav 
          aria-label="Mobile Navigation"
          className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-base-100/95 backdrop-blur-md border-t border-base-300 py-1 px-2 flex items-center justify-around text-[10px] font-bold shadow-lg"
        >
          <Link 
            to="/senior" 
            className={`flex flex-col items-center gap-0.5 p-1 rounded-xl transition-colors ${
              routerLocation.pathname === '/senior' ? 'text-primary' : 'text-base-content/70 hover:text-primary'
            }`}
          >
            <Layers className="w-5 h-5" />
            <span>Opportunities</span>
          </Link>

          <Link 
            to="/community" 
            className={`flex flex-col items-center gap-0.5 p-1 rounded-xl transition-colors ${
              routerLocation.pathname.startsWith('/community') ? 'text-secondary' : 'text-base-content/70 hover:text-secondary'
            }`}
          >
            <Users className="w-5 h-5" />
            <span>Community</span>
          </Link>

          <Link 
            to="/store" 
            className={`flex flex-col items-center gap-0.5 p-1 rounded-xl transition-colors ${
              routerLocation.pathname.startsWith('/store') ? 'text-accent' : 'text-base-content/70 hover:text-accent'
            }`}
          >
            <ShoppingBag className="w-5 h-5" />
            <span>Store</span>
          </Link>

          <Link 
            to="/services" 
            className={`flex flex-col items-center gap-0.5 p-1 rounded-xl transition-colors ${
              routerLocation.pathname.startsWith('/services') ? 'text-warning' : 'text-base-content/70 hover:text-warning'
            }`}
          >
            <Sparkles className="w-5 h-5" />
            <span>Services</span>
          </Link>

          {isSenior ? (
            <Link 
              to="/senior/orders" 
              className={`flex flex-col items-center gap-0.5 p-1 rounded-xl transition-colors ${
                routerLocation.pathname.startsWith('/senior/orders') ? 'text-success' : 'text-base-content/70 hover:text-success'
              }`}
            >
              <Package className="w-5 h-5" />
              <span>Orders</span>
            </Link>
          ) : (
            <Link 
              to="/cart" 
              className={`flex flex-col items-center gap-0.5 p-1 rounded-xl transition-colors ${
                routerLocation.pathname === '/cart' ? 'text-primary' : 'text-base-content/70 hover:text-primary'
              }`}
            >
              <ShoppingBag className="w-5 h-5" />
              <span>Cart</span>
            </Link>
          )}
        </nav>
      )}

      {/* FULL-SCREEN FIXED CITY SELECTOR MODAL */}
      {cityModalOpen && (
        <div className="fixed inset-0 z-[99999] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-base-100 border border-base-300 rounded-3xl max-w-xl w-full p-6 shadow-2xl space-y-4 max-h-[85vh] overflow-y-auto animate-in fade-in zoom-in duration-200">
            
            <div className="flex items-center justify-between pb-3 border-b border-base-200">
              <div className="flex items-center gap-2">
                <MapPin className="w-5 h-5 text-secondary" />
                <h3 className="font-extrabold text-lg text-base-content">Select Your City & Locality</h3>
              </div>
              <button 
                type="button" 
                onClick={() => setCityModalOpen(false)}
                className="btn btn-sm btn-circle btn-ghost"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* City Grid */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-base-content/70 uppercase">Supported Cities across India</label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
                {indianCities.map((c) => {
                  const isSelected = selectedCity.name === c.name;
                  return (
                    <button
                      key={c.name}
                      type="button"
                      onClick={() => handleCitySelect(c)}
                      className={`p-3 rounded-2xl border text-left transition-all flex items-center justify-between ${
                        isSelected 
                          ? 'border-primary bg-primary/10 text-primary font-bold shadow-xs' 
                          : 'border-base-300 bg-base-100 hover:border-primary/40 hover:bg-base-200/50 text-base-content'
                      }`}
                    >
                      <div>
                        <div className="font-bold text-sm">{c.name}</div>
                        <div className="text-[10px] text-base-content/60">{c.tier} • {c.localities.length} Localities</div>
                      </div>
                      {isSelected && <Check className="w-4 h-4 text-primary" />}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Localities for Current City */}
            <div className="space-y-2 pt-2 border-t border-base-200">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-base-content/70 uppercase">
                  Localities in {selectedCity.name}
                </label>
                <span className="text-[11px] text-primary font-semibold">Active: {selectedLocality}</span>
              </div>
              
              <div className="flex flex-wrap gap-1.5">
                <button
                  type="button"
                  onClick={() => handleLocalitySelect('All Areas')}
                  className={`btn btn-xs rounded-xl font-bold ${
                    selectedLocality === 'All Areas' ? 'btn-secondary text-white' : 'btn-outline border-base-300'
                  }`}
                >
                  All Areas ({selectedCity.name})
                </button>
                {selectedCity.localities.map((loc) => (
                  <button
                    key={loc}
                    type="button"
                    onClick={() => handleLocalitySelect(loc)}
                    className={`btn btn-xs rounded-xl ${
                      selectedLocality === loc ? 'btn-secondary text-white font-bold' : 'btn-ghost bg-base-200/60'
                    }`}
                  >
                    {loc}
                  </button>
                ))}
              </div>
            </div>

            {/* Custom City / Locality Input */}
            <form onSubmit={handleAddCustomCityOrLocality} className="space-y-2 pt-2 border-t border-base-200">
              <label className="text-xs font-bold text-base-content/70 flex items-center gap-1">
                <Plus className="w-3.5 h-3.5 text-primary" /> Enter Another City / Locality in India:
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <input
                  type="text"
                  value={customCityInput}
                  onChange={(e) => setCustomCityInput(e.target.value)}
                  placeholder="e.g. Pune, Jaipur, Mysore"
                  className="input input-bordered input-sm text-xs rounded-xl w-full"
                />
                <input
                  type="text"
                  value={customLocalityInput}
                  onChange={(e) => setCustomLocalityInput(e.target.value)}
                  placeholder="e.g. Kothrud, Vaishali Nagar"
                  className="input input-bordered input-sm text-xs rounded-xl w-full"
                />
              </div>
              <div className="flex justify-end pt-1">
                <button 
                  type="submit" 
                  disabled={!customCityInput.trim() && !customLocalityInput.trim()}
                  className="btn btn-primary btn-sm text-white rounded-xl font-bold text-xs"
                >
                  Apply Location
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

      {/* FULL-SCREEN FIXED LANGUAGE SELECTOR MODAL */}
      {langModalOpen && (
        <div className="fixed inset-0 z-[99999] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-base-100 border border-base-300 rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4 max-h-[85vh] overflow-y-auto animate-in fade-in zoom-in duration-200">
            
            <div className="flex items-center justify-between pb-3 border-b border-base-200">
              <div className="flex items-center gap-2">
                <Globe className="w-5 h-5 text-accent" />
                <div>
                  <h3 className="font-extrabold text-lg text-base-content">Choose Your Preferred Language</h3>
                  <p className="text-xs text-base-content/60">100% Platform translation across 11 Indian languages</p>
                </div>
              </div>
              <button 
                type="button" 
                onClick={() => setLangModalOpen(false)}
                className="btn btn-sm btn-circle btn-ghost"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
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
                    className={`p-3 rounded-2xl border text-left transition-all flex items-center justify-between ${
                      isSelected
                        ? 'border-accent bg-accent/10 text-accent font-bold shadow-xs'
                        : 'border-base-300 bg-base-100 hover:border-accent/40 hover:bg-base-200/50 text-base-content'
                    }`}
                  >
                    <div>
                      <div className="text-base font-extrabold">{l.native}</div>
                      <div className="text-xs text-base-content/60">{l.name}</div>
                    </div>
                    {isSelected && <Check className="w-4 h-4 text-accent" />}
                  </button>
                );
              })}
            </div>

          </div>
        </div>
      )}

      {/* FULL-SCREEN FIXED FESTIVAL SELECTOR MODAL */}
      {festModalOpen && (
        <div className="fixed inset-0 z-[99999] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-base-100 border border-base-300 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in duration-200">
            
            <div className="flex items-center justify-between pb-3 border-b border-base-200">
              <div className="flex items-center gap-2">
                <span className="text-2xl">🪔</span>
                <div>
                  <h3 className="font-extrabold text-lg text-base-content">Festival Edition & Catalogs</h3>
                  <p className="text-xs text-base-content/60">Tailor store items & gigs to current Indian festivals</p>
                </div>
              </div>
              <button 
                type="button" 
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
                        ? 'border-secondary bg-secondary/10 text-secondary font-bold shadow-xs'
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
