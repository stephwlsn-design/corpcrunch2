import styles from './ExploreOurWorks.module.css';

export default function ExploreOurWorks() {
  return (
    <section className={styles.exploreSection}>
      <div className={styles.container}>
        <div className={styles.contentWrapper}>
          {/* Left Side - Title */}
          <div className={styles.leftContent}>
            <h2 className={styles.title}>Popular Video</h2>
          </div>

        </div>
      </div>
    </section>
  );
}

