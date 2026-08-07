"use client";

import { useCart } from "@/components/CartContext";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Trash2, Check, ChevronDown, ChevronUp, Lock } from "lucide-react";

export default function CartPage() {
  const { enrichedItems, updateQuantity, removeItem, subtotal, isLoadingPrices, itemCount } = useCart();
  const router = useRouter();
  const [promoCode, setPromoCode] = useState("");
  const [isApplyingPromo, setIsApplyingPromo] = useState(false);
  const [promoError, setPromoError] = useState("");
  const [isPromoOpen, setIsPromoOpen] = useState(false);

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
        <motion.div 
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 300, damping: 25 }}
          className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center text-gray-300 mb-6"
        >
          <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
          </svg>
        </motion.div>
        <motion.h1 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="text-3xl font-bold text-gray-900 mb-4"
        >
          Your cart is empty
        </motion.h1>
        <motion.p 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-gray-500 mb-8 max-w-md mx-auto"
        >
          Looks like you haven&apos;t added anything to your cart yet. Discover our latest technology and find what you&apos;re looking for.
        </motion.p>
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <Link 
            href="/" 
            className="inline-flex items-center justify-center px-8 py-4 text-sm font-medium text-white bg-gray-900 rounded-xl hover:bg-gray-800 transition-colors"
          >
            Continue Shopping
          </Link>
        </motion.div>
      </div>
    );
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 300, damping: 24 } }
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-12 md:py-20">
      <div className="flex items-end gap-3 mb-10">
        <h1 className="text-4xl font-bold text-gray-900 tracking-tight">Shopping Cart</h1>
        <span className="text-lg font-medium text-gray-500 mb-1">{itemCount} {itemCount === 1 ? 'item' : 'items'}</span>
      </div>

      <div className="flex flex-col lg:flex-row gap-12 items-start">
        {/* Left: Items */}
        <div className="flex-1 w-full">
          <div className="border-t border-gray-200">
            <motion.ul 
              variants={containerVariants}
              initial="hidden"
              animate="show"
              className="divide-y divide-gray-100"
            >
              <AnimatePresence>
                {enrichedItems.map((item) => (
                  <motion.li 
                    key={item.variantId}
                    layout
                    variants={itemVariants}
                    exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.2 } }}
                    className="py-8 flex flex-col sm:flex-row gap-8 group"
                  >
                    {/* Image */}
                    <div className="w-full sm:w-48 aspect-square bg-gray-50/80 rounded-2xl flex-shrink-0 relative overflow-hidden border border-gray-100/50">
                      {item.cachedImage ? (
                        <Image src={item.cachedImage} alt={item.cachedTitle} fill className="object-contain p-4 mix-blend-multiply" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-300">
                           <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        </div>
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex-1 flex flex-col justify-between py-2">
                      <div>
                        <div className="flex justify-between items-start mb-2">
                          <Link 
                            href={`/product/${item.productSlug}`}
                            className="text-xl font-bold text-gray-900 hover:text-blue-600 transition-colors pr-6"
                          >
                            {item.cachedTitle}
                          </Link>
                          <span className="text-xl font-semibold text-gray-900 whitespace-nowrap">
                            {isLoadingPrices && item.price === null ? "..." : item.price !== null ? `MAD ${Math.round(item.price * item.quantity).toLocaleString()}` : "N/A"}
                          </span>
                        </div>
                        
                        {item.cachedAttributes && (
                          <p className="text-base text-gray-500 mb-3">{item.cachedAttributes}</p>
                        )}

                        <div className="flex items-center text-sm font-medium text-green-700 bg-green-50 px-2.5 py-1 rounded-md w-fit mb-6">
                          <Check className="w-3.5 h-3.5 mr-1" strokeWidth={3} />
                          In stock
                        </div>
                      </div>
                      
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        {/* Quantity */}
                        <div className="flex items-center border border-gray-200 rounded-lg w-fit bg-white">
                          <motion.button 
                            whileTap={{ scale: 0.9 }}
                            onClick={() => updateQuantity(item.variantId, item.quantity - 1)}
                            className="w-10 h-10 flex items-center justify-center text-gray-500 hover:text-gray-900 transition-colors"
                          >
                            −
                          </motion.button>
                          <div className="w-10 text-center font-medium text-gray-900 overflow-hidden">
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
                            className="w-10 h-10 flex items-center justify-center text-gray-500 hover:text-gray-900 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            +
                          </motion.button>
                        </div>

                        <button 
                          onClick={() => removeItem(item.variantId)}
                          className="flex items-center text-sm font-medium text-gray-400 hover:text-red-500 transition-colors gap-1.5"
                        >
                          <Trash2 className="w-4 h-4" />
                          Remove
                        </button>
                      </div>
                    </div>
                  </motion.li>
                ))}
              </AnimatePresence>
            </motion.ul>
          </div>
        </div>

        {/* Right: Summary */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ type: "spring", stiffness: 260, damping: 20, delay: 0.2 }}
          className="w-full lg:w-[420px] bg-gray-50/80 rounded-[2rem] p-8 sticky top-24 border border-gray-100/50"
        >
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Order Summary</h2>
          
          <dl className="space-y-5 text-base text-gray-600 mb-6 border-b border-gray-200 pb-6">
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
            <span className="text-xl font-bold text-gray-900">Total</span>
            <span className="text-3xl font-bold text-gray-900">
              {isLoadingPrices ? "..." : `MAD ${Math.round(total).toLocaleString()}`}
            </span>
          </div>

          <motion.button 
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => router.push('/checkout')}
            className="w-full h-[60px] flex items-center justify-center bg-gray-900 text-white rounded-2xl font-semibold text-lg transition-all shadow-xl shadow-gray-900/10 mb-6 cursor-pointer"
          >
            Proceed to Checkout
          </motion.button>

          <div className="flex justify-center gap-3 items-center mb-6 text-gray-400">
            <div className="h-6 w-10 bg-white border border-gray-200 rounded flex items-center justify-center text-[10px] font-bold text-gray-600">VISA</div>
            <div className="h-6 w-10 bg-white border border-gray-200 rounded flex items-center justify-center">
               <svg viewBox="0 0 38 24" className="w-8 h-4"><path d="M12 12c0-3.3 2-6.1 4.8-7.3a7.8 7.8 0 0 0-4.8-1.7C7.6 3 4.2 6.4 4.2 10.6c0 4.2 3.4 7.6 7.6 7.6 1.8 0 3.5-.7 4.8-1.7-2.8-1.2-4.8-4-4.8-7.3z" fill="#FF5F00"/><path d="M22.6 12c0 4.2-3.4 7.6-7.6 7.6-1.8 0-3.5-.7-4.8-1.7 2.8-1.2 4.8-4 4.8-7.3s-2-6.1-4.8-7.3c1.3-1 3-1.7 4.8-1.7 4.2 0 7.6 3.4 7.6 7.6z" fill="#EB001B"/><path d="M22.6 12c0 3.3-2 6.1-4.8 7.3v-14.6c2.8 1.2 4.8 4 4.8 7.3z" fill="#F79E1B"/></svg>
            </div>
            <div className="h-6 w-12 bg-white border border-gray-200 rounded flex items-center justify-center">
              <svg viewBox="0 0 41 17" className="w-8 h-4 fill-gray-900"><path d="M18.8 4.2H17l-1 5.3h1.8l1-5.3zm4.5 5.3h1.9l.4-2c.1-.4 0-.8-.3-.8-.3-.1-.6 0-.8.3l-.2 1.2h-1l.2-1.2c.4-2.1 2.3-2.3 3.6-1.7.9.4 1.3 1.3 1.1 2.4l-.5 2.6H26l.4-1.9c.1-.7 0-1.1-.5-1.1-.5 0-.9.4-1 1l-.4 2zm5.7-4.4l-1 5.2h-1.8l1-5.2h1.8zm3.2 2.9l-1 2.4h1.9l1-2.4h-1.9zm-2.8-2.9l-.6 3L28 9.5h1.9l.3-1.4 1.1 1.4h2.2L32 6.6c-.1-.1-.3-.2-.4-.2-.5 0-.8.5-1 1l-.4 1.9-1.2-1.5h-2v.1h.4zM16 4.2h-3c-.6 0-1.1.4-1.3 1l-1 5h1.8l.3-1.4h2.1l.1 1.4h1.8L16 4.2zm-2.5 3.3l.6-2.8h.2l.6 2.8h-1.4zm-4.7-3.3h-1.9l-1 5.2h1.8l1-5.2zm-1.8 0h-3c-.6 0-1.1.4-1.3 1l-1 5h1.8l.3-1.4h2.1l.1 1.4h1.8L7 4.2zm-2.5 3.3l.6-2.8h.2l.6 2.8H4.5z"/></svg>
            </div>
          </div>

          <div className="flex flex-col items-center gap-1.5 mb-8 text-[11px] text-gray-500 uppercase tracking-wide font-semibold">
            <div className="flex items-center gap-1.5 text-gray-600">
               <Lock className="w-3.5 h-3.5" />
               Secure Checkout
            </div>
            <div>Powered by AlyaPay</div>
          </div>

          {/* Promo Code Toggle */}
          <div className="border-t border-gray-200 pt-6">
            <button 
              onClick={() => setIsPromoOpen(!isPromoOpen)}
              className="flex items-center justify-between w-full text-left font-medium text-gray-900 hover:text-blue-600 transition-colors"
            >
              Have a promo code?
              {isPromoOpen ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
            </button>

            <AnimatePresence>
              {isPromoOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden"
                >
                  <form onSubmit={handleApplyPromo} className="flex gap-2 mt-4">
                    <input 
                      type="text" 
                      value={promoCode}
                      onChange={(e) => setPromoCode(e.target.value)}
                      placeholder="Promo Code" 
                      className="flex-1 px-4 py-3.5 bg-white border border-gray-200 rounded-xl text-sm outline-none focus:border-gray-900 transition-colors"
                    />
                    <button 
                      type="submit"
                      disabled={!promoCode.trim() || isApplyingPromo}
                      className="px-6 py-3.5 bg-gray-100 border border-transparent rounded-xl text-sm font-medium text-gray-900 hover:bg-gray-200 transition-colors disabled:opacity-50"
                    >
                      {isApplyingPromo ? "..." : "Apply"}
                    </button>
                  </form>
                  {promoError && <p className="text-red-500 text-xs mt-2">{promoError}</p>}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

        </motion.div>
      </div>
    </div>
  );
}
