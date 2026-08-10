"use client";

import { useCart } from "./CartContext";
import Image from "next/image";
import Link from "next/link";
import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Trash2 } from "lucide-react";
import { formatPrice } from "@/lib/formatPrice";

export default function CartDrawer() {
  const { isCartOpen, setIsCartOpen, enrichedItems, updateQuantity, removeItem, subtotal, isLoadingPrices } = useCart();

  // Close drawer on escape key
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsCartOpen(false);
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [setIsCartOpen]);

  // Lock body scroll when open
  useEffect(() => {
    if (isCartOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [isCartOpen]);

  return (
    <AnimatePresence>
      {isCartOpen && (
        <>
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.4 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black z-[100]"
            onClick={() => setIsCartOpen(false)}
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: "0%" }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 400, damping: 40 }}
            className="fixed top-0 right-0 h-full w-full max-w-[480px] bg-white shadow-2xl z-[101] flex flex-col rounded-l-2xl overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100 flex-shrink-0">
              <h2 className="text-xl font-bold text-gray-900">Your Cart</h2>
              <button
                onClick={() => setIsCartOpen(false)}
                className="p-2 text-gray-400 hover:text-gray-900 hover:bg-gray-50 rounded-full transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto flex flex-col relative">
              <div className="p-6 flex-1 flex flex-col">
                {enrichedItems.length === 0 ? (
                  <div className="flex-1 flex flex-col items-center justify-center text-center space-y-4 min-h-[300px]">
                    <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center text-gray-300 mb-2">
                      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                      </svg>
                    </div>
                    <p className="text-gray-500 font-medium">Your cart is empty.</p>
                    <button
                      onClick={() => setIsCartOpen(false)}
                      className="text-blue-600 hover:text-blue-700 font-medium text-sm transition-colors"
                    >
                      Continue Shopping
                    </button>
                  </div>
                ) : (
                  <div className="flex-1 flex flex-col">
                    <ul className="space-y-5 flex-1">
                      <AnimatePresence initial={false}>
                        {enrichedItems.map((item) => (
                          <motion.li
                            key={item.variantId}
                            layout
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.2 } }}
                            className="flex gap-4 group"
                          >
                            <div className="relative w-20 h-20 bg-gray-50 rounded-xl overflow-hidden flex-shrink-0 border border-gray-100">
                              {item.cachedImage ? (
                                <Image src={item.cachedImage} alt={item.cachedTitle} fill className="object-contain p-1.5" />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-gray-300">
                                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                  </svg>
                                </div>
                              )}
                            </div>
                            <div className="flex-1 flex flex-col justify-between py-0.5">
                              <div>
                                <div className="flex justify-between items-start">
                                  <Link
                                    href={`/product/${item.productSlug}`}
                                    onClick={() => setIsCartOpen(false)}
                                    className="text-sm font-semibold text-gray-900 hover:text-blue-600 line-clamp-1 pr-4 transition-colors"
                                  >
                                    {item.cachedTitle}
                                  </Link>
                                  <button
                                    onClick={() => removeItem(item.variantId)}
                                    className="text-gray-300 hover:text-red-500 transition-colors -mt-1 -mr-1 p-1"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </div>
                                {item.cachedAttributes && (
                                  <p className="text-xs text-gray-500 mt-0.5">{item.cachedAttributes}</p>
                                )}
                              </div>

                              <div className="flex items-center justify-between mt-2">
                                <div className="flex items-center border border-gray-200 rounded-lg bg-gray-50">
                                  <motion.button
                                    whileTap={{ scale: 0.9 }}
                                    onClick={() => updateQuantity(item.variantId, item.quantity - 1)}
                                    className="w-7 h-7 flex items-center justify-center text-gray-500 hover:text-gray-900 transition-colors"
                                  >
                                    −
                                  </motion.button>
                                  <div className="w-8 text-center text-sm font-medium text-gray-900 overflow-hidden">
                                    <motion.span
                                      key={item.quantity}
                                      initial={{ scale: 1.2, opacity: 0 }}
                                      animate={{ scale: 1, opacity: 1 }}
                                      transition={{ type: "spring", stiffness: 300, damping: 20 }}
                                      className="block"
                                    >
                                      {item.quantity}
                                    </motion.span>
                                  </div>
                                  <motion.button
                                    whileTap={{ scale: 0.9 }}
                                    onClick={() => updateQuantity(item.variantId, item.quantity + 1)}
                                    disabled={item.stock_quantity !== null && item.quantity >= item.stock_quantity}
                                    className="w-7 h-7 flex items-center justify-center text-gray-500 hover:text-gray-900 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                  >
                                    +
                                  </motion.button>
                                </div>

                                <div className="text-sm font-bold text-gray-900">
                                  {isLoadingPrices && item.price === null ? (
                                    <span className="text-gray-300">...</span>
                                  ) : item.price !== null ? (
                                    <>{formatPrice(item.price * item.quantity)} <span className="text-xs font-normal text-gray-400">MAD</span></>
                                  ) : (
                                    <span className="text-red-500 text-xs">Unavailable</span>
                                  )}
                                </div>
                              </div>
                            </div>
                          </motion.li>
                        ))}
                      </AnimatePresence>
                    </ul>

                    {/* Frequently bought together placeholder to fill space */}
                    <div className="mt-8 pt-8 border-t border-gray-100 flex-shrink-0">
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4">
                        Frequently bought together
                      </p>
                      <div className="flex gap-4">
                        <div className="flex-1 flex gap-3">
                          <div className="w-14 h-14 bg-gray-50 rounded-lg flex-shrink-0 border border-gray-100 p-2">
                             <div className="w-full h-full bg-gray-200 rounded-md animate-pulse"></div>
                          </div>
                          <div className="flex flex-col justify-center">
                            <div className="w-24 h-3 bg-gray-200 rounded animate-pulse mb-2"></div>
                            <div className="w-16 h-3 bg-gray-200 rounded animate-pulse"></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Fixed Footer */}
            {enrichedItems.length > 0 && (
              <div className="border-t border-gray-100 p-6 bg-white flex-shrink-0 shadow-[0_-10px_20px_-10px_rgba(0,0,0,0.05)] z-10 relative">
                <div className="flex justify-between items-center mb-6">
                  <span className="text-base font-medium text-gray-600">Subtotal</span>
                  <span className="text-xl font-bold text-gray-900">
                    {isLoadingPrices ? "..." : <>{formatPrice(subtotal)} <span className="text-sm font-normal text-gray-400">MAD</span></>}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <Link
                    href="/cart"
                    onClick={() => setIsCartOpen(false)}
                    className="flex items-center justify-center h-12 px-4 rounded-xl border border-gray-200 bg-white text-gray-900 font-medium hover:bg-gray-50 transition-colors"
                  >
                    View Cart
                  </Link>
                  <Link
                    href="/checkout"
                    onClick={() => setIsCartOpen(false)}
                    className="flex items-center justify-center h-12 px-4 rounded-xl bg-gray-900 text-white font-medium hover:bg-gray-800 transition-colors shadow-lg shadow-gray-900/20"
                  >
                    Checkout
                  </Link>
                </div>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
