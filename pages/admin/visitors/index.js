import { useEffect, useState, useCallback } from 'react';
import Head from 'next/head';
import axiosInstance from '@/util/axiosInstance';
import AdminLayout from '@/components/admin/AdminLayout';
import { isAdminSessionValid, clearAdminSession } from '@/lib/adminSession';

const SORT_COLUMNS = [
  { key: 'name', label: 'Name' },
  { key: 'email', label: 'Email' },
  { key: 'phoneNumber', label: 'Phone' },
  { key: 'location', label: 'Location' },
  { key: 'country', label: 'Country' },
  { key: 'hostname', label: 'Domain' },
  { key: 'source', label: 'Source' },
  { key: 'pageViewCount', label: 'Page Views' },
  { key: 'lastSeenAt', label: 'Last Seen' },
];

const SITE_FAMILY_OPTIONS = [
  { value: '', label: 'All domains' },
  { value: 'corpcrunch.io', label: 'corpcrunch.io' },
  { value: 'corpcrunch.ai', label: 'corpcrunch.ai' },
  { value: 'other', label: 'Other' },
];

export default function AdminVisitorsPage() {
  const [visitors, setVisitors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [siteFamily, setSiteFamily] = useState('');
  const [hostname, setHostname] = useState('');
  const [source, setSource] = useState('');
  const [country, setCountry] = useState('');
  const [hasContact, setHasContact] = useState('1');
  const [sortBy, setSortBy] = useState('lastSeenAt');
  const [sortOrder, setSortOrder] = useState('desc');
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });
  const [facets, setFacets] = useState({
    siteFamilies: [],
    hostnames: [],
    sources: [],
    countries: [],
  });

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(timer);
  }, [search]);

  const fetchVisitors = useCallback(
    async (page = 1) => {
      try {
        setLoading(true);
        const params = new URLSearchParams({
          page: String(page),
          limit: '50',
          sortBy,
          sortOrder,
        });
        if (debouncedSearch.trim()) params.append('search', debouncedSearch.trim());
        if (siteFamily) params.append('siteFamily', siteFamily);
        if (hostname) params.append('hostname', hostname);
        if (source) params.append('source', source);
        if (country) params.append('country', country);
        if (hasContact !== '') params.append('hasContact', hasContact);

        const response = await axiosInstance.get(`/admin/visitors?${params.toString()}`);
        if (response?.success) {
          setVisitors(response.data || []);
          setPagination(response.pagination || { page: 1, totalPages: 1, total: 0 });
          if (response.facets) {
            setFacets({
              siteFamilies: response.facets.siteFamilies || [],
              hostnames: response.facets.hostnames || [],
              sources: response.facets.sources || [],
              countries: response.facets.countries || [],
            });
          }
        }
      } catch (error) {
        console.error('Failed to fetch visitors:', error);
        if (error?.response?.status === 401 && typeof window !== 'undefined') {
          clearAdminSession();
          window.location.href = '/admin/login';
        }
      } finally {
        setLoading(false);
      }
    },
    [debouncedSearch, siteFamily, hostname, source, country, hasContact, sortBy, sortOrder]
  );

  useEffect(() => {
    if (typeof window !== 'undefined' && !isAdminSessionValid()) {
      clearAdminSession();
      window.location.href = '/admin/login';
      return;
    }
    fetchVisitors(1);
  }, [fetchVisitors]);

  const handleSort = (columnKey) => {
    if (sortBy === columnKey) {
      setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortBy(columnKey);
      setSortOrder(columnKey === 'name' || columnKey === 'email' ? 'asc' : 'desc');
    }
  };

  const sortIndicator = (columnKey) => {
    if (sortBy !== columnKey) return '';
    return sortOrder === 'asc' ? ' ↑' : ' ↓';
  };

  const formatDate = (value) => {
    if (!value) return '—';
    return new Date(value).toLocaleString();
  };

  const formatDomain = (visitor) => {
    if (visitor.hostname) return visitor.hostname;
    if (Array.isArray(visitor.domainsVisited) && visitor.domainsVisited.length > 0) {
      return visitor.domainsVisited.join(', ');
    }
    return '—';
  };

  const clearFilters = () => {
    setSearch('');
    setDebouncedSearch('');
    setSiteFamily('');
    setHostname('');
    setSource('');
    setCountry('');
    setHasContact('1');
    setSortBy('lastSeenAt');
    setSortOrder('desc');
  };

  const hasActiveFilters =
    Boolean(debouncedSearch.trim()) ||
    Boolean(siteFamily) ||
    Boolean(hostname) ||
    Boolean(source) ||
    Boolean(country) ||
    hasContact !== '1';

  return (
    <>
      <Head>
        <title>Site Visitors - Admin</title>
        <meta name="robots" content="noindex, nofollow" />
      </Head>

      <AdminLayout
        title="Site Visitors"
        subtitle="Cookie-consented visitor data across all corpcrunch.io and corpcrunch.ai domains"
      >
        <div style={{ background: '#fff', borderRadius: 8, padding: 20, boxShadow: '0 2px 4px rgba(0,0,0,0.08)' }}>
          <div className="row g-3 align-items-end mb-3">
            <div className="col-md-4">
              <label className="form-label" style={{ fontSize: 12, color: '#666', marginBottom: 4 }}>
                Search
              </label>
              <input
                type="search"
                className="form-control"
                placeholder="Search name, email, phone, location, domain..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div className="col-md-2">
              <label className="form-label" style={{ fontSize: 12, color: '#666', marginBottom: 4 }}>
                Site family
              </label>
              <select
                className="form-select"
                value={siteFamily}
                onChange={(e) => {
                  setSiteFamily(e.target.value);
                  setHostname('');
                }}
              >
                {SITE_FAMILY_OPTIONS.map((opt) => (
                  <option key={opt.value || 'all'} value={opt.value}>
                    {opt.label}
                    {opt.value
                      ? ` (${facets.siteFamilies.find((f) => f.value === opt.value)?.count || 0})`
                      : ''}
                  </option>
                ))}
              </select>
            </div>
            <div className="col-md-2">
              <label className="form-label" style={{ fontSize: 12, color: '#666', marginBottom: 4 }}>
                Domain
              </label>
              <select
                className="form-select"
                value={hostname}
                onChange={(e) => setHostname(e.target.value)}
              >
                <option value="">All hostnames</option>
                {facets.hostnames
                  .filter((h) => {
                    if (!siteFamily) return true;
                    if (siteFamily === 'corpcrunch.io') {
                      return h.value === 'corpcrunch.io' || h.value.endsWith('.corpcrunch.io');
                    }
                    if (siteFamily === 'corpcrunch.ai') {
                      return h.value === 'corpcrunch.ai' || h.value.endsWith('.corpcrunch.ai');
                    }
                    return !(
                      h.value.includes('corpcrunch.io') || h.value.includes('corpcrunch.ai')
                    );
                  })
                  .map((h) => (
                    <option key={h.value} value={h.value}>
                      {h.value} ({h.count})
                    </option>
                  ))}
              </select>
            </div>
            <div className="col-md-2">
              <label className="form-label" style={{ fontSize: 12, color: '#666', marginBottom: 4 }}>
                Source
              </label>
              <select
                className="form-select"
                value={source}
                onChange={(e) => setSource(e.target.value)}
              >
                <option value="">All sources</option>
                {facets.sources.map((s) => (
                  <option key={s.value} value={s.value}>
                    {s.value} ({s.count})
                  </option>
                ))}
              </select>
            </div>
            <div className="col-md-2">
              <label className="form-label" style={{ fontSize: 12, color: '#666', marginBottom: 4 }}>
                Country
              </label>
              <select
                className="form-select"
                value={country}
                onChange={(e) => setCountry(e.target.value)}
              >
                <option value="">All countries</option>
                {facets.countries.map((c) => (
                  <option key={c.value} value={c.value}>
                    {c.value} ({c.count})
                  </option>
                ))}
              </select>
            </div>
            <div className="col-md-2">
              <label className="form-label" style={{ fontSize: 12, color: '#666', marginBottom: 4 }}>
                Contact details
              </label>
              <select
                className="form-select"
                value={hasContact}
                onChange={(e) => setHasContact(e.target.value)}
              >
                <option value="1">With name / email / phone</option>
                <option value="">All visitors</option>
                <option value="0">Missing contact</option>
              </select>
            </div>
          </div>

          <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-4">
            <div className="text-muted" style={{ fontSize: 14 }}>
              {pagination.total.toLocaleString()} visitors with cookie consent
              {siteFamily ? ` · ${siteFamily}` : ' · all domains'}
            </div>
            {hasActiveFilters && (
              <button
                type="button"
                className="btn btn-outline-secondary btn-sm"
                onClick={clearFilters}
              >
                Clear filters
              </button>
            )}
          </div>

          {loading ? (
            <p className="text-muted">Loading visitors...</p>
          ) : visitors.length === 0 ? (
            <p className="text-muted">
              No visitor records match the current filters.
            </p>
          ) : (
            <div className="table-responsive">
              <table className="table table-striped align-middle">
                <thead>
                  <tr>
                    {SORT_COLUMNS.map((col) => (
                      <th key={col.key}>
                        <button
                          type="button"
                          onClick={() => handleSort(col.key)}
                          style={{
                            background: 'none',
                            border: 'none',
                            padding: 0,
                            fontWeight: 600,
                            color: sortBy === col.key ? '#0d6efd' : 'inherit',
                            cursor: 'pointer',
                          }}
                        >
                          {col.label}
                          {sortIndicator(col.key)}
                        </button>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {visitors.map((visitor) => (
                    <tr key={visitor._id}>
                      <td>{visitor.name || '—'}</td>
                      <td>{visitor.email || '—'}</td>
                      <td>{visitor.phoneNumber || '—'}</td>
                      <td>{visitor.location || visitor.city || '—'}</td>
                      <td>{visitor.country || '—'}</td>
                      <td>
                        <span title={
                          Array.isArray(visitor.domainsVisited)
                            ? visitor.domainsVisited.join(', ')
                            : ''
                        }>
                          {formatDomain(visitor)}
                        </span>
                        {visitor.siteFamily ? (
                          <div className="text-muted" style={{ fontSize: 11 }}>
                            {visitor.siteFamily}
                          </div>
                        ) : null}
                      </td>
                      <td>{visitor.source || 'pageview'}</td>
                      <td>{visitor.pageViewCount || 0}</td>
                      <td>{formatDate(visitor.lastSeenAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {pagination.totalPages > 1 && (
            <div className="d-flex justify-content-between align-items-center mt-3">
              <button
                type="button"
                className="btn btn-outline-secondary btn-sm"
                disabled={pagination.page <= 1 || loading}
                onClick={() => fetchVisitors(pagination.page - 1)}
              >
                Previous
              </button>
              <span className="text-muted" style={{ fontSize: 14 }}>
                Page {pagination.page} of {pagination.totalPages}
              </span>
              <button
                type="button"
                className="btn btn-outline-secondary btn-sm"
                disabled={pagination.page >= pagination.totalPages || loading}
                onClick={() => fetchVisitors(pagination.page + 1)}
              >
                Next
              </button>
            </div>
          )}
        </div>
      </AdminLayout>
    </>
  );
}
