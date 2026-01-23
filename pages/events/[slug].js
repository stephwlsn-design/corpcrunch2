import Layout from "@/components/layout/Layout";
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

export default function EventDetailPage({ event: initialEvent }) {
  const [event, setEvent] = useState(initialEvent);
  const [loading, setLoading] = useState(false);
  const [relatedEvents, setRelatedEvents] = useState([]);
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

  // Fetch related events
  useEffect(() => {
    if (!event) return;

    const fetchRelatedEvents = async () => {
      try {
        const response = await fetch(`/api/events?category=${event.category}&limit=3`);
        if (response.ok) {
          const data = await response.json();
          const filtered = (data.events || []).filter(e => e._id !== event._id).slice(0, 3);
          setRelatedEvents(filtered);
        }
      } catch (error) {
        console.error('Error fetching related events:', error);
      }
    };

    fetchRelatedEvents();
  }, [event]);

  // Check registration status
  useEffect(() => {
    if (!event) return;
    const registered = localStorage.getItem(`event_registered_${event._id}`);
    setIsRegistered(!!registered);
  }, [event]);

  if (!event) {
    return (
      <Layout>
        <Head>
          <title>Event Not Found | CorpCrunch</title>
        </Head>
        <div className={styles.notFound}>
          <h1>Event Not Found</h1>
          <p>The event you're looking for doesn't exist.</p>
          <Link href="/events">Back to Events</Link>
        </div>
      </Layout>
    );
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
    <Layout>
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

              {/* Registration Button */}
              {event.status !== 'past' && (
                <button 
                  className={`${styles.registerButton} ${isRegistered ? styles.registered : ''}`}
                  onClick={handleRegister}
                  disabled={isRegistered}
                >
                  {isRegistered ? 'Already Registered ✓' : 'Register Now'}
                </button>
              )}

              {/* Share Buttons */}
              <div className={styles.shareButtons}>
                <FacebookShareButton 
                  url={shareUrl} 
                  quote={shareTitle}
                  onShareWindowClose={() => handleShare('facebook')}
                >
                  <FacebookIcon size={40} round />
                </FacebookShareButton>
                <TwitterShareButton 
                  url={shareUrl} 
                  title={shareTitle}
                  onShareWindowClose={() => handleShare('twitter')}
                >
                  <TwitterIcon size={40} round />
                </TwitterShareButton>
                <LinkedinShareButton 
                  url={shareUrl} 
                  title={shareTitle} 
                  summary={shareDescription}
                  onShareWindowClose={() => handleShare('linkedin')}
                >
                  <LinkedinIcon size={40} round />
                </LinkedinShareButton>
                <WhatsappShareButton 
                  url={shareUrl} 
                  title={shareTitle}
                  onShareWindowClose={() => handleShare('whatsapp')}
                >
                  <WhatsappIcon size={40} round />
                </WhatsappShareButton>
              </div>
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

              {/* Quick Actions */}
              <div className={styles.sidebarCard}>
                <h3>Quick Actions</h3>
                <div className={styles.quickActions}>
                  <button 
                    className={styles.actionButton}
                    onClick={() => {
                      navigator.clipboard.writeText(shareUrl);
                      setShowShareToast(true);
                      setTimeout(() => setShowShareToast(false), 3000);
                    }}
                  >
                    Copy Link
                  </button>
                  {event.status !== 'past' && !isRegistered && (
                    <button 
                      className={styles.actionButton}
                      onClick={handleRegister}
                    >
                      Register
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
}

export const getServerSideProps = async ({ params, req }) => {
  try {
    const { slug } = params;
    const protocol = req?.headers?.['x-forwarded-proto'] || 'http';
    const host = req?.headers?.host || 'localhost:3000';
    const baseUrl = `${protocol}://${host}`;
    
    // Fetch event from API
    const eventUrl = `${baseUrl}/api/events/${slug}`;
    const response = await fetch(eventUrl);
    
    if (!response.ok) {
      // If API fails, try to use mock data based on slug
      const mockEvents = [
        {
          _id: '1',
          slug: 'tech-innovation-summit-2024',
          title: 'Tech Innovation Summit 2024',
          description: 'Join industry leaders for the biggest tech event of the year. Experience groundbreaking innovations, network with pioneers, and discover the future of technology.',
          image: '/assets/img/HeroEvent/1.png',
          category: 'Technology',
          date: 'March 15, 2024',
          location: 'San Francisco, CA',
          eventDate: new Date('2024-12-31T18:00:00').toISOString(),
          status: 'upcoming',
          featured: true,
          viewsCount: 1250,
          tags: ['Innovation', 'Technology', 'AI', 'Networking'],
          content: `# About the Event

Join us for the **Tech Innovation Summit 2024**, the premier gathering of technology leaders, innovators, and visionaries. This year's summit brings together the brightest minds in the industry to explore cutting-edge technologies, share insights, and shape the future of innovation.

## What to Expect

### Keynote Speakers
World-renowned experts will share their insights on the latest technological breakthroughs and future trends. Our lineup includes CEOs from Fortune 500 companies, successful entrepreneurs, and leading researchers.

### Networking Opportunities
Connect with over 2,000 attendees including investors, entrepreneurs, developers, and industry leaders. Our structured networking sessions ensure meaningful connections that last beyond the event.

### Hands-On Workshops
Participate in interactive workshops covering AI, machine learning, blockchain, IoT, and more. Learn practical skills from industry experts.

### Innovation Showcase
Explore groundbreaking products and services from startups and established companies. Witness live demonstrations of technologies that are reshaping industries.

## Event Highlights

- 50+ expert speakers
- 100+ exhibitors
- 30+ workshops and sessions
- Exclusive VIP networking dinner
- Startup pitch competition with $100K in prizes

## Who Should Attend

This summit is perfect for technology professionals, entrepreneurs, investors, students, and anyone passionate about innovation and the future of technology.`,
        },
      ];

      const event = mockEvents.find(e => e.slug === slug);
      
      return {
        props: { event: event || null },
      };
    }

    const data = await response.json();
    const event = data?.event || null;

    if (!event) {
      return {
        props: { event: null },
      };
    }

    return {
      props: {
        event: JSON.parse(JSON.stringify(event)),
      },
    };
  } catch (error) {
    console.error('Error fetching event details:', error);
    return {
      props: { event: null },
    };
  }
};