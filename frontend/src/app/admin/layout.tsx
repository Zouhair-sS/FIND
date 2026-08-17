"use client";

import React, { useEffect } from "react";
import { useAuth } from "@/components/AuthContext";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { LayoutDashboard, ShoppingCart, CreditCard, LogOut, ChevronRight, Package } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, loading, isAuthenticated, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!loading) {
      if (!isAuthenticated || user?.role !== "admin") {
        if (pathname !== "/admin/login") {
          router.replace("/admin/login");
        }
      }
    }
  }, [loading, isAuthenticated, user, router, pathname]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f4f6f9]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 relative">
            <div className="absolute inset-0 border-2 border-gray-200 rounded-full" />
            <div className="absolute inset-0 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
          <p className="text-[11px] font-medium text-gray-400 uppercase tracking-widest">Loading Workspace</p>
        </div>
      </div>
    );
  }

  if (pathname === "/admin/login") {
    return <>{children}</>;
  }

  if (!isAuthenticated || user?.role !== "admin") {
    return null;
  }

  const navSections = [
    {
      label: "Overview",
      items: [
        { name: "Dashboard", href: "/admin", icon: LayoutDashboard, exact: true },
      ],
    },
    {
      label: "Catalog",
      items: [
        { name: "Products", href: "/admin/products", icon: Package, exact: false },
      ],
    },
    {
      label: "Orders",
      items: [
        { name: "Orders", href: "/admin/orders", icon: ShoppingCart, exact: false },
        { name: "Payments", href: "/admin/payments", icon: CreditCard, exact: false },
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-[#f4f6f9] text-gray-900 flex">
      {/* Sidebar */}
      <aside className="w-[260px] border-r border-gray-200 flex flex-col bg-white fixed h-screen z-40">
        {/* Brand */}
        <div className="px-5 pt-6 pb-2">
          <div className="flex items-center">
            <Image
              src="/images/FIND LOGO/FIND LOGO.png"
              alt="FIND Admin"
              width={140}
              height={40}
              className="object-contain h-8 w-auto origin-left"
              priority
            />
          </div>
        </div>

        {/* User info */}
        <div className="px-5 py-4 mb-2">
          <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-gray-50 border border-gray-100">
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-medium text-primary">
              {user?.name?.[0]?.toUpperCase() || "A"}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[13px] font-medium text-gray-900 truncate">{user?.name}</p>
              <p className="text-[11px] text-gray-500 truncate">{user?.email}</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 space-y-4">
          {navSections.map((section, idx) => (
            <div key={idx} className="space-y-1">
              <p className="px-3 py-2 text-[11px] font-medium text-gray-400 uppercase tracking-wider">
                {section.label}
              </p>
              {section.items.map((item) => {
                const isActive = item.exact
                  ? pathname === item.href
                  : pathname === item.href || pathname.startsWith(item.href + "/");
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`relative flex items-center gap-3 px-3 py-2.5 rounded-lg text-[13px] font-medium transition-colors duration-150 ${
                      isActive ? "text-primary" : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                    }`}
                  >
                    {isActive && (
                      <motion.div
                        layoutId="admin-nav-active"
                        className="absolute inset-0 bg-primary/[0.08] rounded-lg"
                        transition={{ type: "spring", bounce: 0.15, duration: 0.5 }}
                      />
                    )}
                    <item.icon
                      className={`w-[18px] h-[18px] relative z-10 transition-colors duration-150 ${
                        isActive ? "text-primary" : "text-gray-400"
                      }`}
                    />
                    <span className="relative z-10">{item.name}</span>
                    {isActive && (
                      <ChevronRight className="w-3.5 h-3.5 ml-auto relative z-10 text-primary/40" />
                    )}
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>

        {/* Logout */}
        <div className="px-3 pb-5">
          <button
            onClick={() => {
              logout();
              router.push("/admin/login");
            }}
            className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-[13px] font-medium text-gray-500 hover:text-red-600 hover:bg-red-50 transition-all duration-150 active:scale-[0.98]"
          >
            <LogOut className="w-[18px] h-[18px]" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 ml-[260px] overflow-auto min-h-screen">
        <AnimatePresence mode="wait">
          <motion.div
            key={pathname}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2, ease: [0.23, 1, 0.32, 1] }}
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}
