"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";

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

export function CheckoutProvider({ children }: { children: ReactNode }) {
  const [shippingInfo, setShippingInfoState] = useState<ShippingInfo | null>(null);
  const [isHydrated, setIsHydrated] = useState(false);
  
  // Hardcoded for now based on mockup: 200 Dhs
  const shippingCost = 200;

  useEffect(() => {
    try {
      const stored = localStorage.getItem("find_checkout_shipping");
      if (stored) {
        setShippingInfoState(JSON.parse(stored));
      }
    } catch (e) {
      console.error("Failed to load shipping info", e);
    }
    setIsHydrated(true);
  }, []);

  const setShippingInfo = (info: ShippingInfo | null) => {
    setShippingInfoState(info);
    if (info) {
      localStorage.setItem("find_checkout_shipping", JSON.stringify(info));
    } else {
      localStorage.removeItem("find_checkout_shipping");
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
