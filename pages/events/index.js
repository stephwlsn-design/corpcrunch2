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
import { useTheme } from "@/contexts/ThemeContext";

export default function EventsPage({ events, eventsPosts, categories = [] }) {
  const allEvents = events || [];
  const [selectedCard, setSelectedCard] = useState(null);
  const [showTicketModal, setShowTicketModal] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState(null);

  // Handle card click with smooth scroll
  const handleCardClick = (index) => {
    if (selectedCard === index) {
      setSelectedCard(null);
    } else {
      setSelectedCard(index);
      // Small timeout to allow the section to render before scrolling
      setTimeout(() => {
        const detailsSection = document.getElementById('event-details-section');
        if (detailsSection) {
          detailsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 100);
    }
  };
  const [animatedMetrics, setAnimatedMetrics] = useState({
    total: 0,
    views: 0,
    upcoming: 0
  });

  // Theme hook with safety check
  let theme = 'light-theme';
  try {
    const themeContext = useTheme();
    theme = themeContext?.theme || 'light-theme';
  } catch (e) {
    console.warn('Theme context not available');
  }

  // Year cards data with C3 AIX Summit details
  const yearCards = [
    {
      year: "Year 1",
      period: "2026 – UAE",
      title: "AIX NOW: ADOPTION & READINESS",
      description: "How could Switzerland's changing digital landscape impact socioeconomic systems across the world in the next three decades?",
      gradient: "linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)",
      circleColor: "#1e40af",
      image: "/assets/img/blog/blog01.jpg", 
      theme: "light",
      event: {
        title: "AIX NOW: Adoption, Readiness & Real-World Impact",
        category: "AI SUMMIT",
        eventDate: "2026-11-15T10:00:00",
        location: "UAE, GCC",
        description: "The C3 AIX Summit is a premier gathering of over 1,500 global leaders in artificial intelligence, fintech, and medtech innovation. Designed as a convergence point for enterprises, startups, investors, and policymakers.",
        content: `<div class="${styles.contentSection}"><h3 class="${styles.contentHeading}">Summit Overview</h3><p>The Global AI Trilogy is a three-year strategic event series designed to chart the evolution of AI from adoption to scale to global leadership.</p></div><div class="${styles.contentSection}"><h3 class="${styles.contentHeading}">Why Partner With Us?</h3><ul class="${styles.contentList}"><li><strong>Impressions:</strong> 15M+ impressions across social and digital platforms.</li><li><strong>Reach:</strong> 7.5M reach through multi-channel visibility.</li><li><strong>Media Mentions:</strong> 1,200+ organic mentions in regional & global outlets.</li><li><strong>Brand Exposure:</strong> Multi-channel visibility worth $250,000+.</li><li><strong>Sales Impact:</strong> $3.5M in sales generated with an average ROI of 580%.</li></ul></div><div class="${styles.contentSection}"><h3 class="${styles.contentHeading}">High-Impact Audience</h3><p>Our audience influences multi-million dollar AI budgets:</p><ul class="${styles.contentList}"><li><strong>20%:</strong> CEOs, CTOs, CIOs, CMOs, CFOs</li><li><strong>15%:</strong> Investors & Venture Capitalists</li><li><strong>12%:</strong> Heads of AI, ML & Data Science</li><li><strong>10%:</strong> Tech Founders & Innovators</li><li><strong>10%:</strong> Academics & Researchers</li></ul></div>`,
        agenda: {
          day1: [
            { time: "10:00 – 10:30", session: "Registration & Welcome Coffee", type: "Networking" },
            { time: "10:30 – 11:00", session: "Opening Keynote: AI NOW – Shaping the Future Today", type: "Keynote" },
            { time: "11:00 – 12:00", session: "Panel: Enterprise AI Adoption (Fortune 500 AI leaders)", type: "Panel" },
            { time: "12:00 – 12:45", session: "Fireside Chat: Ethical AI & Compliance", type: "Fireside" },
            { time: "13:30 – 15:00", session: "Workshop: Data Infrastructure & Generative AI", type: "Breakout" },
            { time: "15:00 – 15:45", session: "Startup Showcase: 5 High-potential AI startups", type: "Demo" },
            { time: "19:00 – 21:00", session: "Networking Gala Dinner & Awards Preview", type: "Dinner" }
          ],
          day2: [
            { time: "09:30 – 10:00", session: "Registration & Coffee", type: "Networking" },
            { time: "10:00 – 10:45", session: "Keynote: National AI Strategy (Government Partner)", type: "Keynote" },
            { time: "10:45 – 11:45", session: "Panel: Responsible AI in Practice", type: "Panel" },
            { time: "11:45 – 12:30", session: "Interactive Workshop: AI Readiness Index", type: "Workshop" },
            { time: "13:15 – 14:00", session: "Fireside Chat: AI Startup Investment Trends", type: "Fireside" },
            { time: "15:30 – 16:15", session: "AI Awards Ceremony", type: "Awards" },
            { time: "17:30 – 18:30", session: "VIP Investor Roundtable (Closed Session)", type: "VIP" }
          ]
        }
      }
    },
    {
      year: "Year 2",
      period: "2027 – GCC",
      title: "AI FUTURES: SCALE & CONVERGENCE",
      description: "Scaling AI adoption, integrating AI with frontier technologies. Innovation-driven with strong R&D.",
      gradient: "linear-gradient(135deg, #1e40af 0%, #3b82f6 100%)",
      circleColor: "#3b82f6",
      isMiddle: true,
      theme: "dark",
      event: {
        title: "AI FUTURES: Convergence, Collaboration & Industry 5.0",
        category: "AI SUMMIT",
        eventDate: "2027-11-15T10:00:00",
        location: "GCC (TBD)",
        description: "Scaling operations and converging technologies to create unified digital ecosystems. This second edition draws transatlantic networks and focuses on Industry 5.0.",
        content: `<div class="${styles.contentSection}"><h3 class="${styles.contentHeading}">Strategic Trilogy: Scale & Convergence</h3><p>The Global AI Trilogy's second chapter shifts focus from foundation to expansion.</p></div><div class="${styles.contentSection}"><h3 class="${styles.contentHeading}">Core Themes</h3><ul class="${styles.contentList}"><li><strong>Scaling Adoption:</strong> Integrating AI with frontier technologies across sectors.</li><li><strong>Industry 5.0:</strong> Human-centric AI collaboration and sustainable industrial evolution.</li><li><strong>Policy & R&D:</strong> Heavy emphasis on regulatory frameworks and cross-border innovation.</li></ul></div><div class="${styles.contentSection}"><h3 class="${styles.contentHeading}">Partnership Value</h3><ul class="${styles.contentList}"><li><strong>Multi-Country Representation:</strong> Access to a diverse, global mixed ecosystem.</li><li><strong>Early Policy Visibility:</strong> Insight into global AI policy, investments, and industry adoption.</li><li><strong>ROI Potential:</strong> High-intent buyers with potential returns between 500–1200%.</li></ul></div>`,
        agenda: {
          day1: [
            { time: "10:00", session: "Scale-up Summit Kickoff", type: "Keynote" },
            { time: "11:30", session: "Integrating Frontier Tech with AI", type: "Panel" },
            { time: "14:00", session: "Industry 5.0 Convergence", type: "Workshop" }
          ]
        }
      }
    },
    {
      year: "Year 3",
      period: "2028 – GCC",
      title: "AI NEXT MILLENIUM: GLOBAL LEADERSHIP",
      description: "Shaping long-term AI futures and leadership in global governance. Global tech powerhouse.",
      gradient: "linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)",
      circleColor: "#1e40af",
      image: "/assets/img/blog/blog02.jpg",
      isHalfCircle: true,
      theme: "light",
      event: {
        title: "AI NEXT MILLENIUM: Sovereignty, Singularity & the Global AI Economy",
        category: "AI SUMMIT",
        eventDate: "2028-11-15T10:00:00",
        location: "GCC (TBD)",
        description: "Global AI and tech powerhouse event, providing access to top-tier enterprise, startup, investor, and academic networks.",
        content: `<div class="${styles.contentSection}"><h3 class="${styles.contentHeading}">Strategic Trilogy: Global Leadership & Futures</h3><p>The final chapter of the trilogy focuses on sovereignty, the global AI economy, and the path toward singularity.</p></div><div class="${styles.contentSection}"><h3 class="${styles.contentHeading}">Visionary Leadership</h3><ul class="${styles.contentList}"><li><strong>AI Futures:</strong> Shaping long-term AI trajectories and global governance.</li><li><strong>Regulatory Frameworks:</strong> Leading discussions on international standards and frameworks.</li><li><strong>Global Positioning:</strong> Ideal for leadership positioning within the global tech ecosystem.</li></ul></div><div class="${styles.contentSection}"><h3 class="${styles.contentHeading}">Audience Access</h3><ul class="${styles.contentList}"><li>Top-tier Enterprise Leaders</li><li>Global Investors & Venture Capitalists</li><li>Academic Pioneers in AI Singularity</li></ul></div>`,
        agenda: {
          day1: [
            { time: "09:00", session: "Sovereignty in the AI Age", type: "Keynote" },
            { time: "11:00", session: "The Singularity Horizon", type: "Visionary Talk" },
            { time: "15:00", session: "Global AI Economic Shift", type: "Economy Panel" }
          ]
        }
      }
    }
  ];

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
        {/* Year Cards Section - Instagram Story Style */}
        <section className={styles.yearCardsSection}>
          <div className={styles.container}>
            <div className={styles.yearCardsContainer}>
              {yearCards.map((card, index) => (
                <div 
                  key={index} 
                  className={`${styles.yearCard} ${card.isMiddle ? styles.middleCard : ''} ${selectedCard === index ? styles.cardSelected : ''} ${card.isHalfCircle ? styles.halfCircleCard : ''}`}
                  onClick={() => handleCardClick(index)}
                >
                  {/* Main Content - Following the image design */}
                  <div className={styles.cardMainContent}>
                    {/* Header/Title area */}
                    <div className={styles.cardTopArea}>
                      <span className={styles.topBrand}>CorpCrunch™</span>
                      <span className={styles.topYear}>{card.period.split(' ')[0]}</span>
                    </div>

                    {/* Interactive Circles / Images */}
                    <div className={styles.cardVisualArea}>
                      {/* Decorative Background Circles */}
                      <div className={styles.decorativeCircles}>
                        <div className={styles.circle1}></div>
                        <div className={styles.circle2}></div>
                        <div className={styles.circle3}></div>
                      </div>

                      {/* Main Circular Image Container */}
                      {!card.isMiddle && (
                        <div 
                          className={`${styles.circularImageContainer} ${card.isHalfCircle ? styles.halfCircle : ''}`}
                        >
                          <div className={styles.circularImageWrapper}>
                            {card.image ? (
                      <Image 
                                src={card.image}
                                alt={card.title}
                        fill
                                className={styles.circularImage}
                        style={{ objectFit: 'cover' }}
                      />
                            ) : (
                              <div className={styles.circularPlaceholder}>
                                <span>{card.year}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>

                    <h2 className={styles.cardTitle}>{card.title}</h2>

                    {/* Footer Area with Description and Arrow */}
                    <div className={styles.cardBottomArea}>
                      <div className={styles.cardMetaInfo}>
                        <span className={styles.verticalBrand}>Global AI Trilogy</span>
                        <span className={styles.verticalReport}>Series</span>
                      </div>
                      
                      <p className={styles.cardDescription}>{card.description}</p>
                      
                      <div className={styles.cardActions}>
                        <button className={styles.learnMoreBtn}>Learn more</button>
                        <div className={styles.cardArrow}>
                          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <line x1="5" y1="12" x2="19" y2="12"></line>
                            <polyline points="12 5 19 12 12 19"></polyline>
                          </svg>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

           
          </div>
        </section>

        {/* Event Details Section - Shows below cards when card is selected */}
        {selectedCard !== null && yearCards[selectedCard]?.event && (
          <section id="event-details-section" className={styles.eventDetailsSection}>
        <div className={styles.container}>
              
              {/* 1. Main Headline Reveal */}
              <div className={styles.detailsHeroReveal}>
                <div className={styles.heroRevealLabel}>WELCOME TO THE GLOBAL AI TRILOGY</div>
                <h2 className={styles.heroRevealTitle}>{yearCards[selectedCard].event.title}</h2>
                <div className={styles.heroRevealLine}></div>
              </div>

              {/* 2. Asymmetrical Content Grid */}
              <div className={styles.asymmetricalGrid}>
                {/* Left Column - Image */}
                <div className={styles.gridLeftCol}>
                  <div className={styles.animatedDetailImageWrapper}>
                    {yearCards[selectedCard].event.image && (
                      <Image
                        src={yearCards[selectedCard].event.image}
                        alt={yearCards[selectedCard].event.title}
                        fill
                        className={styles.detailImageReveal}
                      />
                    )}
                    <div className={styles.humanRoboImage}>
                      <Image
                        src="/assets/img/bg/HumanRobo.png"
                        alt="Human Robot"
                        fill
                        className={styles.humanRoboImg}
                      />
            </div>
                    <div className={styles.imageOverlayText}>
                      <span>{yearCards[selectedCard].event.location}</span>
                      <span>{formatEventDate(yearCards[selectedCard].event.eventDate)}</span>
            </div>
            </div>
          </div>

                {/* Right Column - Deep Dive Content */}
                <div className={styles.gridRightCol}>
                  <div className={styles.glassContentCard}>
                    <div className={styles.eventDetailContentText}>
                      <div dangerouslySetInnerHTML={{ __html: yearCards[selectedCard].event.content }} />
                    </div>
                  </div>
                </div>
              </div>

              {/* 3. THE IMPACT - Full Width Section */}
              <div className={styles.impactSection}>
                <h3 className={styles.impactHeading}>THE IMPACT</h3>
                <p className={styles.impactText}>{yearCards[selectedCard].event.description}</p>
              </div>

              {/* 4. Metrics Staggered Grid */}
              {selectedCard === 0 && (
                <div className={styles.staggeredMetricsGrid}>
                  <div className={styles.metricSquare}>
                    <div className={styles.metricValue}>15M+</div>
                    <div className={styles.metricLabel}>Impressions</div>
                  </div>
                  <div className={styles.metricSquare}>
                    <div className={styles.metricValue}>7.5M+</div>
                    <div className={styles.metricLabel}>Reach</div>
                  </div>
                  <div className={styles.metricSquare}>
                    <div className={styles.metricValue}>$3.5M</div>
                    <div className={styles.metricLabel}>Sales</div>
                  </div>
                  <div className={styles.metricSquare}>
                    <div className={styles.metricValue}>580%</div>
                    <div className={styles.metricLabel}>ROI</div>
                  </div>
                </div>
              )}

              {/* 4. Interactive Agenda Timeline */}
              {yearCards[selectedCard].event.agenda && (
                <div className={styles.timelineAgendaSection}>
                  <h3 className={styles.timelineTitle}>Event Timeline</h3>
                  <div className={styles.timelineContainer}>
                    {Object.keys(yearCards[selectedCard].event.agenda).map((day, dIdx) => (
                      <div key={day} className={styles.timelineDay}>
                        <div className={styles.dayIndicator}>{day.toUpperCase()}</div>
                        <div className={styles.timelineItems}>
                          {yearCards[selectedCard].event.agenda[day].map((item, i) => (
                            <div key={i} className={styles.timelineItem}>
                              <div className={styles.itemTime}>{item.time}</div>
                              <div className={styles.itemContent}>
                                <h5>{item.session}</h5>
                                <span className={styles.itemTypeTag}>{item.type}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 5. Audience Orbit Section (Enhanced) */}
              <div className={styles.audienceOrbitSection}>
                <div className={styles.orbitContainer}>
                  <div className={styles.centerDot}></div>
                  <div className={styles.orbitingLabels}>
                    <span style={{ '--i': 1 }}>CEOs & CTOs</span>
                    <span style={{ '--i': 2 }}>INVESTORS</span>
                    <span style={{ '--i': 3 }}>AI FOUNDERS</span>
                    <span style={{ '--i': 4 }}>POLICY MAKERS</span>
                    <span style={{ '--i': 5 }}>ACADEMICS</span>
                    <span style={{ '--i': 6 }}>DATA SCIENTISTS</span>
                    <span style={{ '--i': 7 }}>VCs</span>
                    <span style={{ '--i': 8 }}>ENTERPRISE BUYERS</span>
                  </div>
                </div>
                <div className={styles.audienceText}>
                  <h3>HIGH-IMPACT AUDIENCE</h3>
                  <p>Influencing multi-million dollar AI budgets across the globe.</p>
                </div>
              </div>

              {/* 6. Awards Glass Grid */}
              <div className={styles.awardsSection}>
                <h3 className={styles.awardsTitle}>AIX SUMMIT AWARDS</h3>
                <div className={styles.awardsGridReveal}>
                  {[
                    { title: "AI Adoption Champion", desc: "Enterprise successfully implementing AI at scale." },
                    { title: "Responsible AI Leader", desc: "Organization demonstrating ethical and compliant AI deployment." },
                    { title: "AI Startup of the Year", desc: "Most promising early-stage AI startup." },
                    { title: "AI Innovator in FinTech / MedTech / Smart Cities", desc: "Recognizing sector-specific excellence." },
                    { title: "AI Talent & Learning Champion", desc: "Initiative advancing AI education or workforce reskilling." },
                    { title: "Government AI Leadership Award", desc: "Recognizing policy initiatives advancing AI readiness." },
                    { title: "AI Media Choice Award", desc: "Voted by attendees and media." },
                    { title: "People's Choice Award - AI Project of the Year", desc: "Voted by public or conference delegates." }
                  ].map((award, i) => (
                    <div key={i} className={styles.awardCardGlass}>
                      <div className={styles.starIconSmall}>★</div>
                      <h4>{award.title}</h4>
                      <p>{award.desc}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* --- NEW STRATEGIC PARTNERSHIP ECOSYSTEM --- */}
              <div className={styles.partnershipsMainSection}>
                <div className={styles.partnershipHeader}>
                  <span className={styles.pSubHeading}>Investment Opportunities</span>
                  <h2 className={styles.pMainHeading}>STRATEGIC PARTNERSHIP TIERS</h2>
                  <div className={styles.pHeaderLine}></div>
                </div>

                {/* Primary Tiers Grid */}
                <div className={styles.primaryTiersGrid}>
                  {/* Headline Partner */}
                  <div className={`${styles.primaryTierCard} ${styles.headlineCard}`}>
                    <div className={styles.tierRibbon}>MOST EXCLUSIVE</div>
                    <div className={styles.tierTop}>
                      <h3>HEADLINE PARTNER</h3>
                    </div>
                    <div className={styles.tierPriceArea}>
                      <div className={styles.priceLabel}>Investment</div>
                      <div className={styles.mainPrice}>$299,999</div>
                      <div className={styles.roiBadge}>ROI $650,000+</div>
                    </div>
                    <div className={styles.tierDeliverables}>
                      <h4>CORE DELIVERABLES</h4>
                      <ul>
                        <li>Full naming rights across all channels</li>
                        <li>CEO keynote speaking slot + Exclusive video</li>
                        <li>Brand embedded in signage, lanyards, badges</li>
                        <li>50 VIP Passes + Concierge access</li>
                        <li>Ethical AI Playbook Branding</li>
                        <li>Media amplification & pre-event coverage</li>
                      </ul>
                    </div>
                  </div>

                  {/* Platinum Partner */}
                  <div className={styles.primaryTierCard}>
                    <div className={styles.tierTop}>
                      <h3>PLATINUM PARTNER</h3>
                    </div>
                    <div className={styles.tierPriceArea}>
                      <div className={styles.priceLabel}>Investment</div>
                      <div className={styles.mainPrice}>$258,999</div>
                      <div className={styles.roiBadge}>ROI $500,000+</div>
                    </div>
                    <div className={styles.tierDeliverables}>
                      <h4>CORE DELIVERABLES</h4>
                      <ul>
                        <li>Opening Keynote (10–15 mins)</li>
                        <li>Host Government & Enterprise Roundtable</li>
                        <li>30 Delegate Passes + 5 VIP Passes</li>
                        <li>30 sqm premium exhibition island booth</li>
                        <li>Co-branded whitepaper or report</li>
                        <li>Dedicated media interviews</li>
                      </ul>
                    </div>
                  </div>

                  {/* Gold Partner */}
                  <div className={styles.primaryTierCard}>
                    <div className={styles.tierTop}>
                      <h3>GOLD PARTNER</h3>
                    </div>
                    <div className={styles.tierPriceArea}>
                      <div className={styles.priceLabel}>Investment</div>
                      <div className={styles.mainPrice}>$193,999</div>
                      <div className={styles.roiBadge}>ROI $408,000+</div>
                    </div>
                    <div className={styles.tierDeliverables}>
                      <h4>CORE DELIVERABLES</h4>
                      <ul>
                        <li>Branding across sessions, signage, website</li>
                        <li>Contactless Payment Integration</li>
                        <li>20 VIP Passes</li>
                        <li>Product demo space in expo zone</li>
                        <li>Dedicated media interviews & press</li>
                        <li>Exclusive video interview</li>
                      </ul>
                    </div>
                  </div>

                  {/* Silver Partner */}
                  <div className={styles.primaryTierCard}>
                    <div className={styles.tierTop}>
                      <h3>SILVER PARTNER</h3>
                    </div>
                    <div className={styles.tierPriceArea}>
                      <div className={styles.priceLabel}>Investment</div>
                      <div className={styles.mainPrice}>$128,999</div>
                      <div className={styles.roiBadge}>ROI $375,000+</div>
                    </div>
                    <div className={styles.tierDeliverables}>
                      <h4>CORE DELIVERABLES</h4>
                      <ul>
                        <li>Branding on takeaway assets</li>
                        <li>Exhibition expo booth presence</li>
                        <li>Participation in selected panels</li>
                        <li>10 delegate passes</li>
                        <li>Dedicated media interviews</li>
                        <li>Post-event video highlight</li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Additional Partnerships Section */}
                <div className={styles.additionalPartnershipsArea}>
                  <h3 className={styles.additionalHeading}>ADDITIONAL PARTNERSHIP CATEGORIES</h3>
                  <div className={styles.additionalPartnersGrid}>
                    {[
                      { name: "Conference Supporting", price: "$89,999", roi: "$87,750+", desc: "Logo on website, program guide, social media, and 3 VIP Passes." },
                      { name: "Tech Talks Partner", price: "$79,999", roi: "$130,000+", desc: "Full branding of Tech Talks sessions + 1 featured speaker." },
                      { name: "Thought Leadership", price: "$59,999", roi: "$91,000+", desc: "Co-authored premium editorial content & website rights." },
                      { name: "Start-Up Live Demo", price: "$78,999", roi: "$123,500+", desc: "Branding for demo stage, MC callouts, and lead registration." },
                      { name: "Media Lounge Partner", price: "$79,999", roi: "$52,000+", desc: "Branding inside press room + logo on accreditation badges." },
                      { name: "Video Distribution", price: "$65,999", roi: "$110,500+", desc: "Logo overlays on highlight reels & reach across YouTube." },
                      { name: "Connexions Lounge", price: "$65,999", roi: "$65,000+", desc: "Branded networking lounge with QR lead gen integration." },
                      { name: "Digital Standees", price: "$52,999", roi: "$84,500+", desc: "Rotating video/animation slots in high-footfall areas." },
                      { name: "Step-and-Repeat", price: "$45,999", roi: "$130,000+", desc: "Logo on high-visibility photo backdrop & social sharing." },
                      { name: "Digital Creative Asset", price: "$39,999", roi: "$84,500+", desc: "Co-branded visuals in social media & influencer toolkits." },
                      { name: "After-Party Partner", price: "$52,999", roi: "$84,500+", desc: "Exclusive branding at the official closing celebration." },
                      { name: "Future Digital Economy", price: "$52,999", roi: "$71,500+", desc: "Branding of future-forward pavilion + fireside chat slot." },
                      { name: "Charging Station", price: "$13,999", roi: "$52,000+", desc: "Brand placement on charging kiosks venue-wide." },
                      { name: "Volunteer T-Shirt", price: "$15,999", roi: "$39,000+", desc: "Logo placement on all event crew and volunteer apparel." },
                      { name: "Water Bottle", price: "$10,999", roi: "$26,000+", desc: "Branded reusable bottles distributed to all attendees." },
                      { name: "Eco Partner", price: "$26,999", roi: "$23,400+", desc: "Green branding + carbon offset inclusion program." },
                      { name: "WiFi Partner", price: "$19,999", roi: "$19,500+", desc: "Branded login splash page + onsite signage." },
                      { name: "Badge and Lanyard", price: "$32,999", roi: "$15,600+", desc: "Exclusive logo placement on every delegate interaction." }
                    ].map((p, i) => (
                      <div key={i} className={styles.additionalPartnerCard}>
                        <div className={styles.apCardTop}>
                          <h4>{p.name}</h4>
                          <span className={styles.apPrice}>{p.price}</span>
                        </div>
                        <div className={styles.apRoi}>ROI: {p.roi}</div>
                        <p className={styles.apDesc}>{p.desc}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* 7. Statistics Ribbon (Inspired by User Text) */}
              <div className={styles.statsRibbonSection}>
                <div className={styles.statsRibbonGrid}>
                  <div className={styles.ribbonStatItem}>
                    <span className={styles.ribbonStatValue}>9999+</span>
                    <span className={styles.ribbonStatLabel}>PEOPLE INTERESTED</span>
                  </div>
                  <div className={styles.ribbonStatItem}>
                    <span className={styles.ribbonStatValue}>2</span>
                    <span className={styles.ribbonStatLabel}>YEARS OF EVENTS</span>
                  </div>
                  <div className={styles.ribbonStatItem}>
                    <span className={styles.ribbonStatValue}>19</span>
                    <span className={styles.ribbonStatLabel}>CASE STUDIES</span>
                  </div>
                  <div className={styles.ribbonStatItem}>
                    <span className={styles.ribbonStatValue}>17</span>
                    <span className={styles.ribbonStatLabel}>TOP SPEAKERS</span>
                  </div>
                  <div className={styles.ribbonStatItem}>
                    <span className={styles.ribbonStatValue}>320</span>
                    <span className={styles.ribbonStatLabel}>WEBINARS</span>
                  </div>
                </div>
              </div>

              {/* 8. Exhibitor Returns Section (Bold Visual) */}
              <div className={styles.exhibitorReturnsBanner}>
                <div className={styles.returnsContent}>
                  <h3>WHAT EXHIBITORS GAIN</h3>
                  <div className={styles.returnsValue}>$1.5M – $1.8M+</div>
                  <p>MEASURABLE RETURNS, EXCLUDING LONG-TERM ROI FROM SUSTAINED PARTNERSHIPS AND CLIENT GROWTH.</p>
                </div>
              </div>

              {/* 9. Product Booth for AI Startups (Category Crunch™) */}
              <div className={styles.boothPackagesSection}>
                <h3 className={styles.boothSectionTitle}>PRODUCT BOOTH FOR AI STARTUPS</h3>
                <div className={styles.boothCardsGrid}>
                  {/* Standard Booth */}
                  <div className={styles.boothCard}>
                    <div className={styles.boothHeader}>
                      <span className={styles.boothCategory}>Category Crunch™</span>
                      <h4>Standard Booth</h4>
                    </div>
                    <div className={styles.boothSpecs}>
                      <div className={styles.specItem}><span>Size</span><strong>3m x 3m (9 sqm)</strong></div>
                      <div className={styles.specItem}><span>Location</span><strong>Standard area</strong></div>
                    </div>
                    <div className={styles.boothInclusions}>
                      <h5>Inclusions:</h5>
                      <ul>
                        <li>Basic furnishing (table, 2 chairs)</li>
                        <li>2 complimentary passes</li>
                        <li>Listing in exhibitor directory</li>
                        <li>Logo on event website</li>
                      </ul>
                    </div>
                    <div className={styles.boothFooter}>
                      <div className={styles.boothPrice}>$12,999</div>
                      <div className={styles.boothSpots}>16 SPOTS</div>
                    </div>
                  </div>

                  {/* Premium Booth */}
                  <div className={`${styles.boothCard} ${styles.boothCardFeatured}`}>
                    <div className={styles.boothHeader}>
                      <span className={styles.boothCategory}>Category Crunch™</span>
                      <h4>Premium Booth</h4>
                    </div>
                    <div className={styles.boothSpecs}>
                      <div className={styles.specItem}><span>Size</span><strong>6m x 3m (18 sqm)</strong></div>
                      <div className={styles.specItem}><span>Location</span><strong>High-traffic zones</strong></div>
                    </div>
                    <div className={styles.boothInclusions}>
                      <h5>Inclusions:</h5>
                      <ul>
                        <li>Premium furnishing & lighting</li>
                        <li>4 complimentary passes</li>
                        <li>Logo in event app + signage</li>
                        <li>Social media product spotlight</li>
                        <li>Priority directory listing</li>
                      </ul>
                    </div>
                    <div className={styles.boothFooter}>
                      <div className={styles.boothPrice}>$19,999</div>
                      <div className={styles.boothSpots}>9 SPOTS</div>
                    </div>
                  </div>

                  {/* Elite Showcase Booth */}
                  <div className={styles.boothCard}>
                    <div className={styles.boothHeader}>
                      <span className={styles.boothCategory}>Category Crunch™</span>
                      <h4>Elite Showcase</h4>
                    </div>
                    <div className={styles.boothSpecs}>
                      <div className={styles.specItem}><span>Size</span><strong>9m x 3m (27 sqm)</strong></div>
                      <div className={styles.specItem}><span>Location</span><strong>Prime spots (Entrances)</strong></div>
                    </div>
                    <div className={styles.boothInclusions}>
                      <h5>Inclusions:</h5>
                      <ul>
                        <li>Custom AV setup & branding</li>
                        <li>6 complimentary passes</li>
                        <li>Dedicated PR spotlight + Interview</li>
                        <li>Product features in newsletter</li>
                        <li>Logo on main stage screens</li>
                      </ul>
                    </div>
                    <div className={styles.boothFooter}>
                      <div className={styles.boothPrice}>$39,999</div>
                      <div className={styles.boothSpots}>5 SPOTS</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* 10. At the Event Companies Section */}
              <div className={styles.companiesOrbitSection}>
                <div className={styles.companiesOrbitContainer}>
                  <div className={styles.centerDot}></div>
                  <div className={styles.companiesOrbitingLogos}>
                    {[
                      "amazon.png", "aramex.png", "Deloitte.png", "Foodics.jpg", 
                      "hcl.png", "IBM.png", "Infosys.png", "Microsoft.png", 
                      "nvidia.jpg", "persistent.png", "salesforce.png", "tabby.png",
                    ].map((logo, idx) => (
                      <div key={idx} className={styles.orbitingLogo} style={{ '--i': idx + 1 }}>
                        <div className={styles.logoWrapper}>
                          <Image 
                            src={`/assets/img/CompanyLogos/${logo}`} 
                            alt="Company Logo" 
                            width={140} 
                            height={70} 
                            className={styles.companyLogoImg}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <div className={styles.audienceText}>
                  <h3>At the Event Companies</h3>
                  <p>Influencing multi-million dollar AI budgets across the globe.</p>
                </div>
              </div>

              {/* 11. Final Call to Action Cards (Interactive) */}
              <div className={styles.interactiveActionSection}>
                <div className={styles.actionCardsGrid}>
                  {/* Sponsorships Card */}
                  <div className={`${styles.actionCard} ${styles.sponsorshipAction}`}>
                    <div className={styles.actionCardContent}>
                      <span className={styles.actionLabel}>Partnership</span>
                      <h3>SPONSORSHIPS</h3>
                      <p>Gain multi-year brand positioning and access to high-intent buyers with ROI potential up to 1200%.</p>
                      <div className={styles.actionStats}>
                        <div className={styles.aStat}><strong>$650K+</strong><span>ROI VALUE</span></div>
                        <div className={styles.aStat}><strong>15M+</strong><span>IMPRESSIONS</span></div>
                      </div>
                    </div>
                    <button className={styles.actionBtn}>Become a Partner</button>
                  </div>

                  {/* Exhibition Card */}
                  <div className={`${styles.actionCard} ${styles.exhibitionAction}`}>
                    <div className={styles.actionCardContent}>
                      <span className={styles.actionLabel}>Showcase</span>
                      <h3>EXHIBITION</h3>
                      <p>Showcase groundbreaking AI technologies to 1,500+ global leaders and build enterprise portfolios.</p>
                      <div className={styles.actionStats}>
                        <div className={styles.aStat}><strong>$1.8M</strong><span>GAIN POTENTIAL</span></div>
                        <div className={styles.aStat}><strong>1.2K+</strong><span>LEADS</span></div>
                      </div>
                    </div>
                    <button className={styles.actionBtn}>Book a Booth</button>
                  </div>

                  {/* Tickets Card */}
                  <div className={`${styles.actionCard} ${styles.ticketsAction}`}>
                    <div className={styles.actionCardContent}>
                      <span className={styles.actionLabel}>Attendance</span>
                      <h3>DELEGATE TICKETS</h3>
                      <p>Join the elite circle of AI founders, investors, and policymakers for the Global AI Trilogy.</p>
                      <div className={styles.actionStats}>
                        <div className={styles.aStat}><strong>1.5K+</strong><span>ATTENDEES</span></div>
                        <div className={styles.aStat}><strong>VIP</strong><span>ACCESS</span></div>
                      </div>
                    </div>
                    <button className={styles.actionBtn} onClick={() => setShowTicketModal(true)}>Get Tickets</button>
                  </div>
                </div>
              </div>
              </div>
            </section>
          )}

        {/* Show all events if no card is selected */}
        {selectedCard === null && allEvents.length > 0 && (
          <section className={styles.allEventsSection}>
            <div className={styles.container}>
              <h2 className={styles.allEventsTitle}>All Events</h2>
              <div className={styles.eventsGrid}>
                {allEvents.map((event, index) => (
                  <EventCard 
                    key={event._id || event.id || index} 
                    event={event} 
                    variant={event.status || "upcoming"} 
                  />
                ))}
              </div>
              </div>
            </section>
          )}

        {/* Ticket Pricing Modal - Full Screen */}
        {showTicketModal && (
          <div className={styles.ticketModal}>
            <div className={styles.ticketModalContent}>
              <button className={styles.ticketModalClose} onClick={() => setShowTicketModal(false)}>×</button>
              <h2 className={styles.ticketModalTitle}>DELEGATE TICKETS</h2>
              <p className={styles.ticketModalSubtitle}>Select your ticket type for the Global AI Trilogy</p>
              
              <div className={styles.ticketOptions}>
                {[
                  { id: 'standard', name: 'Standard Delegate', desc: 'Full access to all sessions, networking events, and exhibition', price: 999 },
                  { id: 'premium', name: 'Premium Delegate', desc: 'Standard access + VIP lounge, priority seating, and exclusive roundtables', price: 1999 },
                  { id: 'vip', name: 'VIP Delegate', desc: 'Premium access + Gala dinner, investor meetups, and backstage access', price: 3999 }
                ].map((ticket) => (
                  <div
                    key={ticket.id}
                    className={`${styles.ticketOption} ${selectedTicket === ticket.id ? styles.ticketOptionSelected : ''}`}
                    onClick={() => setSelectedTicket(ticket.id)}
                  >
                    <div className={styles.ticketOptionInfo}>
                      <div className={styles.ticketOptionName}>{ticket.name}</div>
                      <div className={styles.ticketOptionDesc}>{ticket.desc}</div>
                    </div>
                    <div className={styles.ticketOptionPrice}>${ticket.price}</div>
              </div>
                ))}
              </div>

              {selectedTicket && (
                <>
                  <div className={styles.ticketTotal}>
                    <span className={styles.ticketTotalLabel}>Total</span>
                    <span className={styles.ticketTotalAmount}>
                      ${[
                        { id: 'standard', price: 999 },
                        { id: 'premium', price: 1999 },
                        { id: 'vip', price: 3999 }
                      ].find(t => t.id === selectedTicket)?.price}
                    </span>
                  </div>
                  <button
                    className={styles.stripeCheckoutBtn}
                    onClick={async () => {
                      const ticket = [
                        { id: 'standard', price: 999, name: 'Standard Delegate' },
                        { id: 'premium', price: 1999, name: 'Premium Delegate' },
                        { id: 'vip', price: 3999, name: 'VIP Delegate' }
                      ].find(t => t.id === selectedTicket);
                      
                      // Create Stripe Checkout Session
                      try {
                        const response = await fetch('/api/create-checkout-session', {
                          method: 'POST',
                          headers: {
                            'Content-Type': 'application/json',
                          },
                          body: JSON.stringify({
                            ticketType: ticket.name,
                            amount: ticket.price * 100, // Convert to cents
                            eventName: 'Global AI Trilogy - C3 AIX Summit',
                            quantity: 1
                          }),
                        });
                        
                        const session = await response.json();
                        
                        if (session.url) {
                          // Redirect to Stripe Checkout
                          window.location.href = session.url;
                        } else {
                          console.error('No checkout URL received');
                          alert('Unable to process payment. Please try again.');
                        }
                      } catch (error) {
                        console.error('Error creating checkout session:', error);
                        alert('Payment processing error. Please try again.');
                      }
                    }}
                  >
                    Proceed to Payment
                  </button>
                </>
              )}
            </div>
            </div>
          )}
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