import { useState, useEffect } from 'react';
import Image from 'next/image';
import Layout from '@/components/layout/Layout';
import SocialShareRibbon from '@/components/elements/SocialShareRibbon';
import ProductInquiryModal from '@/components/elements/ProductInquiryModal';
import styles from './Products.module.css';
import { buildProductsSeo } from '@/lib/seoHelpers';
import { PRODUCT_ID_TO_INQUIRY } from '@/lib/productInquiryOptions';

const productsSeo = buildProductsSeo();

export default function ProductsPage() {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [visibleSections, setVisibleSections] = useState({});
  const [inquiryModalOpen, setInquiryModalOpen] = useState(false);
  const [selectedInquiryTopic, setSelectedInquiryTopic] = useState('general');
  const [selectedProductName, setSelectedProductName] = useState('');

  const openProductInquiry = (product) => {
    setSelectedInquiryTopic(PRODUCT_ID_TO_INQUIRY[product.id] || 'general');
    setSelectedProductName(product.name);
    setInquiryModalOpen(true);
  };

  const closeProductInquiry = () => {
    setInquiryModalOpen(false);
  };

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

    observerInterval = setInterval(setupObserver, 300);
    setupObserver();

    return () => {
      clearInterval(observerInterval);
      if (observer) observer.disconnect();
    };
  }, []);

  const products = [
    {
      id: 'prod-curi',
      name: 'curi',
      tagline: 'Turn any URL into a complete marketing engine',
      description:
        'Curi discovers your brand, creates content for every platform, and launches full campaigns — all from a single website link. No agency. No guesswork.',
      url: 'https://curi.corpcrunch.io/',
      image: '/assets/img/others/curi-mascot.png',
      theme: 'pink',
      available: true,
      useLogo: false,
    },
    {
      id: 'prod-1',
      name: 'Qrayt AI',
      tagline: 'Create Content That Converts',
      description: 'All in one content hyper-personalization platform that can create content on scale based on the brand voice, custom avatars and SEO keyword targeting.',
      url: 'https://qrayt.ai.corpcrunch.io',
      image: '/assets/img/others/qrayt-logo.png',
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
      image: '/assets/img/others/Prowess.png',
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

      <Layout seo={productsSeo}>
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
                <div className={styles.heroCtaStack}>
                  <div className={styles.heroCapsule}>
                    <div className={styles.capsuleText}>Welcome To The World Of High Media Tech</div>
                  </div>
                  <button
                    type="button"
                    className={`${styles.btnPrimary} ${styles.heroCtaBtn}`}
                    onClick={() => {
                      setSelectedInquiryTopic('general');
                      setSelectedProductName('');
                      setInquiryModalOpen(true);
                    }}
                  >
                    Get in Touch
                  </button>
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

                    <div className={styles.productActions}>
                      <button
                        type="button"
                        className={styles.btnPrimary}
                        onClick={() => openProductInquiry(product)}
                      >
                        Get in Touch
                      </button>
                      {product.available && (
                        <a
                          href={product.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={styles.btnOutline}
                        >
                          Visit Website
                        </a>
                      )}
                    </div>
                  </div>

                  <div
                    role="button"
                    tabIndex={0}
                    className={`${styles.productVisual} ${styles.productVisualButton}`}
                    onClick={() => openProductInquiry(product)}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter' || event.key === ' ') {
                        event.preventDefault();
                        openProductInquiry(product);
                      }
                    }}
                    aria-label={`Learn more about ${product.name}`}
                  >
                    <div className={styles.visualWrapper}>
                      {product.image ? (
                        <Image
                          src={product.image}
                          alt={product.name}
                          fill
                          sizes="(max-width: 768px) 100vw, 50vw"
                          className={`${styles.centeredImage} ${
                            product.visualStyle === 'wordmark' ? styles.wordmarkImage : ''
                          }`}
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

          <ProductInquiryModal
            isOpen={inquiryModalOpen}
            onClose={closeProductInquiry}
            initialInquiryTopic={selectedInquiryTopic}
            productName={selectedProductName}
          />
        </Layout>
    </>
  );
}