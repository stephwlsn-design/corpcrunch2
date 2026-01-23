import Layout from "@/components/layout/Layout";
import Head from "next/head";
import Link from "next/link";
import { formatDate } from "@/util";
import Image from "next/image";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, EffectFade, Pagination } from "swiper";
import "swiper/css";
import "swiper/css/effect-fade";
import "swiper/css/pagination";
import styles from "./CategoryPage.module.css";
import SocialShareRibbon from "@/components/elements/SocialShareRibbon";

export default function CategoryPage({ categoryDetails }) {
  const trendingPosts = categoryDetails?.trendingPosts || [];
  const newestPosts = categoryDetails?.newestPosts || [];
  const categoryName = categoryDetails?.name || "Category";

  // Use only real Most Viewed posts from the category (no mock data)
  const mostViewedPosts = categoryDetails?.mostViewedPosts || [];

  // Get excerpt from content
  const getExcerpt = (content, maxLength = 100) => {
    if (!content) return "";
    const text = content.replace(/[#*\[\]()]/g, "").replace(/\n/g, " ");
    return text.length > maxLength ? text.substring(0, maxLength) + "..." : text;
  };

  // Find a post with a quote if possible
  const quotePost = [...trendingPosts, ...mostViewedPosts].find(p => p.quoteText) || trendingPosts[0];

  // Metrics calculation
  const totalArticles = newestPosts.length + trendingPosts.length;
  const totalViews = [...trendingPosts, ...mostViewedPosts, ...newestPosts].reduce((sum, p) => sum + (p.viewsCount || 0), 0);
  const trendingCount = trendingPosts.length;

  const ArticleCard = ({ post, index, variant = "trending" }) => (
    <div className={`${styles.articleCard} ${styles[variant]}`}>
      <Link href={`/blog/${post.slug || post._id}`} scroll={true}>
        <div className={styles.cardContent}>
          <div className={styles.cardBadge}>
            {variant === "viewed" ? (
              <>
                #{index + 1} ·{" "}
                <i className="fas fa-fire" />{" "}
                {post.viewsCount > 1000
                  ? (post.viewsCount / 1000).toFixed(1) + "k"
                  : post.viewsCount}
              </>
            ) : (
              <>{post.createdAt ? new Date(post.createdAt).getFullYear() : '2025'}-Present</>
            )}
          </div>
          {post.bannerImageUrl && variant !== "viewed" && (
            <div className={styles.cardImage}>
              <Image
                src={post.bannerImageUrl}
                alt={post.title || "Article"}
                width={300}
                height={200}
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                }}
              />
            </div>
          )}
          <div className={styles.cardBody}>
            <div className={styles.cardMeta}>
              <span className={styles.cardAuthor}>
                {post.authorFirstName && post.authorLastName 
                  ? `${post.authorFirstName} ${post.authorLastName}` 
                  : post.authorFirstName || post.authorLastName || 'Mike Evans'}
              </span>
            </div>
            <h3 className={styles.cardTitle}>{post.title}</h3>
            <div className={styles.cardTimeline}></div>
            <div className={styles.cardMeta}>
              <span className={styles.cardDate}>
                {formatDate(post.createdAt || post.publishDate)}
              </span>
              {variant !== "viewed" && post.viewsCount > 0 && (
                <span className={styles.cardViews}>
                  <i className="fas fa-eye" /> {post.viewsCount}
                </span>
              )}
            </div>
            <p className={styles.cardExcerpt}>{getExcerpt(post.content, variant === "viewed" ? 120 : 80)}</p>
          </div>
        </div>
      </Link>
    </div>
  );

  return (
      <Layout>
        <Head>
          <title>{categoryName} | CorpCrunch</title>
          <meta name="description" content={`${categoryName} news and insights`} />
        </Head>

        <SocialShareRibbon />

        <div className="category-page-wrapper">
        <section className={styles.categoryPage}>
          <div className={styles.container}>
            
            {/* Top Intro Section */}
            <div className={styles.introSection}>
              {/* Left Column: Hero Slider */}
              <div className={styles.introHero}>
                <Swiper
                  modules={[Autoplay, EffectFade, Pagination]}
                  effect="fade"
                  pagination={{ clickable: true }}
                  autoplay={{ delay: 5000, disableOnInteraction: false }}
                  loop={trendingPosts.length > 1}
                  className={styles.heroSlider}
                >
                  {trendingPosts.length > 0 ? (
                    trendingPosts.slice(0, 5).map((post, index) => (
                      <SwiperSlide key={post._id || index} className={styles.heroSlide}>
                        <Link href={`/blog/${post.slug || post._id}`}>
                          {post.bannerImageUrl && (
                            <Image 
                              src={post.bannerImageUrl} 
                              alt={post.title} 
                              layout="fill" 
                              className={styles.heroImage}
                            />
                          )}
                          <div className={styles.heroOverlay}>
                            <div className={styles.heroTag}>Trending Story</div>
                            <h2 className={styles.heroTitle}>{post.title}</h2>
                            <p className={styles.heroText}>
                              {getExcerpt(post.content, 120)}
                            </p>
                          </div>
                        </Link>
                      </SwiperSlide>
                    ))
                  ) : (
                    <SwiperSlide className={styles.heroSlide}>
                      <div className={styles.heroOverlay}>
                        <div className={styles.heroTag}>Latest</div>
                        <h2 className={styles.heroTitle}>Latest in {categoryName}</h2>
                        <p className={styles.heroText}>
                          Explore the most impactful {categoryName.toLowerCase()} stories and insights of 2025.
                        </p>
                      </div>
                    </SwiperSlide>
                  )}
                </Swiper>
              </div>

              {/* Right Column: Intro & Metrics */}
              <div className={styles.introContent}>
                <div className={styles.introBlock}>
                  <div className={styles.blockHeader}>
                    <h3 className={styles.blockTitle}>{categoryName}</h3>
                    <div className={styles.blockIcon}>
                      <i className="fas fa-chevron-down"></i>
                    </div>
                  </div>
                  <div className={styles.quoteCard}>
                    <div className={styles.quoteTextContent}>
                      <h4 className={styles.quoteTitle}>
                        {quotePost?.quoteAuthorName || "Insights from the Industry"}
                      </h4>
                      <p className={styles.quoteBody}>
                        {quotePost?.quoteText || `${categoryName} is evolving rapidly. Explore our curated insights on the future of this industry.`}
                      </p>
                    </div>
                    <div className={styles.quoteIllustration}>
                      <Image 
                        src="/assets/img/bg/banner_bg.jpg" 
                        alt="Illustration" 
                        width={100} 
                        height={100} 
                        style={{ objectFit: 'contain' }}
                        onError={(e) => { e.target.style.display = 'none'; }}
                      />
                    </div>
                  </div>
                </div>

                <div className={styles.sectionDivider}></div>

                <div className={styles.introBlock}>
                  <div className={styles.blockHeader}>
                    <h3 className={styles.blockTitle}>Impact Metrics</h3>
                    <div className={styles.blockIcon}>
                      <i className="fas fa-chevron-down"></i>
                    </div>
                  </div>
                  <div className={styles.metricsGrid}>
                    <div className={`${styles.metricBox} ${styles.metric1}`}>
                      <span className={styles.metricValue}>{totalArticles}</span>
                      <span className={styles.metricLabel}>Articles</span>
                    </div>
                    <div className={`${styles.metricBox} ${styles.metric2}`}>
                      <span className={styles.metricValue}>
                        {totalViews > 1000 ? (totalViews/1000).toFixed(1) + 'k' : totalViews}
                      </span>
                      <span className={styles.metricLabel}>Total Views</span>
                    </div>
                    <div className={`${styles.metricBox} ${styles.metric3}`}>
                      <span className={styles.metricValue}>{trendingCount}</span>
                      <span className={styles.metricLabel}>Trending Stories</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Decorative Divider */}
            <div className={styles.blueDivider}></div>

            <div className={styles.columnsGrid}>
               {/* Column 1: Trending Articles */}
               <div className={styles.column}>
                 <div className={styles.sectionHeader}>
                   <h2 className={styles.sectionTitle}>Trending Articles</h2>
                   <div className={styles.blockIcon}>
                     <i className="fas fa-chevron-down"></i>
                   </div>
                 </div>
                 <div className={styles.sectionDivider}></div>
                 <div className={styles.articlesList}>
                   {trendingPosts.length > 0 ? (
                     trendingPosts.map((post, index) => (
                       <ArticleCard key={post._id || post.id || index} post={post} index={index} variant="trending" />
                     ))
                   ) : (
                     <div className={styles.emptyState}>No trending articles found.</div>
                   )}
                 </div>
               </div>

               {/* Column 2: Most Viewed */}
               <div className={styles.column}>
                 <div className={styles.sectionHeader}>
                   <h2 className={styles.sectionTitle}>Most Viewed</h2>
                   <div className={styles.blockIcon}>
                     <i className="fas fa-chevron-down"></i>
                   </div>
                 </div>
                 <div className={styles.sectionDivider}></div>
                 <div className={styles.articlesList}>
                   {mostViewedPosts.length > 0 ? (
                     mostViewedPosts.map((post, index) => (
                       <ArticleCard key={post._id || post.id || index} post={post} index={index} variant="viewed" />
                     ))
                   ) : (
                     <div className={styles.emptyState}>No viewed articles found.</div>
                   )}
                 </div>
               </div>

               {/* Column 3: Newest to Oldest */}
               <div className={styles.column}>
                 <div className={styles.sectionHeader}>
                   <h2 className={styles.sectionTitle}>Newest to Oldest</h2>
                   <div className={styles.blockIcon}>
                     <i className="fas fa-chevron-down"></i>
                   </div>
                 </div>
                 <div className={styles.sectionDivider}></div>
                 <div className={styles.articlesList}>
                   {newestPosts.length > 0 ? (
                     newestPosts.map((post, index) => (
                       <ArticleCard key={post._id || post.id || index} post={post} index={index} variant="newest" />
                     ))
                   ) : (
                     <div className={styles.emptyState}>No new articles found.</div>
                   )}
                 </div>
               </div>
            </div>
          </div>
        </section>
      </div>
    </Layout>
  );
}
