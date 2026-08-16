import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, ShoppingBag, Sparkles, Users, Briefcase, User, TrendingUp, BookOpen, MessageSquare, Bell } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useBadges } from '../../context/BadgeContext';
import { useChat } from '../../context/ChatContext';

export default function MobileNav() {
  const { user, isAuthenticated } = useAuth();
  const location = useLocation();
  const { getCount, markSeen } = useBadges();
  const { totalUnreadCount, openChatDrawer } = useChat();

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
              onClick={() => markSeen('opportunities')}
              className={`relative flex flex-col items-center justify-center min-w-[50px] min-h-[48px] py-1 text-[10px] font-bold rounded-xl ${
                location.pathname === '/senior' || location.pathname === '/opportunities' ? 'text-primary font-black' : 'text-base-content/70'
              }`}
              aria-label="Opportunities"
            >
              <Briefcase className="w-5 h-5 mb-0.5 text-warning" />
              <span>Gigs</span>
              {getCount('opportunities') > 0 && (
                <span className="absolute top-1 right-1.5 min-w-[18px] h-[18px] px-1 bg-error text-white font-black text-[10px] rounded-full flex items-center justify-center shadow-xs">
                  {getCount('opportunities')}
                </span>
              )}
            </Link>

            <Link 
              to="/senior/storefront" 
              onClick={() => markSeen('storefront')}
              className={`relative flex flex-col items-center justify-center min-w-[50px] min-h-[48px] py-1 text-[10px] font-bold rounded-xl ${
                location.pathname.startsWith('/senior/storefront') || location.pathname.startsWith('/storefront') ? 'text-secondary font-black' : 'text-base-content/70'
              }`}
              aria-label="My Storefront"
            >
              <ShoppingBag className="w-5 h-5 mb-0.5 text-secondary" />
              <span>Store</span>
              {getCount('storefront') > 0 && (
                <span className="absolute top-1 right-1.5 min-w-[18px] h-[18px] px-1 bg-error text-white font-black text-[10px] rounded-full flex items-center justify-center shadow-xs">
                  {getCount('storefront')}
                </span>
              )}
            </Link>

            <Link 
              to="/senior/services" 
              onClick={() => markSeen('services')}
              className={`relative flex flex-col items-center justify-center min-w-[50px] min-h-[48px] py-1 text-[10px] font-bold rounded-xl ${
                location.pathname.startsWith('/senior/services') ? 'text-accent font-black' : 'text-base-content/70'
              }`}
              aria-label="Service Hub"
            >
              <BookOpen className="w-5 h-5 mb-0.5 text-accent" />
              <span>Classes</span>
              {getCount('services') > 0 && (
                <span className="absolute top-1 right-1.5 min-w-[18px] h-[18px] px-1 bg-error text-white font-black text-[10px] rounded-full flex items-center justify-center shadow-xs">
                  {getCount('services')}
                </span>
              )}
            </Link>

            <button 
              type="button"
              onClick={openChatDrawer}
              className="relative flex flex-col items-center justify-center min-w-[50px] min-h-[48px] py-1 text-[10px] font-bold rounded-xl text-base-content/70"
              aria-label="Direct Chats"
            >
              <MessageSquare className="w-5 h-5 mb-0.5 text-primary" />
              <span>Chats</span>
              {totalUnreadCount > 0 && (
                <span className="absolute top-0.5 right-1.5 p-1 bg-error text-white font-black rounded-full flex items-center justify-center shadow-xs animate-bounce">
                  <Bell className="w-3 h-3 fill-current" />
                </span>
              )}
            </button>

            <Link 
              to="/community" 
              className={`flex flex-col items-center justify-center min-w-[50px] min-h-[48px] py-1 text-[10px] font-bold rounded-xl ${
                location.pathname.startsWith('/community') ? 'text-primary font-black' : 'text-base-content/70'
              }`}
              aria-label="Community"
            >
              <Users className="w-5 h-5 mb-0.5 text-primary" />
              <span>Feed</span>
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
            
            <button 
              type="button"
              onClick={openChatDrawer}
              className="relative flex flex-col items-center justify-center min-w-[56px] min-h-[48px] py-1 text-[11px] font-bold rounded-xl text-base-content/70"
              aria-label="Direct Chats"
            >
              <MessageSquare className="w-5 h-5 mb-0.5 text-primary" />
              <span>Chats</span>
              {totalUnreadCount > 0 && (
                <span className="absolute top-0.5 right-2 p-1 bg-error text-white font-black rounded-full flex items-center justify-center shadow-xs animate-bounce">
                  <Bell className="w-3 h-3 fill-current" />
                </span>
              )}
            </button>

            <Link 
              to="/community" 
              className={`flex flex-col items-center justify-center min-w-[56px] min-h-[48px] py-1 text-[11px] font-medium rounded-xl ${
                location.pathname.startsWith('/community') ? 'text-primary font-bold' : 'text-base-content/70'
              }`}
              aria-label="Community"
            >
              <Users className="w-5 h-5 mb-0.5 text-secondary" />
              <span>Feed</span>
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
              className={`flex flex-col items-center justify-center min-w-[56px] min-h-[48px] py-1 text-[11px] font-medium rounded-xl ${
                location.pathname.startsWith('/store') ? 'text-primary font-bold' : 'text-base-content/70'
              }`}
              aria-label="Store"
            >
              <ShoppingBag className="w-5 h-5 mb-0.5 text-secondary" />
              <span>Store</span>
            </Link>

            <Link 
              to="/services" 
              className={`flex flex-col items-center justify-center min-w-[56px] min-h-[48px] py-1 text-[11px] font-medium rounded-xl ${
                location.pathname.startsWith('/services') ? 'text-primary font-bold' : 'text-base-content/70'
              }`}
              aria-label="Services"
            >
              <Sparkles className="w-5 h-5 mb-0.5 text-accent" />
              <span>Classes</span>
            </Link>

            {isAuthenticated ? (
              <button 
                type="button"
                onClick={openChatDrawer}
                className="relative flex flex-col items-center justify-center min-w-[56px] min-h-[48px] py-1 text-[11px] font-medium rounded-xl text-base-content/70"
                aria-label="Direct Chats"
              >
                <MessageSquare className="w-5 h-5 mb-0.5 text-primary" />
                <span>Chats</span>
                {totalUnreadCount > 0 && (
                  <span className="absolute top-0.5 right-2 p-1 bg-error text-white font-black rounded-full flex items-center justify-center shadow-xs animate-bounce">
                    <Bell className="w-3 h-3 fill-current" />
                  </span>
                )}
              </button>
            ) : (
              <Link 
                to="/community" 
                className={`flex flex-col items-center justify-center min-w-[56px] min-h-[48px] py-1 text-[11px] font-medium rounded-xl ${
                  location.pathname.startsWith('/community') ? 'text-primary font-bold' : 'text-base-content/70'
                }`}
                aria-label="Community"
              >
                <Users className="w-5 h-5 mb-0.5 text-primary" />
                <span>Community</span>
              </Link>
            )}

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
