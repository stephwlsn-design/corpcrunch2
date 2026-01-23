/**
 * Centralized Error Handler
 * Provides consistent error handling across the application
 */

/**
 * Handle API errors and provide user-friendly messages
 * @param {Error} error - Error object
 * @param {function} notifyError - Error notification function
 * @returns {string} User-friendly error message
 */
export function handleApiError(error, notifyError) {
  if (!error) return 'An unknown error occurred';

  // Network errors
  if (!error.response) {
    const message = 'Network error. Please check your internet connection and try again.';
    if (notifyError) notifyError(message);
    return message;
  }

  const status = error.response?.status;
  const data = error.response?.data;

  // Handle specific status codes
  switch (status) {
    case 400:
      const message400 = data?.message || 'Invalid data. Please check all required fields.';
      if (notifyError) notifyError(message400);
      return message400;

    case 401:
      const message401 = data?.message || 'Authentication required. Please log in again.';
      if (notifyError) notifyError(message401);
      // Auto-redirect to login after 2 seconds
      if (typeof window !== 'undefined') {
        setTimeout(() => {
          window.location.href = '/admin/login';
        }, 2000);
      }
      return message401;

    case 403:
      const message403 = data?.message || 'You do not have permission to perform this action.';
      if (notifyError) notifyError(message403);
      return message403;

    case 404:
      const message404 = data?.message || 'Resource not found.';
      if (notifyError) notifyError(message404);
      return message404;

    case 409:
      const message409 = data?.message || 'A resource with this information already exists.';
      if (notifyError) notifyError(message409);
      return message409;

    case 429:
      const retryAfter = data?.retryAfter || 60;
      const message429 = data?.message || `Rate limit exceeded. Please try again after ${retryAfter} seconds.`;
      if (notifyError) notifyError(message429);
      return message429;

    case 500:
      const message500 = data?.message || 'Server error. Please try again later.';
      if (notifyError) notifyError(message500);
      return message500;

    default:
      const messageDefault = data?.message || `Error ${status}: ${error.message || 'An error occurred'}`;
      if (notifyError) notifyError(messageDefault);
      return messageDefault;
  }
}

/**
 * Validate form data before submission
 * @param {object} formData - Form data object
 * @returns {object} Validation result with errors array
 */
export function validatePostFormData(formData) {
  const errors = [];

  // Required fields
  if (!formData.title || formData.title.trim().length < 5) {
    errors.push('Title must be at least 5 characters long');
  }

  if (!formData.slug || formData.slug.trim().length < 3) {
    errors.push('Slug must be at least 3 characters long');
  }

  if (!formData.content || formData.content.trim().length < 50) {
    errors.push('Content must be at least 50 characters long');
  }

  if (!formData.bannerImageUrl || !isValidUrl(formData.bannerImageUrl)) {
    errors.push('Banner image URL is required and must be a valid URL');
  }

  if (!formData.categoryId) {
    errors.push('Category is required');
  }

  // Slug format validation
  const slugRegex = /^[a-z0-9-]+$/;
  if (formData.slug && !slugRegex.test(formData.slug.trim())) {
    errors.push('Slug must contain only lowercase letters, numbers, and hyphens');
  }

  // Scheduled posts validation
  if (formData.publishStatus === 'scheduled') {
    if (!formData.publishDate || !formData.publishTime) {
      errors.push('Scheduled posts require both a publish date and time');
    } else {
      const scheduledDate = new Date(`${formData.publishDate}T${formData.publishTime}`);
      if (scheduledDate <= new Date()) {
        errors.push('Scheduled posts must have a publish date/time in the future');
      }
    }
  }

  // URL validations
  if (formData.canonicalUrl && !isValidUrl(formData.canonicalUrl)) {
    errors.push('Canonical URL must be a valid HTTP/HTTPS URL');
  }

  if (formData.ogImage && !isValidUrl(formData.ogImage)) {
    errors.push('OG Image URL must be a valid HTTP/HTTPS URL');
  }

  // Structured data JSON validation
  if (formData.structuredData && formData.structuredData.trim()) {
    try {
      JSON.parse(formData.structuredData.trim());
    } catch (e) {
      errors.push('Structured Data must be valid JSON format');
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Validate URL format
 * @param {string} url - URL string
 * @returns {boolean} True if valid URL
 */
function isValidUrl(url) {
  if (!url || typeof url !== 'string') return false;
  try {
    const urlObj = new URL(url);
    return ['http:', 'https:'].includes(urlObj.protocol);
  } catch (e) {
    return false;
  }
}

