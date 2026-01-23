import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Head from "next/head";
import axiosInstance from "@/util/axiosInstance";
import { notifyError, notifySuccess } from "@/util/toast";
import Spinner from "@/components/elements/Spinner";
import ToastContainer from "@/components/ToastContainer/ToastContainer";

export default function AdminLogin() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    // Check if already logged in
    const token = typeof window !== "undefined" && localStorage.getItem("adminToken");
    if (token) {
      router.push("/admin");
    }
  }, [router]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    
    if (!email || !password) {
      setError("Please enter both email and password");
      return;
    }

    setIsLoading(true);
    try {
      // Call admin authentication endpoint
      const response = await axiosInstance.post("/admin/login", {
        email,
        password,
      });

      if (response.success && response.token) {
        localStorage.setItem("adminToken", response.token);
        localStorage.setItem("token", response.token); // Also set regular token
        notifySuccess("Logged in successfully");
        router.push("/admin");
      } else {
        throw new Error(response.message || "Invalid credentials");
      }
    } catch (err) {
      const errorMessage = err?.response?.data?.message || err?.message || "Invalid email or password. Please try again.";
      setError(errorMessage);
      notifyError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Head>
        <title>Admin Login - Corp Crunch</title>
        <meta name="robots" content="noindex, nofollow" />
      </Head>
      
      {/* Admin-only layout - no header, footer, navbar */}
      <div style={{ 
        minHeight: "100vh", 
        backgroundColor: "#f5f5f5",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "20px"
      }}>
        <style dangerouslySetInnerHTML={{__html: `
          .admin-login-btn:hover:not(:disabled) {
            background-color: #1d4ed8 !important;
            border-color: #1d4ed8 !important;
          }
          .admin-login-btn:disabled {
            opacity: 0.6;
            cursor: not-allowed;
          }
        `}} />
        
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-xl-5 col-lg-6 col-md-8">
              <div
                style={{
                  boxShadow: "0px 0px 15px rgba(0, 0, 0, 0.2)",
                  padding: "2.5rem",
                  borderRadius: "8px",
                  backgroundColor: "#fff",
                }}
              >
                <div style={{ textAlign: "center", marginBottom: "10px" }}>
                  <h1 style={{ fontSize: "28px", fontWeight: "600", color: "#333", marginBottom: "5px" }}>
                    Corp Crunch
                  </h1>
                  <h2 style={{ marginBottom: "30px", textAlign: "center", color: "#666", fontSize: "20px", fontWeight: "400" }}>
                    Admin Login
                  </h2>
                </div>
                <form onSubmit={handleSubmit}>
                  <div className="mb-3">
                    <label htmlFor="email" className="form-label" style={{ fontWeight: "500" }}>
                      Email Address
                    </label>
                    <input
                      type="email"
                      className="form-control"
                      id="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="admin@corpcrunch.io"
                      required
                      style={{ padding: "12px" }}
                    />
                  </div>
                  <div className="mb-3">
                    <label htmlFor="password" className="form-label" style={{ fontWeight: "500" }}>
                      Password
                    </label>
                    <input
                      type="password"
                      className="form-control"
                      id="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter password"
                      required
                      style={{ padding: "12px" }}
                    />
                  </div>
                  {error && (
                    <div className="alert alert-danger" style={{ fontSize: "14px", padding: "10px 15px" }}>
                      {error}
                    </div>
                  )}
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="btn-eleven fw-500 tran3s admin-login-btn"
                    style={{
                      width: "100%",
                      padding: "12px",
                      marginTop: "10px",
                      backgroundColor: "#2563eb",
                      borderColor: "#2563eb",
                      color: "#ffffff",
                      cursor: "pointer",
                    }}
                  >
                    {isLoading ? (
                      <span style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}>
                        <Spinner size="small" /> Logging in...
                      </span>
                    ) : (
                      "Login"
                    )}
                  </button>
                </form>
                <div style={{ marginTop: "20px", textAlign: "center" }}>
                  <a href="/" style={{ color: "#2563eb", textDecoration: "none", fontSize: "14px" }}>
                    ← Back to Website
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Toast Container for notifications */}
      <ToastContainer />
    </>
  );
}
