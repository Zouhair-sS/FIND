"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/components/AuthContext";
import { useRouter } from "next/navigation";

export default function CheckoutGateway() {
  const { isAuthenticated, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && isAuthenticated) {
      router.push("/checkout/shipping"); // Skip gateway if logged in
    }
  }, [isAuthenticated, loading, router]);

  if (loading || isAuthenticated) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-gray-200 border-t-gray-900 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-6 py-24 min-h-[calc(100vh-64px)] flex flex-col justify-center">
      <div className="text-center mb-12">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900 mb-4">How would you like to checkout?</h1>
        <p className="text-gray-500">Sign in for a faster experience, or continue as a guest.</p>
      </div>

      <div className="grid md:grid-cols-2 gap-8 lg:gap-12 relative">
        
        {/* Guest */}
        <div className="bg-gray-50 p-8 rounded-2xl border border-gray-100 flex flex-col h-full">
          <h2 className="text-xl font-semibold mb-2">Guest Checkout</h2>
          <p className="text-sm text-gray-500 mb-8 flex-1">
            Proceed to checkout without an account. You can create one after your order is placed to save your details for next time.
          </p>
          <button 
            onClick={() => router.push('/checkout/shipping')}
            className="w-full py-3.5 bg-white border border-gray-200 text-gray-900 rounded-lg font-medium hover:bg-gray-50 transition-colors shadow-sm cursor-pointer"
          >
            Continue as Guest
          </button>
        </div>

        {/* OR Divider for Desktop */}
        <div className="hidden md:flex absolute inset-y-0 left-1/2 -ml-px w-px bg-gray-200 items-center justify-center">
          <span className="bg-white px-4 text-sm font-medium text-gray-400">OR</span>
        </div>

        {/* Sign In */}
        <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-xl shadow-gray-200/20 flex flex-col h-full">
          <h2 className="text-xl font-semibold mb-2">Sign In</h2>
          <p className="text-sm text-gray-500 mb-8 flex-1">
            Sign in to use your saved shipping addresses and payment methods.
          </p>
          <div className="space-y-3">
            <Link 
              href="/login?redirect=/checkout/shipping"
              className="block w-full text-center py-3.5 bg-gray-900 text-white rounded-lg font-medium hover:bg-gray-800 transition-colors"
            >
              Sign In
            </Link>
            <div className="text-center text-sm text-gray-500 pt-4 border-t border-gray-100 mt-4">
              Don't have an account?{" "}
              <Link href="/register?redirect=/checkout/shipping" className="text-blue-600 hover:underline">
                Create Account
              </Link>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
