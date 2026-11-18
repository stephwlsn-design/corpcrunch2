import { useCallback, useEffect, useState } from 'react';
import Head from 'next/head';
import axiosInstance from '@/util/axiosInstance';
import AdminLayout from '@/components/admin/AdminLayout';
import { isAdminSessionValid, clearAdminSession } from '@/lib/adminSession';

const STATUS_STYLE = {
  unopened: 'bg-primary',
  viewed: 'bg-success',
  expired: 'bg-secondary',
  revoked: 'bg-dark',
  held: 'bg-danger',
  purged: 'bg-light text-dark border',
};

const STATUS_LABEL = {
  unopened: 'Waiting',
  viewed: 'Viewed',
  expired: 'Expired',
  revoked: 'Revoked',
  held: 'Held (reported)',
  purged: 'Deleted (30 days)',
};

function formatSize(bytes) {
  if (!bytes) return '—';
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function formatDate(value) {
  if (!value) return '—';
  return new Date(value).toLocaleString();
}

export default function AdminSecureSharePage() {
  const [items, setItems] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [busyId, setBusyId] = useState('');

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get('/admin/secure-share', {
        params: filter === 'flagged' ? { filter: 'flagged' } : undefined,
      });
      if (response?.success) {
        setItems(response.data || []);
        setStats(response.stats || null);
      }
    } catch (err) {
      if (err?.response?.status === 401 && typeof window !== 'undefined') {
        clearAdminSession();
        window.location.href = '/admin/login';
      } else {
        setError('Could not load shared files.');
      }
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    if (typeof window !== 'undefined' && !isAdminSessionValid()) {
      clearAdminSession();
      window.location.href = '/admin/login';
      return;
    }
    load();
  }, [load]);

  const preview = async (item) => {
    setError('');
    setBusyId(item.id);
    try {
      const blob = await axiosInstance.get(`/admin/secure-share/${item.id}/file`, {
        responseType: 'blob',
      });
      const url = URL.createObjectURL(blob);
      window.open(url, '_blank', 'noopener');
      window.setTimeout(() => URL.revokeObjectURL(url), 60000);
    } catch (err) {
      setError(err?.response?.status === 404 ? 'That file is no longer stored.' : 'Could not open the file.');
    } finally {
      setBusyId('');
    }
  };

  const act = async (item, action, confirmText) => {
    if (confirmText && !window.confirm(confirmText)) return;
    setError('');
    setMessage('');
    setBusyId(item.id);
    try {
      await axiosInstance.patch(`/admin/secure-share/${item.id}`, { action });
      setMessage('Updated.');
      await load();
    } catch (err) {
      setError(err?.response?.data?.message || 'Could not update this file.');
    } finally {
      setBusyId('');
    }
  };

  const remove = async (item) => {
    if (!window.confirm(`Permanently delete "${item.fileName}"? This cannot be undone.`)) return;
    setError('');
    setMessage('');
    setBusyId(item.id);
    try {
      await axiosInstance.delete(`/admin/secure-share/${item.id}`);
      setMessage('Deleted.');
      await load();
    } catch (err) {
      setError(err?.response?.data?.message || 'Could not delete this file.');
    } finally {
      setBusyId('');
    }
  };

  return (
    <>
      <Head>
        <title>Secure Share - Admin</title>
        <meta name="robots" content="noindex, nofollow" />
      </Head>
      <AdminLayout
        title="Secure Share"
        subtitle="Files sent through the public one-time link tool. Review, revoke or delete anything that looks abusive."
      >
        {stats && (
          <div className="row g-3 mb-4">
            {[
              ['Files shared', stats.total, 'All time'],
              ['Opened', stats.viewed, `${stats.openRate}% open rate`],
              ['Waiting', stats.waiting, 'Live links not yet opened'],
              ['Last 24 hours', stats.last24h, 'New uploads'],
              ['Reported', stats.flagged, 'Needs review'],
              ['Stored', `${stats.storedMb} MB`, 'Encrypted files on file'],
            ].map(([label, value, hint]) => (
              <div className="col-6 col-lg-2" key={label}>
                <div className="bg-white rounded shadow-sm p-3 h-100">
                  <div className="fw-bold fs-4">{value}</div>
                  <div className="small">{label}</div>
                  <div className="text-muted small">{hint}</div>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="bg-white rounded shadow-sm p-4">
          <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-3">
            <h2 className="h5 mb-0">Shared files</h2>
            <div className="d-flex gap-2 align-items-center">
              <select
                className="form-select form-select-sm"
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                aria-label="Filter shared files"
              >
                <option value="all">All files</option>
                <option value="flagged">Reported only</option>
              </select>
              <button type="button" className="btn btn-sm btn-outline-dark" onClick={load}>
                Refresh
              </button>
            </div>
          </div>
          {error && <div className="alert alert-danger">{error}</div>}
          {message && !error && <div className="alert alert-success">{message}</div>}
          <p className="text-muted small">
            Uploaders are not identified. Each file shows an anonymous reference so repeat abuse can be
            spotted. Files are encrypted at rest, only you can preview them here, and they are deleted
            automatically 30 days after upload.
          </p>

          <div className="table-responsive">
            <table className="table align-middle">
              <thead>
                <tr>
                  <th>File</th>
                  <th>Status</th>
                  <th>Uploaded</th>
                  <th>Opened</th>
                  <th>Expires</th>
                  <th>Flags</th>
                  <th className="text-end">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading && (
                  <tr>
                    <td colSpan={7} className="text-center text-muted py-4">
                      Loading…
                    </td>
                  </tr>
                )}
                {!loading && items.length === 0 && (
                  <tr>
                    <td colSpan={7} className="text-center text-muted py-4">
                      No files yet.
                    </td>
                  </tr>
                )}
                {!loading &&
                  items.map((item) => (
                    <tr key={item.id}>
                      <td>
                        <div className="fw-semibold text-break">{item.fileName}</div>
                        <div className="small text-muted">
                          {formatSize(item.fileSize)}
                          {item.hasPasscode ? ' · passcode' : ''}
                          {item.uploaderRef ? ` · ref ${item.uploaderRef}` : ''}
                        </div>
                        {item.note && <div className="small text-muted text-break">“{item.note}”</div>}
                      </td>
                      <td>
                        <span className={`badge ${STATUS_STYLE[item.status] || 'bg-secondary'}`}>
                          {STATUS_LABEL[item.status] || item.status}
                        </span>
                      </td>
                      <td className="small">{formatDate(item.createdAt)}</td>
                      <td className="small">{formatDate(item.viewedAt)}</td>
                      <td className="small">{formatDate(item.expiresAt)}</td>
                      <td className="small">
                        {item.reportCount > 0 && (
                          <div className="text-danger fw-semibold">
                            Reported {item.reportCount}×
                            {item.reportReason ? `: ${item.reportReason}` : ''}
                          </div>
                        )}
                        {item.failedAttempts > 0 && <div>{item.failedAttempts} wrong passcode tries</div>}
                        {item.revokedReason && <div className="text-muted">{item.revokedReason}</div>}
                        {!item.reportCount && !item.failedAttempts && !item.revokedReason && '—'}
                      </td>
                      <td className="text-end">
                        <div className="d-flex flex-wrap gap-1 justify-content-end">
                          {!item.purged && (
                            <button
                              type="button"
                              className="btn btn-sm btn-dark"
                              disabled={busyId === item.id}
                              onClick={() => preview(item)}
                            >
                              Preview
                            </button>
                          )}
                          {!item.purged && item.status !== 'revoked' && item.status !== 'held' && (
                            <button
                              type="button"
                              className="btn btn-sm btn-outline-secondary"
                              disabled={busyId === item.id}
                              onClick={() =>
                                act(item, 'revoke', 'Revoke this link? The recipient will no longer be able to open it.')
                              }
                            >
                              Revoke
                            </button>
                          )}
                          {!item.purged && (item.status === 'revoked' || item.status === 'held') && (
                            <button
                              type="button"
                              className="btn btn-sm btn-outline-success"
                              disabled={busyId === item.id}
                              onClick={() => act(item, 'restore', 'Restore this link so it can be opened again?')}
                            >
                              Restore
                            </button>
                          )}
                          {item.reportCount > 0 && (
                            <button
                              type="button"
                              className="btn btn-sm btn-outline-secondary"
                              disabled={busyId === item.id}
                              onClick={() => act(item, 'dismiss-report')}
                            >
                              Dismiss report
                            </button>
                          )}
                          <button
                            type="button"
                            className="btn btn-sm btn-outline-danger"
                            disabled={busyId === item.id}
                            onClick={() => remove(item)}
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      </AdminLayout>
    </>
  );
}
