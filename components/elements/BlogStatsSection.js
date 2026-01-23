import React from "react";
import styles from "./BlogStatsSection.module.css";

export default function BlogStatsSection({
  quote,
  quoteFallback,
  quoteAuthor,
  views,
  shares,
  readTimeLabel,
  whyThisMatters,
  expectNext,
  mainSummary,
}) {
  const displayQuote =
    quote && typeof quote === "string" && quote.trim().length > 0
      ? quote.trim()
      : quoteFallback ||
        "We craft sharp, insight-led stories that help brands grow, connect, and stand out.";

  const safeWhyThisMatters =
    whyThisMatters ||
    "This story has been selected for Corp Crunch because it highlights a meaningful shift in the corporate or industry landscape. It connects company actions, market signals, and stakeholder impact so decision‑makers can quickly understand what is at stake.";

  const safeExpectNext =
    expectNext ||
    "Based on the trends and data discussed here, expect follow‑up coverage that tracks how key players respond, how regulations or markets evolve, and what new opportunities or risks emerge for your organization.";

  const hasViews = typeof views === "number" && views > 0;
  const hasShares = typeof shares === "number" && shares >= 0;
  const hasReadTime = !!readTimeLabel;

  return (
    <section className={styles.sectionWrapper}>
      <div className={styles.inner}>
        <div className={styles.eyebrow}>
          <span className={styles.eyebrowDot} />
          <span>About this story</span>
        </div>

        <h2 className={styles.title}>{displayQuote}</h2>

        {quoteAuthor && (
          <div className={styles.quoteAuthor}>
            <div className={styles.quoteAvatar}>
              <span>{quoteAuthor.initials || "QA"}</span>
            </div>
            <div className={styles.quoteAuthorMeta}>
              <span className={styles.quoteAuthorName}>
                {quoteAuthor.name || ""}
              </span>
              {quoteAuthor.title && (
                <span className={styles.quoteAuthorTitle}>
                  {quoteAuthor.title}
                </span>
              )}
            </div>
          </div>
        )}

        {mainSummary && <p className={styles.content}>{mainSummary}</p>}

        <div className={styles.statsRow}>
          {hasViews && (
            <div className={styles.stat}>
              <div className={styles.statLabel}>
                <span className={styles.statDot} />
                <span>Views</span>
              </div>
              <div className={styles.statNumber}>
                {views.toLocaleString()}+
              </div>
            </div>
          )}

          {hasShares && (
            <div className={styles.stat}>
              <div className={styles.statLabel}>
                <span className={styles.statDot} />
                <span>Shares</span>
              </div>
              <div className={styles.statNumber}>
                {shares.toLocaleString()}{shares > 0 ? '+' : ''}
              </div>
            </div>
          )}

          {hasReadTime && (
            <div className={styles.stat}>
              <div className={styles.statLabel}>
                <span className={styles.statDot} />
                <span>Est. Read Time</span>
              </div>
              <div className={styles.statNumber}>{readTimeLabel}</div>
            </div>
          )}
        </div>

        <div className={styles.extraRow}>
          <div className={styles.extraBlock}>
            <h3>Why this matters</h3>
            <p>{safeWhyThisMatters}</p>
          </div>
          <div className={styles.extraBlock}>
            <h3>What should you expect next</h3>
            <p>{safeExpectNext}</p>
          </div>
        </div>
      </div>
    </section>
  );
}

