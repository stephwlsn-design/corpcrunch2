import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useCookieConsent } from '@/contexts/CookieConsentContext';
import styles from './CookieConsentBanner.module.css';

export default function CookieConsentBanner() {
  const { hasConsented, isReady, acceptCookies, declineCookies } = useCookieConsent();
  const [declinedMessage, setDeclinedMessage] = useState(false);

  const isOpen = isReady && !hasConsented;

  useEffect(() => {
    if (typeof document === 'undefined') return undefined;

    if (isOpen) {
      const previousOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = previousOverflow;
      };
    }

    document.body.style.overflow = '';
    return undefined;
  }, [isOpen]);

  if (!isOpen) return null;

  const handleDecline = () => {
    setDeclinedMessage(true);
    declineCookies();
  };

  return (
    <div className={styles.overlay} role="presentation">
      <div
        className={styles.modal}
        role="dialog"
        aria-modal="true"
        aria-labelledby="cookie-consent-title"
        aria-describedby="cookie-consent-description"
      >
        <div className={styles.iconWrap} aria-hidden="true">
          <span className={styles.icon}>🍪</span>
        </div>

        <h2 id="cookie-consent-title" className={styles.title}>
          Cookies required to continue
        </h2>

        <p id="cookie-consent-description" className={styles.description}>
          Corp Crunch uses cookies to collect visitor data to improve our content, analyze site
          traffic, and personalize your experience on corpcrunch.io and corpcrunch.ai.
        </p>

        <p className={styles.notice}>
          You must accept cookies to access this website.
        </p>

        {declinedMessage && (
          <p className={styles.declinedAlert} role="alert">
            Access is blocked until you accept cookies. Please click &quot;Accept&quot; to continue.
          </p>
        )}

        <div className={styles.actions}>
          <button type="button" className={styles.acceptBtn} onClick={acceptCookies}>
            Accept
          </button>
          <button type="button" className={styles.declineBtn} onClick={handleDecline}>
            Decline
          </button>
        </div>

        <Link
          href="/privacy-policy"
          className={styles.link}
          target="_blank"
          rel="noopener noreferrer"
        >
          Read our Privacy Policy
        </Link>
      </div>
    </div>
  );
}
