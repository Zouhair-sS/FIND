"use client";

import React from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { CheckoutProvider } from "@/components/CheckoutContext";

export default function CheckoutLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  
  // Don't show the step header on the gateway page or the success page
  const showHeader = pathname.includes("/shipping") || pathname.includes("/payment");
  const isPayment = pathname.includes("/payment");

  return (
    <CheckoutProvider>
      <div className="min-h-screen bg-gray-50/50 flex flex-col pt-24 pb-12">
        {showHeader && (
          <div className="max-w-3xl mx-auto w-full px-6 mb-12">
            <div className="flex relative border-b border-gray-200">
              <Link 
                href="/checkout/shipping"
                className={`flex-1 pb-4 text-center text-sm sm:text-base font-bold transition-colors ${!isPayment ? 'text-gray-900' : 'text-gray-400 hover:text-gray-600'}`}
              >
                Shipping Method
              </Link>
              <Link 
                href="/checkout/payment"
                className={`flex-1 pb-4 text-center text-sm sm:text-base font-bold transition-colors ${isPayment ? 'text-gray-900' : 'text-gray-400 hover:text-gray-600'}`}
              >
                Payment
              </Link>
              
              {/* Animated Underline */}
              <motion.div 
                className="absolute bottom-0 h-0.5 bg-gray-900 w-1/2"
                initial={false}
                animate={{ x: isPayment ? "100%" : "0%" }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
              />
            </div>
          </div>
        )}
        
        {children}
      </div>
    </CheckoutProvider>
  );
}
