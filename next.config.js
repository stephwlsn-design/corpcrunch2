// next.config.js
/**
 * @type {import('next').NextConfig}
 */
const nextConfig = {
  // Production optimizations
  compress: true,
  poweredByHeader: false,
  reactStrictMode: true,
  
  webpack(config, { isServer }) {
    // Add file-loader for video files
    config.module.rules.push({
      test: /\.(mp4|webm)$/,
      use: [
        {
          loader: 'file-loader',
          options: {
            publicPath: '/_next/static/videos/',
            outputPath: 'static/videos/',
            name: '[name].[hash].[ext]',
          },
        },
      ],
    });

    return config;
  },
  images: {
    // Configure remotePatterns for external domains
    // To support ALL domains, you can use unoptimized prop on Image components
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.recroot-next.vercel.app',
      },
      {
        protocol: 'https',
        hostname: '**.recroot.ai',
      },
      {
        protocol: 'https',
        hostname: 'image.cnbcfm.com',
      },
      {
        protocol: 'https',
        hostname: 'www.cnbc.com',
      },
      {
        protocol: 'https',
        hostname: 'www.autonews.com',
      },
      {
        protocol: 'https',
        hostname: 'ichef.bbci.co.uk',
      },
      {
        protocol: 'https',
        hostname: '**.bbci.co.uk',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'media.gettyimages.com',
      },
      {
        protocol: 'https',
        hostname: '**.istockphoto.com',
      },
      {
        protocol: 'https',
        hostname: 'www.istockphoto.com',
      },
      {
        protocol: 'https',
        hostname: 'media.istockphoto.com',
      },
      {
        protocol: 'https',
        hostname: 'unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: '**.unsplash.com',
      },
    ],
    // Legacy domains support (deprecated but still works)
    domains: [
      'recroot-next.vercel.app',
      'recroot.ai',
      'www.recroot.ai',
      'images.unsplash.com',
      'image.cnbcfm.com',
      'www.cnbc.com',
      'cnbc.com',
      'www.autonews.com',
      'autonews.com',
      'ichef.bbci.co.uk',
      'bbci.co.uk',
      'media.gettyimages.com',
      'istockphoto.com',
      'www.istockphoto.com',
      'media.istockphoto.com',
      'unsplash.com',
      'images.unsplash.com',
    ],
    // Optimize images for production
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 31536000, // 1 year cache for optimized images
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
  // Configure custom port for development
  async rewrites() {
    return [];
  },
  // Add API route caching for production
  async generateBuildId() {
    // Use timestamp for cache busting in production
    return process.env.BUILD_ID || `build-${Date.now()}`;
  },
  // Security headers
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on'
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload'
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block'
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin'
          },
        ],
      },
      {
        // Cache static assets aggressively
        source: '/assets/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        // Cache Next.js static files
        source: '/_next/static/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        // Cache images
        source: '/_next/image',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ];
  },
  // Production build optimizations
  swcMinify: true,
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production' ? {
      exclude: ['error', 'warn'],
    } : false,
  },
  // Optimize production builds
  productionBrowserSourceMaps: false,
  // Enable static page generation where possible
  output: 'standalone',
  // Optimize fonts
  optimizeFonts: true,
  // Experimental features for better performance
  experimental: {
    optimizeCss: true,
  },
  // Suppress CSS warnings during build (files in public/ are available at runtime)
  onDemandEntries: {
    maxInactiveAge: 25 * 1000,
    pagesBufferLength: 2,
  },
};

module.exports = nextConfig;
