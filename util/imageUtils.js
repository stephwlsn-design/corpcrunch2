/**
 * Image helpers for Next.js Image optimization (WebP/AVIF) and dead-host fallbacks.
 */

export const FALLBACK_IMAGE = '/assets/img/blog/blog01.jpg';

const DEAD_IMAGE_HOSTS = [
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

function parseUrl(src) {
  if (!src || typeof src !== 'string') return null;
  try {
    return new URL(src);
  } catch {
    return null;
  }
}

export function isDeadImageHost(src) {
  const parsed = parseUrl(src);
  if (!parsed) return false;
  const host = parsed.hostname.toLowerCase();
  return (
    DEAD_IMAGE_HOSTS.includes(host) ||
    host.endsWith('.recroot.ai') ||
    host.includes('recroot-next')
  );
}

export function rewriteDriveImageUrl(src) {
  const parsed = parseUrl(src);
  if (!parsed) return src;
  const host = parsed.hostname.toLowerCase();
  if (host !== 'drive.google.com' && host !== 'www.drive.google.com') {
    return src;
  }

  let id = parsed.searchParams.get('id');
  if (!id) {
    const match = parsed.pathname.match(/\/d\/([^/]+)/);
    id = match?.[1];
  }
  if (!id) return src;

  return `https://lh3.googleusercontent.com/d/${id}=w1200`;
}

export function resolveImageSrc(src, fallback = FALLBACK_IMAGE) {
  if (!src || typeof src !== 'string') return fallback;
  const trimmed = src.trim();
  if (!trimmed) return fallback;
  if (trimmed.startsWith('/') && !trimmed.startsWith('//')) return trimmed;
  if (isDeadImageHost(trimmed)) return fallback;
  return rewriteDriveImageUrl(trimmed) || fallback;
}

export function sanitizeImageFieldsInText(text, fallback = FALLBACK_IMAGE) {
  if (!text || typeof text !== 'string') return text;
  return text.replace(
    /https?:\/\/(?:www\.)?(?:recroot-next\.vercel\.app|recroot\.ai)\/[^\s"'<>)]+/gi,
    fallback
  );
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
    if (isDeadImageHost(src)) return false;
    if (hostname === 'drive.google.com' || hostname === 'www.drive.google.com') {
      return false;
    }
    return OPTIMIZABLE_HOST_SUFFIXES.some((suffix) => hostnameMatches(hostname, suffix));
  } catch {
    return false;
  }
}

export function safeImageSrc(src, fallback = FALLBACK_IMAGE) {
  return resolveImageSrc(src, fallback);
}

export function defaultImageQuality() {
  return 70;
}

export function isGifOrSvg(src) {
  if (!src || typeof src !== 'string') return false;
  return /\.gif(\?|#|$)/i.test(src) || /\.svg(\?|#|$)/i.test(src);
}

/** Always-webp URL used by CSS backgrounds and the custom Next image loader. */
export function webpProxyUrl(src, width = 800, quality = 70) {
  const resolved = resolveImageSrc(src);
  if (!resolved || isGifOrSvg(resolved)) return resolved;
  const w = Math.min(Math.max(Number(width) || 800, 16), 1200);
  const q = Math.min(Math.max(Number(quality) || 70, 1), 90);
  return `/api/webp?url=${encodeURIComponent(resolved)}&w=${w}&q=${q}`;
}
