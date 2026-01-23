import { useState, useEffect } from 'react';
import Layout from '@/components/layout/Layout';
import styles from './Products.module.css';
import SocialShareRibbon from '@/components/elements/SocialShareRibbon';

export default function ProductsPage() {
  const [hoveredProduct, setHoveredProduct] = useState(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const products = [
    {
      id: 1,
      name: 'Prowess',
      description: 'Empowering businesses with cutting-edge solutions and innovative technology platforms.',
      url: 'https://prowess.corpcrunch.io',
      color: '#ff2092', // Primary pink
      gradient: 'linear-gradient(135deg, #ff2092 0%, #ff4da6 100%)',
      icon: '🚀',
      features: ['Advanced Analytics', 'Real-time Insights', 'Scalable Infrastructure']
    },
    {
      id: 2,
      name: 'Qrayt',
      description: 'Revolutionary platform transforming how businesses interact with data and intelligence.',
      url: 'https://qrayt.com',
      color: '#2551e7', // Primary blue
      gradient: 'linear-gradient(135deg, #2551e7 0%, #4d6feb 100%)',
      icon: '✨',
      features: ['AI-Powered', 'Data Intelligence', 'Smart Automation']
    },
    {
      id: 3,
      name: 'StephanyAI',
      description: 'Next-generation AI assistant designed to enhance productivity and streamline workflows.',
      url: 'https://stephanyai.com',
      color: '#ff2092', // Primary pink
      gradient: 'linear-gradient(135deg, #ff2092 0%, #a855f7 100%)',
      icon: '🤖',
      features: ['Natural Language', 'Workflow Automation', 'Intelligent Assistance']
    }
  ];

  return (
    <Layout headTitle="Products - CorpCrunch">
      <SocialShareRibbon />
      <div className={styles.productsPage}>
        {/* Hero Section */}
        <section className={styles.heroSection}>
          <div className={styles.heroContent}>
            <div className={`${styles.heroBadge} ${isVisible ? styles.fadeInUp : ''}`}>
              <span className={styles.badgeText}>Our Products</span>
              <div className={styles.badgeGrid}>
                {Array.from({ length: 9 }).map((_, i) => (
                  <span key={i} className={styles.badgeDot} />
                ))}
              </div>
            </div>
            <h1 className={`${styles.heroTitle} ${isVisible ? styles.fadeInUp : ''}`}>
              <span>Innovative</span>
              <span>Solutions</span>
              <span>For Modern</span>
              <span>Business</span>
            </h1>
            <p className={`${styles.heroDescription} ${isVisible ? styles.fadeInUp : ''}`}>
              Discover our suite of powerful products designed to transform your business operations
              and drive growth in the digital age.
            </p>
          </div>
          <div className={styles.heroShapes}>
            <div className={styles.shape1}></div>
            <div className={styles.shape2}></div>
            <div className={styles.shape3}></div>
          </div>
        </section>

        {/* Products Grid */}
        <section className={styles.productsSection}>
          <div className={styles.container}>
            <div className={styles.productsGrid}>
              {products.map((product, index) => (
                <div
                  key={product.id}
                  className={`${styles.productCard} ${isVisible ? styles.fadeInUp : ''}`}
                  style={{ animationDelay: `${index * 0.2}s` }}
                  onMouseEnter={() => setHoveredProduct(product.id)}
                  onMouseLeave={() => setHoveredProduct(null)}
                >
                  <div className={styles.cardInner}>
                    {/* Animated Background */}
                    <div 
                      className={styles.cardBackground}
                      style={{ 
                        background: hoveredProduct === product.id 
                          ? product.gradient 
                          : 'transparent'
                      }}
                    ></div>

                    {/* Icon */}
                    <div className={styles.productIcon}>
                      <span className={styles.iconEmoji}>{product.icon}</span>
                      <div 
                        className={styles.iconGlow}
                        style={{ 
                          background: hoveredProduct === product.id 
                            ? product.gradient 
                            : 'transparent'
                        }}
                      ></div>
                    </div>

                    {/* Content */}
                    <div className={styles.productContent}>
                      <h2 className={styles.productName}>{product.name}</h2>
                      <p className={styles.productDescription}>{product.description}</p>
                      
                      {/* Features */}
                      <ul className={styles.productFeatures}>
                        {product.features.map((feature, idx) => (
                          <li key={idx} className={styles.featureItem}>
                            <span className={styles.featureDot}></span>
                            {feature}
                          </li>
                        ))}
                      </ul>

                      {/* CTA Button */}
                      <a
                        href={product.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={styles.productButton}
                        style={{
                          background: hoveredProduct === product.id 
                            ? product.gradient 
                            : '#ffffff',
                          color: hoveredProduct === product.id 
                            ? '#ffffff' 
                            : product.color,
                          boxShadow: hoveredProduct === product.id
                            ? `0 10px 40px ${product.color}40`
                            : '0 4px 20px rgba(0, 0, 0, 0.1)'
                        }}
                      >
                        <span>Visit Website</span>
                        <svg 
                          width="20" 
                          height="20" 
                          viewBox="0 0 20 20" 
                          fill="none"
                          className={styles.buttonArrow}
                        >
                          <path 
                            d="M7.5 5L12.5 10L7.5 15" 
                            stroke="currentColor" 
                            strokeWidth="2" 
                            strokeLinecap="round" 
                            strokeLinejoin="round"
                          />
                        </svg>
                      </a>
                    </div>

                    {/* Decorative Elements */}
                    <div className={styles.cardDecorations}>
                      <div className={styles.decoration1}></div>
                      <div className={styles.decoration2}></div>
                      <div className={styles.decoration3}></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className={styles.ctaSection}>
          <div className={styles.container}>
            <div className={styles.ctaContent}>
              <h2 className={styles.ctaTitle}>Ready to Transform Your Business?</h2>
              <p className={styles.ctaDescription}>
                Explore our products and discover how we can help you achieve your goals.
              </p>
              <div className={styles.ctaButtons}>
                <a href="/contact" className={styles.ctaButtonPrimary}>
                  Get in Touch
                </a>
               
              </div>
            </div>
          </div>
        </section>
      </div>
    </Layout>
  );
}

