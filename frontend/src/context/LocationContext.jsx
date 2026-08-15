import React, { createContext, useContext, useState, useEffect } from 'react';

export const CITIES = [
  { id: 'chennai', name: 'Chennai', state: 'Tamil Nadu', tier: 'T1', localities: ['Adyar', 'Mylapore', 'Anna Nagar', 'T. Nagar', 'Velachery'] },
  { id: 'bangalore', name: 'Bengaluru', state: 'Karnataka', tier: 'T1', localities: ['Indiranagar', 'Koramangala', 'Jayanagar', 'Whitefield', 'Malleshwaram'] },
  { id: 'mumbai', name: 'Mumbai', state: 'Maharashtra', tier: 'T1', localities: ['Bandra', 'Dadar', 'Andheri', 'Thane', 'Borivali'] },
  { id: 'delhi', name: 'Delhi NCR', state: 'Delhi', tier: 'T1', localities: ['South Extension', 'Dwarka', 'Noida', 'Gurugram', 'Lajpat Nagar'] },
  { id: 'hyderabad', name: 'Hyderabad', state: 'Telangana', tier: 'T1', localities: ['Banjara Hills', 'Jubilee Hills', 'Gachibowli', 'Secunderabad', 'Madhapur'] },
  { id: 'coimbatore', name: 'Coimbatore', state: 'Tamil Nadu', tier: 'T2', localities: ['RS Puram', 'Gandhipuram', 'Peelamedu', 'Saibaba Colony'] },
  { id: 'pune', name: 'Pune', state: 'Maharashtra', tier: 'T1', localities: ['Kothrud', 'Viman Nagar', 'Aundh', 'Baner', 'Kalyani Nagar'] },
  { id: 'jaipur', name: 'Jaipur', state: 'Rajasthan', tier: 'T2', localities: ['C-Scheme', 'Malviya Nagar', 'Vaishali Nagar', 'Mansarovar'] },
  { id: 'madurai', name: 'Madurai', state: 'Tamil Nadu', tier: 'T2', localities: ['KK Nagar', 'Anna Nagar', 'Tallakulam', 'Simmakkal'] },
  { id: 'mysuru', name: 'Mysuru', state: 'Karnataka', tier: 'T2', localities: ['Gokulam', 'Jayalakshmipuram', 'Kuvempunagar', 'Saraswathipuram'] },
  { id: 'vijayawada', name: 'Vijayawada', state: 'Andhra Pradesh', tier: 'T2', localities: ['Benz Circle', 'Governorpet', 'Moghalrajpuram'] },
  { id: 'salem', name: 'Salem', state: 'Tamil Nadu', tier: 'T3', localities: ['Fairlands', 'Alagapuram', 'Hasthampatti'] },
  { id: 'trichy', name: 'Tiruchirappalli', state: 'Tamil Nadu', tier: 'T3', localities: ['Thillai Nagar', 'KK Nagar', 'Srirangam'] },
  { id: 'warangal', name: 'Warangal', state: 'Telangana', tier: 'T3', localities: ['Hanamkonda', 'Kazipet', 'Subedari'] }
];

const LocationContext = createContext(null);

export const LocationProvider = ({ children }) => {
  const [selectedCity, setSelectedCityState] = useState(() => {
    try {
      const saved = localStorage.getItem('silverhands_city');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && typeof parsed === 'object' && parsed.name) {
          if (!Array.isArray(parsed.localities)) parsed.localities = [];
          return parsed;
        } else if (typeof parsed === 'string') {
          const match = CITIES.find(c => c.name.toLowerCase() === parsed.toLowerCase());
          return match || { id: 'custom', name: parsed, state: 'India', tier: 'T2', localities: [] };
        }
      }
    } catch (e) {}
    return CITIES[0]; // Default Chennai
  });

  const [selectedLocality, setSelectedLocality] = useState(() => {
    return localStorage.getItem('silverhands_locality') || 'All Areas';
  });

  const [activeFestival, setActiveFestival] = useState(() => {
    return localStorage.getItem('silverhands_festival') || 'Diwali';
  });

  useEffect(() => {
    localStorage.setItem('silverhands_city', JSON.stringify(selectedCity));
  }, [selectedCity]);

  useEffect(() => {
    localStorage.setItem('silverhands_locality', selectedLocality);
  }, [selectedLocality]);

  useEffect(() => {
    localStorage.setItem('silverhands_festival', activeFestival);
  }, [activeFestival]);

  const setSelectedCity = (cityInput) => {
    if (!cityInput) return;
    if (typeof cityInput === 'string') {
      const matched = CITIES.find(c => c.name.toLowerCase() === cityInput.toLowerCase());
      if (matched) {
        setSelectedCityState(matched);
      } else {
        setSelectedCityState({
          id: cityInput.toLowerCase().replace(/\s+/g, '-'),
          name: cityInput,
          state: 'India',
          tier: 'Custom',
          localities: []
        });
      }
    } else if (typeof cityInput === 'object' && cityInput.name) {
      const safeCity = {
        ...cityInput,
        localities: Array.isArray(cityInput.localities) ? cityInput.localities : []
      };
      setSelectedCityState(safeCity);
    }
    setSelectedLocality('All Areas');
  };

  const setCustomLocality = (customLoc) => {
    if (!customLoc) return;
    setSelectedLocality(customLoc);
    setSelectedCityState(prev => {
      const currentLocs = Array.isArray(prev?.localities) ? prev.localities : [];
      if (!currentLocs.includes(customLoc)) {
        return { ...prev, localities: [customLoc, ...currentLocs] };
      }
      return prev;
    });
  };

  return (
    <LocationContext.Provider value={{
      cities: CITIES,
      indianCities: CITIES,
      selectedCity: selectedCity || CITIES[0],
      setSelectedCity,
      selectedLocality,
      setSelectedLocality,
      setCustomLocality,
      activeFestival,
      setActiveFestival
    }}>
      {children}
    </LocationContext.Provider>
  );
};

export const useLocation = () => {
  const context = useContext(LocationContext);
  if (!context) {
    throw new Error('useLocation must be used within a LocationProvider');
  }
  return context;
};
