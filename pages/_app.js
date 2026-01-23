// Critical CSS - loaded in _document.js
// Swiper CSS - needed for components
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

// Third-party CSS
import "react-toastify/dist/ReactToastify.css";
import "react-multi-carousel/lib/styles.css";
import "react-loading-skeleton/dist/skeleton.css";

// Non-critical CSS will be loaded asynchronously in useEffect

import { useEffect } from "react";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import ErrorBoundary from "@/components/ErrorBoundary";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { LocationProvider } from "@/contexts/LocationContext";
import { ThemeProvider } from "@/contexts/ThemeContext";

// Create QueryClient with proper configuration
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes - data is fresh for 5 minutes
      cacheTime: 10 * 60 * 1000, // 10 minutes - cache for 10 minutes
      refetchOnWindowFocus: false,
      refetchOnMount: false,
      refetchOnReconnect: true,
      retry: process.env.NODE_ENV === 'production' ? 3 : 1,
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    },
  },
});

function MyApp({ Component, pageProps }) {
  useEffect(() => {
    // Load non-critical CSS asynchronously
    if (typeof window !== 'undefined') {
      const loadCSS = (href) => {
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = href;
        document.head.appendChild(link);
      };
      
      // Load non-critical CSS
      loadCSS('/assets/css/flaticon.css');
      loadCSS('/assets/css/fontawesome-all.min.css');
      loadCSS('/assets/css/animate.min.css');
      loadCSS('/assets/css/imageRevealHover.css');
      loadCSS('/assets/css/magnific-popup.css');
      loadCSS('/assets/css/category-padding-override.css');
      loadCSS('/assets/css/header-additions.css');
      loadCSS('/assets/css/form.css');
      loadCSS('/assets/css/slick.css');
      loadCSS('/assets/css/spacing.css');
      loadCSS('/assets/css/swiper-bundle.css');
      loadCSS('/assets/css/rtl.css');
    }
  }, []);

  useEffect(() => {
    // Load scroll animations script
    if (typeof window !== 'undefined') {
      const script = document.createElement('script');
      script.src = '/assets/js/scroll-animations.js';
      script.async = true;
      document.body.appendChild(script);
      
      return () => {
        if (document.body.contains(script)) {
          document.body.removeChild(script);
        }
      };
    }
  }, []);

  useEffect(() => {
    // Handle MetaMask and other wallet connection errors gracefully
    if (typeof window !== 'undefined') {
      // Handle unhandled promise rejections (like MetaMask connection errors)
      const handleUnhandledRejection = (event) => {
        // Check if it's a MetaMask connection error
        const errorMessage = event.reason?.message || event.reason?.toString() || '';
        const isMetaMaskError = 
          errorMessage.includes('MetaMask') || 
          errorMessage.includes('Failed to connect') ||
          errorMessage.includes('ethereum') ||
          event.reason?.code === 4001 || // User rejected request
          event.reason?.code === -32002; // Already processing request

        if (isMetaMaskError) {
          // Prevent the error from showing in console and stop propagation
          event.preventDefault();
          console.warn('MetaMask connection error handled:', errorMessage);
          return false;
        }
      };

      // Handle general errors
      const handleError = (event) => {
        const errorMessage = event.message || event.error?.message || '';
        const isMetaMaskError = 
          errorMessage.includes('MetaMask') || 
          errorMessage.includes('Failed to connect') ||
          errorMessage.includes('ethereum');

        if (isMetaMaskError) {
          event.preventDefault();
          console.warn('MetaMask error handled:', errorMessage);
          return false;
        }
      };

      // Add event listeners
      window.addEventListener('unhandledrejection', handleUnhandledRejection);
      window.addEventListener('error', handleError);

      // Cleanup
      return () => {
        window.removeEventListener('unhandledrejection', handleUnhandledRejection);
        window.removeEventListener('error', handleError);
      };
    }
  }, []);

  return (
    <ErrorBoundary>
      <ThemeProvider>
        <LanguageProvider>
          <LocationProvider>
            <QueryClientProvider client={queryClient}>
              <Component {...pageProps} />
            </QueryClientProvider>
          </LocationProvider>
        </LanguageProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default MyApp;
