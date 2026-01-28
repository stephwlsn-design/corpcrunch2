import axios from "axios";

const axiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || (typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3001') + "/api",
  headers: {
    'Content-Type': 'application/json',
  },
});

axiosInstance.interceptors.request.use((config) => {
  // Only access localStorage on client side
  if (typeof window !== "undefined") {
    // Try adminToken first, then fallback to token
    const token = localStorage.getItem("adminToken") || localStorage.getItem("token");
    if (token) {
      // FIXED: Add "Bearer " prefix if not already present
      config.headers.Authorization = token.startsWith('Bearer ') ? token : `Bearer ${token}`;
    }
  }

  return config;
});

axiosInstance.interceptors.response.use(
  (response) => {
    return response.data;
  },
  (error) => {
    // Only handle client-side redirects and localStorage on client side
    if (typeof window !== "undefined") {
      if (
        error?.response?.status === 401 &&
        error.response.config.url !== "/authentication?userType=BLOG_USER"
      ) {
        try {
          localStorage.clear();
        } catch (e) {
          // Ignore localStorage errors
        }

        // If user is on any admin route, force redirect to admin login on token expiry
        if (window.location.pathname.startsWith("/admin")) {
          window.location.href = "/admin/login";
        } else if (!window.location.href.includes("make-article-request")) {
          // For non-admin routes we just clear tokens and let the error propagate
          // so pages like blog request can handle it gracefully.
        }
      }

      // if (error?.response?.status === 402) {
      //   window.location.href = "/subscribe";
      //   return;
      // }
    }

    // Always throw error to allow proper error handling in getStaticProps
    throw error;
  }
);

export default axiosInstance;