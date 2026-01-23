import React, { useState } from "react";
import styles from "./BlogMainContent.module.css";
import Markdown from "react-markdown";
import rehypeRaw from "rehype-raw";
import { getBlogPostUrl } from "@/util/urlHelpers";

export default function BlogMainContent({
  content,
  tags,
  prevPost,
  nextPost,
}) {
  const [tagMouseOffset, setTagMouseOffset] = useState({ x: 0, y: 0 });

  // Base layout positions for up to 5 tags inside the tag box
  const tagLayouts = [
    { left: 30, top: 30, rotate: -30 },
    { left: 130, top: 70, rotate: -18 },
    { left: 60, top: 140, rotate: -32 },
    { left: 210, top: 40, rotate: -22 },
    { left: 230, top: 145, rotate: -26 },
  ];

  if (!content) return null;

  return (
    <section id="blog-main-content" className={styles.sectionWrapper}>
      <div className={styles.inner}>
        {/* Eyebrow label */}
        <div className={styles.eyebrow}>
          <span className={styles.eyebrowDot} />
          <span>Full Story</span>
        </div>

        {/* Main Content */}
        <div className={styles.contentBody}>
          <Markdown rehypePlugins={[rehypeRaw]}>{content}</Markdown>
        </div>

        {/* Tags Section - Floating Design */}
        {tags && tags.length > 0 && (
          <div className={styles.tagsSection}>
            <div className={styles.tagsSectionLayout}>
              {/* Left side: heading */}
              <div className={styles.tagsHeading}>
                <h3 className={styles.tagsTitle}>
                  <i className="fas fa-tags" />
                  Related Topics
                </h3>
                <p className={styles.tagsSubtitle}>
                  Key topics covered in this story.
                </p>
              </div>

              {/* Right side: floating tags box */}
              <div
                className={styles.tagsBox}
                onMouseMove={(e) => {
                  const rect = e.currentTarget.getBoundingClientRect();
                  const relX = (e.clientX - rect.left) / rect.width - 0.5;
                  const relY = (e.clientY - rect.top) / rect.height - 0.5;
                  const maxShift = 18;
                  setTagMouseOffset({
                    x: relX * maxShift,
                    y: relY * maxShift,
                  });
                }}
                onMouseLeave={() => setTagMouseOffset({ x: 0, y: 0 })}
              >
                <div
                  className={styles.tagsFloating}
                  style={{
                    transform: `translate(${tagMouseOffset.x}px, ${tagMouseOffset.y}px)`,
                  }}
                >
                  {tags.slice(0, 5).map((tag, index) => {
                    const layout = tagLayouts[index % tagLayouts.length];
                    return (
                      <div
                        key={index}
                        className={styles.floatingTag}
                        style={{
                          left: `${layout.left}px`,
                          top: `${layout.top}px`,
                          transform: `rotate(${layout.rotate}deg)`,
                        }}
                      >
                        {tag}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Previous & Next Post Navigation */}
        {(prevPost || nextPost) && (
          <div className={styles.postNavigation}>
            <div className={styles.postNavGrid}>
              {prevPost ? (
                <a href={getBlogPostUrl(prevPost)} className={styles.postNavCard}>
                  <div className={styles.postNavLabel}>
                    <span className={styles.postNavArrow}>←</span>
                    <span>Previous</span>
                  </div>
                  <h4 className={styles.postNavTitle}>{prevPost.title}</h4>
                  {prevPost.excerpt && (
                    <p className={styles.postNavExcerpt}>{prevPost.excerpt}</p>
                  )}
                </a>
              ) : (
                <div className={styles.postNavPlaceholder} />
              )}

              {nextPost ? (
                <a href={getBlogPostUrl(nextPost)} className={styles.postNavCard}>
                  <div className={styles.postNavLabel}>
                    <span>Next</span>
                    <span className={styles.postNavArrow}>→</span>
                  </div>
                  <h4 className={styles.postNavTitle}>{nextPost.title}</h4>
                  {nextPost.excerpt && (
                    <p className={styles.postNavExcerpt}>{nextPost.excerpt}</p>
                  )}
                </a>
              ) : (
                <div className={styles.postNavPlaceholder} />
              )}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

