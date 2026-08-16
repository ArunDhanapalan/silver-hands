import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, ShoppingBag, Sparkles, Users, Briefcase, User, TrendingUp, BookOpen } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function MobileNav() {
  const { user, isAuthenticated } = useAuth();
  const location = useLocation();

  return (
    <nav 
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-base-100/98 backdrop-blur border-t border-base-300 px-2 py-1 shadow-lg"
      aria-label="Mobile Bottom Navigation"
    >
      <div className="flex items-center justify-around">
        
        {user?.role === 'senior' ? (
          <>
            <Link 
              to="/senior" 
              className={`relative flex flex-col items-center justify-center min-w-[50px] min-h-[48px] py-1 text-[10px] font-bold rounded-xl ${
                location.pathname === '/senior' || location.pathname === '/opportunities' ? 'text-primary font-black' : 'text-base-content/70'
              }`}
              aria-label="Opportunities"
            >
              <Briefcase className="w-5 h-5 mb-0.5 text-warning" />
              <span>Gigs</span>
              <span className="absolute top-1 right-2 w-2 h-2 bg-error rounded-full ring-2 ring-base-100 animate-pulse"></span>
            </Link>

            <Link 
              to="/senior/storefront" 
              className={`relative flex flex-col items-center justify-center min-w-[50px] min-h-[48px] py-1 text-[10px] font-bold rounded-xl ${
                location.pathname.startsWith('/senior/storefront') || location.pathname.startsWith('/storefront') ? 'text-secondary font-black' : 'text-base-content/70'
              }`}
              aria-label="My Storefront"
            >
              <ShoppingBag className="w-5 h-5 mb-0.5 text-secondary" />
              <span>Store</span>
              <span className="absolute top-1 right-2 w-2 h-2 bg-error rounded-full ring-2 ring-base-100"></span>
            </Link>

            <Link 
              to="/senior/services" 
              className={`relative flex flex-col items-center justify-center min-w-[50px] min-h-[48px] py-1 text-[10px] font-bold rounded-xl ${
                location.pathname.startsWith('/senior/services') ? 'text-accent font-black' : 'text-base-content/70'
              }`}
              aria-label="Service Hub"
            >
              <BookOpen className="w-5 h-5 mb-0.5 text-accent" />
              <span>Classes</span>
              <span className="absolute top-1 right-2 w-2 h-2 bg-error rounded-full ring-2 ring-base-100"></span>
            </Link>

            <Link 
              to="/senior/earnings" 
              className={`flex flex-col items-center justify-center min-w-[50px] min-h-[48px] py-1 text-[10px] font-bold rounded-xl ${
                location.pathname.startsWith('/senior/earnings') ? 'text-success font-black' : 'text-base-content/70'
              }`}
              aria-label="Earnings"
            >
              <TrendingUp className="w-5 h-5 mb-0.5 text-success" />
              <span>Earnings</span>
            </Link>

            <Link 
              to="/community" 
              className={`relative flex flex-col items-center justify-center min-w-[50px] min-h-[48px] py-1 text-[10px] font-bold rounded-xl ${
                location.pathname.startsWith('/community') ? 'text-primary font-black' : 'text-base-content/70'
              }`}
              aria-label="Community"
            >
              <Users className="w-5 h-5 mb-0.5 text-primary" />
              <span>Community</span>
              <span className="absolute top-1 right-2 w-2 h-2 bg-error rounded-full ring-2 ring-base-100"></span>
            </Link>
          </>
        ) : user?.role === 'company' ? (
          <>
            <Link 
              to="/company" 
              className={`flex flex-col items-center justify-center min-w-[56px] min-h-[48px] py-1 text-[11px] font-bold rounded-xl ${
                location.pathname.startsWith('/company') ? 'text-primary font-bold' : 'text-base-content/70'
              }`}
              aria-label="Company Hub"
            >
              <Briefcase className="w-5 h-5 mb-0.5 text-primary" />
              <span>Postings</span>
            </Link>
            
            <Link 
              to="/community" 
              className={`relative flex flex-col items-center justify-center min-w-[56px] min-h-[48px] py-1 text-[11px] font-medium rounded-xl ${
                location.pathname.startsWith('/community') ? 'text-primary font-bold' : 'text-base-content/70'
              }`}
              aria-label="Community"
            >
              <Users className="w-5 h-5 mb-0.5 text-secondary" />
              <span>Community</span>
              <span className="absolute top-1 right-3 w-2 h-2 bg-error rounded-full ring-2 ring-base-100"></span>
            </Link>
          </>
        ) : (
          <>
            <Link 
              to="/" 
              className={`flex flex-col items-center justify-center min-w-[56px] min-h-[48px] py-1 text-[11px] font-medium rounded-xl ${
                location.pathname === '/' ? 'text-primary font-bold' : 'text-base-content/70'
              }`}
              aria-label="Home"
            >
              <Home className="w-5 h-5 mb-0.5" />
              <span>Home</span>
            </Link>

            <Link 
              to="/store" 
              className={`relative flex flex-col items-center justify-center min-w-[56px] min-h-[48px] py-1 text-[11px] font-medium rounded-xl ${
                location.pathname.startsWith('/store') ? 'text-primary font-bold' : 'text-base-content/70'
              }`}
              aria-label="Store"
            >
              <ShoppingBag className="w-5 h-5 mb-0.5 text-secondary" />
              <span>Store</span>
              <span className="absolute top-1 right-3 w-2 h-2 bg-error rounded-full ring-2 ring-base-100"></span>
            </Link>

            <Link 
              to="/services" 
              className={`relative flex flex-col items-center justify-center min-w-[56px] min-h-[48px] py-1 text-[11px] font-medium rounded-xl ${
                location.pathname.startsWith('/services') ? 'text-primary font-bold' : 'text-base-content/70'
              }`}
              aria-label="Services"
            >
              <Sparkles className="w-5 h-5 mb-0.5 text-accent" />
              <span>Classes</span>
              <span className="absolute top-1 right-3 w-2 h-2 bg-error rounded-full ring-2 ring-base-100"></span>
            </Link>

            <Link 
              to="/community" 
              className={`relative flex flex-col items-center justify-center min-w-[56px] min-h-[48px] py-1 text-[11px] font-medium rounded-xl ${
                location.pathname.startsWith('/community') ? 'text-primary font-bold' : 'text-base-content/70'
              }`}
              aria-label="Community"
            >
              <Users className="w-5 h-5 mb-0.5 text-primary" />
              <span>Community</span>
              <span className="absolute top-1 right-3 w-2 h-2 bg-error rounded-full ring-2 ring-base-100"></span>
            </Link>

            <Link 
              to={isAuthenticated ? "/cart" : "/login"} 
              className={`flex flex-col items-center justify-center min-w-[56px] min-h-[48px] py-1 text-[11px] font-medium rounded-xl ${
                location.pathname === '/login' || location.pathname === '/cart' ? 'text-primary font-bold' : 'text-base-content/70'
              }`}
              aria-label="Account"
            >
              <User className="w-5 h-5 mb-0.5" />
              <span>{isAuthenticated ? 'Cart' : 'Sign In'}</span>
            </Link>
          </>
        )}

      </div>
    </nav>
  );
}
