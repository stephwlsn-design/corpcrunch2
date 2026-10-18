import {
  generateMetaDescription,
  generateMetaTitle,
  generateSlug,
  calculateReadingTime,
  extractKeywords,
  generateStructuredData,
} from './seoOptimizer.js';
import { buildArticleUrl, getCategorySlug } from './seoHelpers.js';

function isBlank(value) {
  if (value === undefined || value === null) return true;
  if (typeof value === 'string') return !value.trim();
  if (Array.isArray(value)) return value.length === 0;
  return false;
}

function stripHtml(html = '') {
  return String(html)
    .replace(/<[^>]*>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function firstSentences(text = '', maxLength = 280) {
  const plain = stripHtml(text);
  if (!plain) return '';
  if (plain.length <= maxLength) return plain;

  const sentenceMatch = plain.match(/^(.+?[.!?])(\s|$)/);
  if (sentenceMatch && sentenceMatch[1].length >= 80 && sentenceMatch[1].length <= maxLength) {
    return sentenceMatch[1].trim();
  }

  const truncated = plain.substring(0, maxLength - 3);
  const lastSpace = truncated.lastIndexOf(' ');
  return `${(lastSpace > 80 ? truncated.substring(0, lastSpace) : truncated).trim()}...`;
}

/**
 * Extract image/video URLs from HTML content (src attributes).
 */
export function extractMediaUrlsFromContent(content = '') {
  if (!content) return [];
  const urls = [];
  const srcRegex = /(?:src|href)=["'](https?:\/\/[^"']+\.(?:jpg|jpeg|png|gif|webp|svg|mp4|webm|mov)(?:\?[^"']*)?)["']/gi;
  let match;
  while ((match = srcRegex.exec(content)) !== null) {
    if (!urls.includes(match[1])) urls.push(match[1]);
  }
  // Also catch generic https image CDN urls without extension
  const imgTagRegex = /<img[^>]+src=["'](https?:\/\/[^"']+)["']/gi;
  while ((match = imgTagRegex.exec(content)) !== null) {
    if (!urls.includes(match[1])) urls.push(match[1]);
  }
  return urls;
}

function buildInlineImageAltText(urls = [], title = '') {
  if (!urls.length) return '';
  return urls
    .map((_, index) =>
      title
        ? `${title} — visual ${index + 1}`
        : `Article visual ${index + 1}`
    )
    .join('\n');
}

function buildWhyThisMatters(companyName, description) {
  const summary = firstSentences(description, 220);
  if (!summary) {
    return `This story highlights a meaningful development${companyName ? ` involving ${companyName}` : ''} and why it matters for industry decision-makers.`;
  }
  return `This coverage matters because it tracks a material shift${companyName ? ` for ${companyName}` : ''}: ${summary}`;
}

function buildWhatsExpectedNext(companyName, description) {
  const summary = firstSentences(description, 180);
  return `Watch for follow-up signals on market response, competitive moves, and stakeholder impact${companyName ? ` around ${companyName}` : ''}${summary ? `. Context: ${summary}` : '.'}`;
}

/**
 * Build SEO + publishing field updates for a post.
 * Only fills fields that are missing or empty (does not overwrite editor input).
 */
export function buildPostSeoUpdates(post = {}) {
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
    Category:
      category && typeof category === 'object'
        ? { slug: category.slug, name: category.name }
        : null,
  };

  const title = (post.title || '').trim();
  const content = post.content || '';
  const plainContent = stripHtml(content);
  const banner = (post.bannerImageUrl || '').trim();

  if (isBlank(post.metaTitle) && title) {
    updates.metaTitle = generateMetaTitle(title);
  }

  if (isBlank(post.metaDescription) && (plainContent || title)) {
    updates.metaDescription = generateMetaDescription(
      plainContent || title,
      160
    );
  }

  if (isBlank(post.excerpt)) {
    updates.excerpt =
      updates.metaDescription ||
      post.metaDescription ||
      generateMetaDescription(plainContent || title, 160);
  }

  if (isBlank(post.imageAltText) && title) {
    updates.imageAltText = `${title} — featured image`;
  }

  if (isBlank(post.ogTitle)) {
    updates.ogTitle =
      updates.metaTitle || post.metaTitle || generateMetaTitle(title || '');
  }

  if (isBlank(post.ogDescription)) {
    updates.ogDescription =
      updates.metaDescription ||
      post.metaDescription ||
      generateMetaDescription(plainContent || title || '', 160);
  }

  if (isBlank(post.ogImage) && banner) {
    updates.ogImage = banner;
  }

  if (isBlank(post.readingTime) && plainContent) {
    updates.readingTime = calculateReadingTime(content);
  }

  const mediaUrls = extractMediaUrlsFromContent(content);
  if (isBlank(post.inlineImages) && mediaUrls.length > 0) {
    updates.inlineImages = mediaUrls;
  }

  const inlineList = !isBlank(post.inlineImages)
    ? post.inlineImages
    : updates.inlineImages || [];
  if (isBlank(post.inlineImageAltText) && inlineList.length > 0) {
    updates.inlineImageAltText = buildInlineImageAltText(inlineList, title);
  }

  if (isBlank(post.secondaryKeywords) && plainContent) {
    const companyHints = Array.isArray(post.tags)
      ? post.tags.filter((t) => t && t !== 'article-request')
      : [];
    const keywords = [
      ...companyHints,
      ...extractKeywords(`${title} ${plainContent}`, 8),
    ]
      .map((k) => String(k).toLowerCase().trim())
      .filter(Boolean);
    const unique = [...new Set(keywords)].slice(0, 10);
    if (unique.length > 0) {
      updates.secondaryKeywords = unique;
    }
  }

  if (post.allowIndexing === undefined || post.allowIndexing === null) {
    updates.allowIndexing = true;
  }

  if (post.allowFollowing === undefined || post.allowFollowing === null) {
    updates.allowFollowing = true;
  }

  if (isBlank(post.schemaMarkupType)) {
    updates.schemaMarkupType =
      post.contentType === 'video' ? 'NewsArticle' : 'Article';
  }

  if (isBlank(post.language)) {
    updates.language = 'en';
  }

  if (isBlank(post.region)) {
    updates.region = 'US';
  }

  if (isBlank(post.canonicalUrl) && post.slug && categorySlug) {
    updates.canonicalUrl = buildArticleUrl(postForUrl);
  }

  if (isBlank(post.whyThisMatters) && plainContent) {
    const companyTag = Array.isArray(post.tags)
      ? post.tags.find((t) => t && t !== 'article-request')
      : '';
    updates.whyThisMatters = buildWhyThisMatters(
      companyTag ? companyTag.replace(/-/g, ' ') : '',
      plainContent
    );
  }

  if (isBlank(post.whatsExpectedNext) && plainContent) {
    const companyTag = Array.isArray(post.tags)
      ? post.tags.find((t) => t && t !== 'article-request')
      : '';
    updates.whatsExpectedNext = buildWhatsExpectedNext(
      companyTag ? companyTag.replace(/-/g, ' ') : '',
      plainContent
    );
  }

  if (isBlank(post.structuredData) && title) {
    const merged = { ...post, ...updates };
    try {
      updates.structuredData = JSON.stringify(
        generateStructuredData({
          title: merged.title,
          content: merged.content,
          bannerImageUrl: merged.bannerImageUrl,
          ogImage: merged.ogImage || updates.ogImage,
          authorFirstName: merged.authorFirstName,
          authorLastName: merged.authorLastName,
          publishDate: merged.publishDate,
          metaDescription: merged.metaDescription || updates.metaDescription,
          canonicalUrl: merged.canonicalUrl || updates.canonicalUrl,
          schemaMarkupType: merged.schemaMarkupType || updates.schemaMarkupType,
          readingTime: merged.readingTime || updates.readingTime,
          tags: merged.tags,
        }),
        null,
        2
      );
    } catch {
      // ignore structured data generation failures
    }
  }

  return updates;
}

