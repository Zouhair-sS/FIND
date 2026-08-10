"use client";

import { useAuth } from "@/components/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import PageTransition from "@/components/PageTransition";

export default function ProfilePage() {
  const { user, isAuthenticated, loading } = useAuth();
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
        <div className="max-w-4xl mx-auto bg-card rounded-3xl p-8 md:p-12 shadow-sm border border-gray-100">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">My Profile</h1>
          
          <div className="space-y-8">
            <div className="flex items-center gap-6 pb-8 border-b border-gray-100">
              <div className="w-24 h-24 bg-primary text-white text-3xl font-bold rounded-full flex items-center justify-center">
                {user?.name.charAt(0)}
              </div>
              <div>
                <h2 className="text-2xl font-semibold text-gray-900">{user?.name}</h2>
                <p className="text-gray-500">{user?.email}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100">
                <h3 className="text-sm font-semibold text-gray-400 mb-1">Full Name</h3>
                <p className="font-medium text-gray-900">{user?.name}</p>
              </div>
              <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100">
                <h3 className="text-sm font-semibold text-gray-400 mb-1">Email Address</h3>
                <p className="font-medium text-gray-900">{user?.email}</p>
              </div>
            </div>
            
            <div className="pt-4 flex gap-4">
              <button className="px-6 py-3 bg-primary text-white rounded-xl font-medium hover:bg-primary-hover transition-colors shadow-sm">
                Edit Profile
              </button>
              <button className="px-6 py-3 bg-white text-gray-700 border border-gray-200 rounded-xl font-medium hover:bg-gray-50 transition-colors shadow-sm">
                Change Password
              </button>
            </div>
          </div>
        </div>
      </div>
    </PageTransition>
  );
}
