"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/components/AuthContext";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

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
        <div className="w-8 h-8 border-4 border-gray-200 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.15 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
  };

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="max-w-4xl mx-auto px-6 py-24 flex-1 flex flex-col justify-center"
    >
      <motion.div variants={itemVariants} className="text-center mb-16">
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-gray-900 mb-4">How would you like to checkout?</h1>
        <p className="text-gray-500 text-lg">Sign in for a faster experience, or continue as a guest.</p>
      </motion.div>

      <div className="grid md:grid-cols-2 gap-8 lg:gap-12 relative max-w-3xl mx-auto w-full">
        
        {/* Guest */}
        <motion.div variants={itemVariants} className="bg-gray-50 p-10 rounded-3xl border border-gray-100 flex flex-col h-full hover:shadow-md transition-shadow">
          <h2 className="text-2xl font-bold mb-4 text-gray-900">Guest Checkout</h2>
          <p className="text-sm text-gray-500 mb-10 flex-1 leading-relaxed">
            Proceed to checkout without an account. You can create one after your order is placed to save your details for next time.
          </p>
          <button 
            onClick={() => router.push('/checkout/shipping')}
            className="w-full py-4 bg-white border border-gray-200 text-gray-900 rounded-2xl font-bold hover:bg-gray-50 hover:border-gray-300 transition-all shadow-sm cursor-pointer"
          >
            Continue as Guest
          </button>
        </motion.div>

        {/* OR Divider for Desktop */}
        <motion.div variants={itemVariants} className="hidden md:flex absolute inset-y-0 left-1/2 -ml-px w-px bg-gray-200 items-center justify-center">
          <span className="bg-background px-4 text-sm font-bold text-gray-400">OR</span>
        </motion.div>

        {/* Sign In */}
        <motion.div variants={itemVariants} className="bg-card p-10 rounded-3xl border border-gray-100 shadow-xl shadow-primary/5 flex flex-col h-full hover:shadow-2xl hover:shadow-primary/10 transition-shadow">
          <h2 className="text-2xl font-bold mb-4 text-gray-900">Sign In</h2>
          <p className="text-sm text-gray-500 mb-10 flex-1 leading-relaxed">
            Sign in to use your saved shipping addresses and payment methods.
          </p>
          <div className="space-y-4">
            <Link 
              href="/login?redirect=/checkout/shipping"
              className="block w-full text-center py-4 bg-primary text-white rounded-2xl font-bold hover:bg-primary-hover transition-colors shadow-md shadow-primary/20"
            >
              Sign In
            </Link>
            <div className="text-center text-sm text-gray-500 pt-5 border-t border-gray-100 mt-5">
              Don't have an account?{" "}
              <Link href="/register?redirect=/checkout/shipping" className="text-primary hover:underline font-semibold">
                Create Account
              </Link>
            </div>
          </div>
        </motion.div>

      </div>
    </motion.div>
  );
}
