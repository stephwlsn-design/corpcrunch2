import { useEffect, useState, useCallback } from 'react';
import Head from 'next/head';
import axiosInstance from '@/util/axiosInstance';
import AdminLayout from '@/components/admin/AdminLayout';
import { isAdminSessionValid, clearAdminSession } from '@/lib/adminSession';

export default function AdminVisitorsPage() {
  const [visitors, setVisitors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });

  const fetchVisitors = useCallback(async (page = 1, searchTerm = '') => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: String(page),
        limit: '50',
      });
      if (searchTerm.trim()) params.append('search', searchTerm.trim());

      const response = await axiosInstance.get(`/admin/visitors?${params.toString()}`);
      if (response?.success) {
        setVisitors(response.data || []);
        setPagination(response.pagination || { page: 1, totalPages: 1, total: 0 });
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
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined' && !isAdminSessionValid()) {
      clearAdminSession();
      window.location.href = '/admin/login';
      return;
    }
    fetchVisitors(1, search);
  }, [fetchVisitors, search]);

  const formatDate = (value) => {
    if (!value) return '—';
    return new Date(value).toLocaleString();
  };

  return (
    <>
      <Head>
        <title>Site Visitors - Admin</title>
        <meta name="robots" content="noindex, nofollow" />
      </Head>

      <AdminLayout
        title="Site Visitors"
        subtitle="Cookie-consented visitor data: name, email, phone, and location"
      >
        <div style={{ background: '#fff', borderRadius: 8, padding: 20, boxShadow: '0 2px 4px rgba(0,0,0,0.08)' }}>
          <div className="d-flex justify-content-between align-items-center flex-wrap gap-3 mb-4">
            <input
              type="search"
              className="form-control"
              style={{ maxWidth: 360 }}
              placeholder="Search name, email, phone, location..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <div className="text-muted" style={{ fontSize: 14 }}>
              {pagination.total} visitors with cookie consent
            </div>
          </div>

          {loading ? (
            <p className="text-muted">Loading visitors...</p>
          ) : visitors.length === 0 ? (
            <p className="text-muted">No visitor records yet. Data appears after users accept cookies.</p>
          ) : (
            <div className="table-responsive">
              <table className="table table-striped align-middle">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Phone</th>
                    <th>Location</th>
                    <th>Country</th>
                    <th>Source</th>
                    <th>Page Views</th>
                    <th>Last Seen</th>
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
                disabled={pagination.page <= 1}
                onClick={() => fetchVisitors(pagination.page - 1, search)}
              >
                Previous
              </button>
              <span className="text-muted" style={{ fontSize: 14 }}>
                Page {pagination.page} of {pagination.totalPages}
              </span>
              <button
                type="button"
                className="btn btn-outline-secondary btn-sm"
                disabled={pagination.page >= pagination.totalPages}
                onClick={() => fetchVisitors(pagination.page + 1, search)}
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
