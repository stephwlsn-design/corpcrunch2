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
    if (typeof window !== "undefined") {
      const requestUrl = error?.response?.config?.url || error?.config?.url || "";
      const isAdminLoginRequest =
        typeof requestUrl === "string" && requestUrl.includes("/admin/login");
      const onAdminLoginPage = window.location.pathname.startsWith("/admin/login");

      // Never clear session for a failed login attempt itself
      if (
        error?.response?.status === 401 &&
        !isAdminLoginRequest &&
        requestUrl !== "/authentication?userType=BLOG_USER"
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

        if (window.location.pathname.startsWith("/admin") && !onAdminLoginPage) {
          window.location.href = "/admin/login";
        }
      }
    }

    throw error;
  }
);

export default axiosInstance;