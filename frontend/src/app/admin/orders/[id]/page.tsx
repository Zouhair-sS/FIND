"use client";

import { useEffect, useState } from "react";
import { fetchAdminOrder, updateAdminOrderStatus } from "@/lib/api";
import { useParams } from "next/navigation";
import { formatPrice } from "@/lib/formatPrice";
import { ChevronLeft, Shield } from "lucide-react";
import Link from "next/link";
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
  awaiting_capture: { bg: "bg-amber-50", text: "text-amber-700", dot: "bg-amber-500" },
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

export default function AdminOrderDetail() {
  const params = useParams();
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    fetchAdminOrder(params.id as string)
      .then((data) => {
        setOrder(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, [params.id]);

  const handleUpdateStatus = async (newStatus: string) => {
    if (newStatus === order.status) return;
    setUpdating(true);
    try {
      const updatedOrder = await updateAdminOrderStatus(order.id, newStatus);
      setOrder({ ...order, ...updatedOrder, payments: order.payments, items: order.items });
    } catch (err) {
      console.error(err);
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center h-[60vh]">
        <div className="w-5 h-5 border-2 border-primary/20 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  if (!order) {
    return <div className="p-8 text-red-500 text-[13px]">Order not found.</div>;
  }

  return (
    <div className="p-6 lg:p-8 max-w-[1400px]">
      {/* Back + Header */}
      <Link
        href="/admin/orders"
        className="inline-flex items-center text-[13px] text-gray-500 hover:text-gray-900 transition-colors mb-5 group"
      >
        <ChevronLeft className="w-3.5 h-3.5 mr-1 group-hover:-translate-x-0.5 transition-transform duration-150" />
        Back to Orders
      </Link>

      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-[-0.02em]">
            Order #{order.vendor_reference || order.order_number}
          </h1>
          <p className="text-[13px] text-gray-500 mt-1">
            {new Date(order.created_at).toLocaleString("en-GB", {
              day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit",
            })}
          </p>
        </div>

        {/* Order Status Selector (fulfillment only) */}
        <div className="flex items-center gap-3">
          <span className="text-[11px] text-gray-500 uppercase tracking-wider font-medium">Fulfillment:</span>
          <select
            disabled={updating}
            value={order.status}
            onChange={(e) => handleUpdateStatus(e.target.value)}
            className="bg-white border border-gray-200 text-gray-900 text-[13px] font-medium rounded-lg px-3 py-1.5 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all disabled:opacity-50 cursor-pointer shadow-sm"
          >
            <option value="pending">Pending</option>
            <option value="processing">Processing</option>
            <option value="shipped">Shipped</option>
            <option value="delivered">Delivered</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Customer + Items */}
        <div className="lg:col-span-2 space-y-6">
          {/* Customer */}
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0, duration: 0.25, ease: [0.23, 1, 0.32, 1] }}
            className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm"
          >
            <h2 className="text-[13px] font-semibold text-gray-900 mb-4">Customer</h2>
            <div className="grid grid-cols-2 gap-4 text-[13px]">
              <div>
                <p className="text-gray-400 text-[11px] mb-0.5 font-medium uppercase tracking-wider">Name</p>
                <p className="text-gray-900 font-medium">{order.customer_first_name} {order.customer_last_name}</p>
              </div>
              <div>
                <p className="text-gray-400 text-[11px] mb-0.5 font-medium uppercase tracking-wider">Email</p>
                <p className="text-gray-700">{order.customer_email}</p>
              </div>
              <div>
                <p className="text-gray-400 text-[11px] mb-0.5 font-medium uppercase tracking-wider">Phone</p>
                <p className="text-gray-700">{order.customer_phone || "—"}</p>
              </div>
              <div>
                <p className="text-gray-400 text-[11px] mb-0.5 font-medium uppercase tracking-wider">City</p>
                <p className="text-gray-700">{order.shipping_city || "—"}</p>
              </div>
              <div className="col-span-2">
                <p className="text-gray-400 text-[11px] mb-0.5 font-medium uppercase tracking-wider">Shipping Address</p>
                <p className="text-gray-700">{order.shipping_address || "—"}</p>
              </div>
            </div>
          </motion.div>

          {/* Items */}
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05, duration: 0.25, ease: [0.23, 1, 0.32, 1] }}
            className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm"
          >
            <h2 className="text-[13px] font-semibold text-gray-900 mb-4">Order Items</h2>
            <div className="space-y-3">
              {order.items?.map((item: any) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-3.5 rounded-lg bg-gray-50 border border-gray-100"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-white border border-gray-100 flex items-center justify-center text-[11px] text-gray-500 font-medium shadow-sm">
                      {item.product_variant?.product?.name?.[0] || "?"}
                    </div>
                    <div>
                      <p className="text-[13px] text-gray-900 font-semibold">
                        {item.product_variant?.product?.name || "Product"}
                      </p>
                      <p className="text-[11px] text-gray-500">
                        SKU: {item.product_variant?.sku || "—"} · Qty: {item.quantity}
                      </p>
                    </div>
                  </div>
                  <p className="text-[13px] text-gray-900 font-semibold">
                    {formatPrice(item.price)} <span className="text-gray-400 font-medium text-[11px]">{order.currency || "MAD"}</span>
                  </p>
                </div>
              ))}
            </div>
            <div className="mt-5 pt-4 border-t border-gray-100 flex justify-between items-center">
              <span className="text-[13px] text-gray-500 font-medium">Total</span>
              <span className="text-lg font-bold text-gray-900 tracking-[-0.02em]">
                {formatPrice(order.total_amount)} <span className="text-[13px] text-gray-500 font-medium">{order.currency || "MAD"}</span>
              </span>
            </div>
          </motion.div>
        </div>

        {/* Right: Payments + Status History */}
        <div className="space-y-6">
          {/* AlyaPay Payment Attempts */}
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.25, ease: [0.23, 1, 0.32, 1] }}
            className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm"
          >
            <div className="flex items-center gap-2 mb-4">
              <Shield className="w-4 h-4 text-primary" />
              <h2 className="text-[13px] font-semibold text-gray-900">
                AlyaPay Payment Attempts
              </h2>
            </div>
            <p className="text-[11px] text-gray-400 mb-4">
              Payment status is controlled by AlyaPay webhooks. Read-only.
            </p>
            <div className="space-y-3">
              {(!order.payments || order.payments.length === 0) && (
                <p className="text-[12px] text-gray-400">No payment records.</p>
              )}
              {order.payments?.map((payment: any) => (
                <div
                  key={payment.id}
                  className="p-3.5 rounded-lg bg-gray-50 border border-gray-100 text-[12px]"
                >
                  <div className="flex items-center justify-between mb-2.5">
                    <StatusBadge status={payment.status} />
                    <span className="text-gray-400 font-medium text-[10px] uppercase tracking-wider">
                      {payment.environment || "—"}
                    </span>
                  </div>
                  <div className="space-y-1.5">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Provider</span>
                      <span className="text-gray-900 font-medium">{payment.provider || "AlyaPay"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Transaction ID</span>
                      <span className="text-gray-900 font-mono text-[10px]">
                        {payment.alyapay_transaction_id || "Pending"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Vendor Ref</span>
                      <span className="text-gray-900 font-mono text-[10px]">
                        {payment.vendor_reference || "—"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Amount</span>
                      <span className="text-gray-900 font-semibold">
                        {formatPrice(payment.amount)} {payment.currency || "MAD"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Created</span>
                      <span className="text-gray-600">
                        {new Date(payment.created_at).toLocaleString("en-GB", {
                          day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit",
                        })}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Status History */}
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15, duration: 0.25, ease: [0.23, 1, 0.32, 1] }}
            className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm"
          >
            <h2 className="text-[13px] font-semibold text-gray-900 mb-4">
              Fulfillment History
            </h2>
            {(!order.status_history || order.status_history.length === 0) ? (
              <p className="text-[12px] text-gray-400">No status changes recorded yet.</p>
            ) : (
              <div className="relative pl-4 border-l-2 border-gray-100 space-y-5">
                {order.status_history.map((history: any) => (
                  <div key={history.id} className="relative">
                    <div className="absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full bg-gray-200 border-2 border-white" />
                    <p className="text-[13px] text-gray-900 font-semibold capitalize">{history.status}</p>
                    <p className="text-[11px] text-gray-500 mt-0.5">
                      {new Date(history.created_at).toLocaleString("en-GB", {
                        day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit",
                      })}
                    </p>
                    {history.notes && (
                      <p className="text-[11px] text-gray-600 mt-1.5 bg-gray-50 border border-gray-100 px-2.5 py-1.5 rounded-md">
                        {history.notes}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
}
