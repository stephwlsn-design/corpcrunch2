import { useState, useEffect } from 'react';
import Layout from '@/components/layout/Layout';
import DownloadCard from '@/components/card/DownloadCard';
import { magazines } from '@/util/magazineData';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Pagination } from 'swiper';
import { useLanguage } from '@/contexts/LanguageContext';
import styles from './E-Magazine.module.css';
import SocialShareRibbon from '@/components/elements/SocialShareRibbon';

export default function EMagazinePage() {
  const { t } = useLanguage();
  const [isVisible, setIsVisible] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('all');

  useEffect(() => {
    setIsVisible(true);
  }, []);

  // Categories can be extracted from magazines if needed
  const categories = ['all', 'business', 'technology', 'finance', 'real-estate'];

  return (
    <Layout headTitle="E-Magazine Library - CorpCrunch">
      <SocialShareRibbon />
      <div className={styles.magazinePage}>
        {/* Hero Section */}
        <section className={styles.heroSection}>
          <div className={styles.heroContent}>
            <div className={`${styles.heroBadge} ${isVisible ? styles.fadeInUp : ''}`}>
              <span className={styles.badgeText}>E-Magazine Library</span>
              <div className={styles.badgeGrid}>
                {Array.from({ length: 9 }).map((_, i) => (
                  <span key={i} className={styles.badgeDot} />
                ))}
              </div>
            </div>
            <h1 className={`${styles.heroTitle} ${isVisible ? styles.fadeInUp : ''}`}>
              <span>Digital</span>
              <span>Magazines</span>
              <span>Collection</span>
            </h1>
            <p className={`${styles.heroDescription} ${isVisible ? styles.fadeInUp : ''}`}>
              Explore our curated collection of digital magazines covering the latest trends,
              insights, and stories from the world of business and technology.
            </p>
          </div>
          <div className={styles.heroShapes}>
            <div className={styles.shape1}></div>
            <div className={styles.shape2}></div>
            <div className={styles.shape3}></div>
          </div>
        </section>

        {/* Magazines Grid Section */}
        <section className={styles.magazinesSection}>
          <div className={styles.container}>
            {/* Filter Section (if needed in future) */}
            {categories.length > 1 && (
              <div className={styles.filterSection}>
                <div className={styles.filterButtons}>
                  {categories.map((category) => (
                    <button
                      key={category}
                      className={`${styles.filterButton} ${
                        selectedCategory === category ? styles.filterButtonActive : ''
                      }`}
                      onClick={() => setSelectedCategory(category)}
                    >
                      {category === 'all' ? 'All Magazines' : category.charAt(0).toUpperCase() + category.slice(1)}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Magazines Grid */}
            <div className={styles.magazinesGrid}>
              {magazines.length > 0 ? (
                magazines.map((magazine, index) => (
                  <div
                    key={index}
                    className={`${styles.magazineCard} ${isVisible ? styles.fadeInUp : ''}`}
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    <div className={styles.cardWrapper}>
                      <DownloadCard
                        imageUrl={magazine.imageUrl}
                        pdfUrl={magazine.pdfUrl}
                        title={magazine.title}
                      />
                    </div>
                  </div>
                ))
              ) : (
                <div className={styles.emptyState}>
                  <div className={styles.emptyIcon}>📚</div>
                  <h3 className={styles.emptyTitle}>No Magazines Available</h3>
                  <p className={styles.emptyDescription}>
                    Check back soon for new digital magazines.
                  </p>
                </div>
              )}
            </div>

            {/* Swiper Carousel for Mobile/Tablet */}
            {magazines.length > 0 && (
              <div className={styles.magazinesCarousel}>
                <Swiper
                  modules={[Autoplay, Pagination]}
                  slidesPerView={1}
                  spaceBetween={20}
                  loop={magazines.length > 3}
                  autoplay={{
                    delay: 3000,
                    disableOnInteraction: false,
                  }}
                  pagination={{
                    clickable: true,
                  }}
                  breakpoints={{
                    480: {
                      slidesPerView: 2,
                      spaceBetween: 20,
                    },
                    768: {
                      slidesPerView: 3,
                      spaceBetween: 30,
                    },
                    1024: {
                      slidesPerView: 4,
                      spaceBetween: 30,
                    },
                  }}
                  className={styles.swiperContainer}
                >
                  {magazines.map((magazine, index) => (
                    <SwiperSlide key={index}>
                      <div className={styles.carouselCard}>
                        <DownloadCard
                          imageUrl={magazine.imageUrl}
                          pdfUrl={magazine.pdfUrl}
                          title={magazine.title}
                        />
                      </div>
                    </SwiperSlide>
                  ))}
                </Swiper>
              </div>
            )}
          </div>
        </section>

        {/* CTA Section */}
        <section className={styles.ctaSection}>
          <div className={styles.container}>
            <div className={styles.ctaContent}>
              <h2 className={styles.ctaTitle}>Stay Updated with Our Latest Magazines</h2>
              <p className={styles.ctaDescription}>
                Subscribe to get notified when new digital magazines are published.
              </p>
              <a href="/subscribe" className={styles.ctaButton}>
                Subscribe Now
              </a>
            </div>
          </div>
        </section>
      </div>
    </Layout>
  );
}