/**
 * Build a fully SEO-ready draft payload from an article/PR request submission.
 */
export function buildArticleRequestDraftFields({
  title,
  companyName,
  description,
  categoryId,
  submitterName,
  contentHtml,
  bannerImageUrl = '/assets/img/default-banner.jpg',
}) {
  const safeCompany = (companyName || '').trim();
  const safeDescription = (description || '').trim();
  const angle = firstSentences(safeDescription, 90);

  const draftTitle = (
    title?.trim() ||
    (safeCompany && angle
      ? `${safeCompany}: ${angle}`
      : safeCompany
        ? `${safeCompany} — Industry Update`
        : `Article Request — ${Date.now()}`)
  ).substring(0, 200);

  const baseSlugSource = safeCompany
    ? `${safeCompany} ${angle || 'article request'}`
    : draftTitle;
  const slugBase = generateSlug(baseSlugSource) || 'article-request';
  const slug = `${slugBase}-${Date.now()}`.substring(0, 180);

  const nameParts = (submitterName || '').trim().split(/\s+/).filter(Boolean);
  const authorFirstName = nameParts[0] || 'Corp';
  const authorLastName = nameParts.slice(1).join(' ') || 'Crunch Editorial';

  const companyTag = safeCompany
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .substring(0, 50);

  const basePost = {
    title: draftTitle,
    slug,
    content: contentHtml,
    bannerImageUrl,
    categoryId,
    publishStatus: 'draft',
    visibility: 'private',
    authorFirstName,
    authorLastName,
    tags: ['article-request', companyTag].filter(Boolean),
    contentType: 'article',
    publishDate: new Date(),
  };

  const seoUpdates = buildPostSeoUpdates({
    ...basePost,
    // Seed description-heavy fields from the PR body for stronger SEO
    metaDescription: '',
    excerpt: '',
    whyThisMatters: '',
    whatsExpectedNext: '',
  });

  // Prefer PR description for meta/excerpt when available (cleaner than HTML form letter)
  if (safeDescription) {
    seoUpdates.metaDescription = generateMetaDescription(
      `${safeCompany ? `${safeCompany}: ` : ''}${safeDescription}`,
      160
    );
    seoUpdates.excerpt = generateMetaDescription(safeDescription, 160);
    seoUpdates.ogDescription = seoUpdates.metaDescription;
    seoUpdates.whyThisMatters = buildWhyThisMatters(safeCompany, safeDescription);
    seoUpdates.whatsExpectedNext = buildWhatsExpectedNext(
      safeCompany,
      safeDescription
    );
  }

  return {
    ...basePost,
    ...seoUpdates,
  };
}

