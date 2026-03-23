import { BetaAnalyticsDataClient } from '@google-analytics/data';
import { requireAdminAuth } from '@/lib/adminAuth';

const PROPERTIES = {
  corpcrunch: process.env.GA_PROPERTY_CORPCRUNCH,
  cnvrsn: process.env.GA_PROPERTY_CNVRSN,
  prowess: process.env.GA_PROPERTY_PROWESS,
  qrety: process.env.GA_PROPERTY_QRETY,
  otto: process.env.GA_PROPERTY_OTTO,
};

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  let authResult;
  try {
    authResult = await requireAdminAuth(req);
  } catch (authError) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  if (!authResult.authorized) {
    return res.status(401).json({ error: authResult.error || 'Unauthorized' });
  }

  const site = req.query.site || 'corpcrunch';
  const range = req.query.range || '7daysAgo';

  const startDate = range;
  const endDate = 'today';

  const property = PROPERTIES[site];
  if (!property) {
    return res.status(400).json({ error: 'Unknown site' });
  }

  const gaKey = process.env.GA_SERVICE_ACCOUNT_KEY;
  if (!gaKey) {
    return res.status(503).json({
      error: 'Analytics not configured',
      message: 'GA_SERVICE_ACCOUNT_KEY is not set. Add your service account JSON to .env.local',
    });
  }

  let credentials;
  try {
    credentials = typeof gaKey === 'string' ? JSON.parse(gaKey) : gaKey;
  } catch (e) {
    return res.status(500).json({ error: 'Invalid GA_SERVICE_ACCOUNT_KEY format' });
  }

  try {
    const client = new BetaAnalyticsDataClient({ credentials });

    const [
      [overviewResponse],
      [timeseriesResponse],
      [sourcesResponse],
      [pagesResponse],
      [countriesResponse],
      [devicesResponse],
    ] = await Promise.all([
      client.runReport({
        property,
        dateRanges: [{ startDate, endDate }],
        metrics: [
          { name: 'sessions' },
          { name: 'screenPageViews' },
          { name: 'totalUsers' },
          { name: 'bounceRate' },
          { name: 'averageSessionDuration' },
        ],
      }),
      client.runReport({
        property,
        dateRanges: [{ startDate, endDate }],
        dimensions: [{ name: 'date' }],
        metrics: [{ name: 'sessions' }, { name: 'screenPageViews' }],
        orderBys: [{ dimension: { dimensionName: 'date' } }],
      }),
      client.runReport({
        property,
        dateRanges: [{ startDate, endDate }],
        dimensions: [{ name: 'sessionSourceMedium' }],
        metrics: [{ name: 'sessions' }],
        orderBys: [{ metric: { metricName: 'sessions' }, desc: true }],
        limit: 10,
      }),
      client.runReport({
        property,
        dateRanges: [{ startDate, endDate }],
        dimensions: [{ name: 'pagePath' }],
        metrics: [{ name: 'screenPageViews' }],
        orderBys: [{ metric: { metricName: 'screenPageViews' }, desc: true }],
        limit: 10,
      }),
      client.runReport({
        property,
        dateRanges: [{ startDate, endDate }],
        dimensions: [{ name: 'country' }],
        metrics: [{ name: 'sessions' }],
        orderBys: [{ metric: { metricName: 'sessions' }, desc: true }],
        limit: 10,
      }),
      client.runReport({
        property,
        dateRanges: [{ startDate, endDate }],
        dimensions: [{ name: 'deviceCategory' }],
        metrics: [{ name: 'sessions' }],
      }),
    ]);

    // GA4 API returns metricValues as ordered array (no name property) — use index
    const getMetricByIndex = (row, idx) => row?.metricValues?.[idx]?.value ?? '0';

    // Overview: sessions(0), screenPageViews(1), totalUsers(2), bounceRate(3), averageSessionDuration(4)
    const overviewRow = overviewResponse.rows?.[0];
    const overview = overviewRow
      ? {
          sessions: getMetricByIndex(overviewRow, 0),
          screenPageViews: getMetricByIndex(overviewRow, 1),
          totalUsers: getMetricByIndex(overviewRow, 2),
          bounceRate: getMetricByIndex(overviewRow, 3),
          averageSessionDuration: getMetricByIndex(overviewRow, 4),
        }
      : null;

    // Timeseries: dimensionValues[0]=date, metricValues[0]=sessions, metricValues[1]=screenPageViews
    const timeseries = (timeseriesResponse.rows || []).map((row) => ({
      date: row.dimensionValues?.[0]?.value || '',
      sessions: getMetricByIndex(row, 0),
      screenPageViews: getMetricByIndex(row, 1),
    }));

    // Sources/Pages/Countries/Devices: dimensionValues[0]=dimension, metricValues[0]=sessions/views
    const sources = (sourcesResponse.rows || []).map((row) => ({
      source: row.dimensionValues?.[0]?.value || '(direct)',
      sessions: getMetricByIndex(row, 0),
    }));

    const pages = (pagesResponse.rows || []).map((row) => ({
      path: row.dimensionValues?.[0]?.value || '/',
      views: getMetricByIndex(row, 0),
    }));

    const countries = (countriesResponse.rows || []).map((row) => ({
      country: row.dimensionValues?.[0]?.value || '',
      sessions: getMetricByIndex(row, 0),
    }));

    const devices = (devicesResponse.rows || []).map((row) => ({
      device: row.dimensionValues?.[0]?.value || '',
      sessions: getMetricByIndex(row, 0),
    }));

    res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate');
    return res.status(200).json({
      overview,
      timeseries,
      sources,
      pages,
      countries,
      devices,
    });
  } catch (err) {
    console.error('Analytics API error:', err);
    return res.status(500).json({
      error: 'Failed to fetch analytics',
      message: process.env.NODE_ENV === 'development' ? err.message : undefined,
    });
  }
}
