"use client";

import { useAuth } from "@/components/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import PageTransition from "@/components/PageTransition";
import Link from "next/link";
import { fetchUserOrders, getImageUrl } from "@/lib/api";
import { formatPrice } from "@/lib/formatPrice";
import Image from "next/image";

export default function OrdersPage() {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const router = useRouter();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [authLoading, isAuthenticated, router]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchUserOrders().then(data => {
        setOrders(data);
        setLoading(false);
      }).catch(err => {
        console.error(err);
        setLoading(false);
      });
    }
  }, [isAuthenticated]);

  if (authLoading || !isAuthenticated || loading) {
    return (
      <div className="flex-1 min-h-screen flex items-center justify-center bg-background">
        <div className="w-8 h-8 border-4 border-gray-200 border-t-primary rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <PageTransition>
      <div className="flex-1 min-h-screen bg-background p-6 md:p-12">
        <div className="max-w-5xl mx-auto bg-card rounded-3xl p-8 md:p-12 shadow-sm border border-gray-100">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Order History</h1>
          
          {orders.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center border-2 border-dashed border-gray-100 rounded-3xl">
              <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-6">
                <svg className="w-10 h-10 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
              </div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">No orders yet</h2>
              <p className="text-gray-500 mb-8 max-w-md">
                When you place orders, they will appear here. Start shopping to find your next favorite tech!
              </p>
              <Link 
                href="/products" 
                className="px-8 py-3 bg-primary text-white rounded-xl font-medium hover:bg-primary-hover transition-colors shadow-sm"
              >
                Browse Products
              </Link>
            </div>
          ) : (
            <div className="space-y-6">
              {orders.map((order) => (
                <div key={order.id} className="border border-gray-100 rounded-2xl p-6 bg-white shadow-sm flex flex-col md:flex-row gap-6 justify-between items-start md:items-center">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-lg font-bold text-gray-900">Order #{order.order_number}</span>
                      <span className={`px-2.5 py-1 rounded-md text-[11px] font-medium uppercase tracking-wider ${
                        order.status === 'delivered' || order.status === 'paid' ? 'bg-emerald-50 text-emerald-700' :
                        order.status === 'pending' || order.status === 'processing' ? 'bg-blue-50 text-blue-700' :
                        'bg-gray-100 text-gray-700'
                      }`}>
                        {order.status}
                      </span>
                    </div>
                    <div className="text-sm text-gray-500 mb-4">
                      Placed on {new Date(order.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                    </div>
                    
                    <div className="flex flex-wrap gap-3">
                      {order.items.slice(0, 4).map((item: any) => (
                        <div key={item.id} className="relative w-16 h-16 bg-gray-50 rounded-lg overflow-hidden border border-gray-100">
                           {item.product_variant?.product?.images?.[0]?.url ? (
                             <Image 
                               unoptimized
                               src={getImageUrl(item.product_variant.product.images[0].url)} 
                               alt="Product" 
                               fill 
                               className="object-contain p-2" 
                             />
                           ) : (
                             <div className="w-full h-full flex items-center justify-center text-gray-300">
                               <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                             </div>
                           )}
                           <div className="absolute -top-2 -right-2 w-5 h-5 bg-gray-900 text-white text-[10px] rounded-full flex items-center justify-center font-bold">
                             {item.quantity}
                           </div>
                        </div>
                      ))}
                      {order.items.length > 4 && (
                        <div className="w-16 h-16 bg-gray-50 rounded-lg border border-gray-100 flex items-center justify-center text-sm font-medium text-gray-500">
                          +{order.items.length - 4}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex flex-col md:items-end gap-3 w-full md:w-auto">
                    <div className="text-xl font-bold text-gray-900">
                      {formatPrice(order.total_amount)}
                    </div>
                    <Link 
                      href={`/orders/${order.order_number}`}
                      className="px-6 py-2.5 bg-gray-900 text-white rounded-xl text-sm font-medium hover:bg-gray-800 transition-colors text-center w-full md:w-auto shadow-sm"
                    >
                      View Details
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </PageTransition>
  );
}
