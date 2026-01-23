/**
 * SEO Optimization Utilities
 * Provides functions to optimize post content for SEO
 */

/**
 * Generate SEO-friendly slug from title
 * @param {string} title - Post title
 * @returns {string} SEO-friendly slug
 */
export function generateSlug(title) {
  if (!title) return '';
  
  return title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single
    .replace(/^-|-$/g, ''); // Remove leading/trailing hyphens
}

/**
 * Generate optimal meta title from post title
 * @param {string} title - Post title
 * @param {number} maxLength - Maximum length (default: 60)
 * @returns {string} Optimized meta title
 */
export function generateMetaTitle(title, maxLength = 60) {
  if (!title) return '';
  
  // If title is already optimal length, return as-is
  if (title.length <= maxLength) {
    return title.trim();
  }
  
  // Truncate at word boundary
  const truncated = title.substring(0, maxLength - 3);
  const lastSpace = truncated.lastIndexOf(' ');
  
  if (lastSpace > maxLength * 0.7) {
    // If we can truncate at a word boundary near the end
    return truncated.substring(0, lastSpace) + '...';
  }
  
  return truncated + '...';
}

/**
 * Generate meta description from content
 * @param {string} content - Post content
 * @param {number} maxLength - Maximum length (default: 160)
 * @returns {string} Optimized meta description
 */
export function generateMetaDescription(content, maxLength = 160) {
  if (!content) return '';
  
  // Remove HTML tags
  const plainText = content
    .replace(/<[^>]*>/g, '') // Remove HTML tags
    .replace(/\n+/g, ' ') // Replace newlines with spaces
    .replace(/\s+/g, ' ') // Replace multiple spaces with single
    .trim();
  
  if (plainText.length <= maxLength) {
    return plainText;
  }
  
  // Truncate at word boundary
  const truncated = plainText.substring(0, maxLength - 3);
  const lastSpace = truncated.lastIndexOf(' ');
  
  if (lastSpace > maxLength * 0.7) {
    return truncated.substring(0, lastSpace) + '...';
  }
  
  return truncated + '...';
}

/**
 * Extract keywords from content
 * @param {string} content - Post content
 * @param {number} maxKeywords - Maximum number of keywords (default: 10)
 * @returns {string[]} Array of keywords
 */
export function extractKeywords(content, maxKeywords = 10) {
  if (!content) return [];
  
  // Remove HTML tags
  const plainText = content
    .replace(/<[^>]*>/g, '')
    .toLowerCase();
  
  // Common stop words to exclude
  const stopWords = new Set([
    'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for',
    'of', 'with', 'by', 'from', 'as', 'is', 'was', 'are', 'were', 'been',
    'be', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would',
    'should', 'could', 'may', 'might', 'must', 'can', 'this', 'that',
    'these', 'those', 'i', 'you', 'he', 'she', 'it', 'we', 'they', 'what',
    'which', 'who', 'when', 'where', 'why', 'how', 'all', 'each', 'every',
    'both', 'few', 'more', 'most', 'other', 'some', 'such', 'no', 'nor',
    'not', 'only', 'own', 'same', 'so', 'than', 'too', 'very', 'just',
  ]);
  
  // Extract words (3+ characters)
  const words = plainText
    .match(/\b[a-z]{3,}\b/g) || [];
  
  // Count word frequency
  const wordCount = {};
  words.forEach(word => {
    if (!stopWords.has(word)) {
      wordCount[word] = (wordCount[word] || 0) + 1;
    }
  });
  
  // Sort by frequency and return top keywords
  return Object.entries(wordCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, maxKeywords)
    .map(([word]) => word);
}

/**
 * Calculate reading time from content
 * @param {string} content - Post content
 * @param {number} wordsPerMinute - Average reading speed (default: 200)
 * @returns {number} Reading time in minutes
 */
export function calculateReadingTime(content, wordsPerMinute = 200) {
  if (!content) return 1;
  
  // Remove HTML tags
  const plainText = content.replace(/<[^>]*>/g, '');
  
  // Count words
  const words = plainText.trim().split(/\s+/).filter(Boolean);
  const wordCount = words.length;
  
  // Calculate minutes
  const minutes = Math.ceil(wordCount / wordsPerMinute);
  
  return Math.max(1, minutes); // Minimum 1 minute
}

/**
 * Validate SEO fields
 * @param {object} seoData - SEO data object
 * @returns {object} Validation result with errors array
 */
export function validateSEOFields(seoData) {
  const errors = [];
  
  if (seoData.metaTitle) {
    if (seoData.metaTitle.length < 30) {
      errors.push('Meta title should be at least 30 characters');
    }
    if (seoData.metaTitle.length > 60) {
      errors.push('Meta title should not exceed 60 characters (may be truncated in search results)');
    }
  }
  
  if (seoData.metaDescription) {
    if (seoData.metaDescription.length < 120) {
      errors.push('Meta description should be at least 120 characters for better SEO');
    }
    if (seoData.metaDescription.length > 160) {
      errors.push('Meta description should not exceed 160 characters (will be truncated)');
    }
  }
  
  if (seoData.slug) {
    const slugRegex = /^[a-z0-9-]+$/;
    if (!slugRegex.test(seoData.slug)) {
      errors.push('Slug must contain only lowercase letters, numbers, and hyphens');
    }
    if (seoData.slug.length < 3) {
      errors.push('Slug must be at least 3 characters long');
    }
  }
  
  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Generate structured data (JSON-LD) for article
 * @param {object} postData - Post data
 * @returns {object} Structured data object
 */
export function generateStructuredData(postData) {
  const {
    title,
    content,
    bannerImageUrl,
    authorFirstName,
    authorLastName,
    publishDate,
    metaDescription,
    schemaMarkupType = 'Article',
  } = postData;
  
  const authorName = [authorFirstName, authorLastName].filter(Boolean).join(' ') || 'Corp Crunch';
  
  const baseStructure = {
    '@context': 'https://schema.org',
    '@type': schemaMarkupType,
    headline: title,
    description: metaDescription || generateMetaDescription(content),
    image: bannerImageUrl,
    datePublished: publishDate || new Date().toISOString(),
    dateModified: new Date().toISOString(),
    author: {
      '@type': 'Person',
      name: authorName,
    },
    publisher: {
      '@type': 'Organization',
      name: 'Corp Crunch',
    },
  };
  
  return baseStructure;
}

