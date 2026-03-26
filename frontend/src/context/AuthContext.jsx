import { createContext, useContext, useEffect, useState } from "react";
import api from "../api/client";

const AuthContext = createContext(null);

/* Helper: read token from whichever storage has it */
function getToken() {
  return localStorage.getItem("token") || sessionStorage.getItem("token");
}

function storeToken(token, remember) {
  // always clear both first
  localStorage.removeItem("token");
  sessionStorage.removeItem("token");
  if (remember) {
    localStorage.setItem("token", token);
  } else {
    sessionStorage.setItem("token", token);
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchMe = async () => {
    try {
      const { data } = await api.get("/auth/me");
      setUser(data);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (getToken()) {
      fetchMe();
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (payload, remember = true) => {
    const { data } = await api.post("/auth/login", payload);
    storeToken(data.access_token, remember);
    setUser(data.user);
  };

  const register = async (payload) => {
    const { data } = await api.post("/auth/register", payload);
    storeToken(data.access_token, true);
    setUser(data.user);
  };

  const googleLogin = async (credential, remember = true) => {
    const { data } = await api.post("/auth/google", { token: credential });
    storeToken(data.access_token, remember);
    setUser(data.user);
  };

  const logout = () => {
    localStorage.removeItem("token");
    sessionStorage.removeItem("token");
    setUser(null);
  };

  return <AuthContext.Provider value={{ user, loading, login, register, googleLogin, logout }}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
