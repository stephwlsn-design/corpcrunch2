import React from 'react';
import styles from './HamburgerIcon.module.css';

const HamburgerIcon = ({ onClick, className = '', ariaLabel = 'Menu' }) => {
  const handleKeyDown = (event) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      if (onClick) {
        onClick(event);
      }
    }
  };

  return (
    <div
      role="button"
      tabIndex={0}
      className={`${styles.hamburgerIcon} ${className}`}
      onClick={onClick}
      onKeyDown={handleKeyDown}
      aria-label={ariaLabel}
    >
      <span className={styles.line1}></span>
      <span className={styles.line2}></span>
      <span className={styles.line3}></span>
    </div>
  );
};

export default HamburgerIcon;

