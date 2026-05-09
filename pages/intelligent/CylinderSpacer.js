import React from 'react';
import styles from './CylinderSpacer.module.css';

/**
 * CylinderSpacer Component
 * An animated vertical stack of elliptical rings moving upward continuously.
 */
const CylinderSpacer = () => {
  // Number of rings in one complete stack.
  // We double this in the render to create the seamless infinite scroll.
  const numRingsPerStack = 20;
  const totalRings = numRingsPerStack * 2;

  return (
    <div className={styles.cylinderHero} aria-hidden="true">
      <div className={styles.cylinderWrap}>
        <div className={styles.cylinderScrolling}>
          {[...Array(totalRings)].map((_, i) => (
            <span key={`ring-${i}`} className={styles.ellipseRing}></span>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CylinderSpacer;
