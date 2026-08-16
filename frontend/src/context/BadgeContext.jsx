import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import api from '../api/client';

const BadgeContext = createContext({
  getCount: () => 0,
  markSeen: () => {},
  fetchBadgeCounts: () => {}
});

export function BadgeProvider({ children }) {
  const { user, isAuthenticated } = useAuth();
  
  const [opportunitiesCount, setOpportunitiesCount] = useState(0);
  const [storefrontCount, setStorefrontCount] = useState(0);
  const [servicesCount, setServicesCount] = useState(0);

  const [dismissed, setDismissed] = useState({
    opportunities: false,
    storefront: false,
    services: false
  });

  const fetchBadgeCounts = async () => {
    if (!isAuthenticated || user?.role !== 'senior') {
      setOpportunitiesCount(0);
      setStorefrontCount(0);
      setServicesCount(0);
      return;
    }

    try {
      const [oppDeck, orders, bookings] = await Promise.all([
        api.get('/opportunities/deck').catch(() => []),
        api.get('/store/orders/senior-orders').catch(() => []),
        api.get('/services/bookings/senior-sessions').catch(() => [])
      ]);

      const newGigs = Array.isArray(oppDeck) ? oppDeck.length : 0;
      const newOrders = Array.isArray(orders) ? orders.filter(o => o.status === 'pending').length : 0;
      const newBookings = Array.isArray(bookings) ? bookings.filter(b => b.status === 'requested').length : 0;

      setOpportunitiesCount(newGigs);
      setStorefrontCount(newOrders);
      setServicesCount(newBookings);
    } catch (err) {
      console.warn('Failed to load senior badge counts:', err);
    }
  };

  useEffect(() => {
    fetchBadgeCounts();
  }, [isAuthenticated, user?.role]);

  const markSeen = (section) => {
    setDismissed(prev => ({ ...prev, [section]: true }));
  };

  const getCount = (section) => {
    if (dismissed[section]) return 0;
    if (section === 'opportunities') return opportunitiesCount;
    if (section === 'storefront') return storefrontCount;
    if (section === 'services') return servicesCount;
    return 0;
  };

  return (
    <BadgeContext.Provider value={{ getCount, markSeen, fetchBadgeCounts }}>
      {children}
    </BadgeContext.Provider>
  );
}

export const useBadges = () => useContext(BadgeContext);
