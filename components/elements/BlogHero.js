import React from 'react';
import Image from 'next/image';
import styles from './BlogHero.module.css';

export default function BlogHero({ 
  title = "Smart Digital Marketing that turns strategy into growth.",
  highlightText = "Digital Marketing",
  subtitle = "We combine strategy, creativity, and performance marketing to help digital brands grow, compete, and scale with confidence.",
  mediaUrl = "/assets/img/blog/blog01.jpg",
  mediaType = "image", // "image" or "video"
  journalistImage = "/assets/img/others/about_me.png",
  journalistName = "Aditya Telsinge",
  publishedDate = null,
}) {
  // Extract YouTube video ID from URL
  const getYouTubeEmbedUrl = (url) => {
    if (!url) return null;
    
    // Check if it's already an embed URL
    if (url.includes('youtube.com/embed/')) {
      return url;
    }
    
    // Extract video ID from various YouTube URL formats
    let videoId = null;
    
    // Format: https://www.youtube.com/watch?v=VIDEO_ID
    if (url.includes('youtube.com/watch?v=')) {
      videoId = url.split('v=')[1]?.split('&')[0];
    }
    // Format: https://youtu.be/VIDEO_ID
    else if (url.includes('youtu.be/')) {
      videoId = url.split('youtu.be/')[1]?.split('?')[0];
    }
    // Format: https://www.youtube.com/embed/VIDEO_ID
    else if (url.includes('youtube.com/embed/')) {
      return url;
    }
    
    return videoId ? `https://www.youtube.com/embed/${videoId}` : null;
  };

  const renderTitle = () => {
    if (!highlightText || !title.includes(highlightText)) {
      return <h1 className={styles.title}>{title}</h1>;
    }
    const parts = title.split(highlightText);
    return (
      <h1 className={styles.title}>
        {parts[0]}
        <span className={styles.highlightText}>{highlightText}</span>
        {parts[1]}
      </h1>
    );
  };

  // Check if it's a YouTube URL
  const isYouTubeUrl = mediaUrl && (
    mediaUrl.includes('youtube.com') || 
    mediaUrl.includes('youtu.be')
  );
  
  const embedUrl = isYouTubeUrl ? getYouTubeEmbedUrl(mediaUrl) : null;

  return (
    <section className={styles.blogHero}>
      {/* Background with Grid */}
      <div className={styles.gradientBg}></div>
      <div className={styles.gridOverlay}></div>

      <div className={styles.contentWrapper}>
        {/* Title and Subtitle */}
        {renderTitle()}
        <p className={styles.subtitle}>
          {subtitle}{' '}
          <a 
            href="#blog-main-content" 
            className={styles.readMoreLink}
            onClick={(e) => {
              e.preventDefault();
              const element = document.getElementById('blog-main-content');
              if (element) {
                element.scrollIntoView({ behavior: 'smooth', block: 'start' });
              }
            }}
          >
            read more
          </a>
        </p>

        {/* Rectangular Media Card */}
        <div className={styles.mediaCard}>
          <div className={styles.mediaInner}>
            {mediaType === "video" && mediaUrl ? (
              isYouTubeUrl && embedUrl ? (
                <iframe
                  className={styles.mediaImage}
                  src={embedUrl}
                  title="YouTube video player"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                  style={{ width: '100%', height: '100%', borderRadius: '30px' }}
                />
              ) : (
                <video
                  className={styles.mediaImage}
                  src={mediaUrl}
                  controls
                  controlsList="nodownload"
                  playsInline
                  preload="metadata"
                />
              )
            ) : (
              <Image 
                src={mediaUrl} 
                alt="Hero Media" 
                fill 
                className={styles.mediaImage}
                priority
              />
            )}
          </div>
        </div>
      </div>

      {/* Bottom Floating Elements */}
      <div className={styles.bottomSection}>
        {/* Consultation Box - Left */}
        <div className={styles.consultationBox}>
          <div className={styles.avatarWrapper}>
            <Image 
              src={journalistImage} 
              alt="Consultant" 
              width={44} 
              height={44} 
              className={styles.avatar}
            />
            <div className={styles.statusDot}></div>
          </div>
          <div className={styles.consultationText}>
            <span className={styles.journalistName}>{journalistName}</span>
          </div>
        </div>

        {/* Published Date - Right */}
        {publishedDate && (
          <div className={styles.publishedDateBox}>
            <i className="fas fa-calendar-alt"></i>
            <span className={styles.publishedDate}>{publishedDate}</span>
          </div>
        )}
      </div>
    </section>
  );
}
