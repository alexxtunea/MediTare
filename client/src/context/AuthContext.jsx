import { createContext, useContext, useEffect, useState } from "react";
import api from "../api/axios";

const AuthContext = createContext(null);

const getStoredUser = () => {
  const storedUser = localStorage.getItem("user");

  if (!storedUser) {
    return null;
  }

  try {
    return JSON.parse(storedUser);
  } catch (error) {
    localStorage.removeItem("user");
    return null;
  }
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(getStoredUser);
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [loading, setLoading] = useState(Boolean(localStorage.getItem("token")));

  const persistAuth = (authUser, authToken) => {
    localStorage.setItem("user", JSON.stringify(authUser));
    localStorage.setItem("token", authToken);
    setUser(authUser);
    setToken(authToken);
  };

  const clearAuth = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    setUser(null);
    setToken(null);
  };

  const login = async (credentials) => {
    const { data } = await api.post("/auth/login", credentials);
    const authUser = {
      _id: data._id,
      name: data.name,
      email: data.email,
      role: data.role,
      profileImage: data.profileImage,
      experienceLevel: data.experienceLevel,
      teachesAt: data.teachesAt,
    };

    persistAuth(authUser, data.token);
    return authUser;
  };

  const register = async (payload) => {
    const { data } = await api.post("/auth/register", payload);
    const authUser = {
      _id: data._id,
      name: data.name,
      email: data.email,
      role: data.role,
      profileImage: data.profileImage,
      experienceLevel: data.experienceLevel,
      teachesAt: data.teachesAt,
    };

    persistAuth(authUser, data.token);
    return authUser;
  };

  const logout = () => {
    clearAuth();
  };

  const refreshUser = async () => {
    if (!localStorage.getItem("token")) {
      setLoading(false);
      return null;
    }

    try {
      const { data } = await api.get("/auth/me");
      localStorage.setItem("user", JSON.stringify(data));
      setUser(data);
      return data;
    } catch (error) {
      clearAuth();
      return null;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshUser();
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        register,
        logout,
        refreshUser,
        isAuthenticated: Boolean(user && token),
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }

  return context;
}
