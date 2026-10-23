import { resolveSiteBaseUrl } from '@/lib/siteUrl';
import { getRobotsDisallowedPaths } from '@/lib/sitemapConfig';

function generateRobotsTxt(baseUrl) {
  const normalizedBase = baseUrl.replace(/\/$/, '');
  const sitemapUrl = `${normalizedBase}/sitemap.xml`;
  const disallowed = getRobotsDisallowedPaths();

  const disallowLines = disallowed.map((path) => `Disallow: ${path}`).join('\n');

  return `User-agent: *
Allow: /
${disallowLines}

User-agent: Googlebot
Allow: /
${disallowLines}

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
