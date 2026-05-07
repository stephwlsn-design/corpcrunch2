import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import Layout from '@/components/layout/Layout';
import AuthAndSubscriptionProtected from '@/components/providers/AuthAndSubscriptionProtected';
import styles from './Intelligent.module.css';
import SocialShareRibbon from '@/components/elements/SocialShareRibbon';

const SERVICES = [
  { id: 'ai-data', label: 'AI & DATA INTELLIGENCE' },
  { id: 'cloud-infra', label: 'CLOUD & INFRASTRUCTURE' },
  { id: 'cybersecurity', label: 'CYBERSECURITY' },
  { id: 'finance-risk', label: 'FINANCE & RISK MANAGEMENT' },
  { id: 'digital-eng', label: 'DIGITAL ENGINEERING & CUSTOMER OPERATIONS' },
  { id: 'emerging-tech', label: 'EMERGING TECHNOLOGY' },
  { id: 'talent-strategy', label: 'TALENT, STRATEGY & SUSTAINABILITY' }
];

/** Auto-advance interval for the service deep-dive carousel (ms). */
const SERVICE_CAROUSEL_AUTO_MS = 9000;

/** Auto-advance interval for the Solution Portfolio (Four Pillars) carousel (ms). */
const PORTFOLIO_CAROUSEL_AUTO_MS = 5000;

