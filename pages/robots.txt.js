import { resolveSiteBaseUrl } from '@/lib/siteUrl';
import {
  getRobotsAllowedPaths,
  getRobotsDisallowedPaths,
} from '@/lib/sitemapConfig';

function generateRobotsTxt(baseUrl) {
  const normalizedBase = baseUrl.replace(/\/$/, '');
  const sitemapUrl = `${normalizedBase}/sitemap.xml`;
  const allowed = getRobotsAllowedPaths();
  const disallowed = getRobotsDisallowedPaths();

  const allowLines = allowed.map((path) => `Allow: ${path}`).join('\n');
  const disallowLines = disallowed.map((path) => `Disallow: ${path}`).join('\n');

  return `User-agent: *
Allow: /
${allowLines}
${disallowLines}

User-agent: Googlebot
Allow: /
${allowLines}
${disallowLines}

Sitemap: ${sitemapUrl}
`;
}

export async function getServerSideProps({ req, res }) {
  const baseUrl = resolveSiteBaseUrl(req?.headers?.host || '');
  const robotsTxt = generateRobotsTxt(baseUrl);

  res.setHeader('Content-Type', 'text/plain');
  // Short cache so robots updates propagate quickly after deploys
  res.setHeader('Cache-Control', 'public, s-maxage=300, stale-while-revalidate=60');
  res.write(robotsTxt);
  res.end();

  return { props: {} };
}

export default function RobotsTxt() {
  return null;
}
