"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import adminAxios from "@/lib/adminAxios";

export interface User {
  id: number;
  name: string;
  email: string;
  role?: string;
  profile_picture?: string;
}

interface AdminAuthContextType {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
  login: (data: Record<string, unknown>) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AdminAuthContext = createContext<AdminAuthContextType | undefined>(undefined);

export function AdminAuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshUser = async () => {
    try {
      if (!localStorage.getItem('admin_token')) {
        throw new Error("No token");
      }
      const res = await adminAxios.get("/api/user");
      if (res.data.role !== 'admin') {
        throw new Error("Not an admin");
      }
      setUser(res.data);
    } catch {
      setUser(null);
      localStorage.removeItem('admin_token');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshUser();
  }, []);

  const login = async (data: Record<string, unknown>) => {
    const res = await adminAxios.post("/api/admin/login", data);
    const token = res.data.token;
    localStorage.setItem('admin_token', token);
    await refreshUser();
  };

  const logout = async () => {
    try {
      await adminAxios.post("/api/admin/logout");
    } catch {
      console.error("Logout failed on server, clearing local state");
    } finally {
      localStorage.removeItem('admin_token');
      setUser(null);
    }
  };

  const isAuthenticated = !!user;

  return (
    <AdminAuthContext.Provider value={{ user, loading, isAuthenticated, login, logout, refreshUser }}>
      {children}
    </AdminAuthContext.Provider>
  );
}

export function useAdminAuth() {
  const context = useContext(AdminAuthContext);
  if (context === undefined) {
    throw new Error("useAdminAuth must be used within an AdminAuthProvider");
  }
  return context;
}
