"use client";

import React, { useEffect } from "react";
import { AdminAuthProvider, useAdminAuth } from "@/components/AdminAuthContext";
import { ToastProvider } from "@/components/admin/Toast";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { LayoutDashboard, ShoppingCart, LogOut, Package, Zap, Settings, Users, FolderTree, Layers } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { getImageUrl } from "@/lib/api";

function AdminLayoutContent({ children }: { children: React.ReactNode }) {
  const { user, loading, isAuthenticated, logout } = useAdminAuth();
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
          <div className="relative w-10 h-10">
            <div className="absolute inset-0 border-2 border-gray-200 rounded-full" />
            <div className="absolute inset-0 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
          <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-widest">Loading Workspace</p>
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

  const navSections: {
    label: string;
    items: {
      name: string;
      href: string;
      icon: React.ElementType;
      exact: boolean;
      external?: boolean;
    }[];
  }[] = [
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
        { name: "Categories", href: "/admin/categories", icon: FolderTree, exact: false },
        { name: "Brands", href: "/admin/brands", icon: Layers, exact: false },
      ],
    },
    {
      label: "Sales",
      items: [
        { name: "Orders", href: "/admin/orders", icon: ShoppingCart, exact: false },
        { name: "Customers", href: "/admin/customers", icon: Users, exact: false },
      ],
    },
    {
      label: "Store",
      items: [
        { name: "Storefront", href: "/", icon: Zap, exact: true, external: true },
      ],
    },
    {
      label: "Account",
      items: [
        { name: "Profile", href: "/admin/profile", icon: Settings, exact: false },
      ],
    },
  ];

  const initials = user?.name?.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2) || "A";

  return (
    <div className="h-screen w-full overflow-hidden bg-[#f0f2f5] text-gray-900 flex">
      <aside className="w-[240px] flex-shrink-0 flex flex-col bg-white h-full z-40 shadow-[1px_0_0_0_#e5e7eb] overflow-y-auto custom-scrollbar">

        <div className="px-5 pt-5 pb-4 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <Image
              src="/images/FIND LOGO/FIND ADMIN LOGO.png"
              alt="FIND Admin"
              width={260}
              height={72}
              className="object-contain h-20 w-auto"
              priority
            />
          </div>
        </div>



        <nav className="flex-1 px-3 py-3 overflow-y-auto">
          {navSections.map((section, idx) => (
            <div key={idx} className={idx > 0 ? "pt-4" : ""}>
              <p className="px-3 pb-1.5 text-[10px] font-semibold text-gray-400 uppercase tracking-widest">
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
                    target={item.external ? "_blank" : "_self"}
                    className={`relative flex items-center gap-3 px-3 py-2.5 rounded-lg text-[13px] font-medium transition-all duration-150 group ${!item.external && isActive
                      ? "text-primary bg-primary/[0.07]"
                      : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                      }`}
                  >
                    {!item.external && isActive && (
                      <motion.div
                        layoutId="admin-nav-active-bar"
                        className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-primary rounded-r-full"
                        transition={{ type: "spring", bounce: 0.2, duration: 0.4 }}
                      />
                    )}
                    <item.icon
                      className={`w-[17px] h-[17px] flex-shrink-0 transition-colors duration-150 ${!item.external && isActive ? "text-primary" : "text-gray-400 group-hover:text-gray-600"
                        }`}
                    />
                    <span className="flex-1">{item.name}</span>
                    {!item.external && isActive && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="w-1.5 h-1.5 rounded-full bg-primary/40"
                      />
                    )}
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>

        <div className="px-4 pb-4 pt-3 border-t border-gray-100 flex flex-col gap-1">
          <div className="flex items-center gap-3.5 px-3.5 py-3 rounded-xl bg-gradient-to-br from-gray-50 to-gray-100/50 mb-2">
            {user?.profile_picture ? (
              <img
                src={getImageUrl(user.profile_picture)}
                alt="Profile"
                className="w-11 h-11 rounded-full object-cover flex-shrink-0 shadow-sm"
              />
            ) : (
              <div className="w-11 h-11 rounded-full bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center text-[14px] font-bold text-white shadow-sm flex-shrink-0">
                {initials}
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="text-[14px] font-semibold text-gray-900 truncate leading-tight">{user?.name}</p>
              <p className="text-[11px] text-gray-500 truncate leading-tight mt-0.5">{user?.email}</p>
            </div>
            <div className="w-2 h-2 rounded-full bg-emerald-400 flex-shrink-0" title="Online" />
          </div>


          <button
            onClick={() => {
              logout();
              router.push("/admin/login");
            }}
            className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-[13px] font-medium text-gray-500 hover:text-red-600 hover:bg-red-50 transition-all duration-150 cursor-pointer"
          >
            <LogOut className="w-[17px] h-[17px]" />
            Sign Out
          </button>
        </div>
      </aside>

      <main className="flex-1 h-full overflow-y-auto bg-[#f0f2f5] custom-scrollbar">
        <AnimatePresence mode="wait">
          <motion.div
            key={pathname}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2, ease: [0.23, 1, 0.32, 1] }}
            className="min-h-screen"
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <AdminAuthProvider>
      <ToastProvider>
        <AdminLayoutContent>{children}</AdminLayoutContent>
      </ToastProvider>
    </AdminAuthProvider>
  );
}
