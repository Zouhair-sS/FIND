"use client";

import { useAuth } from "@/components/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import PageTransition from "@/components/PageTransition";
import Link from "next/link";

export default function OrdersPage() {
  const { isAuthenticated, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push("/login");
    }
  }, [loading, isAuthenticated, router]);

  if (loading || !isAuthenticated) {
    return (
      <div className="flex-1 min-h-screen flex items-center justify-center bg-background">
        <div className="w-8 h-8 border-4 border-gray-200 border-t-primary rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <PageTransition>
      <div className="flex-1 min-h-screen bg-background p-6 md:p-12">
        <div className="max-w-5xl mx-auto bg-card rounded-3xl p-8 md:p-12 shadow-sm border border-gray-100">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Order History</h1>
          
          <div className="flex flex-col items-center justify-center py-20 text-center border-2 border-dashed border-gray-100 rounded-3xl">
            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-6">
              <svg className="w-10 h-10 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">No orders yet</h2>
            <p className="text-gray-500 mb-8 max-w-md">
              When you place orders, they will appear here. Start shopping to find your next favorite tech!
            </p>
            <Link 
              href="/products" 
              className="px-8 py-3 bg-primary text-white rounded-xl font-medium hover:bg-primary-hover transition-colors shadow-sm"
            >
              Browse Products
            </Link>
          </div>
        </div>
      </div>
    </PageTransition>
  );
}
