/**
 * SafeImage — Next.js Image with reserved dimensions, dead-host fallbacks,
 * and a sizes cap so the optimizer never requests a 3840px original.
 */
import { useEffect, useState } from 'react';
import Image from 'next/image';
import {
  defaultImageQuality,
  FALLBACK_IMAGE,
  isOptimizableImage,
  resolveImageSrc,
} from '@/util/imageUtils';

const DEFAULT_WIDTH = 800;
const DEFAULT_HEIGHT = 450;
const DEFAULT_SIZES =
  '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 400px';

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
  style,
  onError,
  ...props
}) {
  const resolvedSrc = resolveImageSrc(src);
  const [currentSrc, setCurrentSrc] = useState(resolvedSrc);

  useEffect(() => {
    setCurrentSrc(resolveImageSrc(src));
  }, [src]);

  if (!currentSrc) return null;

  const optimize = isOptimizableImage(currentSrc);
  const resolvedUnoptimized = unoptimized ?? !optimize;
  const resolvedQuality = quality ?? defaultImageQuality();
  const resolvedLoading = priority ? 'eager' : loading ?? 'lazy';
  const resolvedWidth = fill ? undefined : width || DEFAULT_WIDTH;
  const resolvedHeight = fill ? undefined : height || DEFAULT_HEIGHT;
  const resolvedSizes =
    sizes ||
    (fill ? DEFAULT_SIZES : `(max-width: 768px) 100vw, ${resolvedWidth}px`);

  return (
    <Image
      src={currentSrc}
      alt={alt}
      fill={fill}
      width={resolvedWidth}
      height={resolvedHeight}
      sizes={resolvedSizes}
      quality={resolvedQuality}
      priority={priority}
      loading={resolvedLoading}
      unoptimized={resolvedUnoptimized}
      onError={(event) => {
        if (currentSrc !== FALLBACK_IMAGE) {
          setCurrentSrc(FALLBACK_IMAGE);
        }
        onError?.(event);
      }}
      style={
        fill
          ? style
          : { width: '100%', height: 'auto', ...style }
      }
      {...props}
    />
  );
}
