import connectDB from '@/lib/mongoose';
import SiteVisitor from '@/models/SiteVisitor';
import { requireAdminAuth } from '@/lib/adminAuth';

const SORTABLE_FIELDS = new Set([
  'name',
  'email',
  'phoneNumber',
  'location',
  'country',
  'source',
  'pageViewCount',
  'lastSeenAt',
  'hostname',
  'siteFamily',
  'createdAt',
  'firstSeenAt',
]);

const SOURCES = new Set([
  'pageview',
  'register',
  'newsletter',
  'contact',
  'login',
  'profile',
  'otto',
]);

const SITE_FAMILIES = new Set(['corpcrunch.io', 'corpcrunch.ai', 'other']);

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  const authResult = await requireAdminAuth(req);
  if (!authResult.authorized) {
    return res.status(401).json({
      success: false,
      message: authResult.error || 'Unauthorized. Admin authentication required.',
    });
  }

  try {
    await connectDB();

    const {
      page = '1',
      limit = '50',
      search = '',
      sortBy = 'lastSeenAt',
      sortOrder = 'desc',
      siteFamily = '',
      hostname = '',
      source = '',
      country = '',
      hasContact = '',
    } = req.query;

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 50));
    const skip = (pageNum - 1) * limitNum;

    const resolvedSortBy = SORTABLE_FIELDS.has(String(sortBy))
      ? String(sortBy)
      : 'lastSeenAt';
    const resolvedSortOrder = String(sortOrder).toLowerCase() === 'asc' ? 1 : -1;

    const andClauses = [{ consentStatus: { $in: ['accepted', 'otto'] } }];

    if (search?.trim()) {
      const term = search.trim();
      andClauses.push({
        $or: [
          { name: { $regex: term, $options: 'i' } },
          { email: { $regex: term, $options: 'i' } },
          { phoneNumber: { $regex: term, $options: 'i' } },
          { location: { $regex: term, $options: 'i' } },
          { country: { $regex: term, $options: 'i' } },
          { city: { $regex: term, $options: 'i' } },
          { hostname: { $regex: term, $options: 'i' } },
          { domainsVisited: { $regex: term, $options: 'i' } },
        ],
      });
    }

    const family = String(siteFamily || '').trim().toLowerCase();
    if (family && SITE_FAMILIES.has(family)) {
      andClauses.push({ siteFamily: family });
    }

    const host = String(hostname || '').trim().toLowerCase();
    if (host) {
      andClauses.push({
        $or: [{ hostname: host }, { domainsVisited: host }],
      });
    }

    const src = String(source || '').trim().toLowerCase();
    if (src && SOURCES.has(src)) {
      andClauses.push({ source: src });
    }

    const countryFilter = String(country || '').trim();
    if (countryFilter) {
      andClauses.push({
        country: { $regex: `^${escapeRegex(countryFilter)}$`, $options: 'i' },
      });
    }

    const contactMode = String(hasContact || '').trim().toLowerCase();
    if (contactMode === '1' || contactMode === 'true' || contactMode === 'yes') {
      andClauses.push({
        $or: [
          { name: { $exists: true, $nin: [null, ''] } },
          { email: { $exists: true, $nin: [null, ''] } },
          { phoneNumber: { $exists: true, $nin: [null, ''] } },
        ],
      });
    } else if (contactMode === '0' || contactMode === 'false' || contactMode === 'no') {
      andClauses.push({
        $and: [
          { $or: [{ name: { $exists: false } }, { name: null }, { name: '' }] },
          { $or: [{ email: { $exists: false } }, { email: null }, { email: '' }] },
          {
            $or: [
              { phoneNumber: { $exists: false } },
              { phoneNumber: null },
              { phoneNumber: '' },
            ],
          },
        ],
      });
    }

    const filter = andClauses.length === 1 ? andClauses[0] : { $and: andClauses };

    const sort = { [resolvedSortBy]: resolvedSortOrder };
    if (resolvedSortBy !== 'lastSeenAt') {
      sort.lastSeenAt = -1;
    }

    const baseConsentFilter = { consentStatus: { $in: ['accepted', 'otto'] } };

    const [visitors, total, facets] = await Promise.all([
      SiteVisitor.find(filter)
        .sort(sort)
        .skip(skip)
        .limit(limitNum)
        .select('-pageViews')
        .lean(),
      SiteVisitor.countDocuments(filter),
      SiteVisitor.aggregate([
        { $match: baseConsentFilter },
        {
          $facet: {
            siteFamilies: [
              { $group: { _id: '$siteFamily', count: { $sum: 1 } } },
              { $sort: { count: -1 } },
            ],
            hostnames: [
              { $match: { hostname: { $type: 'string', $ne: '' } } },
              { $group: { _id: '$hostname', count: { $sum: 1 } } },
              { $sort: { count: -1 } },
              { $limit: 40 },
            ],
            sources: [
              { $group: { _id: '$source', count: { $sum: 1 } } },
              { $sort: { count: -1 } },
            ],
            countries: [
              { $match: { country: { $type: 'string', $ne: '' } } },
              { $group: { _id: '$country', count: { $sum: 1 } } },
              { $sort: { count: -1 } },
              { $limit: 40 },
            ],
          },
        },
      ]),
    ]);

    const facetRow = facets?.[0] || {};
    const mapFacet = (rows) =>
      (rows || [])
        .filter((row) => row._id)
        .map((row) => ({ value: row._id, count: row.count }));

    return res.status(200).json({
      success: true,
      data: visitors,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum) || 1,
      },
      sort: {
        sortBy: resolvedSortBy,
        sortOrder: resolvedSortOrder === 1 ? 'asc' : 'desc',
      },
      filters: {
        siteFamily: family || '',
        hostname: host || '',
        source: src || '',
        country: countryFilter || '',
        hasContact: contactMode || '',
        search: search?.trim() || '',
      },
      facets: {
        siteFamilies: mapFacet(facetRow.siteFamilies),
        hostnames: mapFacet(facetRow.hostnames),
        sources: mapFacet(facetRow.sources),
        countries: mapFacet(facetRow.countries),
      },
    });
  } catch (error) {
    console.error('[API /admin/visitors] Error:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch visitors' });
  }
}

function escapeRegex(value) {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
