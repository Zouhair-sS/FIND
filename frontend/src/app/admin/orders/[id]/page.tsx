"use client";

import { useEffect, useState } from "react";
import { fetchAdminOrder, updateAdminOrderStatus, getImageUrl } from "@/lib/api";
import { useParams } from "next/navigation";
import { formatPrice } from "@/lib/formatPrice";
import { ChevronLeft, Shield, CheckCircle2, Package, Truck, Home, XCircle, Code, Clock } from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";

import ConfirmModal from "@/components/admin/ConfirmModal";

const STATUS_CONFIG: Record<string, { bg: string; text: string; dot: string; border: string }> = {
  pending:           { bg: "bg-amber-50",   text: "text-amber-700",   dot: "bg-amber-400",   border: "border-amber-100" },
  processing:        { bg: "bg-blue-50",    text: "text-blue-700",    dot: "bg-blue-400",    border: "border-blue-100" },
  shipped:           { bg: "bg-indigo-50",  text: "text-indigo-700",  dot: "bg-indigo-400",  border: "border-indigo-100" },
  delivered:         { bg: "bg-emerald-50", text: "text-emerald-700", dot: "bg-emerald-500", border: "border-emerald-100" },
  approved:          { bg: "bg-emerald-50", text: "text-emerald-700", dot: "bg-emerald-500", border: "border-emerald-100" },
  paid:              { bg: "bg-emerald-50", text: "text-emerald-700", dot: "bg-emerald-500", border: "border-emerald-100" },
  failed:            { bg: "bg-red-50",     text: "text-red-700",     dot: "bg-red-500",     border: "border-red-100" },
  canceled:          { bg: "bg-red-50",     text: "text-red-700",     dot: "bg-red-500",     border: "border-red-100" },
  expired:           { bg: "bg-gray-100",   text: "text-gray-600",    dot: "bg-gray-400",    border: "border-gray-200" },
};

const FULFILLMENT_STEPS = [
  { key: "processing", label: "Processing", icon: Package },
  { key: "shipped",    label: "Shipped",    icon: Truck },
  { key: "delivered",  label: "Delivered",  icon: Home },
];

function StatusBadge({ status }: { status: string }) {
  const c = STATUS_CONFIG[status] ?? STATUS_CONFIG.pending;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold border ${c.bg} ${c.text} ${c.border}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${c.dot}`} />
      {status.replace(/_/g, " ")}
    </span>
  );
}

function FulfillmentTimeline({ currentStatus }: { currentStatus: string }) {
  if (currentStatus === "canceled") {
    return (
      <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-100 rounded-xl">
        <XCircle className="w-5 h-5 text-red-500" />
        <div>
          <p className="text-[13px] font-semibold text-red-900">Order Cancelled</p>
          <p className="text-[12px] text-red-700 mt-0.5">This order will not be fulfilled.</p>
        </div>
      </div>
    );
  }

  const currentIdx = FULFILLMENT_STEPS.findIndex(s => s.key === currentStatus);
  return (
    <div className="flex items-center">
      {FULFILLMENT_STEPS.map((step, idx) => {
        const isDone = currentIdx >= idx;
        const isCurrent = currentIdx === idx;
        const Icon = step.icon;
        return (
          <div key={step.key} className="flex items-center flex-1 last:flex-none">
            <div className="flex flex-col items-center gap-1.5">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 ${
                isDone ? isCurrent ? "bg-primary text-white shadow-sm shadow-primary/30" : "bg-emerald-500 text-white" : "bg-gray-100 text-gray-400"
              }`}>
                {isDone && !isCurrent ? <CheckCircle2 className="w-4 h-4" /> : <Icon className="w-4 h-4" />}
              </div>
              <span className={`text-[10px] font-semibold whitespace-nowrap ${
                isDone ? isCurrent ? "text-primary" : "text-emerald-600" : "text-gray-400"
              }`}>{step.label}</span>
            </div>
            {idx < FULFILLMENT_STEPS.length - 1 && (
              <div className={`flex-1 h-0.5 mx-1.5 mb-4 rounded-full transition-all duration-500 ${
                currentIdx > idx ? "bg-emerald-400" : "bg-gray-100"
              }`} />
            )}
          </div>
        );
      })}
    </div>
  );
}

