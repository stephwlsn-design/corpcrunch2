import { useState, useEffect } from 'react';
import Image from 'next/image';
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import styles from './ModernHero.module.css';
import { useAuth } from '@/contexts/AuthContext';
import { HOMEPAGE_H1 } from '@/lib/seoHelpers';

export default function ModernHero({ videoUrl, stats }) {
  const { requireAuth } = useAuth();
  const [currentTime, setCurrentTime] = useState('');
  const [newsArticles, setNewsArticles] = useState([]);
  const [newsLoading, setNewsLoading] = useState(true);
  const [newsError, setNewsError] = useState(null);
  const [activeNewsIndex, setActiveNewsIndex] = useState(0);
  const [activeEventIndex, setActiveEventIndex] = useState(0);

  // Events data using HeroEvent folder images
  const mockEvents = [
    {
      id: 1,
      title: 'AIX NOW: Adoption, Readiness & Real-World Impact',
     
      image: '/assets/img/HeroEvent/1.png',
      type: 'image',
      date: '12-14 October 2026',
      location: 'UAE'
    },
    
    {
      id: 3,  
      title: 'AI FUTURES: Convergence, Collaboration & Industry 5.0',
     
      image: '/assets/img/HeroEvent/3.png',
      type: 'image',
      date: 'To be announced',
      location: 'UAE'
    },
    {
      id: 4,
      title: 'AI FUTURES: Convergence, Collaboration & Industry 5.0',
     
      image: '/assets/img/HeroEvent/4.png',
      type: 'image',
      date: 'To be announced',
      location: 'UAE'
    },
    {
      id: 5,
      title: 'AIX NOW: Adoption, Readiness & Real-World Impact',
    
      image: '/assets/img/HeroEvent/5.png',
      type: 'image',
      date: '12-14 October 2026',
      location: 'UAE'
    },
    {
      id: 6,
      title: 'AI FUTURES: Convergence, Collaboration & Industry 5.0',
    
      image: '/assets/img/HeroEvent/6.png',
      type: 'image',
      date: 'To be announced',
      location: 'UAE'
    },
    {
      id: 7,
      title: 'AI FUTURES: Convergence, Collaboration & Industry 5.0',
     
      image: '/assets/img/HeroEvent/7.png',
      type: 'image',
      date: 'To be announced',
      location: 'UAE'
    },
    {
      id: 8,
      title: 'C3 AIX Summit: The Future of AI in the UAE',
    
      image: '/assets/img/HeroEvent/8.png',
      type: 'image',
      date: '12-14 October 2026',
      location: 'UAE'
    },
    {
      id: 9,
      title: 'AI FUTURES: Convergence, Collaboration & Industry 5.0',
      
      image: '/assets/img/HeroEvent/9.png',
      type: 'image',
      date: 'To be announced',
      location: 'UAE'
    },
    {
      id: 10,
      title: 'AI FUTURES: Convergence, Collaboration & Industry 5.0',
      
      image: '/assets/img/HeroEvent/10.png',
      type: 'image',
      date: 'To be announced',
      location: 'UAE'
    },
    {
      id: 11,
      title: 'AIX NOW: Adoption, Readiness & Real-World Impact',
      
      image: '/assets/img/HeroEvent/11.png',
      type: 'image',
      date: '12-14 October 2026',
      location: 'UAE'
    },
    {
      id: 12,
      title: 'AI FUTURES: Convergence, Collaboration & Industry 5.0',
      
      image: '/assets/img/HeroEvent/12.png',
      type: 'image',
      date: 'To be announced',
      location: 'UAE'
    }
  ];

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const gmt6Time = new Date(now.getTime() + (6 * 60 * 60 * 1000));
      const hours = gmt6Time.getUTCHours();
      const minutes = gmt6Time.getUTCMinutes();
      const ampm = hours >= 12 ? 'PM' : 'AM';
      const displayHours = hours % 12 || 12;
      const displayMinutes = minutes.toString().padStart(2, '0');
      setCurrentTime(`(GMT+6) ${displayHours}:${displayMinutes} ${ampm}`);
    };

    updateTime();
    const interval = setInterval(updateTime, 60000);
    return () => clearInterval(interval);
  }, []);

  // Fetch latest stories from Google News API (via our backend proxy)
  useEffect(() => {
    let isMounted = true;

    const fetchNews = async () => {
      try {
        setNewsLoading(true);
        setNewsError(null);

        const res = await fetch('/api/google-news');
        if (!res.ok) {
          throw new Error('Failed to load news');
        }

        const data = await res.json();
        if (!isMounted) return;

        const articles = Array.isArray(data.articles) ? data.articles : [];
        setNewsArticles(articles.slice(0, 10));

        // Reset slider index when new data arrives
        setActiveNewsIndex(0);
      } catch (err) {
        if (!isMounted) return;
        console.error('[ModernHero] Error fetching Google News:', err);
        setNewsError('Unable to load latest stories right now.');
      } finally {
        if (isMounted) {
          setNewsLoading(false);
        }
      }
    };

    fetchNews();

    return () => {
      isMounted = false;
    };
  }, []);

  // Auto-advance the news slider every few seconds
  useEffect(() => {
    if (!newsArticles || newsArticles.length === 0) return;

    const interval = setInterval(() => {
      setActiveNewsIndex((prev) => (prev + 1) % newsArticles.length);
    }, 6000);

    return () => clearInterval(interval);
  }, [newsArticles]);

  // Auto-advance the events slider every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveEventIndex((prev) => (prev + 1) % mockEvents.length);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const defaultStats = {
    stories: '2000+',
    industries: '150+',
    visitors: '5+Mil',
  };

  const displayStats = stats || defaultStats;

  return (
    <section className={styles.modernHero}>
      {/* Left Side - Two Gradient Sections */}
      <div className={styles.heroLeft}>
        {/* Top Left - GIF Background Section */}
        <div className={styles.purpleSection}>
          <img
            src="/assets/video/cc-hero-banner-anim.webp"
            alt=""
            width={1260}
            height={360}
            decoding="async"
            fetchpriority="high"
            className={styles.heroBannerMedia}
          />
          <div className={styles.purpleOverlay} />

          <h1 className={styles.siteH1}>{HOMEPAGE_H1}</h1>
          
          {/* Stats row */}
          <div className={styles.statsRow}>
            <div className={styles.statItem}>
              <div className={styles.statNumber}>
                2000+
              </div>
              <div className={styles.statLabel}>STORIES PUBLISHED</div>
            </div>
            <div className={styles.statItem}>
              <div className={styles.statNumber}>
                150+
              </div>
              <div className={styles.statLabel}>INDUSTRIES SERVED</div>
            </div>
            <div className={styles.statItem}>
              <div className={styles.statNumber}>
                5+Mil
              </div>
              <div className={styles.statLabel}>AVG VISITORS</div>
            </div>
          </div>

          {/* Center vertical divider */}
          <div className={styles.verticalDivider} />

          {/* Bottom Message Text */}
          <div className={styles.messageBox}>
            <p>
            To be featured in Corp Crunch is a great honor. Drive engagement, boost reputation, and track measurable ROI.
            </p>
          </div>

          {/* Bottom horizontal divider between top & bottom sections */}
          <div className={styles.horizontalDivider} />
        </div>

        {/* Bottom Left - Full News Slider Section */}
        <div className={styles.pinkGreenSection}>
          <div className={styles.newsTicker}>
            {newsLoading ? (
              <div className={styles.newsStatus}>
                <Skeleton width={200} height={20} baseColor="rgba(255,255,255,0.1)" highlightColor="rgba(255,255,255,0.2)" />
              </div>
            ) : newsError && !newsLoading ? (
              <div className={`${styles.newsStatus} ${styles.newsError}`}>
                <span>Unable to load Google News right now. Please try again later.</span>
              </div>
            ) : newsArticles.length > 0 && (
              <>
                <div className={styles.newsSlide}>
                  
                    {newsArticles[activeNewsIndex]?.source && (
                      <span className={styles.newsSource}>
                        {newsArticles[activeNewsIndex].source}
                      </span>
                    )}
                    <span className={styles.newsTitle}>
                      {newsArticles[activeNewsIndex]?.title}
                    </span>
                  
                </div>

                <div className={styles.newsDots}>
                  {newsArticles.map((_, index) => (
                    <button
                      key={index}
                      type="button"
                      className={`${styles.newsDot} ${
                        index === activeNewsIndex ? styles.newsDotActive : ''
                      }`}
                      onClick={() => setActiveNewsIndex(index)}
                      aria-label={`Show story ${index + 1}`}
                    />
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Right Side - Light Gray Panel */}
      <div className={styles.heroRight}>
        {/* Time Display */}
        

        {/* Latest Events Slider */}
        <div className={styles.videoContainer}>
          <div className={styles.eventsSlider}>
            <a 
              href="/events"
              onClick={(e) => {
                if (!requireAuth('/events')) {
                  e.preventDefault();
                }
              }}
            >
            {mockEvents.map((event, index) => {
              const isActive = index === activeEventIndex;
              const isAdjacent =
                index === (activeEventIndex + 1) % mockEvents.length;
              if (!isActive && !isAdjacent) return null;
              return (
              <div
                key={event.id}
                className={`${styles.eventSlide} ${
                  isActive ? styles.eventSlideActive : ''
                }`}
              >
                <div className={styles.eventImageWrapper}>
                  {event.type === 'video' ? (
                    <video
                      className={styles.eventMedia}
                      autoPlay
                      loop
                      muted
                      playsInline
                    >
                      <source src={event.image} type="video/mp4" />
                    </video>
                  ) : (
                    <Image
                      src={event.image}
                      alt={event.title}
                      fill
                      className={styles.eventMedia}
                      priority={isActive}
                      quality={70}
                      loading={isActive ? "eager" : "lazy"}
                      sizes="(max-width: 768px) 100vw, 50vw"
                    />
                  )}
                  <div className={styles.eventOverlay} />
                </div>
                <div className={styles.eventContent}>
                  <div className={styles.eventMeta}>
                    <span className={styles.eventDate}>{event.date}</span>
                    <span className={styles.eventLocation}>{event.location}</span>
                  </div>
                  <h3 className={styles.eventTitle}>{event.title}</h3>
                  <p className={styles.eventDescription}>{event.description}</p>
                </div>
              </div>
            );
            })}
            
            {/* Event Navigation Dots */}
            <div className={styles.eventDots}>
              {mockEvents.map((_, index) => (
                <button
                  key={index}
                  type="button"
                  className={`${styles.eventDot} ${
                    index === activeEventIndex ? styles.eventDotActive : ''
                  }`}
                  onClick={() => setActiveEventIndex(index)}
                  aria-label={`Show event ${index + 1}`}
                />
              ))}
            </div>
            </a>
          </div>
        </div>
        

        
      </div>
    </section>
  );
}

