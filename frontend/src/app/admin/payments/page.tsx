"use client";

import { useEffect, useState } from "react";
import { fetchAdminPayments } from "@/lib/api";
import { formatPrice } from "@/lib/formatPrice";
import { motion } from "framer-motion";

const statusColors: Record<string, { bg: string; text: string; dot: string }> = {
  pending: { bg: "bg-amber-50", text: "text-amber-700", dot: "bg-amber-500" },
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

export default function AdminPayments() {
  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAdminPayments()
      .then((data) => {
        setPayments(data.data);
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
        <h1 className="text-2xl font-bold text-gray-900 tracking-[-0.02em]">Payments</h1>
        <p className="text-[13px] text-gray-500 mt-1">AlyaPay transaction history and webhook logs</p>
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
        ) : payments.length === 0 ? (
          <div className="p-12 text-center text-[13px] text-gray-400">No payments found</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="text-[11px] text-gray-400 uppercase tracking-wider border-b border-gray-100 bg-gray-50/50">
                  <th className="px-5 py-3 font-medium">Transaction ID</th>
                  <th className="px-5 py-3 font-medium">Date</th>
                  <th className="px-5 py-3 font-medium">Order / Vendor Ref</th>
                  <th className="px-5 py-3 font-medium">Provider</th>
                  <th className="px-5 py-3 font-medium">Env</th>
                  <th className="px-5 py-3 font-medium">Amount</th>
                  <th className="px-5 py-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {payments.map((payment) => (
                  <tr key={payment.id} className="hover:bg-gray-50 transition-colors duration-150">
                    <td className="px-5 py-3.5">
                      <span className="text-[12px] font-mono text-gray-900">
                        {payment.alyapay_transaction_id || "Pending ID"}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-[12px] text-gray-500">
                      {new Date(payment.created_at).toLocaleString("en-GB", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })}
                    </td>
                    <td className="px-5 py-3.5">
                      <p className="text-[13px] text-gray-900 font-semibold hover:text-primary transition-colors">
                        #{payment.vendor_reference}
                      </p>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="text-[12px] text-gray-500">{payment.provider || "AlyaPay"}</span>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="text-[10px] uppercase text-gray-400">{payment.environment || "—"}</span>
                    </td>
                    <td className="px-5 py-3.5 text-[13px] text-gray-900 font-semibold">
                      {formatPrice(payment.amount)} <span className="text-gray-400 font-medium text-[11px]">{payment.currency || "MAD"}</span>
                    </td>
                    <td className="px-5 py-3.5">
                      <StatusBadge status={payment.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </motion.div>
    </div>
  );
}
