import Link from "next/link";
import Image from "next/image";
import { formatDate } from "@/util";
import { useState, useEffect, useRef } from "react";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import { useLanguage } from "@/contexts/LanguageContext";
import { getBlogPostUrl } from "@/util/urlHelpers";
import styles from "./RecentVideoPosts.module.css";

export default function RecentVideoPosts({ posts = [], isLoading = false }) {
  const { t } = useLanguage();
  const [playingVideoId, setPlayingVideoId] = useState(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [isInitialized, setIsInitialized] = useState(false);
  const sectionRef = useRef(null);

  // Helper: validate that an image URL is from an allowed/known-safe host AND is actually an image
  const isSafeImageUrl = (url) => {
    if (!url || typeof url !== "string") return false;
    
    // Fix duplicated URLs (if URL appears twice, take first part)
    let cleanUrl = url.trim();
    if (cleanUrl.length > 200) {
      // Likely duplicated, try to extract the first valid URL
      const urlMatch = cleanUrl.match(/^(https?:\/\/[^\s]+)/);
      if (urlMatch) {
        cleanUrl = urlMatch[1];
      }
    }
    
    // Check if it's actually an image file (not video, HTML, etc.)
    const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg', '.avif', '.bmp'];
    const videoExtensions = ['.mp4', '.webm', '.ogg', '.mov', '.avi'];
    const htmlExtensions = ['.html', '.htm'];
    
    const lowerUrl = cleanUrl.toLowerCase();
    const hasImageExt = imageExtensions.some(ext => lowerUrl.includes(ext));
    const hasVideoExt = videoExtensions.some(ext => lowerUrl.includes(ext));
    const hasHtmlExt = htmlExtensions.some(ext => lowerUrl.endsWith(ext) || lowerUrl.includes(ext + '?') || lowerUrl.includes(ext + '#'));
    
    // Reject video URLs and HTML pages
    if (hasVideoExt || hasHtmlExt) {
      return false;
    }
    
    // If it has an image extension, check hostname
    if (hasImageExt) {
      try {
        const parsed = new URL(cleanUrl);
        const allowedHosts = [
          "recroot-next.vercel.app",
          "recroot.ai",
          "www.recroot.ai",
          "images.unsplash.com",
          "image.cnbcfm.com",
          "www.autonews.com",
          "autonews.com",
          "img.youtube.com", // YouTube thumbnails
          "corpcrunch.io",
          "www.corpcrunch.io",
          "prowess.corpcrunch.io",
        ];
        return allowedHosts.includes(parsed.hostname);
      } catch {
        return false;
      }
    }
    
    // If no extension, check if hostname is in allowed list (might be an image API endpoint)
    try {
      const parsed = new URL(cleanUrl);
      const allowedHosts = [
        "recroot-next.vercel.app",
        "recroot.ai",
        "www.recroot.ai",
        "images.unsplash.com",
        "image.cnbcfm.com",
        "www.autonews.com",
        "autonews.com",
        "corpcrunch.io",
        "www.corpcrunch.io",
        "prowess.corpcrunch.io",
      ];
      // Only allow if hostname is in list AND doesn't look like a video/HTML page
      if (allowedHosts.includes(parsed.hostname)) {
        // Additional check: reject if path suggests it's not an image
        const path = parsed.pathname.toLowerCase();
        if (path.includes('/video/') || path.includes('/article/') || path.endsWith('.html') || path.endsWith('.htm')) {
          return false;
        }
        return true;
      }
    } catch {
      return false;
    }
    
    return false;
  };

  // Filter ONLY video posts - strictly videos, no articles or news
  // Check multiple possible field names and formats
  // If posts array is already filtered (videoPosts from server), trust it
  // Otherwise, filter to ensure only videos
  const videoPosts = posts.filter(post => {
    if (!post) return false;
    
    // Check contentType
    if (post.contentType === 'video') return true;
    
    // Check videoUrl (various formats)
    const hasVideoUrl = post.videoUrl && 
      (typeof post.videoUrl === 'string' && post.videoUrl.trim() !== '');
    if (hasVideoUrl) return true;
    
    // Check video_url (alternative field name)
    const hasVideo_url = post.video_url && 
      (typeof post.video_url === 'string' && post.video_url.trim() !== '');
    if (hasVideo_url) return true;
    
    return false;
  });

  // Initialize - ensure first video is immediately visible
  useEffect(() => {
    if (!isInitialized && videoPosts.length > 0) {
      setActiveIndex(0);
      setIsInitialized(true);
    }
  }, [videoPosts.length, isInitialized]);

  // Debug logging - help diagnose why videos aren't showing
  useEffect(() => {
    if (posts.length > 0 && videoPosts.length === 0) {
      console.warn('[RecentVideoPosts] ⚠️ Received posts but none are videos:', {
        postsCount: posts.length,
        samplePost: posts[0] ? {
          id: posts[0]._id,
          title: posts[0].title,
          contentType: posts[0].contentType,
          videoUrl: posts[0].videoUrl,
          video_url: posts[0].video_url,
          allKeys: Object.keys(posts[0])
        } : null
      });
    } else {
      console.log('[RecentVideoPosts] ✓ Video posts found:', {
        postsCount: posts.length,
        videoPostsCount: videoPosts.length,
        sectionsCount: videoPosts.slice(0, 5).length,
        activeIndex: activeIndex
      });
    }
  }, [posts, videoPosts, isLoading, activeIndex]);
  
  // Use ONLY video posts - no articles or news allowed - show all videos
  const sections = videoPosts;

  // Extract YouTube video ID from URL
  // Extract YouTube video ID from URL
  const getYouTubeVideoId = (url) => {
    if (!url) return null;
    const patterns = [
      /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
      /youtube\.com\/.*[?&]v=([^&\n?#]+)/,
    ];
    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match) return match[1];
    }
    return null;
  };

  const handleVideoPlay = (videoUrl) => {
    const videoId = getYouTubeVideoId(videoUrl);
    if (videoId) {
      setPlayingVideoId(playingVideoId === videoId ? null : videoId);
    }
  };

  // Scroll-based animation for sticky sections
  useEffect(() => {
    if (!sectionRef.current || sections.length === 0) return;
    
    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          // Double-check ref is still valid inside requestAnimationFrame
          if (!sectionRef.current || sections.length === 0) {
            ticking = false;
            return;
          }
          
          const rect = sectionRef.current.getBoundingClientRect();
          const windowHeight = window.innerHeight;
          const totalHeight = sectionRef.current.offsetHeight;
          
          // Calculate scroll progress (0 to sections.length - 1)
          // Each section should be active for 1 viewport height
          const scrollDistance = totalHeight - windowHeight;
          
          if (scrollDistance > 0) {
            // Calculate which section should be active based on scroll position
            // Progress from 0 to sections.length - 1
            const progress = Math.max(0, Math.min(sections.length - 1, -rect.top / windowHeight));
            setScrollProgress(progress);
            
            // Set active index based on scroll progress
            const newActiveIndex = Math.floor(progress);
            if (newActiveIndex >= 0 && newActiveIndex < sections.length) {
              setActiveIndex(prevIndex => {
                if (prevIndex !== newActiveIndex) {
                  return newActiveIndex;
                }
                return prevIndex;
              });
            }
          } else {
            setScrollProgress(0);
            setActiveIndex(0);
          }
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", handleScroll, { passive: true });
    // Initial calculation
    const timer = setTimeout(handleScroll, 100);

    return () => {
      clearTimeout(timer);
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleScroll);
    };
  }, [sections.length]);

  // If no video posts available, don't render the section (AFTER all hooks)
  if (!isLoading && sections.length === 0) {
    return null;
  }

  if (isLoading) {
    return (
      <section className={styles.videoPostsSection}>
        <div className={styles.stickySection} style={{ height: '80vh' }}>
          <div className={styles.container}>
            <div className={styles.contentWrapper}>
              <div className={styles.videoStackContainer}>
                <Skeleton height={400} borderRadius={20} />
              </div>
              <div className={styles.contentSection}>
                <Skeleton width={100} height={20} />
                <Skeleton width="80%" height={40} className="my-3" />
                <Skeleton width="100%" height={20} count={3} />
                <Skeleton width={120} height={40} borderRadius={20} className="mt-4" />
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  // Helper: Clean and normalize URLs (fix duplicates, trim, etc.)
  const cleanUrl = (url) => {
    if (!url || typeof url !== "string") return null;
    let cleaned = url.trim();
    
    // Fix duplicated URLs (if URL appears twice)
    if (cleaned.length > 200) {
      const urlMatch = cleaned.match(/^(https?:\/\/[^\s]+)/);
      if (urlMatch) {
        cleaned = urlMatch[1];
      }
    }
    
    // Remove trailing duplicates
    const halfLength = Math.floor(cleaned.length / 2);
    if (halfLength > 0 && cleaned.substring(0, halfLength) === cleaned.substring(halfLength, halfLength * 2)) {
      cleaned = cleaned.substring(0, halfLength);
    }
    
    return cleaned;
  };


  // Render section content (reusable)
  const renderSectionContent = (sectionPost, sectionIndex) => {
    // Clean URLs to prevent duplication issues
    // Check both videoUrl and video_url field names
    const videoUrlSource = sectionPost.videoUrl || sectionPost.video_url || '';
    const cleanVideoUrl = cleanUrl(videoUrlSource);
    const cleanBannerUrl = cleanUrl(sectionPost.bannerImageUrl);
    
    const videoId = getYouTubeVideoId(cleanVideoUrl);
    const isPlaying = playingVideoId === videoId;

    return (
      <div className={styles.container}>
        <div className={styles.articleBorderWrapper}>
          <div className={styles.contentWrapper}>
            {/* Left Side - Video */}
            <div className={`${styles.videoStackContainer} ${activeIndex === sectionIndex ? styles.active : ""}`}>
              <div className={styles.videoCardWrapper}>
              <div className={styles.videoCard}>
                {isPlaying && videoId ? (
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
                ) : (cleanBannerUrl && isSafeImageUrl(cleanBannerUrl)) ? (
                  <div className={styles.videoWrapper}>
                    <Image
                      src={cleanBannerUrl}
                      alt={sectionPost.title || "Video"}
                      fill
                      className={styles.videoImage}
                      style={{ objectFit: "cover" }}
                      unoptimized
                    />
                    {videoId && (
                      <button
                        onClick={() => handleVideoPlay(cleanVideoUrl)}
                        className={styles.playButton}
                        aria-label="Play video"
                      >
                        <i className="fas fa-play" />
                      </button>
                    )}
                  </div>
                ) : videoId ? (
                  <div className={styles.videoWrapper}>
                    <img
                      src={`https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`}
                      alt={sectionPost.title || "Video"}
                      className={styles.videoImage}
                      style={{ width: "100%", height: "100%", objectFit: "cover" }}
                      onError={(e) => {
                        // Fallback to hqdefault if maxresdefault fails
                        e.currentTarget.src = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
                      }}
                    />
                    <button
                      onClick={() => handleVideoPlay(cleanVideoUrl)}
                      className={styles.playButton}
                      aria-label="Play video"
                    >
                      <i className="fas fa-play" />
                    </button>
                  </div>
                ) : (
                  <div className={styles.videoPlaceholder}>
                    <div className={styles.playIcon}>
                      <i className="fas fa-play" />
                    </div>
                    <p>Video Placeholder</p>
                  </div>
                )}
                </div>
              </div>
            </div>

            {/* Right Side - Content */}
            <div className={`${styles.contentSection} ${activeIndex === sectionIndex ? styles.active : ""}`}>
              <div className={styles.branding}>
                {sectionPost.Category?.name 
                  ? `* ${sectionPost.Category.name}`
                  : sectionPost.category?.name
                  ? `* ${sectionPost.category.name}`
                  : sectionPost.title?.split(" ")[0]
                  ? `* ${sectionPost.title.split(" ")[0]}`
                  : "* Video"}
              </div>
              <h2 className={styles.title}>
                {sectionPost.title || "Video Post"}
              </h2>
              <div className={styles.titleRow}>
                <p className={styles.subtitle}>
                  {sectionPost.excerpt ||
                    sectionPost.Category?.name ||
                    sectionPost.category?.name ||
                    (sectionPost.contentType === 'video' ? 'Video Content' : 'Featured Content')}
                </p>
                <div className={styles.yearBadge}>
                  {sectionPost.createdAt || sectionPost.publishDate
                    ? `/${new Date(sectionPost.createdAt || sectionPost.publishDate).getFullYear()}`
                    : '/2025'}
                </div>
              </div>
              <p className={styles.description}>
                {sectionPost.content
                  ? sectionPost.content.length > 200
                    ? sectionPost.content.substring(0, 200) + "..."
                    : sectionPost.content
                  : sectionPost.excerpt
                  ? sectionPost.excerpt.length > 200
                    ? sectionPost.excerpt.substring(0, 200) + "..."
                    : sectionPost.excerpt
                  : "Watch this engaging video content."}
              </p>

              <button
                className={styles.learnMoreBtn}
                onClick={() => {
                  if (sectionPost.slug) {
                    window.location.href = getBlogPostUrl(sectionPost);
                  }
                }}
              >
                Learn More <i className="fas fa-arrow-right" />
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Dynamic height based on number of videos
  // Each video gets 100vh, ensuring all videos have space to be visible
  return (
    <section 
      className={styles.videoPostsSection} 
      ref={sectionRef}
      style={{ 
        height: `${sections.length * 100}vh`,
        minHeight: `${Math.max(sections.length, 1) * 100}vh`
      }}
    >
      {sections.map((sectionPost, index) => {
        const isPast = activeIndex > index;
        const isActive = activeIndex === index;
        const isNext = activeIndex < index;
        
        // Calculate individual section progress for smooth transitions
        const sectionProgress = scrollProgress - index;
        
        // Dynamic visibility: Make all videos clearly visible based on distance from active
        // This works for ANY number of videos (2, 3, 4, 5, 10, etc.)
        const distanceFromActive = Math.abs(index - activeIndex);
        
        let sectionOpacity, sectionScale;
        
        if (isActive) {
          // Active video: 100% visible
          sectionOpacity = 1;
          sectionScale = 1;
        } else if (distanceFromActive === 1) {
          // Adjacent videos (next or previous): Make them highly visible (95%)
          sectionOpacity = 0.95;
          sectionScale = 0.97;
        } else if (distanceFromActive === 2) {
          // Videos 2 positions away: Still quite visible (85%)
          sectionOpacity = 0.85;
          sectionScale = 0.94;
        } else {
          // Videos further away: Visible but progressively more faded
          // Minimum 70% opacity to ensure all videos remain clearly visible
          sectionOpacity = Math.max(0.7, 0.85 - (distanceFromActive - 2) * 0.03);
          sectionScale = Math.max(0.92, 0.94 - (distanceFromActive - 2) * 0.005);
        }
        
        return (
          <div
            key={sectionPost._id || sectionPost.id || `section-${index}`}
            className={styles.stickySection}
            data-index={index}
            style={{
              zIndex: sections.length - Math.abs(index - activeIndex), // Higher z-index for videos closer to active
            }}
          >
            <div 
              className={styles.sectionInner}
              style={{
                transform: `scale(${sectionScale}) translateY(${
                  isPast 
                    ? `-${3 + distanceFromActive * 1.5}vh` 
                    : isNext 
                    ? `${3 + distanceFromActive * 1.5}vh` 
                    : '0'
                })`,
                opacity: sectionOpacity,
                transition: 'transform 0.7s cubic-bezier(0.22, 1, 0.36, 1), opacity 0.7s ease',
                pointerEvents: sectionOpacity > 0.3 ? 'auto' : 'none',
                zIndex: sections.length - distanceFromActive
              }}
            >
              {renderSectionContent(sectionPost, index)}
            </div>
          </div>
        );
      })}
    </section>
  );
}
