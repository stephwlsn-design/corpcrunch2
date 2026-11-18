import { useCallback, useEffect, useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import axiosInstance from '@/util/axiosInstance';
import AdminLayout from '@/components/admin/AdminLayout';
import { isAdminSessionValid, clearAdminSession } from '@/lib/adminSession';

const emptyForm = {
  title: '',
  clientName: '',
  clientEmail: '',
  clientDesignation: '',
  clientCompany: '',
  expiresAt: '',
  emailClient: true,
};

function readFileAsBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ''));
    reader.onerror = () => reject(new Error('Could not read the file'));
    reader.readAsDataURL(file);
  });
}

export default function AdminProposalsPage() {
  const router = useRouter();
  const [items, setItems] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [file, setFile] = useState(null);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [createdLink, setCreatedLink] = useState('');

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get('/admin/proposals');
      if (response?.success) {
        setItems(response.data || []);
        setStats(response.stats || null);
      }
    } catch (error) {
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
    load();
  }, [load]);

  const onChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const sendDocument = async (e) => {
    e.preventDefault();
    if (!file) {
      setError('Choose a PDF or image to send.');
      return;
    }
    setSaving(true);
    setMessage('');
    setError('');
    setCreatedLink('');
    try {
      const contentBase64 = await readFileAsBase64(file);
      const response = await axiosInstance.post('/admin/proposals', {
        ...form,
        title: form.title || file.name,
        expiresAt: form.expiresAt || undefined,
        emailClient: form.emailClient,
        contentBase64,
        fileName: file.name,
        fileMime:
          file.type ||
          (/\.pdf$/i.test(file.name) ? 'application/pdf' : /\.png$/i.test(file.name) ? 'image/png' : 'image/jpeg'),
      });
      const shareUrl = response?.data?.shareUrl || response?.shareUrl;
      if (response?.success && shareUrl) {
        setForm(emptyForm);
        setFile(null);
        setCreatedLink(shareUrl);
        setMessage('Unique link created. Copy it below to share with the client.');
        await load();
        return;
      }
      setError(response?.message || 'Could not create the unique link.');
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          err?.message ||
          'Could not create the unique link.'
      );
    } finally {
      setSaving(false);
    }
  };

  const copyLink = async (url) => {
    await navigator.clipboard.writeText(url);
    setMessage(`Copied ${url}`);
  };

  const clientUrl = (item) =>
    item.shareUrl || `${typeof window !== 'undefined' ? window.location.origin : ''}/proposals/view/${item.token}`;

  return (
    <>
      <Head>
        <title>Proposals - Admin</title>
        <meta name="robots" content="noindex, nofollow" />
      </Head>
      <AdminLayout
        title="Proposals"
        subtitle="Create a unique viewable link. If you set a deadline, the client can reopen the document until that date."
      >
        {stats && (
          <div className="row g-3 mb-4">
            {[
              ['Proposals shared', stats.shared, 'Total proposals distributed'],
              ['Proposals viewed', stats.viewed, 'Number of proposals accessed'],
              ['Engagement rate', `${stats.engagementRate || 0}%`, 'Percentage of shared proposals viewed'],
              ['Positive intent', stats.positive || 0, 'Clients interested in proceeding'],
              ['Pending decisions', stats.pendingDecisions || 0, 'Clients yet to respond'],
              ['Rejections', stats.rejections || 0, 'Proposals declined'],
              ['Cross-sell opportunities', stats.crossSell || 0, 'Additional services requested'],
              ['Conversion rate', `${stats.conversionRate || 0}%`, 'Proposals converted into business'],
            ].map(([label, value, hint]) => (
              <div className="col-6 col-lg-3" key={label}>
                <div className="bg-white rounded shadow-sm p-3 h-100">
                  <div className="fw-bold fs-4">{value}</div>
                  <div className="small">{label}</div>
                  <div className="text-muted small">{hint}</div>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="bg-white rounded shadow-sm p-4 mb-4">
          <h2 className="h5 mb-3">Create a unique client link</h2>
          {error && <div className="alert alert-danger">{error}</div>}
          {message && !error && <div className="alert alert-success">{message}</div>}
          {createdLink && (
            <div className="alert alert-success border mb-3">
              <div className="fw-semibold mb-1">Share this unique link</div>
              <div className="d-flex flex-wrap gap-2 align-items-center">
                <code className="small text-break">{createdLink}</code>
                <button className="btn btn-sm btn-dark" type="button" onClick={() => copyLink(createdLink)}>
                  Copy link
                </button>
                <a className="btn btn-sm btn-outline-dark" href={createdLink} target="_blank" rel="noreferrer">
                  Open
                </a>
              </div>
            </div>
          )}
          <form onSubmit={sendDocument}>
            <div className="row g-3">
              <div className="col-12">
                <label className="form-label">File (PDF or image, max 4 MB)</label>
                <input
                  className="form-control"
                  type="file"
                  accept="application/pdf,image/png,image/jpeg,image/webp,image/gif"
                  onChange={(e) => setFile(e.target.files?.[0] || null)}
                  required
                />
              </div>
              <div className="col-md-6">
                <label className="form-label">Title</label>
                <input className="form-control" name="title" value={form.title} onChange={onChange} placeholder="Optional — defaults to the file name" />
              </div>
              <div className="col-md-6">
                <label className="form-label">Recipient company</label>
                <input className="form-control" name="clientCompany" value={form.clientCompany} onChange={onChange} />
              </div>
              <div className="col-md-6">
                <label className="form-label">Recipient name</label>
                <input className="form-control" name="clientName" value={form.clientName} onChange={onChange} required />
              </div>
              <div className="col-md-6">
                <label className="form-label">Recipient designation</label>
                <input className="form-control" name="clientDesignation" value={form.clientDesignation} onChange={onChange} placeholder="e.g. Chief Financial Officer" />
              </div>
              <div className="col-md-6">
                <label className="form-label">Recipient email</label>
                <input className="form-control" type="email" name="clientEmail" value={form.clientEmail} onChange={onChange} required />
              </div>
              <div className="col-md-6">
                <label className="form-label">Document deadline</label>
                <input className="form-control" type="datetime-local" name="expiresAt" value={form.expiresAt} onChange={onChange} />
              </div>
              <div className="col-12">
                <label className="form-check">
                  <input className="form-check-input" type="checkbox" name="emailClient" checked={form.emailClient} onChange={onChange} />
                  <span className="form-check-label">Email the unique link to the recipient</span>
                </label>
              </div>
            </div>
            <button className="btn btn-primary mt-3" type="submit" disabled={saving}>
              {saving ? 'Creating link…' : 'Create unique link'}
            </button>
          </form>
        </div>

        <div className="bg-white rounded shadow-sm p-4">
          <h2 className="h5 mb-3">Sent proposals</h2>
          {loading ? (
            <p className="text-muted">Loading…</p>
          ) : items.length === 0 ? (
            <p className="text-muted">No proposals sent yet.</p>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover">
                <thead>
                  <tr>
                    <th>Document</th>
                    <th>Recipient</th>
                    <th>Views</th>
                    <th>Decision</th>
                    <th>Status</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item) => (
                    <tr key={item.id}>
                      <td>
                        <div className="fw-semibold">{item.title}</div>
                        <small className="text-muted">{item.fileName || 'No file'}</small>
                      </td>
                      <td>
                        {item.clientName}
                        <br />
                        <small>{item.clientEmail}</small>
                      </td>
                      <td>
                        {item.viewCount || 0}
                        <br />
                        <small className="text-muted">
                          {item.firstViewedAt ? `first ${new Date(item.firstViewedAt).toLocaleString()}` : 'unopened'}
                        </small>
                      </td>
                      <td>
                        {item.latestDecision || '—'}
                        {(item.latestServices || []).length > 0 && (
                          <>
                            <br />
                            <small>cross-sell</small>
                          </>
                        )}
                      </td>
                      <td>
                        {item.revoked
                          ? 'revoked'
                          : item.status === 'converted'
                            ? 'converted'
                            : item.expiresAt && new Date(item.expiresAt) < new Date()
                              ? 'deadline passed'
                              : item.feedbackAt
                                ? 'responded'
                                : item.viewedAt
                                  ? `viewed ${item.viewCount || 1}×`
                                  : 'unopened'}
                      </td>
                      <td className="text-nowrap">
                        {!item.revoked && (
                          <button className="btn btn-sm btn-outline-secondary me-1" type="button" onClick={() => copyLink(clientUrl(item))}>
                            Copy link
                          </button>
                        )}
                        <button className="btn btn-sm btn-primary" type="button" onClick={() => router.push(`/admin/proposals/${item.id}`)}>
                          Open
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </AdminLayout>
    </>
  );
}
