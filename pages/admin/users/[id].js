import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Head from "next/head";
import axiosInstance from "@/util/axiosInstance";
import { notifyError, notifySuccess } from "@/util/toast";
import ToastContainer from "@/components/ToastContainer/ToastContainer";
import AdminLayout from "@/components/admin/AdminLayout";
import { isAdminSessionValid, clearAdminSession } from "@/lib/adminSession";

const INITIAL_STATE = {
  firstName: "",
  lastName: "",
  email: "",
  phoneNumber: "",
  companyName: "",
  location: "",
  address: "",
  city: "",
  state: "",
  bio: "",
  role: "user",
  isActive: true,
  password: "",
};

export default function AdminUserDetail() {
  const router = useRouter();
  const { id } = router.query;
  const [user, setUser] = useState(null);
  const [form, setForm] = useState(INITIAL_STATE);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined" && !isAdminSessionValid()) {
      clearAdminSession();
      notifyError("Admin session expired. Please login again.");
      window.location.href = "/admin/login";
      return;
    }
  }, []);

  useEffect(() => {
    if (!id) return;
    const fetchUser = async () => {
      try {
        setLoading(true);
        const response = await axiosInstance.get(`/admin/users/${id}`);
        if (response?.success && response?.data) {
          const d = response.data;
          setUser(d);
          setForm({
            firstName: d.firstName || "",
            lastName: d.lastName || "",
            email: d.email || "",
            phoneNumber: d.phoneNumber || "",
            companyName: d.companyName || "",
            location: d.location || "",
            address: d.address || "",
            city: d.city || "",
            state: d.state || "",
            bio: d.bio || "",
            role: d.role || "user",
            isActive: d.isActive !== false,
            password: "",
          });
        } else {
          notifyError("User not found");
          router.push("/admin/users");
        }
      } catch (error) {
        notifyError(error?.response?.data?.message || "Failed to load user");
        if (error?.response?.status === 401) {
          clearAdminSession();
          window.location.href = "/admin/login";
        } else if (error?.response?.status === 404) {
          router.push("/admin/users");
        }
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, [id, router]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "isActive") {
      setForm((prev) => ({ ...prev, isActive: value === "true" }));
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!id) return;
    try {
      setSaving(true);
      const payload = { ...form };
      if (!payload.password?.trim()) delete payload.password;
      delete payload.createdAt;
      delete payload.updatedAt;
      delete payload.lastLoginAt;
      delete payload.loginCount;
      delete payload.profilePicture;
      delete payload.__v;

      const response = await axiosInstance.patch(`/admin/users/${id}`, payload);
      if (response?.success) {
        notifySuccess("User updated successfully");
        setUser(response.data);
        setForm((prev) => ({ ...prev, password: "" }));
      } else {
        notifyError(response?.message || "Failed to update user");
      }
    } catch (error) {
      notifyError(error?.response?.data?.message || "Failed to update user");
      if (error?.response?.status === 401) {
        clearAdminSession();
        window.location.href = "/admin/login";
      }
    } finally {
      setSaving(false);
    }
  };

  const handleDeactivate = async () => {
    if (!confirm("Deactivate this user? They will no longer be able to log in.")) return;
    try {
      setDeleting(true);
      const response = await axiosInstance.delete(`/admin/users/${id}`);
      if (response?.success) {
        notifySuccess("User deactivated successfully");
        setForm((prev) => ({ ...prev, isActive: false }));
        setUser((prev) => (prev ? { ...prev, isActive: false } : null));
      } else {
        notifyError(response?.message || "Failed to deactivate user");
      }
    } catch (error) {
      notifyError(error?.response?.data?.message || "Failed to deactivate user");
    } finally {
      setDeleting(false);
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

  if (loading) {
    return (
      <>
        <Head>
          <title>User Detail - Admin | Corp Crunch</title>
          <meta name="robots" content="noindex, nofollow" />
        </Head>
        <div
          style={{
            minHeight: "100vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "#f5f5f5",
          }}
        >
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      </>
    );
  }

  if (!user) return null;

  return (
    <>
      <Head>
        <title>Edit User - Admin | Corp Crunch</title>
        <meta name="robots" content="noindex, nofollow" />
      </Head>

      <AdminLayout
        title="Edit User"
        subtitle={[user.firstName, user.lastName].filter(Boolean).join(" ") || user.email}
        actions={
          <>
            <button
              className="btn btn-outline-secondary"
              onClick={() => router.push("/admin/users")}
              style={{ fontSize: "14px", padding: "8px 16px" }}
            >
              Back to Users
            </button>
          </>
        }
      >
        <div className="container-fluid px-0">
          <div className="row">
            <div className="col-xl-10">
              {/* Info cards */}
              <div className="row mb-3">
                <div className="col-md-4">
                  <div
                    style={{
                      backgroundColor: "#fff",
                      padding: "15px",
                      borderRadius: "8px",
                      boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                    }}
                  >
                    <div style={{ fontSize: "12px", color: "#666" }}>Registered</div>
                    <div style={{ fontWeight: "600" }}>{formatDate(user.createdAt)}</div>
                  </div>
                </div>
                <div className="col-md-4">
                  <div
                    style={{
                      backgroundColor: "#fff",
                      padding: "15px",
                      borderRadius: "8px",
                      boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                    }}
                  >
                    <div style={{ fontSize: "12px", color: "#666" }}>Last Login</div>
                    <div style={{ fontWeight: "600" }}>{formatDate(user.lastLoginAt)}</div>
                  </div>
                </div>
                <div className="col-md-4">
                  <div
                    style={{
                      backgroundColor: "#fff",
                      padding: "15px",
                      borderRadius: "8px",
                      boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                    }}
                  >
                    <div style={{ fontSize: "12px", color: "#666" }}>Login Count</div>
                    <div style={{ fontWeight: "600" }}>{user.loginCount ?? 0}</div>
                  </div>
                </div>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit}>
                <div
                  style={{
                    backgroundColor: "#fff",
                    padding: "30px",
                    borderRadius: "8px",
                    boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                  }}
                >
                  <h4 className="mb-4" style={{ fontSize: "18px", fontWeight: "600" }}>
                    User Details
                  </h4>
                  <div className="row g-3">
                    <div className="col-md-6">
                      <label className="form-label">First Name</label>
                      <input
                        type="text"
                        className="form-control"
                        name="firstName"
                        value={form.firstName}
                        onChange={handleChange}
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Last Name</label>
                      <input
                        type="text"
                        className="form-control"
                        name="lastName"
                        value={form.lastName}
                        onChange={handleChange}
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Email *</label>
                      <input
                        type="email"
                        className="form-control"
                        name="email"
                        value={form.email}
                        onChange={handleChange}
                        required
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Phone</label>
                      <input
                        type="text"
                        className="form-control"
                        name="phoneNumber"
                        value={form.phoneNumber}
                        onChange={handleChange}
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Company</label>
                      <input
                        type="text"
                        className="form-control"
                        name="companyName"
                        value={form.companyName}
                        onChange={handleChange}
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Location</label>
                      <input
                        type="text"
                        className="form-control"
                        name="location"
                        value={form.location}
                        onChange={handleChange}
                      />
                    </div>
                    <div className="col-12">
                      <label className="form-label">Address</label>
                      <input
                        type="text"
                        className="form-control"
                        name="address"
                        value={form.address}
                        onChange={handleChange}
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">City</label>
                      <input
                        type="text"
                        className="form-control"
                        name="city"
                        value={form.city}
                        onChange={handleChange}
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">State</label>
                      <input
                        type="text"
                        className="form-control"
                        name="state"
                        value={form.state}
                        onChange={handleChange}
                      />
                    </div>
                    <div className="col-12">
                      <label className="form-label">Bio (max 150 chars)</label>
                      <textarea
                        className="form-control"
                        name="bio"
                        rows={2}
                        maxLength={150}
                        value={form.bio}
                        onChange={handleChange}
                      />
                      <small className="text-muted">{form.bio?.length || 0}/150</small>
                    </div>
                    <div className="col-md-4">
                      <label className="form-label">Role</label>
                      <select
                        className="form-select"
                        name="role"
                        value={form.role}
                        onChange={handleChange}
                      >
                        <option value="user">User</option>
                        <option value="admin">Admin</option>
                        <option value="editor">Editor</option>
                      </select>
                    </div>
                    <div className="col-md-4">
                      <label className="form-label">Status</label>
                      <select
                        className="form-select"
                        name="isActive"
                        value={form.isActive ? "true" : "false"}
                        onChange={handleChange}
                      >
                        <option value="true">Active</option>
                        <option value="false">Inactive</option>
                      </select>
                    </div>
                    <div className="col-md-4">
                      <label className="form-label">New Password (optional)</label>
                      <input
                        type="password"
                        className="form-control"
                        name="password"
                        value={form.password}
                        onChange={handleChange}
                        placeholder="Leave blank to keep current"
                        minLength={8}
                      />
                      <small className="text-muted">Min 8 characters</small>
                    </div>
                  </div>

                  <div className="d-flex gap-2 mt-4 flex-wrap">
                    <button
                      type="submit"
                      className="btn btn-primary"
                      disabled={saving}
                    >
                      {saving ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-1" role="status" />
                          Saving...
                        </>
                      ) : (
                        "Save Changes"
                      )}
                    </button>
                    {user.isActive && (
                      <button
                        type="button"
                        className="btn btn-danger"
                        onClick={handleDeactivate}
                        disabled={deleting}
                      >
                        {deleting ? (
                          <>
                            <span className="spinner-border spinner-border-sm me-1" role="status" />
                            Deactivating...
                          </>
                        ) : (
                          "Deactivate User"
                        )}
                      </button>
                    )}
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      </AdminLayout>

      <ToastContainer />
    </>
  );
}
