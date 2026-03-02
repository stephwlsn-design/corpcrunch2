/**
 * Image Utility Helpers
 * 
 * Provides helper functions for handling images across the app,
 * including detection of broken/dead external image domains.
 */

/**
 * Domains known to return 500 errors or be unavailable.
 * Images from these domains should be loaded unoptimized to avoid
 * Next.js image proxy returning 500 upstream errors.
 */
const BROKEN_DOMAINS = [
    'recroot-next.vercel.app',
    'recroot.ai',
    'www.recroot.ai',
];

/**
 * Returns true if the image URL is from a known broken/dead domain.
 * Use this to conditionally set the `unoptimized` prop on <Image>.
 * 
 * @param {string} src - The image URL
 * @returns {boolean}
 */
export function isUnoptimizableImage(src) {
    if (!src) return false;
    try {
        const { hostname } = new URL(src);
        return BROKEN_DOMAINS.includes(hostname);
    } catch {
        return false;
    }
}

/**
 * Returns a fallback image URL if the provided one is from a broken domain.
 * 
 * @param {string} src - The image URL
 * @param {string} fallback - Fallback image path
 * @returns {string}
 */
export function safeImageSrc(src, fallback = '/assets/img/blog/default.jpg') {
    if (!src) return fallback;
    try {
        const { hostname } = new URL(src);
        if (BROKEN_DOMAINS.includes(hostname)) return fallback;
        return src;
    } catch {
        return src; // relative paths are fine
    }
}
