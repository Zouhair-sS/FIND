"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/components/AuthContext";
import PageTransition from "@/components/PageTransition";
import axios from "@/lib/axios";
import { formatPrice } from "@/lib/formatPrice";
import { getImageUrl } from "@/lib/api";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, Package, Truck, CreditCard } from "lucide-react";

export default function OrderDetailsPage() {
  const { id } = useParams();
  const { isAuthenticated, loading: authLoading } = useAuth();
  const router = useRouter();
  
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [authLoading, isAuthenticated, router]);

  useEffect(() => {
    if (isAuthenticated && id) {
      axios.get(`/api/orders/${id}`)
        .then(res => {
          setOrder(res.data);
          setLoading(false);
        })
        .catch(err => {
          console.error(err);
          setError("Failed to load order details.");
          setLoading(false);
        });
    }
  }, [isAuthenticated, id]);

  if (authLoading || !isAuthenticated || loading) {
    return (
      <div className="flex-1 min-h-[60vh] flex items-center justify-center bg-background">
        <div className="w-8 h-8 border-4 border-gray-200 border-t-primary rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="flex-1 min-h-[60vh] flex flex-col items-center justify-center bg-background">
        <h2 className="text-xl font-bold text-gray-900 mb-2">Order Not Found</h2>
        <p className="text-gray-500 mb-6">{error || "We couldn't find the order you're looking for."}</p>
        <Link href="/orders" className="px-6 py-2 bg-gray-900 text-white rounded-xl font-medium hover:bg-gray-800">
          Back to Orders
        </Link>
      </div>
    );
  }

  return (
    <PageTransition>
      <div className="flex-1 min-h-screen bg-background p-6 md:p-12">
        <div className="max-w-4xl mx-auto space-y-6">
          <Link href="/orders" className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-gray-900 mb-2 transition-colors">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Orders
          </Link>
          
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Order Details</h1>
              <p className="text-gray-500 mt-1">Order #{order.order_number}</p>
            </div>
            <div className={`inline-flex items-center px-3 py-1.5 rounded-lg text-sm font-bold uppercase tracking-wider ${
              order.status === 'delivered' || order.status === 'paid' ? 'bg-emerald-100 text-emerald-800' :
              order.status === 'pending' || order.status === 'processing' ? 'bg-blue-100 text-blue-800' :
              'bg-gray-100 text-gray-800'
            }`}>
              {order.status}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
            {/* Main Content - Left Column (Items) */}
            <div className="md:col-span-2 space-y-6">
              <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-gray-100">
                <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                  <Package className="w-5 h-5 mr-2 text-gray-400" />
                  Order Items
                </h2>
                
                <div className="space-y-6">
                  {order.items.map((item: any) => (
                    <div key={item.id} className="flex gap-4 pb-6 border-b border-gray-100 last:border-0 last:pb-0">
                      <div className="w-24 h-24 bg-gray-50 rounded-2xl flex-shrink-0 relative overflow-hidden border border-gray-100">
                        {item.product_variant?.product?.images?.[0]?.url ? (
                          <Image 
                            unoptimized
                            src={getImageUrl(item.product_variant.product.images[0].url)} 
                            alt={item.product_variant.product.name} 
                            fill 
                            className="object-contain p-2" 
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-300">
                            <Package className="w-8 h-8" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 flex flex-col justify-center">
                        <h3 className="font-bold text-gray-900 line-clamp-2">
                          {item.product_variant?.product?.name || "Unknown Product"}
                        </h3>
                        <p className="text-sm text-gray-500 mt-1 mb-2">
                          {item.product_variant?.configuration?.color && `Color: ${item.product_variant.configuration.color}`}
                        </p>
                        <div className="flex justify-between items-center mt-auto">
                          <span className="text-gray-600">Qty: {item.quantity}</span>
                          <span className="font-bold text-gray-900">{formatPrice(item.unit_price)}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Sidebar - Right Column (Summary & Details) */}
            <div className="space-y-6">
              {/* Order Summary */}
              <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-gray-100">
                <h2 className="text-xl font-bold text-gray-900 mb-6">Summary</h2>
                <div className="space-y-4">
                  <div className="flex justify-between text-gray-600">
                    <span>Subtotal</span>
                    <span>{formatPrice(order.total_amount)}</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Shipping</span>
                    <span>Free</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Tax</span>
                    <span>Included</span>
                  </div>
                  <div className="pt-4 border-t border-gray-100 flex justify-between items-center">
                    <span className="font-bold text-gray-900">Total</span>
                    <span className="text-2xl font-extrabold text-gray-900">{formatPrice(order.total_amount)}</span>
                  </div>
                </div>
              </div>

              {/* Shipping Info */}
              <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-gray-100">
                <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                  <Truck className="w-5 h-5 mr-2 text-gray-400" />
                  Shipping
                </h2>
                <div className="text-gray-600 space-y-1 text-sm">
                  <p className="font-medium text-gray-900">{order.customer_name || `${order.customer_first_name} ${order.customer_last_name}`}</p>
                  <p>{order.shipping_address}</p>
                  <p>{order.shipping_city}</p>
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>
    </PageTransition>
  );
}
