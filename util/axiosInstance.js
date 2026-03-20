import axios from "axios";
import { clearAdminSession } from "@/lib/adminSession";

const axiosInstance = axios.create({
  baseURL: typeof window !== 'undefined' ? '/api' : (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'),
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
          if (window.location.pathname.startsWith("/admin")) {
            clearAdminSession();
          } else {
            localStorage.clear();
          }
        } catch (e) {
          // Ignore localStorage errors
        }

        if (window.location.pathname.startsWith("/admin")) {
          window.location.href = "/admin/login";
        } else if (!window.location.href.includes("make-article-request")) {
          // For non-admin routes let the error propagate
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