/**
 * Client-friendly: merge empty form fields with auto-generated SEO values.
 * Accepts string-based form state (comma/newline lists) and returns string values.
 */
export function autofillAdminSeoFormFields(form = {}) {
  const inlineImagesArr = String(form.inlineImages || '')
    .split(/\n/)
    .map((s) => s.trim())
    .filter(Boolean);

  const postLike = {
    title: form.title,
    slug: form.slug,
    content: form.content,
    bannerImageUrl: form.bannerImageUrl,
    metaTitle: form.metaTitle,
    metaDescription: form.metaDescription,
    imageAltText: form.imageAltText,
    excerpt: form.excerpt,
    readingTime: form.readingTime ? Number(form.readingTime) : null,
    ogTitle: form.ogTitle,
    ogDescription: form.ogDescription,
    ogImage: form.ogImage,
    secondaryKeywords: String(form.secondaryKeywords || '')
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean),
    inlineImages: inlineImagesArr,
    inlineImageAltText: form.inlineImageAltText,
    allowIndexing:
      form.allowIndexing === undefined ? undefined : !!form.allowIndexing,
    allowFollowing:
      form.allowFollowing === undefined ? undefined : !!form.allowFollowing,
    schemaMarkupType: form.schemaMarkupType,
    language: form.language,
    region: form.region,
    canonicalUrl: form.canonicalUrl,
    structuredData: form.structuredData,
    whyThisMatters: form.whyThisMatters,
    whatsExpectedNext: form.whatsExpectedNext,
    tags: String(form.tags || '')
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean),
    contentType: form.contentType || 'article',
    categoryId: form.categoryId
      ? { slug: form.categorySlug || '', name: form.categoryName || '' }
      : null,
    authorFirstName: form.authorFirstName,
    authorLastName: form.authorLastName,
  };

  const updates = buildPostSeoUpdates(postLike);
  const next = {};

  if (updates.metaTitle) next.metaTitle = updates.metaTitle;
  if (updates.metaDescription) next.metaDescription = updates.metaDescription;
  if (updates.excerpt) next.excerpt = updates.excerpt;
  if (updates.imageAltText) next.imageAltText = updates.imageAltText;
  if (updates.ogTitle) next.ogTitle = updates.ogTitle;
  if (updates.ogDescription) next.ogDescription = updates.ogDescription;
  if (updates.ogImage) next.ogImage = updates.ogImage;
  if (updates.readingTime) next.readingTime = String(updates.readingTime);
  if (updates.secondaryKeywords) {
    next.secondaryKeywords = updates.secondaryKeywords.join(', ');
  }
  if (updates.inlineImages) {
    next.inlineImages = updates.inlineImages.join('\n');
  }
  if (updates.inlineImageAltText) {
    next.inlineImageAltText = updates.inlineImageAltText;
  }
  if (updates.allowIndexing !== undefined) next.allowIndexing = updates.allowIndexing;
  if (updates.allowFollowing !== undefined) {
    next.allowFollowing = updates.allowFollowing;
  }
  if (updates.schemaMarkupType) next.schemaMarkupType = updates.schemaMarkupType;
  if (updates.language) next.language = updates.language;
  if (updates.region) next.region = updates.region;
  if (updates.canonicalUrl) next.canonicalUrl = updates.canonicalUrl;
  if (updates.structuredData) next.structuredData = updates.structuredData;
  if (updates.whyThisMatters) next.whyThisMatters = updates.whyThisMatters;
  if (updates.whatsExpectedNext) next.whatsExpectedNext = updates.whatsExpectedNext;

  return next;
}
