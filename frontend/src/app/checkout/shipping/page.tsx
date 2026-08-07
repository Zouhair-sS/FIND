"use client";

import React from "react";
import Link from "next/link";
import { useAuth } from "@/components/AuthContext";

export default function ShippingPage() {
  const { user } = useAuth();

  return (
    <div className="max-w-3xl mx-auto px-6 py-20 min-h-[60vh]">
      <h1 className="text-3xl font-bold mb-8">Shipping Information</h1>
      <p className="mb-4 text-gray-600">
        {user ? `Welcome back, ${user.name.split(" ")[0]}! We can use your saved addresses here.` : "Checking out as a Guest."}
      </p>
      
      {/* Placeholder for the shipping form */}
      <div className="bg-gray-50 border border-gray-100 rounded-2xl p-8 mb-8 text-center text-gray-500">
        Shipping Form Placeholder
      </div>

      <div className="flex justify-end">
        <Link 
          href="/checkout/payment"
          className="px-8 py-4 bg-gray-900 text-white rounded-xl font-medium hover:bg-gray-800 transition-colors"
        >
          Continue to Payment
        </Link>
      </div>
    </div>
  );
}
