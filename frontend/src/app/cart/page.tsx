"use client";

import { useCart } from "@/components/CartContext";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

export default function CartPage() {
  const { enrichedItems, updateQuantity, removeItem, subtotal, isLoadingPrices, itemCount } = useCart();
  const [promoCode, setPromoCode] = useState("");
  const [isApplyingPromo, setIsApplyingPromo] = useState(false);
  const [promoError, setPromoError] = useState("");

  const shipping = subtotal > 0 ? (subtotal > 5000 ? 0 : 50) : 0; 
  const taxRate = 0.20; // 20% VAT
  const tax = subtotal * taxRate;
  const total = subtotal + shipping + tax;

  const handleApplyPromo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!promoCode.trim()) return;
    setIsApplyingPromo(true);
    setPromoError("");
    setTimeout(() => {
      setIsApplyingPromo(false);
      setPromoError("Invalid or expired promo code.");
    }, 1000);
  };

  if (itemCount === 0) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-20 min-h-[60vh] flex flex-col items-center justify-center text-center">
        <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center text-gray-300 mb-6">
          <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
          </svg>
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Your cart is empty</h1>
        <p className="text-gray-500 mb-8 max-w-md mx-auto">
          Looks like you haven&apos;t added anything to your cart yet. Discover our latest technology and find what you&apos;re looking for.
        </p>
        <Link 
          href="/" 
          className="inline-flex items-center justify-center px-8 py-4 text-sm font-medium text-white bg-gray-900 rounded-xl hover:bg-gray-800 transition-colors"
        >
          Continue Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-12 md:py-20">
      <h1 className="text-3xl font-bold text-gray-900 mb-10">Review Your Bag.</h1>

      <div className="flex flex-col lg:flex-row gap-12 items-start">
        {/* Left: Items */}
        <div className="flex-1 w-full">
          <div className="border-t border-gray-100">
            <ul className="divide-y divide-gray-100">
              {enrichedItems.map((item) => (
                <li key={item.variantId} className="py-8 flex flex-col sm:flex-row gap-6">
                  {/* Image */}
                  <div className="w-full sm:w-40 aspect-square bg-gray-50 rounded-2xl flex-shrink-0 relative overflow-hidden border border-gray-100/50">
                    {item.cachedImage ? (
                      <Image src={item.cachedImage} alt={item.cachedTitle} fill className="object-contain p-4" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-300">
                         <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-start mb-2">
                        <Link 
                          href={`/product/${item.productSlug}`}
                          className="text-lg font-bold text-gray-900 hover:text-blue-600 transition-colors"
                        >
                          {item.cachedTitle}
                        </Link>
                        <span className="text-lg font-semibold text-gray-900 whitespace-nowrap ml-4">
                          {isLoadingPrices && item.price === null ? "..." : item.price !== null ? `MAD ${Math.round(item.price * item.quantity).toLocaleString()}` : "N/A"}
                        </span>
                      </div>
                      
                      {item.cachedAttributes && (
                        <p className="text-sm text-gray-500 mb-4">{item.cachedAttributes}</p>
                      )}
                    </div>
                    
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      {/* Quantity */}
                      <div className="flex items-center border border-gray-200 rounded-lg w-fit">
                        <button 
                          onClick={() => updateQuantity(item.variantId, item.quantity - 1)}
                          className="w-10 h-10 flex items-center justify-center text-gray-500 hover:text-gray-900 transition-colors"
                        >
                          −
                        </button>
                        <span className="w-10 text-center text-sm font-medium text-gray-900">{item.quantity}</span>
                        <button 
                          onClick={() => updateQuantity(item.variantId, item.quantity + 1)}
                          disabled={item.stock_quantity !== null && item.quantity >= item.stock_quantity}
                          className="w-10 h-10 flex items-center justify-center text-gray-500 hover:text-gray-900 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          +
                        </button>
                      </div>

                      <button 
                        onClick={() => removeItem(item.variantId)}
                        className="text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Right: Summary */}
        <div className="w-full lg:w-[400px] bg-gray-50/80 rounded-3xl p-8 sticky top-24">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Order Summary</h2>
          
          <dl className="space-y-4 text-sm text-gray-600 mb-6 border-b border-gray-200 pb-6">
            <div className="flex justify-between">
              <dt>Subtotal</dt>
              <dd className="font-medium text-gray-900">
                {isLoadingPrices ? "..." : `MAD ${Math.round(subtotal).toLocaleString()}`}
              </dd>
            </div>
            <div className="flex justify-between">
              <dt>Estimated Shipping</dt>
              <dd className="font-medium text-gray-900">
                {isLoadingPrices ? "..." : shipping === 0 ? "Free" : `MAD ${shipping.toLocaleString()}`}
              </dd>
            </div>
            <div className="flex justify-between">
              <dt>Estimated Tax (20%)</dt>
              <dd className="font-medium text-gray-900">
                {isLoadingPrices ? "..." : `MAD ${Math.round(tax).toLocaleString()}`}
              </dd>
            </div>
          </dl>

          <div className="flex justify-between items-center mb-8">
            <span className="text-lg font-bold text-gray-900">Total</span>
            <span className="text-2xl font-bold text-gray-900">
              {isLoadingPrices ? "..." : `MAD ${Math.round(total).toLocaleString()}`}
            </span>
          </div>

          <button className="w-full py-4 px-6 bg-gray-900 text-white rounded-xl font-semibold hover:bg-gray-800 transition-all active:scale-[0.98] mb-6">
            Proceed to Checkout
          </button>

          {/* Promo Code */}
          <div>
            <form onSubmit={handleApplyPromo} className="flex gap-2">
              <input 
                type="text" 
                value={promoCode}
                onChange={(e) => setPromoCode(e.target.value)}
                placeholder="Promo Code" 
                className="flex-1 px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm outline-none focus:border-gray-900 transition-colors"
              />
              <button 
                type="submit"
                disabled={!promoCode.trim() || isApplyingPromo}
                className="px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-900 hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                {isApplyingPromo ? "Applying..." : "Apply"}
              </button>
            </form>
            {promoError && <p className="text-red-500 text-xs mt-2">{promoError}</p>}
          </div>

          <div className="mt-8 flex items-center justify-center gap-2 text-xs text-gray-400">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            Secure Checkout
          </div>
        </div>
      </div>
    </div>
  );
}
