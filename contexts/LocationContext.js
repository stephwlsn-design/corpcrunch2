import { createContext, useContext, useState, useEffect } from 'react';

const LocationContext = createContext();

export const useLocation = () => {
  const context = useContext(LocationContext);
  if (!context) {
    throw new Error('useLocation must be used within a LocationProvider');
  }
  return context;
};

export const LocationProvider = ({ children }) => {
  const [location, setLocation] = useState('all');

  useEffect(() => {
    // Load location from localStorage - only on client side
    if (typeof window !== 'undefined') {
      try {
        const savedLocation = localStorage.getItem('location') || 'all';
        setLocation(savedLocation);
        
        // Set cookie for server-side access
        document.cookie = `location=${savedLocation}; path=/; max-age=31536000; SameSite=Lax`;
      } catch (error) {
        console.error('Error initializing location:', error);
        // Fallback to 'all'
        setLocation('all');
      }
    }
  }, []);

  const changeLocation = (loc) => {
    setLocation(loc);
    if (typeof window !== 'undefined') {
      localStorage.setItem('location', loc);
      // Set cookie for server-side access
      document.cookie = `location=${loc}; path=/; max-age=31536000; SameSite=Lax`;
    }
  };

  return (
    <LocationContext.Provider value={{ location, changeLocation }}>
      {children}
    </LocationContext.Provider>
  );
};
