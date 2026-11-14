/**
 * Image helpers for Next.js Image optimization (WebP/AVIF) and lazy loading.
 */

const BROKEN_DOMAINS = [
  'recroot-next.vercel.app',
  'recroot.ai',
  'www.recroot.ai',
];

const OPTIMIZABLE_HOST_SUFFIXES = [
  'corpcrunch.io',
  'corpcrunch.ai',
  'pexels.com',
  'unsplash.com',
  'istockphoto.com',
  'gettyimages.com',
  'googleusercontent.com',
  'gstatic.com',
  'google.com',
  'ytimg.com',
  'youtube.com',
  'bbci.co.uk',
  'cnbcfm.com',
  'cnbc.com',
  'autonews.com',
  'cloudinary.com',
  'amazonaws.com',
  'cloudfront.net',
  'wp.com',
  'twimg.com',
  'fbcdn.net',
  'licdn.com',
  'medium.com',
  'squarespace-cdn.com',
  'pixabay.com',
  'giphy.com',
  'imgur.com',
];

function hostnameMatches(hostname, suffix) {
  return hostname === suffix || hostname.endsWith(`.${suffix}`);
}

export function isUnoptimizableImage(src) {
  return !isOptimizableImage(src);
}

export function isOptimizableImage(src) {
  if (!src || typeof src !== 'string') return false;
  if (src.startsWith('/') && !src.startsWith('//')) {
    if (/\.gif(\?|#|$)/i.test(src) || /\.svg(\?|#|$)/i.test(src)) return false;
    return true;
  }
  try {
    const { hostname, protocol } = new URL(src);
    if (protocol !== 'https:') return false;
    if (BROKEN_DOMAINS.includes(hostname)) return false;
    return OPTIMIZABLE_HOST_SUFFIXES.some((suffix) => hostnameMatches(hostname, suffix));
  } catch {
    return false;
  }
}

export function safeImageSrc(src, fallback = '/assets/img/blog/default.jpg') {
  if (!src) return fallback;
  try {
    const { hostname } = new URL(src);
    if (BROKEN_DOMAINS.includes(hostname)) return fallback;
    return src;
  } catch {
    return src;
  }
}

export function defaultImageQuality() {
  return 70;
}
