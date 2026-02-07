import { useState, useEffect } from 'react';
import Image from 'next/image'; 
import Layout from '@/components/layout/Layout'; 
import SocialShareRibbon from '@/components/elements/SocialShareRibbon'; 
import styles from './Products.module.css'; 

export default function ProductsPage() {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [visibleSections, setVisibleSections] = useState({});

  const toggleTheme = () => setIsDarkMode(!isDarkMode);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setVisibleSections((prev) => ({ ...prev, [entry.target.id]: true }));
          }
        });
      },
      { threshold: 0.1 } 
    );

    const sections = document.querySelectorAll(`.${styles.observeTrigger}`);
    sections.forEach((sec) => observer.observe(sec));

    return () => observer.disconnect();
  }, []);

  const products = [
    {
      id: 'prod-1',
      name: 'Qraytai',
      tagline: 'Create Content That Converts',
      description: 'All in one content hyper-personalization platform that can create content on scale based on the brand voice, custom avatars and SEO keyword targeting.',
      url: 'https://qrayt.ai.corpcrunch.io',
      image: '/assets/img/others/Qrayt web logo.gif', 
      theme: 'blue',
      available: true,
    },
    {
      id: 'prod-2',
      name: 'Prowess',
      tagline: 'Get PR on Demand',
      description: 'A Comprehensive PR-on-Demand Distribution platform that allows Instant access to Tier 1, 2, 3, and 4 publishing channels through a single unified platform, eliminating the need to manage multiple vendor relationships.',
      url: 'https://prowess.corpcrunch.io',
      image: '/assets/img/others/Prowess logo.png',
      theme: 'orange',
      available: true,
    },
    {
      id: 'prod-3',
      name: 'Cnvrsn',
      tagline: 'Identify and Stop Media Leakage. Maximize Omnichannel Advertising Distribution and ROI',
      description: 'A cutting-edge programmatic advertising platform that combines innovative CPL-based capabilities with full-spectrum programmatic solutions across OTT, ad networks, DOOH, and beyond.',
      url: 'https://cnvrsn.corpcrunch.io',
      image: '/assets/img/others/cnversn.png',
      theme: 'pink',
      available: false, // Coming soon
    }
  ];

  return (
    <Layout headTitle="Products - CorpCrunch">
      <SocialShareRibbon />

      <div className={`${styles.productsPage} ${isDarkMode ? styles.darkMode : styles.lightMode}`}>
        
        <button onClick={toggleTheme} className={styles.themeToggleBtn} aria-label="Toggle Theme">
          {isDarkMode ? '☀️' : '🌙'}
        </button>

        {/* --- HERO SECTION --- */}
        <section className={styles.heroSection} id="hero">
          <div className={styles.heroContent}>
            <h1 className={styles.heroTitle}>Explore Groundbreaking Technologies</h1>
            <p className={styles.heroDesc}>
            We are pioneering the integration of AI, machine learning, and advanced technologies into the heart of MarTech, MediaTech, and AdTech. We are committed to revolutionizing how brands interact with their audiences and optimize their media strategies.
            </p>
            <div className={styles.heroCapsule}>
              <div className={styles.capsuleText}>Welcome To The World Of High Media Tech</div>
            </div>
          </div>

          <div className={styles.heroVisual}>
            <div className={styles.mainImageContainer}>
               <Image 
                 src="/assets/img/others/Speaker.png" 
                 alt="Tech Abstract" 
                 fill
                 priority
                 className={styles.mainMockImage} 
               />
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
                <h2 className={styles.productName}>{product.name}</h2>
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

              <div className={`${styles.productVisual} ${
                product.theme === 'pink' 
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
  );
}