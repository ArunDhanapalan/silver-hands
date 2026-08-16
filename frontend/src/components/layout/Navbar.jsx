import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { Link, useNavigate, useLocation as useRouteLocation } from 'react-router-dom';
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
  BookOpen,
  MessageSquare,
  Bell 
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useLocation } from '../../context/LocationContext';
import { useLanguage } from '../../context/LanguageContext';
import { useBadges } from '../../context/BadgeContext';
import { useChat } from '../../context/ChatContext';

export default function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
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

  const handleLogout = () => {
    logout();
    navigate('/', { replace: true });
  };
  const { getCount, markSeen } = useBadges();
  const { openChatDrawer, totalUnreadCount } = useChat();

  const [cityModalOpen, setCityModalOpen] = useState(false);
  const [langModalOpen, setLangModalOpen] = useState(false);
  const [festModalOpen, setFestModalOpen] = useState(false);
  const [customCityInput, setCustomCityInput] = useState('');
  const [customLocalityInput, setCustomLocalityInput] = useState('');

  // Auto-dismiss notification badges when Senior is actively on that section
  React.useEffect(() => {
    if (routerLocation.pathname === '/senior' || routerLocation.pathname === '/opportunities') {
      markSeen('opportunities');
    } else if (routerLocation.pathname.startsWith('/senior/storefront') || routerLocation.pathname.startsWith('/storefront')) {
      markSeen('storefront');
    } else if (routerLocation.pathname.startsWith('/senior/services')) {
      markSeen('services');
    }
  }, [routerLocation.pathname]);

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
                <div className="flex items-center">
                  <span className="font-extrabold text-lg sm:text-xl tracking-tight bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                    SilverHands
                  </span>
                </div>
              </Link>
            </div>

              {/* Desktop Navigation Links */}
            <nav className="hidden md:flex items-center gap-1 text-sm font-medium">
              
              {/* If Company Profile */}
              {isCompany ? (
                <>
                  <Link 
                    to="/company" 
                    className={`btn btn-ghost btn-sm rounded-xl min-h-[40px] gap-1.5 ${routerLocation.pathname.startsWith('/company') ? 'btn-active text-primary font-bold' : ''}`}
                  >
                    <Briefcase className="w-4 h-4 text-primary" />
                    Company Hub & Postings
                  </Link>
                  <Link 
                    to="/community" 
                    className={`btn btn-ghost btn-sm rounded-xl min-h-[40px] gap-1.5 ${routerLocation.pathname.startsWith('/community') ? 'btn-active text-primary font-bold' : ''}`}
                  >
                    <Users className="w-4 h-4 text-secondary" />
                    {t('nav_community')}
                  </Link>
                </>
              ) : isSenior ? (
                /* Senior Navigation — Cleanly Segregated with Numeric Notification Badges */
                <>
                  <Link 
                    to="/senior" 
                    onClick={() => markSeen('opportunities')}
                    className={`btn btn-ghost btn-sm rounded-xl min-h-[40px] gap-1.5 ${routerLocation.pathname === '/senior' || routerLocation.pathname === '/opportunities' ? 'btn-active text-primary font-extrabold bg-primary/10' : ''}`}
                  >
                    <Briefcase className="w-4 h-4 text-warning" />
                    <span>Opportunities</span>
                    {getCount('opportunities') > 0 && (
                      <span className="min-w-[20px] h-[20px] px-1.5 bg-error text-white font-black text-[11px] rounded-full flex items-center justify-center shadow-xs">
                        {getCount('opportunities')}
                      </span>
                    )}
                  </Link>

                  <Link 
                    to="/senior/storefront" 
                    onClick={() => markSeen('storefront')}
                    className={`btn btn-ghost btn-sm rounded-xl min-h-[40px] gap-1.5 ${routerLocation.pathname.startsWith('/senior/storefront') || routerLocation.pathname.startsWith('/storefront') ? 'btn-active text-secondary font-extrabold bg-secondary/10' : ''}`}
                  >
                    <ShoppingBag className="w-4 h-4 text-secondary" />
                    <span>My Storefront</span>
                    {getCount('storefront') > 0 && (
                      <span className="min-w-[20px] h-[20px] px-1.5 bg-error text-white font-black text-[11px] rounded-full flex items-center justify-center shadow-xs">
                        {getCount('storefront')}
                      </span>
                    )}
                  </Link>

                  <Link 
                    to="/senior/services" 
                    onClick={() => markSeen('services')}
                    className={`btn btn-ghost btn-sm rounded-xl min-h-[40px] gap-1.5 ${routerLocation.pathname.startsWith('/senior/services') ? 'btn-active text-accent font-extrabold bg-accent/10' : ''}`}
                  >
                    <BookOpen className="w-4 h-4 text-accent" />
                    <span>Service Hub</span>
                    {getCount('services') > 0 && (
                      <span className="min-w-[20px] h-[20px] px-1.5 bg-error text-white font-black text-[11px] rounded-full flex items-center justify-center shadow-xs">
                        {getCount('services')}
                      </span>
                    )}
                  </Link>

                  <Link 
                    to="/senior/earnings" 
                    className={`btn btn-ghost btn-sm rounded-xl min-h-[40px] gap-1.5 ${routerLocation.pathname === '/senior/earnings' ? 'btn-active text-success font-extrabold bg-success/10' : ''}`}
                  >
                    <TrendingUp className="w-4 h-4 text-success" />
                    <span>{t('nav_earnings')}</span>
                  </Link>

                  <Link 
                    to="/community" 
                    className={`btn btn-ghost btn-sm rounded-xl min-h-[40px] gap-1.5 ${routerLocation.pathname.startsWith('/community') ? 'btn-active text-primary font-extrabold bg-primary/10' : ''}`}
                  >
                    <Users className="w-4 h-4 text-primary" />
                    <span>{t('nav_community')}</span>
                  </Link>
                </>
              ) : (
                /* Consumer & Guest Navigation — Clean without Senior notification badges */
                <>
                  <Link 
                    to="/store" 
                    className={`btn btn-ghost btn-sm rounded-xl min-h-[40px] gap-1.5 ${routerLocation.pathname.startsWith('/store') ? 'btn-active text-primary font-bold' : ''}`}
                  >
                    <ShoppingBag className="w-4 h-4 text-secondary" />
                    <span>{t('nav_store')}</span>
                  </Link>

                  <Link 
                    to="/services" 
                    className={`btn btn-ghost btn-sm rounded-xl min-h-[40px] gap-1.5 ${routerLocation.pathname.startsWith('/services') ? 'btn-active text-primary font-bold' : ''}`}
                  >
                    <Sparkles className="w-4 h-4 text-accent" />
                    <span>{t('nav_services')}</span>
                  </Link>

                  <Link 
                    to="/community" 
                    className={`btn btn-ghost btn-sm rounded-xl min-h-[40px] gap-1.5 ${routerLocation.pathname.startsWith('/community') ? 'btn-active text-primary font-bold' : ''}`}
                  >
                    <Users className="w-4 h-4 text-primary" />
                    <span>{t('nav_community')}</span>
                  </Link>
                </>
              )}

            </nav>

            {/* Right Controls: City Selector, Language Selector, User Profile */}
            <div className="flex items-center gap-1.5 sm:gap-2">
              
              {/* City Selector Modal Trigger */}
              <button
                type="button"
                onClick={() => setCityModalOpen(true)}
                className="btn btn-ghost btn-sm rounded-xl px-2 sm:px-2.5 min-h-[38px] sm:min-h-[40px] gap-1 sm:gap-1.5 text-xs font-semibold hover:bg-base-200 border border-base-300 shadow-xs"
                aria-label="Select City"
                title={`City: ${selectedCity?.name || 'Chennai'}`}
              >
                <MapPin className="w-3.5 h-3.5 text-secondary shrink-0" />
                <span className="hidden sm:inline max-w-[80px] sm:max-w-none truncate font-bold">{selectedCity?.name || 'Chennai'}</span>
                {selectedLocality && selectedLocality !== 'All Areas' && (
                  <span className="text-[10px] text-base-content/60 hidden md:inline">({selectedLocality})</span>
                )}
                <span className="badge badge-xs badge-neutral hidden lg:inline">{selectedCity?.tier || 'Metro'}</span>
                <ChevronDown className="w-3 h-3 opacity-60 hidden sm:inline" />
              </button>

              {/* Language Selector Modal Trigger */}
              <button
                type="button"
                onClick={() => setLangModalOpen(true)}
                className="btn btn-ghost btn-sm rounded-xl px-2.5 min-h-[40px] gap-1.5 text-xs font-semibold hover:bg-base-200 border border-base-300 shadow-xs"
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
                  <div tabIndex={0} role="button" className="btn btn-ghost btn-circle avatar placeholder min-h-[44px] min-w-[44px] relative" aria-label="User menu">
                    <div className="bg-primary text-primary-content rounded-full w-10 shadow-inner flex items-center justify-center font-bold text-sm">
                      {user?.full_name ? user.full_name.charAt(0).toUpperCase() : 'U'}
                    </div>
                    {(totalUnreadCount > 0 || getCount('opportunities') > 0 || getCount('storefront') > 0 || getCount('services') > 0) && (
                      <span 
                        className="absolute -top-1 -right-1 bg-error text-white p-1 rounded-full shadow-lg flex items-center justify-center border-2 border-base-100 min-w-[18px] min-h-[18px] text-[10px] font-black"
                        title="New notifications / messages"
                      >
                        {totalUnreadCount > 0 ? (
                          <Bell className="w-2.5 h-2.5 fill-current" />
                        ) : (
                          <span>•</span>
                        )}
                      </span>
                    )}
                  </div>
                  <ul tabIndex={0} className="menu menu-sm dropdown-content mt-3 z-[99999] p-2 shadow-2xl bg-base-100 rounded-2xl w-64 border border-base-300 space-y-0.5 animate-in fade-in zoom-in-95 duration-150">
                    <li className="menu-title px-2.5 py-1.5 border-b border-base-200 mb-1">
                      <div className="flex flex-col">
                        <span className="font-extrabold text-sm text-base-content truncate">{user?.full_name || 'User'}</span>
                        <span className="text-[11px] text-base-content/60 font-medium truncate">{user?.email}</span>
                      </div>
                    </li>

                    {/* Direct Messages Entry — Accessible through profile card */}
                    <li className="border-b border-base-200 pb-1 mb-0.5">
                      <button
                        type="button"
                        onClick={openChatDrawer}
                        className="min-h-[38px] px-2.5 py-1.5 rounded-xl font-bold flex items-center justify-between hover:bg-primary/10 text-primary w-full text-left"
                      >
                        <span className="flex items-center gap-2">
                          <MessageSquare className="w-3.5 h-3.5 text-primary shrink-0" />
                          <span>My Direct Chats</span>
                        </span>
                        {totalUnreadCount > 0 ? (
                          <span className="badge badge-error badge-xs text-white font-black text-[10px] min-w-[18px] h-[18px] rounded-full p-0 flex items-center justify-center">
                            {totalUnreadCount}
                          </span>
                        ) : (
                          <span className="badge badge-ghost badge-xs text-[9px] text-base-content/50">Safe</span>
                        )}
                      </button>
                    </li>
                    
                    {user?.role === 'senior' && (
                      <>
                        <li>
                          <Link to="/senior" className="min-h-[38px] px-2.5 py-1.5 rounded-xl font-bold flex items-center justify-between hover:bg-base-200 active:bg-primary active:text-white">
                            <span className="flex items-center gap-2">
                              <Briefcase className="w-3.5 h-3.5 text-warning shrink-0" />
                              <span>Job Opportunities</span>
                            </span>
                            {getCount('opportunities') > 0 && (
                              <span className="badge badge-error badge-xs text-white font-black text-[10px]">
                                {getCount('opportunities')}
                              </span>
                            )}
                          </Link>
                        </li>
                        <li>
                          <Link to="/senior/storefront" className="min-h-[38px] px-2.5 py-1.5 rounded-xl font-bold flex items-center justify-between hover:bg-base-200 text-secondary active:bg-secondary active:text-white">
                            <span className="flex items-center gap-2">
                              <ShoppingBag className="w-3.5 h-3.5 text-secondary shrink-0" />
                              <span>My Storefront</span>
                            </span>
                            {getCount('storefront') > 0 && (
                              <span className="badge badge-error badge-xs text-white font-black text-[10px]">
                                {getCount('storefront')}
                              </span>
                            )}
                          </Link>
                        </li>
                        <li>
                          <Link to="/senior/services" className="min-h-[38px] px-2.5 py-1.5 rounded-xl font-bold flex items-center justify-between hover:bg-base-200 text-accent active:bg-accent active:text-white">
                            <span className="flex items-center gap-2">
                              <BookOpen className="w-3.5 h-3.5 text-accent shrink-0" />
                              <span>Service Hub</span>
                            </span>
                            {getCount('services') > 0 && (
                              <span className="badge badge-error badge-xs text-white font-black text-[10px]">
                                {getCount('services')}
                              </span>
                            )}
                          </Link>
                        </li>
                        <li>
                          <Link to="/senior/earnings" className="min-h-[38px] px-2.5 py-1.5 rounded-xl font-bold flex items-center gap-2 hover:bg-base-200 text-success active:bg-success active:text-white">
                            <TrendingUp className="w-3.5 h-3.5 text-success shrink-0" />
                            <span>Earnings Ledger</span>
                          </Link>
                        </li>
                        <li>
                          <Link to="/senior/passport" className="min-h-[38px] px-2.5 py-1.5 rounded-xl font-bold flex items-center gap-2 hover:bg-base-200 text-warning active:bg-warning active:text-white">
                            <Award className="w-3.5 h-3.5 text-warning shrink-0" />
                            <span>Skill Passport</span>
                          </Link>
                        </li>
                        <li>
                          <Link to="/community" className="min-h-[38px] px-2.5 py-1.5 rounded-xl font-bold flex items-center gap-2 hover:bg-base-200 active:bg-primary active:text-white">
                            <Users className="w-3.5 h-3.5 text-primary shrink-0" />
                            <span>Community</span>
                          </Link>
                        </li>
                        <li>
                          <Link to="/senior/onboarding" className="min-h-[38px] px-2.5 py-1.5 rounded-xl font-bold flex items-center gap-2 hover:bg-base-200 active:bg-primary active:text-white">
                            <Sparkles className="w-3.5 h-3.5 text-secondary shrink-0" />
                            <span>Edit Skills</span>
                          </Link>
                        </li>
                      </>
                    )}

                    {user?.role === 'customer' && (
                      <>
                        <li><Link to="/orders" className="min-h-[38px] px-2.5 py-1.5 rounded-xl font-semibold flex items-center gap-2"><Package className="w-3.5 h-3.5 text-primary" /> My Store Orders</Link></li>
                        <li><Link to="/customer/services" className="min-h-[38px] px-2.5 py-1.5 rounded-xl font-semibold flex items-center gap-2"><BookOpen className="w-3.5 h-3.5 text-accent" /> My Classes</Link></li>
                        <li><Link to="/cart" className="min-h-[38px] px-2.5 py-1.5 rounded-xl font-semibold flex items-center gap-2"><ShoppingBag className="w-3.5 h-3.5 text-secondary" /> My Cart</Link></li>
                        <li><Link to="/community" className="min-h-[38px] px-2.5 py-1.5 rounded-xl font-semibold flex items-center gap-2"><Users className="w-3.5 h-3.5 text-primary" /> Community Feed</Link></li>
                      </>
                    )}

                    {user?.role === 'company' && (
                      <>
                        <li><Link to="/company" className="min-h-[38px] px-2.5 py-1.5 rounded-xl font-semibold flex items-center gap-2"><Briefcase className="w-3.5 h-3.5 text-primary" /> Company Dashboard</Link></li>
                        <li><Link to="/community" className="min-h-[38px] px-2.5 py-1.5 rounded-xl font-semibold flex items-center gap-2"><Users className="w-3.5 h-3.5 text-secondary" /> Community Feed</Link></li>
                      </>
                    )}

                    <li className="border-t border-base-200 pt-1 mt-1">
                      <button onClick={handleLogout} className="text-error font-bold min-h-[38px] px-2.5 py-1.5 rounded-xl hover:bg-error/10 flex items-center gap-2 w-full text-left">
                        <LogOut className="w-3.5 h-3.5" /> Logout
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
