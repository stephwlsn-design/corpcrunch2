import { publicRateLimiter } from '@/lib/rateLimiter';

/**
 * Homepage news ticker — Google News RSS (no NewsAPI key / quota).
 * Response shape matches ModernHero: { articles: [{ title, url, source, publishedAt }] }
 */

const TOPIC_QUERIES = {
  technology: 'technology OR software OR AI when:1d',
  business: 'business OR markets OR economy when:1d',
  finance: 'finance OR banking OR markets when:1d',
  general: 'world OR business OR technology when:1d',
};

function decodeXml(s = '') {
  return String(s)
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'")
    .trim();
}

function tag(block, name) {
  const m = block.match(new RegExp(`<${name}[^>]*>([\\s\\S]*?)</${name}>`, 'i'));
  return m ? m[1] : '';
}

function stripOutlet(title, outlet) {
  if (!outlet) return title;
  const suffix = ` - ${outlet}`;
  if (title.endsWith(suffix)) return title.slice(0, -suffix.length).trim();
  return title;
}

function sourceFrom(block, rawTitle) {
  const sourceTag = decodeXml(tag(block, 'source'));
  if (sourceTag) return sourceTag;
  const dash = rawTitle.lastIndexOf(' - ');
  if (dash > 0) return rawTitle.slice(dash + 3).trim();
  return 'Google News';
}

function parseRss(xml) {
  const items = [];
  const re = /<item>([\s\S]*?)<\/item>/gi;
  let m;
  while ((m = re.exec(xml))) {
    const block = m[1];
    const rawTitle = decodeXml(tag(block, 'title'));
    const link = decodeXml(tag(block, 'link')).trim();
    const publishedAt = decodeXml(tag(block, 'pubDate'));
    const outlet = sourceFrom(block, rawTitle);
    const title = stripOutlet(rawTitle, outlet);
    if (!link || !title) continue;
    items.push({
      title,
      url: link,
      source: outlet || 'Google News',
      publishedAt: publishedAt ? new Date(publishedAt).toISOString() : null,
    });
  }
  return items;
}

async function fetchGoogleNewsRss(query, { hl = 'en-US', gl = 'US', ceid = 'US:en' } = {}) {
  const url = new URL('https://news.google.com/rss/search');
  url.searchParams.set('q', query);
  url.searchParams.set('hl', hl);
  url.searchParams.set('gl', gl);
  url.searchParams.set('ceid', ceid);

  const res = await fetch(url.toString(), {
    headers: {
      'User-Agent': 'Mozilla/5.0 (compatible; CorpCrunchWeb/1.0)',
      Accept: 'application/rss+xml, application/xml, text/xml, */*',
    },
  });
  if (!res.ok) {
    throw new Error(`Google News RSS ${res.status}`);
  }
  return parseRss(await res.text());
}

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const rateLimitResult = await publicRateLimiter(req);
    if (!rateLimitResult.allowed) {
      res.setHeader('Retry-After', rateLimitResult.retryAfter);
      return res.status(429).json({
        error: `Rate limit exceeded. Please try again after ${rateLimitResult.retryAfter} seconds.`,
        retryAfter: rateLimitResult.retryAfter,
      });
    }
  } catch (rateLimitError) {
    console.warn('[API /google-news] Rate limiting error:', rateLimitError.message);
  }

  const topic = String(req.query.topic || 'technology').toLowerCase();
  const pageSize = Math.min(20, Math.max(1, Number(req.query.pageSize) || 10));
  const query = TOPIC_QUERIES[topic] || TOPIC_QUERIES.technology;

  try {
    const items = await fetchGoogleNewsRss(query);
    const articles = items.slice(0, pageSize);

    // Short cache so the homepage ticker stays snappy without hammering Google.
    res.setHeader('Cache-Control', 'public, s-maxage=300, stale-while-revalidate=600');
    return res.status(200).json({ articles, source: 'google-news-rss' });
  } catch (error) {
    console.error('[google-news] Unexpected error:', error);
    return res.status(502).json({
      error: 'Failed to fetch news from provider.',
      message: error.message,
    });
  }
}
