import { useState, useEffect } from 'react';
import Image from 'next/image';
import Layout from '@/components/layout/Layout';
import AuthAndSubscriptionProtected from '@/components/providers/AuthAndSubscriptionProtected';
import SocialShareRibbon from '@/components/elements/SocialShareRibbon';
import styles from './Products.module.css';

export default function ProductsPage() {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [visibleSections, setVisibleSections] = useState({});

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
  };

  // Apply dark mode class to body and html
  useEffect(() => {
    if (isDarkMode) {
      document.body.classList.add('dark-theme');
      document.documentElement.classList.add('dark-theme');
      // Also add a style directly to body to ensure background changes
      document.body.style.backgroundColor = '#0a0a0a';
    } else {
      document.body.classList.remove('dark-theme');
      document.documentElement.classList.remove('dark-theme');
      document.body.style.backgroundColor = '#F8F9FB';
    }
  }, [isDarkMode]);

  useEffect(() => {
    let observer;
    let observerInterval;

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
        clearInterval(observerInterval);
      }
    };

    // Retry checking for DOM elements since AuthAndSubscriptionProtected might defer rendering
    observerInterval = setInterval(setupObserver, 300);
    setupObserver();

    return () => {
      clearInterval(observerInterval);
      if (observer) observer.disconnect();
    };
  }, []);

  const products = [
    {
      id: 'prod-1',
      name: 'Qrayt AI',
      tagline: 'Create Content That Converts',
      description: 'All in one content hyper-personalization platform that can create content on scale based on the brand voice, custom avatars and SEO keyword targeting.',
      url: 'https://qrayt.ai.corpcrunch.io',
      image: '/assets/img/others/Qrayt web logo.gif',
      theme: 'blue',
      available: true,
      useLogo: false,
    },
    {
      id: 'prod-2',
      name: 'Prowess',
      tagline: 'Get PR on Demand',
      description: 'A Comprehensive PR-on-Demand Distribution platform that allows Instant access to Tier 1, 2, 3, and 4 publishing channels through a single unified platform, eliminating the need to manage multiple vendor relationships.',
      url: 'https://prowess.corpcrunch.io',
      image: '/assets/img/others/Prowess Photo.png',
      logo: '/assets/img/others/prowess-removebg.png',
      theme: 'orange',
      available: true,
      useLogo: true,
    },
    {
      id: 'prod-3',
      name: 'Cnvrsn',
      tagline: 'The AI brain behind your sales pipeline.',
      description: 'Unify leads, score them with ML, orchestrate sequences, and convert — all from one intelligent platform built for modern GTM teams.',
      url: 'https://otto.corpcrunch.io',
      image: '/assets/img/others/nversn photo.png',
      logo: '/assets/img/others/Otto_logo.png',
      theme: 'pink',
      available: true,
      useLogo: true,
    }
  ];

  return (
    <>
      <style jsx global>{`
        body {
          background-color: ${isDarkMode ? '#0a0a0a' : '#F8F9FB'} !important;
          transition: background-color 0.3s ease;
        }
      `}</style>

      <AuthAndSubscriptionProtected needSubscription={false}>
        <Layout headTitle="Products - Corp Crunch">
          <SocialShareRibbon />

          <div className={`${styles.productsPage} ${isDarkMode ? styles.darkMode : styles.lightMode}`}>

            <button onClick={toggleTheme} className={styles.themeToggleBtn} aria-label="Toggle Theme">
              {isDarkMode ? '☀️' : '🌙'}
            </button>

            {/* --- HERO SECTION --- */}
            <section className={styles.heroSection} id="hero">
              <div className={styles.heroContent}>
                <h1 className={styles.heroTitle}>
                  <span>Explore</span>
                  <span>Ground-breaking</span>
                  <span>Technologies</span>
                </h1>
                <p className={styles.heroDesc}>
                  We are pioneering the integration of AI, machine learning, and advanced technologies into the heart of MarTech, MediaTech, and AdTech. We are committed to revolutionizing how brands interact with their audiences.
                </p>
                <div className={styles.heroCapsule}>
                  <div className={styles.capsuleText}>Welcome To The World Of High Media Tech</div>
                </div>
              </div>

              <div className={styles.heroVisual}>
                <div className={styles.domeBrandWrapper}>
                  <div className={styles.mainPill}>

                  </div>
                  <div className={styles.slice}></div>
                  <div className={styles.slice}></div>
                  <div className={styles.slice}></div>
                  <div className={styles.slice}></div>
                </div>
              </div>
            </section>

            {/* --- PRODUCTS GRID --- */}
            <div className={styles.productsContainer}>
              {products.map((product) => (
                <section
                  key={product.id}
                  id={product.id}
                  className={`${styles.productRow} ${styles.observeTrigger} ${visibleSections[product.id] ? styles.isVisible : ''}`}
                >
                  <div className={styles.productInfo}>
                    {product.useLogo ? (
                      <div className={styles.productLogoContainer}>
                        <Image
                          src={product.logo}
                          alt={product.name}
                          width={200}
                          height={60}
                          className={styles.productLogo}
                          unoptimized
                        />
                      </div>
                    ) : (
                      <h2 className={styles.productName}>{product.name}</h2>
                    )}
                    <p className={styles.productTagline}>{product.tagline}</p>
                    <p className={styles.productDesc}>{product.description}</p>

                    {product.available ? (
                      <a href={product.url} target="_blank" rel="noopener noreferrer" className={styles.btnOutline}>
                        Visit Website
                      </a>
                    ) : (
                      <button className={`${styles.btnOutline} ${styles.btnDisabled}`} disabled>
                        Coming Soon
                      </button>
                    )}
                  </div>

                  <div className={`${styles.productVisual} ${product.theme === 'pink'
                    ? styles.bgPink
                    : product.theme === 'blue'
                      ? styles.bgBlue
                      : styles.bgOrange
                    }`}>
                    <div className={styles.visualWrapper}>
                      {product.image ? (
                        <Image
                          src={product.image}
                          alt={product.name}
                          fill
                          sizes="(max-width: 768px) 100vw, 50vw"
                          className={styles.centeredImage}
                          unoptimized={product.image.endsWith('.gif') || product.image.endsWith('.png')}
                        />
                      ) : (
                        <div className={styles.placeholder}>Visual Coming Soon</div>
                      )}
                    </div>
                  </div>
                </section>
              ))}
            </div>
          </div>
        </Layout>
      </AuthAndSubscriptionProtected>
    </>
  );
}