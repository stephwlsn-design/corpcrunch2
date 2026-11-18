import { createContext, useContext, useState, useEffect } from 'react';
import { setClientPreferenceCookie } from '@/lib/cookieConsent';

const LanguageContext = createContext();

const DEFAULT_TRANSLATIONS = {
    header: {
      home: "Home",
      about: "About",
      services: "Services",
      products: "Products",
      eMagazine: "E-Magazine",
      events: "Events",
      contact: "Contact",
      intelligent: "Intelligent",
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
      intelligent: "Intelligent",
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

function lookup(source, key) {
  const keys = key.split('.');
  let value = source;
  for (const k of keys) {
    if (value && typeof value === 'object' && k in value) {
      value = value[k];
    } else {
      return undefined;
    }
  }
  return typeof value === 'string' ? value : undefined;
}

function translate(source, key, defaultValue = '') {
  return (
    lookup(source, key) ||
    lookup(DEFAULT_TRANSLATIONS, key) ||
    defaultValue ||
    key
  );
}

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    return {
      language: 'en',
      changeLanguage: () => {},
      t: (key, defaultValue = '') => translate(DEFAULT_TRANSLATIONS, key, defaultValue),
      translations: DEFAULT_TRANSLATIONS,
    };
  }
  return context;
};

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState('en');
  const [translations, setTranslations] = useState(DEFAULT_TRANSLATIONS);

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
          setTranslations(DEFAULT_TRANSLATIONS);
        }
      }
    } catch (error) {
      console.error('Error loading translations:', error);
      // Fallback to English or default translations
      if (lang !== 'en') {
        loadTranslations('en');
      } else {
        // Use default translations if fetch fails
        setTranslations(DEFAULT_TRANSLATIONS);
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
        setClientPreferenceCookie('language', savedLang);
        
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
      setClientPreferenceCookie('language', lang);
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

  const t = (key, defaultValue = '') => translate(translations, key, defaultValue);

  return (
    <LanguageContext.Provider value={{ language, changeLanguage, t, translations }}>
      {children}
    </LanguageContext.Provider>
  );
};

