import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import styles from './ModernHero.module.css';

// Realistic Windows 11 "Bloom" Style Wave Animation
function WindowsBloom({ className }) {
  const canvasRef = useRef(null);
  const animationFrameRef = useRef(null);
  const timeRef = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    
    // Wave sheet configuration for Windows 11 look
    const sheets = [
      { color: 'rgba(59, 130, 246, 0.6)', speed: 0.005, amplitude: 100, frequency: 0.002, offset: 0 },
      { color: 'rgba(37, 99, 235, 0.5)', speed: 0.007, amplitude: 120, frequency: 0.0015, offset: Math.PI / 3 },
      { color: 'rgba(96, 165, 250, 0.45)', speed: 0.004, amplitude: 80, frequency: 0.0025, offset: Math.PI / 1.5 },
      { color: 'rgba(29, 78, 216, 0.4)', speed: 0.006, amplitude: 140, frequency: 0.001, offset: Math.PI },
      { color: 'rgba(147, 197, 253, 0.35)', speed: 0.003, amplitude: 110, frequency: 0.002, offset: Math.PI * 1.5 }
    ];

    const animate = () => {
      timeRef.current += 1;
      
      // Background base
      ctx.fillStyle = '#020617';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const width = canvas.width;
      const height = canvas.height;

      // Draw each "sheet"
      sheets.forEach((sheet, index) => {
        ctx.save();
        ctx.beginPath();
        
        // Use multiple curves to create a "sheet" effect
        const t = timeRef.current * sheet.speed;
        
        ctx.moveTo(-100, height + 100);
        
        for (let x = -100; x <= width + 100; x += 5) {
          const y = height * 0.45 + 
            Math.sin(x * sheet.frequency + t + sheet.offset) * sheet.amplitude +
            Math.cos(x * sheet.frequency * 0.4 + t * 0.5) * (sheet.amplitude * 0.5) +
            Math.sin(x * 0.005 + t * 0.3) * 20; // Extra detail wave
          
          ctx.lineTo(x, y);
        }
        
        ctx.lineTo(width + 100, height + 100);
        ctx.closePath();

        // Create complex gradient for the sheet
        const grad = ctx.createLinearGradient(0, height * 0.2, width * 0.3, height);
        grad.addColorStop(0, sheet.color);
        grad.addColorStop(0.5, sheet.color.replace('0.', '0.15'));
        grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
        
        ctx.fillStyle = grad;
        ctx.fill();
        
        // Add a highlight edge to the sheet (thinner and more translucent)
        ctx.strokeStyle = sheet.color.replace('0.', '0.8');
        ctx.lineWidth = 1.8;
        ctx.stroke();
        
        ctx.restore();
      });

      // Add central glow matching Windows 11 style
      const glow = ctx.createRadialGradient(width * 0.5, height * 0.5, 0, width * 0.5, height * 0.5, width * 0.9);
      glow.addColorStop(0, 'rgba(59, 130, 246, 0.2)');
      glow.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = glow;
      ctx.fillRect(0, 0, width, height);

      animationFrameRef.current = requestAnimationFrame(animate);
    };

    const resizeCanvas = () => {
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width;
      canvas.height = rect.height;
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    animate();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className={className}
    />
  );
}

