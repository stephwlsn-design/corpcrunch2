import React, { useState, useEffect, useRef } from "react";
import Layout from "@/components/layout/Layout";
import { formatDate, formatNumber } from "@/util";
import Link from "next/link";
import { useRouter } from "next/router";
import BlogHero from "@/components/elements/BlogHero";
import BlogStatsSection from "@/components/elements/BlogStatsSection";
import BlogMainContent from "@/components/elements/BlogMainContent";
import TrendingCategories from "@/components/elements/TrendingCategories";
import {
  FacebookIcon,
  FacebookShareButton,
  LinkedinIcon,
  LinkedinShareButton,
  TwitterIcon,
  TwitterShareButton,
  WhatsappIcon,
  WhatsappShareButton,
} from "react-share";
import Head from "next/head";
import Markdown from "react-markdown";
import rehypeRaw from "rehype-raw";

import usePostDetail from "@/hooks/usePostDetail";
import Skeleton from "react-loading-skeleton";
import AuthAndSubscriptionProtected from "@/components/providers/AuthAndSubscriptionProtected";
import useShares from "@/hooks/useShare";
import useViews from "@/hooks/useViews";
import useArticleValidation from "@/hooks/useArticleValidation";
import Spinner from "@/components/elements/Spinner";
import BlogSidebar from "@/components/elements/BlogSidebar";
import ReadingProgressBar from "@/components/elements/ReadingProgressBar";
import { useLanguage } from "@/contexts/LanguageContext";
import { usePostTranslation } from "@/hooks/usePostTranslation";
import axiosInstance from "@/util/axiosInstance";
import Image from "next/image";
import SocialShareRibbon from "@/components/elements/SocialShareRibbon";
import { getPostBySlug } from "@/lib/postService";

// Animated Counter Component
function AnimatedCounter({ end, duration = 2000, formatFn = (n) => n }) {
  const [count, setCount] = useState(0);
  const countRef = useRef(null);
  const [hasAnimated, setHasAnimated] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !hasAnimated) {
          setHasAnimated(true);
          const startTime = Date.now();
          const startValue = 0;
          const endValue = end;

          const animate = () => {
            const now = Date.now();
            const progress = Math.min((now - startTime) / duration, 1);
            const easeOutQuad = progress * (2 - progress);
            const currentCount = Math.floor(easeOutQuad * (endValue - startValue) + startValue);
            
            setCount(currentCount);

            if (progress < 1) {
              requestAnimationFrame(animate);
            } else {
              setCount(endValue);
            }
          };

          animate();
        }
      },
      { threshold: 0.1 }
    );

    if (countRef.current) {
      observer.observe(countRef.current);
    }

    return () => {
      if (countRef.current) {
        observer.unobserve(countRef.current);
      }
    };
  }, [end, duration, hasAnimated]);

  return <span ref={countRef}>{formatFn(count)}</span>;
}

