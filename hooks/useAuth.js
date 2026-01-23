import { useRouter } from "next/router";
import React, { useState, useContext } from "react";

const AuthContext = React.createContext();

const useAuth = () => {
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState(null);
  const router = useRouter();

  const login = async (data) => {
    console.log("data: ", data);
    setUser(true);
    router.push("/");

    // setLoading(true);
    // setLoading(false);
  };

  const logout = () => {
    setUser(null);
  };

  return { loading, user, login, logout };
};

export const AuthProvider = ({ children }) => {
  const auth = useAuth();
  return <AuthContext.Provider value={auth}>{children}</AuthContext.Provider>;
};

export const useAuthContext = () => {
  return useContext(AuthContext);
};
