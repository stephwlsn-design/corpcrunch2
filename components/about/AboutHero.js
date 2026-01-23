import { useState, useEffect } from 'react';
import styles from './AboutHero.module.css';

export default function AboutHero() {
  const [currentTime, setCurrentTime] = useState('');

  useEffect(() => {
    // Get current time in GMT+6
    const updateTime = () => {
      const now = new Date();
      const gmt6Time = new Date(now.getTime() + (6 * 60 * 60 * 1000));
      const hours = gmt6Time.getUTCHours();
      const minutes = gmt6Time.getUTCMinutes();
      const ampm = hours >= 12 ? 'PM' : 'AM';
      const displayHours = hours % 12 || 12;
      const displayMinutes = minutes.toString().padStart(2, '0');
      setCurrentTime(`(GMT+6) ${displayHours}:${displayMinutes} ${ampm}`);
    };

    updateTime();
    const interval = setInterval(updateTime, 60000); // Update every minute

    return () => clearInterval(interval);
  }, []);

  return (
    <section className={styles.aboutHero}>
      {/* Vertical Text - Left */}
      <div className={styles.verticalTextLeft}>
        <div className={styles.verticalTextTop}>7 SMART PEOPLE</div>
      </div>

      {/* Main Content */}
      <div className={styles.heroContent}>
        {/* Gradient Bar with About_ - Left Side */}
        <div className={styles.gradientBar}>
          <span className={styles.aboutText}>About_</span>
          <div className={styles.gridIcon}>
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <circle cx="2" cy="2" r="1.5" fill="currentColor" />
              <circle cx="6" cy="2" r="1.5" fill="currentColor" />
              <circle cx="10" cy="2" r="1.5" fill="currentColor" />
              <circle cx="14" cy="2" r="1.5" fill="currentColor" />
              <circle cx="18" cy="2" r="1.5" fill="currentColor" />
              <circle cx="2" cy="6" r="1.5" fill="currentColor" />
              <circle cx="6" cy="6" r="1.5" fill="currentColor" />
              <circle cx="10" cy="6" r="1.5" fill="currentColor" />
              <circle cx="14" cy="6" r="1.5" fill="currentColor" />
              <circle cx="18" cy="6" r="1.5" fill="currentColor" />
              <circle cx="2" cy="10" r="1.5" fill="currentColor" />
              <circle cx="6" cy="10" r="1.5" fill="currentColor" />
              <circle cx="10" cy="10" r="1.5" fill="currentColor" />
              <circle cx="14" cy="10" r="1.5" fill="currentColor" />
              <circle cx="18" cy="10" r="1.5" fill="currentColor" />
              <circle cx="2" cy="14" r="1.5" fill="currentColor" />
              <circle cx="6" cy="14" r="1.5" fill="currentColor" />
              <circle cx="10" cy="14" r="1.5" fill="currentColor" />
              <circle cx="14" cy="14" r="1.5" fill="currentColor" />
              <circle cx="18" cy="14" r="1.5" fill="currentColor" />
              <circle cx="2" cy="18" r="1.5" fill="currentColor" />
              <circle cx="6" cy="18" r="1.5" fill="currentColor" />
              <circle cx="10" cy="18" r="1.5" fill="currentColor" />
              <circle cx="14" cy="18" r="1.5" fill="currentColor" />
              <circle cx="18" cy="18" r="1.5" fill="currentColor" />
            </svg>
          </div>
        </div>

        {/* Main Message - Right Side */}
        <div className={styles.mainMessage}>
          <div className={styles.messageLine}>
            <span className={styles.messageText}>WE</span>
            <span className={styles.messageText}> BUILD</span>
          </div>
          <div className={styles.messageLine}>
            <span className={styles.messageTextMediumGray}>WE</span>
            <span className={styles.messageText}> DESIGN</span>
          </div>
          <div className={styles.messageLine}>
            <span className={styles.messageTextDarkGray}>WE</span>
            <span className={styles.messageText}> INNOVATE</span>
          </div>
        </div>
      </div>

      {/* Vertical Text - Right */}
      <div className={styles.verticalTextRight}>
        <div className={styles.verticalTextTop}>{currentTime || '(GMT+6) 12:10 PM'}</div>
      </div>
    </section>
  );
}

