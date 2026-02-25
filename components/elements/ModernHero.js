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
            <a href="/events">
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
            </a>
          </div>
        </div>
        

        
      </div>
    </section>
  );
}

