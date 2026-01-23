/**
 * Image Validation Utilities
 * Validates image URLs, dimensions, and formats
 */

/**
 * Validate image URL format
 * @param {string} url - Image URL
 * @returns {boolean} True if valid URL
 */
export function isValidImageUrl(url) {
  if (!url || typeof url !== 'string') return false;
  
  try {
    const urlObj = new URL(url);
    // Must be HTTP or HTTPS
    if (!['http:', 'https:'].includes(urlObj.protocol)) {
      return false;
    }
    
    // Check for common image extensions
    const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg', '.bmp'];
    const pathname = urlObj.pathname.toLowerCase();
    const hasImageExtension = imageExtensions.some(ext => pathname.endsWith(ext));
    
    // If no extension, might be a dynamic image URL (e.g., from CDN)
    // In that case, we'll allow it but recommend adding extension
    return true;
  } catch (e) {
    return false;
  }
}

/**
 * Get image dimensions from URL (async)
 * Note: This requires fetching the image, so use sparingly
 * @param {string} url - Image URL
 * @returns {Promise<{width: number, height: number} | null>} Image dimensions or null
 */
export async function getImageDimensions(url) {
  if (!isValidImageUrl(url)) return null;
  
  try {
    // In a browser environment, we can use Image object
    if (typeof window !== 'undefined') {
      return new Promise((resolve) => {
        const img = new Image();
        img.onload = () => {
          resolve({
            width: img.naturalWidth,
            height: img.naturalHeight,
          });
        };
        img.onerror = () => resolve(null);
        img.src = url;
      });
    }
    
    // In Node.js environment, we'd need to fetch and analyze
    // For now, return null (server-side validation would need image processing library)
    return null;
  } catch (e) {
    return null;
  }
}

/**
 * Validate image dimensions
 * @param {object} dimensions - Image dimensions
 * @param {object} requirements - Dimension requirements
 * @returns {object} Validation result
 */
export function validateImageDimensions(dimensions, requirements = {}) {
  if (!dimensions) {
    return {
      valid: false,
      error: 'Could not determine image dimensions',
    };
  }
  
  const {
    minWidth = 0,
    minHeight = 0,
    maxWidth = Infinity,
    maxHeight = Infinity,
    aspectRatio = null, // e.g., { width: 16, height: 9 }
  } = requirements;
  
  const errors = [];
  
  if (dimensions.width < minWidth) {
    errors.push(`Image width (${dimensions.width}px) is less than minimum (${minWidth}px)`);
  }
  
  if (dimensions.height < minHeight) {
    errors.push(`Image height (${dimensions.height}px) is less than minimum (${minHeight}px)`);
  }
  
  if (dimensions.width > maxWidth) {
    errors.push(`Image width (${dimensions.width}px) exceeds maximum (${maxWidth}px)`);
  }
  
  if (dimensions.height > maxHeight) {
    errors.push(`Image height (${dimensions.height}px) exceeds maximum (${maxHeight}px)`);
  }
  
  if (aspectRatio) {
    const imageRatio = dimensions.width / dimensions.height;
    const targetRatio = aspectRatio.width / aspectRatio.height;
    const tolerance = 0.1; // 10% tolerance
    
    if (Math.abs(imageRatio - targetRatio) > tolerance) {
      errors.push(
        `Image aspect ratio (${imageRatio.toFixed(2)}) does not match required ratio (${targetRatio.toFixed(2)})`
      );
    }
  }
  
  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Recommended image dimensions for different use cases
 */
export const IMAGE_RECOMMENDATIONS = {
  banner: {
    minWidth: 1200,
    minHeight: 630,
    recommendedWidth: 1200,
    recommendedHeight: 630,
    aspectRatio: { width: 1.91, height: 1 }, // 1.91:1 (Facebook/LinkedIn)
    description: 'Banner/Featured Image (1200x630px recommended for social sharing)',
  },
  ogImage: {
    minWidth: 1200,
    minHeight: 630,
    recommendedWidth: 1200,
    recommendedHeight: 630,
    aspectRatio: { width: 1.91, height: 1 },
    description: 'Open Graph Image (1200x630px for social media previews)',
  },
  inline: {
    minWidth: 400,
    minHeight: 300,
    recommendedWidth: 800,
    recommendedHeight: 600,
    description: 'Inline Image (800x600px recommended)',
  },
  thumbnail: {
    minWidth: 300,
    minHeight: 300,
    recommendedWidth: 400,
    recommendedHeight: 400,
    aspectRatio: { width: 1, height: 1 },
    description: 'Thumbnail Image (400x400px square recommended)',
  },
};

/**
 * Validate image for specific use case
 * @param {string} url - Image URL
 * @param {string} useCase - Use case (banner, ogImage, inline, thumbnail)
 * @returns {Promise<object>} Validation result
 */
export async function validateImageForUseCase(url, useCase = 'banner') {
  const recommendation = IMAGE_RECOMMENDATIONS[useCase];
  
  if (!recommendation) {
    return {
      valid: false,
      error: `Unknown use case: ${useCase}`,
    };
  }
  
  // First validate URL format
  if (!isValidImageUrl(url)) {
    return {
      valid: false,
      error: 'Invalid image URL format',
    };
  }
  
  // Try to get dimensions (may fail in server environment)
  const dimensions = await getImageDimensions(url);
  
  if (!dimensions) {
    // If we can't get dimensions, just validate URL format
    return {
      valid: true,
      warning: 'Could not validate image dimensions. Please ensure image meets recommended size.',
      recommendation,
    };
  }
  
  // Validate dimensions
  const dimensionValidation = validateImageDimensions(dimensions, {
    minWidth: recommendation.minWidth,
    minHeight: recommendation.minHeight,
    aspectRatio: recommendation.aspectRatio,
  });
  
  return {
    valid: dimensionValidation.valid,
    errors: dimensionValidation.errors,
    dimensions,
    recommendation,
  };
}

