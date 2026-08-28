"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useAuth } from "@/components/AuthContext";

export interface ShippingInfo {
  phone: string;
  firstName: string;
  lastName: string;
  email?: string;
  city: string;
  address: string;
  addressDetails: string;
  zipCode: string;
}

interface CheckoutContextType {
  shippingInfo: ShippingInfo | null;
  setShippingInfo: (info: ShippingInfo | null) => void;
  shippingCost: number;
  isHydrated: boolean;
}

const CheckoutContext = createContext<CheckoutContextType | undefined>(undefined);

/** Returns the localStorage key for shipping info based on the current user */
function getShippingStorageKey(userId: number | null): string {
  return userId ? `find_checkout_shipping_user_${userId}` : "find_checkout_shipping_guest";
}

export function CheckoutProvider({ children }: { children: ReactNode }) {
  const { user, loading: authLoading } = useAuth();
  const [shippingInfo, setShippingInfoState] = useState<ShippingInfo | null>(null);
  const [isHydrated, setIsHydrated] = useState(false);
  
  // Hardcoded for now based on mockup: 200 Dhs
  const shippingCost = 200;

  // Load shipping info when auth state resolves or user changes
  useEffect(() => {
    if (authLoading) return;

    const userId = user?.id ?? null;
    try {
      const key = getShippingStorageKey(userId);
      const stored = localStorage.getItem(key);
      if (stored) {
        setShippingInfoState(JSON.parse(stored));
      } else {
        setShippingInfoState(null);
      }
    } catch (e) {
      console.error("Failed to load shipping info", e);
      setShippingInfoState(null);
    }
    setIsHydrated(true);
  }, [user, authLoading]);

  const setShippingInfo = (info: ShippingInfo | null) => {
    setShippingInfoState(info);
    const userId = user?.id ?? null;
    const key = getShippingStorageKey(userId);
    if (info) {
      localStorage.setItem(key, JSON.stringify(info));
    } else {
      localStorage.removeItem(key);
    }
  };

  return (
    <CheckoutContext.Provider value={{ shippingInfo, setShippingInfo, shippingCost, isHydrated }}>
      {children}
    </CheckoutContext.Provider>
  );
}

export function useCheckout() {
  const context = useContext(CheckoutContext);
  if (context === undefined) {
    throw new Error("useCheckout must be used within a CheckoutProvider");
  }
  return context;
}
