export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const apiKey =
    process.env.GOOGLE_NEWS_API_KEY ||
    process.env.NEWSAPI_KEY ||
    process.env.NEWS_API_KEY;

  if (!apiKey) {
    console.error('[google-news] Missing Google News / NewsAPI key');
    return res.status(500).json({
      error: 'News API key not configured on the server.',
    });
  }

  const { topic = 'technology', pageSize = 10 } = req.query;

  try {
    // Using NewsAPI.org which provides a Google News–style API
    const url = new URL('https://newsapi.org/v2/top-headlines');
    url.searchParams.set('language', 'en');
    url.searchParams.set('pageSize', String(pageSize || 10));
    url.searchParams.set('category', topic || 'technology');

    const response = await fetch(url.toString(), {
      headers: {
        'X-Api-Key': apiKey,
      },
    });

    if (!response.ok) {
      const text = await response.text();
      console.error('[google-news] Upstream error:', response.status, text);
      return res.status(502).json({
        error: 'Failed to fetch news from provider.',
        status: response.status,
      });
    }

    const data = await response.json();

    const articles =
      Array.isArray(data.articles) && data.articles.length > 0
        ? data.articles.map((article) => ({
            title: article.title || '',
            url: article.url || '',
            source: article.source?.name || 'Google News',
            publishedAt: article.publishedAt || null,
          }))
        : [];

    return res.status(200).json({ articles });
  } catch (error) {
    console.error('[google-news] Unexpected error:', error);
    return res.status(500).json({
      error: 'Unexpected error while fetching news.',
      message: error.message,
    });
  }
}


