import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Sparkles, 
  ShoppingBag, 
  BookOpen, 
  Users, 
  ShieldCheck, 
  Heart, 
  Star, 
  ArrowRight, 
  MapPin, 
  TrendingUp, 
  Gift, 
  CheckCircle2, 
  Video,
  Award,
  Clock
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { useLocation } from '../context/LocationContext';

export default function HomePage() {
  const { user, isAuthenticated } = useAuth();
  const { language, t } = useLanguage();
  const { selectedCity, activeFestival, currentFestivalInfo, festivalSuggestions } = useLocation();
  const navigate = useNavigate();

  const [giftRecipient, setGiftRecipient] = useState('');
  const [giftMessage, setGiftMessage] = useState('');
  const [giftSuccess, setGiftSuccess] = useState(false);

  const handleSendGiftCard = (e) => {
    e.preventDefault();
    setGiftSuccess(true);
    setTimeout(() => {
      setGiftSuccess(false);
      navigate('/store');
    }, 2500);
  };

  const festivalGreeting = currentFestivalInfo?.greeting?.[language] || currentFestivalInfo?.greeting?.en || `Celebrating ${activeFestival} with authentic handmade offerings!`;

  return (
    <div className="space-y-12 pb-16">
      
      {/* 1. HERO SECTION: Story-First & Dignified Generational Connection */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary/15 via-base-100 to-secondary/20 border border-primary/20 p-8 sm:p-12 lg:p-16 shadow-md">
        
        {/* Decorative Indian Motif Blobs */}
        <div className="absolute -right-16 -top-16 w-64 h-64 bg-secondary/15 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute -left-16 -bottom-16 w-64 h-64 bg-primary/15 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative z-10 max-w-3xl space-y-6">
          
          <div className="flex flex-wrap items-center gap-2">
            <span className="badge badge-secondary font-bold text-white uppercase px-3.5 py-2.5 text-xs shadow-xs">
              {currentFestivalInfo?.icon || '🪔'} {activeFestival} Edition
            </span>
            <span className="badge badge-outline badge-neutral font-semibold gap-1.5 text-xs px-3 py-2.5">
              <MapPin className="w-3.5 h-3.5 text-secondary" /> Serving {selectedCity.name} ({selectedCity.tier})
            </span>
            <span className="badge badge-success text-white font-bold gap-1.5 text-xs px-3 py-2.5">
              <ShieldCheck className="w-3.5 h-3.5" /> 100% Verified Seniors
            </span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold text-base-content tracking-tight leading-[1.15]">
            Authentic Living, <br />
            <span className="bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
              Powered by India's Seniors.
            </span>
          </h1>

          <p className="text-sm sm:text-base text-base-content/80 max-w-2xl leading-relaxed">
            Discover small-batch homemade pickles, heritage festive sweets, bespoke tailoring, and 1-on-1 language tuition directly from experienced grandmothers & retirees in your neighborhood.
          </p>

          {/* Action Pathways with accessible 44px+ min touch targets */}
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <Link 
              to="/store" 
              className="btn btn-primary min-h-[48px] px-6 rounded-2xl text-white font-bold text-sm gap-2 shadow-md hover:scale-105 transition-transform"
            >
              <ShoppingBag className="w-5 h-5" /> Explore Local Store <ArrowRight className="w-4 h-4" />
            </Link>

            <Link 
              to="/services" 
              className="btn btn-accent min-h-[48px] px-6 rounded-2xl text-white font-bold text-sm gap-2 shadow-md hover:scale-105 transition-transform"
            >
              <Sparkles className="w-5 h-5" /> Book Senior Gurus
            </Link>

            <Link 
              to="/community" 
              className="btn btn-outline btn-neutral min-h-[48px] px-6 rounded-2xl font-bold text-sm gap-2"
            >
              <Users className="w-5 h-5" /> Post a Need
            </Link>
          </div>

          {/* Trust Guarantee Pill */}
          <div className="pt-4 border-t border-base-300/60 flex items-center gap-2 text-xs sm:text-sm text-base-content/70">
            <Heart className="w-4 h-4 text-error fill-error shrink-0" />
            <span><strong>Direct Generational Impact:</strong> 100% of proceeds go directly to senior homemakers, educators, and retirees.</span>
          </div>

        </div>
      </section>

      {/* FESTIVAL SUGGESTIONS BANNER (Date-Aware 2-Week Window) */}
      {festivalSuggestions && festivalSuggestions.suggestions && festivalSuggestions.suggestions.length > 0 && (
        <section className="card bg-gradient-to-r from-warning/15 via-base-100 to-secondary/15 border-2 border-warning/30 rounded-3xl p-6 sm:p-8 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <span className="text-3xl">{festivalSuggestions.festival_icon || currentFestivalInfo?.icon || '🪔'}</span>
              <div>
                <span className="badge badge-warning font-bold text-xs uppercase px-2.5 py-1">
                  Upcoming Festival • {festivalSuggestions.days_until >= 0 ? `In ${festivalSuggestions.days_until} Days` : 'Celebration Week'}
                </span>
                <h3 className="text-lg sm:text-xl font-extrabold text-base-content mt-1">
                  {festivalGreeting}
                </h3>
              </div>
            </div>

            <Link to="/store" className="btn btn-warning min-h-[44px] rounded-xl text-xs sm:text-sm font-bold text-base-content gap-1.5 self-start sm:self-auto shadow-xs">
              <ShoppingBag className="w-4 h-4" /> Shop {activeFestival} Specials →
            </Link>
          </div>

          {/* Suggestions Pill Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
            {festivalSuggestions.suggestions.map((sug, sidx) => (
              <div key={sidx} className="bg-base-100/90 border border-warning/30 rounded-2xl p-3.5 space-y-1 shadow-xs">
                <span className="text-xs font-bold text-warning-content flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-warning" /> Festive Recommendation #{sidx + 1}
                </span>
                <p className="text-xs text-base-content/80 font-medium leading-relaxed">{sug}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 2. REAL-TIME SOCIAL IMPACT COUNTER */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <div className="card bg-base-100 border border-base-300 p-6 rounded-3xl text-center shadow-xs space-y-1">
          <Clock className="w-6 h-6 text-primary mx-auto" />
          <span className="text-2xl sm:text-3xl font-extrabold text-base-content">4,820+</span>
          <p className="text-xs text-base-content/60 font-medium">Hours of Senior Engagement</p>
        </div>

        <div className="card bg-base-100 border border-base-300 p-6 rounded-3xl text-center shadow-xs space-y-1">
          <TrendingUp className="w-6 h-6 text-success mx-auto" />
          <span className="text-2xl sm:text-3xl font-extrabold text-success">₹18.4L+</span>
          <p className="text-xs text-base-content/60 font-medium">Transferred to Seniors</p>
        </div>

        <div className="card bg-base-100 border border-base-300 p-6 rounded-3xl text-center shadow-xs space-y-1">
          <Award className="w-6 h-6 text-secondary mx-auto" />
          <span className="text-2xl sm:text-3xl font-extrabold text-base-content">1,250+</span>
          <p className="text-xs text-base-content/60 font-medium">Artisans & Homemakers</p>
        </div>

        <div className="card bg-base-100 border border-base-300 p-6 rounded-3xl text-center shadow-xs space-y-1">
          <ShieldCheck className="w-6 h-6 text-accent mx-auto" />
          <span className="text-2xl sm:text-3xl font-extrabold text-base-content">99.4%</span>
          <p className="text-xs text-base-content/60 font-medium">Verified Trust & Safety Rating</p>
        </div>
      </section>

      {/* 3. THREE CORE PILLARS: Store, Managed Services, Community */}
      <section className="space-y-6">
        <div className="text-center max-w-xl mx-auto space-y-2">
          <span className="badge badge-primary badge-sm font-bold text-white uppercase">How SilverHands Works</span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-base-content">
            Three Ways to Connect with Wisdom & Craft
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Pillar 1: Store */}
          <div className="card bg-base-100 border border-base-300 p-6 rounded-3xl shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-4">
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-secondary/15 flex items-center justify-center text-secondary text-xl">
                🫙
              </div>
              <h3 className="font-extrabold text-lg text-base-content">Authentic Local Store</h3>
              <p className="text-xs text-base-content/70 leading-relaxed">
                Taste authentic 40-year-old family recipe sun-dried mango pickles, pure ghee Mysore Pak, and custom saree tailoring from verified seniors in {selectedCity.name}.
              </p>
            </div>
            <Link to="/store" className="btn btn-outline btn-secondary btn-sm rounded-xl text-xs font-bold gap-1">
              Browse Products <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Pillar 2: Managed Services */}
          <div className="card bg-base-100 border border-base-300 p-6 rounded-3xl shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-4">
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-accent/15 flex items-center justify-center text-accent text-xl">
                📚
              </div>
              <h3 className="font-extrabold text-lg text-base-content">Managed Service Bouquets</h3>
              <p className="text-xs text-base-content/70 leading-relaxed">
                Book 1-on-1 conversational Telugu language tuition, MSME bookkeeping advisory, or heritage cooking masterclasses with full video room & scheduling management.
              </p>
            </div>
            <Link to="/services" className="btn btn-outline btn-accent btn-sm rounded-xl text-xs font-bold gap-1">
              Book a Guru <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Pillar 3: Community */}
          <div className="card bg-base-100 border border-base-300 p-6 rounded-3xl shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-4">
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-primary/15 flex items-center justify-center text-primary text-xl">
                🤝
              </div>
              <h3 className="font-extrabold text-lg text-base-content">Regional Community Hub</h3>
              <p className="text-xs text-base-content/70 leading-relaxed">
                Post neighborhood needs, discover free senior workshops, and witness senior-to-senior skill synergy where grandmothers & retired accountants launch ventures together!
              </p>
            </div>
            <Link to="/community" className="btn btn-outline btn-primary btn-sm rounded-xl text-xs font-bold gap-1">
              Join Community <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

        </div>
      </section>

      {/* 4. STORY HIGHLIGHTS: Meet the Gurus */}
      <section className="bg-base-100 border border-base-300 rounded-3xl p-8 sm:p-10 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <span className="badge badge-secondary badge-sm font-bold text-white uppercase">Featured Artisans</span>
            <h2 className="text-2xl font-extrabold text-base-content mt-1">Stories Behind the Craft</h2>
          </div>
          <Link to="/store" className="text-xs text-primary font-bold hover:underline">
            View All Verified Seniors →
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Guru 1 */}
          <div className="bg-base-200/60 p-5 rounded-2xl space-y-3 flex flex-col justify-between">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-secondary text-white font-bold flex items-center justify-center">
                  LV
                </div>
                <div>
                  <h4 className="font-bold text-sm text-base-content">Lakshmi Venkatesh (64)</h4>
                  <p className="text-[11px] text-base-content/60">Mylapore, Chennai</p>
                </div>
              </div>
              <p className="text-xs text-base-content/75 italic">
                "For 40 years I made Thanjavur pickles for family. Now through SilverHands, hundreds of young professionals order my mango pickle and Diwali sweets every month."
              </p>
            </div>
            <span className="badge badge-sm badge-success text-white font-bold text-[10px]">
              ⭐ 4.98 Rating • 120+ Jars Delivered
            </span>
          </div>

          {/* Guru 2 */}
          <div className="bg-base-200/60 p-5 rounded-2xl space-y-3 flex flex-col justify-between">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary text-white font-bold flex items-center justify-center">
                  RK
                </div>
                <div>
                  <h4 className="font-bold text-sm text-base-content">Ramesh Krishnan (68)</h4>
                  <p className="text-[11px] text-base-content/60">Adyar, Chennai</p>
                </div>
              </div>
              <p className="text-xs text-base-content/75 italic">
                "After retiring as a chief accountant, I wanted to stay active. Teaching Telugu tuition online and mentoring young MSME founders gives my days immense purpose."
              </p>
            </div>
            <span className="badge badge-sm badge-accent text-white font-bold text-[10px]">
              ⭐ 4.95 Rating • 38 Sessions Taught
            </span>
          </div>

          {/* Guru 3 */}
          <div className="bg-base-200/60 p-5 rounded-2xl space-y-3 flex flex-col justify-between">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-warning text-white font-bold flex items-center justify-center">
                  MS
                </div>
                <div>
                  <h4 className="font-bold text-sm text-base-content">Meena Sundaram (62)</h4>
                  <p className="text-[11px] text-base-content/60">Anna Nagar, Chennai</p>
                </div>
              </div>
              <p className="text-xs text-base-content/75 italic">
                "Hand embroidery and tailoring has been my lifelong passion. Creating silk potli bags and fitting festive blouses for brides across Chennai keeps my craftsmanship alive."
              </p>
            </div>
            <span className="badge badge-sm badge-neutral font-bold text-[10px]">
              ⭐ 4.90 Rating • 28 Blouses Tailored
            </span>
          </div>

        </div>
      </section>

      {/* 5. 1-CLICK FESTIVAL GIFTING CARD */}
      <section className="bg-gradient-to-r from-secondary/15 via-base-100 to-primary/15 border-2 border-secondary/30 rounded-3xl p-8 sm:p-10 shadow-xs flex flex-col md:flex-row items-center justify-between gap-8">
        
        <div className="space-y-3 max-w-lg">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🎁</span>
            <span className="badge badge-secondary badge-sm font-bold text-white uppercase">Instant Cultural Gifting</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-base-content leading-tight">
            Send a {activeFestival} Gift Hamper from Local Seniors
          </h2>
          <p className="text-xs sm:text-sm text-base-content/75 leading-relaxed">
            Personalize an authentic festive package with pure ghee sweets, sun-dried condiments, and hand-stitched silk pouches delivered directly to your loved ones.
          </p>
        </div>

        {/* Gift Form */}
        <form onSubmit={handleSendGiftCard} className="card bg-base-100 border border-base-300 p-5 rounded-2xl shadow-sm w-full md:max-w-xs space-y-3 text-xs">
          <h4 className="font-bold text-base-content">1-Click Festive Gifting</h4>
          
          <div className="form-control">
            <label className="label text-[10px] font-semibold">Recipient Name / Phone</label>
            <input 
              type="text" 
              required
              value={giftRecipient}
              onChange={(e) => setGiftRecipient(e.target.value)}
              placeholder="e.g. Priya Sharma"
              className="input input-bordered input-sm w-full rounded-xl text-xs"
            />
          </div>

          <div className="form-control">
            <label className="label text-[10px] font-semibold">Festive Message</label>
            <input 
              type="text" 
              value={giftMessage}
              onChange={(e) => setGiftMessage(e.target.value)}
              placeholder="e.g. Happy Diwali with authentic blessings!"
              className="input input-bordered input-sm w-full rounded-xl text-xs"
            />
          </div>

          <button 
            type="submit"
            className="btn btn-secondary btn-sm w-full rounded-xl text-white font-bold gap-1 shadow-sm"
          >
            {giftSuccess ? <span className="flex items-center gap-1"><CheckCircle2 className="w-4 h-4" /> Customized! Opening Store...</span> : <><Gift className="w-4 h-4" /> Choose Gift Items</>}
          </button>
        </form>

      </section>

    </div>
  );
}
