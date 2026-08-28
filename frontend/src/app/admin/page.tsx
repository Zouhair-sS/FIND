"use client";

import { useEffect, useState, useRef } from "react";
import { fetchAdminDashboard } from "@/lib/api";
import { formatPrice } from "@/lib/formatPrice";
import Link from "next/link";
import {
  Package,
  MoreHorizontal,
  ChevronDown,
  ShoppingCart,
  TrendingUp,
  Users,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  ArrowRight,
  CheckCircle2,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { motion, Variants, AnimatePresence } from "framer-motion";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip as RechartsTooltip } from "recharts";

interface DashboardData {
  sales_chart_data: any[];
  recent_orders: any[];
  most_selling_products: any[];
  weekly_top_customers: any[];
  total_orders: number;
  total_customers: number;
  total_revenue: number;
  revenue_currency: string;
  orders_to_fulfill: number;
  orders_processing?: number;
  orders_shipped?: number;
  orders_delivered?: number;
  orders_trend: number | null;
  revenue_trend: number | null;
}

const STATUS_CONFIG: Record<string, { bg: string; text: string; dot: string; border: string }> = {
  pending:           { bg: "bg-amber-50",   text: "text-amber-700",   dot: "bg-amber-400",   border: "border-amber-100" },
  pending_payment:   { bg: "bg-amber-50",   text: "text-amber-700",   dot: "bg-amber-400",   border: "border-amber-100" },
  processing:        { bg: "bg-blue-50",    text: "text-blue-700",    dot: "bg-blue-400",    border: "border-blue-100" },
  shipped:           { bg: "bg-purple-50",  text: "text-purple-700",  dot: "bg-purple-400",  border: "border-purple-100" },
  delivered:         { bg: "bg-emerald-50", text: "text-emerald-700", dot: "bg-emerald-500", border: "border-emerald-100" },
  canceled:          { bg: "bg-red-50",     text: "text-red-700",     dot: "bg-red-500",     border: "border-red-100" },
};

