/**
 * SafeImage — routes images through Next.js so they convert to WebP/AVIF,
 * lazy-load below the fold, and keep reserved width/height for CLS.
 */
import Image from 'next/image';
import { defaultImageQuality, isOptimizableImage } from '@/util/imageUtils';

export default function SafeImage({
  src,
  alt = '',
  priority = false,
  quality,
  loading,
  unoptimized,
  sizes,
  fill,
  width,
  height,
  ...props
}) {
  if (!src) return null;

  const optimize = isOptimizableImage(src);
  const resolvedUnoptimized = unoptimized ?? !optimize;
  const resolvedQuality = quality ?? defaultImageQuality();
  const resolvedLoading = priority ? 'eager' : loading ?? 'lazy';
  const resolvedSizes =
    sizes ||
    (fill ? '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw' : undefined);

  return (
    <Image
      src={src}
      alt={alt}
      fill={fill}
      width={fill ? undefined : width}
      height={fill ? undefined : height}
      sizes={resolvedSizes}
      quality={resolvedQuality}
      priority={priority}
      loading={resolvedLoading}
      unoptimized={resolvedUnoptimized}
      {...props}
    />
  );
}
