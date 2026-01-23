import Link from "next/link";
import Image from "next/image";
import { useEffect, useState, useRef } from "react";
import Skeleton from "react-loading-skeleton";
import { useLanguage } from "@/contexts/LanguageContext";
import { formatDate } from "@/util";
import { getBlogPostUrl } from "@/util/urlHelpers";
import styles from "./PopularStories.module.css";

export default function PopularStories({ posts = [], isLoading = false }) {
  const { t } = useLanguage();
  const [isMounted, setIsMounted] = useState(false);
  const [playingVideoId, setPlayingVideoId] = useState(null);
  const sliderRef = useRef(null);

  // Show all posts - no limit
  const displayPosts = posts && posts.length > 0 ? posts : [];

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Extract YouTube video ID from URL
  const getYouTubeVideoId = (url) => {
    if (!url) return null;
    const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/);
    return match ? match[1] : null;
  };

  const handleVideoPlay = (videoUrl) => {
    const videoId = getYouTubeVideoId(videoUrl);
    if (videoId) {
      setPlayingVideoId(playingVideoId === videoId ? null : videoId);
    }
  };

  // Clean URL helper
  const cleanUrl = (url) => {
    if (!url || typeof url !== "string") return null;
    let cleaned = url.trim();
    if (cleaned.length > 200) {
      const urlMatch = cleaned.match(/^(https?:\/\/[^\s]+)/);
      if (urlMatch) {
        cleaned = urlMatch[1];
      }
    }
    return cleaned;
  };

  if (isLoading) {
    return (
      <section className={styles.popularStoriesSection}>
        <div className={styles.storiesPlaceholder}>
          <Skeleton height={600} borderRadius={40} />
        </div>
      </section>
    );
  }

  if (!posts || posts.length === 0 || displayPosts.length === 0) return null;

  return (
    <div className={styles.popularStoriesWrapper}>
      {/* 1. Separate Static Title Section */}
      <div className={styles.titleSection}>
        <div className={styles.horizontalLine} />
        <div className={styles.titleContainer}>
          <div className={styles.titleInfo}>
            <span className={styles.sectionSubtitle}>Trending Stories</span>
            <h2 className={styles.mainTitle}>Popular Stories</h2>
          </div>
          <div className={styles.titleDecoration}>
            <div className={styles.gridIcon}>
              <div className={styles.gridSquare}></div>
              <div className={styles.gridSquare}></div>
              <div className={styles.gridSquare}></div>
              <div className={styles.gridSquare}></div>
            </div>
          </div>
        </div>
        <div className={styles.horizontalLine} />
      </div>

      {/* 2. Cards Section - Horizontal Sliding Carousel */}
      <section className={styles.popularStoriesSection}>
        <div className={styles.sliderContainer}>
          <div className={styles.sliderTrack} ref={sliderRef}>
            {/* Duplicate cards for seamless loop */}
            {[...displayPosts, ...displayPosts].map((post, index) => {
              const cardId = `${post._id || `card-${index % displayPosts.length}`}-${Math.floor(index / displayPosts.length)}`;
              const cleanVideoUrl = cleanUrl(post.videoUrl);
              const cleanBannerUrl = cleanUrl(post.bannerImageUrl);
              const videoId = getYouTubeVideoId(cleanVideoUrl);
              const isPlaying = playingVideoId === videoId;
              const isVideo = post.contentType === 'video' || !!cleanVideoUrl;
              
              return (
                <div key={cardId} className={styles.slideCard}>
                  <div className={styles.mediaCard}>
                    {/* Video/Image Section */}
                    <div className={styles.mediaWrapper}>
                      {isVideo && isPlaying && videoId ? (
                        <div className={styles.videoEmbed}>
                          <iframe
                            width="100%"
                            height="100%"
                            src={`https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0`}
                            frameBorder="0"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                            className={styles.videoIframe}
                          />
                        </div>
                      ) : cleanBannerUrl ? (
                        <div className={styles.imageWrapper}>
                          <Image
                            src={cleanBannerUrl}
                            alt={post.title || "Story"}
                            fill
                            className={styles.mediaImage}
                            style={{ objectFit: 'cover' }}
                            unoptimized={cleanBannerUrl?.startsWith('http://') || cleanBannerUrl?.startsWith('https://')}
                            priority={index < 3}
                            quality={85}
                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                            loading={index < 3 ? "eager" : "lazy"}
                          />
                          {isVideo && videoId && (
                            <button
                              onClick={() => handleVideoPlay(cleanVideoUrl)}
                              className={styles.playButton}
                              aria-label="Play video"
                            >
                              <i className="fas fa-play" />
                            </button>
                          )}
                          {isVideo && (
                            <div className={styles.videoBadge}>
                              <i className="fas fa-video" /> Video
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className={styles.placeholderMedia}>
                          <i className="fas fa-image" />
                        </div>
                      )}
                    </div>

                    {/* Content Overlay */}
                    <div className={styles.cardOverlay}>
                      <div className={styles.cardContent}>
                        <div className={styles.badgeWrapper}>
                          <span className={styles.categoryBadge}>
                            {typeof post.category === 'object' && post.category?.name 
                              ? post.category.name 
                              : typeof post.categoryId === 'object' && post.categoryId?.name
                              ? post.categoryId.name
                              : typeof post.category === 'string'
                              ? post.category
                              : "Trending"}
                          </span>
                        </div>
                        <h3 className={styles.cardTitle}>
                          {post.title || "Popular Story"}
                        </h3>
                        <p className={styles.cardExcerpt}>
                          {post.excerpt || (post.content 
                            ? post.content.length > 120
                              ? post.content.substring(0, 120) + "..."
                              : post.content
                            : "Discover the latest insights and trending topics.")}
                        </p>
                        <div className={styles.cardMeta}>
                          <span className={styles.author}>
                            <i className="far fa-user" /> {post.authorFirstName || 'Editor'}
                          </span>
                          <span className={styles.date}>
                            <i className="far fa-calendar-alt" /> {isMounted && (post.createdAt || post.publishDate)
                              ? formatDate(post.createdAt || post.publishDate)
                              : ''}
                          </span>
                        </div>
                        <Link href={getBlogPostUrl(post)} className={styles.readMoreBtn}>
                          Read More <i className="fas fa-arrow-right" />
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
}
