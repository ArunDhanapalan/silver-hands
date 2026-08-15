import React, { useState } from 'react';
import { createPortal } from 'react-dom';
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
  Home, 
  Award, 
  BookOpen 
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
    setCustomLocality,
    allFestivals,
    currentFestivalInfo
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

                  {isSenior && (
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
                <div className="dropdown dropdown-end relative">
                  <div tabIndex={0} role="button" className="btn btn-ghost btn-circle avatar placeholder" aria-label="User menu">
                    <div className="bg-primary text-primary-content rounded-full w-9 shadow-inner flex items-center justify-center font-bold text-sm">
                      {user?.full_name ? user.full_name.charAt(0).toUpperCase() : 'U'}
                    </div>
                  </div>
                  <ul tabIndex={0} className="menu menu-sm dropdown-content mt-2 z-50 p-2.5 shadow-2xl bg-base-100 rounded-3xl w-64 right-0 max-w-[calc(100vw-2rem)] border border-base-300 text-xs space-y-1">
                    <li className="px-3 py-2 bg-base-200/60 rounded-2xl mb-1">
                      <div className="flex flex-col gap-0.5 pointer-events-none p-0">
                        <span className="font-extrabold text-sm text-base-content truncate">{user?.company_name || user?.full_name}</span>
                        <div className="flex items-center gap-1.5">
                          <span className="badge badge-xs badge-primary font-bold text-white uppercase">{user?.role}</span>
                          <span className="text-[10px] text-base-content/60 truncate">{user?.email}</span>
                        </div>
                      </div>
                    </li>
                    
                    {user?.role === 'senior' && (
                      <>
                        <li><Link to="/senior" className="py-2 rounded-xl font-semibold"><Layers className="w-4 h-4 text-primary" /> Opportunities Deck</Link></li>
                        <li><Link to="/senior/passport" className="py-2 rounded-xl font-semibold text-warning"><Award className="w-4 h-4 text-warning" /> My Skill Passport</Link></li>
                        <li><Link to="/senior/services" className="py-2 rounded-xl font-semibold"><BookOpen className="w-4 h-4 text-accent" /> Manage Live Classes</Link></li>
                        <li><Link to="/senior/orders" className="py-2 rounded-xl font-semibold"><Package className="w-4 h-4 text-primary" /> Store Orders</Link></li>
                        <li><Link to="/senior/earnings" className="py-2 rounded-xl font-semibold"><TrendingUp className="w-4 h-4 text-success" /> Earnings & Ledger</Link></li>
                        <li><Link to="/community" className="py-2 rounded-xl font-semibold"><Users className="w-4 h-4 text-secondary" /> Senior Community</Link></li>
                        <li><Link to="/senior/onboarding" className="py-2 rounded-xl font-semibold"><Sparkles className="w-4 h-4 text-secondary" /> Edit Life Story</Link></li>
                      </>
                    )}

                    {user?.role === 'customer' && (
                      <>
                        <li><Link to="/orders" className="py-2 rounded-xl font-semibold"><Package className="w-4 h-4 text-primary" /> My Store Orders</Link></li>
                        <li><Link to="/customer/services" className="py-2 rounded-xl font-semibold"><BookOpen className="w-4 h-4 text-accent" /> My Booked Classes</Link></li>
                        <li><Link to="/cart" className="py-2 rounded-xl font-semibold"><ShoppingBag className="w-4 h-4 text-secondary" /> My Cart</Link></li>
                        <li><Link to="/community" className="py-2 rounded-xl font-semibold"><Users className="w-4 h-4 text-primary" /> Community Feed</Link></li>
                      </>
                    )}

                    {user?.role === 'company' && (
                      <>
                        <li><Link to="/company" className="py-2 rounded-xl font-semibold"><Briefcase className="w-4 h-4 text-primary" /> Company Dashboard</Link></li>
                        <li><Link to="/community" className="py-2 rounded-xl font-semibold"><Users className="w-4 h-4 text-secondary" /> Community Feed</Link></li>
                      </>
                    )}

                    <li className="border-t border-base-200 pt-1 mt-1">
                      <button onClick={logout} className="text-error font-bold py-2 rounded-xl hover:bg-error/10">
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

      {/* FULL-SCREEN FIXED CITY SELECTOR MODAL */}
      {cityModalOpen && createPortal(
        <div className="fixed inset-0 z-[999999] bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
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
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 text-xs">
                {indianCities.map((c) => {
                  const isSelected = selectedCity.name === c.name;
                  return (
                    <button
                      key={c.name}
                      type="button"
                      onClick={() => handleCitySelect(c)}
                      className={`min-h-[48px] p-3 rounded-2xl border text-left transition-all flex items-center justify-between ${
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
              
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => handleLocalitySelect('All Areas')}
                  className={`min-h-[40px] px-3.5 py-1.5 rounded-xl font-bold text-xs ${
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
                    className={`min-h-[40px] px-3.5 py-1.5 rounded-xl text-xs ${
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
                  className="input input-bordered min-h-[44px] text-sm rounded-xl w-full"
                />
                <input
                  type="text"
                  value={customLocalityInput}
                  onChange={(e) => setCustomLocalityInput(e.target.value)}
                  placeholder="e.g. Kothrud, Vaishali Nagar"
                  className="input input-bordered min-h-[44px] text-sm rounded-xl w-full"
                />
              </div>
              <div className="flex justify-end pt-1">
                <button 
                  type="submit" 
                  disabled={!customCityInput.trim() && !customLocalityInput.trim()}
                  className="btn btn-primary min-h-[44px] px-5 text-white rounded-xl font-bold text-sm"
                >
                  Apply Location
                </button>
              </div>
            </form>

          </div>
        </div>,
        document.body
      )}

      {/* FULL-SCREEN FIXED LANGUAGE SELECTOR MODAL */}
      {langModalOpen && createPortal(
        <div className="fixed inset-0 z-[999999] bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
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
                    className={`min-h-[52px] p-3 rounded-2xl border text-left transition-all flex items-center justify-between ${
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
        </div>,
        document.body
      )}

      {/* FULL-SCREEN FIXED FESTIVAL SELECTOR MODAL */}
      {festModalOpen && createPortal(
        <div className="fixed inset-0 z-[999999] bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-base-100 border border-base-300 rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4 max-h-[85vh] overflow-y-auto animate-in fade-in zoom-in duration-200">
            
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
                { name: 'Milad-un-Nabi / Id-e-Milad', icon: '🌙', theme: 'Aug 26, 2026 • Blessings & Sheer Khurma' },
                { name: 'Janmashtami', icon: '🪈', theme: 'Sep 4, 2026 • Krishna Sweets & Peda' },
                { name: 'Onam', icon: '🌸', theme: 'Sep 14, 2026 • Sadhya Feasts & Kasavu' },
                { name: 'Durga Puja / Navratri', icon: '🌺', theme: 'Oct 2, 2026 • Dandiya & Bhog' },
                { name: 'Diwali', icon: '🪔', theme: 'Oct 20, 2026 • Festival of Lights & Sweets' },
                { name: 'Christmas & New Year', icon: '🎄', theme: 'Dec 25, 2026 • Plum Cakes & Gifting' },
                { name: 'Pongal / Makar Sankranti', icon: '🌾', theme: 'Jan 15, 2027 • Harvest & Clayware' },
                { name: 'Eid-ul-Fitr', icon: '🌙', theme: 'Mar 31, 2027 • Festive Kurta & Delicacies' }
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
                    className={`min-h-[56px] p-3 rounded-2xl border text-left transition-all flex items-center justify-between ${
                      isSelected
                        ? 'border-secondary bg-secondary/10 text-secondary font-bold shadow-xs'
                        : 'border-base-300 bg-base-100 hover:border-secondary/40 hover:bg-base-200/50'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="text-2xl">{fest.icon}</span>
                      <div>
                        <div className="text-sm font-bold text-base-content">{fest.name}</div>
                        <div className="text-[10px] text-base-content/60">{fest.theme}</div>
                      </div>
                    </div>
                    {isSelected && <Check className="w-4 h-4 text-secondary shrink-0" />}
                  </button>
                );
              })}
            </div>
          </div>
        </div>,
        document.body
      )}

    </>
  );
}
