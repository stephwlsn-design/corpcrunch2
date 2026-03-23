import { useEffect, useState } from "react";
import Head from "next/head";
import axiosInstance from "@/util/axiosInstance";
import { notifyError } from "@/util/toast";
import ToastContainer from "@/components/ToastContainer/ToastContainer";
import AdminLayout from "@/components/admin/AdminLayout";
import { isAdminSessionValid, clearAdminSession } from "@/lib/adminSession";

const SITES = [
  { id: "corpcrunch", label: "Corp Crunch" },
  { id: "cnvrsn", label: "cnvrsn" },
  { id: "prowess", label: "prowess" },
  { id: "qrety", label: "qrayt" },
  { id: "otto", label: "otto" },
];

const DATE_RANGES = [
  { value: "today", label: "Today" },
  { value: "7daysAgo", label: "Weekly" },
  { value: "30daysAgo", label: "Monthly" },
  { value: "3650daysAgo", label: "Lifetime" },
];


function formatDuration(seconds) {
  const s = parseFloat(seconds || 0);
  if (s < 60) return `${Math.round(s)}s`;
  const m = Math.floor(s / 60);
  const sec = Math.round(s % 60);
  return `${m}m ${sec}s`;
}

export default function AnalyticsPage() {
  const [site, setSite] = useState("corpcrunch");
  const [range, setRange] = useState("7daysAgo");
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (typeof window !== "undefined" && !isAdminSessionValid()) {
      clearAdminSession();
      window.location.href = "/admin/login";
    }
  }, []);

  useEffect(() => {
    if (!isAdminSessionValid()) return;

    const fetchAnalytics = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await axiosInstance.get("/analytics", {
          params: { site, range },
        });
        if (res && !res.error) {
          setData(res);
        } else {
          setError(res?.message || res?.error || "Failed to load analytics");
          setData(null);
        }
      } catch (err) {
        const msg = err?.response?.data?.message || err?.response?.data?.error || err?.message || "Failed to fetch analytics";
        setError(msg);
        setData(null);
        if (err?.response?.status === 503) {
          notifyError("Analytics not configured. Add GA_SERVICE_ACCOUNT_KEY and GA4 property IDs to .env.local");
        } else {
          notifyError(msg);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, [site, range]);

  const cardStyle = {
    backgroundColor: "#fff",
    padding: "20px",
    borderRadius: "8px",
    boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
  };

  const maxSessions = data?.timeseries?.length
    ? Math.max(...data.timeseries.map((r) => parseInt(r.sessions, 10) || 0), 1)
    : 1;

  return (
    <>
      <Head>
        <title>Analytics - Admin - Corp Crunch</title>
        <meta name="robots" content="noindex, nofollow" />
      </Head>

      <AdminLayout
        title="Analytics"
        subtitle="Multi-site traffic and engagement metrics"
      >
        <div className="container-fluid px-0">
          <div
            style={{
              ...cardStyle,
              marginBottom: "20px",
              display: "flex",
              flexWrap: "wrap",
              gap: "16px",
              alignItems: "center",
            }}
          >
            <div>
              <label className="form-label" style={{ marginBottom: "4px", fontSize: "12px", color: "#666" }}>
                Site
              </label>
              <select
                className="form-select"
                value={site}
                onChange={(e) => setSite(e.target.value)}
                style={{ width: "180px" }}
              >
                {SITES.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="form-label" style={{ marginBottom: "4px", fontSize: "12px", color: "#666" }}>
                Date range
              </label>
              <select
                className="form-select"
                value={range}
                onChange={(e) => setRange(e.target.value)}
                style={{ width: "180px" }}
              >
                {DATE_RANGES.map((r) => (
                  <option key={r.value} value={r.value}>
                    {r.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {loading ? (
            <div className="text-center py-5">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
              <p className="mt-3 text-muted">Loading analytics...</p>
            </div>
          ) : error ? (
            <div style={cardStyle} className="text-center py-5">
              <p className="text-danger mb-2">{error}</p>
              <small className="text-muted d-block">
                Ensure GA_SERVICE_ACCOUNT_KEY and GA_PROPERTY_* are set in .env.local. Add the service account email as Viewer to each GA4 property.
              </small>
            </div>
          ) : data ? (
            <>
              {data.overview && (
                <div className="row mb-3 g-3">
                  <div className="col-md col-6">
                    <div style={{ ...cardStyle, textAlign: "center" }}>
                      <div style={{ fontSize: "28px", fontWeight: "700", color: "#2563eb" }}>
                        {parseInt(data.overview.sessions, 10).toLocaleString()}
                      </div>
                      <div style={{ fontSize: "12px", color: "#666" }}>Sessions</div>
                    </div>
                  </div>
                  <div className="col-md col-6">
                    <div style={{ ...cardStyle, textAlign: "center" }}>
                      <div style={{ fontSize: "28px", fontWeight: "700", color: "#059669" }}>
                        {parseInt(data.overview.screenPageViews, 10).toLocaleString()}
                      </div>
                      <div style={{ fontSize: "12px", color: "#666" }}>Page Views</div>
                    </div>
                  </div>
                  <div className="col-md col-6">
                    <div style={{ ...cardStyle, textAlign: "center" }}>
                      <div style={{ fontSize: "28px", fontWeight: "700", color: "#7c3aed" }}>
                        {parseInt(data.overview.totalUsers, 10).toLocaleString()}
                      </div>
                      <div style={{ fontSize: "12px", color: "#666" }}>Users</div>
                    </div>
                  </div>
                  <div className="col-md col-6">
                    <div style={{ ...cardStyle, textAlign: "center" }}>
                      <div style={{ fontSize: "28px", fontWeight: "700", color: "#dc2626" }}>
                        {parseFloat(data.overview.bounceRate || 0).toFixed(1)}%
                      </div>
                      <div style={{ fontSize: "12px", color: "#666" }}>Bounce Rate</div>
                    </div>
                  </div>
                  <div className="col-md col-6">
                    <div style={{ ...cardStyle, textAlign: "center" }}>
                      <div style={{ fontSize: "28px", fontWeight: "700", color: "#d97706" }}>
                        {formatDuration(data.overview.averageSessionDuration)}
                      </div>
                      <div style={{ fontSize: "12px", color: "#666" }}>Avg Session</div>
                    </div>
                  </div>
                </div>
              )}

              {data.timeseries && data.timeseries.length > 0 && (
                <div style={{ ...cardStyle, marginBottom: "20px" }}>
                  <h5 style={{ marginBottom: "16px", fontWeight: "600" }}>Traffic over time</h5>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", alignItems: "flex-end" }}>
                    {data.timeseries.slice(-14).map((row, i) => (
                      <div
                        key={row.date}
                        title={`${row.date}: ${row.sessions} sessions`}
                        style={{
                          width: "24px",
                          minWidth: "24px",
                          height: `${Math.max(20, (100 * (parseInt(row.sessions, 10) || 0)) / maxSessions)}px`,
                          backgroundColor: "#2563eb",
                          borderRadius: "4px 4px 0 0",
                          flexShrink: 0,
                        }}
                      />
                    ))}
                  </div>
                  <div style={{ marginTop: "8px", fontSize: "11px", color: "#666" }}>
                    {range === "today" ? "Today" : `Last ${Math.min(14, data.timeseries.length)} days`}
                  </div>
                </div>
              )}

              <div className="row g-3">
                {data.sources && data.sources.length > 0 && (
                  <div className="col-lg-6">
                    <div style={cardStyle}>
                      <h5 style={{ marginBottom: "12px", fontWeight: "600" }}>Traffic sources</h5>
                      <div className="table-responsive">
                        <table className="table table-sm">
                          <tbody>
                            {data.sources.map((row, i) => (
                              <tr key={i}>
                                <td style={{ maxWidth: "200px" }}>
                                  <span title={row.source} style={{ overflow: "hidden", textOverflow: "ellipsis", display: "block" }}>
                                    {row.source}
                                  </span>
                                </td>
                                <td className="text-end">{parseInt(row.sessions, 10).toLocaleString()}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                )}
                {data.pages && data.pages.length > 0 && (
                  <div className="col-lg-6">
                    <div style={cardStyle}>
                      <h5 style={{ marginBottom: "12px", fontWeight: "600" }}>Top pages</h5>
                      <div className="table-responsive">
                        <table className="table table-sm">
                          <tbody>
                            {data.pages.map((row, i) => (
                              <tr key={i}>
                                <td style={{ maxWidth: "220px" }}>
                                  <span title={row.path} style={{ overflow: "hidden", textOverflow: "ellipsis", display: "block" }}>
                                    {row.path}
                                  </span>
                                </td>
                                <td className="text-end">{parseInt(row.views, 10).toLocaleString()}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                )}
                {data.countries && data.countries.length > 0 && (
                  <div className="col-lg-6">
                    <div style={cardStyle}>
                      <h5 style={{ marginBottom: "12px", fontWeight: "600" }}>Countries</h5>
                      <div className="table-responsive">
                        <table className="table table-sm">
                          <tbody>
                            {data.countries.map((row, i) => (
                              <tr key={i}>
                                <td>{row.country}</td>
                                <td className="text-end">{parseInt(row.sessions, 10).toLocaleString()}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                )}
                {data.devices && data.devices.length > 0 && (
                  <div className="col-lg-6">
                    <div style={cardStyle}>
                      <h5 style={{ marginBottom: "12px", fontWeight: "600" }}>Devices</h5>
                      <div className="table-responsive">
                        <table className="table table-sm">
                          <tbody>
                            {data.devices.map((row, i) => (
                              <tr key={i}>
                                <td>{row.device}</td>
                                <td className="text-end">{parseInt(row.sessions, 10).toLocaleString()}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {(!data.overview || (data.timeseries?.length === 0 && !data.sources?.length)) && (
                <div style={cardStyle} className="text-center py-4 text-muted">
                  No data for this period. Ensure the GA4 property has data and the service account has Viewer access.
                </div>
              )}
            </>
          ) : null}
        </div>
      </AdminLayout>

      <ToastContainer />
    </>
  );
}
