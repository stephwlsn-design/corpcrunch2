// next.config.js
/**
 * @type {import('next').NextConfig}
 */
const nextConfig = {
  // Production optimizations
  compress: true,
  poweredByHeader: false,
  reactStrictMode: true,

  transpilePackages: ['pdfjs-dist'],

  webpack(config, { isServer }) {
    config.resolve.alias = {
      ...config.resolve.alias,
      canvas: false,
    };
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
      {
        protocol: 'https',
        hostname: 'images.pexels.com',
      },
      {
        protocol: 'https',
        hostname: '**.pexels.com',
      },
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
      },
      {
        protocol: 'https',
        hostname: '**.googleusercontent.com',
      },
      {
        protocol: 'https',
        hostname: '**.gstatic.com',
      },
      {
        protocol: 'https',
        hostname: 'img.youtube.com',
      },
      {
        protocol: 'https',
        hostname: 'i.ytimg.com',
      },
      {
        protocol: 'https',
        hostname: '**.ytimg.com',
      },
      {
        protocol: 'https',
        hostname: '**.cloudinary.com',
      },
      {
        protocol: 'https',
        hostname: '**.amazonaws.com',
      },
      {
        protocol: 'https',
        hostname: '**.cloudfront.net',
      },
      {
        protocol: 'https',
        hostname: 'i0.wp.com',
      },
      {
        protocol: 'https',
        hostname: '**.wp.com',
      },
      {
        protocol: 'https',
        hostname: 'pbs.twimg.com',
      },
      {
        protocol: 'https',
        hostname: '**.twimg.com',
      },
      {
        protocol: 'https',
        hostname: '**.fbcdn.net',
      },
      {
        protocol: 'https',
        hostname: 'media.licdn.com',
      },
      {
        protocol: 'https',
        hostname: '**.google.com',
      },
      {
        protocol: 'https',
        hostname: '**.corpcrunch.ai',
      },
      {
        protocol: 'https',
        hostname: 'www.corpcrunch.ai',
      },
      {
        protocol: 'https',
        hostname: 'corpcrunch.ai',
      },
      {
        protocol: 'https',
        hostname: '**.corpcrunch.io',
      },
      {
        protocol: 'https',
        hostname: 'prowess.corpcrunch.io',
      },
      {
        protocol: 'https',
        hostname: 'corpcrunch.io',
      },
      {
        protocol: 'https',
        hostname: 'www.corpcrunch.io',
      },
      {
        protocol: 'https',
        hostname: 'drive.google.com',
      },
      {
        protocol: 'https',
        hostname: 'intelligent.corpcrunch.io',
      },
      {
        protocol: 'https',
        hostname: 'intelligent.corpcrunch.ai',
      },
      {
        protocol: 'https',
        hostname: 'recroot-next.vercel.app',
      },
      {
        protocol: 'https',
        hostname: 'www.recroot.ai',
      },
      {
        protocol: 'https',
        hostname: 'recroot.ai',
      },
      {
        protocol: 'https',
        hostname: '**.recroot.ai',
      },
    ],
    // Legacy domains support (deprecated but still works)
    domains: [
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
      'corpcrunch.io',
      'www.corpcrunch.io',
      'prowess.corpcrunch.io',
      'drive.google.com',
      'lh3.googleusercontent.com',
      'recroot-next.vercel.app',
      'www.recroot.ai',
      'recroot.ai',
    ],
    // Built-in optimizer (not /api/webp). Browsers that send Accept: image/webp get WebP.
    formats: ['image/webp'],
    minimumCacheTTL: 31536000, // 1 year cache for optimized images
    deviceSizes: [480, 640, 750, 828, 1080, 1200],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    dangerouslyAllowSVG: true,
    // Remove contentSecurityPolicy - it was blocking external image proxying
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
      {
        source: '/:path*.webp',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        source: '/:path*.avif',
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
  // output: 'standalone', // Disabled - causes image optimizer issues in dev
  // Optimize fonts
  optimizeFonts: true,
  // optimizeCss disabled: this experimental feature uses `critters` to inline
  // critical CSS but it looks for stylesheets in the `.next/` build output.
  // Our stylesheets live in `public/assets/css/` and are served via <link> tags
  // in _document.js, so optimizeCss cannot find them and breaks CSS rendering.
  experimental: {
    optimizeCss: false,
  },
  // Suppress CSS warnings during build (files in public/ are available at runtime)
  onDemandEntries: {
    maxInactiveAge: 25 * 1000,
    pagesBufferLength: 2,
  },
};

module.exports = nextConfig;
