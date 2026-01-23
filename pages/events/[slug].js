import Layout from "@/components/layout/Layout";
import { getCategories } from "@/lib/categoryService";
import Head from "next/head";
import Link from "next/link";
import { formatDate } from "@/util";
import Image from "next/image";
import { useState, useEffect } from "react";
import SocialShareRibbon from "@/components/elements/SocialShareRibbon";
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
import Markdown from "react-markdown";
import rehypeRaw from "rehype-raw";
import styles from "./EventDetail.module.css";

export default function EventDetailPage({ event: initialEvent, relatedEvents: initialRelatedEvents = [], categories = [] }) {
  const [event, setEvent] = useState(initialEvent);
  const [loading, setLoading] = useState(false);
  const [relatedEvents, setRelatedEvents] = useState(initialRelatedEvents);
  const [isRegistered, setIsRegistered] = useState(false);
  const [showShareToast, setShowShareToast] = useState(false);
  const [countdown, setCountdown] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  });

  // Countdown timer for upcoming events
  useEffect(() => {
    if (!event || event.status !== 'upcoming' || !event.eventDate) return;

    const timer = setInterval(() => {
      const now = new Date().getTime();
      const eventTime = new Date(event.eventDate).getTime();
      const distance = eventTime - now;

      if (distance < 0) {
        clearInterval(timer);
        setCountdown({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        return;
      }

      setCountdown({
        days: Math.floor(distance / (1000 * 60 * 60 * 24)),
        hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((distance % (1000 * 60)) / 1000)
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [event]);

  // Related events are now passed as props from getStaticProps
  // No need to fetch on client-side

  // Check registration status
  useEffect(() => {
    if (!event) return;
    const registered = localStorage.getItem(`event_registered_${event._id}`);
    setIsRegistered(!!registered);
  }, [event]);

  // Safety guard in case event is not yet available
  if (!event) {
    return null;
  }

  const formatEventDate = (dateString) => {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return dateString;
    }
  };

  const handleRegister = () => {
    if (event.registrationUrl) {
      window.open(event.registrationUrl, '_blank');
    } else {
      setIsRegistered(true);
      localStorage.setItem(`event_registered_${event._id}`, 'true');
      
      // Update event view count
      fetch(`/api/events/${event.slug || event._id}/register`, {
        method: 'POST'
      }).catch(console.error);
    }
  };

  const handleShare = (platform) => {
    setShowShareToast(true);
    setTimeout(() => setShowShareToast(false), 3000);
  };

  const currentUrl = typeof window !== 'undefined' ? window.location.href : '';
  const shareUrl = currentUrl || `https://www.corpcrunch.io/events/${event.slug || event._id}`;
  const shareTitle = event.title || 'Event';
  const shareDescription = event.description || event.content || '';

  return (
    <Layout categories={categories}>
      <Head>
        <title>{event.title} | Events | CorpCrunch</title>
        <meta name="description" content={event.description || event.content?.slice(0, 160)} />
        <meta property="og:title" content={event.title} />
        <meta property="og:description" content={event.description || event.content?.slice(0, 160)} />
        <meta property="og:image" content={event.image || event.ogImage} />
        <meta property="og:url" content={shareUrl} />
      </Head>

      <SocialShareRibbon />

      {/* Share Toast Notification */}
      {showShareToast && (
        <div className={styles.shareToast}>
          Link copied to clipboard!
        </div>
      )}

      <section className={styles.eventDetailPage}>
        <div className={styles.container}>
          {/* Back Button */}
          <Link href="/events" className={styles.backButton}>
            Back to Events
          </Link>

          {/* Event Header */}
          <div className={styles.eventHeader}>
            {event.image && (
              <div className={styles.eventImageWrapper}>
                <Image
                  src={event.image}
                  alt={event.title}
                  fill
                  className={styles.eventImage}
                  priority
                  style={{ objectFit: 'cover' }}
                />
                <div className={styles.eventImageOverlay}>
                  <div className={styles.eventBadge}>
                    {event.status === 'upcoming' ? 'Upcoming Event' : 
                     event.status === 'ongoing' ? 'Live Now' : 'Past Event'}
                  </div>
                </div>
              </div>
            )}

            <div className={styles.eventHeaderContent}>
              <div className={styles.eventMeta}>
                {event.category && (
                  <span className={styles.eventCategory}>{event.category}</span>
                )}
                {event.eventDate && (
                  <span className={styles.eventDate}>
                    {formatEventDate(event.eventDate)}
                  </span>
                )}
                {event.location && (
                  <span className={styles.eventLocation}>
                    {event.location}
                  </span>
                )}
              </div>

              <h1 className={styles.eventTitle}>{event.title}</h1>
              
              {event.description && (
                <p className={styles.eventDescription}>{event.description}</p>
              )}

              {/* Countdown Timer for Upcoming Events */}
              {event.status === 'upcoming' && (
                <div className={styles.countdownWrapper}>
                  <div className={styles.countdownTitle}>Event starts in:</div>
                  <div className={styles.countdown}>
                    <div className={styles.countdownItem}>
                      <span className={styles.countdownValue}>{countdown.days}</span>
                      <span className={styles.countdownLabel}>Days</span>
                    </div>
                    <div className={styles.countdownItem}>
                      <span className={styles.countdownValue}>{countdown.hours}</span>
                      <span className={styles.countdownLabel}>Hours</span>
                    </div>
                    <div className={styles.countdownItem}>
                      <span className={styles.countdownValue}>{countdown.minutes}</span>
                      <span className={styles.countdownLabel}>Minutes</span>
                    </div>
                    <div className={styles.countdownItem}>
                      <span className={styles.countdownValue}>{countdown.seconds}</span>
                      <span className={styles.countdownLabel}>Seconds</span>
                    </div>
                  </div>
                </div>
              )}

             


            </div>
          </div>

          {/* Event Details */}
          <div className={styles.eventDetails}>
            <div className={styles.eventMainContent}>
              {event.content && (
                <div className={styles.eventContent}>
                  <Markdown rehypePlugins={[rehypeRaw]}>
                    {event.content}
                  </Markdown>
                </div>
              )}

              {/* Event Info Cards */}
              <div className={styles.eventInfoCards}>
                {event.eventDate && (
                  <div className={styles.infoCard}>
                    <div className={styles.infoCardContent}>
                      <h3>Event Date</h3>
                      <p>{formatEventDate(event.eventDate)}</p>
                      {event.endDate && (
                        <p className={styles.endDate}>Until {formatEventDate(event.endDate)}</p>
                      )}
                    </div>
                  </div>
                )}

                {event.location && (
                  <div className={styles.infoCard}>
                    <div className={styles.infoCardContent}>
                      <h3>Location</h3>
                      <p>{event.location}</p>
                    </div>
                  </div>
                )}

                {event.registrationUrl && (
                  <div className={styles.infoCard}>
                    <div className={styles.infoCardContent}>
                      <h3>Registration</h3>
                      <a 
                        href={event.registrationUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className={styles.registrationLink}
                      >
                        Register Now →
                      </a>
                    </div>
                  </div>
                )}
              </div>

              {/* Tags */}
              {event.tags && event.tags.length > 0 && (
                <div className={styles.eventTags}>
                  <h3>Event Tags</h3>
                  <div className={styles.tagsList}>
                    {event.tags.map((tag, index) => (
                      <span key={index} className={styles.tag}>{tag}</span>
                    ))}
                  </div>
                </div>
              )}

              {/* Related Events */}
              {relatedEvents.length > 0 && (
                <div className={styles.relatedEvents}>
                  <h3>Related Events</h3>
                  <div className={styles.relatedEventsGrid}>
                    {relatedEvents.map((relEvent) => (
                      <Link 
                        key={relEvent._id} 
                        href={`/events/${relEvent.slug || relEvent._id}`}
                        className={styles.relatedEventCard}
                      >
                        {relEvent.image && (
                          <div className={styles.relatedEventImage}>
                            <Image
                              src={relEvent.image}
                              alt={relEvent.title}
                              fill
                              style={{ objectFit: 'cover' }}
                            />
                          </div>
                        )}
                        <div className={styles.relatedEventContent}>
                          <h4>{relEvent.title}</h4>
                          <p>{relEvent.location}</p>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div className={styles.eventSidebar}>
              <div className={styles.sidebarCard}>
                <h3>Status</h3>
                <div className={`${styles.statusBadge} ${styles[event.status]}`}>
                  {event.status === 'upcoming' ? 'Upcoming' : 
                   event.status === 'ongoing' ? 'Live Now' : 'Completed'}
                </div>
              </div>

              {event.viewsCount !== undefined && (
                <div className={styles.sidebarCard}>
                  <h3>Views</h3>
                  <p className={styles.viewsCount}>
                    {event.viewsCount > 1000 
                      ? `${(event.viewsCount / 1000).toFixed(1)}K`
                      : event.viewsCount || 0}
                  </p>
                </div>
              )}

              {event.category && (
                <div className={styles.sidebarCard}>
                  <h3>Category</h3>
                  <p className={styles.categoryName}>{event.category}</p>
                </div>
              )}

            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
}

import { getEventBySlug, getRelatedEvents } from "@/lib/eventService";

export async function getStaticPaths() {
  // For ISR, we'll use fallback: 'blocking' to generate pages on-demand
  return {
    paths: [],
    fallback: 'blocking',
  };
}

export async function getStaticProps({ params }) {
  try {
    const { slug } = params;
    
    // Direct MongoDB query - no API double-hop
    const event = await getEventBySlug(slug);

    if (!event) {
      return { notFound: true };
    }

    // Fetch related events
    let relatedEvents = [];
    if (event.category) {
      try {
        relatedEvents = await getRelatedEvents(event.category, event._id, 3);
      } catch (relError) {
        console.error('Error fetching related events:', relError);
      }
    }

    // Fetch categories for navigation
    const categories = await getCategories().catch(err => {
      console.error("Error fetching categories:", err);
      return [];
    });

    return {
      props: {
        event: JSON.parse(JSON.stringify(event)),
        relatedEvents: JSON.parse(JSON.stringify(relatedEvents)),
        categories: JSON.parse(JSON.stringify(categories)),
      },
      revalidate: 60, // Rebuild page every 60 seconds
    };
  } catch (error) {
    console.error('Error fetching event details:', error);
    return { notFound: true };
  }
}