export default function IntelligentPage() {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [visibleSections, setVisibleSections] = useState({});

  // New States for App-Like Navigation
  const [activeTab, setActiveTab] = useState('overview');
  const [activeService, setActiveService] = useState('ai-data');

  // Radial Wheel State for "Inside This Deck" section
  const [radialIndex, setRadialIndex] = useState(0);

  // Active card index for Solution Portfolio (Four Pillars) carousel
  const [activePortfolio, setActivePortfolio] = useState(0);

  // Reference for Swipeable Carousel
  const portfolioScrollRef = useRef(null);
  const servicesScrollRef = useRef(null);

  const scrollToService = (id) => {
    setActiveService(id);
    requestAnimationFrame(() => {
      const el = document.getElementById(`service-${id}`);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
      }
    });
  };

  // Sync active dot when user swipes the service carousel
  useEffect(() => {
    if (activeTab !== 'services') return undefined;
    let cancelled = false;
    const obsRef = { current: null };
    const timer = setTimeout(() => {
      if (cancelled) return;
      const root = servicesScrollRef.current;
      if (!root) return;
      const o = new IntersectionObserver(
        (entries) => {
          const best = entries
            .filter((e) => e.isIntersecting && e.target.id.startsWith('service-'))
            .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
          if (best) {
            const raw = best.target.id.replace(/^service-/, '');
            setActiveService((prev) => (prev === raw ? prev : raw));
          }
        },
        { root, rootMargin: '-20% 0px -20% 0px', threshold: [0.25, 0.5, 0.75] }
      );
      obsRef.current = o;
      SERVICES.forEach((s) => {
        const slide = document.getElementById(`service-${s.id}`);
        if (slide) o.observe(slide);
      });
    }, 200);
    return () => {
      cancelled = true;
      clearTimeout(timer);
      obsRef.current?.disconnect();
      obsRef.current = null;
    };
  }, [activeTab]);

  // Auto-advance service carousel (loops; dots stay in sync via activeService)
  useEffect(() => {
    if (activeTab !== 'services') return undefined;

    const id = setInterval(() => {
      if (typeof document !== 'undefined' && document.hidden) return;
      setActiveService((prev) => {
        const idx = SERVICES.findIndex((s) => s.id === prev);
        const nextId =
          idx >= 0 && idx < SERVICES.length - 1 ? SERVICES[idx + 1].id : SERVICES[0].id;
        requestAnimationFrame(() => {
          const el = document.getElementById(`service-${nextId}`);
          if (el) {
            el.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
          }
        });
        return nextId;
      });
    }, SERVICE_CAROUSEL_AUTO_MS);

    return () => clearInterval(id);
  }, [activeTab]);

  // Auto-advance Solution Portfolio carousel on the Overview tab
  useEffect(() => {
    if (activeTab !== 'overview') return undefined;

    const id = setInterval(() => {
      if (typeof document !== 'undefined' && document.hidden) return;
      const el = portfolioScrollRef.current;
      if (!el) return;
      setActivePortfolio((prev) => {
        const next = prev >= 3 ? 0 : prev + 1;
        const card = el.children[next];
        if (card) {
          el.scrollTo({ left: card.offsetLeft, behavior: 'smooth' });
        }
        return next;
      });
    }, PORTFOLIO_CAROUSEL_AUTO_MS);

    return () => clearInterval(id);
  }, [activeTab]);

  // Sync active dot when user manually scrolls the portfolio carousel
  useEffect(() => {
    if (activeTab !== 'overview') return undefined;
    const el = portfolioScrollRef.current;
    if (!el) return undefined;

    let frame = 0;
    const onScroll = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const center = el.scrollLeft + el.clientWidth / 2;
        let bestIdx = 0;
        let bestDist = Infinity;
        Array.from(el.children).forEach((child, idx) => {
          const childCenter = child.offsetLeft + child.clientWidth / 2;
          const dist = Math.abs(childCenter - center);
          if (dist < bestDist) {
            bestDist = dist;
            bestIdx = idx;
          }
        });
        setActivePortfolio((prev) => (prev === bestIdx ? prev : bestIdx));
      });
    };

    el.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      el.removeEventListener('scroll', onScroll);
      cancelAnimationFrame(frame);
    };
  }, [activeTab]);

  const scrollToPortfolio = (idx) => {
    const el = portfolioScrollRef.current;
    if (!el) return;
    const card = el.children[idx];
    if (card) {
      el.scrollTo({ left: card.offsetLeft, behavior: 'smooth' });
      setActivePortfolio(idx);
    }
  };

  useEffect(() => {
    if (isDarkMode) {
      document.body.classList.add('dark-theme');
      document.documentElement.classList.add('dark-theme');
      document.body.style.backgroundColor = '#0a0a0a';
    } else {
      document.body.classList.remove('dark-theme');
      document.documentElement.classList.remove('dark-theme');
      document.body.style.backgroundColor = '#ffffff';
    }
  }, [isDarkMode]);

  // Re-run observer when tabs change to trigger animations
  useEffect(() => {
    let observer;
    const setupObserver = () => {
      const sections = document.querySelectorAll(`.${styles.observeTrigger}`);
      if (sections.length > 0) {
        observer = new IntersectionObserver(
          (entries) => {
            entries.forEach((entry) => {
              if (entry.isIntersecting) {
                setVisibleSections((prev) => ({ ...prev, [entry.target.id]: true }));
              }
            });
          },
          { threshold: 0.1 }
        );
        sections.forEach((sec) => observer.observe(sec));
      }
    };

    const timeoutId = setTimeout(setupObserver, 100);

    return () => {
      clearTimeout(timeoutId);
      if (observer) observer.disconnect();
    };
  }, [activeTab, activeService, radialIndex]);

  // Carousel Swipe Handlers
  const scrollLeft = () => {
    if (portfolioScrollRef.current) {
      portfolioScrollRef.current.scrollBy({ left: -portfolioScrollRef.current.clientWidth, behavior: 'smooth' });
    }
  };

  const scrollRight = () => {
    if (portfolioScrollRef.current) {
      portfolioScrollRef.current.scrollBy({ left: portfolioScrollRef.current.clientWidth, behavior: 'smooth' });
    }
  };

  // Content for Radial UI derived from Image 2
  const deckContents = [
    { id: '01', title: 'Executive Summary', desc: 'The intelligence imperative & our thesis' },
    { id: '02', title: 'Solution Portfolio', desc: 'Four pillars of intelligent operations' },
    { id: '03', title: 'AI & Data Intelligence', desc: 'Data orchestration, ML pipelines, predictive analytics' },
    { id: '04', title: 'Cloud & Infrastructure', desc: 'AI-native cloud, managed infrastructure, ICP' },
    { id: '05', title: 'Cybersecurity', desc: 'Threat intelligence, zero-trust, compliance automation' },
    { id: '06', title: 'Finance & Risk Management', desc: 'Risk modeling, financial intelligence, treasury ops' },
    { id: '07', title: 'Digital Engineering & Customer Ops', desc: 'Engineering, supply chain, customer experience' },
    { id: '08', title: 'Emerging Technology', desc: 'Metaverse, generative AI, technology transformation' },
    { id: '09', title: 'Architecture & Platform', desc: 'Unified intelligence layer deep-dive' },
    { id: '10', title: 'Competitive Positioning', desc: 'Corp Crunch™ vs. Accenture benchmark' },
    { id: '11', title: 'What We Do', desc: 'Capabilities, managed services & industries' },
    { id: '12', title: 'Why Corp Crunch™', desc: 'Value proposition & next steps' }
  ];

  return (
    <>
      <style jsx global>{`
        .modern-layout {
          overflow: visible !important;
        }
        .modern-layout > .container {
          max-width: 100% !important;
          padding: 0 !important;
          margin: 0 !important;
        }
        .home-social-ribbon {
          z-index: 9999 !important;
        }
        /* === INTELLIGENT PAGE COLOUR LOCK ===
            Primary palette: #4831D4 (purple) + #CCF381 (green) only — no global blues */
        .intelligent-page-root,
        .intelligent-page-root * {
          --primary: #4831D4;
          --primary-light: #4831D4;
          --accent: #CCF381;
          --link-color: #4831D4;
          --tg-theme-primary: #4831D4;
        }
        .intelligent-page-root .home-social-ribbon .social-share-btn:hover {
          background: #4831D4 !important;
          color: #ffffff !important;
        }
        .intelligent-page-root .home-social-ribbon .social-share-btn:hover i,
        .intelligent-page-root .home-social-ribbon .social-share-btn:hover span {
          color: #ffffff !important;
        }
      `}</style>

      <Layout headTitle="Intelligent Technology Solutions - Corp Crunch">
        <div className={`${styles.intelligentPage} ${isDarkMode ? styles.darkMode : styles.lightMode} intelligent-page-root`}>
          <SocialShareRibbon />

          {/* --- 3D CIRCULAR PETAL HERO SECTION --- */}
          <section className={styles.heroSection} id="hero">

            {/* Background tint */}
            <div className={styles.heroBg}></div>

            {/* Circular petals radiating from center with gap */}
            <div className={styles.petalHub}>
              {[0, 1, 2, 3, 4, 5].map((i) => (
                <div
                  key={i}
                  className={styles.petal}
                  style={{
                    '--i': i
                  }}
                ></div>
              ))}
            </div>

            {/* Hero Text Content */}
            <div className={styles.heroContent}>
              <div className={styles.arrowIcon}>↗</div>
              <h1 className={styles.heroTitle}>
                Corp Crunch™<br />
                <span>Intelligent Technology Solutions</span>
              </h1>
              <div className={styles.heroBadges}>
                <span className={styles.badgeDark}>TECHNOLOGY</span>
                <span className={styles.badgeLight}>AI-POWERED</span>
                <span className={styles.badgeLight}>ENTERPRISE GRADE</span>
              </div>
            </div>

          </section>

          {/* --- RADIAL DECK CONTENTS SECTION --- */}
          <section className={`${styles.radialSection} ${styles.observeTrigger} ${visibleSections['radial-deck'] ? styles.isVisible : ''}`} id="radial-deck">
            <div className={styles.radialWrapper}>
              {/* 3 Concentric Rings */}
              <div className={styles.radialRing} style={{ width: '440px', height: '440px' }}></div>
              <div className={styles.radialRing} style={{ width: '660px', height: '660px' }}></div>
              <div className={styles.radialRing} style={{ width: '880px', height: '880px' }}></div>

              {/* Central Logo Circle */}
              <div className={styles.radialCenter}>
                <Image
                  src="/assets/img/logo/Intelligent_Technology_Solutions.png"
                  alt="Intelligent Technology Solutions"
                  width={150}
                  height={150}
                  style={{ objectFit: 'contain' }}
                />
              </div>

              {/* 12 Orbiting Nodes across 3 tiers */}
              {deckContents.map((node, i) => {
                const tier = Math.floor(i / 4); // 0, 1, 2
                const pos = i % 4; // 0, 1, 2, 3

                let radius;
                let angle;

                if (tier === 0) {
                  radius = 220; // Inner
                  const angles = [-45, 45, 135, -135];
                  angle = angles[pos];
                } else if (tier === 1) {
                  radius = 330; // Middle
                  const angles = [-90, 0, 90, 180];
                  angle = angles[pos];
                } else {
                  radius = 440; // Outer
                  const angles = [-45, 45, 135, -135];
                  angle = angles[pos];
                }

                const x = Math.cos(angle * Math.PI / 180) * radius;
                const y = Math.sin(angle * Math.PI / 180) * radius;

                let flexDirection = 'row';
                let textAlign = 'left';
                let translateX = '-22.5px';
                let translateY = '-50%';

                if (Math.abs(x) < 10) {
                  flexDirection = y < 0 ? 'column-reverse' : 'column';
                  textAlign = 'center';
                  translateY = y < 0 ? 'calc(-100% + 22.5px)' : '-22.5px';
                  translateX = '-50%';
                } else if (x < 0) {
                  flexDirection = 'row-reverse';
                  textAlign = 'right';
                  translateX = 'calc(-100% + 22.5px)';
                  translateY = '-50%';
                }

                return (
                  <div
                    className={styles.radialNode12}
                    key={node.id}
                    style={{
                      transform: `translate(calc(${translateX} + ${x}px), calc(${translateY} + ${y}px))`,
                      flexDirection,
                      textAlign
                    }}
                  >
                    <div className={styles.nodeCircle12}>{node.id}</div>
                    <div className={styles.nodeText12}>
                      <h4>{node.title}</h4>
                      <p>{node.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* --- APP NAVIGATION TABS --- */}
          <div className={styles.stickyNavBar}>
            <div className={styles.navContainer}>
              <button className={activeTab === 'overview' ? styles.activeTabBtn : styles.tabBtn} onClick={() => setActiveTab('overview')}>Overview</button>
              <button className={activeTab === 'architecture' ? styles.activeTabBtn : styles.tabBtn} onClick={() => setActiveTab('architecture')}>Architecture</button>
              <button className={activeTab === 'services' ? styles.activeTabBtn : styles.tabBtn} onClick={() => setActiveTab('services')}>Service Deep-Dives</button>
              <button className={activeTab === 'capabilities' ? styles.activeTabBtn : styles.tabBtn} onClick={() => setActiveTab('capabilities')}>Capabilities & Industries</button>
              <button className={activeTab === 'engagement' ? styles.activeTabBtn : styles.tabBtn} onClick={() => setActiveTab('engagement')}>Engagement</button>
            </div>
          </div>

          <div className={styles.pageContainer}>

            {/* =========================================
                 TAB 1: OVERVIEW 
              ========================================= */}
            {activeTab === 'overview' && (
              <div className={styles.tabFadeIn}>
                <section id="overview" className={`${styles.section} ${styles.observeTrigger} ${visibleSections['overview'] ? styles.isVisible : ''}`}>
                  <p className={styles.sectionKicker}>COMPANY OVERVIEW</p>
                  <h2 className={styles.sectionTitle}>Systems That Think.<br /><span className={styles.titleAccent}>Intelligence Embedded.</span></h2>
                  <p className={styles.sectionSubtitle}>ITS — Intelligence Embedded at Every Layer</p>

                  <div className={styles.overviewSplit}>
                    <div className={styles.overviewCopy}>
                      <div className={styles.quoteBox}>
                        "We are not just building products. We are engineering systems that learn, adapt, and evolve — so businesses can operate with clarity in complexity, and move from reactive decision-making to predictive execution."
                      </div>
                      <p className={styles.overviewText}>
                        Corp Crunch™ operates as a technology pioneer designing intelligent, adaptive platforms across industries. Our approach is not to layer AI onto existing systems — we architect from first principles, creating deeply integrated, data-driven environments where intelligence is embedded into every workflow, decision, and interaction.
                      </p>
                    </div>
                    <div className={styles.overviewVisual} aria-hidden="true">
                      <div className={styles.lineSphereWrap}>
                        <div className={styles.lineSphere}>
                          {Array.from({ length: 24 }).map((_, i) => (
                            <span key={i} className={styles.lineMeridian} style={{ '--i': i }}></span>
                          ))}
                        </div>
                        <div className={`${styles.lineSphere} ${styles.lineSphereTwin}`}>
                          {Array.from({ length: 24 }).map((_, i) => (
                            <span key={i} className={styles.lineMeridian} style={{ '--i': i }}></span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </section>

                <section id="philosophy" className={`${styles.section} ${styles.observeTrigger} ${visibleSections['philosophy'] ? styles.isVisible : ''}`}>
                  <div className={styles.philosophyGrid}>
                    <div className={styles.philosophyContent}>
                      <h2 className={styles.sectionTitle}>Our Core<br />Philosophy</h2>
                      <ul className={styles.philosophyList}>
                        <li><strong>Architect-First</strong><p>We design from first principles, not patchwork solutions over legacy systems.</p></li>
                        <li><strong>Intelligence-Embedded</strong><p>AI and ML are native to our architecture — not bolted on.</p></li>
                        <li><strong>Outcome-Oriented</strong><p>We measure success by operational transformation, not feature delivery.</p></li>
                        <li><strong>Ecosystem-Aware</strong><p>Our platforms are open, API-native, and built for interoperability.</p></li>
                      </ul>
                    </div>
                    <div className={styles.philosophyImage}>
                      <div className={styles.imagePlaceholder}>
                        <Image src="/assets/img/HeroEvent/12.png" alt="Intelligent Platform" width={600} height={800} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '40px' }} />
                      </div>
                    </div>
                  </div>
                </section>

                <section id="summary" className={`${styles.section} ${styles.observeTrigger} ${visibleSections['summary'] ? styles.isVisible : ''}`}>
                  <p className={styles.sectionKicker}>EXECUTIVE SUMMARY</p>
                  <h2 className={`${styles.sectionTitle} ${styles.scribbleUnderline}`}>The Intelligence Imperative</h2>
                  <p className={styles.summaryText}>
                    Enterprises today face mounting pressure to operate with precision, speed, and foresight. Corp Crunch™'s Intelligent Technology Solutions deliver AI-native infrastructure that goes beyond advisory — embedded at the core of every workflow, enabling self-improving systems that learn, adapt, and perform in real time.
                  </p>
                  <div className={styles.actionCards}>
                    <div className={styles.actionCard}><h3>Predict</h3><p>Advanced risk modeling and forecasting with high-precision analytics</p></div>
                    <div className={styles.actionCard}><h3>Orchestrate</h3><p>Real-time data ingestion, routing, and synchronization across systems</p></div>
                    <div className={styles.actionCard}><h3>Evolve</h3><p>Self-improving ML pipelines that compound accuracy with every data point</p></div>
                  </div>
                  <div className={styles.statCards}>
                    <div className={styles.statCard}><h4>$2.1T</h4><p>Enterprise AI market by 2030</p></div>
                    <div className={styles.statCard}><h4>67%</h4><p>Reduction in decision latency</p></div>
                    <div className={styles.statCard}><h4>3.8x</h4><p>ROI on AI-native infrastructure</p></div>
                    <div className={styles.statCard}><h4>&lt;1ms</h4><p>Real-time pipeline latency</p></div>
                  </div>
                </section>

                {/* CAROUSEL / SWIPE SECTION */}
                <section id="portfolio" className={`${styles.section} ${styles.observeTrigger} ${visibleSections['portfolio'] ? styles.isVisible : ''}`}>
                  <div className={styles.swipeHeader}>
                    <div>
                      <p className={styles.sectionKicker}>SOLUTION PORTFOLIO</p>
                      <h2 className={`${styles.sectionTitle} ${styles.scribbleUnderline}`}>Four Pillars of Intelligent Operations</h2>
                    </div>
                  </div>

                  <div className={styles.carouselWrapper}>
                    <button onClick={scrollLeft} className={styles.roundSwipeBtnLeft}>←</button>
                    <div className={styles.carouselContainer} ref={portfolioScrollRef}>
                      <div className={`${styles.portfolioCard} ${styles.bgPurple} ${styles.carouselCard}`}>
                        <div className={styles.cardNumber}>01</div>
                        <div className={styles.cardContent}>
                          <h3>Predictive Monitoring Systems</h3>
                          <p>Continuous surveillance of operational and financial signals with ML-driven anomaly detection, threshold alerting, and predictive failure modeling.</p>
                          <div className={styles.cardTags}><span>Anomaly Detection</span><span>Threshold Alerts</span><span>Failure Prediction</span></div>
                        </div>
                      </div>
                      <div className={`${styles.portfolioCard} ${styles.bgGrey} ${styles.carouselCard}`}>
                        <div className={styles.cardNumber}>02</div>
                        <div className={styles.cardContent}>
                          <h3>AI-Native Architecture Intelligence</h3>
                          <p>Infrastructure designed from the ground up for AI workloads — every workflow learns and adapts in real time, not retrofitted onto legacy stacks.</p>
                          <div className={styles.cardTags}><span>Embedded AI</span><span>Adaptive Workflows</span><span>Real-Time Learning</span></div>
                        </div>
                      </div>
                      <div className={`${styles.portfolioCard} ${styles.bgGrey} ${styles.carouselCard}`}>
                        <div className={styles.cardNumber}>03</div>
                        <div className={styles.cardContent}>
                          <h3>Unified Intelligence Layer</h3>
                          <p>A single coherent intelligence fabric spanning data ingestion, model serving, and decision delivery across the entire enterprise technology ecosystem.</p>
                          <div className={styles.cardTags}><span>Single Fabric</span><span>Cross-System</span><span>Unified Data</span></div>
                        </div>
                      </div>
                      <div className={`${styles.portfolioCard} ${styles.bgPurple} ${styles.carouselCard}`}>
                        <div className={styles.cardNumber}>04</div>
                        <div className={styles.cardContent}>
                          <h3>Continuous Learning ML Pipelines</h3>
                          <p>Self-improving pipelines with feedback loops that evolve with new data, continuously enhancing performance, precision, and predictive execution.</p>
                          <div className={styles.cardTags}><span>Feedback Loops</span><span>Auto-Retraining</span><span>Self-Improving</span></div>
                        </div>
                      </div>
                    </div>
                    <button onClick={scrollRight} className={styles.roundSwipeBtnRight}>→</button>
                  </div>

                  <div className={styles.portfolioPagination}>
                    {[0, 1, 2, 3].map((idx) => (
                      <button
                        key={idx}
                        type="button"
                        className={`${styles.carouselDot} ${activePortfolio === idx ? styles.carouselDotActive : ''}`}
                        onClick={() => scrollToPortfolio(idx)}
                        aria-label={`Show pillar ${idx + 1}`}
                      />
                    ))}
                  </div>
                </section>
              </div>
            )}

            {/* =========================================
                 TAB 2: ARCHITECTURE 
              ========================================= */}
            {activeTab === 'architecture' && (
              <div className={styles.tabFadeIn}>
                <section id="architecture" className={`${styles.section} ${styles.observeTrigger} ${visibleSections['architecture'] ? styles.isVisible : ''}`}>
                  <h2 className={styles.sectionTitle}>Architecture Pillars</h2>
                  <div className={styles.sixGrid}>
                    <div className={styles.gridItem}><div className={styles.gridArrow}>↗</div><h3>AI-Native Architecture Intelligence</h3><p>Embedded at the infrastructure level — not bolted on. Every workflow is designed to learn and adapt in real time.</p></div>
                    <div className={styles.gridItem}><div className={styles.gridArrow}>↗</div><h3>Predictive Monitoring Systems</h3><p>Real-time data orchestration, risk modeling, and predictive analytics that power faster, more resilient financial operations.</p></div>
                    <div className={styles.gridItem}><div className={styles.gridArrow} style={{ color: '#ccc' }}>↗</div><h3>Unified Intelligence Layer</h3><p>ML-powered pipelines and continuous feedback loops that transform raw data into strategic foresight and predictive execution.</p></div>
                    <div className={styles.gridItem}><div className={styles.gridArrow}>↗</div><h3>Real-Time Data Orchestration</h3><p>Seamlessly ingests, processes, and routes data across systems in real time, ensuring accuracy, speed, and synchronization across operations.</p></div>
                    <div className={styles.gridItem}><div className={styles.gridArrow}>↗</div><h3>Advanced Risk Modeling & Predictive Analytics</h3><p>Leverages advanced algorithms to assess risk, forecast outcomes, and support data-driven decision-making with high precision.</p></div>
                    <div className={styles.gridItem}><div className={styles.gridArrow} style={{ color: '#ccc' }}>↗</div><h3>Continuous Learning ML Pipelines</h3><p>Implements self-improving machine learning workflows that evolve with new data, continuously enhancing performance and predictive accuracy.</p></div>
                  </div>
                </section>

                <section id="arch-deep" className={`${styles.section} ${styles.observeTrigger} ${visibleSections['arch-deep'] ? styles.isVisible : ''}`}>
                  <div className={styles.deepDiveHeaderBar}>
                    <div className={styles.pillLeft}>ARCHITECTURE</div>
                    <div className={styles.pillRight}>Corp Crunch™</div>
                  </div>
                  <h2 className={`${styles.sectionTitle} ${styles.scribbleUnderline}`}>The Unified Intelligence Layer</h2>
                  <p className={styles.serviceSubtitle}>Embedded at the infrastructure level — not bolted on.</p>

                  <div className={styles.archContainer}>
                    <div className={styles.archFlowWrapper}>
                      <div className={styles.archVerticalLine}></div>
                      <div className={styles.archStep}><div className={`${styles.archPill} ${styles.bgMidGrey}`}>DATA INGESTION</div><div className={styles.archDesc}>Multi-source real-time streaming | Structured & unstructured | IoT, APIs, DBs, SaaS</div></div>
                      <div className={styles.archStep}><div className={`${styles.archPill} ${styles.bgLightPurple}`}>ORCHESTRATION ENGINE</div><div className={styles.archDesc}>Zero-loss routing | Cross-system synchronisation | Event-driven architecture</div></div>
                      <div className={styles.archStep}><div className={`${styles.archPill} ${styles.bgLightestGrey}`}>INTELLIGENCE FABRIC (AI/ML)</div><div className={styles.archDesc}>Risk models | Predictive analytics | Continuous learning pipelines | LLM layer</div></div>
                      <div className={styles.archStep}><div className={`${styles.archPill} ${styles.bgPurple}`}>UNIFIED INTELLIGENCE LAYER</div><div className={styles.archDesc} style={{ color: '#4831D4', fontWeight: '500' }}>Single coherent interface | Adaptive workflows | Real-time decision support</div></div>
                      <div className={styles.archStep}><div className={`${styles.archPill} ${styles.bgWhiteBorder}`}>ENTERPRISE APPLICATIONS</div><div className={styles.archDesc}>Finance | Operations | Supply Chain | Risk | Customer | Strategy</div></div>
                    </div>
                    <div className={styles.archPrinciplesBox}>
                      <h4>KEY PRINCIPLES</h4>
                      <ul className={styles.useCaseList}>
                        <li>Infrastructure-first, not AI overlay</li><li>Every layer learns in real time</li><li>Zero manual retraining required</li><li>Self-healing data pipelines</li><li>Compound performance gains</li><li>Vendor-agnostic deployment</li><li>Built-in governance & lineage</li><li>Open APIs — no vendor lock-in</li>
                      </ul>
                    </div>
                  </div>
                </section>

                <section id="positioning" className={`${styles.section} ${styles.observeTrigger} ${visibleSections['positioning'] ? styles.isVisible : ''}`}>
                  <div className={styles.deepDiveHeaderBar}>
                    <div className={styles.pillLeft}>COMPETITIVE POSITIONING</div>
                    <div className={styles.pillRight}>Corp Crunch™</div>
                  </div>
                  <h2 className={`${styles.sectionTitle} ${styles.scribbleUnderline}`}>Corp Crunch™ vs. Traditional Models</h2>
                  <div className={styles.compareGrid2Col}>
                    <div className={`${styles.comparePill} ${styles.bgPurple}`}>Dimension</div><div className={`${styles.comparePill} ${styles.bgPurple}`}>Corp Crunch™</div>
                    <div className={`${styles.comparePill} ${styles.bgDark}`}>AI Approach</div><div className={`${styles.comparePill} ${styles.bgPurple}`}>Infrastructure-embedded, AI-native architecture from the ground up</div>
                    <div className={`${styles.comparePill} ${styles.bgLightGrey}`}>Data Orchestration</div><div className={`${styles.comparePill} ${styles.bgPurple}`}>Real-time, sub-millisecond pipelines with zero-loss routing</div>
                    <div className={`${styles.comparePill} ${styles.bgDark}`}>Risk Analytics</div><div className={`${styles.comparePill} ${styles.bgPurple}`}>Embedded ML risk models with live outcome forecasting</div>
                    <div className={`${styles.comparePill} ${styles.bgLightGrey}`}>ML Operations</div><div className={`${styles.comparePill} ${styles.bgPurple}`}>Proprietary continuous learning loops with auto-retraining</div>
                    <div className={`${styles.comparePill} ${styles.bgDark}`}>Deployment Model</div><div className={`${styles.comparePill} ${styles.bgPurple}`}>Platform-native; perpetually self-improving after deployment</div>
                    <div className={`${styles.comparePill} ${styles.bgLightGrey}`}>Scale & Speed</div><div className={`${styles.comparePill} ${styles.bgPurple}`}>Real-time execution; instant cross-system synchronisation</div>
                    <div className={`${styles.comparePill} ${styles.bgDark}`}>Generative AI</div><div className={`${styles.comparePill} ${styles.bgPurple}`}>Production LLM deployment with RAG, fine-tuning & guardrails</div>
                  </div>
                  <div className={styles.compareFooterBox}>
                    Corp Crunch™ Differentiator: Where traditional models consult and integrate, Corp Crunch™ builds the intelligence layer itself — making every enterprise system smarter, faster, and self-improving.
                  </div>
                </section>
              </div>
            )}

            {/* =========================================
                 TAB 3: SERVICE DEEP-DIVES (DROPDOWN)
              ========================================= */}
            {activeTab === 'services' && (
              <div className={styles.tabFadeIn}>

                {/* PREMIUM CARD SELECTOR INSTEAD OF DROPDOWN */}
                <div className={styles.deepDiveHeaderBar}>
                  <div className={styles.pillLeft}>
                    SERVICE DEEP-DIVE &middot; {SERVICES.find((s) => s.id === activeService)?.label}
                  </div>
                  <div className={styles.pillRight}>Corp Crunch™</div>
                </div>

                <div className={styles.servicesCarouselWrapper}>
                  <button
                    type="button"
                    className={styles.serviceNavArrowLeft}
                    aria-label="Previous service"
                    onClick={() => {
                      const idx = SERVICES.findIndex((s) => s.id === activeService);
                      if (idx > 0) scrollToService(SERVICES[idx - 1].id);
                    }}
                  >
                    ←
                  </button>
                  <div className={styles.servicesCarouselTrack}>
                  <div className={styles.servicesCarouselContainer} ref={servicesScrollRef}>
                    <div className={styles.serviceSlide} id="service-ai-data">
                    <section id="ai-data" className={`${styles.section} ${styles.observeTrigger} ${visibleSections['ai-data'] ? styles.isVisible : ''}`}>
                      <h2 className={`${styles.sectionTitle} ${styles.scribbleUnderline}`}>AI & Data Intelligence</h2>
                      <p className={styles.serviceSubtitle}>From raw signals to strategic foresight — in real time.</p>
                      <div className={styles.splitLayout2Col}>
                        <div className={styles.splitLeft}>
                          <p className={styles.serviceDesc}>Corp Crunch™'s AI & Data Intelligence practice builds the foundational intelligence layer that powers every downstream decision. We combine proprietary ML infrastructure, real-time pipelines, and domain-specific models to give enterprises an unfair competitive advantage through data.</p>
                          <div className={styles.servicePillList}>
                            <div className={styles.listPill}><strong>Real-Time Data Orchestration</strong><p>Sub-millisecond ingestion, zero-loss routing and cross-system synchronisation across structured and unstructured sources.</p></div>
                            <div className={styles.listPill}><strong>Advanced Risk Modeling & Predictive Analytics</strong><p>Multi-variable risk scoring, outcome forecasting with confidence intervals, and decision-support APIs for finance and ops.</p></div>
                            <div className={styles.listPill}><strong>Continuous Learning ML Pipelines</strong><p>Self-improving workflows with auto-retraining loops — model accuracy compounds with every new data point ingested.</p></div>
                            <div className={styles.listPill}><strong>Natural Language & Generative AI</strong><p>LLM-powered interfaces, document intelligence, and generative co-pilots embedded directly into enterprise workflows.</p></div>
                            <div className={styles.listPill}><strong>Data Governance & Lineage</strong><p>End-to-end lineage tracking, role-based access, and automated compliance tagging across all data assets.</p></div>
                          </div>
                        </div>
                        <div className={styles.splitRight}>
                          <div className={styles.largePurpleCard}>
                            <h4 className={styles.cardMiniHeader}>KEY METRICS</h4>
                            <div className={styles.metricsGrid2x2}>
                              <div className={styles.metricBoxWhite}><h5>&lt;1ms</h5><p>Pipeline Latency</p></div>
                              <div className={styles.metricBoxWhite}><h5>99.99%</h5><p>Data Accuracy SLA</p></div>
                              <div className={styles.metricBoxWhite}><h5>10B+</h5><p>Events/day processed</p></div>
                              <div className={styles.metricBoxWhite}><h5>Zero</h5><p>Manual retraining required</p></div>
                            </div>
                            <h4 className={`${styles.cardMiniHeader} ${styles.mt40}`}>USE CASES</h4>
                            <div className={styles.useCaseGrid}>
                              <ul className={styles.useCaseList}><li>Fraud detection & AML alerting</li><li>Supply chain demand forecasting</li><li>Regulatory reporting automation</li></ul>
                              <ul className={styles.useCaseList}><li>Portfolio risk & scenario modeling</li><li>Customer churn prediction</li><li>Real-time pricing engines</li></ul>
                            </div>
                          </div>
                        </div>
                      </div>
                    </section>
                    </div>

                    <div className={styles.serviceSlide} id="service-cloud-infra">
                    <section id="cloud-infra" className={`${styles.section} ${styles.observeTrigger} ${visibleSections['cloud-infra'] ? styles.isVisible : ''}`}>
                      <h2 className={`${styles.sectionTitle} ${styles.scribbleUnderline}`}>Cloud & Infrastructure</h2>
                      <p className={styles.serviceSubtitle}>AI-native cloud architecture built for scale, resilience, and intelligence.</p>
                      <p className={styles.serviceDesc}>Corp Crunch™ designs and operates cloud environments purpose-built for AI workloads — not generic lift-and-shift migrations. Every deployment is engineered for elastic scale, intelligent cost optimisation, and embedded observability that learns and self-heals.</p>
                      <div className={styles.grid3x2}>
                        <div className={`${styles.serviceCard} ${styles.bgPurple}`}><h3>AI-Native Cloud Architecture</h3><p>Multi-cloud and hybrid deployments (AWS, Azure, GCP) designed to maximise throughput for ML inference, real-time analytics, and event-driven architectures.</p></div>
                        <div className={`${styles.serviceCard} ${styles.bgLightGrey}`}><h3>Infrastructure & Capital Projects</h3><p>Large-scale infrastructure programme delivery — from digital twin design to IoT sensor networks and real-time monitoring for capital-intensive assets.</p></div>
                        <div className={`${styles.serviceCard} ${styles.bgPurple}`}><h3>Managed IT Services</h3><p>24/7 managed operations for cloud, on-premise, and hybrid estates. Proactive incident management with ML-driven anomaly detection and self-healing runbooks.</p></div>
                        <div className={`${styles.serviceCard} ${styles.bgLightGrey}`}><h3>FinOps & Cloud Cost Intelligence</h3><p>Real-time cloud spend visibility, anomaly alerting, rightsizing recommendations, and automated commitment management to optimise total cost of ownership.</p></div>
                        <div className={`${styles.serviceCard} ${styles.bgPurple}`}><h3>DevOps & Platform Engineering</h3><p>CI/CD pipelines, GitOps workflows, container orchestration (Kubernetes), and internal developer platforms that accelerate delivery velocity.</p></div>
                        <div className={`${styles.serviceCard} ${styles.bgLightGrey}`}><h3>Edge & IoT Intelligence</h3><p>Edge compute deployments with real-time ML inference at source — reducing latency for industrial, logistics, and healthcare use cases.</p></div>
                      </div>
                    </section>
                    </div>

                    <div className={styles.serviceSlide} id="service-cybersecurity">
                    <section id="cybersecurity" className={`${styles.section} ${styles.observeTrigger} ${visibleSections['cybersecurity'] ? styles.isVisible : ''}`}>
                      <h2 className={`${styles.sectionTitle} ${styles.scribbleUnderline}`}>Cybersecurity</h2>
                      <p className={styles.serviceSubtitle}>Intelligent threat defence — proactive, adaptive, always-on.</p>
                      <p className={styles.serviceDesc}>Corp Crunch™'s cybersecurity practice deploys AI-driven defence architectures that detect, contain, and remediate threats faster than any human-only SOC. Our zero-trust frameworks and continuous compliance automation protect enterprises across cloud, on-premise, and hybrid estates.</p>
                      <div className={styles.grid3x1}>
                        <div className={`${styles.serviceCardTall} ${styles.bgPurple}`}><h3>Threat Intelligence & SOC</h3><ul className={styles.bulletList}><li>AI-powered SIEM with real-time correlation</li><li>Automated threat hunting & IOC matching</li><li>ML-driven insider threat detection</li><li>24/7 managed SOC with sub-5-min MTTD</li></ul></div>
                        <div className={`${styles.serviceCardTall} ${styles.bgLightGrey}`}><h3>Zero-Trust Architecture</h3><ul className={styles.bulletList}><li>Identity-centric access policies (ZTNA)</li><li>Micro-segmentation & lateral movement prevention</li><li>Continuous device & user risk scoring</li><li>Privileged access management (PAM) automation</li></ul></div>
                        <div className={`${styles.serviceCardTall} ${styles.bgPurple}`}><h3>Compliance & Risk Automation</h3><ul className={styles.bulletList}><li>Automated evidence collection for SOC 2, ISO 27001</li><li>Real-time regulatory posture dashboards</li><li>Policy-as-code for cloud misconfigurations</li><li>DORA, NIS2, GDPR compliance frameworks</li></ul></div>
                      </div>
                      <div className={styles.cyberMetricsStrip}>
                        <div className={styles.blackMetricBox}><h4>&lt;5 min</h4><p>Mean Time to Detect</p></div>
                        <div className={styles.blackMetricBox}><h4>92%</h4><p>Threats auto-remediated</p></div>
                        <div className={styles.blackMetricBox}><h4>Zero Trust</h4><p>Architecture standard</p></div>
                        <div className={styles.blackMetricBox}><h4>100%</h4><p>Audit-ready compliance</p></div>
                      </div>
                    </section>
                    </div>

                    <div className={styles.serviceSlide} id="service-finance-risk">
                    <section id="finance-risk" className={`${styles.section} ${styles.observeTrigger} ${visibleSections['finance-risk'] ? styles.isVisible : ''}`}>
                      <h2 className={`${styles.sectionTitle} ${styles.scribbleUnderline}`}>Finance & Risk Management</h2>
                      <p className={styles.serviceSubtitle}>Real-time financial intelligence for resilient, data-driven operations.</p>
                      <p className={styles.serviceDesc}>Our Finance & Risk practice embeds AI directly into financial operations — from treasury and regulatory reporting to trading risk and credit decisioning. We replace manual spreadsheet workflows with self-improving models that deliver precision at the speed of the market.</p>
                      <div className={styles.splitLayout2Col}>
                        <div className={styles.splitLeft}>
                          <div className={`${styles.listPillColor} ${styles.bgPurple}`}><strong>Advanced Risk Modeling</strong><p>Multi-factor credit, market, and operational risk models with real-time scoring, stress testing, and scenario simulation.</p></div>
                          <div className={`${styles.listPillColor} ${styles.bgDark}`}><strong>Real-Time Financial Orchestration</strong><p>Live P&L feeds, intraday liquidity monitoring, and automated reconciliation across trading systems, ERPs, and custodians.</p></div>
                          <div className={`${styles.listPillColor} ${styles.bgPurple}`}><strong>Regulatory Intelligence & Reporting</strong><p>Automated generation and submission of regulatory reports (Basel IV, IFRS 9, FRTB, MiFID II) with AI-assisted exception handling.</p></div>
                          <div className={`${styles.listPillColor} ${styles.bgDark}`}><strong>Treasury & Cash Flow Forecasting</strong><p>ML-powered working capital forecasting, FX exposure management, and cash pooling optimisation across entities and currencies.</p></div>
                        </div>
                        <div className={styles.splitRight}>
                          <div className={styles.largePurpleCard}>
                            <h4 className={styles.cardMiniHeaderCenter}>FINANCIAL OUTCOMES</h4>
                            <div className={styles.metricsListVertical}>
                              <div className={styles.metricBoxWhiteWide}><h5>40%</h5><p>Reduction in regulatory reporting time</p></div>
                              <div className={styles.metricBoxWhiteWide}><h5>3x</h5><p>Faster risk model iteration</p></div>
                              <div className={styles.metricBoxWhiteWide}><h5>99.7%</h5><p>Trade reconciliation accuracy</p></div>
                              <div className={styles.metricBoxWhiteWide}><h5>60%</h5><p>Reduction in manual FX exposure tasks</p></div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </section>
                    </div>

                    <div className={styles.serviceSlide} id="service-digital-eng">
                    <section id="digital-eng" className={`${styles.section} ${styles.observeTrigger} ${visibleSections['digital-eng'] ? styles.isVisible : ''}`}>
                      <h2 className={`${styles.sectionTitle} ${styles.scribbleUnderline}`}>Digital Engineering & Customer Operations</h2>
                      <p className={styles.serviceSubtitle}>Precision-engineered products. Intelligent customer experiences.</p>
                      <div className={styles.grid2x2}>
                        <div className={`${styles.serviceCardTall} ${styles.bgPurple}`}><h3>Digital Engineering & Manufacturing</h3><ul className={styles.bulletList}><li>Digital twin design & simulation</li><li>Smart factory & Industry 4.0 enablement</li><li>Predictive maintenance with edge ML</li><li>Product lifecycle intelligence (PLM/ALM)</li><li>Embedded systems & firmware intelligence</li></ul></div>
                        <div className={`${styles.serviceCardTall} ${styles.bgDark}`}><h3>Customer Experience & Service</h3><ul className={styles.bulletList}><li>AI-powered contact centre transformation</li><li>Omnichannel journey orchestration</li><li>Sentiment analysis & NPS prediction</li><li>Conversational AI & intelligent IVR</li><li>Voice-of-customer analytics platforms</li></ul></div>
                        <div className={`${styles.serviceCardTall} ${styles.bgLightGrey}`}><h3>Supply Chain Optimisation</h3><ul className={styles.bulletList}><li>Demand sensing & real-time forecasting</li><li>Supplier risk scoring & monitoring</li><li>Inventory optimisation with ML</li><li>Last-mile logistics intelligence</li><li>Control tower with end-to-end visibility</li></ul></div>
                        <div className={`${styles.serviceCardTall} ${styles.bgLightGrey}`}><h3>Marketing & Experience</h3><ul className={styles.bulletList}><li>Personalisation engines at scale</li><li>Programmatic & performance AI</li><li>Attribution modelling & MMM</li><li>Customer lifetime value prediction</li><li>Creative intelligence & content ops</li></ul></div>
                      </div>
                    </section>
                    </div>

                    <div className={styles.serviceSlide} id="service-emerging-tech">
                    <section id="emerging-tech" className={`${styles.section} ${styles.observeTrigger} ${visibleSections['emerging-tech'] ? styles.isVisible : ''}`}>
                      <h2 className={`${styles.sectionTitle} ${styles.scribbleUnderline}`}>Emerging Technology</h2>
                      <p className={styles.serviceSubtitle}>Deploying tomorrow's capabilities in today's enterprise.</p>
                      <p className={styles.serviceDesc}>Corp Crunch™'s Emerging Technology practice moves beyond proof-of-concept to full-scale enterprise deployment. We de-risk frontier technology adoption through proprietary frameworks that embed governance, security, and ROI measurement from day one.</p>
                      <div className={styles.grid2x2}>
                        <div className={`${styles.serviceCardComplex} ${styles.bgPurple}`}><div className={styles.cardHeaderWithNum}><span className={styles.numBadge}>01</span><h3>Generative AI & LLM Enterprise Deployment</h3></div><p>Production-grade deployment of LLMs with RAG architectures, fine-tuning pipelines, hallucination guardrails, and enterprise-grade security controls. We operationalise generative AI — not just pilot it.</p><div className={styles.tagStrip}><span>RAG</span><span>Fine-tuning</span><span>Guardrails</span><span>LLMOps</span></div></div>
                        <div className={`${styles.serviceCardComplex} ${styles.bgDark}`}><div className={styles.cardHeaderWithNum}><span className={styles.numBadge}>02</span><h3>Technology Transformation</h3></div><p>End-to-end legacy modernisation — from mainframe migration to API-first architecture redesign. We combine intelligent automation with platform re-engineering to eliminate technical debt at scale.</p><div className={styles.tagStrip}><span>Legacy Modernisation</span><span>API-First</span><span>Platform Re-engineering</span></div></div>
                        <div className={`${styles.serviceCardComplex} ${styles.bgLightGrey}`}><div className={styles.cardHeaderWithNum}><span className={styles.numBadgeDark}>03</span><h3>Metaverse & Spatial Computing</h3></div><p>Immersive enterprise environments for training, collaboration, digital twins, and customer experience. Built on WebXR, Unity, and Unreal Engine with enterprise IAM integration.</p><div className={styles.tagStripGrey}><span>Digital Twins</span><span>WebXR</span><span>Spatial UX</span><span>Enterprise XR</span></div></div>
                        <div className={`${styles.serviceCardComplex} ${styles.bgLightGrey}`}><div className={styles.cardHeaderWithNum}><span className={styles.numBadgeDark}>04</span><h3>Intelligent Automation & RPA</h3></div><p>Hyperautomation combining RPA, process mining, intelligent document processing (IDP), and agentic AI to eliminate manual toil and accelerate straight-through processing rates.</p><div className={styles.tagStripGrey}><span>Hyperautomation</span><span>IDP</span><span>Process Mining</span><span>Agentic AI</span></div></div>
                      </div>
                    </section>
                    </div>

                    <div className={styles.serviceSlide} id="service-talent-strategy">
                    <section id="talent-strategy" className={`${styles.section} ${styles.observeTrigger} ${visibleSections['talent-strategy'] ? styles.isVisible : ''}`}>
                      <h2 className={`${styles.sectionTitle} ${styles.scribbleUnderline}`}>Talent, Strategy & Sustainability</h2>
                      <p className={styles.serviceSubtitle}>Enabling the human and strategic layer of enterprise intelligence.</p>
                      <div className={styles.grid2x2}>
                        <div className={`${styles.serviceCardTall} ${styles.bgPurple}`}><h3>Strategy & Consulting</h3><p className={styles.cardIntroText}>AI-augmented strategic advisory — market entry, operating model design, and M&A integration powered by data-driven scenario modelling.</p><ul className={styles.bulletList}><li>AI-powered market & competitive intelligence</li><li>Operating model & org design</li><li>M&A due diligence & integration</li><li>Business case & value realisation</li></ul></div>
                        <div className={`${styles.serviceCardTall} ${styles.bgDark}`}><h3>Talent & Organisation</h3><p className={styles.cardIntroText}>Workforce transformation for the AI era — reskilling at scale, change management, and intelligent HR operations that reduce friction and improve retention.</p><ul className={styles.bulletList}><li>AI & data literacy programmes</li><li>Change management & adoption</li><li>HR analytics & workforce planning</li><li>Leadership development for AI transformation</li></ul></div>
                        <div className={`${styles.serviceCardTall} ${styles.bgLightGrey}`}><h3>Sustainability Solutions</h3><p className={styles.cardIntroText}>End-to-end ESG intelligence — from real-time emissions monitoring to supply chain scope 3 reporting and AI-driven decarbonisation roadmaps.</p><ul className={styles.bulletList}><li>Real-time carbon & ESG data platforms</li><li>Scope 1, 2 & 3 reporting automation</li><li>Climate risk scenario modelling</li><li>Net-zero roadmap development</li></ul></div>
                        <div className={`${styles.serviceCardTall} ${styles.bgLightGrey}`}><h3>Learning & Development</h3><p className={styles.cardIntroText}>Personalised, AI-driven learning experiences that upskill workforces faster than traditional programmes through adaptive curricula and intelligent content delivery.</p><ul className={styles.bulletList}><li>AI-adaptive learning platforms</li><li>Skills gap analysis & mapping</li><li>Custom curriculum design</li><li>Performance analytics & certification tracking</li></ul></div>
                      </div>
                    </section>
                    </div>
                  </div>
                  </div>
                  <button
                    type="button"
                    className={styles.serviceNavArrowRight}
                    aria-label="Next service"
                    onClick={() => {
                      const idx = SERVICES.findIndex((s) => s.id === activeService);
                      if (idx < SERVICES.length - 1) scrollToService(SERVICES[idx + 1].id);
                    }}
                  >
                    →
                  </button>
                </div>

                <div className={styles.carouselPagination}>
                  {SERVICES.map((svc) => (
                    <button
                      key={svc.id}
                      type="button"
                      className={`${styles.carouselDot} ${activeService === svc.id ? styles.carouselDotActive : ''}`}
                      onClick={() => scrollToService(svc.id)}
                      aria-label={`View ${svc.label}`}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* =========================================
                 TAB 4: CAPABILITIES & INDUSTRIES 
              ========================================= */}
            {activeTab === 'capabilities' && (
              <div className={styles.tabFadeIn}>
                <section id="what-we-do" className={`${styles.fullPurpleSection} ${styles.observeTrigger} ${visibleSections['what-we-do'] ? styles.isVisible : ''}`}>
                  <div className={styles.wwdContainer}>
                    <div className={styles.wwdHeader}>
                      <h2>What We Do</h2>
                      <div className={styles.circleArrowBtn}>›</div>
                    </div>
                    <div className={styles.wwdGrid}>
                      <div className={styles.wwdColumn}>
                        <h3 className={styles.wwdColTitle}>Capabilities</h3>
                        <ul className={styles.wwdList}><li>AI & Data Intelligence</li><li>Cloud Infrastructure</li><li>Cybersecurity</li><li>Customer Experience</li><li>Digital Engineering</li><li>Emerging Technology</li><li>Finance & Risk Management</li><li>Infrastructure & Capital Projects</li><li>Learning & Development</li></ul>
                      </div>
                      <div className={styles.wwdColumn}>
                        <h3 className={styles.wwdColTitle}>Managed Services</h3>
                        <ul className={styles.wwdList}><li>Managed IT Services</li><li>Marketing & Experience</li><li>Metaverse & Immersive Tech</li><li>Sales & Commerce</li><li>Strategy & Consulting</li><li>Supply Chain Optimization</li><li>Sustainability Solutions</li><li>Talent & Organization</li><li>Technology Transformation</li></ul>
                      </div>
                      <div className={`${styles.wwdColumn} ${styles.span2Cols}`}>
                        <h3 className={styles.wwdColTitle}>Industries</h3>
                        <div className={styles.wwdSplitList}>
                          <ul className={styles.wwdList}><li>Aerospace and Defense</li><li>Automotive</li><li>Banking</li><li>Capital Markets</li><li>Chemicals</li><li>Communications and Media</li><li>Consumer Goods and Services</li><li>Energy</li><li>Health</li><li>High Tech</li></ul>
                          <ul className={styles.wwdList}><li>Industrial</li><li>Insurance</li><li>Life Sciences</li><li>Natural Resources</li><li>Public Service</li><li>Private Equity</li><li>Retail</li><li>Software and Platforms</li><li>Travel</li><li>Utilities</li></ul>
                        </div>
                      </div>
                    </div>
                  </div>
                </section>

                <section id="industries" className={`${styles.section} ${styles.observeTrigger} ${visibleSections['industries'] ? styles.isVisible : ''}`}>
                  <div className={styles.deepDiveHeaderBar}>
                    <div className={styles.pillLeft}>INDUSTRIES & SECTORS</div>
                    <div className={styles.pillRight}>Corp Crunch™</div>
                  </div>
                  <h2 className={`${styles.sectionTitle} ${styles.scribbleUnderline}`}>Where Intelligent Technology Drives Value</h2>
                  <div className={styles.industryGrid3Col}>
                    <div className={styles.industryColumn}>
                      <div className={`${styles.industryHeaderPill} ${styles.bgDark}`}>Financial Services</div>
                      <div className={`${styles.industryItemPill} ${styles.bgDark}`}><span className={styles.dotWhite}></span> Banking</div>
                      <div className={`${styles.industryItemPill} ${styles.bgDark}`}><span className={styles.dotWhite}></span> Capital Markets</div>
                      <div className={`${styles.industryItemPill} ${styles.bgDark}`}><span className={styles.dotWhite}></span> Insurance</div>
                      <div className={`${styles.industryItemPill} ${styles.bgDark}`}><span className={styles.dotWhite}></span> Private Equity</div>
                      <div className={`${styles.industryItemPill} ${styles.bgDark}`}><span className={styles.dotWhite}></span> Wealth Management</div>
                      <div className={`${styles.industryItemPill} ${styles.bgDark}`}><span className={styles.dotWhite}></span> Payments & FinTech</div>
                    </div>
                    <div className={styles.industryColumn}>
                      <div className={`${styles.industryHeaderPill} ${styles.bgPurple}`}>Enterprise Industries</div>
                      <div className={`${styles.industryItemPill} ${styles.bgPurple}`}><span className={styles.dotWhite}></span> High Tech</div>
                      <div className={`${styles.industryItemPill} ${styles.bgPurple}`}><span className={styles.dotWhite}></span> Software & Platforms</div>
                      <div className={`${styles.industryItemPill} ${styles.bgPurple}`}><span className={styles.dotWhite}></span> Telecommunications</div>
                      <div className={`${styles.industryItemPill} ${styles.bgPurple}`}><span className={styles.dotWhite}></span> Energy & Utilities</div>
                      <div className={`${styles.industryItemPill} ${styles.bgPurple}`}><span className={styles.dotWhite}></span> Industrial & Manufacturing</div>
                      <div className={`${styles.industryItemPill} ${styles.bgPurple}`}><span className={styles.dotWhite}></span> Aerospace & Defense</div>
                    </div>
                    <div className={styles.industryColumn}>
                      <div className={`${styles.industryHeaderPill} ${styles.bgLightGrey}`} style={{ color: '#333' }}>Consumer & Life Sciences</div>
                      <div className={`${styles.industryItemPill} ${styles.bgLightGrey}`}><span className={styles.dotBlack}></span> Consumer Goods & Retail</div>
                      <div className={`${styles.industryItemPill} ${styles.bgLightGrey}`}><span className={styles.dotBlack}></span> Health & Life Sciences</div>
                      <div className={`${styles.industryItemPill} ${styles.bgLightGrey}`}><span className={styles.dotBlack}></span> Automotive</div>
                      <div className={`${styles.industryItemPill} ${styles.bgLightGrey}`}><span className={styles.dotBlack}></span> Travel & Logistics</div>
                      <div className={`${styles.industryItemPill} ${styles.bgLightGrey}`}><span className={styles.dotBlack}></span> Public Sector</div>
                      <div className={`${styles.industryItemPill} ${styles.bgLightGrey}`}><span className={styles.dotBlack}></span> Natural Resources</div>
                    </div>
                  </div>
                  <div className={styles.industryFooterBar}>
                    Corp Crunch™ Intelligent Technology Solutions — Enterprise coverage across 18+ industries worldwide
                  </div>
                </section>
              </div>
            )}

            {/* =========================================
                 TAB 5: ENGAGEMENT 
              ========================================= */}
            {activeTab === 'engagement' && (
              <div className={styles.tabFadeIn}>
                <section id="delivery" className={`${styles.section} ${styles.observeTrigger} ${visibleSections['delivery'] ? styles.isVisible : ''}`}>
                  <div className={styles.deepDiveHeaderBar}>
                    <div className={styles.pillLeft}>DELIVERY MODEL</div>
                    <div className={styles.pillRight}>Corp Crunch™</div>
                  </div>
                  <h2 className={`${styles.sectionTitle} ${styles.scribbleUnderline}`}>How We Engage</h2>
                  <p className={styles.serviceSubtitle}>Three flexible models — from rapid pilots to full platform deployment.</p>
                  <div className={styles.grid3x1}>
                    <div className={`${styles.deliveryCard} ${styles.bgDark}`}>
                      <div className={styles.deliveryCardHeader}><span className={styles.numBadge}>01</span><h3>Rapid Intelligence Pilot</h3></div>
                      <div className={`${styles.durationPill} ${styles.bgMidGrey}`}>6-12 weeks</div>
                      <ul className={styles.deliveryList}><li><span className={styles.dotWhite}></span> Scoped proof-of-value on a priority use case</li><li><span className={styles.dotWhite}></span> Dedicated squad of ML engineers & architects</li><li><span className={styles.dotWhite}></span> Measurable ROI benchmark before full commitment</li><li><span className={styles.dotWhite}></span> Output: working platform module + business case</li></ul>
                      <div className={`${styles.deliveryFooter} ${styles.bgMidGrey} ${styles.textWhite}`}>✓ Validated ROI in 90 days</div>
                    </div>
                    <div className={`${styles.deliveryCard} ${styles.bgPurple}`}>
                      <div className={styles.deliveryCardHeader}><span className={styles.numBadge}>02</span><h3>Platform Deployment</h3></div>
                      <div className={`${styles.durationPill} ${styles.bgLightPurple}`}>3-9 months</div>
                      <ul className={styles.deliveryList}><li><span className={styles.dotWhite}></span> Full Unified Intelligence Layer deployment</li><li><span className={styles.dotWhite}></span> Integration with existing ERP, CRM & data stacks</li><li><span className={styles.dotWhite}></span> Custom model training on proprietary data</li><li><span className={styles.dotWhite}></span> Change management & team enablement included</li></ul>
                      <div className={`${styles.deliveryFooter} ${styles.bgLightPurple} ${styles.textWhite}`}>✓ Enterprise-wide AI transformation</div>
                    </div>
                    <div className={`${styles.deliveryCard} ${styles.bgLightGrey}`}>
                      <div className={styles.deliveryCardHeader}><span className={styles.numBadgeDark}>03</span><h3 style={{ color: 'black' }}>Managed Intelligence Service</h3></div>
                      <div className={`${styles.durationPill} ${styles.bgDarkGreyText}`}>Ongoing</div>
                      <ul className={`${styles.deliveryList} ${styles.textBlack}`}><li><span className={styles.dotBlack}></span> 24/7 model monitoring & auto-retraining</li><li><span className={styles.dotBlack}></span> SLA-backed performance guarantees</li><li><span className={styles.dotBlack}></span> Continuous feature expansion & optimisation</li><li><span className={styles.dotBlack}></span> Quarterly strategic reviews & value reporting</li></ul>
                      <div className={`${styles.deliveryFooter} ${styles.bgDark} ${styles.textWhite}`}>✓ Compounding returns over time</div>
                    </div>
                  </div>
                </section>

                <section id="why-choose" className={`${styles.section} ${styles.observeTrigger} ${visibleSections['why-choose'] ? styles.isVisible : ''}`}>
                  <h2 className={styles.hugeTitle}>Corp Crunch™</h2>
                  <p className={styles.hugeSubtitle}>Why the World's Most Demanding Enterprises Choose Intelligent Technology</p>
                  <div className={styles.grid3x1}>
                    <div className={`${styles.whyCard} ${styles.bgPurple}`}><div className={styles.whyHeader}><span className={styles.numBadge}>1</span><h3>Faster Decisions</h3></div><p>Real-time data orchestration and predictive analytics compress decision cycles from days to milliseconds.</p></div>
                    <div className={`${styles.whyCard} ${styles.bgLightGrey}`}><div className={styles.whyHeader}><span className={styles.numBadgeDark}>2</span><h3 style={{ color: 'black' }}>Resilient Operations</h3></div><p style={{ color: '#333' }}>Predictive monitoring and risk modeling preempt disruptions before they impact the business.</p></div>
                    <div className={`${styles.whyCard} ${styles.bgLightGrey}`}><div className={styles.whyHeader}><span className={styles.numBadgeDark}>3</span><h3 style={{ color: 'black' }}>Compounding Returns</h3></div><p style={{ color: '#333' }}>Self-improving ML pipelines mean the platform gets smarter and more valuable with every passing day.</p></div>
                  </div>
                  <div className={styles.ctaBlock}>
                    <div className={styles.ctaContent}>
                      <h3>Ready to Transform Your Enterprise Intelligence?</h3>
                      <p>Connect with Corp Crunch™ to explore a tailored engagement, architecture walkthrough, or pilot deployment scoped to your priority use case.</p>
                    </div>
                    <button className={styles.ctaButton}>Request a Briefing →</button>
                  </div>
                </section>
              </div>
            )}
          </div>

          {/* --- 8. FOOTER CONTACT GRID (ALWAYS VISIBLE AT BOTTOM) --- */}
          <section id="footer-contact" className={styles.footerContactSection}>
            <div className={styles.footerGrid}>
              <div className={styles.footerColWhite}>
                <h2 className={styles.footerLogoTitle}>Corp Crunch™</h2>
                <p className={styles.footerLogoSub}>Intelligent Tech Solutions</p>
                <div className={styles.contactItem}><div className={`${styles.contactLine} ${styles.lineDark}`}></div><div><strong>Phone</strong><p>+971 589 452 396 /<br />+91 7769 892 323</p></div></div>
                <div className={styles.contactItem}><div className={`${styles.contactLine} ${styles.linePurple}`}></div><div><strong>Email</strong><p>founder@corpcrunch.io<br />scoop@corpcrunch.io</p></div></div>
                <div className={styles.contactItem}><div className={`${styles.contactLine} ${styles.lineLight}`}></div><div><strong>Website</strong><p>www.corpcrunch.ai</p></div></div>
              </div>
              <div className={styles.footerColDark}>
                <h3>We are<br />professional.</h3>
                <p>We prioritize transparency, accountability, and measurable impact so every engagement delivers clarity, not ambiguity.</p>
              </div>
              <div className={styles.footerColGrey}>
                <h3>We are<br />trustworthy.</h3>
                <p>From strategy to execution, our approach is structured, responsive, and aligned to real business outcomes not just deliverables.</p>
              </div>
              <div className={styles.footerColPurple}>
                <h3>We are tech<br />and AI First.</h3>
                <p>Technology isn't an add-on for us. It's the foundation. We leverage AI-first architectures to create scalable, intelligent, and future-ready solutions.</p>
              </div>
            </div>
          </section>

        </div>
      </Layout>

    </>
  );
}