"use client";

import { useEffect, useState } from "react";
import { fetchAdminDashboard } from "@/lib/api";
import { formatPrice } from "@/lib/formatPrice";
import Link from "next/link";
import {
  ShoppingCart,
  TrendingUp,
  Users,
  Clock,
  ChevronRight,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";
import { motion, Variants } from "framer-motion";

interface DashboardData {
  total_orders: number;
  total_revenue: number;
  revenue_currency: string;
  total_customers: number;
  pending_payments: number;
  orders_trend: number | null;
  revenue_trend: number | null;
  orders_this_month: number;
  revenue_this_month: number;
  orders_by_status: Record<string, number>;
  payments_by_status: Record<string, number>;
  recent_orders: any[];
}

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
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium ${colors.bg} ${colors.text}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${colors.dot}`} />
      {status}
    </span>
  );
}

function TrendIndicator({ value }: { value: number | null }) {
  if (value === null) return <span className="text-[11px] text-gray-400">—</span>;
  const isPositive = value >= 0;
  return (
    <span
      className={`inline-flex items-center gap-0.5 text-[11px] font-medium px-1.5 py-0.5 rounded-md ${
        isPositive ? "text-emerald-700 bg-emerald-50" : "text-red-700 bg-red-50"
      }`}
    >
      {isPositive ? (
        <ArrowUpRight className="w-3 h-3" />
      ) : (
        <ArrowDownRight className="w-3 h-3" />
      )}
      {Math.abs(value)}%
    </span>
  );
}

function StatusBar({
  data,
  colors,
}: {
  data: Record<string, number>;
  colors: Record<string, string>;
}) {
  const total = Object.values(data).reduce((a, b) => a + b, 0);
  if (total === 0) return <div className="h-2 rounded-full bg-gray-100" />;
  return (
    <div className="flex h-2 rounded-full overflow-hidden gap-0.5 bg-gray-50">
      {Object.entries(data).map(([status, count]) => (
        <div
          key={status}
          className={`${colors[status] || "bg-gray-300"} rounded-full transition-all duration-300`}
          style={{ width: `${(count / total) * 100}%` }}
          title={`${status}: ${count}`}
        />
      ))}
    </div>
  );
}

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 8 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.05,
      duration: 0.3,
      ease: [0.23, 1, 0.32, 1],
    },
  }),
};

const orderBarColors: Record<string, string> = {
  pending: "bg-amber-400",
  processing: "bg-blue-400",
  shipped: "bg-indigo-400",
  delivered: "bg-emerald-500",
};

const paymentBarColors: Record<string, string> = {
  pending: "bg-amber-400",
  approved: "bg-emerald-500",
  paid: "bg-emerald-500",
  failed: "bg-red-500",
  canceled: "bg-red-500",
  expired: "bg-gray-400",
};

export default function AdminDashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAdminDashboard()
      .then(setData)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center h-[60vh]">
        <div className="w-5 h-5 border-2 border-primary/20 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="p-8 text-red-500">Failed to load dashboard data.</div>
    );
  }

  const currency = data.revenue_currency || "MAD";

  const stats = [
    {
      label: "Total Orders",
      value: data.total_orders.toString(),
      icon: ShoppingCart,
      trend: data.orders_trend,
      subtitle: `${data.orders_this_month} this month`,
    },
    {
      label: "Revenue (Approved)",
      value: `${formatPrice(data.total_revenue)} ${currency}`,
      icon: TrendingUp,
      trend: data.revenue_trend,
      subtitle: `${formatPrice(data.revenue_this_month)} ${currency} this month`,
    },
    {
      label: "Customers",
      value: data.total_customers.toString(),
      icon: Users,
      trend: null,
      subtitle: "Registered accounts",
    },
    {
      label: "Pending Payments",
      value: data.pending_payments.toString(),
      icon: Clock,
      trend: null,
      subtitle: "Awaiting AlyaPay confirmation",
    },
  ];

  return (
    <div className="p-6 lg:p-8 max-w-[1400px]">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 tracking-[-0.02em]">
          Dashboard
        </h1>
        <p className="text-[13px] text-gray-500 mt-1">
          Overview of your FIND store performance
        </p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.label}
            custom={i}
            variants={cardVariants}
            initial="hidden"
            animate="visible"
            className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm hover:-translate-y-0.5 transition-transform duration-200 ease-out"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="p-2 rounded-lg bg-gray-50 border border-gray-100 text-gray-500">
                <stat.icon className="w-4 h-4" />
              </div>
              <TrendIndicator value={stat.trend} />
            </div>
            <p className="text-[13px] text-gray-500 font-medium mb-1">
              {stat.label}
            </p>
            <p className="text-xl font-bold text-gray-900 tracking-[-0.02em]">
              {stat.value}
            </p>
            <p className="text-[11px] text-gray-400 mt-2">{stat.subtitle}</p>
          </motion.div>
        ))}
      </div>

      {/* Middle Section: Status Breakdowns */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-8">
        {/* Orders by Status */}
        <motion.div
          custom={4}
          variants={cardVariants}
          initial="hidden"
          animate="visible"
          className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm"
        >
          <h3 className="text-[13px] font-semibold text-gray-900 mb-5">
            Orders by Status
          </h3>
          <StatusBar data={data.orders_by_status} colors={orderBarColors} />
          <div className="mt-4 grid grid-cols-2 gap-3">
            {Object.entries(data.orders_by_status).map(([status, count]) => (
              <div key={status} className="flex items-center gap-2">
                <span
                  className={`w-2 h-2 rounded-full ${
                    orderBarColors[status] || "bg-gray-300"
                  }`}
                />
                <span className="text-[12px] text-gray-500 capitalize">
                  {status}
                </span>
                <span className="text-[12px] text-gray-900 font-semibold ml-auto">
                  {count}
                </span>
              </div>
            ))}
          </div>
          {Object.keys(data.orders_by_status).length === 0 && (
            <p className="text-[12px] text-gray-400 mt-3">No orders yet</p>
          )}
        </motion.div>

        {/* Payments by Status */}
        <motion.div
          custom={5}
          variants={cardVariants}
          initial="hidden"
          animate="visible"
          className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm"
        >
          <h3 className="text-[13px] font-semibold text-gray-900 mb-5">
            AlyaPay Payments by Status
          </h3>
          <StatusBar data={data.payments_by_status} colors={paymentBarColors} />
          <div className="mt-4 grid grid-cols-2 gap-3">
            {Object.entries(data.payments_by_status).map(([status, count]) => (
              <div key={status} className="flex items-center gap-2">
                <span
                  className={`w-2 h-2 rounded-full ${
                    paymentBarColors[status] || "bg-gray-300"
                  }`}
                />
                <span className="text-[12px] text-gray-500 capitalize">
                  {status}
                </span>
                <span className="text-[12px] text-gray-900 font-semibold ml-auto">
                  {count}
                </span>
              </div>
            ))}
          </div>
          {Object.keys(data.payments_by_status).length === 0 && (
            <p className="text-[12px] text-gray-400 mt-3">No payments yet</p>
          )}
        </motion.div>
      </div>

      {/* Recent Orders */}
      <motion.div
        custom={6}
        variants={cardVariants}
        initial="hidden"
        animate="visible"
        className="bg-white border border-gray-100 rounded-xl shadow-sm overflow-hidden"
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <h3 className="text-[13px] font-semibold text-gray-900">
            Recent Orders
          </h3>
          <Link
            href="/admin/orders"
            className="text-[12px] text-gray-500 hover:text-primary transition-colors flex items-center gap-1"
          >
            View all
            <ChevronRight className="w-3 h-3" />
          </Link>
        </div>

        {data.recent_orders.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-[13px] text-gray-400">No orders yet</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="text-[11px] text-gray-400 uppercase tracking-wider bg-gray-50/50">
                  <th className="px-5 py-3 font-medium">Order</th>
                  <th className="px-5 py-3 font-medium">Customer</th>
                  <th className="px-5 py-3 font-medium">Total</th>
                  <th className="px-5 py-3 font-medium">Payment</th>
                  <th className="px-5 py-3 font-medium">Status</th>
                  <th className="px-5 py-3 font-medium text-right">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {data.recent_orders.map((order: any) => {
                  const latestPayment = order.payments?.[0];
                  return (
                    <tr
                      key={order.id}
                      className="hover:bg-gray-50 transition-colors duration-150 group"
                    >
                      <td className="px-5 py-3.5">
                        <Link
                          href={`/admin/orders/${order.id}`}
                          className="text-[13px] text-gray-900 font-semibold hover:text-primary transition-colors"
                        >
                          #{order.vendor_reference || order.order_number}
                        </Link>
                      </td>
                      <td className="px-5 py-3.5">
                        <p className="text-[13px] text-gray-700">
                          {order.customer_first_name} {order.customer_last_name}
                        </p>
                        <p className="text-[11px] text-gray-400">
                          {order.customer_email}
                        </p>
                      </td>
                      <td className="px-5 py-3.5 text-[13px] text-gray-900 font-semibold">
                        {formatPrice(order.total_amount)}{" "}
                        <span className="text-gray-400 font-medium text-[11px]">
                          {order.currency || "MAD"}
                        </span>
                      </td>
                      <td className="px-5 py-3.5">
                        {latestPayment ? (
                          <StatusBadge status={latestPayment.status} />
                        ) : (
                          <span className="text-[11px] text-gray-400">—</span>
                        )}
                      </td>
                      <td className="px-5 py-3.5">
                        <StatusBadge status={order.status} />
                      </td>
                      <td className="px-5 py-3.5 text-right text-[12px] text-gray-500">
                        {new Date(order.created_at).toLocaleDateString("en-GB", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        })}
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
