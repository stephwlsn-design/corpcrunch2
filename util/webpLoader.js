import { defaultImageQuality, isGifOrSvg, webpProxyUrl } from './imageUtils';

/**
 * Next.js custom loader: every optimized image is requested as WebP,
 * independent of the crawler's Accept header.
 */
export default function webpLoader({ src, width, quality }) {
  if (!src) return webpProxyUrl('/assets/img/blog/blog01.jpg', width, quality);
  if (isGifOrSvg(src)) return src;
  return webpProxyUrl(src, width, quality || defaultImageQuality());
}
