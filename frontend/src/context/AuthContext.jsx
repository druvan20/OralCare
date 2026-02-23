import { createContext, useContext, useState, useEffect } from "react";
import { API_BASE } from "../config";
import axios from "axios";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchUser = async (token) => {
    try {
      const res = await axios.get(`${API_BASE}/api/auth/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUser(res.data);
    } catch (err) {
      console.error("Failed to fetch user", err);
      // If 401/403, token is invalid
      if (err.response && (err.response.status === 401 || err.response.status === 403)) {
        localStorage.removeItem("token");
        setUser(null);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const initAuth = async () => {
      // 1. Check direct localStorage
      let token = localStorage.getItem("token");

      // 2. Check hash (OAuth redirect)
      const hash = window.location.hash;
      if (hash && hash.includes("token=")) {
        const params = new URLSearchParams(hash.substring(1));
        const hashToken = params.get("token");
        if (hashToken) {
          token = hashToken;
          localStorage.setItem("token", token);
          window.history.replaceState(null, "", window.location.pathname);
        }
      }

      if (token) {
        await fetchUser(token);
      } else {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  const login = (token, userData) => {
    localStorage.setItem("token", token);
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem("token");
    setUser(null);
  };

  const updateUser = (updatedData) => {
    setUser((prev) => ({ ...prev, ...updatedData }));
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, updateUser, fetchUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
