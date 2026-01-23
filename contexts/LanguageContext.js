import { createContext, useContext, useState, useEffect } from 'react';

const LanguageContext = createContext();

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    // Instead of throwing, return a default context to prevent crashes
    // This can happen during SSR or if the provider is not mounted yet
    console.warn('useLanguage called outside LanguageProvider, using default values');
    return {
      language: typeof window !== 'undefined' 
        ? (localStorage.getItem('language') || 'en')
        : 'en',
      changeLanguage: () => {},
      t: (key) => key,
      translations: {}
    };
  }
  return context;
};

export const LanguageProvider = ({ children }) => {
  // Default English translations for SSR fallback
  const defaultTranslations = {
    header: {
      home: "Home",
      about: "About",
      services: "Services",
      products: "Products",
      eMagazine: "E-Magazine",
      events: "Events",
      contact: "Contact",
      categories: "Categories",
      signIn: "Sign In",
      profile: "Profile",
      searchPlaceholder: "Search blogs & articles..."
    },
    navigation: {
      technology: "Technology",
      politics: "Politics",
      retail: "Retail",
      sportstech: "SportsTech",
      sustainability: "Sustainability",
      telecom: "Telecom",
      automobile: "Automobile",
      fmcg: "FMCG",
      finance: "Finance",
      science: "Science",
      magazine: "Magazine",
      loadingCategories: "Loading categories..."
    },
    home: {
      trendingNews: "Trending News",
      popularPosts: "Popular Posts",
      editorChoice: "Editor Choice",
      featured: "Featured",
      recentVideoPost: "Recent Video Post",
      moreVideoPost: "More Video Post",
      moreFeaturedPost: "More Featured Post",
      storiesPost: "Stories Post",
      popularStories: "Popular Stories",
      stories: "Stories",
      eMagazineLibrary: "E-Magazine Library",
      noPostsAvailable: "No posts available",
      checkBackLater: "Please check back later for new content.",
      by: "By",
      readMore: "Read More",
      views: "Views",
      shares: "Shares"
    },
    blog: {
      shareNow: "Share Now",
      relatedArticles: "Related Articles",
      tags: "Tags",
      category: "Category",
      author: "Author",
      publishedOn: "Published on"
    },
    sidebar: {
      trendingCategory: "Trending Category",
      featuredPost: "Featured Post",
      instagramFeeds: "Instagram Feeds",
      followMe: "Follow Me",
      journalist: "JOURNALIST"
    },
    footer: {
      about: "About",
      services: "Services",
      products: "Products",
      eMagazine: "E-Magazine",
      events: "Events",
      contact: "Contact",
      signIn: "Sign In",
      profile: "Profile",
      requestArticle: "Request Article",
      privacyPolicy: "Privacy Policy",
      termsCondition: "Terms & Condition",
      cancellationRefund: "Cancellation & Refund",
      allRightsReserved: "All rights reserved.",
      contactUs: "Contact Us",
      advertise: "Advertise",
      store: "Store",
      subscribe: "Subscribe",
      emailPlaceholder: "Email address",
      viewAllPosts: "View All Posts",
      latestNews: "Latest News",
      trending: "Trending",
      featured: "Featured"
    },
    newsletter: {
      title: "Subscribe to our Newsletter",
      subTitle: "NEWSLETTER",
      emailPlaceholder: "Email address",
      agreeText: "I agree that my submitted data is being collected and stored.",
      subscribe: "Subscribe",
      subscribing: "Subscribing..."
    },
    common: {
      loading: "Loading...",
      error: "Something went wrong",
      tryAgain: "Try again",
      backToHome: "Back to Home",
      result: "result",
      results: "s",
      found: "found",
      noArticlesFound: "No articles found"
    }
  };

  // Initialize with default translations for SSR - English is primary
  const [language, setLanguage] = useState('en');
  const [translations, setTranslations] = useState(defaultTranslations);

  const loadTranslations = async (lang) => {
    // Only load translations on client side
    if (typeof window === 'undefined') {
      return;
    }
    
    try {
      const response = await fetch(`/locales/${lang}/common.json`);
      if (response.ok) {
        const data = await response.json();
        setTranslations(data);
      } else {
        // Fallback to English if translation file not found
        if (lang !== 'en') {
          loadTranslations('en');
        } else {
          // If English also fails, use default translations
          setTranslations(defaultTranslations);
        }
      }
    } catch (error) {
      console.error('Error loading translations:', error);
      // Fallback to English or default translations
      if (lang !== 'en') {
        loadTranslations('en');
      } else {
        // Use default translations if fetch fails
        setTranslations(defaultTranslations);
      }
    }
  };

  useEffect(() => {
    // Load language from localStorage - only on client side
    if (typeof window !== 'undefined') {
      try {
        // English is the primary/default language
        const savedLang = localStorage.getItem('language') || 'en';
        setLanguage(savedLang);
        loadTranslations(savedLang);
        
        // Set cookie for server-side access
        document.cookie = `language=${savedLang}; path=/; max-age=31536000; SameSite=Lax`;
        
        // Set HTML attributes
        if (document && document.documentElement) {
          document.documentElement.lang = savedLang;
          if (savedLang === 'ar') {
            document.documentElement.dir = 'rtl';
          } else {
            document.documentElement.dir = 'ltr';
          }
        }
      } catch (error) {
        console.error('Error initializing language:', error);
        // Fallback to English
        setLanguage('en');
      }
    }
  }, []);

  const changeLanguage = (lang) => {
    setLanguage(lang);
    if (typeof window !== 'undefined') {
      localStorage.setItem('language', lang);
      // Set cookie for server-side access
      document.cookie = `language=${lang}; path=/; max-age=31536000; SameSite=Lax`;
      document.documentElement.lang = lang;
      if (lang === 'ar') {
        document.documentElement.dir = 'rtl';
      } else {
        document.documentElement.dir = 'ltr';
      }
      
      // Dispatch custom event to notify components about language change
      // Components can listen to this and translate content accordingly
      window.dispatchEvent(new CustomEvent('languageChanged', { detail: { language: lang } }));
    }
    loadTranslations(lang);
  };

  const t = (key, defaultValue = '') => {
    const keys = key.split('.');
    // Use translations if available, otherwise fall back to default translations
    const source = Object.keys(translations).length > 0 ? translations : defaultTranslations;
    let value = source;
    
    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) {
        value = value[k];
      } else {
        return defaultValue || key;
      }
    }
    
    return typeof value === 'string' ? value : defaultValue || key;
  };

  return (
    <LanguageContext.Provider value={{ language, changeLanguage, t, translations }}>
      {children}
    </LanguageContext.Provider>
  );
};

