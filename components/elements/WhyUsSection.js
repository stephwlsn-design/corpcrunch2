import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';
import styles from './WhyUsSection.module.css';

export default function WhyUsSection({ trendingPosts = [], isLoading = false }) {
  const [scrollIndex, setScrollIndex] = useState(0);

  // Auto-scroll through posts (upward animation)
  useEffect(() => {
    if (trendingPosts.length === 0) return;

    const interval = setInterval(() => {
      setScrollIndex((prev) => (prev + 1) % trendingPosts.length);
    }, 3000); // Change every 3 seconds

    return () => clearInterval(interval);
  }, [trendingPosts.length]);


  // Get posts for the 3 sections (with cycling)
  const getPostForSection = (sectionIndex) => {
    if (trendingPosts.length === 0) return null;
    const index = (scrollIndex + sectionIndex) % trendingPosts.length;
    return trendingPosts[index];
  };

  const post1 = getPostForSection(0);
  const post2 = getPostForSection(1);
  const post3 = getPostForSection(2);

  if (isLoading) {
    return (
      <section className={styles.whyUsSection}>
        <div className={styles.leftPanel}>
          <div className={styles.leftPanelContent}>
            <Skeleton width={100} height={20} />
            <Skeleton width={150} height={40} className="my-3" />
            <Skeleton width={100} height={20} />
          </div>
        </div>
        <div className={styles.rightPanel}>
          <div className={styles.newsSections}>
            {[1, 2, 3].map((i) => (
              <div key={i} className={styles.newsItem} style={{ padding: '20px' }}>
                <Skeleton height={150} borderRadius={12} />
                <div className="mt-3">
                  <Skeleton width="80%" height={24} />
                  <Skeleton width="100%" height={16} count={2} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className={styles.whyUsSection}>
      {/* Left Panel */}
      <div className={styles.leftPanel}>
        <div className={styles.leftPanelContent}>
          <h2 className={styles.trendingNewsTitle}>Trending News</h2>
        </div>
      </div>

      {/* Right Panel */}
      <div className={styles.rightPanel}>
        {/* Auto-scrolling News Sections */}
        <div className={styles.newsSections}>
          {/* Section 1 */}
          <div 
            className={`${styles.newsItem} ${styles.newsItem1}`} 
            key={`post-1-${scrollIndex}`}
          >
            {post1 ? (
              <Link href={`/blog/${post1.slug || post1._id}`} className={styles.newsLink}>
                {post1.bannerImageUrl && (
                  <div className={styles.newsImageWrapper}>
                    <Image
                      src={post1.bannerImageUrl}
                      alt={post1.title || 'Trending News'}
                      fill
                      className={styles.newsImage}
                      style={{ objectFit: 'cover' }}
                      quality={80}
                      loading="lazy"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
                  </div>
                )}
                <div className={styles.newsContent}>
                  <h3 className={styles.newsTitle}>{post1.title || 'Trending News'}</h3>
                  {post1.excerpt && (
                    <p className={styles.newsExcerpt}>{post1.excerpt}</p>
                  )}
                  {post1.content && (
                    <div className={styles.newsText} dangerouslySetInnerHTML={{ 
                      __html: post1.content.substring(0, 200) + (post1.content.length > 200 ? '...' : '')
                    }} />
                  )}
                </div>
              </Link>
            ) : (
              <div className={styles.newsContent}>
                <h3 className={styles.newsTitle}>No trending news available</h3>
                <p className={styles.newsExcerpt}>Check back later for updates.</p>
              </div>
            )}
          </div>

          {/* Section 2 */}
          <div 
            className={`${styles.newsItem} ${styles.newsItem2}`} 
            key={`post-2-${scrollIndex}`}
          >
            {post2 ? (
              <Link href={`/blog/${post2.slug || post2._id}`} className={styles.newsLink}>
                {post2.bannerImageUrl && (
                  <div className={styles.newsImageWrapper}>
                    <Image
                      src={post2.bannerImageUrl}
                      alt={post2.title || 'Trending News'}
                      fill
                      className={styles.newsImage}
                      style={{ objectFit: 'cover' }}
                      quality={80}
                      loading="lazy"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
                  </div>
                )}
                <div className={styles.newsContent}>
                  <h3 className={styles.newsTitle}>{post2.title || 'Trending News'}</h3>
                  {post2.excerpt && (
                    <p className={styles.newsExcerpt}>{post2.excerpt}</p>
                  )}
                  {post2.content && (
                    <div className={styles.newsText} dangerouslySetInnerHTML={{ 
                      __html: post2.content.substring(0, 200) + (post2.content.length > 200 ? '...' : '')
                    }} />
                  )}
                </div>
              </Link>
            ) : (
              <div className={styles.newsContent}>
                <h3 className={styles.newsTitle}>No trending news available</h3>
                <p className={styles.newsExcerpt}>Check back later for updates.</p>
              </div>
            )}
          </div>

          {/* Section 3 */}
          <div 
            className={`${styles.newsItem} ${styles.newsItem3}`} 
            key={`post-3-${scrollIndex}`}
          >
            {post3 ? (
              <Link href={`/blog/${post3.slug || post3._id}`} className={styles.newsLink}>
                {post3.bannerImageUrl && (
                  <div className={styles.newsImageWrapper}>
                    <Image
                      src={post3.bannerImageUrl}
                      alt={post3.title || 'Trending News'}
                      fill
                      className={styles.newsImage}
                      style={{ objectFit: 'cover' }}
                      quality={80}
                      loading="lazy"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
                  </div>
                )}
                <div className={styles.newsContent}>
                  <h3 className={styles.newsTitle}>{post3.title || 'Trending News'}</h3>
                  {post3.excerpt && (
                    <p className={styles.newsExcerpt}>{post3.excerpt}</p>
                  )}
                  {post3.content && (
                    <div className={styles.newsText} dangerouslySetInnerHTML={{ 
                      __html: post3.content.substring(0, 200) + (post3.content.length > 200 ? '...' : '')
                    }} />
                  )}
                </div>
              </Link>
            ) : (
              <div className={styles.newsContent}>
                <h3 className={styles.newsTitle}>No trending news available</h3>
                <p className={styles.newsExcerpt}>Check back later for updates.</p>
              </div>
            )}
          </div>
        </div>

      </div>
    </section>
  );
}

