import DownloadCard from "@/components/card/DownloadCard";
import Layout from "@/components/layout/Layout";
import AuthAndSubscriptionProtected from "@/components/providers/AuthAndSubscriptionProtected";
import TrendingSlider from "@/components/slider/TrendingSlider";
import FeaturedPosts from "@/components/elements/FeaturedPosts";
import PopularStories from "@/components/elements/PopularStories";
import Newsletter from "@/components/elements/Newsletter";
import RecentVideoPosts from "@/components/elements/RecentVideoPosts";
import useGlobalState from "@/hooks/useGlobalState";
import usePosts from "@/hooks/usePosts";
import { formatDate } from "@/util";
import axiosInstance from "@/util/axiosInstance";
import { magazines } from "@/util/magazineData";
import { notifySuccess } from "@/util/toast";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import Skeleton from "react-loading-skeleton";
import { useLanguage } from "@/contexts/LanguageContext";
import { Swiper, SwiperSlide } from "swiper/react";
import {
  FacebookIcon,
  FacebookShareButton,
  LinkedinIcon,
  LinkedinShareButton,
  TwitterIcon,
  TwitterShareButton,
} from "react-share";
import SearchBar from "@/components/elements/SearchBar";

export const getServerSideProps = async ({ req }) => {
  try {
    // Get language from cookie, default to 'en'
    const language = req?.cookies?.language || 'en';
    // Get location from cookie, default to 'all'
    const location = req?.cookies?.location || 'all';
    
    console.log('[getServerSideProps] Fetching posts with params:', { lang: language, location });
    
    let response;
    try {
      response = await axiosInstance.get(`/posts`, {
        params: { 
          lang: language,
          location: location !== 'all' ? location : undefined
        },
        timeout: 10000, // 10 second timeout
      });
      
      // axiosInstance returns response.data directly (see util/axiosInstance.js)
      // So response is already the data object
      console.log('[getServerSideProps] Raw API response (already response.data):', {
        type: typeof response,
        isArray: Array.isArray(response),
        keys: response ? Object.keys(response) : [],
        hasFrontPagePosts: response?.frontPagePosts !== undefined,
        frontPagePostsType: typeof response?.frontPagePosts,
        frontPagePostsIsArray: Array.isArray(response?.frontPagePosts),
        frontPagePostsLength: Array.isArray(response?.frontPagePosts) ? response.frontPagePosts.length : 'N/A',
        hasTrendingPosts: response?.trendingPosts !== undefined,
        trendingPostsType: typeof response?.trendingPosts,
        trendingPostsIsArray: Array.isArray(response?.trendingPosts),
        trendingPostsLength: Array.isArray(response?.trendingPosts) ? response.trendingPosts.length : 'N/A',
        success: response?.success,
        message: response?.message,
        fullResponsePreview: JSON.stringify(response).substring(0, 1000),
      });
    } catch (apiError) {
      console.error('[getServerSideProps] API call failed:', {
        message: apiError.message,
        response: apiError.response?.data,
        status: apiError.response?.status,
      });
      // Return empty posts structure to prevent blank page
      return {
        props: {
          posts: {
            frontPagePosts: [],
            trendingPosts: []
          }
        }
      };
    }
    
    // Extract posts directly from response (axiosInstance already returns response.data)
    // The API returns: { success, message, frontPagePosts: [], trendingPosts: [] }
    const frontPagePosts = Array.isArray(response?.frontPagePosts) ? response.frontPagePosts : [];
    const trendingPosts = Array.isArray(response?.trendingPosts) ? response.trendingPosts : [];
    
    console.log('[getServerSideProps] Extracted posts:', {
      frontPagePostsCount: frontPagePosts.length,
      trendingPostsCount: trendingPosts.length,
      firstPostTitle: frontPagePosts[0]?.title,
      firstPostId: frontPagePosts[0]?._id,
    });
    
    // Serialize posts to ensure they're JSON-compatible
    // This is critical for Next.js getServerSideProps
    const serializePost = (post) => {
      if (!post || typeof post !== 'object') {
        console.warn('[getServerSideProps] Invalid post:', post);
        return null;
      }
      try {
        // Create a plain object copy
        const serialized = JSON.parse(JSON.stringify(post));
        
        // Ensure critical fields are strings
        if (serialized._id) {
          serialized._id = String(serialized._id);
        }
        if (serialized.categoryId) {
          serialized.categoryId = String(serialized.categoryId);
        }
        
        // Ensure dates are ISO strings
        if (serialized.createdAt) {
          serialized.createdAt = serialized.createdAt instanceof Date 
            ? serialized.createdAt.toISOString() 
            : String(serialized.createdAt);
        }
        if (serialized.updatedAt) {
          serialized.updatedAt = serialized.updatedAt instanceof Date 
            ? serialized.updatedAt.toISOString() 
            : String(serialized.updatedAt);
        }
        
        // Handle Category if it exists
        if (serialized.Category && typeof serialized.Category === 'object') {
          serialized.Category = {
            ...serialized.Category,
            id: serialized.Category.id?.toString() || serialized.Category._id?.toString() || serialized.Category.id,
          };
        }
        
        return serialized;
      } catch (e) {
        console.error('[getServerSideProps] Error serializing post:', e.message, {
          postId: post._id,
          postTitle: post.title,
          error: e.stack,
        });
        // Return a minimal valid post object instead of null
        return {
          _id: post._id?.toString() || 'unknown',
          title: post.title || 'Untitled',
          slug: post.slug || '',
        };
      }
    };
    
    // Filter out null posts and serialize
    const serializedFrontPage = frontPagePosts
      .map(serializePost)
      .filter(post => post !== null);
    const serializedTrending = trendingPosts
      .map(serializePost)
      .filter(post => post !== null);
    
    const serializablePosts = {
      frontPagePosts: serializedFrontPage,
      trendingPosts: serializedTrending,
    };
    
    console.log('[getServerSideProps] ✓ Final serialized posts:', {
      frontPagePostsCount: serializablePosts.frontPagePosts.length,
      trendingPostsCount: serializablePosts.trendingPosts.length,
      firstPostTitle: serializablePosts.frontPagePosts[0]?.title,
      firstPostId: serializablePosts.frontPagePosts[0]?._id,
      canStringify: (() => {
        try {
          JSON.stringify(serializablePosts);
          return true;
        } catch (e) {
          console.error('[getServerSideProps] ❌ Cannot stringify posts:', e.message);
          return false;
        }
      })(),
    });
    
    // Final validation - ensure we can actually serialize this
    try {
      const testStringify = JSON.stringify(serializablePosts);
      console.log('[getServerSideProps] ✓ Posts are JSON-serializable, size:', testStringify.length, 'bytes');
    } catch (e) {
      console.error('[getServerSideProps] ❌ Posts are NOT JSON-serializable:', e.message);
      // Return empty arrays if serialization fails
      return {
        props: {
          posts: {
            frontPagePosts: [],
            trendingPosts: []
          }
        }
      };
    }
    
    return { 
      props: { posts: serializablePosts }
    };
  } catch (error) {
    console.error('[getServerSideProps] Error fetching posts:', {
      message: error.message,
      code: error.code,
      response: error.response?.data,
      status: error.response?.status,
    });
    
    if (error.response?.data) {
      // If error response has data structure, try to use it
      const errorData = error.response.data;
      if (errorData.frontPagePosts !== undefined || errorData.trendingPosts !== undefined) {
        return {
          props: { 
            posts: {
              frontPagePosts: Array.isArray(errorData.frontPagePosts) ? errorData.frontPagePosts : [],
              trendingPosts: Array.isArray(errorData.trendingPosts) ? errorData.trendingPosts : [],
            }
          }
        };
      }
    }
    
    // Return empty structure to prevent build failure - always ensure arrays
    console.warn('[getServerSideProps] ⚠ Returning empty posts due to error');
    return { 
      props: { 
        posts: { 
          frontPagePosts: [], 
          trendingPosts: [] 
        } 
      }
    };
  }
};

