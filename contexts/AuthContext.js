import { createContext, useContext, useCallback } from "react";

const AuthContext = createContext(null);

/**
 * AuthProvider — provides requireAuth() to any component.
 * When the user is NOT logged in, requireAuth() redirects them to
 * /signin?redirectUrl=<target> so the existing login/register pages handle auth.
 * After successful login the user is automatically returned to the target URL.
 */
export function AuthProvider({ children }) {
  /**
   * Call this before navigating to a protected URL.
   * Returns true  → user is logged in, caller may navigate.
   * Returns false → user is NOT logged in, redirect kicked off, caller should NOT navigate.
   */
  const requireAuth = useCallback((url) => {
    if (typeof window === "undefined") return true;
    const token = localStorage.getItem("token");
    if (token) return true; // already authenticated

    // Redirect to the existing sign-in page, passing the intended destination
    const redirectUrl = url ? encodeURIComponent(url) : "";
    window.location.href = `/signin${redirectUrl ? `?redirectUrl=${redirectUrl}` : ""}`;
    return false;
  }, []);

  return (
    <AuthContext.Provider value={{ requireAuth }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

