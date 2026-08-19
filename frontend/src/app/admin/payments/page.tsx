"use client";

import { useEffect, useState } from "react";
import { fetchAdminPayments } from "@/lib/api";
import { formatPrice } from "@/lib/formatPrice";
import Link from "next/link";
import { motion } from "framer-motion";
import { CreditCard, CheckCircle, Clock, ExternalLink } from "lucide-react";

const STATUS_CONFIG: Record<string, { bg: string; text: string; dot: string; border: string }> = {
  pending:   { bg: "bg-amber-50",   text: "text-amber-700",   dot: "bg-amber-400",   border: "border-amber-100" },
  approved:  { bg: "bg-emerald-50", text: "text-emerald-700", dot: "bg-emerald-500", border: "border-emerald-100" },
  paid:      { bg: "bg-emerald-50", text: "text-emerald-700", dot: "bg-emerald-500", border: "border-emerald-100" },
  failed:    { bg: "bg-red-50",     text: "text-red-700",     dot: "bg-red-500",     border: "border-red-100" },
  canceled:  { bg: "bg-red-50",     text: "text-red-700",     dot: "bg-red-500",     border: "border-red-100" },
  expired:   { bg: "bg-gray-100",   text: "text-gray-600",    dot: "bg-gray-400",    border: "border-gray-200" },
};

function StatusBadge({ status }: { status: string }) {
  const c = STATUS_CONFIG[status] ?? STATUS_CONFIG.pending;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-semibold border ${c.bg} ${c.text} ${c.border}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${c.dot}`} />
      {status}
    </span>
  );
}

function EnvBadge({ env }: { env: string }) {
  const isSandbox = env?.toLowerCase() === "sandbox";
  return (
    <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md border ${
      isSandbox
        ? "bg-amber-50 text-amber-600 border-amber-100"
        : "bg-emerald-50 text-emerald-600 border-emerald-100"
    }`}>
      {env || "�"}
    </span>
  );
}

export default function AdminPayments() {
  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAdminPayments()
      .then((data) => { setPayments(data.data); setLoading(false); })
      .catch((err) => { console.error(err); setLoading(false); });
  }, []);

  const approved = payments.filter(p => p.status === "approved" || p.status === "paid");
  const pending  = payments.filter(p => p.status === "pending");
  const totalApproved = approved.reduce((sum, p) => sum + parseFloat(p.amount || 0), 0);
  const totalPending  = pending.reduce((sum, p) => sum + parseFloat(p.amount || 0), 0);

  return (
    <div className="p-6 lg:p-8 max-w-[1400px]">
      <div className="mb-6">
        <h1 className="text-[22px] font-bold text-gray-900 tracking-[-0.03em]">Payments</h1>
        <p className="text-[13px] text-gray-500 mt-1">AlyaPay transaction history and webhook logs</p>
      </div>

      {/* Summary stat cards */}
      {!loading && payments.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {[
            { label: "Total Transactions", value: payments.length.toString(), icon: CreditCard, iconBg: "bg-blue-50", iconColor: "text-blue-600", subtitle: "All time" },
            { label: "Approved Amount",    value: `${formatPrice(totalApproved)} MAD`, icon: CheckCircle, iconBg: "bg-emerald-50", iconColor: "text-emerald-600", subtitle: `${approved.length} transactions` },
            { label: "Pending Amount",     value: `${formatPrice(totalPending)} MAD`,  icon: Clock,        iconBg: "bg-amber-50",   iconColor: "text-amber-600",  subtitle: `${pending.length} transactions` },
          ].map((stat, i) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06, duration: 0.3, ease: [0.23, 1, 0.32, 1] }}
                className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className={`p-2.5 rounded-xl ${stat.iconBg}`}>
                    <Icon className={`w-[17px] h-[17px] ${stat.iconColor}`} />
                  </div>
                </div>
                <p className="text-[11px] text-gray-500 font-medium mb-1">{stat.label}</p>
                <p className="text-lg font-bold text-gray-900 tracking-[-0.02em]">{stat.value}</p>
                <p className="text-[11px] text-gray-400 mt-1">{stat.subtitle}</p>
              </motion.div>
            );
          })}
        </div>
      )}

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25, ease: [0.23, 1, 0.32, 1], delay: 0.18 }}
        className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm"
      >
        {loading ? (
          <div className="p-12 flex items-center justify-center">
            <div className="w-5 h-5 border-2 border-primary/20 border-t-primary rounded-full animate-spin" />
          </div>
        ) : payments.length === 0 ? (
          <div className="p-16 text-center">
            <CreditCard className="w-10 h-10 text-gray-200 mx-auto mb-3" />
            <p className="text-[13px] text-gray-400">No payments found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="text-[10px] text-gray-400 uppercase tracking-widest border-b border-gray-100 bg-gray-50/60">
                  <th className="px-5 py-3 font-semibold">Transaction ID</th>
                  <th className="px-5 py-3 font-semibold">Date</th>
                  <th className="px-5 py-3 font-semibold">Order Ref</th>
                  <th className="px-5 py-3 font-semibold">Provider</th>
                  <th className="px-5 py-3 font-semibold">Env</th>
                  <th className="px-5 py-3 font-semibold text-right">Amount</th>
                  <th className="px-5 py-3 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {payments.map((payment) => (
                  <tr key={payment.id} className="hover:bg-blue-50/20 transition-colors duration-100">
                    <td className="px-5 py-3.5">
                      <code className="text-[11px] font-mono text-gray-600 bg-gray-50 border border-gray-100 rounded-md px-1.5 py-0.5">
                        {(payment.alyapay_transaction_id || "Pending").slice(0, 12)}...
                      </code>
                    </td>
                    <td className="px-5 py-3.5 text-[12px] text-gray-500 tabular-nums whitespace-nowrap">
                      {new Date(payment.created_at).toLocaleString("en-GB", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })}
                    </td>
                    <td className="px-5 py-3.5">
                      {payment.order_id ? (
                        <Link href={`/admin/orders/${payment.order_id}`} className="inline-flex items-center gap-1 text-[12px] text-primary font-semibold hover:underline">
                          #{payment.vendor_reference}
                          <ExternalLink className="w-3 h-3 opacity-60" />
                        </Link>
                      ) : (
                        <span className="text-[12px] text-gray-700 font-semibold">#{payment.vendor_reference}</span>
                      )}
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="text-[12px] text-gray-600 font-medium">{payment.provider || "alyapay"}</span>
                    </td>
                    <td className="px-5 py-3.5">
                      <EnvBadge env={payment.environment} />
                    </td>
                    <td className="px-5 py-3.5 text-right tabular-nums">
                      <span className="text-[13px] text-gray-900 font-semibold">
                        {formatPrice(payment.amount)}{" "}
                        <span className="text-gray-400 font-normal text-[10px]">{payment.currency || "MAD"}</span>
                      </span>
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
