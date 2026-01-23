import DownloadCard from "@/components/card/DownloadCard";
import Layout from "@/components/layout/Layout";
import AuthAndSubscriptionProtected from "@/components/providers/AuthAndSubscriptionProtected";
import TrendingSlider from "@/components/slider/TrendingSlider";
import FeaturedPosts from "@/components/elements/FeaturedPosts";
import PopularStories from "@/components/elements/PopularStories";
import Newsletter from "@/components/elements/Newsletter";
import RecentVideoPosts from "@/components/elements/RecentVideoPosts";
import ExploreOurWorks from "@/components/elements/ExploreOurWorks";
import EditorChoice from "@/components/elements/EditorChoice";
import ModernHero from "@/components/elements/ModernHero";
import WhyUsSection from "@/components/elements/WhyUsSection";
import AnimatedTextSeparator from "@/components/elements/AnimatedTextSeparator";
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

const _unused_getServerSideProps = async ({ req }) => {
  try {
    const language = req?.cookies?.language || "en";
    const location = req?.cookies?.location || "all";

    console.log("[getServerSideProps] Fetching posts with params:", {
      lang: language,
      location,
    });

    let response;
    try {
      response = await axiosInstance.get(`/posts`, {
        params: {
          lang: language,
          location: location !== "all" ? location : undefined,
        },
        timeout: 10000,
      });

      console.log("[getServerSideProps] Raw API response:", {
        type: typeof response,
        isArray: Array.isArray(response),
        keys: response ? Object.keys(response) : [],
        hasFrontPagePosts: response?.frontPagePosts !== undefined,
        frontPagePostsType: typeof response?.frontPagePosts,
        frontPagePostsIsArray: Array.isArray(response?.frontPagePosts),
        frontPagePostsLength: Array.isArray(response?.frontPagePosts)
          ? response.frontPagePosts.length
          : "N/A",
        hasTrendingPosts: response?.trendingPosts !== undefined,
        trendingPostsType: typeof response?.trendingPosts,
        trendingPostsIsArray: Array.isArray(response?.trendingPosts),
        trendingPostsLength: Array.isArray(response?.trendingPosts)
          ? response.trendingPosts.length
          : "N/A",
        success: response?.success,
        message: response?.message,
        fullResponsePreview: JSON.stringify(response).substring(0, 1000),
      });
    } catch (apiError) {
      console.error("[getServerSideProps] API call failed:", {
        message: apiError.message,
        response: apiError.response?.data,
        status: apiError.response?.status,
      });
      return {
        props: {
          posts: {
            frontPagePosts: [],
            trendingPosts: [],
          },
        },
      };
    }

    const frontPagePosts = Array.isArray(response?.frontPagePosts)
      ? response.frontPagePosts
      : [];
    const trendingPosts = Array.isArray(response?.trendingPosts)
      ? response.trendingPosts
      : [];

    console.log("[getServerSideProps] Extracted posts:", {
      frontPagePostsCount: frontPagePosts.length,
      trendingPostsCount: trendingPosts.length,
      firstPostTitle: frontPagePosts[0]?.title,
      firstPostId: frontPagePosts[0]?._id,
    });

    const serializePost = (post) => {
      if (!post || typeof post !== "object") {
        console.warn("[getServerSideProps] Invalid post:", post);
        return null;
      }
      try {
        const serialized = JSON.parse(JSON.stringify(post));

        if (serialized._id) {
          serialized._id = String(serialized._id);
        }
        if (serialized.categoryId) {
          serialized.categoryId = String(serialized.categoryId);
        }

        if (serialized.createdAt) {
          serialized.createdAt =
            serialized.createdAt instanceof Date
              ? serialized.createdAt.toISOString()
              : String(serialized.createdAt);
        }
        if (serialized.updatedAt) {
          serialized.updatedAt =
            serialized.updatedAt instanceof Date
              ? serialized.updatedAt.toISOString()
              : String(serialized.updatedAt);
        }

        if (serialized.Category && typeof serialized.Category === "object") {
          serialized.Category = {
            ...serialized.Category,
            id:
              serialized.Category.id?.toString() ||
              serialized.Category._id?.toString() ||
              serialized.Category.id,
          };
        }

        return serialized;
      } catch (e) {
        console.error(
          "[getServerSideProps] Error serializing post:",
          e.message,
          {
            postId: post._id,
            postTitle: post.title,
            error: e.stack,
          }
        );
        return {
          _id: post._id?.toString() || "unknown",
          title: post.title || "Untitled",
          slug: post.slug || "",
        };
      }
    };

    const serializedFrontPage = frontPagePosts
      .map(serializePost)
      .filter((post) => post !== null);
    const serializedTrending = trendingPosts
      .map(serializePost)
      .filter((post) => post !== null);

    const serializablePosts = {
      frontPagePosts: serializedFrontPage,
      trendingPosts: serializedTrending,
    };

    console.log("[getServerSideProps] ✓ Final serialized posts:", {
      frontPagePostsCount: serializablePosts.frontPagePosts.length,
      trendingPostsCount: serializablePosts.trendingPosts.length,
      firstPostTitle: serializablePosts.frontPagePosts[0]?.title,
      firstPostId: serializablePosts.frontPagePosts[0]?._id,
      canStringify: (() => {
        try {
          JSON.stringify(serializablePosts);
          return true;
        } catch (e) {
          console.error(
            "[getServerSideProps] ❌ Cannot stringify posts:",
            e.message
          );
          return false;
        }
      })(),
    });

    try {
      const testStringify = JSON.stringify(serializablePosts);
      console.log(
        "[getServerSideProps] ✓ Posts are JSON-serializable, size:",
        testStringify.length,
        "bytes"
      );
    } catch (e) {
      console.error(
        "[getServerSideProps] ❌ Posts are NOT JSON-serializable:",
        e.message
      );
      return {
        props: {
          posts: {
            frontPagePosts: [],
            trendingPosts: [],
          },
        },
      };
    }

    return {
      props: { posts: serializablePosts },
    };
  } catch (error) {
    console.error("[getServerSideProps] Error fetching posts:", {
      message: error.message,
      code: error.code,
      response: error.response?.data,
      status: error.response?.status,
    });

    if (error.response?.data) {
      const errorData = error.response.data;
      if (
        errorData.frontPagePosts !== undefined ||
        errorData.trendingPosts !== undefined
      ) {
        return {
          props: {
            posts: {
              frontPagePosts: Array.isArray(errorData.frontPagePosts)
                ? errorData.frontPagePosts
                : [],
              trendingPosts: Array.isArray(errorData.trendingPosts)
                ? errorData.trendingPosts
                : [],
            },
          },
        };
      }
    }

    console.warn(
      "[getServerSideProps] ⚠ Returning empty posts due to error"
    );
    return {
      props: {
        posts: {
          frontPagePosts: [],
          trendingPosts: [],
        },
      },
    };
  }
};

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
    <Layout headerStyle={1} headTitle={"CorpCrunch"} categories={categories}>
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
        .section-separator {
          display: none;
        }
        .home-page-container {
          overflow-x: hidden;
          width: 100%;
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

        {/* Animated Text Separator - All 3 texts in sequence */}
        <AnimatedTextSeparator />

        {/* Why Us Section with Trending News */}
        <WhyUsSection
          trendingPosts={translatedTrendingPosts || safePosts?.trendingPosts || []}
          isLoading={isLoading || isTranslatingTrending}
        />

        {/* Animated Text Separator */}
        <AnimatedTextSeparator />

        <EditorChoice isLoading={isLoading} />

        {/* Animated Text Separator */}
        <AnimatedTextSeparator />

        <PopularStories
          posts={translatedTrendingPosts || safePosts?.trendingPosts || []}
          isLoading={isLoading || isTranslatingTrending}
        />

        {/* Animated Text Separator */}
        <AnimatedTextSeparator />

        <ExploreOurWorks />

        <RecentVideoPosts
          posts={translatedVideoPosts || safePosts?.videoPosts || []}
          isLoading={isLoading || isTranslatingVideos}
        />

        <Newsletter />
      </div>
    </Layout>
    // </AuthAndSubscriptionProtected>
  );
}
