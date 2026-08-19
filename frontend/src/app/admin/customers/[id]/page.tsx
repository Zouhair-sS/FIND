"use client";

import { useEffect, useState } from "react";
import { fetchAdminCustomer, getImageUrl } from "@/lib/api";
import { useParams } from "next/navigation";
import { formatPrice } from "@/lib/formatPrice";
import { ChevronLeft, User, Mail, ShoppingBag, Calendar, ArrowRight } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";

function StatusBadge({ status }: { status: string }) {
  const configs: Record<string, string> = {
    pending: "bg-amber-50 text-amber-700 border-amber-100",
    processing: "bg-blue-50 text-blue-700 border-blue-100",
    shipped: "bg-indigo-50 text-indigo-700 border-indigo-100",
    delivered: "bg-emerald-50 text-emerald-700 border-emerald-100",
    canceled: "bg-red-50 text-red-700 border-red-100",
  };
  const c = configs[status] || "bg-gray-50 text-gray-700 border-gray-200";
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold border ${c} capitalize`}>
      {status}
    </span>
  );
}

export default function AdminCustomerDetail() {
  const params = useParams();
  const [data, setData] = useState<{ customer: any; orders: any[] } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAdminCustomer(params.id as string)
      .then((res) => {
        setData(res);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, [params.id]);

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center h-[60vh]">
        <div className="w-5 h-5 border-2 border-primary/20 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  if (!data || !data.customer) {
    return <div className="p-8 text-red-500 text-[13px]">Customer not found.</div>;
  }

  const { customer, orders } = data;

  return (
    <div className="p-6 lg:p-8 max-w-[1400px]">
      <Link
        href="/admin/customers"
        className="inline-flex items-center text-[13px] text-gray-500 hover:text-gray-900 transition-colors mb-5 group"
      >
        <ChevronLeft className="w-3.5 h-3.5 mr-1 group-hover:-translate-x-0.5 transition-transform duration-150" />
        Back to Customers
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Customer Details */}
        <div className="lg:col-span-1 space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm flex flex-col items-center text-center"
          >
            {customer.profile_picture ? (
              <img src={getImageUrl(customer.profile_picture)} alt={customer.name} className="w-20 h-20 rounded-full object-cover mb-4 shadow-sm" />
            ) : (
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center text-[24px] font-bold text-primary mb-4">
                {customer.name?.substring(0, 2).toUpperCase() || "C"}
              </div>
            )}
            <h1 className="text-[18px] font-bold text-gray-900 flex items-center justify-center gap-2">
              {customer.name || "Unknown Customer"}
              {customer.is_guest && (
                <span className="px-1.5 py-0.5 rounded-md bg-gray-100 text-gray-500 text-[10px] font-bold uppercase tracking-wider border border-gray-200">
                  Guest
                </span>
              )}
            </h1>

            <div className="w-full grid grid-cols-2 gap-3 mt-6">
              <div className="bg-gray-50 rounded-xl p-3 border border-gray-100">
                <p className="text-[11px] text-gray-400 font-medium uppercase tracking-wider mb-1">Total Orders</p>
                <p className="text-[16px] font-bold text-gray-900">{customer.orders_count || 0}</p>
              </div>
              <div className="bg-emerald-50 rounded-xl p-3 border border-emerald-100">
                <p className="text-[11px] text-emerald-600 font-medium uppercase tracking-wider mb-1">Total Spent</p>
                <p className="text-[16px] font-bold text-emerald-700">
                  {formatPrice(customer.total_spent || 0)} <span className="text-[10px]">MAD</span>
                </p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm"
          >
            <h2 className="text-[13px] font-semibold text-gray-900 mb-4">Contact Information</h2>
            <div className="space-y-4 text-[13px]">
              <div>
                <p className="text-gray-400 text-[10px] mb-1 font-semibold uppercase tracking-widest">Phone</p>
                <p className="text-gray-900 font-medium">{orders[0]?.customer_phone || "—"}</p>
              </div>
              <div>
                <p className="text-gray-400 text-[10px] mb-1 font-semibold uppercase tracking-widest">Email</p>
                <p className="text-gray-900 font-medium flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-gray-400" />
                  {customer.email || "—"}
                </p>
              </div>
              <div>
                <p className="text-gray-400 text-[10px] mb-1 font-semibold uppercase tracking-widest">Joined</p>
                <p className="text-gray-900 font-medium flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-gray-400" />
                  {new Date(customer.created_at).toLocaleDateString("en-GB", { month: "long", day: "numeric", year: "numeric" })}
                </p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Right Column: Order History */}
        <div className="lg:col-span-2">
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden flex flex-col h-full min-h-[400px]"
          >
            <div className="p-5 border-b border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShoppingBag className="w-4 h-4 text-primary" />
                <h2 className="text-[13px] font-semibold text-gray-900">Order History</h2>
              </div>
              <span className="text-[12px] text-gray-500 font-medium bg-gray-50 px-2 py-1 rounded-md border border-gray-100">
                {orders.length} orders
              </span>
            </div>

            <div className="flex-1 overflow-x-auto">
              {orders.length === 0 ? (
                <div className="p-12 text-center flex flex-col items-center h-full justify-center">
                  <div className="w-12 h-12 rounded-full bg-gray-50 flex items-center justify-center mb-3">
                    <ShoppingBag className="w-5 h-5 text-gray-400" />
                  </div>
                  <p className="text-[14px] font-medium text-gray-900">No orders yet</p>
                  <p className="text-[13px] text-gray-500 mt-1">This customer hasn't placed any orders.</p>
                </div>
              ) : (
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-gray-50/50">
                      <th className="px-5 py-3.5 text-[11px] font-semibold text-gray-500 uppercase tracking-wider border-b border-gray-100">Order</th>
                      <th className="px-5 py-3.5 text-[11px] font-semibold text-gray-500 uppercase tracking-wider border-b border-gray-100">Date</th>
                      <th className="px-5 py-3.5 text-[11px] font-semibold text-gray-500 uppercase tracking-wider border-b border-gray-100">Status</th>
                      <th className="px-5 py-3.5 text-[11px] font-semibold text-gray-500 uppercase tracking-wider border-b border-gray-100 text-right">Total</th>
                      <th className="px-5 py-3.5 border-b border-gray-100"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {orders.map((order) => (
                      <tr key={order.id} className="hover:bg-gray-50/50 transition-colors group">
                        <td className="px-5 py-4">
                          <p className="text-[13px] font-semibold text-gray-900 font-mono">
                            #{order.vendor_reference || order.order_number}
                          </p>
                        </td>
                        <td className="px-5 py-4">
                          <p className="text-[13px] text-gray-600">
                            {new Date(order.created_at).toLocaleDateString("en-GB", { month: "short", day: "numeric", year: "numeric" })}
                          </p>
                        </td>
                        <td className="px-5 py-4">
                          <StatusBadge status={order.status} />
                        </td>
                        <td className="px-5 py-4 text-right">
                          <p className="text-[13px] font-semibold text-gray-900">
                            {formatPrice(order.total_amount)} <span className="text-gray-400 font-medium text-[11px]">{order.currency || "MAD"}</span>
                          </p>
                        </td>
                        <td className="px-5 py-4 text-right">
                          <Link
                            href={`/admin/orders/${order.id}`}
                            className="inline-flex items-center justify-center p-2 rounded-lg text-gray-400 hover:text-primary hover:bg-primary/5 transition-colors"
                          >
                            <ArrowRight className="w-4 h-4" />
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
