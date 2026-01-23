import Link from "next/link";
import Image from "next/image";
import Skeleton from "react-loading-skeleton";
import { formatDate } from "@/util";
import { useLanguage } from "@/contexts/LanguageContext";
import { getBlogPostUrl } from "@/util/urlHelpers";

export default function FeaturedPosts({ posts = [], isLoading = false }) {
  const { t } = useLanguage();
  
  if (isLoading) {
    return (
      <section className="featured-posts-modern pt-80 pb-80">
        <div className="container">
          <div className="section__title-modern mb-50">
            <div className="section__title-header">
              <div>
                <Skeleton width={100} height={20} />
                <Skeleton width={250} height={40} />
              </div>
            </div>
          </div>
          <div className="featured-posts__grid">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div className="featured-post-modern__card" key={i}>
                <div className="featured-post-modern__thumb">
                  <Skeleton width={120} height={120} />
                </div>
                <div className="featured-post-modern__content">
                  <Skeleton width={80} height={15} />
                  <Skeleton width="100%" height={25} count={2} />
                  <Skeleton width={100} height={15} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (!posts || posts.length === 0) return null;

  const featuredPosts = posts.slice(0, 6);

  return (
    <section className="featured-posts-modern pt-80 pb-80">
      <div className="container">
        <div className="section__title-modern mb-50">
          <div className="section__title-header">
            <div>
              <span className="section__sub-title-modern">{t('home.featured', 'Featured')}</span>
              <h2 className="section__main-title-modern">{t('home.editorChoice', 'Editor Choice')}</h2>
            </div>
            <Link href="/blog" className="section__read-more-modern">
              {t('home.moreFeaturedPost', 'More Featured Post')} <i className="far fa-long-arrow-right" />
            </Link>
          </div>
        </div>
        <div className="featured-posts__grid">
          {featuredPosts.map((item, i) => (
            <div className="featured-post-modern__card" key={item.id || i}>
              <Link href={getBlogPostUrl(item)} className="featured-post-modern__link">
                <div className="featured-post-modern__thumb">
                  {item.bannerImageUrl && (
                    <Image
                      src={item.bannerImageUrl}
                      alt={item.title}
                      width={120}
                      height={120}
                      className="featured-post-modern__image"
                      priority={i < 2}
                      quality={80}
                      loading={i < 2 ? "eager" : "lazy"}
                      sizes="120px"
                      unoptimized={item.bannerImageUrl?.startsWith('http://') || item.bannerImageUrl?.startsWith('https://')}
                    />
                  )}
                  <span className="featured-post-modern__number">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                </div>
                <div className="featured-post-modern__content">
                  <span className="featured-post-modern__category">
                    {item.Category?.name || "Uncategorized"}
                  </span>
                  <h4 className="featured-post-modern__title">
                    {item.title}
                  </h4>
                  <div className="featured-post-modern__meta">
                    <span>By Mike Evans</span>
                  </div>
                </div>
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

