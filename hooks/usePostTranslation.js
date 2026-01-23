import { useState, useEffect, useCallback } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';

// Cache for translations to avoid re-translating the same content
const translationCache = new Map();

const getCacheKey = (text, sourceLang, targetLang) => {
  return `${sourceLang}-${targetLang}-${text.substring(0, 100)}`;
};

// Safe hook to get language with fallback
const useLanguageSafe = () => {
  // Check if we're on the client side
  if (typeof window === 'undefined') {
    return { language: 'en', changeLanguage: () => {}, t: (key) => key, translations: {} };
  }
  
  try {
    return useLanguage();
  } catch (error) {
    // If LanguageProvider is not available, return default
    console.warn('LanguageProvider not available, using default language:', error);
    return { language: 'en', changeLanguage: () => {}, t: (key) => key, translations: {} };
  }
};

export const usePostTranslation = (post) => {
  const { language } = useLanguageSafe();
  const [translatedPost, setTranslatedPost] = useState(post);
  const [isTranslating, setIsTranslating] = useState(false);

  const translateText = useCallback(async (text, sourceLang, targetLang) => {
    if (!text || sourceLang === targetLang) {
      return text;
    }

    const cacheKey = getCacheKey(text, sourceLang, targetLang);
    if (translationCache.has(cacheKey)) {
      return translationCache.get(cacheKey);
    }

    try {
      const response = await fetch('/api/translate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text,
          sourceLang,
          targetLang,
        }),
      });

      if (!response.ok) {
        throw new Error('Translation failed');
      }

      const data = await response.json();
      const translated = data.translatedText || text;
      
      // Cache the translation
      translationCache.set(cacheKey, translated);
      
      return translated;
    } catch (error) {
      console.error('Translation error:', error);
      return text; // Return original text on error
    }
  }, []);

  useEffect(() => {
    const translatePost = async () => {
      if (!post) {
        setTranslatedPost(null);
        return;
      }

      const postLang = post.language || 'en';
      
      // If post is already in the selected language, no translation needed
      if (postLang === language) {
        setTranslatedPost(post);
        return;
      }

      setIsTranslating(true);

      try {
        // Translate title, excerpt, and content
        const [translatedTitle, translatedExcerpt, translatedContent] = await Promise.all([
          post.title ? translateText(post.title, postLang, language) : Promise.resolve(post.title),
          post.excerpt ? translateText(post.excerpt, postLang, language) : Promise.resolve(post.excerpt),
          post.content ? translateText(post.content, postLang, language) : Promise.resolve(post.content),
        ]);

        setTranslatedPost({
          ...post,
          title: translatedTitle,
          excerpt: translatedExcerpt,
          content: translatedContent,
          translatedLanguage: language,
          originalLanguage: postLang,
        });
      } catch (error) {
        console.error('Error translating post:', error);
        setTranslatedPost(post); // Fallback to original
      } finally {
        setIsTranslating(false);
      }
    };

    translatePost();
  }, [post, language, translateText]);

  return { translatedPost, isTranslating };
};

// Hook for translating multiple posts
export const usePostsTranslation = (posts) => {
  const { language } = useLanguageSafe();
  const [translatedPosts, setTranslatedPosts] = useState(posts || []);
  const [isTranslating, setIsTranslating] = useState(false);

  useEffect(() => {
    const translatePosts = async () => {
      if (!posts || posts.length === 0) {
        setTranslatedPosts([]);
        return;
      }

      // Check if all posts are already in the selected language
      const allInLanguage = posts.every(p => (p.language || 'en') === language);
      
      if (allInLanguage) {
        setTranslatedPosts(posts);
        return;
      }

      setIsTranslating(true);

      try {
        const translated = await Promise.all(
          posts.map(async (post) => {
            const postLang = post.language || 'en';
            
            if (postLang === language) {
              return post;
            }

            // Translate only if needed
            const translateText = async (text, sourceLang, targetLang) => {
              if (!text || sourceLang === targetLang) {
                return text;
              }

              const cacheKey = getCacheKey(text, sourceLang, targetLang);
              if (translationCache.has(cacheKey)) {
                return translationCache.get(cacheKey);
              }

              try {
                const response = await fetch('/api/translate', {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                  },
                  body: JSON.stringify({
                    text,
                    sourceLang,
                    targetLang,
                  }),
                });

                if (!response.ok) {
                  return text;
                }

                const data = await response.json();
                const translated = data.translatedText || text;
                translationCache.set(cacheKey, translated);
                return translated;
              } catch (error) {
                return text;
              }
            };

            const [translatedTitle, translatedExcerpt] = await Promise.all([
              post.title ? translateText(post.title, postLang, language) : Promise.resolve(post.title),
              post.excerpt ? translateText(post.excerpt, postLang, language) : Promise.resolve(post.excerpt),
            ]);

            return {
              ...post,
              title: translatedTitle,
              excerpt: translatedExcerpt,
              translatedLanguage: language,
              originalLanguage: postLang,
            };
          })
        );

        setTranslatedPosts(translated);
      } catch (error) {
        console.error('Error translating posts:', error);
        setTranslatedPosts(posts);
      } finally {
        setIsTranslating(false);
      }
    };

    translatePosts();
  }, [posts, language]);

  return { translatedPosts, isTranslating };
};

