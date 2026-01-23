import Head from 'next/head';
import Link from 'next/link';
import Layout from '@/components/layout/Layout';
import { useEffect, useState } from 'react';
import styles from './404.module.css';

export default function Custom404() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <Layout headTitle="404 - Page Not Found | CorpCrunch">
      <Head>
        <meta name="robots" content="noindex, nofollow" />
      </Head>
      
      <div className={styles.errorPage}>
        <div className={styles.container}>
          <div className={`${styles.content} ${mounted ? styles.fadeIn : ''}`}>
            {/* Animated 404 Number */}
            <div className={styles.errorNumber}>
              <span className={styles.number4}>4</span>
              <span className={styles.number0}>0</span>
              <span className={styles.number4}>4</span>
            </div>

            {/* Error Message */}
            <div className={styles.errorContent}>
              <h1 className={styles.errorTitle}>Page Not Found</h1>
              <p className={styles.errorDescription}>
                Oops! The page you're looking for doesn't exist or has been moved.
                <br />
                Let's get you back on track.
              </p>

              {/* Action Buttons */}
              <div className={styles.actionButtons}>
                <Link href="/" className={styles.primaryButton}>
                  <span>Go to Homepage</span>
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                    <path 
                      d="M10 3L3 10H7V17H13V10H17L10 3Z" 
                      stroke="currentColor" 
                      strokeWidth="2" 
                      strokeLinecap="round" 
                      strokeLinejoin="round"
                    />
                  </svg>
                </Link>
                
                <button 
                  onClick={() => window.history.back()} 
                  className={styles.secondaryButton}
                >
                  <span>Go Back</span>
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                    <path 
                      d="M12.5 15L7.5 10L12.5 5" 
                      stroke="currentColor" 
                      strokeWidth="2" 
                      strokeLinecap="round" 
                      strokeLinejoin="round"
                    />
                  </svg>
                </button>
              </div>

              {/* Quick Links */}
              <div className={styles.quickLinks}>
                <p className={styles.quickLinksTitle}>Popular Pages:</p>
                <div className={styles.linksGrid}>
                  <Link href="/technology" className={styles.quickLink}>Technology</Link>
                  <Link href="/finance" className={styles.quickLink}>Finance</Link>
                  <Link href="/events" className={styles.quickLink}>Events</Link>
                  <Link href="/about" className={styles.quickLink}>About</Link>
                  <Link href="/contact" className={styles.quickLink}>Contact</Link>
                  <Link href="/products" className={styles.quickLink}>Products</Link>
                </div>
              </div>
            </div>

            {/* Decorative Elements */}
            <div className={styles.decorations}>
              <div className={styles.decoration1}></div>
              <div className={styles.decoration2}></div>
              <div className={styles.decoration3}></div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}

