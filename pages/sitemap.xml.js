// pages/sitemap.xml.js
import axiosInstance from '@/util/axiosInstance';

const baseUrl = 'https://www.corpcrunch.io';
const currentDate = new Date().toISOString();
const staticPages = [
    '',
    'cancellation-refund-policy',
    'crunch-the-miles-marathon-by-corp-crunch',
    'make-article-request',
    'payment',
    'privacy-policy',
    'terms-of-service',
    'signin',
    'subscribe',
    'profile'
];
function generateSiteMap(posts) {
    return `<?xml version="1.0" encoding="UTF-8"?>
    <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
      ${staticPages
            .map((page) => {
                return `
            <url>
              <loc>${`${baseUrl}/${page}`}</loc>
              <lastmod>${currentDate}</lastmod>
              <changefreq>weekly</changefreq>
              <priority>${page === '' ? '1.0' : '0.8'}</priority>
            </url>
          `;
            })
            .join('')}
      ${posts
            .map((post) => {
                return `
            <url>
              <loc>${`${baseUrl}/blog/${post.slug}`}</loc>
              <lastmod>${currentDate}</lastmod>
              <changefreq>monthly</changefreq>
              <priority>0.6</priority>
            </url>
          `;
            })
            .join('')}
    </urlset>
  `;
}

export async function getServerSideProps({ res }) {
    try {
        // Fetch blog posts from API instead of direct database query
        const postsResponse = await axiosInstance.get('/posts');
        const allPosts = [
            ...(postsResponse?.frontPagePosts || []),
            ...(postsResponse?.trendingPosts || [])
        ];
        
        // Get unique posts by slug
        const uniquePosts = Array.from(
            new Map(allPosts.map(post => [post.slug, post])).values()
        );

    // Generate the sitemap
        const sitemap = generateSiteMap(uniquePosts);

    res.setHeader('Content-Type', 'text/xml');
    res.write(sitemap);
    res.end();

    return {
        props: {},
    };
    } catch (error) {
        console.error('Error generating sitemap:', error);
        // Return a basic sitemap with just static pages if API fails
        const sitemap = generateSiteMap([]);
        res.setHeader('Content-Type', 'text/xml');
        res.write(sitemap);
        res.end();
        return {
            props: {},
        };
    }
}

export default function Sitemap() {
    // This component doesn't render anything
    return null;
}