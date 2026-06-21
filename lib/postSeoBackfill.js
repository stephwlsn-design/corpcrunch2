import {
  generateMetaDescription,
  generateMetaTitle,
  calculateReadingTime,
  extractKeywords,
} from './seoOptimizer.js';
import { buildArticleUrl, getCategorySlug } from './seoHelpers.js';

/**
 * Build SEO field updates for a post document (with populated categoryId).
 * Only fills fields that are missing or empty.
 */
export function buildPostSeoUpdates(post) {
  const updates = {};
  const category = post.categoryId;
  const categorySlug = getCategorySlug(
    category && typeof category === 'object'
      ? { slug: category.slug, name: category.name }
      : null
  );

  const postForUrl = {
    ...post,
    slug: post.slug,
    Category: category && typeof category === 'object'
      ? { slug: category.slug, name: category.name }
      : null,
  };

  if (!post.metaTitle?.trim() && post.title?.trim()) {
    updates.metaTitle = generateMetaTitle(post.title.trim());
  }

  if (!post.metaDescription?.trim() && post.content?.trim()) {
    updates.metaDescription = generateMetaDescription(post.content.trim());
  }

  if (!post.excerpt?.trim() && (updates.metaDescription || post.metaDescription)) {
    updates.excerpt = updates.metaDescription || post.metaDescription;
  }

  if (!post.imageAltText?.trim() && post.title?.trim()) {
    updates.imageAltText = post.title.trim();
  }

  if (!post.ogTitle?.trim()) {
    updates.ogTitle = updates.metaTitle || post.metaTitle || generateMetaTitle(post.title || '');
  }

  if (!post.ogDescription?.trim()) {
    updates.ogDescription =
      updates.metaDescription ||
      post.metaDescription ||
      generateMetaDescription(post.content || '');
  }

  if (!post.ogImage?.trim() && post.bannerImageUrl?.trim()) {
    updates.ogImage = post.bannerImageUrl.trim();
  }

  if (!post.readingTime && post.content?.trim()) {
    updates.readingTime = calculateReadingTime(post.content);
  }

  if (
    (!post.secondaryKeywords || post.secondaryKeywords.length === 0) &&
    post.content?.trim()
  ) {
    const keywords = extractKeywords(post.content, 8);
    if (keywords.length > 0) {
      updates.secondaryKeywords = keywords;
    }
  }

  if (post.allowIndexing === undefined || post.allowIndexing === null) {
    updates.allowIndexing = true;
  }

  if (post.allowFollowing === undefined || post.allowFollowing === null) {
    updates.allowFollowing = true;
  }

  if (!post.schemaMarkupType?.trim()) {
    updates.schemaMarkupType =
      post.contentType === 'video' ? 'NewsArticle' : 'Article';
  }

  if (!post.language?.trim()) {
    updates.language = 'en';
  }

  // Set canonical to .io preferred URL when missing (per-domain canonical is rendered at runtime)
  if (!post.canonicalUrl?.trim() && post.slug && categorySlug) {
    updates.canonicalUrl = buildArticleUrl(postForUrl);
  }

  return updates;
}
