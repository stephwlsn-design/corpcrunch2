import Head from 'next/head';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import Layout from '@/components/layout/Layout';
import styles from './_error.module.css';

function Error({ statusCode }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const is404 = statusCode === 404;
  const is500 = statusCode === 500 || !statusCode;

  return (
    <Layout headTitle={`${statusCode || 'Error'} - ${is404 ? 'Page Not Found' : 'Server Error'} | CorpCrunch`}>
      <Head>
        <meta name="robots" content="noindex, nofollow" />
      </Head>
      
      <div className={`${styles.errorPage} ${is404 ? styles.error404 : styles.error500}`}>
        <div className={styles.container}>
          <div className={`${styles.content} ${mounted ? styles.fadeIn : ''}`}>
            {/* Animated Error Number */}
            <div className={styles.errorNumber}>
              {is404 ? (
                <>
                  <span className={styles.number4}>4</span>
                  <span className={styles.number0}>0</span>
                  <span className={styles.number4}>4</span>
                </>
              ) : (
                <>
                  <span className={styles.number5}>5</span>
                  <span className={styles.number0}>0</span>
                  <span className={styles.number0}>0</span>
                </>
              )}
            </div>

            {/* Error Message */}
            <div className={styles.errorContent}>
              <h1 className={styles.errorTitle}>
                {is404 ? 'Page Not Found' : 'Internal Server Error'}
              </h1>
              <p className={styles.errorDescription}>
                {is404 ? (
                  <>
                    Oops! The page you're looking for doesn't exist or has been moved.
                    <br />
                    Let's get you back on track.
                  </>
                ) : (
                  <>
                    We're experiencing some technical difficulties.
                    <br />
                    Our team has been notified and is working to fix the issue.
                  </>
                )}
              </p>

              {/* Status Code */}
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
                
                {is404 ? (
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
                ) : (
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
                )}
              </div>

              {/* Quick Links / Help Section */}
              <div className={styles.helpSection}>
                {is404 ? (
                  <>
                    <p className={styles.helpTitle}>Popular Pages:</p>
                    <div className={styles.linksGrid}>
                      <Link href="/technology" className={styles.quickLink}>Technology</Link>
                      <Link href="/finance" className={styles.quickLink}>Finance</Link>
                      <Link href="/events" className={styles.quickLink}>Events</Link>
                      <Link href="/about" className={styles.quickLink}>About</Link>
                      <Link href="/contact" className={styles.quickLink}>Contact</Link>
                      <Link href="/products" className={styles.quickLink}>Products</Link>
                    </div>
                  </>
                ) : (
                  <>
                    <p className={styles.helpTitle}>Need Help?</p>
                    <div className={styles.helpLinks}>
                      <Link href="/contact" className={styles.helpLink}>
                        Contact Support
                      </Link>
                      <Link href="/about" className={styles.helpLink}>
                        About Us
                      </Link>
                    </div>
                  </>
                )}
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

Error.getInitialProps = ({ res, err }) => {
  const statusCode = res ? res.statusCode : err ? err.statusCode : 404;
  return { statusCode };
};

export default Error;

