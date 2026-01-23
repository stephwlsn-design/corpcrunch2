import Link from "next/link";
import { useRouter } from "next/router";
import useCategory from "@/hooks/useCategory";
import { useEffect, useState } from "react";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import styles from "./CategoryNavigation.module.css";
import { useLanguage } from "@/contexts/LanguageContext";

const CategoryNavigation = () => {
  const router = useRouter();
  const { t } = useLanguage();
  const {
    refetch: fetchCategories,
    data: categories,
    isLoading: isLoadingCategory,
  } = useCategory({ enabled: false });
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    fetchCategories();
  }, []);

  // Hide on signin routes
  const onSigninRoute =
    router.pathname === "/signin" ||
    router.pathname === "/subscribe" ||
    router.pathname === "/payment";

  if (onSigninRoute) return null;

  // Define category configuration with translations
  const categoryConfig = {
    // Page categories
    technology: { name: t('navigation.technology'), href: "/technology", isPage: true },
    politics: { name: t('navigation.politics'), href: "/politics", isPage: true },
    retail: { name: t('navigation.retail'), href: "/retail", isPage: true },
    sportstech: { name: t('navigation.sportstech'), href: "/sportstech", isPage: true },
    sustainability: { name: t('navigation.sustainability'), href: "/sustainability", isPage: true },
    telecom: { name: t('navigation.telecom'), href: "/telecom", isPage: true },
    // Moved from header
    events: { name: t('header.events') || 'Events', href: "/events", isPage: true },
    'e-magazine': { name: 'E magazine', href: "/e-magazine", isPage: true },
    // New categories - These will use ID-based URLs
    'market-analysis': { name: 'Market Analysis', href: null, isPage: false, useIdBased: true },
    'digital-retail': { name: 'Digital Retail', href: null, isPage: false, useIdBased: true },
    'fintech-growth': { name: 'FinTech Growth', href: null, isPage: false, useIdBased: true },
    'cyber-security': { name: 'Cyber Security', href: null, isPage: false, useIdBased: true },
    'ai-innovation': { name: 'AI Innovation', href: null, isPage: false, useIdBased: true },
    'strategic-planning': { name: 'Strategic Planning', href: null, isPage: false, useIdBased: true },
    'cloud-solutions': { name: 'Cloud Solutions', href: null, isPage: false, useIdBased: true },
    'data-insights': { name: 'Data Insights', href: null, isPage: false, useIdBased: true },
    // Non-page categories that should still have clean, slug-based URLs
    automobile: { name: t('navigation.automobile'), href: "/automobile", isPage: false },
    fmcg: { name: t('navigation.fmcg'), href: "/fmcg", isPage: false },
    finance: { name: t('navigation.finance'), href: "/finance", isPage: false },
    science: { name: t('navigation.science'), href: "/science", isPage: false },
  };

  // Build category list - check API first, then use static routes
  const buildCategoryList = () => {
    const result = [];
    const processedNames = new Set();

    // Add pages first (Technology, Politics, Retail, SportsTech, Sustainability, Telecom, Events, E-magazine)
    const pageCategories = ['technology', 'politics', 'retail', 'sportstech', 'sustainability', 'telecom', 'events', 'e-magazine'];
    pageCategories.forEach(key => {
      if (categoryConfig[key]) {
        result.push(categoryConfig[key]);
        processedNames.add(key);
      }
    });

    // Process categories from API (for non-page categories)
    if (categories && Array.isArray(categories)) {
      categories.forEach(cat => {
        const catName = cat.name?.toLowerCase();
        // Only process if it's not already a page and not in processed list
        if (catName && !processedNames.has(catName)) {
          // Check if it's a configured category
          if (categoryConfig[catName]) {
            const config = categoryConfig[catName];
            // If it's a page, skip (already added), otherwise add as category
            if (!config.isPage) {
              // Use ID-based URL for specific categories, slug-based for others
              let href;
              if (config.useIdBased && (cat.id || cat._id)) {
                href = `/category/${cat.id || cat._id}`;
              } else {
                href = config.href || `/category/${cat.id || cat._id}`;
              }
              result.push({
                name: config.name,
                href: href
              });
              processedNames.add(catName);
            }
          } else {
            // Add other categories from API that aren't in config
            result.push({
              name: cat.name,
              href: `/category/${cat.id || cat._id}`
            });
            processedNames.add(catName);
          }
        }
      });
    }

    // Add new categories - find them in API and use ID-based URLs
    const newCategories = ['market-analysis', 'digital-retail', 'fintech-growth', 'cyber-security', 'ai-innovation', 'strategic-planning', 'cloud-solutions', 'data-insights'];
    if (categories && Array.isArray(categories)) {
      newCategories.forEach(key => {
        if (categoryConfig[key] && !processedNames.has(key)) {
          // Find category in API response
          const found = categories.find(cat => {
            const catName = cat.name?.toLowerCase().replace(/\s+/g, '-');
            return catName === key;
          });
          
          if (found && (found.id || found._id)) {
            // Use ID-based URL
            result.push({
              name: categoryConfig[key].name,
              href: `/category/${found.id || found._id}`
            });
            processedNames.add(key);
          } else if (categoryConfig[key]) {
            // Fallback to config href if category not found in API
            result.push({
              name: categoryConfig[key].name,
              href: categoryConfig[key].href || `/category/${key}`
            });
            processedNames.add(key);
          }
        }
      });
    }

    // Add remaining static categories if not found in API
    ['automobile', 'fmcg', 'finance', 'science'].forEach(key => {
      if (!processedNames.has(key) && categoryConfig[key]) {
        const config = categoryConfig[key];
        // Always use the clean slug URL defined in config
        result.push({
          name: config.name,
          href: config.href || `/category/${key}`
        });
        processedNames.add(key);
      }
    });

    return result;
  };

  const allCategories = buildCategoryList();

  // Check if a link is active
  const isActive = (href) => {
    if (href.startsWith("/category/")) {
      // For category links, check if current path matches
      return router.asPath === href || router.asPath.includes(href);
    }
    // For direct page links
    return router.pathname === href || router.asPath === href;
  };

  return (
    <nav className={styles.categoryNav}>
      <div className={styles.categoryNavContainer}>
        <div className={styles.categoryNavContent}>
          {isLoadingCategory ? (
            <div className={styles.categoryList} style={{ overflow: 'hidden' }}>
              {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                <li key={i} className={styles.categoryItem}>
                  <Skeleton width={80} height={20} />
                </li>
              ))}
            </div>
          ) : (
            <div className={styles.categoryNavContentInner}>
              <ul className={styles.categoryList}>
                {allCategories.map((category, index) => (
                  <li key={category.href || index} className={styles.categoryItem}>
                    <Link
                      href={category.href}
                      scroll={true}
                      className={`${styles.categoryLink} ${isActive(category.href) ? styles.active : ''}`}
                    >
                      {category.name}
                    </Link>
                  </li>
                ))}
              </ul>
              {/* Duplicate list for seamless scrolling */}
              <ul className={styles.categoryList} aria-hidden="true">
                {allCategories.map((category, index) => (
                  <li key={`dup-${category.href || index}`} className={styles.categoryItem}>
                    <Link
                      href={category.href}
                      scroll={true}
                      className={`${styles.categoryLink} ${isActive(category.href) ? styles.active : ''}`}
                    >
                      {category.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default CategoryNavigation;