function StatusBadge({ status }: { status: string }) {
  const c = STATUS_CONFIG[status] ?? STATUS_CONFIG.pending;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold border ${c.bg} ${c.text} ${c.border}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${c.dot}`} />
      <span className="capitalize">{status.replace(/_/g, " ")}</span>
    </span>
  );
}

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 12 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.06, duration: 0.35, ease: [0.23, 1, 0.32, 1] },
  }),
};

function CustomSelect({ value, onChange, options, align = "right" }: { value: string, onChange: (val: string) => void, options: {label: string, value: string}[], align?: "left" | "right" }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selected = options.find(o => o.value === value);

  return (
    <div className="relative" ref={ref}>
      <button 
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 bg-gray-50 hover:bg-gray-100 transition-colors border border-gray-100 text-gray-700 text-[12px] font-medium rounded-lg px-3 py-1.5 focus:outline-none"
      >
        {selected?.label}
        <ChevronDown className="w-3.5 h-3.5 text-gray-500" />
      </button>
      
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 4 }}
            transition={{ duration: 0.15 }}
            className={`absolute top-full mt-1 ${align === "right" ? "right-0" : "left-0"} bg-white border border-gray-100 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.1)] rounded-xl py-1 min-w-[120px] z-50 overflow-hidden`}
          >
            {options.map((opt) => (
              <button
                key={opt.value}
                onClick={() => {
                  onChange(opt.value);
                  setOpen(false);
                }}
                className={`w-full text-left px-3 py-2 text-[12px] font-medium transition-colors ${value === opt.value ? 'bg-gray-50 text-gray-900' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}`}
              >
                {opt.label}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function AdminDashboard() {
  const router = useRouter();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [chartPeriod, setChartPeriod] = useState("7_days");
  const [sellingPeriod, setSellingPeriod] = useState("30_days");

  useEffect(() => {
    setLoading(true);
    fetchAdminDashboard(chartPeriod, sellingPeriod)
      .then(setData)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [chartPeriod, sellingPeriod]);

  if (loading && !data) {
    return (
      <div className="p-8 flex items-center justify-center h-[60vh]">
        <div className="w-5 h-5 border-2 border-primary/20 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="p-8 flex flex-col items-center justify-center gap-3 h-[60vh]">
        <Package className="w-10 h-10 text-gray-300" />
        <p className="text-[14px] text-gray-500">Failed to load dashboard data.</p>
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8 max-w-[1400px] mx-auto space-y-6">
      
      <div className="mb-6">
        <h1 className="text-[24px] font-bold text-gray-900 tracking-tight flex items-center gap-2">
          Welcome back, Admin <img src="/images/UI/hand.png" alt="Wave" className="w-8 h-8 object-contain -mt-1" />
        </h1>
        <p className="text-[13px] text-gray-500 mt-1">Here's what's happening with your store today.</p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          {
            title: "Total Revenue",
            value: formatPrice(data.total_revenue || 0) + " " + (data.revenue_currency || "MAD"),
            icon: TrendingUp,
            trend: data.revenue_trend,
          },
          {
            title: "Total Orders",
            value: data.total_orders || 0,
            icon: ShoppingCart,
            trend: data.orders_trend,
            href: "/admin/orders",
          },
          {
            title: "Total Customers",
            value: data.total_customers || 0,
            icon: Users,
            trend: null,
            href: "/admin/customers",
          },
          {
            title: "To Fulfill",
            value: data.orders_to_fulfill || 0,
            icon: Clock,
            trend: null,
            href: "/admin/orders?highlight=to-fulfil",
            subStats: [
              { label: "Processing", count: data.orders_processing || 0, color: "bg-blue-50 text-blue-700 border-blue-100" },
              { label: "Shipped", count: data.orders_shipped || 0, color: "bg-purple-50 text-purple-700 border-purple-100" },
              { label: "Delivered", count: data.orders_delivered || 0, color: "bg-emerald-50 text-emerald-700 border-emerald-100", icon: CheckCircle2 },
            ]
          },
        ].map((stat, i) => (
          <motion.div
            key={i}
            custom={i}
            variants={cardVariants}
            initial="hidden"
            animate="visible"
            onClick={() => stat.href && router.push(stat.href)}
            className={`bg-white border border-gray-100 rounded-3xl p-6 shadow-sm flex flex-col justify-between relative overflow-hidden group ${stat.href ? "cursor-pointer hover:shadow-md hover:border-gray-200 transition-all" : ""}`}
          >
            <div className="flex items-center justify-between mb-4 relative z-10">
              <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center">
                <stat.icon className="w-5 h-5 text-gray-500 group-hover:scale-110 transition-transform duration-300" />
              </div>
              {stat.trend !== null && stat.trend !== undefined && (
                <div className={`flex items-center gap-1 text-[12px] font-bold ${stat.trend >= 0 ? "text-emerald-500" : "text-red-500"}`}>
                  {stat.trend >= 0 ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
                  <span>{Math.abs(stat.trend)}%</span>
                </div>
              )}
            </div>
            <div className="relative z-10">
              <p className="text-[13px] font-medium text-gray-500">{stat.title}</p>
              <h3 className="text-[24px] font-bold text-gray-900 mt-1 group-hover:text-primary transition-colors duration-300">{stat.value}</h3>
              {stat.subStats && (
                <div className="flex flex-wrap items-center gap-1.5 mt-3">
                  {stat.subStats.map((sub, idx) => (
                    <div key={idx} className={`flex items-center gap-1 px-2 py-0.5 rounded-full border ${sub.color}`}>
                      <span className="text-[11px] font-bold">{sub.count}</span>
                      <span className="text-[10px] font-medium">{sub.label}</span>
                      {sub.icon && <sub.icon className="w-3 h-3 ml-0.5" />}
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            {stat.href && (
              <div className="absolute right-6 bottom-6 opacity-0 translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300 ease-out z-0">
                <ArrowRight className="w-6 h-6 text-gray-900/10" />
              </div>
            )}
          </motion.div>
        ))}
      </div>

      {/* Top Row: Summary Chart (Left) + Most Selling Products (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Summary Chart */}
        <motion.div
          custom={0}
          variants={cardVariants}
          initial="hidden"
          animate="visible"
          className="lg:col-span-2 bg-white border border-gray-100 rounded-3xl p-6 shadow-sm flex flex-col"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
            <h2 className="text-[18px] font-bold text-gray-900">Summary</h2>
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-4 text-[12px] font-medium">
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#6ee7b7]" />
                  <span className="text-gray-600">Income Growth</span>
                </div>
              </div>
              <CustomSelect
                value={chartPeriod}
                onChange={setChartPeriod}
                options={[
                  { label: "Last 7 days", value: "7_days" },
                  { label: "Last 30 days", value: "30_days" },
                ]}
                align="right"
              />
            </div>
          </div>
          
          <div className="flex-1 min-h-[250px] -ml-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data.sales_chart_data || []}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6ee7b7" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#6ee7b7" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis 
                  dataKey="date" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 11, fill: '#9ca3af' }}
                  tickFormatter={(val) => {
                    const d = new Date(val);
                    return `${d.toLocaleString('default', { month: 'short' })} ${d.getDate()}`;
                  }}
                  minTickGap={20}
                  dy={10}
                />
                <YAxis 
                  yAxisId="left"
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 11, fill: '#9ca3af' }}
                  tickFormatter={(val) => `${val >= 1000 ? (val/1000).toFixed(0) + 'K' : val}`}
                  dx={-10}
                />
                <YAxis 
                  yAxisId="right" 
                  orientation="right" 
                  axisLine={false} 
                  tickLine={false} 
                  hide
                />
                <RechartsTooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', fontSize: '12px', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                  labelStyle={{ color: '#6b7280', marginBottom: '4px', fontSize: '11px' }}
                  labelFormatter={(val) => new Date(val as string | number).toLocaleDateString()}
                  itemStyle={{ fontWeight: 600 }}
                />
                <Area yAxisId="left" type="monotone" dataKey="revenue" name="Income Growth" stroke="#6ee7b7" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Most Selling Products */}
        <motion.div
          custom={1}
          variants={cardVariants}
          initial="hidden"
          animate="visible"
          className="lg:col-span-1 bg-white border border-gray-100 rounded-3xl p-6 shadow-sm flex flex-col"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-[18px] font-bold text-gray-900">Most Selling Products</h2>
            <div className="flex items-center gap-2 relative">
              <CustomSelect
                value={sellingPeriod}
                onChange={setSellingPeriod}
                options={[
                  { label: "30 Days", value: "30_days" },
                  { label: "All Time", value: "all_time" },
                ]}
                align="right"
              />
              <button className="text-gray-400 hover:text-gray-600 hover:bg-gray-50 p-1 rounded-md transition-colors">
                <MoreHorizontal className="w-5 h-5" />
              </button>
            </div>
          </div>
          
          <div className="flex-1 space-y-4">
            {data.most_selling_products?.length === 0 ? (
              <p className="text-[13px] text-gray-400 text-center py-4">No data available.</p>
            ) : (
              data.most_selling_products?.map((product, idx) => (
                <div key={product.id || idx} className="flex items-center justify-between group">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-gray-50 flex items-center justify-center p-2 flex-shrink-0">
                      {product.thumbnail ? (
                        <img src={product.thumbnail.startsWith('/storage') ? `http://127.0.0.1:8000${product.thumbnail}` : product.thumbnail} alt={product.name} className="w-full h-full object-contain mix-blend-multiply" />
                      ) : (
                        <Package className="w-6 h-6 text-gray-300" />
                      )}
                    </div>
                    <div>
                      <p className="text-[14px] font-bold text-gray-900 leading-tight group-hover:text-primary transition-colors cursor-pointer">{product.name}</p>
                      <p className="text-[12px] text-gray-400 mt-0.5">ID: {product.id}</p>
                    </div>
                  </div>
                  <div className="px-3 py-1.5 rounded-lg border border-gray-100 bg-white shadow-sm">
                    <p className="text-[12px] font-bold text-gray-700">{product.total_sales} Sales</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </motion.div>
      </div>

      {/* Bottom Row: Recent Orders (Left) + Weekly Top Customers (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Recent Orders Table */}
        <motion.div
          custom={2}
          variants={cardVariants}
          initial="hidden"
          animate="visible"
          className="lg:col-span-2 bg-white border border-gray-100 rounded-3xl p-6 shadow-sm overflow-hidden flex flex-col"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-[18px] font-bold text-gray-900">Recent Orders</h2>
            <Link href="/admin/orders" className="px-4 py-1.5 rounded-lg border border-gray-200 text-[12px] font-bold text-primary hover:bg-gray-50 transition-colors">
              View All
            </Link>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left border-separate border-spacing-y-3">
              <thead>
                <tr className="text-[12px] font-semibold text-gray-400 uppercase tracking-wider border-b border-gray-100">
                  <th className="pb-3 whitespace-nowrap">Product & Order</th>
                  <th className="pb-3 whitespace-nowrap">Customer</th>
                  <th className="pb-3 whitespace-nowrap">Date</th>
                  <th className="pb-3 whitespace-nowrap text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {data.recent_orders?.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-8 text-center text-[13px] text-gray-400">
                      No recent orders
                    </td>
                  </tr>
                ) : (
                  data.recent_orders?.map((order) => {
                    const firstItem = order.items?.[0];
                    const product = firstItem?.product_variant?.product;
                    const productImg = product?.images?.[0]?.url;
                    return (
                      <tr key={order.id} className="group hover:bg-gray-50/50 transition-colors">
                        <td className="py-3 pr-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center p-1.5 flex-shrink-0 border border-gray-100">
                              {productImg ? (
                                <img src={productImg.startsWith('/storage') ? `http://127.0.0.1:8000${productImg}` : productImg} alt={product.name} className="w-full h-full object-contain mix-blend-multiply" />
                              ) : (
                                <Package className="w-5 h-5 text-gray-300" />
                              )}
                            </div>
                            <div className="min-w-0">
                              <p className="text-[13px] font-bold text-gray-900 group-hover:text-primary transition-colors cursor-pointer truncate max-w-[180px] sm:max-w-[220px]">
                                {product?.name || "Multiple items"}
                              </p>
                              <p className="text-[11px] font-medium text-gray-400 mt-0.5 truncate">
                                #{order.vendor_reference || order.order_number}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 pr-4">
                          <div className="flex items-center gap-2">
                            <span className="text-[13px] font-bold text-gray-700 cursor-pointer hover:text-gray-900 transition-colors whitespace-nowrap">
                              {order.customer_first_name} {order.customer_last_name}
                            </span>
                            {!order.user_id && (
                              <span className="px-1.5 py-0.5 rounded-md bg-gray-100 text-gray-500 text-[9px] font-bold uppercase tracking-wider border border-gray-200 flex-shrink-0">
                                Guest
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="py-3 pr-4">
                          <span className="text-[13px] font-medium text-gray-500 whitespace-nowrap">
                            {new Date(order.created_at).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}
                          </span>
                        </td>
                        <td className="py-3 text-right">
                          <StatusBadge status={order.status} />
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </motion.div>

        {/* Weekly Top Customers */}
        <motion.div
          custom={3}
          variants={cardVariants}
          initial="hidden"
          animate="visible"
          className="lg:col-span-1 bg-white border border-gray-100 rounded-3xl p-6 shadow-sm flex flex-col"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-[18px] font-bold text-gray-900">Weekly Top Customers</h2>
            <button className="text-gray-400 hover:text-gray-600 transition-colors">
              <MoreHorizontal className="w-5 h-5" />
            </button>
          </div>
          
          <div className="flex-1 space-y-5">
            {data.weekly_top_customers?.length === 0 ? (
              <p className="text-[13px] text-gray-400 text-center py-4">No top customers this week.</p>
            ) : (
              data.weekly_top_customers?.map((customer, idx) => {
                const initials = (customer.name ? customer.name.substring(0, 2).toUpperCase() : "CU");
                return (
                  <div key={customer.id || idx} className="flex items-center justify-between group">
                    <div className="flex items-center gap-4">
                      {customer.profile_picture ? (
                        <img 
                          src={customer.profile_picture.startsWith('/storage') ? `http://127.0.0.1:8000${customer.profile_picture}` : customer.profile_picture} 
                          alt={customer.name} 
                          className="w-12 h-12 rounded-full object-cover border border-gray-100 shadow-sm"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-full bg-gray-50 border border-gray-100 flex items-center justify-center text-gray-500 font-bold text-[14px]">
                          {initials}
                        </div>
                      )}
                      <div>
                        <p className="text-[14px] font-bold text-gray-900 leading-tight group-hover:text-gray-700 transition-colors cursor-pointer">
                          {customer.name}
                        </p>
                        <p className="text-[12px] text-gray-400 mt-0.5">{customer.orders_count} Orders</p>
                      </div>
                    </div>
                    <Link href={`/admin/customers/${customer.id}`} className="px-4 py-1.5 rounded-lg border border-gray-200 bg-gray-50 text-[12px] font-bold text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors shadow-sm">
                      View
                    </Link>
                  </div>
                );
              })
            )}
          </div>
        </motion.div>
      </div>

    </div>
  );
}
