import React, { createContext, useContext, useEffect, useState } from 'react';

const ThemeContext = createContext();

export const useTheme = () => useContext(ThemeContext);

export const ThemeProvider = ({ children }) => {
  // Initialize with 'light-theme' to prevent hydration mismatch
  const [theme, setTheme] = useState('light-theme');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Only run on client side
    if (typeof window === 'undefined') return;
    
    setMounted(true);
    
    // Get saved theme from localStorage
    try {
      const savedTheme = localStorage.getItem('togglETHeme');
      if (savedTheme) {
        const initialTheme = JSON.parse(savedTheme);
        if (initialTheme === 'dark-theme' || initialTheme === 'light-theme') {
          setTheme(initialTheme);
          // Apply theme immediately to prevent flash
          document.body.classList.remove('light-theme', 'dark-theme');
          document.body.classList.add(initialTheme);
          if (initialTheme === 'dark-theme') {
            document.documentElement.classList.add('dark-theme');
          } else {
            document.documentElement.classList.remove('dark-theme');
          }
        }
      } else {
        // Check system preference if no saved theme
        if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
          setTheme('dark-theme');
          document.body.classList.add('dark-theme');
          document.documentElement.classList.add('dark-theme');
        }
      }
    } catch (e) {
      console.error('Error parsing theme from localStorage', e);
    }
  }, []);

  useEffect(() => {
    // Only update DOM after component is mounted
    if (!mounted || typeof window === 'undefined') return;
    
    try {
      localStorage.setItem('togglETHeme', JSON.stringify(theme));
      document.body.classList.remove('light-theme', 'dark-theme');
      document.body.classList.add(theme);
      
      if (theme === 'dark-theme') {
        document.documentElement.classList.add('dark-theme');
      } else {
        document.documentElement.classList.remove('dark-theme');
      }
    } catch (e) {
      console.error('Error saving theme to localStorage', e);
    }
  }, [theme, mounted]);

  const toggleTheme = () => {
    setTheme((prevTheme) => (prevTheme === 'light-theme' ? 'dark-theme' : 'light-theme'));
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, mounted }}>
      {children}
    </ThemeContext.Provider>
  );
};

