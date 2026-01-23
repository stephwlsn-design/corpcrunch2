import Layout from "@/components/layout/Layout";
import { getCategories } from "@/lib/categoryService";
import Head from "next/head";
import Link from "next/link";
import { formatDate } from "@/util";
import Image from "next/image";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, EffectFade, Pagination } from "swiper";
import { useState, useEffect } from "react";
import "swiper/css";
import "swiper/css/effect-fade";
import "swiper/css/pagination";
import styles from "@/components/events/EventsPage.module.css";
import SocialShareRibbon from "@/components/elements/SocialShareRibbon";

export default function EventsPage({ events, eventsPosts, categories = [] }) {
  const allEvents = events || [];
  const [animatedMetrics, setAnimatedMetrics] = useState({
    total: 0,
    views: 0,
    upcoming: 0
  });

  // Separate events by status
  const upcomingEvents = allEvents.filter(e => e.status === 'upcoming');
  const ongoingEvents = allEvents.filter(e => e.status === 'ongoing');
  const pastEvents = allEvents.filter(e => e.status === 'past');

  // Featured events for hero slider
  const featuredEvents = allEvents.filter(e => e.featured).slice(0, 5);
  const heroEvents = featuredEvents.length > 0 ? featuredEvents : upcomingEvents.slice(0, 5);

  // Metrics calculation
  const totalEvents = allEvents.length;
  const totalViews = allEvents.reduce((sum, e) => sum + (e.viewsCount || 0), 0);
  const upcomingCount = upcomingEvents.length;

  // Animate metrics on mount
  useEffect(() => {
    const duration = 2000;
    const steps = 60;
    const stepDuration = duration / steps;
    
    let currentStep = 0;
    const timer = setInterval(() => {
      currentStep++;
      const progress = currentStep / steps;
      
      setAnimatedMetrics({
        total: Math.floor(totalEvents * progress),
        views: Math.floor(totalViews * progress),
        upcoming: Math.floor(upcomingCount * progress)
      });
      
      if (currentStep >= steps) {
        clearInterval(timer);
        setAnimatedMetrics({
          total: totalEvents,
          views: totalViews,
          upcoming: upcomingCount
        });
      }
    }, stepDuration);
    
    return () => clearInterval(timer);
  }, [totalEvents, totalViews, upcomingCount]);

  // Get excerpt from content
  const getExcerpt = (content, maxLength = 150) => {
    if (!content) return "";
    const text = content.replace(/[#*\[\]()]/g, "").replace(/\n/g, " ");
    return text.length > maxLength ? text.substring(0, maxLength) + "..." : text;
  };

  // Format event date
  const formatEventDate = (dateString) => {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric',
        year: 'numeric'
      });
    } catch {
      return dateString;
    }
  };

  const EventCard = ({ event, variant = "upcoming" }) => {
    const badgeText = {
      upcoming: "Upcoming",
      ongoing: "Live Now",
      past: "Past Event"
    };

    const badgeClass = {
      upcoming: styles.badgeUpcoming,
      ongoing: styles.badgeOngoing,
      past: styles.badgePast
    };

    return (
      <Link href={`/events/${event.slug || event._id || event.id}`} scroll={true}>
        <div className={styles.eventCard}>
          {event.image && (
            <div className={styles.eventImageWrapper}>
              <Image
                src={event.image}
                alt={event.title || "Event"}
                width={400}
                height={240}
                quality={85}
                loading="lazy"
                className={styles.eventImage}
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                }}
              />
              <div className={`${styles.eventBadge} ${badgeClass[variant]}`}>
                {badgeText[variant]}
              </div>
            </div>
          )}
          
          <div className={styles.eventContent}>
            <div className={styles.eventMeta}>
              <span>{formatEventDate(event.eventDate || event.date)}</span>
            </div>
            
            <h3 className={styles.eventTitle}>{event.title}</h3>
            
            <p className={styles.eventExcerpt}>
              {getExcerpt(event.description || event.content)}
            </p>
            
            <div className={styles.eventFooter}>
              {event.location && (
                <span className={styles.eventLocation}>{event.location}</span>
              )}
              {event.viewsCount > 0 && (
                <span className={styles.eventViews}>{event.viewsCount} views</span>
              )}
            </div>
          </div>
        </div>
      </Link>
    );
  };

  return (
    <Layout categories={categories}>
      <Head>
        <title>Events | CorpCrunch</title>
        <meta name="description" content="Corp Crunch Events and Intellectual Properties" />
      </Head>

      <SocialShareRibbon />

      <div className={styles.eventsPage}>
        {/* Hero Section */}
        <section className={styles.heroSection}>
          <Swiper
            modules={[Autoplay, EffectFade, Pagination]}
            effect="fade"
            pagination={{ 
              clickable: true,
              dynamicBullets: true
            }}
            autoplay={{ delay: 5000, disableOnInteraction: false }}
            loop={heroEvents.length > 1}
            className={styles.heroSlider}
            speed={1000}
          >
            {heroEvents.length > 0 ? (
              heroEvents.map((event, index) => (
                <SwiperSlide key={event._id || event.id || index}>
                  <Link href={`/events/${event.slug || event._id || event.id}`}>
                    {event.image && (
                      <Image 
                        src={event.image} 
                        alt={event.title} 
                        fill
                        className={styles.heroImage}
                        quality={90}
                        priority={index === 0}
                        sizes="100vw"
                        style={{ objectFit: 'cover' }}
                      />
                    )}
                    <div className={styles.heroOverlay}>
                      <div className={styles.heroTag}>Featured Event</div>
                      <h1 className={styles.heroTitle}>{event.title}</h1>
                      <p className={styles.heroDescription}>
                        {getExcerpt(event.description || event.content, 180)}
                      </p>
                      {event.location && (
                        <p className={styles.heroLocation}>{event.location}</p>
                      )}
                    </div>
                  </Link>
                </SwiperSlide>
              ))
            ) : (
              <SwiperSlide>
                <div className={styles.heroOverlay}>
                  <div className={styles.heroTag}>Latest</div>
                  <h1 className={styles.heroTitle}>Upcoming Events</h1>
                  <p className={styles.heroDescription}>
                    Explore our upcoming events and intellectual properties.
                  </p>
                </div>
              </SwiperSlide>
            )}
          </Swiper>
        </section>

        <div className={styles.container}>
          {/* Stats Grid */}
          <div className={styles.statsGrid}>
            <div className={styles.statCard}>
              <span className={styles.statValue}>{animatedMetrics.total}</span>
              <span className={styles.statLabel}>Total Events</span>
            </div>
            <div className={styles.statCard}>
              <span className={styles.statValue}>
                {animatedMetrics.views > 1000 
                  ? (animatedMetrics.views/1000).toFixed(1) + 'K' 
                  : animatedMetrics.views}
              </span>
              <span className={styles.statLabel}>Total Views</span>
            </div>
            <div className={styles.statCard}>
              <span className={styles.statValue}>{animatedMetrics.upcoming}</span>
              <span className={styles.statLabel}>Upcoming Events</span>
            </div>
          </div>

          {/* Upcoming Events Section */}
          {upcomingEvents.length > 0 && (
            <section className={styles.categorySection}>
              <div className={styles.sectionHeader}>
                <h2 className={styles.sectionTitle}>Upcoming Events</h2>
                <p className={styles.sectionSubtitle}>
                  Don't miss these exciting upcoming events
                </p>
              </div>
              <div className={styles.eventsGrid}>
                {upcomingEvents.map((event, index) => (
                  <EventCard 
                    key={event._id || event.id || index} 
                    event={event} 
                    variant="upcoming" 
                  />
                ))}
              </div>
            </section>
          )}

          {/* Ongoing Events Section */}
          {ongoingEvents.length > 0 && (
            <section className={styles.categorySection}>
              <div className={styles.sectionHeader}>
                <h2 className={styles.sectionTitle}>Happening Now</h2>
                <p className={styles.sectionSubtitle}>
                  Join these events currently in progress
                </p>
              </div>
              <div className={styles.eventsGrid}>
                {ongoingEvents.map((event, index) => (
                  <EventCard 
                    key={event._id || event.id || index} 
                    event={event} 
                    variant="ongoing" 
                  />
                ))}
              </div>
            </section>
          )}

          {/* Past Events Section */}
          {pastEvents.length > 0 && (
            <section className={styles.categorySection}>
              <div className={styles.sectionHeader}>
                <h2 className={styles.sectionTitle}>Past Events</h2>
                <p className={styles.sectionSubtitle}>
                  Browse our archive of successful events
                </p>
              </div>
              <div className={styles.eventsGrid}>
                {pastEvents.map((event, index) => (
                  <EventCard 
                    key={event._id || event.id || index} 
                    event={event} 
                    variant="past" 
                  />
                ))}
              </div>
            </section>
          )}

          {/* Empty State */}
          {allEvents.length === 0 && (
            <div className={styles.emptyState}>
              <div className={styles.emptyIcon}>📅</div>
              <h3 className={styles.emptyTitle}>No Events Available</h3>
              <p className={styles.emptyText}>
                Check back soon for upcoming events and announcements
              </p>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}

import { getEvents } from "@/lib/eventService";

export async function getStaticProps() {
  try {
    const language = 'en';
    
    // Direct MongoDB query - no API double-hop
    let events = await getEvents({ lang: language, limit: 100 });
    
    // If no events from DB, use empty array (no mock data for production)
    if (!events || events.length === 0) {
      events = [];
    }
    
    // Fetch posts with "Events" category or tag - using direct DB query
    let eventsPosts = [];
    try {
      const { getPosts } = await import('@/lib/postService');
      const postsData = await getPosts({ lang: language, limit: 50 });
      const allPosts = postsData?.frontPagePosts || postsData?.trendingPosts || [];
      eventsPosts = allPosts.filter(post => 
        post.categoryId?.name?.toLowerCase().includes('event') ||
        post.tags?.some(tag => tag.toLowerCase().includes('event'))
      ) || [];
    } catch (postsError) {
      console.error("Error fetching events posts:", postsError);
    }
    
    // Fetch categories for navigation
    const categories = await getCategories().catch(err => {
      console.error("Error fetching categories:", err);
      return [];
    });
    
    return { 
      props: { 
        events: JSON.parse(JSON.stringify(events)),
        eventsPosts: JSON.parse(JSON.stringify(eventsPosts)),
        categories: JSON.parse(JSON.stringify(categories)),
      },
      revalidate: 60, // Rebuild page every 60 seconds
    };
  } catch (error) {
    console.error("Error in getStaticProps:", error);
    return { 
      props: { events: [], eventsPosts: [] },
      revalidate: 60,
    };
  }
}