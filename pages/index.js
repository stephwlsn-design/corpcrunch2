import Layout from "@/components/layout/Layout";
import FeaturedPosts from "@/components/elements/FeaturedPosts";
import PopularStories from "@/components/elements/PopularStories";
import Newsletter from "@/components/elements/Newsletter";
import RecentVideoPosts from "@/components/elements/RecentVideoPosts";
import ExploreOurWorks from "@/components/elements/ExploreOurWorks";
import EditorChoice from "@/components/elements/EditorChoice";
import ModernHero from "@/components/elements/ModernHero";
import WhyUsSection from "@/components/elements/WhyUsSection";
import SocialShareRibbon from "@/components/elements/SocialShareRibbon";
import useGlobalState from "@/hooks/useGlobalState";
import usePosts from "@/hooks/usePosts";
import { usePostsTranslation } from "@/hooks/usePostTranslation";
import { formatDate } from "@/util";
import axiosInstance from "@/util/axiosInstance";
import { notifySuccess } from "@/util/toast";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState, useMemo } from "react";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import { useLanguage } from "@/contexts/LanguageContext";
import {
  FacebookIcon,
  FacebookShareButton,
  LinkedinIcon,
  LinkedinShareButton,
  TwitterIcon,
  TwitterShareButton,
} from "react-share";
import { getPosts } from "@/lib/postService";
import { getCategories } from "@/lib/categoryService";

export const getServerSideProps = async ({ req }) => {
  try {
    const language = req?.cookies?.language || "en";
    const location = req?.cookies?.location || "all";

    console.log("[getServerSideProps] Fetching posts directly from DB:", {
      lang: language,
      location,
    });

    // Fetch posts and categories in parallel
    const [postsData, categories] = await Promise.all([
      getPosts({ lang: language, location }),
      getCategories().catch(err => {
        console.error("[getServerSideProps] Failed to fetch categories:", err.message);
        return [];
      }),
    ]);

    return {
      props: {
        posts: {
          frontPagePosts: JSON.parse(
            JSON.stringify(postsData.frontPagePosts || [])
          ),
          trendingPosts: JSON.parse(
            JSON.stringify(postsData.trendingPosts || [])
          ),
          mostViewedPosts: JSON.parse(
            JSON.stringify(postsData.mostViewedPosts || [])
          ),
          videoPosts: JSON.parse(JSON.stringify(postsData.videoPosts || [])),
        },
        categories: JSON.parse(JSON.stringify(categories || [])),
      },
    };
  } catch (error) {
    console.error("[getServerSideProps] Failed to fetch posts:", error.message);
    return {
      props: {
        posts: {
          frontPagePosts: [],
          trendingPosts: [],
          videoPosts: [],
        },
        categories: [],
      },
    };
  }
};

// Removed _unused_getServerSideProps as part of cleanup