export default function AdminOrderDetail() {
  const params = useParams();
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);
  const [showRawJson, setShowRawJson] = useState(false);
  const [cancelReason, setCancelReason] = useState("");
  const [modalConfig, setModalConfig] = useState<{
    isOpen: boolean;
    title: string;
    message: React.ReactNode;
    variant?: "danger" | "warning" | "info" | "success";
    onConfirm?: () => void;
  }>({ isOpen: false, title: "", message: "" });

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

  const handleUpdateStatus = async (newStatus: string, reason?: string) => {
    if (newStatus === order.status) return;
    setUpdating(true);
    try {
      // Pass reason if provided (for cancellation)
      const payload = reason ? { status: newStatus, reason } : { status: newStatus };
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000/api"}/admin/orders/${order.id}/status`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("admin_token")}`,
        },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("Failed to update status");
      const updatedOrder = await res.json();
      setOrder({ ...order, ...updatedOrder, payments: order.payments, items: order.items });
    } catch (err) {
      console.error(err);
    } finally {
      setUpdating(false);
    }
  };

  const confirmCancellation = () => {
    setModalConfig({
      isOpen: true,
      title: "Cancel Order",
      variant: "danger",
      message: (
        <div className="space-y-4">
          <p className="text-[13px] text-gray-600">
            Are you sure you want to cancel this order? This will mark the order as cancelled in FIND. 
            <strong> No payment refund will be initiated via AlyaPay automatically.</strong>
          </p>
          <textarea
            className="w-full text-[13px] p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
            rows={3}
            placeholder="Cancellation reason (e.g. Customer request, Out of stock)"
            onChange={(e) => setCancelReason(e.target.value)}
          />
        </div>
      ),
      onConfirm: async () => {
        setModalConfig((prev) => ({ ...prev, isOpen: false }));
        await handleUpdateStatus("canceled", cancelReason || "Cancelled by Admin");
      }
    });
  };

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(null), 1800);
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

  const latestPayment = order.payments?.[0];

  return (
    <div className="p-6 lg:p-8 max-w-[1400px]">
      <ConfirmModal
        {...modalConfig}
        onClose={() => {
          setModalConfig((prev) => ({ ...prev, isOpen: false }));
          setCancelReason("");
        }}
      />
      {/* Back + Header */}
      <Link
        href="/admin/orders"
        className="inline-flex items-center text-[13px] text-gray-500 hover:text-gray-900 transition-colors mb-5 group"
      >
        <ChevronLeft className="w-3.5 h-3.5 mr-1 group-hover:-translate-x-0.5 transition-transform duration-150" />
        Back to Orders
      </Link>

      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-[22px] font-bold text-gray-900 tracking-[-0.03em]">
            Order #{order.vendor_reference || order.order_number}
          </h1>
          <p className="text-[13px] text-gray-500 mt-1">
            {new Date(order.created_at).toLocaleString("en-GB", {
              day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit",
            })}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (Main Content) */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Payment Status Block */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm"
          >
            <div className="flex items-center gap-2 mb-4">
              <Shield className="w-4 h-4 text-primary" />
              <h2 className="text-[13px] font-semibold text-gray-900">Payment Summary</h2>
            </div>
            {latestPayment ? (
              <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100">
                <div className="flex items-center gap-4 mb-4 sm:mb-0">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${latestPayment.status === 'approved' || latestPayment.status === 'paid' ? 'bg-emerald-100 text-emerald-600' : 'bg-amber-100 text-amber-600'}`}>
                    {latestPayment.status === 'approved' || latestPayment.status === 'paid' ? <CheckCircle2 className="w-5 h-5" /> : <Clock className="w-5 h-5" />}
                  </div>
                  <div>
                    <div className="flex items-center gap-3">
                      {latestPayment.provider?.toLowerCase() === "alyapay" || !latestPayment.provider ? (
                        <img src="/images/AlyaPay%20Icon/alyaIcon-dark.svg" alt="AlyaPay" className="h-5 object-contain" />
                      ) : (
                        <p className="text-[14px] font-semibold text-gray-900 capitalize">{latestPayment.provider}</p>
                      )}
                      <StatusBadge status={latestPayment.status} />
                    </div>
                    <p className="text-[12px] text-gray-500 mt-0.5">Transaction: {latestPayment.alyapay_transaction_id || "—"}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-[18px] font-bold text-gray-900 tracking-tight">
                    {formatPrice(latestPayment.amount)} <span className="text-[12px] text-gray-400 font-medium">{latestPayment.currency || "MAD"}</span>
                  </p>
                </div>
              </div>
            ) : (
              <p className="text-[13px] text-gray-500">No payment records found for this order.</p>
            )}

            {/* Collapsible AlyaPay Response */}
            {latestPayment && latestPayment.provider === "AlyaPay" && (
              <div className="mt-4 border-t border-gray-100 pt-4">
                <button 
                  onClick={() => setShowRawJson(!showRawJson)}
                  className="flex items-center gap-2 text-[12px] font-medium text-gray-500 hover:text-gray-900 transition-colors"
                >
                  <Code className="w-4 h-4" />
                  {showRawJson ? "Hide AlyaPay Response" : "View AlyaPay Response"}
                </button>
                <AnimatePresence>
                  {showRawJson && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <pre className="mt-3 bg-gray-900 text-gray-300 p-4 rounded-xl text-[11px] font-mono overflow-x-auto">
                        {JSON.stringify(
                          {
                            transaction_id: latestPayment.alyapay_transaction_id,
                            status: latestPayment.status,
                            amount: latestPayment.amount,
                            currency: latestPayment.currency,
                            environment: latestPayment.environment,
                            created_at: latestPayment.created_at,
                          }, null, 2
                        )}
                      </pre>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}
          </motion.div>

          {/* Fulfillment Workflow */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm"
          >
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-[13px] font-semibold text-gray-900">Fulfillment</h2>
              {updating && <div className="w-4 h-4 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />}
            </div>
            
            <FulfillmentTimeline currentStatus={order.status} />

            {/* Fulfillment Actions */}
            {order.status !== "canceled" && (
              <div className="mt-6 pt-5 border-t border-gray-100 flex items-center gap-3">
                {order.status === "pending" || order.status === "processing" ? (
                  <button
                    onClick={() => handleUpdateStatus("shipped")}
                    disabled={updating}
                    className="px-4 py-2 bg-primary text-white text-[13px] font-semibold rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50"
                  >
                    Mark as Shipped
                  </button>
                ) : null}
                {order.status === "shipped" && (
                  <button
                    onClick={() => handleUpdateStatus("delivered")}
                    disabled={updating}
                    className="px-4 py-2 bg-emerald-500 text-white text-[13px] font-semibold rounded-lg hover:bg-emerald-600 transition-colors disabled:opacity-50"
                  >
                    Mark as Delivered
                  </button>
                )}
                {(order.status === "pending" || order.status === "processing" || order.status === "shipped") && (
                  <button
                    onClick={confirmCancellation}
                    disabled={updating}
                    className="px-4 py-2 bg-white border border-gray-200 text-red-600 text-[13px] font-semibold rounded-lg hover:bg-red-50 transition-colors disabled:opacity-50 ml-auto"
                  >
                    Cancel Order
                  </button>
                )}
              </div>
            )}
          </motion.div>

          {/* Items */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm"
          >
            <h2 className="text-[13px] font-semibold text-gray-900 mb-4">Order Items</h2>
            <div className="space-y-2.5">
              {order.items?.map((item: any) => {
                const price = parseFloat(item.price);
                return (
                  <div
                    key={item.id}
                    className="flex items-center justify-between p-3.5 rounded-xl bg-gray-50 border border-gray-100"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-white border border-gray-200 flex items-center justify-center text-[12px] font-bold text-gray-500 shadow-sm relative overflow-hidden">
                        {item.product_variant?.product?.images?.[0]?.url || item.product_variant?.product?.thumbnail ? (
                          <Image
                            unoptimized
                            src={getImageUrl(item.product_variant.product.images?.[0]?.url || item.product_variant.product.thumbnail)}
                            alt=""
                            fill
                            className="object-contain p-1"
                            sizes="40px"
                          />
                        ) : (
                          item.product_variant?.product?.name?.[0] || "?"
                        )}
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
                    <p className="text-[13px] text-gray-900 font-semibold tabular-nums">
                      {isNaN(price) ? "—" : formatPrice(price)}{" "}
                      <span className="text-gray-400 font-normal text-[10px]">{order.currency || "MAD"}</span>
                    </p>
                  </div>
                );
              })}
            </div>
            <div className="mt-5 pt-4 border-t border-gray-100 flex justify-between items-center">
              <span className="text-[13px] text-gray-500 font-medium">Total</span>
              <span className="text-[18px] font-bold text-gray-900 tracking-[-0.02em]">
                {formatPrice(order.total_amount)}{" "}
                <span className="text-[13px] text-gray-400 font-medium">{order.currency || "MAD"}</span>
              </span>
            </div>
          </motion.div>
        </div>

        {/* Right Column (Customer & History) */}
        <div className="space-y-6">
          
          {/* Customer */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm"
          >
            <h2 className="text-[13px] font-semibold text-gray-900 mb-4">Customer Details</h2>
            <div className="flex items-center gap-3 mb-5 p-3.5 bg-gray-50 rounded-xl border border-gray-100">
              {order.user?.profile_picture ? (
                <div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0 relative border border-gray-100">
                  <Image 
                    src={getImageUrl(order.user.profile_picture)} 
                    alt="Customer" 
                    fill 
                    className="object-cover" 
                    unoptimized 
                  />
                </div>
              ) : (
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center text-[13px] font-bold text-primary flex-shrink-0">
                  {`${order.customer_first_name?.[0] ?? ""}${order.customer_last_name?.[0] ?? ""}`.toUpperCase()}
                </div>
              )}
              <div className="flex-1 overflow-hidden">
                <p className="text-[14px] font-semibold text-gray-900 truncate">{order.customer_first_name} {order.customer_last_name}</p>
                <button
                  onClick={() => copyToClipboard(order.customer_email, "email")}
                  className="text-[12px] text-gray-500 hover:text-primary transition-colors cursor-pointer truncate w-full text-left"
                  title="Click to copy"
                >
                  {copied === "email" ? "✓ Copied!" : order.customer_email}
                </button>
              </div>
            </div>
            <div className="space-y-4 text-[13px]">
              <div>
                <p className="text-gray-400 text-[10px] mb-1 font-semibold uppercase tracking-widest">Phone</p>
                <button
                  onClick={() => order.customer_phone && copyToClipboard(order.customer_phone, "phone")}
                  className="text-gray-700 hover:text-primary transition-colors cursor-pointer"
                  title="Click to copy"
                >
                  {copied === "phone" ? "✓ Copied!" : order.customer_phone || "—"}
                </button>
              </div>
              <div>
                <p className="text-gray-400 text-[10px] mb-1 font-semibold uppercase tracking-widest">Shipping Address</p>
                <p className="text-gray-700 leading-relaxed">{order.shipping_address || "—"}</p>
                <p className="text-gray-700 mt-1">{order.shipping_city || "—"}</p>
              </div>
            </div>
          </motion.div>

          {/* Status History */}
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
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
                      <p className={`text-[11px] mt-1.5 px-2.5 py-1.5 rounded-md ${history.status === 'canceled' ? 'bg-red-50 text-red-700 border border-red-100' : 'text-gray-600 bg-gray-50 border border-gray-100'}`}>
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
