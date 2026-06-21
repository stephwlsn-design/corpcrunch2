import { resolveSiteBaseUrl } from '@/lib/siteUrl';

const DISALLOWED_PATHS = [
  '/api/',
  '/admin/',
  '/_next/',
  '/signin',
  '/register',
  '/profile',
  '/payment',
  '/make-article-request',
];

function generateRobotsTxt(baseUrl) {
  const sitemapUrl = `${baseUrl.replace(/\/$/, '')}/sitemap.xml`;

  return `User-agent: *
Allow: /
${DISALLOWED_PATHS.map((path) => `Disallow: ${path}`).join('\n')}

User-agent: Googlebot
Allow: /
${DISALLOWED_PATHS.map((path) => `Disallow: ${path}`).join('\n')}

Sitemap: ${sitemapUrl}
`;
}

export async function getServerSideProps({ req, res }) {
  const baseUrl = resolveSiteBaseUrl(req?.headers?.host || '');
  const robotsTxt = generateRobotsTxt(baseUrl);

  res.setHeader('Content-Type', 'text/plain');
  res.setHeader('Cache-Control', 'public, s-maxage=86400, stale-while-revalidate');
  res.write(robotsTxt);
  res.end();

  return { props: {} };
}

export default function RobotsTxt() {
  return null;
}