export default function Home({ posts }) {
  // const { fetchUserIPaddress, isLoading } = useGlobalState();
  let t;
  try {
    const languageHook = useLanguage();
    t = languageHook?.t || ((key) => key);
  } catch (error) {
    console.error('[Home] Error with useLanguage:', error);
    t = (key) => key; // Fallback translation function
  }

  // Ensure posts is always an object with expected structure
  const safePosts = posts || { frontPagePosts: [], trendingPosts: [] };

  // Client-side debugging
  useEffect(() => {
    console.log('[Home Component] Posts received:', {
      hasPosts: !!posts,
      postsType: typeof posts,
      postsKeys: posts ? Object.keys(posts) : [],
      frontPagePostsCount: safePosts?.frontPagePosts?.length || 0,
      trendingPostsCount: safePosts?.trendingPosts?.length || 0,
      isArrayFrontPage: Array.isArray(safePosts?.frontPagePosts),
      isArrayTrending: Array.isArray(safePosts?.trendingPosts),
      firstPostTitle: safePosts?.frontPagePosts?.[0]?.title,
      fullPosts: JSON.stringify(safePosts).substring(0, 500), // First 500 chars
    });
    
    // If no posts, try fetching directly from API
    if ((!safePosts?.frontPagePosts || safePosts.frontPagePosts.length === 0) && 
        (!safePosts?.trendingPosts || safePosts.trendingPosts.length === 0)) {
      console.log('[Home Component] No posts found, checking API directly...');
      fetch('/api/posts/debug')
        .then(res => res.json())
        .then(data => {
          console.log('[Home Component] Debug API response:', data);
        })
        .catch(err => {
          console.error('[Home Component] Debug API error:', err);
        });
    }
  }, [posts, safePosts]);

  // Get current URL safely for client-side only
  const [currentUrl, setCurrentUrl] = useState(
    typeof window !== "undefined" ? window.location.href : ""
  );

  useEffect(() => {
    // fetchUserIPaddress();

    if (typeof window !== "undefined") {
      setCurrentUrl(window.location.href);

      const queryParams = new URLSearchParams(window.location.search);

    const isSubscriptionRedirect =
      queryParams.get("subscription_payment_success") === "true";

    const isBlogRequestRedirect =
      queryParams.get("blog_request_success") === "true";

    if (isSubscriptionRedirect) {
      notifySuccess(
        "Contratulations!, you have successfully subscribed for the premium content."
      );
    }

    if (isBlogRequestRedirect) {
      notifySuccess(
        "Your post request is well received. We will contact you shortly, Thank you."
      );
      }
    }
  }, []);

  return (
    // <AuthAndSubscriptionProtected needSubscription={true}>
    <Layout headerStyle={1} headTitle={"CorpCrunch"}>
      <style jsx global>{`
        .home-social-ribbon {
          position: fixed;
          left: 20px;
          top: 50%;
          transform: translateY(-50%);
          z-index: 999;
        }
        .home-social-ribbon ul {
          list-style: none;
          padding: 0;
          margin: 0;
        }
        .home-social-ribbon ul li {
          margin-bottom: 14px;
        }
        .home-social-ribbon ul li:last-child {
          margin-bottom: 0;
        }
        .home-social-ribbon .social-share-btn {
          display: flex !important;
          align-items: center !important;
          justify-content: center !important;
          width: 50px !important;
          height: 50px !important;
          box-shadow: 0px 16px 32px 0px rgba(0, 0, 0, 0.06) !important;
          background: #ffffff !important;
          border-radius: 50% !important;
          color: #333 !important;
          text-decoration: none !important;
          border: none !important;
          cursor: pointer !important;
          transition: all 0.3s ease !important;
        }
        .home-social-ribbon .social-share-btn:hover {
          background: var(--tg-theme-primary) !important;
          color: #ffffff !important;
        }
        .home-social-ribbon .social-share-btn:hover svg {
          fill: #ffffff !important;
        }
        .home-social-ribbon .social-share-btn:hover svg path {
          fill: #ffffff !important;
        }
        .home-social-ribbon .social-share-btn:hover svg rect {
          fill: var(--tg-theme-primary) !important;
        }
        .home-social-ribbon .social-share-btn:hover span,
        .home-social-ribbon .social-share-btn:hover i {
          color: #ffffff !important;
        }
        .home-social-ribbon .social-share-btn svg {
          width: 50px !important;
          height: 50px !important;
        }
        .home-social-ribbon .social-share-btn svg circle {
          fill: #ffffff !important;
        }
        .home-social-ribbon .social-share-btn svg path {
          fill: #000000 !important;
        }
        .home-social-ribbon .social-share-btn:hover svg circle {
          fill: var(--tg-theme-primary) !important;
        }
        .home-social-ribbon .social-share-btn:hover svg path {
          fill: #ffffff !important;
        }
        .home-social-ribbon .social-share-btn i {
          font-size: 16px !important;
        }
        .home-social-ribbon .social-share-btn span {
          font-size: 20px !important;
          line-height: 1;
        }
        .featured-article-modern {
          position: relative;
        }
        .featured-image-wrapper {
          position: relative;
          overflow: hidden;
          border-radius: 12px;
        }
        .featured-image-overlay {
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          background: linear-gradient(to top, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.4) 50%, transparent 100%);
          padding: 40px 30px 30px;
          pointer-events: none;
        }
        .featured-overlay-text {
          color: #fff;
          font-size: 32px;
          font-weight: 700;
          line-height: 1.2;
          text-shadow: 0 2px 8px rgba(0,0,0,0.5);
        }
        .featured-content-modern {
          margin-top: 20px;
          padding-left: 60px !important;
          padding-right: 60px !important;
        }
        .featured-meta-row {
          display: flex;
          align-items: center;
          gap: 15px;
          margin-bottom: 15px;
          flex-wrap: wrap;
        }
        .featured-category-tag {
          background: #ff0292;
          color: #fff;
          padding: 6px 16px;
          border-radius: 4px;
          font-size: 12px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        .featured-author-date {
          color: #666;
          font-size: 13px;
          font-weight: 500;
        }
        .featured-title-full {
          font-size: 28px;
          font-weight: 700;
          line-height: 1.3;
          margin: 0;
        }
        .featured-title-full a {
          color: #111;
          text-decoration: none;
          transition: color 0.3s ease;
        }
        .featured-title-full a:hover {
          color: #ff0292;
        }
        :global(.dark-theme) .featured-title-full a {
          color: #fff;
        }
        :global(.dark-theme) .featured-author-date {
          color: #999;
        }
        /* Add padding to all category content sections */
        :global(.tgbanner__content) {
          padding-left: 60px !important;
          padding-right: 60px !important;
        }
        :global(.tgbanner__content-meta) {
          padding-left: 60px !important;
          padding-right: 60px !important;
        }
        :global(.tgbanner__post.big-post .tgbanner__content) {
          padding-left: 60px !important;
          padding-right: 60px !important;
        }
        :global(.tgbanner__side-post .tgbanner__content) {
          padding-left: 50px !important;
          padding-right: 50px !important;
        }
        :global(.tgbanner__post.small-post .tgbanner__content) {
          padding-left: 50px !important;
          padding-right: 50px !important;
        }
        /* Ensure category tags and meta have proper spacing */
        :global(.tgbanner__content-meta li.category) {
          margin-left: 0;
        }
        :global(.tgbanner__content-meta li) {
          padding-left: 0;
          padding-right: 0;
        }
        /* Add padding to category tags themselves */
        :global(.tgbanner__content-meta li.category a) {
          padding: 6px 16px;
          display: inline-block;
        }
        /* Ensure all article content has consistent padding */
        :global(.tgbanner__post .title) {
          padding-left: 60px !important;
          padding-right: 60px !important;
        }
        :global(.tgbanner__post.big-post .title) {
          padding-left: 60px !important;
          padding-right: 60px !important;
        }
        :global(.tgbanner__post.small-post .title) {
          padding-left: 50px !important;
          padding-right: 50px !important;
        }
        /* Add padding to featured posts and popular stories */
        :global(.featured__content) {
          padding-left: 30px !important;
          padding-right: 30px !important;
        }
        :global(.featured__content .tgbanner__content-meta) {
          padding-left: 0;
          padding-right: 0;
        }
        :global(.stories-post__content) {
          padding-left: 60px !important;
          padding-right: 60px !important;
        }
        :global(.stories-post__content .tgbanner__content-meta) {
          padding-left: 0;
          padding-right: 0;
        }
        :global(.trending__post-content) {
          padding-left: 30px !important;
          padding-right: 30px !important;
        }
        :global(.trending__post-content .tgbanner__content-meta) {
          padding-left: 0;
          padding-right: 0;
        }
        /* Ensure category tags have proper left padding */
        :global(.tgbanner__content-meta li.category) {
          margin-left: 0;
          padding-left: 0;
        }
        /* Add padding to article text content */
        :global(.tgbanner__post .tgbanner__content p),
        :global(.tgbanner__post .tgbanner__content .read-more),
        :global(.tgbanner__post .tgbanner__content a.read-more) {
          padding-left: 60px !important;
          padding-right: 60px !important;
        }
        /* Ensure category tag has left padding alignment */
        :global(.featured-meta-row) {
          padding-left: 0;
          padding-right: 0;
        }
        :global(.featured-category-tag) {
          margin-left: 0;
        }
        @media (max-width: 991.98px) {
          .featured-content-modern {
            padding-left: 30px !important;
            padding-right: 30px !important;
          }
          :global(.tgbanner__content) {
            padding-left: 30px !important;
            padding-right: 30px !important;
          }
          :global(.tgbanner__content-meta) {
            padding-left: 30px !important;
            padding-right: 30px !important;
          }
          :global(.tgbanner__post .title) {
            padding-left: 30px !important;
            padding-right: 30px !important;
          }
          :global(.stories-post__content) {
            padding-left: 30px !important;
            padding-right: 30px !important;
          }
          :global(.featured__content) {
            padding-left: 25px !important;
            padding-right: 25px !important;
          }
          :global(.trending__post-content) {
            padding-left: 25px !important;
            padding-right: 25px !important;
          }
        }
        @media (max-width: 767.98px) {
          .featured-content-modern {
            padding-left: 20px !important;
            padding-right: 20px !important;
          }
          :global(.tgbanner__content) {
            padding-left: 20px !important;
            padding-right: 20px !important;
          }
          :global(.tgbanner__content-meta) {
            padding-left: 20px !important;
            padding-right: 20px !important;
          }
          :global(.tgbanner__post .title) {
            padding-left: 20px !important;
            padding-right: 20px !important;
          }
          :global(.stories-post__content) {
            padding-left: 20px !important;
            padding-right: 20px !important;
          }
          :global(.featured__content) {
            padding-left: 15px !important;
            padding-right: 15px !important;
          }
          :global(.trending__post-content) {
            padding-left: 15px !important;
            padding-right: 15px !important;
          }
        }
        @media (max-width: 991.98px) {
          .home-social-ribbon {
            display: none;
          }
          .featured-overlay-text {
            font-size: 24px;
            padding: 30px 20px 20px;
          }
          .featured-title-full {
            font-size: 22px;
          }
        }
        @media (max-width: 767.98px) {
          .featured-overlay-text {
            font-size: 20px;
            padding: 20px 15px 15px;
          }
          .featured-title-full {
            font-size: 18px;
          }
          .featured-meta-row {
            flex-direction: column;
            align-items: flex-start;
            gap: 10px;
          }
        }
      `}</style>
      <div className="home-social-ribbon">
        <ul className="list-wrap" style={{ listStyle: "none", padding: 0, margin: 0 }}>
          <li>
            <FacebookShareButton 
              url={currentUrl || (typeof window !== "undefined" ? window.location.href : "")}
              className="social-share-btn"
            >
            <FacebookIcon 
              size={50} 
              bgStyle={{ fill: "#ffffff" }}
              iconFillColor="#000000"
              round={true}
            />
            </FacebookShareButton>
          </li>
          <li>
            <TwitterShareButton 
              url={currentUrl || (typeof window !== "undefined" ? window.location.href : "")}
              className="social-share-btn"
            >
            <img
              src="/assets/img/others/X logo.png"
              alt="X"
              width="50"
              height="50"
              style={{ display: "block", width: "50px", height: "50px", objectFit: "contain" }}
            />
            </TwitterShareButton>
          </li>
          <li>
            <LinkedinShareButton 
              url={currentUrl || (typeof window !== "undefined" ? window.location.href : "")}
              className="social-share-btn"
            >
            <LinkedinIcon 
              size={50} 
              bgStyle={{ fill: "#ffffff" }}
              iconFillColor="#000000"
              round={true}
            />
            </LinkedinShareButton>
          </li>
          <li>
            <a 
              href="https://www.behance.net/corpcrunch"
              target="_blank"
              rel="noopener noreferrer"
              className="social-share-btn"
            >
              <span style={{ fontSize: "20px", fontWeight: "bold", lineHeight: "1" }}>Bē</span>
            </a>
          </li>
          <li>
            <button
              onClick={async () => {
                const urlToShare = currentUrl || (typeof window !== "undefined" ? window.location.href : "");
                if (typeof window !== "undefined" && navigator.share) {
                  try {
                    await navigator.share({
                      title: document.title,
                      url: urlToShare,
                    });
                  } catch (err) {
                    // User cancelled or error occurred
                  }
                } else if (typeof window !== "undefined") {
                  // Fallback: Copy to clipboard
                  try {
                    await navigator.clipboard.writeText(urlToShare);
                    alert('Link copied to clipboard!');
                  } catch (err) {
                    // Fallback for older browsers
                    const textArea = document.createElement('textarea');
                    textArea.value = urlToShare;
                    document.body.appendChild(textArea);
                    textArea.select();
                    document.execCommand('copy');
                    document.body.removeChild(textArea);
                    alert('Link copied to clipboard!');
                  }
                }
              }}
              className="social-share-btn"
              style={{ background: 'none', border: 'none', padding: 0 }}
            >
              <i className="fas fa-share" style={{ fontSize: "16px" }} />
            </button>
          </li>
        </ul>
      </div>

      {/* Homepage Posts Section - Featured Article with Sidebar Posts */}
      <section className="tgbanner __area pt-20">
        <div className="container">
          <div className="tgbanner__grid">
            {(!safePosts?.frontPagePosts || safePosts.frontPagePosts.length === 0) && 
             (!safePosts?.trendingPosts || safePosts.trendingPosts.length === 0) ? (
              <div style={{ padding: '40px', textAlign: 'center' }}>
                <h3>{t('home.noPostsAvailable', 'No posts available')}</h3>
                <p>{t('home.checkBackLater', 'Please check back later for new content.')}</p>
                <div style={{ marginTop: '20px', fontSize: '12px', color: '#999' }}>
                  <p>Debug Info:</p>
                  <p>FrontPage Posts: {safePosts?.frontPagePosts?.length || 0}</p>
                  <p>Trending Posts: {safePosts?.trendingPosts?.length || 0}</p>
                  <p>Has Posts Object: {safePosts ? 'Yes' : 'No'}</p>
                </div>
              </div>
            ) : (
              <>
                {safePosts?.frontPagePosts?.[0] && (
                  <div className="tgbanner__post big-post featured-article-modern">
                    <div className="tgbanner__thumb tgImage__hover featured-image-wrapper">
                      <Link href={`/blog/${safePosts.frontPagePosts[0]?.slug || ''}`}>
                        <Image
                          height={600}
                          width={800}
                          src={safePosts.frontPagePosts[0]?.bannerImageUrl || '/assets/img/others/notFoundImage.jpg'}
                          alt={safePosts.frontPagePosts[0]?.title || 'Featured article'}
                          style={{ width: '100%', height: 'auto', display: 'block' }}
                          priority
                        />
                        {/* Overlay text on image */}
                        <div className="featured-image-overlay">
                          <div className="featured-overlay-text">
                            {safePosts.frontPagePosts[0]?.title?.substring(0, 60) || ''}
                            {safePosts.frontPagePosts[0]?.title?.length > 60 ? '...' : ''}
                          </div>
                        </div>
                      </Link>
                    </div>
                    <div className="tgbanner__content featured-content-modern">
                      <div className="featured-meta-row">
                        <span className="featured-category-tag">
                          {safePosts.frontPagePosts[0]?.Category?.name || 'Uncategorized'}
                        </span>
                        <span className="featured-author-date">
                          BY MIKE EVANS • {formatDate(safePosts?.frontPagePosts[0]?.createdAt)?.toUpperCase() || ''}
                        </span>
                      </div>
                      <h2 className="title tgcommon__hover featured-title-full">
                        <Link href={`/blog/${safePosts.frontPagePosts[0]?.slug || ''}`}>
                          {safePosts.frontPagePosts[0]?.title || ''}
                        </Link>
                      </h2>
                    </div>
                  </div>
                )}

                {safePosts?.frontPagePosts?.[1] && (
                  <div className="tgbanner__side-post">
                    {safePosts.frontPagePosts[1] && (
                      <div className="tgbanner__post small-post" key={`post-${safePosts.frontPagePosts[1]?._id || '1'}`}>
                        <div className="tgbanner__thumb tgImage__hover">
                          <Link href={`/blog/${safePosts.frontPagePosts[1]?.slug || ''}`}>
                            <Image
                              width={300}
                              height={200}
                              src={safePosts.frontPagePosts[1]?.bannerImageUrl || '/assets/img/others/notFoundImage.jpg'}
                              alt={safePosts.frontPagePosts[1]?.title || 'Article'}
                              style={{ width: '100%', height: 'auto', objectFit: 'cover' }}
                            />
                          </Link>
                        </div>
                        <div className="tgbanner__content">
                          <ul className="tgbanner__content-meta list-wrap">
                            <li className="category">
                              {safePosts.frontPagePosts[1]?.Category?.id ? (
                                <Link href={`/category/${safePosts.frontPagePosts[1]?.Category?.id}`}>
                                  {safePosts.frontPagePosts[1]?.Category?.name || 'Uncategorized'}
                                </Link>
                              ) : (
                                <span>{safePosts.frontPagePosts[1]?.Category?.name || 'Uncategorized'}</span>
                              )}
                            </li>
                          </ul>
                          <h2 className="title tgcommon__hover">
                            <Link href={`/blog/${safePosts.frontPagePosts[1]?.slug || ''}`}>
                              {safePosts.frontPagePosts[1]?.title || ''}
                            </Link>
                          </h2>
                        </div>
                      </div>
                    )}
                    {safePosts.frontPagePosts[2] && (
                      <div className="tgbanner__post small-post" key={`post-${safePosts.frontPagePosts[2]?._id || '2'}`}>
                        <div className="tgbanner__thumb tgImage__hover">
                          <Link href={`/blog/${safePosts.frontPagePosts[2]?.slug || ''}`}>
                            <Image
                              width={300}
                              height={200}
                              style={{
                                width: '100%',
                                height: 'auto',
                                objectFit: 'cover'
                              }}
                              src={safePosts.frontPagePosts[2]?.bannerImageUrl || '/assets/img/others/notFoundImage.jpg'}
                              alt={safePosts.frontPagePosts[2]?.title || 'Article'}
                            />
                          </Link>
                        </div>
                        <div className="tgbanner__content">
                          <ul className="tgbanner__content-meta list-wrap">
                            <li className="category">
                              {safePosts.frontPagePosts[2]?.Category?.id ? (
                                <Link href={`/category/${safePosts.frontPagePosts[2]?.Category?.id}`}>
                                  {safePosts.frontPagePosts[2]?.Category?.name || 'Uncategorized'}
                                </Link>
                              ) : (
                                <span>{safePosts.frontPagePosts[2]?.Category?.name || 'Uncategorized'}</span>
                              )}
                            </li>
                          </ul>
                          <h2 className="title tgcommon__hover">
                            <Link href={`/blog/${safePosts.frontPagePosts[2]?.slug || ''}`}>
                              {safePosts.frontPagePosts[2]?.title || ''}
                            </Link>
                          </h2>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </section>

      <section className="trending-post-area section__hover-line pt-25 pb-25">
        <div className="container">
          <div className="section__title-wrap mb-40">
            <div className="row align-items-end">
              <div className="col-sm-6">
                <div className="section__title">
                  <span className="section__sub-title">{t('home.popularPosts', 'Popular Posts')}</span>
                  <h3 className="section__main-title">{t('home.trendingNews', 'Trending News')}</h3>
                </div>
              </div>
            </div>
          </div>
          <div className="trending__slider">
            <div className="swiper-container trending-active">
              <TrendingSlider
                isLoading={false}
                showItem={4}
                data={safePosts?.trendingPosts || []}
              />
            </div>
          </div>
        </div>
      </section>
      <section className="trending-post-area section__hover-line pt-25 mb-90 pb-25">
        <div className="container">
          <div className="section__title-wrap mb-40">
            <div className="row align-items-end">
              <div className="col-sm-6">
                <div className="section__title">
                  <h3 className="section__main-title">{t('home.eMagazineLibrary', 'E-Magazine Library')}</h3>
                </div>
              </div>
            </div>
          </div>
          <div className="trending__slider">
            <div className="swiper-container trending-active">
              <div className="flex flex-wrap -mx-4">
                <Swiper
                  slidesPerView={4}
                  spaceBetween={30}
                  loop={true}
                  autoplay={{
                    delay: 2500,
                    disableOnInteraction: false,
                  }}
                  pagination={{
                    clickable: true,
                    el: ".block-gallery-pagination",
                  }}
                  breakpoints={{
                    320: {
                      slidesPerView: 1,
                      spaceBetween: 20,
                    },
                    480: {
                      slidesPerView: 2,
                      spaceBetween: 20,
                    },
                    768: {
                      slidesPerView: 3,
                      spaceBetween: 30,
                    },
                    1024: {
                      slidesPerView: 4,
                      spaceBetween: 30,
                    },
                  }}
                >
                  {magazines.map((magazine, index) => (
                    <SwiperSlide key={index}>
                      <DownloadCard
                        key={index}
                        imageUrl={magazine.imageUrl}
                        pdfUrl={magazine.pdfUrl}
                        title={magazine.title}
                      />
                    </SwiperSlide>
                  ))}
                </Swiper>
              </div>
            </div>
          </div>
        </div>
      </section>
      <FeaturedPosts posts={safePosts?.trendingPosts || []} />
      <PopularStories posts={safePosts?.trendingPosts || []} />
      <RecentVideoPosts posts={safePosts?.trendingPosts || []} />
      <Newsletter />
    </Layout>
    // </AuthAndSubscriptionProtected>
  );
}
