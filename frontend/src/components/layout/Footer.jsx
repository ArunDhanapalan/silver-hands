import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, Heart, Sparkles, MapPin } from 'lucide-react';
import { useLocation } from '../../context/LocationContext';

export default function Footer() {
  const { selectedCity } = useLocation();

  return (
    <footer className="bg-base-100 border-t border-base-300 pt-10 pb-20 md:pb-10 text-base-content/80 text-sm mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pb-8 border-b border-base-200">
          
          {/* Col 1 */}
          <div className="space-y-3 md:col-span-1">
            <div className="flex items-center gap-2">
              <span className="text-2xl">🤝</span>
              <span className="font-extrabold text-lg bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                SilverHands
              </span>
            </div>
            <p className="text-xs text-base-content/70 leading-relaxed">
              Converting lifelong experience, practical skills, and traditional wisdom into local livelihood, bookable services, and authentic products.
            </p>
            <div className="flex items-center gap-2 text-xs text-primary font-semibold">
              <ShieldCheck className="w-4 h-4" />
              <span>Age Verified Senior Economy</span>
            </div>
          </div>

          {/* Col 2: Services Bouquet */}
          <div>
            <h4 className="font-bold text-xs uppercase tracking-wider text-base-content mb-3">Managed Services</h4>
            <ul className="space-y-2 text-xs">
              <li><Link to="/services?cat=tuition" className="hover:text-primary transition-colors">Online Language Tuition</Link></li>
              <li><Link to="/services?cat=mentoring" className="hover:text-primary transition-colors">Business & Bookkeeping Mentoring</Link></li>
              <li><Link to="/services?cat=culinary" className="hover:text-primary transition-colors">Traditional Cooking Masterclasses</Link></li>
              <li><Link to="/services?cat=crafts" className="hover:text-primary transition-colors">Tailoring & Handicraft Guidance</Link></li>
            </ul>
          </div>

          {/* Col 3: Local Commerce */}
          <div>
            <h4 className="font-bold text-xs uppercase tracking-wider text-base-content mb-3">Authentic Store</h4>
            <ul className="space-y-2 text-xs">
              <li><Link to="/store?cat=food" className="hover:text-primary transition-colors">Homemade Pickles & Podis</Link></li>
              <li><Link to="/store?cat=gifts" className="hover:text-primary transition-colors">Handmade Festival Gift Boxes</Link></li>
              <li><Link to="/store?cat=clothing" className="hover:text-primary transition-colors">Custom Tailored Apparels</Link></li>
              <li><Link to="/community" className="hover:text-primary transition-colors">Local Community Requests</Link></li>
            </ul>
          </div>

          {/* Col 4: City Coverage */}
          <div>
            <h4 className="font-bold text-xs uppercase tracking-wider text-base-content mb-3">Active Coverage</h4>
            <p className="text-xs text-base-content/70 mb-2 flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-secondary shrink-0" />
              Currently in <strong>{selectedCity.name}</strong> ({selectedCity.tier})
            </p>
            <p className="text-[11px] text-base-content/60 leading-normal">
              Supporting Tier 1, Tier 2 & Tier 3 cities across Tamil Nadu, Karnataka, Maharashtra, Telangana, Delhi NCR, and Rajasthan.
            </p>
          </div>

        </div>

        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-base-content/60 gap-3">
          <p>© 2026 SilverHands Livelihood Foundation. Empowering Experience Dignity.</p>
          <div className="flex items-center gap-4">
            <Link to="/store" className="hover:underline">Store</Link>
            <Link to="/services" className="hover:underline">Services</Link>
            <Link to="/community" className="hover:underline">Community</Link>
            <Link to="/senior/onboarding" className="hover:underline">Senior Onboarding</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
