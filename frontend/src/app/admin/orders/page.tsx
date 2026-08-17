"use client";

import { useEffect, useState } from "react";
import { fetchAdminOrders } from "@/lib/api";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { formatPrice } from "@/lib/formatPrice";
import { motion } from "framer-motion";

const statusColors: Record<string, { bg: string; text: string; dot: string }> = {
  pending: { bg: "bg-amber-50", text: "text-amber-700", dot: "bg-amber-500" },
  processing: { bg: "bg-blue-50", text: "text-blue-700", dot: "bg-blue-500" },
  shipped: { bg: "bg-indigo-50", text: "text-indigo-700", dot: "bg-indigo-500" },
  delivered: { bg: "bg-emerald-50", text: "text-emerald-700", dot: "bg-emerald-500" },
  approved: { bg: "bg-emerald-50", text: "text-emerald-700", dot: "bg-emerald-500" },
  paid: { bg: "bg-emerald-50", text: "text-emerald-700", dot: "bg-emerald-500" },
  failed: { bg: "bg-red-50", text: "text-red-700", dot: "bg-red-500" },
  canceled: { bg: "bg-red-50", text: "text-red-700", dot: "bg-red-500" },
  expired: { bg: "bg-gray-100", text: "text-gray-700", dot: "bg-gray-500" },
};

function StatusBadge({ status }: { status: string }) {
  const colors = statusColors[status] || statusColors.pending;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium ${colors.bg} ${colors.text}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${colors.dot}`} />
      {status}
    </span>
  );
}

export default function AdminOrders() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAdminOrders()
      .then((data) => {
        setOrders(data.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  return (
    <div className="p-6 lg:p-8 max-w-[1400px]">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 tracking-[-0.02em]">Orders</h1>
        <p className="text-[13px] text-gray-500 mt-1">Manage customer orders and fulfillment status</p>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25, ease: [0.23, 1, 0.32, 1] }}
        className="bg-white border border-gray-100 rounded-xl overflow-hidden shadow-sm"
      >
        {loading ? (
          <div className="p-12 flex items-center justify-center">
            <div className="w-5 h-5 border-2 border-primary/20 border-t-primary rounded-full animate-spin" />
          </div>
        ) : orders.length === 0 ? (
          <div className="p-12 text-center text-[13px] text-gray-400">No orders found</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="text-[11px] text-gray-400 uppercase tracking-wider border-b border-gray-100 bg-gray-50/50">
                  <th className="px-5 py-3 font-medium">Order</th>
                  <th className="px-5 py-3 font-medium">Date</th>
                  <th className="px-5 py-3 font-medium">Customer</th>
                  <th className="px-5 py-3 font-medium">Total</th>
                  <th className="px-5 py-3 font-medium">AlyaPay Status</th>
                  <th className="px-5 py-3 font-medium">Payment Attempts</th>
                  <th className="px-5 py-3 font-medium">Order Status</th>
                  <th className="px-5 py-3 font-medium text-right"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {orders.map((order: any) => {
                  const latestPayment = order.payments?.[order.payments.length - 1] || order.payments?.[0];
                  const paymentCount = order.payments?.length || 0;
                  return (
                    <tr key={order.id} className="hover:bg-gray-50 transition-colors duration-150 group">
                      <td className="px-5 py-3.5">
                        <Link
                          href={`/admin/orders/${order.id}`}
                          className="text-[13px] text-gray-900 font-semibold hover:text-primary transition-colors"
                        >
                          #{order.vendor_reference || order.order_number}
                        </Link>
                      </td>
                      <td className="px-5 py-3.5 text-[12px] text-gray-500">
                        {new Date(order.created_at).toLocaleDateString("en-GB", { day: "2-digit", month: "short" })}
                      </td>
                      <td className="px-5 py-3.5">
                        <p className="text-[13px] text-gray-700">{order.customer_first_name} {order.customer_last_name}</p>
                        <p className="text-[11px] text-gray-400">{order.customer_email}</p>
                      </td>
                      <td className="px-5 py-3.5 text-[13px] text-gray-900 font-semibold">
                        {formatPrice(order.total_amount)} <span className="text-gray-400 font-medium text-[11px]">{order.currency || "MAD"}</span>
                      </td>
                      <td className="px-5 py-3.5">
                        {latestPayment ? <StatusBadge status={latestPayment.status} /> : <span className="text-[11px] text-gray-400">—</span>}
                      </td>
                      <td className="px-5 py-3.5">
                        <span className="text-[12px] text-gray-500">
                          {paymentCount} attempt{paymentCount !== 1 ? "s" : ""}
                        </span>
                      </td>
                      <td className="px-5 py-3.5">
                        <StatusBadge status={order.status} />
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        <Link href={`/admin/orders/${order.id}`}>
                          <button className="p-1.5 rounded-md hover:bg-gray-100 transition-colors active:scale-[0.97]">
                            <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-gray-600 transition-colors" />
                          </button>
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </motion.div>
    </div>
  );
}
