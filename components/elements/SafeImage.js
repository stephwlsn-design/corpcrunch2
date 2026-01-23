/**
 * SafeImage Component - Handles images from any external domain
 * Uses unoptimized mode for external images to bypass Next.js domain restrictions
 * This allows loading images from ANY external domain
 */
import Image from 'next/image';

export default function SafeImage({ src, alt, ...props }) {
  // Check if src is an external URL
  const isExternal = src && (src.startsWith('http://') || src.startsWith('https://'));
  const isLocal = src && src.startsWith('/');

  // For external images, use unoptimized to bypass domain restrictions
  // This allows loading from ANY domain
  if (isExternal) {
    return (
      <Image
        src={src}
        alt={alt}
        {...props}
        unoptimized={true} // Bypass Next.js optimization and domain check
      />
    );
  }

  // For local images, use optimized Next.js Image component
  return (
    <Image
      src={src}
      alt={alt}
      {...props}
    />
  );
}