// Animated Counter Component
function AnimatedCounter({ end, suffix = '', duration = 2000 }) {
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
          // Extract numeric value, handling +Mil format
          let endValue = typeof end === 'string' 
            ? parseFloat(end.replace(/[^0-9.]/g, '')) 
            : end;
          // If it's 5+Mil, use 5 as the end value
          if (typeof end === 'string' && (end.includes('+Mil') || end === '5+Mil')) {
            endValue = 5;
          }

          const animate = () => {
            const now = Date.now();
            const progress = Math.min((now - startTime) / duration, 1);
            const easeOutQuad = progress * (2 - progress);
            const currentCount = easeOutQuad * (endValue - startValue) + startValue;
            
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

  // Check for +Mil first (before checking for Min to avoid conflicts)
  let displayValue;
  if (typeof end === 'string') {
    if (end.includes('+Mil')) {
      displayValue = `${Math.floor(count)}+Mil`;
    } else if (end.includes('Mil') && !end.includes('Min')) {
      displayValue = `${Math.floor(count)}Mil`;
    } else if (end.includes('+') && !end.includes('Mil')) {
      displayValue = `${Math.floor(count)}+`;
    } else if (end.includes('Min') && !end.includes('Mil')) {
      displayValue = `${Math.floor(count)}Min`;
    } else {
      displayValue = Math.floor(count);
    }
  } else {
    displayValue = Math.floor(count);
  }

  return <span ref={countRef}>{displayValue}{suffix}</span>;
}

export default function ModernHero({ videoUrl, stats }) {
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
      title: 'Tech Innovation Summit 2024',
      description: 'Join industry leaders for the biggest tech event of the year',
      image: '/assets/img/HeroEvent/1.png',
      type: 'image',
      date: 'March 15, 2024',
      location: 'San Francisco, CA'
    },
    
    {
      id: 3,  
      title: 'Startup Pitch Competition',
      description: 'Watch emerging startups present their groundbreaking ideas',
      image: '/assets/img/HeroEvent/3.png',
      type: 'image',
      date: 'May 10, 2024',
      location: 'Austin, TX'
    },
    {
      id: 4,
      title: 'AI & Machine Learning Workshop',
      description: 'Hands-on workshop on cutting-edge AI technologies',
      image: '/assets/img/HeroEvent/4.png',
      type: 'image',
      date: 'June 5, 2024',
      location: 'Seattle, WA'
    },
    {
      id: 5,
      title: 'Corporate Innovation Forum',
      description: 'Networking and collaboration for corporate innovators',
      image: '/assets/img/HeroEvent/5.png',
      type: 'image',
      date: 'July 18, 2024',
      location: 'Chicago, IL'
    },
    {
      id: 6,
      title: 'Global Business Summit',
      description: 'Connect with global business leaders and industry experts',
      image: '/assets/img/HeroEvent/6.png',
      type: 'image',
      date: 'August 12, 2024',
      location: 'London, UK'
    },
    {
      id: 7,
      title: 'Future of Work Conference',
      description: 'Exploring the evolving landscape of modern workplaces',
      image: '/assets/img/HeroEvent/7.png',
      type: 'image',
      date: 'September 8, 2024',
      location: 'Toronto, Canada'
    },
    {
      id: 8,
      title: 'Sustainability & ESG Forum',
      description: 'Building sustainable business practices for tomorrow',
      image: '/assets/img/HeroEvent/8.png',
      type: 'image',
      date: 'October 15, 2024',
      location: 'Berlin, Germany'
    },
    {
      id: 9,
      title: 'FinTech Revolution Summit',
      description: 'Discover the latest trends in financial technology',
      image: '/assets/img/HeroEvent/9.png',
      type: 'image',
      date: 'November 20, 2024',
      location: 'Singapore'
    },
    {
      id: 10,
      title: 'Healthcare Innovation Expo',
      description: 'Advancing healthcare through technology and innovation',
      image: '/assets/img/HeroEvent/10.png',
      type: 'image',
      date: 'December 5, 2024',
      location: 'Boston, MA'
    },
    {
      id: 11,
      title: 'E-Commerce & Retail Tech',
      description: 'Transforming retail with cutting-edge technology solutions',
      image: '/assets/img/HeroEvent/11.png',
      type: 'image',
      date: 'January 18, 2025',
      location: 'Los Angeles, CA'
    },
    {
      id: 12,
      title: 'Data & Analytics Conference',
      description: 'Harnessing the power of data for business growth',
      image: '/assets/img/HeroEvent/12.png',
      type: 'image',
      date: 'February 22, 2025',
      location: 'San Diego, CA'
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
          <div className={styles.purpleOverlay} />
          
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
              Feature in Corp Crunch is a great Honor. Drive engagement, boost
              reputation, and track measurable ROI.
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
                  <a
                    href={newsArticles[activeNewsIndex]?.url || '#'}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {newsArticles[activeNewsIndex]?.source && (
                      <span className={styles.newsSource}>
                        {newsArticles[activeNewsIndex].source}
                      </span>
                    )}
                    <span className={styles.newsTitle}>
                      {newsArticles[activeNewsIndex]?.title}
                    </span>
                  </a>
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
            {mockEvents.map((event, index) => (
              <div
                key={event.id}
                className={`${styles.eventSlide} ${
                  index === activeEventIndex ? styles.eventSlideActive : ''
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
                      priority={index === activeEventIndex}
                      quality={100}
                      loading={index === activeEventIndex ? "eager" : "lazy"}
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
            ))}
            
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
          </div>
        </div>
        {/* See Works Section */}
        <div className={styles.seeWorks}>
          <Link href="#works" className={styles.seeWorksLink}>
            <span>See <u>Works</u></span>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M8 4L8 12M4 8L12 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </Link>
        </div>

        {/* Social Media Icons */}
        <div className={styles.socialIcons}>
          <a href="#" className={styles.socialIcon} aria-label="Twitter">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
            </svg>
          </a>
          <a href="#" className={styles.socialIcon} aria-label="LinkedIn">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
            </svg>
          </a>
          <a href="#" className={styles.socialIcon} aria-label="Instagram">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
            </svg>
          </a>
        </div>
      </div>
    </section>
  );
}

