import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/router";
import Head from "next/head";
import axiosInstance from "@/util/axiosInstance";
import { notifyError, notifySuccess } from "@/util/toast";
import ToastContainer from "@/components/ToastContainer/ToastContainer";

export default function AdminDashboard() {
  const router = useRouter();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterContentType, setFilterContentType] = useState("all"); // all, article, video, magazine
  const [filterStatus, setFilterStatus] = useState("all"); // all, draft, review, scheduled, published
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalPosts, setTotalPosts] = useState(0);
  const [deletingId, setDeletingId] = useState(null);

  // Memoize fetchPosts to prevent unnecessary re-renders
  const fetchPosts = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: "50",
        sortBy: "createdAt",
        sortOrder: "desc"
      });

      if (filterContentType !== "all") {
        params.append("contentType", filterContentType);
      }

      if (filterStatus !== "all") {
        params.append("publishStatus", filterStatus);
      }

      if (searchQuery.trim()) {
        params.append("search", searchQuery.trim());
      }

      const response = await axiosInstance.get(`/admin/posts?${params.toString()}`);

      // axiosInstance interceptor returns response.data directly
      console.log("API Response:", response);
      
      if (response && response.success) {
        setPosts(response.data || []);
        setTotalPages(response.pagination?.totalPages || 1);
        setTotalPosts(response.pagination?.total || 0);
      } else {
        const errorMsg = response?.message || "Failed to fetch posts";
        console.error("API Error Response:", response);
        notifyError(errorMsg);
        setPosts([]);
        setTotalPosts(0);
      }
    } catch (error) {
      console.error("Error fetching posts:", error);
      console.error("Error details:", {
        message: error?.message,
        response: error?.response?.data,
        status: error?.response?.status,
        url: error?.config?.url
      });
      
      let errorMessage = "Failed to fetch posts. Please check your connection and try again.";
      
      if (error?.response?.status === 401) {
        errorMessage = "Authentication failed. Please login again.";
        if (typeof window !== "undefined") {
          localStorage.removeItem("adminToken");
          localStorage.removeItem("token");
          setTimeout(() => {
            window.location.href = "/admin/login";
          }, 2000);
        }
      } else if (error?.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error?.message) {
        errorMessage = error.message;
      }
      
      notifyError(errorMessage);
      setPosts([]);
      setTotalPosts(0);
    } finally {
      setLoading(false);
    }
  }, [filterContentType, filterStatus, searchQuery, currentPage]);

  // Check authentication only once on mount
  useEffect(() => {
    const token =
      typeof window !== "undefined" && (localStorage.getItem("adminToken") || localStorage.getItem("token"));
    if (!token) {
      notifyError("You must be signed in with an admin account to access the admin panel.");
      if (typeof window !== "undefined") {
        window.location.href = "/admin/login";
      }
      return;
    }
  }, []); // Only run once on mount

  // Fetch posts when filters change
  useEffect(() => {
    const token =
      typeof window !== "undefined" && (localStorage.getItem("adminToken") || localStorage.getItem("token"));
    if (token) {
      fetchPosts();
    }
  }, [fetchPosts]);

  const handleDelete = async (postId, slug) => {
    if (!confirm(`Are you sure you want to delete this post? This action cannot be undone.`)) {
      return;
    }

    try {
      setDeletingId(postId);
      const response = await axiosInstance.delete(`/posts/${slug}`);

      // axiosInstance interceptor returns response.data directly
      if (response && response.success) {
        notifySuccess("Post deleted successfully");
        fetchPosts(); // Refresh the list
      } else {
        notifyError(response?.message || "Failed to delete post");
      }
    } catch (error) {
      console.error("Error deleting post:", error);
      const errorMessage = error?.response?.data?.message || error?.message || "Failed to delete post";
      notifyError(errorMessage);
    } finally {
      setDeletingId(null);
    }
  };

  const handleEdit = (slug) => {
    console.log("Edit button clicked, slug:", slug);
    if (!slug) {
      notifyError("Invalid post slug");
      return;
    }
    // Navigate to edit page
    const editUrl = `/admin/edit/${slug}`;
    console.log("Navigating to:", editUrl);
    window.location.href = editUrl;
  };

  const getStatusBadgeClass = (status) => {
    const classes = {
      published: "bg-success",
      draft: "bg-secondary",
      review: "bg-warning",
      scheduled: "bg-info"
    };
    return classes[status] || "bg-secondary";
  };

  const getContentTypeLabel = (type) => {
    const labels = {
      article: "Article",
      video: "Video",
      magazine: "Magazine/News"
    };
    return labels[type] || type;
  };

  // Group posts by content type
  const groupedPosts = {
    article: posts.filter(p => p.contentType === "article"),
    video: posts.filter(p => p.contentType === "video"),
    magazine: posts.filter(p => p.contentType === "magazine"),
    all: posts
  };

  const displayPosts = filterContentType === "all" ? groupedPosts.all : groupedPosts[filterContentType] || [];

  return (
    <>
      <Head>
        <title>Admin Dashboard - Corp Crunch</title>
        <meta name="robots" content="noindex, nofollow" />
      </Head>

      <div style={{
        minHeight: "100vh",
        backgroundColor: "#f5f5f5",
        paddingTop: "20px",
        paddingBottom: "40px"
      }}>
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-xl-12">
              {/* Admin Header Bar */}
              <div style={{
                backgroundColor: "#fff",
                padding: "15px 20px",
                borderRadius: "8px",
                marginBottom: "20px",
                boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                flexWrap: "wrap",
                gap: "15px"
              }}>
                <div>
                  <h2 className="mb-0" style={{ fontSize: "24px", fontWeight: "600", color: "#333" }}>
                    Admin Dashboard - Manage Posts
                  </h2>
                  <small style={{ color: "#666", fontSize: "12px" }}>
                    View, edit, and delete all posts, articles, videos, and stories
                  </small>
                </div>
                <div className="d-flex gap-2 align-items-center flex-wrap">
                  <button
                    className="btn btn-primary"
                    onClick={() => router.push("/admin")}
                    style={{ fontSize: "14px", padding: "8px 16px" }}
                  >
                    Create New Post
                  </button>
                  <button
                    className="btn btn-outline-secondary"
                    onClick={() => {
                      localStorage.removeItem("adminToken");
                      localStorage.removeItem("token");
                      router.push("/admin/login");
                    }}
                    style={{ fontSize: "14px", padding: "8px 16px" }}
                  >
                    Logout
                  </button>
                </div>
              </div>

              {/* Filters */}
              <div style={{
                backgroundColor: "#fff",
                padding: "20px",
                borderRadius: "8px",
                marginBottom: "20px",
                boxShadow: "0 2px 4px rgba(0,0,0,0.1)"
              }}>
                <div className="row g-3">
                  <div className="col-md-4">
                    <label className="form-label" style={{ fontWeight: "500", marginBottom: "8px" }}>
                      Content Type
                    </label>
                    <select
                      className="form-select"
                      value={filterContentType}
                      onChange={(e) => {
                        setFilterContentType(e.target.value);
                        setCurrentPage(1);
                      }}
                    >
                      <option value="all">All Types</option>
                      <option value="article">Articles</option>
                      <option value="video">Videos</option>
                      <option value="magazine">Magazine/News</option>
                    </select>
                  </div>
                  <div className="col-md-4">
                    <label className="form-label" style={{ fontWeight: "500", marginBottom: "8px" }}>
                      Publish Status
                    </label>
                    <select
                      className="form-select"
                      value={filterStatus}
                      onChange={(e) => {
                        setFilterStatus(e.target.value);
                        setCurrentPage(1);
                      }}
                    >
                      <option value="all">All Statuses</option>
                      <option value="published">Published</option>
                      <option value="draft">Draft</option>
                      <option value="review">Review</option>
                      <option value="scheduled">Scheduled</option>
                    </select>
                  </div>
                  <div className="col-md-4">
                    <label className="form-label" style={{ fontWeight: "500", marginBottom: "8px" }}>
                      Search
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Search by title, slug, or excerpt..."
                      value={searchQuery}
                      onChange={(e) => {
                        setSearchQuery(e.target.value);
                        setCurrentPage(1);
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* Stats */}
              <div className="row mb-3">
                <div className="col-md-3">
                  <div style={{
                    backgroundColor: "#fff",
                    padding: "15px",
                    borderRadius: "8px",
                    boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                    textAlign: "center"
                  }}>
                    <div style={{ fontSize: "24px", fontWeight: "600", color: "#333" }}>
                      {totalPosts}
                    </div>
                    <div style={{ fontSize: "12px", color: "#666" }}>Total Posts</div>
                  </div>
                </div>
                <div className="col-md-3">
                  <div style={{
                    backgroundColor: "#fff",
                    padding: "15px",
                    borderRadius: "8px",
                    boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                    textAlign: "center"
                  }}>
                    <div style={{ fontSize: "24px", fontWeight: "600", color: "#28a745" }}>
                      {posts.filter(p => p.publishStatus === "published").length}
                    </div>
                    <div style={{ fontSize: "12px", color: "#666" }}>Published</div>
                  </div>
                </div>
                <div className="col-md-3">
                  <div style={{
                    backgroundColor: "#fff",
                    padding: "15px",
                    borderRadius: "8px",
                    boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                    textAlign: "center"
                  }}>
                    <div style={{ fontSize: "24px", fontWeight: "600", color: "#ffc107" }}>
                      {posts.filter(p => p.publishStatus === "draft").length}
                    </div>
                    <div style={{ fontSize: "12px", color: "#666" }}>Drafts</div>
                  </div>
                </div>
                <div className="col-md-3">
                  <div style={{
                    backgroundColor: "#fff",
                    padding: "15px",
                    borderRadius: "8px",
                    boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                    textAlign: "center"
                  }}>
                    <div style={{ fontSize: "24px", fontWeight: "600", color: "#17a2b8" }}>
                      {posts.filter(p => p.contentType === "video").length}
                    </div>
                    <div style={{ fontSize: "12px", color: "#666" }}>Videos</div>
                  </div>
                </div>
              </div>

              {/* Posts List */}
              <div style={{
                backgroundColor: "#fff",
                padding: "20px",
                borderRadius: "8px",
                boxShadow: "0 2px 4px rgba(0,0,0,0.1)"
              }}>
                {loading ? (
                  <div className="text-center py-5">
                    <div className="spinner-border text-primary" role="status">
                      <span className="visually-hidden">Loading...</span>
                    </div>
                    <p className="mt-3 text-muted">Loading posts...</p>
                  </div>
                ) : displayPosts.length === 0 ? (
                  <div className="text-center py-5">
                    <p className="text-muted">No posts found matching your filters.</p>
                    <button
                      className="btn btn-primary mt-3"
                      onClick={() => router.push("/admin")}
                    >
                      Create Your First Post
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="table-responsive">
                      <table className="table table-hover">
                        <thead>
                          <tr>
                            <th style={{ width: "60px" }}>Image</th>
                            <th>Title</th>
                            <th>Type</th>
                            <th>Category</th>
                            <th>Status</th>
                            <th>Views</th>
                            <th>Created</th>
                            <th style={{ width: "150px" }}>Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {displayPosts.map((post) => (
                            <tr key={post._id}>
                              <td>
                                {post.bannerImageUrl ? (
                                  <img
                                    src={post.bannerImageUrl}
                                    alt={post.title}
                                    style={{
                                      width: "50px",
                                      height: "50px",
                                      objectFit: "cover",
                                      borderRadius: "4px"
                                    }}
                                    onError={(e) => {
                                      e.target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='50' height='50'%3E%3Crect fill='%23ddd' width='50' height='50'/%3E%3Ctext x='50%25' y='50%25' text-anchor='middle' dy='.3em' fill='%23999' font-size='10'%3ENo Image%3C/text%3E%3C/svg%3E";
                                    }}
                                  />
                                ) : (
                                  <div style={{
                                    width: "50px",
                                    height: "50px",
                                    backgroundColor: "#ddd",
                                    borderRadius: "4px",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    fontSize: "10px",
                                    color: "#999"
                                  }}>
                                    No Image
                                  </div>
                                )}
                              </td>
                              <td>
                                <div style={{ fontWeight: "500" }}>{post.title}</div>
                                <small className="text-muted" style={{ fontSize: "11px" }}>
                                  /{post.slug}
                                </small>
                              </td>
                              <td>
                                <span className="badge bg-info">
                                  {getContentTypeLabel(post.contentType)}
                                </span>
                              </td>
                              <td>
                                {post.category ? (
                                  <span className="badge bg-secondary">
                                    {post.category.name}
                                  </span>
                                ) : (
                                  <span className="text-muted">No category</span>
                                )}
                              </td>
                              <td>
                                <span className={`badge ${getStatusBadgeClass(post.publishStatus)}`}>
                                  {post.publishStatus || "published"}
                                </span>
                              </td>
                              <td>
                                <span className="text-muted">{post.viewsCount || 0}</span>
                              </td>
                              <td>
                                <small className="text-muted">
                                  {new Date(post.createdAt).toLocaleDateString()}
                                </small>
                              </td>
                              <td>
                                <div className="d-flex gap-1">
                                  <button
                                    className="btn btn-sm btn-primary"
                                    onClick={(e) => {
                                      e.preventDefault();
                                      e.stopPropagation();
                                      if (post.slug) {
                                        handleEdit(post.slug);
                                      } else {
                                        notifyError("Post slug is missing");
                                      }
                                    }}
                                    title="Edit"
                                  >
                                    Edit
                                  </button>
                                  <button
                                    className="btn btn-sm btn-danger"
                                    onClick={(e) => {
                                      e.preventDefault();
                                      e.stopPropagation();
                                      handleDelete(post._id, post.slug);
                                    }}
                                    disabled={deletingId === post._id}
                                    title="Delete"
                                  >
                                    {deletingId === post._id ? (
                                      <span className="spinner-border spinner-border-sm" role="status">
                                        <span className="visually-hidden">Deleting...</span>
                                      </span>
                                    ) : (
                                      "Delete"
                                    )}
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    {/* Pagination */}
                    {totalPages > 1 && (
                      <div className="d-flex justify-content-between align-items-center mt-3">
                        <div>
                          <small className="text-muted">
                            Page {currentPage} of {totalPages}
                          </small>
                        </div>
                        <div className="btn-group">
                          <button
                            className="btn btn-outline-primary btn-sm"
                            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                            disabled={currentPage === 1}
                          >
                            Previous
                          </button>
                          <button
                            className="btn btn-outline-primary btn-sm"
                            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
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
      </div>

      <ToastContainer />
    </>
  );
}

