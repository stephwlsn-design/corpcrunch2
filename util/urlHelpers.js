/**
 * URL Helper Functions
 * Generates URLs for posts and categories based on routing rules
 */

/**
 * Get category slug from category object
 * @param {Object} category - Category object with name, slug, or id
 * @returns {string} Category slug
 */
export function getCategorySlug(category) {
  if (!category) return null;
  
  // If category has a slug, use it
  if (category.slug) {
    return category.slug.toLowerCase();
  }
  
  // If category has a name, convert to slug
  if (category.name) {
    return category.name.toLowerCase().replace(/\s+/g, '-');
  }
  
  return null;
}

/**
 * Get category URL based on category name
 * Some categories use ID-based URLs, others use slug-based
 * @param {Object} category - Category object
 * @returns {string} Category URL
 */
export function getCategoryUrl(category) {
  if (!category) return '/';
  
  // Categories that should use ID-based URLs
  const idBasedCategories = [
    'market-analysis',
    'digital-retail',
    'fintech-growth',
    'cyber-security',
    'ai-innovation',
    'strategic-planning',
    'cloud-solutions',
    'data-insights'
  ];
  
  // Get category name/slug
  const categoryName = category.name?.toLowerCase().replace(/\s+/g, '-') || 
                       category.slug?.toLowerCase() || '';
  
  // Check if this category should use ID-based URL
  if (idBasedCategories.includes(categoryName) && (category.id || category._id)) {
    return `/category/${category.id || category._id}`;
  }
  
  // For other categories, use slug-based URL if available
  if (category.slug) {
    return `/${category.slug.toLowerCase()}`;
  }
  
  // Fallback to ID-based if no slug
  if (category.id || category._id) {
    return `/category/${category.id || category._id}`;
  }
  
  // Last resort: use name as slug
  if (category.name) {
    return `/${category.name.toLowerCase().replace(/\s+/g, '-')}`;
  }
  
  return '/';
}

/**
 * Get blog post URL with category slug
 * Format: /{categorySlug}/blog/{postSlug}
 * @param {Object} post - Post object with slug and category
 * @returns {string} Blog post URL
 */
export function getBlogPostUrl(post) {
  if (!post || !post.slug) {
    return '/blog';
  }
  
  // Get category slug
  const category = post.Category || post.category || post.categoryId;
  const categorySlug = getCategorySlug(category);
  
  // If category slug exists, use category-based URL
  if (categorySlug) {
    return `/${categorySlug}/blog/${post.slug}`;
  }
  
  // Fallback to old URL format
  return `/blog/${post.slug}`;
}

/**
 * Check if a category should use ID-based URL
 * @param {string} categoryName - Category name or slug
 * @returns {boolean}
 */
export function shouldUseIdBasedUrl(categoryName) {
  const idBasedCategories = [
    'market-analysis',
    'digital-retail',
    'fintech-growth',
    'cyber-security',
    'ai-innovation',
    'strategic-planning',
    'cloud-solutions',
    'data-insights'
  ];
  
  const normalized = categoryName?.toLowerCase().replace(/\s+/g, '-') || '';
  return idBasedCategories.includes(normalized);
}

// Default export for namespace imports
export default {
  getCategorySlug,
  getCategoryUrl,
  getBlogPostUrl,
  shouldUseIdBasedUrl
};

