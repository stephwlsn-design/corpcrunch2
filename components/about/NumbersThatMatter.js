import styles from './NumbersThatMatter.module.css';

export default function NumbersThatMatter({ stats, missionText }) {
  const defaultStats = [
    { label: 'Stories Published', value: '50K' },
    { label: 'Satisfied Clients', value: '2500+' },
    { label: 'Years of Industry Experience', value: '30+' },
    { label: 'Client Satisfaction Rate', value: '95%' },
  ];

  const defaultMissionText = 'Every number reflects our commitment to excellence, innovation, and delivering results to be explored.';

  const displayStats = stats && stats.length > 0 ? stats : defaultStats;
  const displayMissionText = missionText || defaultMissionText;

  return (
    <section className={styles.numbersSection}>
      {/* Main Content Grid */}
      <div className={styles.contentWrapper}>
        {/* Grid Layout: 2 rows x 3 columns */}
        <div className={styles.mainGrid}>
          {/* Top-Left: Title */}
          <div className={styles.gridCell} data-position="top-left">
            <h2 className={styles.title}>Numbers That Matter.</h2>
          </div>

          {/* Top-Middle: Stat 1 */}
          <div className={styles.gridCell} data-position="top-middle">
            <div className={styles.statCard}>
              <div className={styles.statValue}>{displayStats[0]?.value || '50K'}</div>
              <div className={styles.statLabel}>{displayStats[0]?.label || 'Stories Published'}</div>
            </div>
          </div>

          {/* Top-Right: Stat 2 */}
          <div className={styles.gridCell} data-position="top-right">
            <div className={styles.statCard}>
              <div className={styles.statValue}>{displayStats[1]?.value || '2500+'}</div>
              <div className={styles.statLabel}>{displayStats[1]?.label || 'Satisfied Clients'}</div>
            </div>
          </div>

          {/* Bottom-Left: Two Stats Side by Side */}
          <div className={styles.gridCell} data-position="bottom-left">
            <div className={styles.bottomLeftStats}>
              <div className={styles.statCard}>
                <div className={styles.statValue}>{displayStats[2]?.value || '30+'}</div>
                <div className={styles.statLabel}>{displayStats[2]?.label || 'Years of Industry Experience'}</div>
              </div>
              <div className={styles.statCard}>
                <div className={styles.statValue}>{displayStats[3]?.value || '95%'}</div>
                <div className={styles.statLabel}>{displayStats[3]?.label || 'Client Satisfaction Rate'}</div>
              </div>
            </div>
          </div>

          {/* Bottom-Middle: Empty Cell */}
          <div className={styles.gridCell} data-position="bottom-middle">
          </div>

          {/* Bottom-Right: Mission Text */}
          <div className={styles.gridCell} data-position="bottom-right">
            <p className={styles.missionText}>{displayMissionText}</p>
          </div>
        </div>
      </div>
    </section>
  );
}