export default function Home({ posts, categories = [] }) {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  let t;
  try {
    const languageHook = useLanguage();
    t = languageHook?.t || ((key) => key);
  } catch (error) {
    console.error("[Home] Error with useLanguage:", error);
    t = (key) => key;
  }

  const safePosts =
    posts || { frontPagePosts: [], trendingPosts: [], videoPosts: [] };

  // Translate posts based on current language
  const { translatedPosts: translatedTrendingPosts, isTranslating: isTranslatingTrending } =
    usePostsTranslation(safePosts?.trendingPosts || []);
  const { translatedPosts: translatedVideoPosts, isTranslating: isTranslatingVideos } =
    usePostsTranslation(safePosts?.videoPosts || []);
  const { translatedPosts: translatedFrontPagePosts, isTranslating: isTranslatingFrontPage } =
    usePostsTranslation(safePosts?.frontPagePosts || []);

  const [apiStatus, setApiStatus] = useState(null);

  useEffect(() => {
    console.log("[Home Component] Posts received:", {
      hasPosts: !!posts,
      postsType: typeof posts,
      postsKeys: posts ? Object.keys(posts) : [],
      frontPagePostsCount: safePosts?.frontPagePosts?.length || 0,
      trendingPostsCount: safePosts?.trendingPosts?.length || 0,
      isArrayFrontPage: Array.isArray(safePosts?.frontPagePosts),
      isArrayTrending: Array.isArray(safePosts?.trendingPosts),
      firstPostTitle: safePosts?.frontPagePosts?.[0]?.title,
      fullPosts: JSON.stringify(safePosts).substring(0, 500),
    });

    if (
      (!safePosts?.frontPagePosts || safePosts.frontPagePosts.length === 0) &&
      (!safePosts?.trendingPosts || safePosts.trendingPosts.length === 0)
    ) {
      console.log(
        "[Home Component] No posts found, checking API directly..."
      );

      Promise.all([
        fetch("/api/posts/debug")
          .then((res) => res.json())
          .catch((err) => ({ error: err.message })),
        fetch("/api/posts")
          .then((res) => res.json())
          .catch((err) => ({ error: err.message })),
      ])
        .then(([debugData, postsData]) => {
          console.log("[Home Component] Debug API response:", debugData);
          console.log("[Home Component] Posts API response:", postsData);

          setApiStatus({
            debug: debugData,
            posts: postsData,
            timestamp: new Date().toISOString(),
          });
        })
        .catch((err) => {
          console.error("[Home Component] API check error:", err);
          setApiStatus({ error: err.message });
        });
    }
  }, [posts, safePosts]);

  const [currentUrl, setCurrentUrl] = useState(
    typeof window !== "undefined" ? window.location.href : ""
  );

  useEffect(() => {
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
    <Layout headerStyle={1} headTitle={"Corp Crunch"} categories={categories}>
      <style jsx global>{`
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
          background: linear-gradient(
            to top,
            rgba(0, 0, 0, 0.8) 0%,
            rgba(0, 0, 0, 0.4) 50%,
            transparent 100%
          );
          padding: 40px 30px 30px;
          pointer-events: none;
        }
        .featured-overlay-text {
          color: #fff;
          font-size: 32px;
          font-weight: 700;
          line-height: 1.2;
          text-shadow: 0 2px 8px rgba(0, 0, 0, 0.5);
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
          background: #ff2092;
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
          color: #ff2092;
        }
        :global(.dark-theme) .featured-title-full a {
          color: #fff;
        }
        :global(.dark-theme) .featured-author-date {
          color: #999;
        }
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
        :global(.tgbanner__content-meta li.category) {
          margin-left: 0;
        }
        :global(.tgbanner__content-meta li) {
          padding-left: 0;
          padding-right: 0;
        }
        :global(.tgbanner__content-meta li.category a) {
          padding: 6px 16px;
          display: inline-block;
        }
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
        :global(.tgbanner__content-meta li.category) {
          margin-left: 0;
          padding-left: 0;
        }
        :global(.tgbanner__post .tgbanner__content p),
        :global(.tgbanner__post .tgbanner__content .read-more),
        :global(.tgbanner__post .tgbanner__content a.read-more) {
          padding-left: 60px !important;
          padding-right: 60px !important;
        }
        :global(.featured-meta-row) {
          padding-left: 0;
          padding-right: 0;
        }
        :global(.featured-category-tag) {
          margin-left: 0;
        }
        
        /* Blue Horizontal Line Separator */
        .blue-separator {
          width: 100%;
          height: 5px;
          background-color: #1a3fc4;
          margin: 60px 0;
          border: none;
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
          .blue-separator {
            margin: 40px 0;
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
          .blue-separator {
            margin: 30px 0;
          }
        }
        @media (max-width: 480px) {
          .featured-content-modern {
            padding-left: 10px !important;
            padding-right: 10px !important;
          }
          :global(.tgbanner__content) {
            padding-left: 10px !important;
            padding-right: 10px !important;
          }
          :global(.tgbanner__content-meta) {
            padding-left: 10px !important;
            padding-right: 10px !important;
          }
          :global(.tgbanner__post .title) {
            padding-left: 10px !important;
            padding-right: 10px !important;
          }
          :global(.stories-post__content) {
            padding-left: 10px !important;
            padding-right: 10px !important;
          }
          :global(.featured__content) {
            padding-left: 10px !important;
            padding-right: 10px !important;
          }
          :global(.trending__post-content) {
            padding-left: 10px !important;
            padding-right: 10px !important;
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
        .section-separator {
          display: none;
        }
        .home-page-container {
  overflow-x: hidden;
  overflow-y: clip; /* Prevents tiny sub-pixel overflows from triggering vertical scrolls */
  width: 100%;
  position: relative;
  display: block;
  /* The "Magic" fix for ghost scrollbars */
  padding-bottom: 1px; 
  margin-bottom: -1px;
}
        /* Fix: Remove bottom margin if the separator is the last visible element */
.home-page-container > .blue-separator:last-child {
  margin-bottom: 0;
}
        .home-page-container > * {
          margin-top: 0;
          margin-bottom: 0;
        }
        .home-page-container > section,
        .home-page-container > div:not(.section-separator) {
          position: relative;
        }
        :global(.modernHero) {
          margin-bottom: 0 !important;
          padding-bottom: 0 !important;
        }
        :global(.categoryNav) {
          margin-top: 0 !important;
          padding-top: 0 !important;
        }
        .home-page-container {
          margin: 0;
          padding: 0;
        }
        .home-page-container > :global(.modernHero) {
          margin-left: calc(-50vw + 50%);
          margin-right: calc(-50vw + 50%);
          width: 100vw;
          max-width: 100vw;
        }
      `}</style>

      <SocialShareRibbon />

      <div className="home-page-container">
        {/* Modern Hero Section */}
        <ModernHero
          videoUrl={null}
          stats={{
            stories: "2000+",
            industries: "150+",
            visitors: "5+Mil",
          }}
        />

        {/* Blue Horizontal Line Separator */}
        <hr className="blue-separator" />

        {/* Why Us Section with Trending News */}
        <WhyUsSection
          trendingPosts={translatedTrendingPosts || safePosts?.trendingPosts || []}
          isLoading={isLoading || isTranslatingTrending}
        />

        {/* Blue Horizontal Line Separator */}
        <hr className="blue-separator" />

        <EditorChoice isLoading={isLoading} />

        {/* Blue Horizontal Line Separator */}
        <hr className="blue-separator" />

        <PopularStories
          posts={translatedTrendingPosts || safePosts?.trendingPosts || []}
          isLoading={isLoading || isTranslatingTrending}
        />

        {/* Blue Horizontal Line Separator */}
        <hr className="blue-separator" />

        <ExploreOurWorks />

        <RecentVideoPosts
          posts={translatedVideoPosts || safePosts?.videoPosts || []}
          isLoading={isLoading || isTranslatingVideos}
        />

        {/* If you had a <hr className="blue-separator" /> here, comment it out too */}
        {/* <Newsletter /> */}

        {/* <Newsletter /> */}
      </div>
    </Layout>
    // </AuthAndSubscriptionProtected>
  );
}