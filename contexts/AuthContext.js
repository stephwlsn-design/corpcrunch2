import { createContext, useContext, useCallback } from "react";

const AuthContext = createContext(null);

/**
 * AuthProvider — optional auth helpers for account-only flows (profile, subscribe).
 * Articles, categories, and public content are readable without signing in.
 */
export function AuthProvider({ children }) {
  /**
   * Previously gated content navigation behind sign-in.
   * Public reading is enabled — always allow navigation.
   */
  const requireAuth = useCallback(() => true, []);

  return (
    <AuthContext.Provider value={{ requireAuth }}>
      {children}
    </AuthContext.Provider>
  );
}

const defaultAuth = {
  requireAuth: () => true,
};

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    return defaultAuth;
  }
  return ctx;
}

