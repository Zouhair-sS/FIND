"use client";

import { useEffect, useState } from "react";
import { fetchAdminCustomers, getImageUrl } from "@/lib/api";
import { formatPrice } from "@/lib/formatPrice";
import Link from "next/link";
import { Users, Search, ChevronRight, Mail } from "lucide-react";
import { motion } from "framer-motion";

export default function AdminCustomers() {
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchAdminCustomers()
      .then((data) => {
        // Assuming paginated response
        setCustomers(data.data || []);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  const filteredCustomers = customers.filter(c => 
    c.name?.toLowerCase().includes(search.toLowerCase()) ||
    c.email?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-6 lg:p-8 max-w-[1400px]">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-[22px] font-bold text-gray-900 tracking-[-0.03em] flex items-center gap-2">
            <Users className="w-6 h-6 text-primary" />
            Customers
          </h1>
          <p className="text-[13px] text-gray-500 mt-1">
            Manage your registered customers and their order history.
          </p>
        </div>
      </div>

      <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden flex flex-col">
        {/* Toolbar */}
        <div className="p-4 border-b border-gray-100 flex flex-col sm:flex-row gap-4 items-center justify-between bg-gray-50/50">
          <div className="relative w-full sm:w-[320px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search customers..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-[13px] border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all bg-white"
            />
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          {loading ? (
            <div className="p-8 flex items-center justify-center h-40">
              <div className="w-5 h-5 border-2 border-primary/20 border-t-primary rounded-full animate-spin" />
            </div>
          ) : filteredCustomers.length === 0 ? (
            <div className="p-12 text-center flex flex-col items-center">
              <div className="w-12 h-12 rounded-full bg-gray-50 flex items-center justify-center mb-3">
                <Users className="w-5 h-5 text-gray-400" />
              </div>
              <p className="text-[14px] font-medium text-gray-900">No customers found</p>
              <p className="text-[13px] text-gray-500 mt-1">Try adjusting your search query.</p>
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/50">
                  <th className="px-5 py-3.5 text-[11px] font-semibold text-gray-500 uppercase tracking-wider border-y border-gray-100">Customer</th>
                  <th className="px-5 py-3.5 text-[11px] font-semibold text-gray-500 uppercase tracking-wider border-y border-gray-100">Orders</th>
                  <th className="px-5 py-3.5 text-[11px] font-semibold text-gray-500 uppercase tracking-wider border-y border-gray-100">Total Spent</th>
                  <th className="px-5 py-3.5 text-[11px] font-semibold text-gray-500 uppercase tracking-wider border-y border-gray-100">Joined</th>
                  <th className="px-5 py-3.5 border-y border-gray-100"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filteredCustomers.map((customer) => (
                  <tr key={customer.id} className="hover:bg-gray-50/50 transition-colors group">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        {customer.profile_picture ? (
                          <img src={getImageUrl(customer.profile_picture)} alt={customer.name} className="w-9 h-9 rounded-full object-cover flex-shrink-0" />
                        ) : (
                          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center text-[12px] font-bold text-primary flex-shrink-0">
                            {customer.name?.substring(0, 2).toUpperCase() || "C"}
                          </div>
                        )}
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="text-[13px] font-semibold text-gray-900">
                              {customer.name || "Unknown Customer"}
                            </p>
                            {customer.is_guest && (
                              <span className="px-1.5 py-0.5 rounded-md bg-gray-100 text-gray-500 text-[10px] font-bold uppercase tracking-wider border border-gray-200">
                                Guest
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-1 text-[12px] text-gray-500 mt-0.5">
                            <Mail className="w-3 h-3" />
                            {customer.email || "No email"}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="text-[13px] font-medium text-gray-900 bg-gray-100 px-2 py-1 rounded-md">
                        {customer.orders_count || 0}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <p className="text-[13px] font-semibold text-gray-900">
                        {formatPrice(customer.total_spent || 0)} <span className="text-gray-400 font-medium text-[11px]">MAD</span>
                      </p>
                    </td>
                    <td className="px-5 py-3.5">
                      <p className="text-[13px] text-gray-600">
                        {new Date(customer.created_at).toLocaleDateString("en-GB", { month: "short", day: "numeric", year: "numeric" })}
                      </p>
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <Link
                        href={`/admin/customers/${customer.id}`}
                        className="inline-flex items-center justify-center p-2 rounded-lg text-gray-400 hover:text-primary hover:bg-primary/5 transition-colors"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
