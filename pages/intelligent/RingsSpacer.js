import React from 'react';
import styles from './RingsSpacer.module.css';

/**
 * Animated spacer with interlocking horizontal ring tracks.
 */
const RingsSpacer = () => {
  const numTracks = 3;
  const numRingsPerTrack = 16;
  const totalRingsPerTrack = numRingsPerTrack * 2;

  return (
    <div className={styles.ringsHero} aria-hidden="true">
      <div className={styles.ringsWrap}>
        <div className={styles.centralPlayIcon}></div>

        {[...Array(numTracks)].map((_, trackIndex) => (
          <div key={`track-${trackIndex}`} className={styles.ringsColumnContainer}>
            <div className={styles.ringsColumnScrolling}>
              {[...Array(totalRingsPerTrack)].map((_, i) => (
                <span key={`ring-${i}`} className={styles.ring}></span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RingsSpacer;
