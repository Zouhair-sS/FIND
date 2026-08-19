"use client";

import { useEffect, useState, useRef, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useCart } from "@/components/CartContext";
import { CheckCircle2, XCircle, Loader2 } from "lucide-react";
import axios from "@/lib/axios";

function CallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { clearCart } = useCart();
  
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [errorMessage, setErrorMessage] = useState("");
  
  const processed = useRef(false);

  useEffect(() => {
    if (processed.current) return;
    
    const vendorReference = searchParams.get("vendor_reference");
    const alyaStatus = searchParams.get("status");
    
    if (!vendorReference) {
      setStatus("error");
      setErrorMessage("Invalid payment callback. Missing reference.");
      return;
    }

    if (alyaStatus === "FAILURE" || alyaStatus === "CANCELED") {
      setStatus("error");
      setErrorMessage("Payment was canceled or failed. Please try again.");
      return;
    }

    processed.current = true;

    const verifyPayment = async () => {
      try {
        const res = await axios.post("/api/verify-payment", {
          vendor_reference: vendorReference
        });

        const data = res.data;

        if (data.verified) {
          setStatus("success");
          clearCart();
          setTimeout(() => {
            router.push(`/checkout/success?order=${vendorReference}`);
          }, 2000);
        } else {
          setStatus("error");
          setErrorMessage("Payment verification failed. Your payment may still be pending.");
        }
      } catch (err: any) {
        setStatus("error");
        setErrorMessage(err.message || "An unexpected error occurred during verification.");
      }
    };

    verifyPayment();
  }, [searchParams, router, clearCart]);

  return (
    <div className="max-w-2xl mx-auto py-12 px-6 text-center">
      {status === "loading" && (
        <div className="flex flex-col items-center">
          <Loader2 className="w-16 h-16 text-blue-600 animate-spin mb-6" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Verifying Payment...</h2>
          <p className="text-gray-600">Please wait while we confirm your transaction with AlyaPay.</p>
        </div>
      )}

      {status === "success" && (
        <div className="flex flex-col items-center animate-in fade-in zoom-in duration-500">
          <CheckCircle2 className="w-20 h-20 text-emerald-500 mb-6" />
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Payment Confirmed!</h2>
          <p className="text-gray-600 mb-6">Your order has been successfully placed.</p>
          <p className="text-sm text-gray-500">Redirecting to your order summary...</p>
        </div>
      )}

      {status === "error" && (
        <div className="flex flex-col items-center animate-in fade-in zoom-in duration-300">
          <XCircle className="w-20 h-20 text-red-500 mb-6" />
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Payment Failed</h2>
          <p className="text-gray-600 mb-8">{errorMessage}</p>
          <button 
            onClick={() => router.push("/checkout/payment")}
            className="px-8 py-3 bg-gray-900 text-white rounded-xl font-bold hover:bg-gray-800 transition-colors"
          >
            Try Again
          </button>
        </div>
      )}
    </div>
  );
}

export default function PaymentCallbackPage() {
  return (
    <Suspense fallback={<div className="p-12 text-center text-gray-500">Loading callback...</div>}>
      <CallbackContent />
    </Suspense>
  );
}
