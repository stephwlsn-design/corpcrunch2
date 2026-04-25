import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/router";
import Head from "next/head";
import axiosInstance from "@/util/axiosInstance";
import { notifyError, notifySuccess } from "@/util/toast";
import ToastContainer from "@/components/ToastContainer/ToastContainer";
import AdminLayout from "@/components/admin/AdminLayout";
import { isAdminSessionValid, clearAdminSession } from "@/lib/adminSession";

export default function AdminUsersList() {
  const router = useRouter();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterRole, setFilterRole] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalUsers, setTotalUsers] = useState(0);
  const [deletingId, setDeletingId] = useState(null);

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: "20",
        sortBy: "createdAt",
        sortOrder: "desc",
      });
      if (searchQuery.trim()) params.append("search", searchQuery.trim());

      const response = await axiosInstance.get(`/admin/users?${params.toString()}`);

      if (response?.success) {
        setUsers(response.data || []);
        setTotalPages(response.pagination?.totalPages || 1);
        setTotalUsers(response.pagination?.total || 0);
      } else {
        notifyError(response?.message || "Failed to fetch users");
        setUsers([]);
        setTotalUsers(0);
      }
    } catch (error) {
      const msg = error?.response?.data?.message || error?.message || "Failed to fetch users";
      notifyError(msg);
      if (error?.response?.status === 401) {
        clearAdminSession();
        window.location.href = "/admin/login";
      }
      setUsers([]);
      setTotalUsers(0);
    } finally {
      setLoading(false);
    }
  }, [currentPage, searchQuery, filterRole, filterStatus]);

  useEffect(() => {
    if (typeof window !== "undefined" && !isAdminSessionValid()) {
      clearAdminSession();
      notifyError("Admin session expired. Please login again.");
      window.location.href = "/admin/login";
      return;
    }
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined" && isAdminSessionValid()) {
      fetchUsers();
    }
  }, [fetchUsers]);

  const handleDelete = async (userId, userName) => {
    if (!confirm(`Delete user "${userName}"? This action cannot be undone.`)) return;
    try {
      setDeletingId(userId);
      const response = await axiosInstance.delete(`/admin/users/${userId}`);
      if (response?.success) {
        notifySuccess("User deleted successfully");
        fetchUsers();
      } else {
        notifyError(response?.message || "Failed to delete user");
      }
    } catch (error) {
      notifyError(error?.response?.data?.message || "Failed to delete user");
      if (error?.response?.status === 401) {
        clearAdminSession();
        window.location.href = "/admin/login";
      }
    } finally {
      setDeletingId(null);
    }
  };

  const formatDate = (date) => {
    if (!date) return "—";
    return new Date(date).toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getRoleBadgeClass = (role) => {
    const map = { user: "bg-secondary", admin: "bg-danger", editor: "bg-info" };
    return map[role] || "bg-secondary";
  };

  return (
    <>
      <Head>
        <title>User Management - Admin | Corp Crunch</title>
        <meta name="robots" content="noindex, nofollow" />
      </Head>

      <AdminLayout
        title="User Management"
        subtitle="View, edit, and manage registered users"
      >
        <div className="container-fluid px-0">
          <div className="row">
            <div className="col-xl-12">
              {/* Filters & Stats */}
              <div
                style={{
                  backgroundColor: "#fff",
                  padding: "20px",
                  borderRadius: "8px",
                  marginBottom: "20px",
                  boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                }}
              >
                <div className="row g-3 align-items-end">
                  <div className="col-md-8">
                    <label className="form-label" style={{ fontWeight: "500", marginBottom: "8px" }}>
                      Search
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Name, email, company, location..."
                      value={searchQuery}
                      onChange={(e) => {
                        setSearchQuery(e.target.value);
                        setCurrentPage(1);
                      }}
                    />
                  </div>
                  <div className="col-md-4 text-md-end text-start mt-4 mt-md-0">
                    <div
                      style={{
                        padding: "10px 20px",
                        backgroundColor: "#f8f9fa",
                        borderRadius: "8px",
                        border: "1px solid #eee",
                        display: "inline-block",
                        textAlign: "center"
                      }}
                    >
                      <div style={{ fontSize: "20px", fontWeight: "600", color: "#333", lineHeight: "1.2" }}>
                        {totalUsers}
                      </div>
                      <div style={{ fontSize: "12px", color: "#666" }}>Total Users</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Users Table */}
              <div
                style={{
                  backgroundColor: "#fff",
                  padding: "20px",
                  borderRadius: "8px",
                  boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                }}
              >
                {loading ? (
                  <div className="text-center py-5">
                    <div className="spinner-border text-primary" role="status">
                      <span className="visually-hidden">Loading...</span>
                    </div>
                    <p className="mt-3 text-muted">Loading users...</p>
                  </div>
                ) : users.length === 0 ? (
                  <div className="text-center py-5">
                    <p className="text-muted">No users found matching your filters.</p>
                  </div>
                ) : (
                  <>
                    <div className="table-responsive" style={{ overflowX: "auto" }}>
                      <table className="table table-hover" style={{ minWidth: "900px" }}>
                        <thead>
                          <tr>
                            <th>Name</th>
                            <th style={{ width: "140px", minWidth: "140px" }}>Actions</th>
                            <th>Email</th>
                            <th>Phone</th>
                            <th>Company</th>
                            <th>Location</th>
                            <th>Registered</th>
                            <th>Last Login</th>
                            <th>Logins</th>
                          </tr>
                        </thead>
                        <tbody>
                          {users.map((user) => (
                            <tr key={user.id}>
                              <td>
                                <div style={{ fontWeight: "500" }}>
                                  {[user.firstName, user.lastName].filter(Boolean).join(" ") || "—"}
                                </div>
                              </td>
                              <td style={{ whiteSpace: "nowrap" }}>
                                <div className="d-flex gap-1">
                                  <button
                                    className="btn btn-sm btn-primary"
                                    onClick={() => router.push(`/admin/users/${user.id}`)}
                                    title="View / Edit"
                                  >
                                    Edit
                                  </button>
                                  <button
                                    className="btn btn-sm btn-danger"
                                    onClick={() =>
                                      handleDelete(
                                        user.id,
                                        [user.firstName, user.lastName].filter(Boolean).join(" ") ||
                                          user.email
                                      )
                                    }
                                    disabled={deletingId === user.id}
                                    title="Delete"
                                  >
                                    {deletingId === user.id ? (
                                      <span className="spinner-border spinner-border-sm" role="status">
                                        <span className="visually-hidden">Deleting...</span>
                                      </span>
                                    ) : (
                                      "Delete"
                                    )}
                                  </button>
                                </div>
                              </td>
                              <td>
                                <small>{user.email}</small>
                              </td>
                              <td>{user.phoneNumber || "—"}</td>
                              <td>{user.companyName || "—"}</td>
                              <td>{user.location || "—"}</td>
                              <td>
                                <small className="text-muted">
                                  {formatDate(user.createdAt)}
                                </small>
                              </td>
                              <td>
                                <small className="text-muted">
                                  {formatDate(user.lastLoginAt)}
                                </small>
                              </td>
                              <td>{user.loginCount ?? 0}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    {totalPages > 1 && (
                      <div className="d-flex justify-content-between align-items-center mt-3">
                        <small className="text-muted">
                          Page {currentPage} of {totalPages}
                        </small>
                        <div className="btn-group">
                          <button
                            className="btn btn-outline-primary btn-sm"
                            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                            disabled={currentPage === 1}
                          >
                            Previous
                          </button>
                          <button
                            className="btn btn-outline-primary btn-sm"
                            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                            disabled={currentPage === totalPages}
                          >
                            Next
                          </button>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </AdminLayout>

      <ToastContainer />
    </>
  );
}
