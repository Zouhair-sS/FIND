"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useCheckout } from "@/components/CheckoutContext";
import { useCart } from "@/components/CartContext";
import { formatPrice } from "@/lib/formatPrice";
import Image from "next/image";
import axios from "@/lib/axios";

export default function PaymentPage() {
  const router = useRouter();
  const { shippingInfo, shippingCost, isHydrated } = useCheckout();
  const { items, subtotal, isLoadingPrices, clearCart } = useCart();

  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState("");

  // Redirect to shipping if no address is set, but only AFTER hydration is complete
  useEffect(() => {
    if (isHydrated && !shippingInfo) {
      router.push("/checkout/shipping");
    }
  }, [isHydrated, shippingInfo, router]);

  // Don't render until hydration is complete to prevent layout shifts or flashing
  if (!isHydrated || !shippingInfo) return null;

  const total = subtotal + shippingCost;

  const handleConfirmOrder = async () => {
    setIsProcessing(true);
    setError("");

    try {
      const payload = {
        items: items.map(item => ({
          product_variant_id: item.variantId,
          quantity: item.quantity,
        })),
        customer_first_name: shippingInfo.firstName,
        customer_last_name: shippingInfo.lastName,
        customer_phone: shippingInfo.phone,
        customer_email: shippingInfo.email || "",
        shipping_address: shippingInfo.address + (shippingInfo.addressDetails ? `, ${shippingInfo.addressDetails}` : ''),
        shipping_city: shippingInfo.city,
      };

      const res = await axios.post("/api/checkout", payload);
      const data = res.data;
      
      if (data.checkout_url) {
        window.location.href = data.checkout_url;
      } else {
        throw new Error("No checkout URL returned");
      }
    } catch (err: any) {
      setError(err.response?.data?.error || err.message);
      setIsProcessing(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto w-full px-6">
      
      {/* Billing Address Section */}
      <div className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">Billing Address</h2>
        
        <div className="bg-gray-100 rounded-2xl p-6 relative">
          <div className="flex justify-between items-start mb-6">
            <h3 className="font-bold text-gray-900">Billed to {shippingInfo.firstName} {shippingInfo.lastName}</h3>
            <Link href="/checkout/shipping" className="text-sm font-semibold text-gray-900 hover:text-gray-600 underline underline-offset-4">
              Edit
            </Link>
          </div>
          
          <div className="text-sm text-gray-600 space-y-1">
            <p>{shippingInfo.address}</p>
            {shippingInfo.addressDetails && <p>{shippingInfo.addressDetails}</p>}
            <p className="font-bold text-gray-900 mt-2">{shippingInfo.city}</p>
          </div>
        </div>
      </div>

      {/* Payment Method Section */}
      <div className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">Choose Payment Method</h2>
        
        <div className="space-y-4">
          <div className="border-2 border-blue-700 bg-white rounded-2xl p-6 shadow-xl shadow-blue-900/5 relative overflow-hidden transition-all">
            
            <div className="flex flex-col sm:flex-row items-start gap-4 sm:gap-6 mb-6">
              <div className="flex items-center gap-4 mt-1 shrink-0">
                <div className="w-5 h-5 rounded-full border-4 border-blue-700 shadow-sm flex items-center justify-center">
                  <div className="w-2 h-2 rounded-full bg-blue-700" />
                </div>
                <div className="h-7 w-[90px] relative">
                  <Image src="/images/AlyaPay Icon/alyaIcon.svg" alt="AlyaPay" fill className="object-contain object-left" />
                </div>
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-[17px] text-gray-900 mb-1.5">AlyaPay - payez jusqu'à en 4 fois</h3>
                <p className="text-gray-600 text-[14px] leading-relaxed mb-1">Payez votre commande en 2x, 3x ou jusqu'à 4x, sans frais, sans intérêts.</p>
                <p className="text-gray-600 text-[14px] leading-relaxed">Réponse instantanée, simple et sans paperasse.</p>
              </div>
            </div>

            <div className="mt-6 mb-6">
              {!isLoadingPrices && total > 0 && (
                <div className="bg-gray-50/80 border border-gray-100 rounded-xl p-4">
                  <alya-placement
                    key={`checkout-${total}`}
                    price={total}
                    currency="MAD"
                    lang="fr"
                    installments="4"
                    variant="interactive"
                    theme="light-plain"
                    detail="panel"
                    logo-position="left"
                  />
                </div>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-4 sm:gap-8 mt-6">
              <div className="flex items-center gap-2 text-sm text-gray-700 font-medium">
                <div className="w-5 h-5 rounded-full bg-blue-50 flex items-center justify-center">
                  <svg className="w-3.5 h-3.5 text-blue-700" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>
                </div>
                Sans frais cachés
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-700 font-medium">
                <div className="w-5 h-5 rounded-full bg-blue-50 flex items-center justify-center">
                  <svg className="w-3.5 h-3.5 text-blue-700" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>
                </div>
                0% d'intérêts
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-700 font-medium">
                <div className="w-5 h-5 rounded-full bg-blue-50 flex items-center justify-center">
                  <svg className="w-3.5 h-3.5 text-blue-700" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>
                </div>
                Paiement facile
              </div>
            </div>

            <div className="flex items-center gap-3 mt-6 pt-6 border-t border-gray-100">
              <div className="h-6 w-10 bg-blue-900 rounded text-[10px] text-white font-bold flex items-center justify-center italic tracking-wider">VISA</div>
              <div className="h-6 w-10 flex items-center justify-center relative">
                <div className="w-4 h-4 rounded-full bg-red-500 absolute left-1 mix-blend-multiply opacity-90"></div>
                <div className="w-4 h-4 rounded-full bg-yellow-500 absolute right-1 mix-blend-multiply opacity-90"></div>
              </div>
              <div className="h-6 w-10 text-red-600 font-bold text-xs flex items-center justify-center tracking-tighter">CMI</div>
            </div>

          </div>
          
          {/* Faded/Disabled traditional methods */}
          <div className="border border-gray-200 bg-gray-50/50 rounded-2xl p-6 opacity-60 pointer-events-none flex items-center gap-4">
            <div className="w-5 h-5 rounded-full border-2 border-gray-300 flex-shrink-0" />
            <div className="font-bold text-gray-500">Carte Bancaire</div>
          </div>
          <div className="border border-gray-200 bg-gray-50/50 rounded-2xl p-6 opacity-60 pointer-events-none flex items-center gap-4">
            <div className="w-5 h-5 rounded-full border-2 border-gray-300 flex-shrink-0" />
            <div className="font-bold text-gray-500">Virement Bancaire</div>
          </div>
        </div>
      </div>
      
      {error && (
        <div className="mb-6 p-4 bg-red-50 text-red-700 border border-red-200 rounded-xl text-sm font-medium">
          {error}
        </div>
      )}

      {/* Footer Actions */}
      <div className="flex flex-col-reverse sm:flex-row items-center justify-between gap-4 pt-6 border-t border-gray-200">
        <Link href="/checkout/shipping" className="text-sm font-semibold text-gray-600 hover:text-gray-900 underline underline-offset-4">
          Back to shipping
        </Link>
        <button 
          onClick={handleConfirmOrder}
          disabled={isLoadingPrices || isProcessing}
          className="w-full sm:w-auto px-10 py-4 bg-teal-900 text-white rounded-xl font-bold hover:bg-teal-800 transition-colors shadow-lg shadow-teal-900/20 disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {isProcessing ? (
            <>
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Processing...
            </>
          ) : (
            "Confirm Order"
          )}
        </button>
      </div>

    </div>
  );
}
