"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { fetchAdminOrders, deleteAdminOrder } from "@/lib/api";
import Link from "next/link";
import { ChevronRight, Trash2 } from "lucide-react";
import { formatPrice } from "@/lib/formatPrice";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";

import ConfirmModal from "@/components/admin/ConfirmModal";

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

function AdminOrdersContent() {
  const searchParams = useSearchParams();
  const highlight = searchParams.get('highlight');
  const [isHighlightActive, setIsHighlightActive] = useState(false);
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrders, setSelectedOrders] = useState<number[]>([]);
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [modalConfig, setModalConfig] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    isAlert?: boolean;
    variant?: "danger" | "warning" | "info" | "success";
    onConfirm?: () => void;
  }>({ isOpen: false, title: "", message: "" });

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

  useEffect(() => {
    if (highlight === 'to-fulfil') {
      setIsHighlightActive(true);
      const timer = setTimeout(() => setIsHighlightActive(false), 30000);
      return () => clearTimeout(timer);
    }
  }, [highlight]);

  const handleDelete = (id: number) => {
    setModalConfig({
      isOpen: true,
      title: "Delete Order",
      message: "Are you sure you want to delete this order? This action cannot be undone.",
      variant: "danger",
      onConfirm: async () => {
        setModalConfig(prev => ({ ...prev, isOpen: false }));
        try {
          await deleteAdminOrder(id);
          setOrders(prev => prev.filter(o => o.id !== id));
          setSelectedOrders(prev => prev.filter(selectedId => selectedId !== id));
        } catch (err) {
          console.error("Failed to delete order:", err);
          setTimeout(() => {
            setModalConfig({
              isOpen: true,
              title: "Error",
              message: "Failed to delete order. Please try again.",
              isAlert: true,
              variant: "danger"
            });
          }, 300);
        }
      }
    });
  };

  const handleBulkDelete = () => {
    if (selectedOrders.length === 0) return;
    setModalConfig({
      isOpen: true,
      title: "Delete Orders",
      message: `Are you sure you want to delete ${selectedOrders.length} orders? This action cannot be undone.`,
      variant: "danger",
      onConfirm: async () => {
        setModalConfig(prev => ({ ...prev, isOpen: false }));
        try {
          await Promise.all(selectedOrders.map(id => deleteAdminOrder(id)));
          setOrders(prev => prev.filter(o => !selectedOrders.includes(o.id)));
          setSelectedOrders([]);
        } catch (err) {
          console.error("Failed to delete orders:", err);
          setTimeout(() => {
            setModalConfig({
              isOpen: true,
              title: "Error",
              message: "Failed to delete some orders. Please try again.",
              isAlert: true,
              variant: "danger"
            });
          }, 300);
        }
      }
    });
  };

  const toggleSelectAll = () => {
    if (selectedOrders.length === orders.length) {
      setSelectedOrders([]);
    } else {
      setSelectedOrders(orders.map(o => o.id));
    }
  };

  const toggleSelectOrder = (id: number) => {
    setSelectedOrders(prev => 
      prev.includes(id) ? prev.filter(selectedId => selectedId !== id) : [...prev, id]
    );
  };

  return (
    <div className="p-6 lg:p-8 max-w-[1400px]">
      <ConfirmModal 
        {...modalConfig} 
        onClose={() => setModalConfig(prev => ({ ...prev, isOpen: false }))} 
      />
      <div className="mb-8 flex flex-wrap gap-4 items-end justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-[-0.02em]">Orders</h1>
          <p className="text-[13px] text-gray-500 mt-1">Manage customer orders and fulfillment status</p>
        </div>
        <div className="flex items-center gap-3">
          {isSelectionMode ? (
            <>
              <button 
                onClick={() => {
                  setIsSelectionMode(false);
                  setSelectedOrders([]);
                }}
                className="inline-flex items-center gap-2 bg-gray-100 text-gray-700 px-4 py-2 rounded-xl text-[13px] font-semibold hover:bg-gray-200 transition-all shadow-sm"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                Cancel
              </button>
              <button 
                onClick={handleBulkDelete}
                disabled={selectedOrders.length === 0}
                className="inline-flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-xl text-[13px] font-semibold hover:bg-red-700 transition-all shadow-sm disabled:opacity-50"
              >
                <Trash2 className="w-4 h-4" />
                Delete Selected ({selectedOrders.length})
              </button>
            </>
          ) : (
            <button 
              onClick={() => setIsSelectionMode(true)}
              className="inline-flex items-center gap-2 bg-gray-100 text-gray-700 px-4 py-2 rounded-xl text-[13px] font-semibold hover:bg-gray-200 transition-all shadow-sm"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 11 12 14 22 4"></polyline><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path></svg>
              Select
            </button>
          )}
        </div>
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
                  <th className="p-0 w-0">
                    <AnimatePresence initial={false}>
                      {isSelectionMode && (
                        <motion.div
                          initial={{ width: 0, opacity: 0 }}
                          animate={{ width: 60, opacity: 1 }}
                          exit={{ width: 0, opacity: 0 }}
                          className="flex items-center justify-center overflow-hidden h-full"
                        >
                          <input 
                            type="checkbox" 
                            className="rounded border-gray-300 text-primary focus:ring-primary w-4 h-4 cursor-pointer"
                            checked={selectedOrders.length === orders.length && orders.length > 0}
                            onChange={toggleSelectAll}
                          />
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </th>
                  <th className="px-5 py-3 font-medium whitespace-nowrap">Order</th>
                  <th className="px-5 py-3 font-medium">Date</th>
                  <th className="px-5 py-3 font-medium">Customer</th>
                  <th className="px-5 py-3 font-medium">Total</th>
                  <th className="px-5 py-3 font-medium">Status</th>
                  <th className="px-5 py-3 font-medium">Order Status</th>
                  <th className="px-5 py-3 font-medium text-right"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {orders.map((order: any) => {
                  const latestPayment = order.payments?.[order.payments.length - 1] || order.payments?.[0];
                  const paymentCount = order.payments?.length || 0;
                  const needsFulfillment = !['shipped', 'delivered', 'canceled', 'failed', 'expired'].includes(order.status);
                  const showHighlight = isHighlightActive && needsFulfillment;

                  return (
                    <tr key={order.id} className={`hover:bg-gray-50 transition-colors duration-150 group ${selectedOrders.includes(order.id) ? "bg-primary/5" : ""} ${showHighlight ? "relative z-10 bg-primary/5 ring-1 ring-primary/30 shadow-sm animate-[pulse_2s_ease-in-out_infinite]" : ""}`}>
                      <td className="p-0">
                        <AnimatePresence initial={false}>
                          {isSelectionMode && (
                            <motion.div
                              initial={{ width: 0, opacity: 0 }}
                              animate={{ width: 60, opacity: 1 }}
                              exit={{ width: 0, opacity: 0 }}
                              className="flex items-center justify-center overflow-hidden h-full"
                            >
                              <input 
                                type="checkbox" 
                                className="rounded border-gray-300 text-primary focus:ring-primary w-4 h-4 cursor-pointer"
                                checked={selectedOrders.includes(order.id)}
                                onChange={() => toggleSelectOrder(order.id)}
                              />
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </td>
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
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full overflow-hidden bg-gray-100 flex-shrink-0 flex items-center justify-center border border-gray-200">
                            {order.user?.profile_picture ? (
                              <Image 
                                src={order.user.profile_picture.startsWith('http') ? order.user.profile_picture : `${process.env.NEXT_PUBLIC_BACKEND_URL || "http://127.0.0.1:8000"}${order.user.profile_picture}`} 
                                alt={order.customer_first_name} 
                                width={32} 
                                height={32} 
                                className="object-cover w-full h-full"
                                unoptimized
                              />
                            ) : (
                              <span className="text-xs font-bold text-gray-500 uppercase">
                                {order.customer_first_name?.charAt(0)}
                              </span>
                            )}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="text-[13px] text-gray-700 font-medium">
                                {order.customer_first_name} {order.customer_last_name}
                              </p>
                              {!order.user && (
                                <span className="px-1.5 py-0.5 rounded-md bg-gray-100 text-gray-500 text-[9px] font-bold uppercase tracking-wider border border-gray-200">
                                  Guest
                                </span>
                              )}
                            </div>
                            <p className="text-[11px] text-gray-400">{order.customer_email || "No email"}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3.5 text-[13px] text-gray-900 font-semibold">
                        {formatPrice(order.total_amount)} <span className="text-gray-400 font-medium text-[11px]">{order.currency || "MAD"}</span>
                      </td>
                      <td className="px-5 py-3.5">
                        {latestPayment ? <StatusBadge status={latestPayment.status} /> : <span className="text-[11px] text-gray-400">—</span>}
                      </td>
                      <td className="px-5 py-3.5">
                        <StatusBadge status={order.status} />
                      </td>
                      <td className="px-5 py-3.5 text-right flex items-center justify-end gap-2">
                        {(order.status === 'pending' || order.status === 'pending_payment') && (
                          <button 
                            onClick={() => handleDelete(order.id)}
                            className="p-1.5 rounded-md hover:bg-red-50 text-red-400 hover:text-red-600 transition-colors active:scale-[0.97]"
                            title="Delete unapproved order"
                          >
                            <div className="relative w-4 h-4 opacity-60 hover:opacity-100">
                              <Image src="/images/UI/trash-bin.png" alt="Delete" fill className="object-contain" />
                            </div>
                          </button>
                        )}
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

export default function AdminOrders() {
  return (
    <Suspense fallback={
      <div className="p-12 flex items-center justify-center">
        <div className="w-5 h-5 border-2 border-primary/20 border-t-primary rounded-full animate-spin" />
      </div>
    }>
      <AdminOrdersContent />
    </Suspense>
  );
}
