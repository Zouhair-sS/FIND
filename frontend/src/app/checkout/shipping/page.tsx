"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useCheckout } from "@/components/CheckoutContext";
import { useCart } from "@/components/CartContext";
import { formatPrice } from "@/lib/formatPrice";
import { ChevronDown, ChevronUp, CheckCircle2, Pencil } from "lucide-react";
import Image from "next/image";

export default function ShippingPage() {
  const router = useRouter();
  const { shippingInfo, setShippingInfo, shippingCost } = useCheckout();
  const { enrichedItems, subtotal } = useCart();
  
  // Local form state
  const [phone, setPhone] = useState(shippingInfo?.phone ?? "");
  const [firstName, setFirstName] = useState(shippingInfo?.firstName ?? "");
  const [lastName, setLastName] = useState(shippingInfo?.lastName ?? "");
  const [city, setCity] = useState(shippingInfo?.city ?? "");
  const [address, setAddress] = useState(shippingInfo?.address ?? "");
  const [addressDetails, setAddressDetails] = useState(shippingInfo?.addressDetails ?? "");
  const [zipCode, setZipCode] = useState(shippingInfo?.zipCode ?? "");

  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(true); // Default to open, sync after hydration
  const [isRecapOpen, setIsRecapOpen] = useState(true);
  const [shouldRedirect, setShouldRedirect] = useState(false);

  // Sync form state when context hydrates
  React.useEffect(() => {
    if (shippingInfo) {
      setPhone(shippingInfo.phone);
      setFirstName(shippingInfo.firstName);
      setLastName(shippingInfo.lastName);
      setCity(shippingInfo.city);
      setAddress(shippingInfo.address);
      setAddressDetails(shippingInfo.addressDetails || "");
      setZipCode(shippingInfo.zipCode || "");
      setIsFormOpen(false);
    }
  }, [shippingInfo]);

  // Wait for state to actually flush to context before navigating
  React.useEffect(() => {
    if (shouldRedirect && shippingInfo) {
      router.push("/checkout/payment");
    }
  }, [shouldRedirect, shippingInfo, router]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setHasSubmitted(true);

    if (!phone || !firstName || !lastName || !city || !address) {
      return;
    }

    setShippingInfo({
      phone, firstName, lastName, city, address, addressDetails, zipCode
    });
    setIsFormOpen(false);
  };

  const handleProceed = () => {
    if (!shippingInfo) {
      // Trigger validation if they try to proceed without saving
      setHasSubmitted(true);
      if (!phone || !firstName || !lastName || !city || !address) {
        setIsFormOpen(true);
        return;
      }
      setShippingInfo({
        phone, firstName, lastName, city, address, addressDetails, zipCode
      });
    }
    setShouldRedirect(true);
  };

  return (
    <div className="max-w-3xl mx-auto w-full px-6">
      
      {/* Address Section */}
      <div className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          {isFormOpen ? "Add an address" : "Shipping"}
        </h2>
        
        {!isFormOpen && (
          <p className="text-gray-500 mb-6">Select your delivery method</p>
        )}

        <AnimatePresence mode="wait">
          {isFormOpen ? (
            <motion.form 
              key="form"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              onSubmit={handleSubmit}
              className="space-y-6"
            >
              {/* Fields */}
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-900 mb-1">Phone Number *</label>
                  <input type="tel" value={phone} onChange={e => setPhone(e.target.value)} className={`w-full px-4 py-3 rounded-xl border focus:outline-none focus:ring-2 focus:ring-gray-900/20 transition-all text-sm ${hasSubmitted && !phone ? 'border-red-500' : 'border-gray-200 focus:border-gray-900'}`} placeholder="0600000000" />
                  {hasSubmitted && !phone && <p className="text-xs font-semibold text-red-500 mt-1">Required for the delivery of your order.</p>}
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-900 mb-1">First Name *</label>
                  <input type="text" value={firstName} onChange={e => setFirstName(e.target.value)} className={`w-full px-4 py-3 rounded-xl border focus:outline-none focus:ring-2 focus:ring-gray-900/20 transition-all text-sm ${hasSubmitted && !firstName ? 'border-red-500' : 'border-gray-200 focus:border-gray-900'}`} />
                  {hasSubmitted && !firstName && <p className="text-xs font-semibold text-red-500 mt-1">Required for the delivery of your order.</p>}
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-900 mb-1">Last Name *</label>
                  <input type="text" value={lastName} onChange={e => setLastName(e.target.value)} className={`w-full px-4 py-3 rounded-xl border focus:outline-none focus:ring-2 focus:ring-gray-900/20 transition-all text-sm ${hasSubmitted && !lastName ? 'border-red-500' : 'border-gray-200 focus:border-gray-900'}`} />
                  {hasSubmitted && !lastName && <p className="text-xs font-semibold text-red-500 mt-1">Required for the delivery of your order.</p>}
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-900 mb-1">City *</label>
                  <input type="text" value={city} onChange={e => setCity(e.target.value)} className={`w-full px-4 py-3 rounded-xl border focus:outline-none focus:ring-2 focus:ring-gray-900/20 transition-all text-sm ${hasSubmitted && !city ? 'border-red-500' : 'border-gray-200 focus:border-gray-900'}`} placeholder="Select a city" />
                  {hasSubmitted && !city && <p className="text-xs font-semibold text-red-500 mt-1">Required for the delivery of your order.</p>}
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-900 mb-1">Address *</label>
                  <input type="text" value={address} onChange={e => setAddress(e.target.value)} className={`w-full px-4 py-3 rounded-xl border focus:outline-none focus:ring-2 focus:ring-gray-900/20 transition-all text-sm ${hasSubmitted && !address ? 'border-red-500' : 'border-gray-200 focus:border-gray-900'}`} placeholder="Ex: 5 rue du printemps" />
                  {hasSubmitted && !address && <p className="text-xs font-semibold text-red-500 mt-1">Required for the delivery of your order.</p>}
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-900 mb-1">Address Details (Floor, neighborhood)</label>
                  <input type="text" value={addressDetails} onChange={e => setAddressDetails(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-900/20 focus:border-gray-900 transition-all text-sm" placeholder="Apartment number, building..." />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-900 mb-1">Zip Code</label>
                  <input type="text" value={zipCode} onChange={e => setZipCode(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-900/20 focus:border-gray-900 transition-all text-sm w-1/2" placeholder="Zip code" />
                </div>
              </div>

              <div className="flex justify-end pt-4">
                <button type="submit" className="px-8 py-3.5 bg-gray-900 text-white rounded-xl font-bold hover:bg-gray-800 transition-colors shadow-lg shadow-gray-900/20">
                  Save Address
                </button>
              </div>
            </motion.form>
          ) : (
            <motion.div 
              key="saved-card"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-1 h-full bg-teal-600" />
              <div className="flex items-start gap-4">
                <div className="mt-1">
                  <CheckCircle2 className="w-6 h-6 text-teal-600" />
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="font-bold text-gray-900">Home Delivery</h3>
                      <p className="text-sm text-gray-500">Delivered in 4 to 6 days</p>
                    </div>
                    <div className="text-right">
                      <span className="font-bold text-gray-900">{shippingCost} MAD</span>
                    </div>
                  </div>
                  
                  <div className="text-sm text-gray-600 space-y-1 mb-6">
                    <p>Ship to <span className="font-semibold text-gray-900">{shippingInfo?.firstName} {shippingInfo?.lastName}</span></p>
                    <p>{shippingInfo?.address}</p>
                    {shippingInfo?.addressDetails && <p>{shippingInfo?.addressDetails}</p>}
                    <p>{shippingInfo?.city}, Morocco, {shippingInfo?.zipCode}</p>
                    <p className="pt-2 text-xs">T: {shippingInfo?.phone}</p>
                  </div>

                  <button 
                    onClick={() => setIsFormOpen(true)}
                    type="button"
                    className="flex items-center gap-2 text-sm font-semibold text-gray-900 hover:text-gray-600 transition-colors"
                  >
                    <Pencil className="w-4 h-4" />
                    Edit address
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Product Recap */}
      <div className="mb-12">
        <button 
          onClick={() => setIsRecapOpen(!isRecapOpen)}
          type="button"
          className="flex items-center justify-between w-full pb-4 border-b border-gray-200"
        >
          <h2 className="text-2xl font-bold text-gray-900">Product Recap</h2>
          {isRecapOpen ? <ChevronUp className="w-6 h-6" /> : <ChevronDown className="w-6 h-6" />}
        </button>

        <AnimatePresence>
          {isRecapOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="pt-6 font-semibold text-gray-900 mb-4">{enrichedItems.length} Item(s)</div>
              <ul className="space-y-6">
                {enrichedItems.map((item) => (
                  <li key={`${item.productId}-${item.variantId}`} className="flex gap-4">
                    <div className="w-20 h-20 bg-gray-50 rounded-xl border border-gray-100 flex items-center justify-center p-2 flex-shrink-0">
                      {item.cachedImage ? (
                        <Image src={item.cachedImage} alt={item.cachedTitle || 'Product'} width={60} height={60} className="object-contain" />
                      ) : (
                         <div className="w-10 h-10 bg-gray-200 rounded-full" />
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-start">
                        <h4 className="font-bold text-gray-900 text-sm mb-1">{item.cachedTitle}</h4>
                        <span className="font-bold text-gray-900 text-sm whitespace-nowrap">
                          {item.price ? `${formatPrice(item.price * item.quantity)} MAD` : "..."}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 mb-1">SKU: {item.productSlug}</p>
                      <p className="text-xs text-gray-500">Quantity: {item.quantity}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Footer Actions */}
      <div className="flex flex-col-reverse sm:flex-row items-center justify-between gap-4 pt-6 border-t border-gray-200">
        <Link href="/cart" className="text-sm font-semibold text-gray-600 hover:text-gray-900 underline underline-offset-4">
          Back to cart
        </Link>
        <button 
          type="button"
          onClick={handleProceed}
          className="w-full sm:w-auto px-8 py-4 bg-teal-900 text-white rounded-xl font-bold hover:bg-teal-800 transition-colors shadow-lg shadow-teal-900/20"
        >
          Proceed to payment
        </button>
      </div>

    </div>
  );
}
