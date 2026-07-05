import { createContext, useState, useEffect } from "react";
import { authAPI } from "../api";

export const AuthContext = createContext(null);

const decodeToken = (token) => {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64).split('').map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)).join('')
    );
    return JSON.parse(jsonPayload);
  } catch (e) { return null; }
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("noor_token");
    const savedUser = localStorage.getItem("noor_user");
    if (token && savedUser) {
      try {
        const decoded = decodeToken(token);
        const isExpired = decoded?.exp && decoded.exp * 1000 < Date.now();
        if (isExpired) {
          localStorage.removeItem("noor_token");
          localStorage.removeItem("noor_user");
        } else {
          setUser(JSON.parse(savedUser));
        }
      } catch {
        localStorage.removeItem("noor_token");
        localStorage.removeItem("noor_user");
      }
    }
    setLoading(false);
  }, []);

  const buildUserFromResponse = (data, additionalInfo = {}) => {
    const decoded = decodeToken(data.accessToken);
    const roleKey = "http://schemas.microsoft.com/ws/2008/06/identity/claims/role";
    const role = decoded?.[roleKey] || data.role || "Customer";
    return {
      id: decoded?.sub || decoded?.nameid || null,
      email: data.email || additionalInfo.email || decoded?.email || "",
      role,
      firstName: additionalInfo.firstName || "",
      lastName: additionalInfo.lastName || "",
      expiresAt: data.expiresAt,
    };
  };

  const login = async (email, password) => {
    const res = await authAPI.login({ email, password });
    const data = res.data;
    if (!data?.accessToken) throw new Error("Login failed - no access token received");
    const userData = buildUserFromResponse(data);
    localStorage.setItem("noor_token", data.accessToken);
    localStorage.setItem("noor_user", JSON.stringify(userData));
    setUser(userData);
    return userData;
  };

  const register = async (formData) => {
    const res = await authAPI.register(formData);
    const data = res.data;
    if (data?.accessToken) {
      const userData = buildUserFromResponse(data, {
        firstName: formData.firstName,
        lastName: formData.lastName,
      });
      localStorage.setItem("noor_token", data.accessToken);
      localStorage.setItem("noor_user", JSON.stringify(userData));
      setUser(userData);
      return userData;
    }
    return await login(formData.email, formData.password);
  };

  const logout = () => {
    localStorage.removeItem("noor_token");
    localStorage.removeItem("noor_user");
    setUser(null);
    window.location.href = "/";
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, loading, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
};