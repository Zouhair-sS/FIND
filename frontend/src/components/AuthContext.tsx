"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import axios from "@/lib/axios";

export interface User {
  id: number;
  name: string;
  email: string;
  role?: string;
  profile_picture?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
  login: (data: Record<string, unknown>) => Promise<void>;
  register: (data: Record<string, unknown>) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshUser = async () => {
    try {
      const res = await axios.get("/api/user");
      setUser(res.data);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    refreshUser();
  }, []);

  const login = async (data: Record<string, unknown>) => {
    await axios.get("/sanctum/csrf-cookie");
    await axios.post("/api/login", data);
    
    const res = await axios.get("/api/user");
    setUser(res.data);
  };

  const register = async (data: Record<string, unknown>) => {
    await axios.get("/sanctum/csrf-cookie");
    await axios.post("/api/register", data);
    const res = await axios.get("/api/user");
    setUser(res.data);
  };

  const logout = async () => {
    try {
      await axios.post("/api/logout");
    } catch {
      console.error("Logout failed on server, clearing local state");
    } finally {
      setUser(null);
      if (typeof window !== "undefined") {
        window.location.href = "/";
      }
    }
  };

  const isAuthenticated = !!user;

  return (
    <AuthContext.Provider value={{ user, loading, isAuthenticated, login, register, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
