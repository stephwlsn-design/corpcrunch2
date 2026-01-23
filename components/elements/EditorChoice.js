import React from 'react';
import Link from 'next/link';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';
import styles from './EditorChoice.module.css';

const editorCards = [
  {
    id: 1,
    title: 'Market Analysis',
    description: 'Q1 2026 economic forecasts and emerging investment opportunities.',
    tag: 'Trend Analysis',
    icon: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=400&h=400&fit=crop&auto=format',
    categoryLink: '/market-analysis',
  },
  {
    id: 2,
    title: 'Digital Retail',
    description: 'AI-powered shopping experiences reshaping consumer behavior in 2026.',
    tag: 'Retail Tech',
    icon: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=400&h=400&fit=crop&auto=format',
    categoryLink: '/digital-retail',
  },
  {
    id: 3,
    title: 'FinTech Growth',
    description: 'Revolutionary payment systems and blockchain adoption across industries.',
    tag: 'Finance',
    icon: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?w=400&h=400&fit=crop&auto=format',
    categoryLink: '/fintech-growth',
  },
  {
    id: 4,
    title: 'Cyber Security',
    description: 'Advanced threat detection strategies for enterprise data protection.',
    tag: 'Security',
    icon: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=400&h=400&fit=crop&auto=format',
    categoryLink: '/cyber-security',
  },
  {
    id: 5,
    title: 'AI Innovation',
    description: 'Generative AI transforming business operations and creative workflows.',
    tag: 'Automation',
    icon: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=400&h=400&fit=crop&auto=format',
    categoryLink: '/ai-innovation',
  },
  {
    id: 6,
    title: 'Strategic Planning',
    description: 'Building adaptive frameworks for uncertain economic landscapes.',
    tag: 'Business',
    icon: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=400&h=400&fit=crop&auto=format',
    categoryLink: '/strategic-planning',
  },
  {
    id: 7,
    title: 'Cloud Solutions',
    description: 'Edge computing and multi-cloud strategies driving digital transformation.',
    tag: 'Infrastructure',
    icon: 'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=400&h=400&fit=crop&auto=format',
    categoryLink: '/cloud-solutions',
  },
  {
    id: 8,
    title: 'Data Insights',
    description: 'Real-time analytics platforms enabling data-driven decision making.',
    tag: 'Big Data',
    icon: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=400&fit=crop&auto=format',
    categoryLink: '/data-insights',
  },
];

export default function EditorChoice({ isLoading = false }) {
  if (isLoading) {
    return (
      <section className={styles.editorSection}>
        <div className={styles.container}>
          <div className={styles.editorGrid}>
            <div className={styles.headerBlock}>
              <Skeleton width={300} height={60} baseColor="#f0f0f0" highlightColor="#f9f9f9" />
              <div className="mt-3">
                <Skeleton width="100%" height={20} count={3} baseColor="#f0f0f0" highlightColor="#f9f9f9" />
              </div>
            </div>
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <div key={i} className={styles.productCard}>
                <div className={styles.cardInfo}>
                  <Skeleton width="60%" height={24} baseColor="#f0f0f0" highlightColor="#f9f9f9" />
                  <Skeleton width="100%" height={16} count={2} baseColor="#f0f0f0" highlightColor="#f9f9f9" />
                  <Skeleton width={80} height={16} borderRadius={8} baseColor="#f0f0f0" highlightColor="#f9f9f9" />
                </div>
                <div className={styles.cardIconWrapper}>
                  <Skeleton width={60} height={60} borderRadius={8} baseColor="#f0f0f0" highlightColor="#f9f9f9" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className={styles.editorSection}>
      <div className={styles.container}>
        <div className={styles.editorGrid}>
          {/* Header Block */}
          <div className={styles.headerBlock}>
            <h2 className={styles.mainTitle}>Editor's Choice <br /> January 2026</h2>
            <p className={styles.mainSubtitle}>
              Our curated selection of the most impactful stories, 
              technological breakthroughs, and market shifts 
              defining the corporate landscape this month.
            </p>
          </div>

          {/* Cards */}
          {editorCards.map((card) => (
            <Link key={card.id} href={card.categoryLink} className={styles.productCard}>
              <div className={styles.cardInfo}>
                <h3 className={styles.cardTitle}>{card.title}</h3>
                <p className={styles.cardDescription}>{card.description}</p>
                <div className={styles.cardTag}>{card.tag}</div>
              </div>
              <div className={styles.cardIconWrapper}>
                <img src={card.icon} alt={card.title} className={styles.cardIcon} />
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
