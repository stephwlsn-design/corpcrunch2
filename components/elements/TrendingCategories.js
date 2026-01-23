import React from "react";
import Link from "next/link";
import Image from "next/image";
import { formatNumber } from "@/util";
import { getBlogPostUrl, getCategoryUrl } from "@/util/urlHelpers";
import styles from "./TrendingCategories.module.css";

export default function TrendingCategories({ categories = [] }) {
  const categoryIcons = {
    technology: "fas fa-rocket",
    finance: "fas fa-chart-line",
    science: "fas fa-microscope",
    politics: "fas fa-balance-scale",
    automobile: "fas fa-car-side",
    fmcg: "fas fa-box-open",
    travel: "fas fa-globe-americas",
    lifestyle: "fas fa-fingerprint",
    adventure: "fas fa-compass",
    interior: "fas fa-couch",
    retail: "fas fa-shopping-bag",
    sustainability: "fas fa-seedling",
    telecom: "fas fa-signal",
  };

  if (!categories || categories.length === 0) return null;

  return (
    <section className={styles.trendingSection}>
      <div className={styles.container}>
        <h4 className={styles.sectionTitle}>Trending News by Category</h4>

        <div className={styles.categoriesList}>
          {categories.slice(0, 9).map((category, index) => {
            const categoryId = category.id || category._id;
            const trendingNews = category.trendingNews || [];
            const cardNumber = String(index + 1).padStart(2, "0");
            const categoryNameLower = (category.name || "").toLowerCase();
            const iconClass = categoryIcons[categoryNameLower] || "fas fa-folder-open";

            return (
              <div key={categoryId} className={styles.categoryRow}>
                {/* Category Card */}
                <Link
                  href={getCategoryUrl({ id: categoryId, _id: categoryId })}
                  className={styles.categoryCardLink}
                >
                  <div className={styles.categoryCard}>
                    <div className={styles.accentDot}></div>
                    <div className={styles.categoryIndex}>{cardNumber}</div>
                    
                    <div className={styles.categoryContent}>
                      <i className={`${iconClass} ${styles.categoryIcon}`}></i>
                      <h5 className={styles.categoryName}>{category.name}</h5>
                      <p className={styles.categoryDescription}>
                        Explore trending topics in {category.name.toLowerCase()}.
                      </p>
                    </div>
                  </div>
                </Link>

                {/* News Items Slider */}
                <div className={styles.newsSlider}>
                  {trendingNews.length > 0 ? (
                    <div className={styles.newsTrack}>
                      {[...trendingNews, ...trendingNews].map((news, nIdx) => {
                        // Ensure news has required properties
                        const newsUrl = news?.slug ? getBlogPostUrl(news) : `/blog/${news?.slug || news?._id || ''}`;
                        return (
                        <Link
                          key={`${news._id || nIdx}-${nIdx}`}
                          href={newsUrl}
                          className={styles.newsCardLink}
                        >
                          <div className={styles.newsCard}>
                            {news.bannerImageUrl && (
                              <div className={styles.newsImage}>
                                <Image
                                  src={news.bannerImageUrl}
                                  alt={news.title}
                                  fill
                                  style={{ objectFit: "cover" }}
                                />
                              </div>
                            )}
                            
                            <div className={styles.newsContent}>
                              <h6 className={styles.newsTitle}>{news.title}</h6>
                              
                              <div className={styles.newsMeta}>
                                <span>
                                  <i className="fas fa-eye"></i>{" "}
                                  {formatNumber(news.viewsCount || 0)}
                                </span>
                                <span>
                                  <i className="fas fa-share"></i>{" "}
                                  {formatNumber(news.sharesCount || 0)}
                                </span>
                              </div>
                            </div>
                          </div>
                        </Link>
                        );
                      })}
                    </div>
                  ) : (
                    <div className={styles.noNews}>No news available.</div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

