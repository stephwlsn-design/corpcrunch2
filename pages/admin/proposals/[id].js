import { useCallback, useEffect, useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import axiosInstance from '@/util/axiosInstance';
import AdminLayout from '@/components/admin/AdminLayout';
import { isAdminSessionValid, clearAdminSession } from '@/lib/adminSession';

export default function AdminProposalDetailPage() {
  const router = useRouter();
  const { id } = router.query;
  const [data, setData] = useState(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  const load = useCallback(async () => {
    if (!id) return;
    try {
      const response = await axiosInstance.get(`/admin/proposals/${id}`);
      if (response?.success) setData(response.data);
    } catch (error) {
      if (error?.response?.status === 401 && typeof window !== 'undefined') {
        clearAdminSession();
        window.location.href = '/admin/login';
      }
    }
  }, [id]);

  useEffect(() => {
    if (typeof window !== 'undefined' && !isAdminSessionValid()) {
      clearAdminSession();
      window.location.href = '/admin/login';
      return;
    }
    load();
  }, [load]);

  const patch = async (payload) => {
    setSaving(true);
    setMessage('');
    try {
      const response = await axiosInstance.patch(`/admin/proposals/${id}`, payload);
      if (response?.success) {
        setMessage('Saved');
        await load();
      }
    } catch (error) {
      setMessage(error?.response?.data?.message || 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  const remove = async () => {
    if (!window.confirm('Delete this proposal and its activity?')) return;
    await axiosInstance.delete(`/admin/proposals/${id}`);
    router.push('/admin/proposals');
  };

  if (!data) {
    return (
      <AdminLayout title="Proposal" subtitle="Loading">
        <p className="text-muted">Loading…</p>
      </AdminLayout>
    );
  }

  const link = data.shareUrl || (typeof window !== 'undefined' ? `${window.location.origin}/proposals/view/${data.token}` : `/proposals/view/${data.token}`);

  const sendLink = async () => {
    setSaving(true);
    setMessage('');
    try {
      const response = await axiosInstance.post(`/admin/proposals/${id}`, { action: 'send-link' });
      setMessage(response?.clientMailed ? `Link emailed to ${data.clientEmail}` : 'Link generated; email was not sent.');
    } catch (error) {
      setMessage(error?.response?.data?.message || 'Could not email the link');
    } finally {
      setSaving(false);
    }
  };

  const regenerate = async () => {
    if (!window.confirm('This invalidates the current unique URL. Continue?')) return;
    setSaving(true);
    try {
      const response = await axiosInstance.post(`/admin/proposals/${id}`, { action: 'regenerate-link' });
      if (response?.success) {
        setMessage('New unique link created. Previous URL will not open.');
        await load();
      }
    } catch (error) {
      setMessage(error?.response?.data?.message || 'Could not regenerate the link');
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <Head>
        <title>{data.title} - Proposals</title>
        <meta name="robots" content="noindex, nofollow" />
      </Head>
      <AdminLayout title={data.title} subtitle={`${data.clientName} · ${data.clientEmail}`}>
        {message && <p className="text-muted">{message}</p>}
        <div className="alert alert-light border mb-4">
          <div className="small text-muted mb-1">Unique client link — unlisted</div>
          <code className="small text-break">{link}</code>
        </div>
        <div className="d-flex flex-wrap gap-2 mb-4">
          <button className="btn btn-outline-secondary" type="button" onClick={() => navigator.clipboard.writeText(link)}>
            Copy client link
          </button>
          {!data.revoked && (
            <a className="btn btn-primary" href={link} target="_blank" rel="noreferrer nofollow">
              Open as recipient
            </a>
          )}
          <button className="btn btn-outline-secondary" type="button" disabled={saving} onClick={sendLink}>
            Email link to client
          </button>
          <button className="btn btn-outline-secondary" type="button" disabled={saving} onClick={regenerate}>
            Regenerate link
          </button>
          <button className="btn btn-outline-primary" type="button" disabled={saving} onClick={() => patch({ revoked: !data.revoked })}>
            {data.revoked ? 'Restore access' : 'Revoke link'}
          </button>
          <button className="btn btn-outline-success" type="button" disabled={saving} onClick={() => patch({ status: 'converted' })}>
            Mark converted
          </button>
          <button className="btn btn-outline-danger" type="button" onClick={remove}>
            Delete
          </button>
        </div>

        <div className="row g-4">
          <div className="col-lg-5">
            <div className="bg-white rounded shadow-sm p-4 mb-4">
              <h2 className="h6">Record</h2>
              <p className="mb-1"><strong>Designation:</strong> {data.clientDesignation || '—'}</p>
              <p className="mb-1"><strong>Company:</strong> {data.clientCompany || '—'}</p>
              <p className="mb-1"><strong>File:</strong> {data.fileName || '—'}</p>
              <p className="mb-1"><strong>Status:</strong> {data.revoked ? 'revoked' : data.viewedAt ? `viewed ${data.viewCount || 1}×` : 'unopened'}</p>
              <p className="mb-1"><strong>Access:</strong> Open until deadline</p>
              <p className="mb-1"><strong>Shared:</strong> {data.createdAt ? new Date(data.createdAt).toLocaleString() : '—'}</p>
              <p className="mb-1"><strong>Views:</strong> {data.viewCount || 0}</p>
              <p className="mb-1"><strong>First view:</strong> {data.firstViewedAt ? new Date(data.firstViewedAt).toLocaleString() : '—'}</p>
              <p className="mb-1"><strong>Last view:</strong> {data.lastViewedAt ? new Date(data.lastViewedAt).toLocaleString() : '—'}</p>
              <p className="mb-1"><strong>Time in document:</strong> {Math.round((data.totalDurationMs || 0) / 1000)}s</p>
              <p className="mb-1"><strong>Pages / sections:</strong> {(data.pagesViewed || []).join(', ') || '—'}</p>
              <p className="mb-1"><strong>Feedback:</strong> {(data.feedback || []).length ? 'submitted' : 'pending'}</p>
              <p className="mb-1"><strong>Expires:</strong> {data.expiresAt ? new Date(data.expiresAt).toLocaleString() : '—'}</p>
              <p className="mb-0 small text-break">{link}</p>
            </div>

            <div className="bg-white rounded shadow-sm p-4">
              <h2 className="h6">Client feedback</h2>
              {(data.feedback || []).length === 0 ? (
                <p className="text-muted mb-0">No feedback yet.</p>
              ) : (
                data.feedback.map((item) => (
                  <article key={item.id} className="border-bottom py-3">
                    <div className="fw-semibold">{item.decisionLabel || item.decision}</div>
                    <div className="small text-muted">{new Date(item.createdAt).toLocaleString()} · {item.email}</div>
                    {item.followUpAt && (
                      <p className="mb-1">Follow up: {new Date(item.followUpAt).toLocaleDateString()}</p>
                    )}
                    {item.rejectionReason && <p className="mb-1">Reason: {item.rejectionReason}</p>}
                    <p className="mb-1">Services: {(item.services || []).join(', ') || (item.noneExtra ? 'Not interested in additional services' : '—')}</p>
                    {(item.serviceNotes || []).filter((row) => row.note).map((row) => (
                      <p key={row.id} className="mb-1 small">{row.label}: {row.note}</p>
                    ))}
                    {item.comments && <p className="mb-0">{item.comments}</p>}
                  </article>
                ))
              )}
            </div>
          </div>

          <div className="col-lg-7">
            <div className="bg-white rounded shadow-sm p-4">
              <h2 className="h6">Activity</h2>
              {(data.events || []).length === 0 ? (
                <p className="text-muted mb-0">No activity yet.</p>
              ) : (
                <div className="table-responsive">
                  <table className="table table-sm">
                    <thead>
                      <tr>
                        <th>When</th>
                        <th>Type</th>
                        <th>Email</th>
                        <th>Section</th>
                        <th>Duration</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.events.map((event) => (
                        <tr key={event._id}>
                          <td>{new Date(event.createdAt).toLocaleString()}</td>
                          <td>{event.type}</td>
                          <td>{event.email || '—'}</td>
                          <td>{event.section || '—'}</td>
                          <td>{event.durationMs ? `${Math.round(event.durationMs / 1000)}s` : '—'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      </AdminLayout>
    </>
  );
}
