import Head from 'next/head';
import Link from 'next/link';
import Layout from '@/components/layout/Layout';
import { useEffect, useState } from 'react';
import styles from './500.module.css';

export default function Custom500({ statusCode }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <Layout headTitle="500 - Server Error | CorpCrunch">
      <Head>
        <meta name="robots" content="noindex, nofollow" />
      </Head>
      
      <div className={styles.errorPage}>
        <div className={styles.container}>
          <div className={`${styles.content} ${mounted ? styles.fadeIn : ''}`}>
            {/* Animated 500 Number */}
            <div className={styles.errorNumber}>
              <span className={styles.number5}>5</span>
              <span className={styles.number0}>0</span>
              <span className={styles.number0}>0</span>
            </div>

            {/* Error Message */}
            <div className={styles.errorContent}>
              <h1 className={styles.errorTitle}>Internal Server Error</h1>
              <p className={styles.errorDescription}>
                We're experiencing some technical difficulties.
                <br />
                Our team has been notified and is working to fix the issue.
              </p>

              {/* Status Code (if provided) */}
              {statusCode && (
                <div className={styles.statusCode}>
                  Error Code: <span>{statusCode}</span>
                </div>
              )}

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
                  onClick={() => window.location.reload()} 
                  className={styles.secondaryButton}
                >
                  <span>Try Again</span>
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                    <path 
                      d="M17.5 2.5V7.5H12.5M2.5 17.5V12.5H7.5M17.5 17.5L13.75 13.75M6.25 6.25L2.5 2.5M13.75 13.75C12.5 15 10.5 15.5 8.75 15M6.25 6.25C7.5 5 9.5 4.5 11.25 5" 
                      stroke="currentColor" 
                      strokeWidth="2" 
                      strokeLinecap="round" 
                      strokeLinejoin="round"
                    />
                  </svg>
                </button>
              </div>

              {/* Help Section */}
              <div className={styles.helpSection}>
                <p className={styles.helpTitle}>Need Help?</p>
                <div className={styles.helpLinks}>
                  <Link href="/contact" className={styles.helpLink}>
                    Contact Support
                  </Link>
                  <Link href="/about" className={styles.helpLink}>
                    About Us
                  </Link>
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