export default function BlogDetails({ postsDetails }) {
  const { t } = useLanguage();
  const { translatedPost, isTranslating } = usePostTranslation(postsDetails);
  
  // Use translated post if available, otherwise use original
  const displayPost = translatedPost || postsDetails;
  
  // Guard against undefined or invalid postsDetails
  if (!postsDetails || !postsDetails.title) {
    return (
      <Layout>
        <div style={{ padding: '40px', textAlign: 'center' }}>
          <h3>Post not found</h3>
          <p>Please check back later.</p>
        </div>
      </Layout>
    );
  }
  
  // Get author name from database
  const authorName = postsDetails.authorFirstName && postsDetails.authorLastName
    ? `${postsDetails.authorFirstName} ${postsDetails.authorLastName}`
    : postsDetails.authorFirstName || postsDetails.authorLastName || 'CorpCrunch Team';
  
  // Get trending categories (use backend data, fall back to predefined list of 9)
  const backendTrendingCategories = postsDetails?.trendingCategories || [];
  const fallbackTrendingCategories = [
    { id: "technology", name: "Technology" },
    { id: "politics", name: "Politics" },
    { id: "retail", name: "Retail" },
    { id: "sustainability", name: "Sustainability" },
    { id: "telecom", name: "Telecom" },
    { id: "automobile", name: "Automobile" },
    { id: "fmcg", name: "FMCG" },
    { id: "finance", name: "Finance" },
    { id: "science", name: "Science" },
  ];
  const trendingCategories = backendTrendingCategories.length > 0
    ? backendTrendingCategories.slice(0, 9)
    : fallbackTrendingCategories;
  
  // Get tags from database
  const postTags = postsDetails?.tags || [];
  // const { checkArticleAuthorizedAndSubscription, isValidating } =
  // useArticleValidation();
  // const [seeMore, setSeeMore] = useState(false);
  let router = useRouter();

  // Extract a meaningful quote from the content
  const extractQuote = (content) => {
    if (!content) return null;
    
    // Remove markdown formatting
    const text = content
      .replace(/[#*\[\]()]/g, "")
      .replace(/\n/g, " ")
      .replace(/\s+/g, " ")
      .trim();
    
    // Split into sentences
    const sentences = text.match(/[^.!?]+[.!?]+/g) || [];
    
    if (sentences.length === 0) return null;
    
    // Find a substantial sentence (between 50-200 characters)
    let quote = sentences.find(s => s.length >= 50 && s.length <= 200);
    
    // If no sentence in that range, take the longest sentence under 250 chars
    if (!quote) {
      quote = sentences
        .filter(s => s.length <= 250)
        .sort((a, b) => b.length - a.length)[0];
    }
    
    // If still no quote, take the first substantial sentence
    if (!quote) {
      quote = sentences.find(s => s.length >= 30) || sentences[0];
    }
    
    return quote ? quote.trim() : null;
  };

  // Industry professional names for quote attribution (deterministic based on post ID)
  const industryProfessionals = [
    { name: "Miranda H. Halim", title: "Head Of Idea", initials: "MHH" },
    { name: "Alison Fiano", title: "OG Author", initials: "AF" },
    { name: "Sarah Chen", title: "Tech Strategist", initials: "SC" },
    { name: "David Martinez", title: "Innovation Lead", initials: "DM" },
    { name: "Emily Rodriguez", title: "Content Director", initials: "ER" },
    { name: "James Thompson", title: "Digital Expert", initials: "JT" },
    { name: "Lisa Anderson", title: "Creative Head", initials: "LA" },
    { name: "Michael Park", title: "Industry Analyst", initials: "MP" },
    { name: "Rachel Green", title: "Thought Leader", initials: "RG" },
    { name: "Robert Kim", title: "Business Advisor", initials: "RK" },
  ];

  // Get professional based on post ID (deterministic to avoid hydration errors)
  const getProfessional = (postId) => {
    if (!postId) return industryProfessionals[0];
    const index = Number(postId) % industryProfessionals.length;
    return industryProfessionals[index];
  };

  // Only use quote if it exists in database
  const blogQuote = postsDetails?.quoteText || null;
  const quoteAuthorName = postsDetails?.quoteAuthorName;
  const quoteAuthorTitle = postsDetails?.quoteAuthorTitle;
  
  // Quote author info from database
  const quoteAuthor = blogQuote && quoteAuthorName
    ? {
        name: quoteAuthorName,
        title: quoteAuthorTitle || "",
        initials: quoteAuthorName 
          ? quoteAuthorName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
          : "Q"
      }
    : null;
  
  // Split content into parts to insert quote between paragraphs
  const splitContentForQuote = (content) => {
    if (!content || !blogQuote) return { before: content, after: null };
    
    // Split content by double newlines (paragraph breaks)
    const paragraphs = content.split(/\n\n+/).filter(p => p.trim());
    
    if (paragraphs.length < 2) return { before: content, after: null };
    
    // Insert quote after the first paragraph
    const insertIndex = Math.min(1, Math.floor(paragraphs.length / 2));
    
    const beforeContent = paragraphs.slice(0, insertIndex + 1).join('\n\n');
    const afterContent = paragraphs.slice(insertIndex + 1).join('\n\n');
    
    return { before: beforeContent, after: afterContent };
  };

  const { before: contentBeforeQuote, after: contentAfterQuote } = splitContentForQuote(displayPost?.content);
  
  // Cursor-driven motion for animated tags
  const [tagMouseOffset, setTagMouseOffset] = useState({ x: 0, y: 0 });

  // Base layout positions for up to 5 tags inside the tag box
  const tagLayouts = [
    { left: 30, top: 30, rotate: -30 },
    { left: 130, top: 70, rotate: -18 },
    { left: 60, top: 140, rotate: -32 },
    { left: 210, top: 40, rotate: -22 },
    { left: 230, top: 145, rotate: -26 },
  ];
  // const { id } = router.query;

  const { mutateAsync: sharePost } = useShares();
  const { mutateAsync: trackView } = useViews();
  // const { data: postsDetails, isLoading } = usePostDetail(id, {
  //   enabled: !!id,
  // });
  // const loading = isLoading || !postsDetails;
  // console.log("isLoading: ", isLoading);

  const [imageLoaded, setImageLoaded] = useState(false);

  // Removed console.log for production
  const handleImageLoad = () => {
    setImageLoaded(true);
  };

  // Track view when component mounts
  useEffect(() => {
    if (postsDetails?.id) {
      trackView({ postId: postsDetails.id }).catch(() => {
        // Silently fail if view tracking fails
      });
    }
  }, [postsDetails?.id, trackView]);

  const handleShare = async () => {
    await sharePost({ postId: postsDetails?.id });
  };

  // const handleSeeMore = async () => {
  //   let isValidUser = await checkArticleAuthorizedAndSubscription();
  //   if (isValidUser) {
  //     setSeeMore(!seeMore);
  //   }
  // };

  const currentUrl = typeof window !== "undefined" ? window.location.href : "";

  // Safely get published time with multiple fallbacks
  const getPublishedTime = () => {
    try {
      const category = postsDetails?.Category || postsDetails?.category;
      if (category?.createdAt) {
        return category.createdAt;
      }
      if (postsDetails?.createdAt) {
        return postsDetails.createdAt;
      }
      if (postsDetails?.publishDate) {
        return postsDetails.publishDate;
      }
    } catch (e) {
      console.warn('Error getting published time:', e);
    }
    // Default fallback
    return new Date().toISOString();
  };

  return (
    // <AuthAndSubscriptionProtected needSubscription={true}>
    <Layout
      breadcrumbCategory={displayPost?.Category || displayPost?.category}
      breadcrumbPostTitle={displayPost?.title}
      seo={{
        title: displayPost?.title || '',
        description: displayPost?.content?.slice(0, 160)?.replace(/\n/g, " ") || '',
        url: `https://www.corpcrunch.io/blog/${displayPost?.slug || ''}`,
        image: displayPost?.bannerImageUrl || '',
        isArticle: true,
        author: authorName,
        publishedTime: getPublishedTime()
      }}
    >
      <SocialShareRibbon />
      <ReadingProgressBar />
      {(() => {
        const heroTitle = displayPost?.title || "Smart Digital Marketing that turns strategy into growth.";
        const heroSubtitle =
          displayPost?.excerpt ||
          displayPost?.metaDescription ||
          (displayPost?.content
            ? displayPost.content.slice(0, 160).replace(/\n/g, " ")
            : "We combine strategy, creativity, and performance marketing to help digital brands grow, compete, and scale with confidence.");

        const words = (heroTitle || "").split(" ");
        const heroHighlightText = words.length >= 2 ? `${words[0]} ${words[1]}` : heroTitle;

        const isVideo = displayPost?.contentType === "video" && !!displayPost?.videoUrl;
        const heroMediaUrl = isVideo
          ? displayPost.videoUrl
          : displayPost?.bannerImageUrl || "/assets/img/blog/blog01.jpg";

        return (
          <>
            <BlogHero
              title={heroTitle}
              highlightText={heroHighlightText}
              subtitle={heroSubtitle}
              mediaUrl={heroMediaUrl}
              mediaType={isVideo ? "video" : "image"}
              journalistImage="/assets/img/others/about_me.png"
              journalistName={authorName}
              publishedDate={postsDetails?.publishedAt ? formatDate(postsDetails.publishedAt) : null}
            />

            {/* Center-aligned quote + stats section (Marketra-style) */}
            <BlogStatsSection
              quote={blogQuote}
              quoteFallback={heroSubtitle}
              quoteAuthor={quoteAuthor}
              views={displayPost?.viewsCount}
              shares={displayPost?.sharesCount}
              readTimeLabel={
                typeof displayPost?.readingTimeMinutes === "number"
                  ? `${displayPost.readingTimeMinutes}m`
                  : typeof displayPost?.readingTime === "number"
                    ? `${displayPost.readingTime}m`
                    : "5m"
              }
              whyThisMatters={displayPost?.whyThisMatters}
              expectNext={displayPost?.whatToExpect}
              mainSummary={
                displayPost?.excerpt ||
                displayPost?.metaDescription ||
                (displayPost?.content
                  ? displayPost.content.slice(0, 220).replace(/\n/g, " ")
                  : "")
              }
            />

            {/* Main blog content using BlogMainContent component */}
            <BlogMainContent
              content={displayPost?.content}
              tags={postTags}
              prevPost={displayPost?.prevPost ? {
                slug: displayPost.prevPost.slug,
                title: displayPost.prevPost.title,
                excerpt: displayPost.prevPost.excerpt || displayPost.prevPost.metaDescription
              } : null}
              nextPost={displayPost?.nextPost ? {
                slug: displayPost.nextPost.slug,
                title: displayPost.nextPost.title,
                excerpt: displayPost.nextPost.excerpt || displayPost.nextPost.metaDescription
              } : null}
            />
          </>
        );
      })()}
      <Head>
        <style jsx global>{`
          @import url('https://fonts.googleapis.com/css2?family=Urbanist:wght@300;400;500;600;700;800;900&display=swap');

          .blog-details-area,
          .blog-details-area * {
            font-family: 'Urbanist', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif !important;
          }

          .blog-avatar-wrap {
            text-align: center;
          }
          .blog-avatar-img {
            margin-bottom: 20px;
          }
          .blog-avatar-content p {
            margin-bottom: 20px;
            font-size: 16px;
            line-height: 1.8;
            color: #666;
            max-width: 600px;
            margin-left: auto;
            margin-right: auto;
          }
          .blog-avatar-content .name {
            margin-bottom: 8px;
            font-size: 20px;
            font-weight: 600;
            color: #333;
          }
          .blog-avatar-content .designation {
            color: var(--tg-theme-primary, #007bff);
            font-size: 14px;
            font-weight: 500;
            text-transform: uppercase;
            letter-spacing: 1px;
          }
          .pn-post-item {
            transition: all 0.3s ease;
            border: 1px solid #eef0f2;
          }
          .pn-post-item:hover {
            transform: translateY(-5px);
            box-shadow: 0 12px 30px rgba(0,0,0,0.08);
            border-color: var(--tg-theme-secondary, #2551e7);
          }
          .pn-post-item .title a:hover {
            color: var(--tg-theme-primary, #007bff);
          }
          
          /* Readability improvements for blog content */
          .blog-details-content {
            font-size: 19px;
            line-height: 1.8;
            color: #334155;
            max-width: 820px;
            margin: 0 auto;
          }
          .blog-details-content p {
            margin-bottom: 25px;
          }
          .blog-details-content h2, 
          .blog-details-content h3, 
          .blog-details-content h4 {
            color: #0f172a;
            font-weight: 700;
            margin-top: 45px;
            margin-bottom: 20px;
          }
          .blog-details-content h2 { font-size: 32px; }
          .blog-details-content h3 { font-size: 28px; }
          .blog-details-content h4 { font-size: 24px; }
          
          .blog-details-content ul, 
          .blog-details-content ol {
            margin-bottom: 30px;
            padding-left: 20px;
          }
          .blog-details-content li {
            margin-bottom: 12px;
            color: #334155;
          }
          .blog-details-content strong {
            color: #0f172a;
            font-weight: 700;
          }
          .blog-details-content a {
            color: var(--tg-theme-secondary, #2551e7);
            text-decoration: underline;
            text-underline-offset: 4px;
            font-weight: 600;
          }
          .blog-details-content blockquote {
            border-left: 4px solid var(--tg-theme-secondary, #2551e7);
            padding: 20px 30px;
            margin: 40px 0;
            background: #f8faff;
            border-radius: 0 16px 16px 0;
            font-style: italic;
            color: #1e293b;
            font-size: 20px;
          }
          
          .blog-details-wrap .title {
            font-size: 42px;
            font-weight: 800;
            line-height: 1.2;
            margin-bottom: 30px;
            color: var(--tg-theme-secondary, #2551e7);
            position: relative;
            z-index: 2;
          }
          .blog-details-wrap .meta-item {
            color: #64748b;
          }
          .blog-details-wrap .meta-item .by {
            color: #94a3b8;
          }
          .blog-details-wrap .meta-item .author-name {
            color: #1e293b;
          }
          .blog-details-wrap .view-counter {
            background: #f1f5ff;
          }
          
          /* Quote Section */
          .quote-stats-section {
            margin: 60px 0;
            padding: 50px 40px;
            border-radius: 32px;
            background: linear-gradient(135deg, #f8faff 0%, #f1f5ff 100%);
            border: 1px solid rgba(37,81,231,0.1);
            box-shadow: 0 20px 40px rgba(37,81,231,0.05);
            position: relative;
            overflow: hidden;
          }
          .quote-stats-container {
            background: rgba(255,255,255,0.5);
            backdrop-filter: blur(10px);
            padding: 30px;
            border-radius: 24px;
            display: flex;
            flex-direction: column;
            gap: 24px;
            border: 1px solid rgba(255,255,255,0.5);
          }
          .quote-stats-section .quote-text {
            color: #0f172a;
          }
          .quote-stats-section .quote-author-name {
            color: #0f172a;
          }
          .quote-stats-section .quote-author-title {
            color: #64748b;
          }
          
          /* Biography Section */
          .blog-avatar-wrap {
            border: 1px solid #f1f5f9;
            background: linear-gradient(to bottom right, #ffffff, #fcfdfe);
          }
          .blog-avatar-wrap .bio-accent-line {
            background: linear-gradient(to bottom, var(--tg-theme-secondary), #ff2092);
          }
          .blog-avatar-content .bio-text {
            color: #64748b;
          }
          .blog-avatar-content .bio-name {
            color: #0f172a;
          }
          .blog-avatar-content .designation {
            background: rgba(37,81,231,0.08);
            color: var(--tg-theme-secondary, #2551e7);
          }
          
          /* Prev/Next Post Styles */
          .pn-post-item {
            background-color: #f8f9fa;
            border: 1px solid #eef0f2;
          }
          .pn-post-item .content .title a {
            color: #333;
          }
          .pn-post-item .content .title a:hover {
            color: var(--tg-theme-primary, #007bff);
          }
          
          /* Quote Stats Section Details */
          .quote-stat-item-icon {
            background: #f1f5ff;
            color: #2551e7;
          }
          .quote-stat-item-value {
            color: #2551e7;
          }
          .quote-stat-item-label {
            color: #64748b;
          }

          /* Main blog content section directly after BlogStatsSection */
          .blog-main-content-section {
            padding: 64px 0 40px;
            /* Match BlogStatsSection background so it feels like one unified block */
            background: #ffffff;
          }

          /* Outer container for the main content section (avoid global .container overrides) */
          .blog-main-content-container {
            max-width: 1200px;
            margin: 0 auto;
            padding-left: 40px;
            padding-right: 40px;
            box-sizing: border-box;
          }

          /* Inner content card */
          .blog-main-content-inner {
            max-width: 840px;
            margin: 0 auto;
            background: #ffffff;
            border-radius: 28px;
            padding: 40px 32px;
            box-shadow: 0 24px 60px rgba(15, 23, 42, 0.06);
            box-sizing: border-box;
            font-family: 'Urbanist', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            font-size: 19px;
            line-height: 1.9;
            color: #334155;
          }

          .blog-main-content-inner p {
            margin-bottom: 28px;
          }

          /* Extra internal wrapper to give even side spacing for content + tags + next/prev */
          .blog-main-content-body {
            padding-left: 24px;
            padding-right: 24px;
            box-sizing: border-box;
          }

          @media (max-width: 768px) {
            .blog-main-content-section {
              padding: 48px 0 32px;
            }

            .blog-main-content-container {
              padding-left: 20px;
              padding-right: 20px;
            }

            .blog-main-content-inner {
              padding: 28px 16px;
              border-radius: 20px;
            }

            .blog-main-content-body {
              padding-left: 12px;
              padding-right: 12px;
            }
          }

          /* Ensure the overall blog details page has side space on this page only */
          .blog-details-area .container {
            max-width: 1200px;
            margin: 0 auto;
            padding-left: 40px !important;
            padding-right: 40px !important;
            box-sizing: border-box;
          }

          @media (max-width: 768px) {
            .blog-details-area .container {
              padding-left: 20px !important;
              padding-right: 20px !important;
            }
          }

          /* OpenAI main story section (after BlogStatsSection) */
          .openai-main-story-section {
            padding: 40px 0 20px;
          }
          .openai-main-story-inner {
            max-width: 820px;
            margin: 0 auto;
            text-align: left;
            font-family: 'Urbanist', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          }
          .openai-main-story-inner p {
            font-size: 18px;
            line-height: 1.8;
            color: #111827;
            margin-bottom: 18px;
          }
          .openai-main-story-inner p:first-of-type {
            font-weight: 700;
          }
          .openai-main-story-author {
            margin-top: 8px;
            font-size: 14px;
            font-weight: 600;
            letter-spacing: 0.08em;
            text-transform: uppercase;
            color: #4b5563;
          }
          
          /* Unique decorative elements */
          .blog-details-wrap {
            position: relative;
            overflow: hidden;
          }
          .blog-details-wrap::before {
            content: "";
            position: absolute;
            top: 0;
            right: 0;
            width: 300px;
            height: 300px;
            background: radial-gradient(circle, rgba(37,81,231,0.03) 0%, transparent 70%);
            z-index: 0;
            pointer-events: none;
          }
          .bg-decorative-text {
            position: absolute;
            top: 40px;
            right: -20px;
            font-size: 120px;
            font-weight: 900;
            color: rgba(37,81,231,0.03);
            line-height: 1;
            z-index: 0;
            pointer-events: none;
            text-transform: uppercase;
            white-space: nowrap;
          }
          .grid-decoration {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 4px;
            position: absolute;
            top: 40px;
            left: 40px;
            z-index: 0;
            opacity: 0.5;
          }
          .grid-square {
            width: 8px;
            height: 8px;
            background: #2551e7;
            border-radius: 2px;
            opacity: 0.15;
          }
          
          @media (max-width: 768px) {
            .blog-details-wrap .title {
              font-size: 30px;
            }
            .blog-details-wrap {
              padding: 20px !important;
            }
            .tgbanner__content-meta {
              flex-direction: column !important;
              align-items: flex-start !important;
              gap: 15px !important;
            }
            .trending-categories-section > div > div {
              grid-template-columns: repeat(2, 1fr) !important;
              gap: 20px !important;
            }
          }
          @media (max-width: 576px) {
            .trending-categories-section > div > div {
              grid-template-columns: 1fr !important;
            }
          }
          
          /* Light mode defaults for blog details and trending cards */
          .blog-details-area {
            background-color: #fcfdfe;
          }
          .blog-details-wrap {
            background-color: #ffffff;
            box-shadow: 0 4px 40px rgba(0,0,0,0.03);
            border: 1px solid #f1f5f9;
          }
          .trending-categories-section {
            background-color: #f8fafc;
            border-top: 2px solid #e5e5e5;
          }
          .trending-category-card {
            background-color: #ffffff;
            border: 1px solid #f1f5f9;
            transition: all 0.3s ease;
          }
          .trending-category-card:hover {
            transform: translateY(-8px) !important;
            box-shadow: 0 12px 40px rgba(0,0,0,0.1) !important;
            border-color: var(--tg-theme-secondary, #2551e7) !important;
          }
          .blog-tags-section-box {
            background-color: #f1f5f9;
          }

          /* Dark mode refinements */
          :global(.dark-theme) .blog-details-area {
            background-color: #020617 !important;
          }
          :global(.dark-theme) .blog-details-wrap {
            background-color: #0f172a !important;
            border-color: rgba(255,255,255,0.08) !important;
          }
          :global(.dark-theme) .blog-details-content {
            color: #cbd5e1;
          }
          :global(.dark-theme) .blog-details-wrap .title,
          :global(.dark-theme) .blog-details-content h2,
          :global(.dark-theme) .blog-details-content h3,
          :global(.dark-theme) .blog-details-content h4 {
            color: #f8fafc;
          }
          :global(.dark-theme) .blog-details-wrap .meta-item {
            color: #94a3b8;
          }
          :global(.dark-theme) .blog-details-wrap .meta-item .author-name {
            color: #cbd5e1;
          }
          :global(.dark-theme) .blog-details-wrap .view-counter {
            background: rgba(255, 255, 255, 0.05) !important;
          }
          
          :global(.dark-theme) .blog-avatar-wrap {
            background: linear-gradient(to bottom right, #0f172a, #1e293b) !important;
            border-color: rgba(255, 255, 255, 0.05) !important;
          }
          :global(.dark-theme) .blog-avatar-content .bio-text {
            color: #94a3b8 !important;
          }
          :global(.dark-theme) .blog-avatar-content .bio-name {
            color: #f8fafc !important;
          }
          :global(.dark-theme) .blog-avatar-content .designation {
            background: rgba(255, 255, 255, 0.05) !important;
            color: #cbd5e1 !important;
          }
          
          :global(.dark-theme) .quote-stats-section {
            background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%) !important;
            border-color: rgba(255, 255, 255, 0.05) !important;
            box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3) !important;
          }
          :global(.dark-theme) .quote-stats-container {
            background: rgba(255, 255, 255, 0.05) !important;
            border-color: rgba(255, 255, 255, 0.08) !important;
          }
          :global(.dark-theme) .quote-stats-section .quote-text {
            color: #f8fafc !important;
          }
          :global(.dark-theme) .quote-stats-section .quote-author-name {
            color: #f8fafc !important;
          }
          :global(.dark-theme) .quote-stats-section .quote-author-title {
            color: #94a3b8 !important;
          }
          
          :global(.dark-theme) .pn-post-item {
            background-color: #0f172a !important;
            border-color: rgba(255, 255, 255, 0.08) !important;
          }
          :global(.dark-theme) .pn-post-item .content .title a {
            color: #f8fafc !important;
          }
          
          :global(.dark-theme) .quote-stat-item-icon {
            background: rgba(255, 255, 255, 0.05) !important;
            color: #cbd5e1 !important;
          }
          :global(.dark-theme) .quote-stat-item-value {
            color: #f8fafc !important;
          }
          :global(.dark-theme) .quote-stat-item-label {
            color: #94a3b8 !important;
          }

          :global(.dark-theme) .blog-main-content-inner,
          :global(.dark-theme) .blog-main-content-inner p {
            color: #cbd5e1;
          }
          :global(.dark-theme) .blog-main-content-inner {
            background: #020617;
            box-shadow: 0 24px 60px rgba(0, 0, 0, 0.6);
          }
          
          :global(.dark-theme) .trending-category-card {
            background-color: #1e293b !important;
            border-color: rgba(255,255,255,0.1) !important;
          }
          :global(.dark-theme) .trending-category-card h5 {
            color: #f8fafc !important;
          }
          :global(.dark-theme) .trending-category-card p {
            color: #94a3b8 !important;
          }
          :global(.dark-theme) .trending-categories-section {
            background-color: #020617 !important;
            border-top-color: rgba(255,255,255,0.05) !important;
          }
          :global(.dark-theme) .trending-categories-section h4 {
            color: #f8fafc !important;
          }
          :global(.dark-theme) .blog-tags-section-box {
            background-color: #1e293b;
          }
          :global(.dark-theme) .blog-avatar-wrap {
            background: linear-gradient(to bottom right, #0f172a, #1e293b) !important;
            border-color: rgba(255,255,255,0.05) !important;
          }
          :global(.dark-theme) .blog-avatar-wrap .name {
            color: #f8fafc !important;
          }
          :global(.dark-theme) .blog-avatar-wrap p {
            color: #94a3b8 !important;
          }
          :global(.dark-theme) .bg-decorative-text {
            color: rgba(255,255,255,0.02) !important;
          }
          :global(.dark-theme) .pn-post-item {
            background-color: #1e293b !important;
            border-color: rgba(255,255,255,0.1) !important;
          }
          :global(.dark-theme) .pn-post-item .title a {
            color: #f8fafc !important;
          }
          :global(.dark-theme) .quote-stats-section {
            background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%) !important;
            border-color: rgba(255,255,255,0.05) !important;
          }
          :global(.dark-theme) .quote-stats-section p {
            color: #f8fafc !important;
          }
          :global(.dark-theme) .quote-stats-section div > div > div:first-child {
            background: rgba(255,255,255,0.03) !important;
            border-color: rgba(255,255,255,0.05) !important;
          }
          
          /* Trending Categories Responsive Styles */
          .trending-categories-horizontal-scroll::-webkit-scrollbar {
            display: none;
          }
          .trending-categories-horizontal-scroll {
            -ms-overflow-style: none;
            scrollbar-width: none;
          }
          @keyframes scrollTrending {
            0% { 
              transform: translateX(0); 
          }
            100% { 
              transform: translateX(-50%); 
            }
          }
          
          .trending-news-track {
            display: flex;
            gap: 20px;
            animation: scrollTrending 30s linear infinite;
            width: fit-content;
            will-change: transform;
          }
          
          .trending-news-track:hover {
            animation-play-state: paused;
          }
          
          /* Ensure smooth animation on mobile */
          @media (max-width: 768px) {
            .trending-news-track {
              animation: scrollTrending 20s linear infinite;
              gap: 15px;
            }
          }

          /* Light Mode for Trending Categories */
          .trending-categories-section {
            background-color: #f8f9fa;
          }
          
          .trending-categories-section h4 {
            color: #111827;
          }
          
          .trending-category-row-wrap {
            background: #fff;
            border: 1px solid #f0f0f0;
          }
          
          .trending-category-card-modern {
            background: #f4f5f7;
            color: #000;
            border: 1px solid #eef0f2;
          }
          
          .trending-category-card-modern h5,
          .trending-category-card-modern p,
          .trending-category-card-modern i {
            color: #000;
          }
          
          .trending-category-index {
            color: rgba(0, 0, 0, 0.04);
          }
          
          .news-article-card {
            background: #fff;
            border: 1px solid #f0f0f0;
          }
          
          .news-article-card h6 {
            color: #000;
          }
          
          .news-article-card span {
            color: #64748b;
          }
          
          .trending-category-accent-dot {
            background: #2551e7;
          }
          
          .no-news-text {
            color: #94a3b8;
          }

          /* Dark Mode for Trending Categories */
          :global(.dark-theme) .trending-categories-section,
          :global(html.dark-theme) .trending-categories-section,
          :global(body.dark-theme) .trending-categories-section {
            background-color: #020617 !important;
          }
          :global(.dark-theme) .trending-categories-section h4,
          :global(html.dark-theme) .trending-categories-section h4,
          :global(body.dark-theme) .trending-categories-section h4 {
            color: #60a5fa !important;
          }
          :global(.dark-theme) .trending-category-row-wrap,
          :global(html.dark-theme) .trending-category-row-wrap,
          :global(body.dark-theme) .trending-category-row-wrap {
            background-color: #0f172a !important;
            border-color: rgba(96, 165, 250, 0.1) !important;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2) !important;
          }
          :global(.dark-theme) .trending-category-card-modern,
          :global(html.dark-theme) .trending-category-card-modern,
          :global(body.dark-theme) .trending-category-card-modern {
            background-color: #1e293b !important;
            border-color: rgba(96, 165, 250, 0.1) !important;
          }
          :global(.dark-theme) .trending-category-card-modern h5,
          :global(.dark-theme) .trending-category-card-modern p,
          :global(.dark-theme) .trending-category-card-modern i,
          :global(html.dark-theme) .trending-category-card-modern h5,
          :global(html.dark-theme) .trending-category-card-modern p,
          :global(html.dark-theme) .trending-category-card-modern i,
          :global(body.dark-theme) .trending-category-card-modern h5,
          :global(body.dark-theme) .trending-category-card-modern p,
          :global(body.dark-theme) .trending-category-card-modern i {
            color: #f8fafc !important;
          }
          :global(.dark-theme) .trending-category-card-modern p,
          :global(html.dark-theme) .trending-category-card-modern p,
          :global(body.dark-theme) .trending-category-card-modern p {
            opacity: 0.7 !important;
          }
          :global(.dark-theme) .trending-category-index,
          :global(html.dark-theme) .trending-category-index,
          :global(body.dark-theme) .trending-category-index {
            color: rgba(96, 165, 250, 0.08) !important;
          }
          :global(.dark-theme) .news-article-card,
          :global(html.dark-theme) .news-article-card,
          :global(body.dark-theme) .news-article-card {
            background-color: #1e293b !important;
            border-color: rgba(96, 165, 250, 0.1) !important;
          }
          :global(.dark-theme) .news-article-card h6,
          :global(html.dark-theme) .news-article-card h6,
          :global(body.dark-theme) .news-article-card h6 {
            color: #f8fafc !important;
          }
          :global(.dark-theme) .news-article-card span,
          :global(html.dark-theme) .news-article-card span,
          :global(body.dark-theme) .news-article-card span {
            color: #94a3b8 !important;
          }
          :global(.dark-theme) .news-article-card i,
          :global(html.dark-theme) .news-article-card i,
          :global(body.dark-theme) .news-article-card i {
            color: #60a5fa !important;
          }

          /* Blue accent dot for category cards in dark mode */
          :global(.dark-theme) .trending-category-card-modern > div:first-child,
          :global(html.dark-theme) .trending-category-card-modern > div:first-child,
          :global(body.dark-theme) .trending-category-card-modern > div:first-child {
            background: #60a5fa !important;
          }

          /* Hover effects for dark mode with blue accents */
          :global(.dark-theme) .trending-category-card-modern:hover,
          :global(html.dark-theme) .trending-category-card-modern:hover,
          :global(body.dark-theme) .trending-category-card-modern:hover {
            border-color: rgba(96, 165, 250, 0.4) !important;
            box-shadow: 0 15px 40px rgba(96, 165, 250, 0.2) !important;
          }

          :global(.dark-theme) .news-article-card:hover,
          :global(html.dark-theme) .news-article-card:hover,
          :global(body.dark-theme) .news-article-card:hover {
            border-color: rgba(96, 165, 250, 0.4) !important;
            box-shadow: 0 10px 25px rgba(96, 165, 250, 0.3) !important;
          }
          
          :global(.dark-theme) .trending-category-accent-dot,
          :global(html.dark-theme) .trending-category-accent-dot,
          :global(body.dark-theme) .trending-category-accent-dot {
            background: #60a5fa !important;
          }
          
          :global(.dark-theme) .no-news-text,
          :global(html.dark-theme) .no-news-text,
          :global(body.dark-theme) .no-news-text {
            color: #94a3b8 !important;
          }

          /* Mobile Responsive Styles for Trending Categories */
          @media (max-width: 991.98px) {
            .trending-categories-section {
              padding: 40px 0 !important;
            }
            
            .trending-categories-section h4 {
              font-size: 26px !important;
              margin-bottom: 30px !important;
              padding: 0 15px;
            }
            
            .trending-category-row-wrap {
              display: flex !important;
              flex-direction: column !important;
              gap: 20px !important;
              padding: 20px !important;
            }
            
            .trending-category-card-modern {
              width: 100% !important;
              height: auto !important;
              min-height: 200px !important;
              padding: 25px !important;
            }
            
            .trending-category-card-modern h5 {
              font-size: 22px !important;
            }
            
            .trending-category-card-modern i {
              font-size: 28px !important;
            }
            
            .news-article-card-link {
              width: 280px !important;
            }
            
            .news-article-card {
              height: 320px !important;
            }
          }
          
          @media (max-width: 768px) {
            .trending-categories-section {
              padding: 30px 0 !important;
            }
            
            .trending-categories-section h4 {
              font-size: 24px !important;
              padding: 0 10px;
            }
            
            .trending-category-row-wrap {
              padding: 15px !important;
              margin: 0 10px;
            }
            
            .trending-category-card-modern {
              min-height: 180px !important;
              padding: 20px !important;
            }
            
            .trending-category-card-modern h5 {
              font-size: 20px !important;
            }
            
            .trending-category-index {
              font-size: 50px !important;
            }
            
            .news-article-card-link {
              width: 260px !important;
            }
            
            .news-article-card {
              height: 300px !important;
            }
          }
          
          @media (max-width: 576px) {
            .trending-categories-section {
              padding: 20px 0 !important;
            }
            
            .trending-categories-section h4 {
              font-size: 20px !important;
              margin-bottom: 20px !important;
            }
            
            .trending-category-row-wrap {
              padding: 12px !important;
              margin: 0 5px;
            }
            
            .trending-category-card-modern {
              min-height: 160px !important;
              padding: 15px !important;
            }
            
            .trending-category-card-modern h5 {
              font-size: 18px !important;
            }
            
            .trending-category-card-modern p {
              font-size: 13px !important;
            }
            
            .trending-category-card-modern i {
              font-size: 24px !important;
            }
            
            .trending-category-index {
              font-size: 40px !important;
            }
            
            .news-article-card-link {
              width: 240px !important;
            }
            
            .news-article-card {
              height: 280px !important;
              padding: 15px !important;
            }
            
            .news-article-card h6 {
              font-size: 14px !important;
            }
            
            .news-article-card span {
              font-size: 11px !important;
            }
          }
        `}</style>
      </Head>

      {/* Removed: Author bio + sidebar + trending categories + Instagram */}
      {false && (
      <section className="blog-details-area pt-80 pb-100">
        <div className="blog-details-simple-layout">
          <div className="row justify-content-center">
            <div className="col-xl-8 col-lg-7">
              {/* Author Biography Section (text only, no image) - HIDDEN */}
              <div
                className="blog-avatar-wrap"
                style={{
                  marginTop: "0px",
                  padding: "50px 30px",
                  borderRadius: "24px",
                  textAlign: "center",
                  position: "relative",
                  overflow: "hidden",
                }}
              >
                <div
                  className="bio-accent-line"
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    width: "4px",
                    height: "100%",
                  }}
                ></div>
                <div className="blog-avatar-content">
                  <p
                    className="bio-text"
                    style={{
                      marginBottom: "25px",
                      fontSize: "17px",
                      lineHeight: "1.8",
                      maxWidth: "650px",
                      margin: "0 auto 25px",
                      fontWeight: "500",
                    }}
                  >
                    Aditya Telsinge is a Writer at CorpCrunch covering emerging
                    technologies, venture capital, and the latest news from
                    startups to tech giants.
                  </p>
                  <h5
                    className="name bio-name"
                    style={{
                      marginBottom: "10px",
                      fontSize: "22px",
                      fontWeight: "800",
                    }}
                  >
                    Aditya Telsinge
                  </h5>
                  <span
                    className="designation"
                    style={{
                      padding: "6px 16px",
                      borderRadius: "100px",
                      fontSize: "12px",
                      fontWeight: "700",
                      textTransform: "uppercase",
                      letterSpacing: "1px",
                    }}
                  >
                    JOURNALIST
                  </span>
                </div>
              </div>
            </div>
            <div className="col-xl-3 col-lg-4 col-md-6">
              <BlogSidebar
                author={{
                  firstName: postsDetails?.authorFirstName,
                  lastName: postsDetails?.authorLastName,
                  displayPicture: null,
                }}
              />
            </div>
          </div>
        </div>
      </section>
      )}

      {/* Trending Categories Section - New Component */}
      <TrendingCategories categories={trendingCategories} />
    </Layout>
    // </AuthAndSubscriptionProtected>
  );
}


export const getServerSideProps = async ({ params, req }) => {
  try {
    const language = req?.cookies?.language || 'en';
    const postsDetails = await getPostBySlug(params.id);
    
    if (!postsDetails) {
      return { notFound: true };
    }

    // Redirect to category-based URL if category exists
    const category = postsDetails.Category || postsDetails.category;
    if (category) {
      const categorySlug = category.slug?.toLowerCase() || 
                          category.name?.toLowerCase().replace(/\s+/g, '-') || '';
      
      if (categorySlug) {
        return {
          redirect: {
            destination: `/${categorySlug}/blog/${params.id}`,
            permanent: true,
          },
        };
      }
    }

    return {
      props: { 
        postsDetails: JSON.parse(JSON.stringify(postsDetails))
      }
    };
  } catch (error) {
    console.error('Error fetching post details:', error);
    return {
      props: { postsDetails: null },
      notFound: true
    };
  }
};

