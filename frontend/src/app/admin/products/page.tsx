"use client";

import { useEffect, useState } from "react";
import { fetchAdminProducts, fetchAdminCategories, fetchAdminBrands, getImageUrl, deleteAdminProduct } from "@/lib/api";
import CustomSelect from "@/components/admin/CustomSelect";
import ConfirmModal from "@/components/admin/ConfirmModal";
import { useToast } from "@/components/admin/Toast";
import Link from "next/link";
import { Plus, Search, Package, Edit, Trash2, ExternalLink, X } from "lucide-react";
import { formatPrice } from "@/lib/formatPrice";
import Image from "next/image";

export default function AdminProducts() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [categories, setCategories] = useState<any[]>([]);
  const [brands, setBrands] = useState<any[]>([]);
  const [categoryId, setCategoryId] = useState<string | number>("");
  const [stockStatus, setStockStatus] = useState<string | number>("");
  const [brandId, setBrandId] = useState<string | number>("");

  const { success, error } = useToast();
  const [modalConfig, setModalConfig] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    isAlert?: boolean;
    variant?: "danger" | "warning" | "info" | "success";
    onConfirm?: () => void;
  }>({ isOpen: false, title: "", message: "" });

  useEffect(() => {
    fetchAdminCategories().then(data => setCategories(data || []));
    fetchAdminBrands().then(data => setBrands(data || []));
  }, []);

  const loadProducts = async () => {
    setLoading(true);
    try {
      const res = await fetchAdminProducts(page, search, String(categoryId), String(stockStatus), String(brandId));
      setProducts(res.data);
      setTotalPages(res.last_page);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      loadProducts();
    }, 300);
    return () => clearTimeout(delayDebounceFn);
  }, [search, page, categoryId, stockStatus, brandId]);

  const handleDelete = (id: number) => {
    setModalConfig({
      isOpen: true,
      title: "Delete Product",
      message: "Are you sure you want to delete this product? All its configurations and variants will be deleted.",
      variant: "danger",
      onConfirm: async () => {
        setModalConfig(prev => ({ ...prev, isOpen: false }));
        try {
          await deleteAdminProduct(id);
          success("Product deleted successfully");
          loadProducts();
        } catch (err) {
          error("Failed to delete product");
        }
      }
    });
  };

  return (
    <div className="p-6 lg:p-8 max-w-[1400px]">
      <ConfirmModal 
        {...modalConfig} 
        onClose={() => setModalConfig(prev => ({ ...prev, isOpen: false }))} 
      />
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-[-0.02em]">Products</h1>
          <p className="text-[13px] text-gray-500 mt-1">Manage your catalog and inventory</p>
        </div>
        <Link
          href="/admin/products/new"
          className="inline-flex items-center gap-2 bg-gray-900 hover:bg-gray-800 text-white px-4 py-2 rounded-lg text-[13px] font-medium transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Product
        </Link>
      </div>

      <div className="bg-white border border-gray-100 rounded-xl shadow-sm overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex items-center justify-between gap-4">
          <div className="relative w-full max-w-md">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search products by name..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-[13px] focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
            />
          </div>
          <div className="flex items-center gap-3">
            <CustomSelect
              value={brandId}
              onChange={(val) => {
                setBrandId(val);
                setPage(1);
              }}
              options={brands.map(b => ({ value: b.id, label: b.name }))}
              placeholder="All Brands"
              className="w-[160px]"
            />
            <CustomSelect
              value={categoryId}
              onChange={(val) => {
                setCategoryId(val);
                setPage(1);
              }}
              options={categories.map(c => ({ value: c.id, label: c.name }))}
              placeholder="All Categories"
              className="w-[160px]"
            />
            <CustomSelect
              value={stockStatus}
              onChange={(val) => {
                setStockStatus(val);
                setPage(1);
              }}
              options={[
                { value: "in_stock", label: "In Stock" },
                { value: "out_of_stock", label: "Out of Stock" }
              ]}
              placeholder="All Stock"
              className="w-[140px]"
            />
          </div>
        </div>

        {/* Active Filters */}
        {(categoryId || brandId || stockStatus) && (
          <div className="px-4 py-3 bg-gray-50 border-b border-gray-100 flex flex-wrap items-center gap-2">
            <span className="text-[12px] font-medium text-gray-500 mr-1">Active filters:</span>
            {categoryId && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white border border-gray-200 text-[11px] font-medium text-gray-700">
                Category: {categories.find(c => c.id == categoryId)?.name || 'Unknown'}
                <button onClick={() => { setCategoryId(""); setPage(1); }} className="text-gray-400 hover:text-gray-900"><X className="w-3 h-3" /></button>
              </span>
            )}
            {brandId && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white border border-gray-200 text-[11px] font-medium text-gray-700">
                Brand: {brands.find(b => b.id == brandId)?.name || 'Unknown'}
                <button onClick={() => { setBrandId(""); setPage(1); }} className="text-gray-400 hover:text-gray-900"><X className="w-3 h-3" /></button>
              </span>
            )}
            {stockStatus && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white border border-gray-200 text-[11px] font-medium text-gray-700">
                Stock: {stockStatus === 'in_stock' ? 'In Stock' : 'Out of Stock'}
                <button onClick={() => { setStockStatus(""); setPage(1); }} className="text-gray-400 hover:text-gray-900"><X className="w-3 h-3" /></button>
              </span>
            )}
            <button 
              onClick={() => { setCategoryId(""); setBrandId(""); setStockStatus(""); setPage(1); }}
              className="text-[11px] font-medium text-primary hover:text-primary-hover ml-2"
            >
              Clear all
            </button>
          </div>
        )}

        {loading && products.length === 0 ? (
          <div className="p-12 flex justify-center">
            <div className="w-6 h-6 border-2 border-primary/20 border-t-primary rounded-full animate-spin" />
          </div>
        ) : products.length === 0 ? (
          <div className="p-12 text-center flex flex-col items-center">
            <Package className="w-12 h-12 text-gray-200 mb-3" />
            <h3 className="text-[14px] font-medium text-gray-900">No products found</h3>
            <p className="text-[13px] text-gray-500 mt-1">Try adjusting your search or create a new product.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="text-[11px] text-gray-400 uppercase tracking-wider bg-gray-50/50">
                  <th className="px-5 py-3 font-medium">Product</th>
                  <th className="px-5 py-3 font-medium">Category / Brand</th>
                  <th className="px-5 py-3 font-medium">Status</th>
                  <th className="px-5 py-3 font-medium">Stock (Total)</th>
                  <th className="px-5 py-3 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {products.map((product) => (
                  <tr key={product.group_id} className="group hover:bg-gray-50/50 transition-colors">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-gray-50 border border-gray-100 flex items-center justify-center overflow-hidden flex-shrink-0 relative">
                          {product.thumbnail ? (
                            <Image 
                              unoptimized
                              src={getImageUrl(product.thumbnail)} 
                              alt={product.name} 
                              fill 
                              className="object-contain p-1" 
                              sizes="40px"
                            />
                          ) : (
                            <Package className="w-5 h-5 text-gray-300" />
                          )}
                        </div>
                        <div>
                          <Link href={`/admin/products/${product.group_id}`} className="text-[14px] font-semibold text-gray-900 hover:text-primary transition-colors">
                            {product.name}
                          </Link>
                          <p className="text-[11.5px] text-gray-500 font-medium tracking-wide mt-0.5 flex items-center gap-1.5">
                            {product.configurations_count} {product.configurations_count === 1 ? 'configuration' : 'configurations'}
                            <span className="text-gray-300">•</span>
                            {product.variants_count} {product.variants_count === 1 ? 'variant' : 'variants'}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      <p className="text-[13px] text-gray-800 font-medium">{product.category?.name || "—"}</p>
                      <p className="text-[12px] text-gray-500">{product.brand?.name || "—"}</p>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium capitalize
                        ${product.status === 'active' ? 'bg-emerald-50 text-emerald-700' : 
                          product.status === 'draft' ? 'bg-amber-50 text-amber-700' : 'bg-gray-100 text-gray-700'}`}>
                        {product.status}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2">
                        <span className={`w-2 h-2 rounded-full ${
                          product.total_stock > 10 ? 'bg-emerald-500' : 
                          product.total_stock > 0 ? 'bg-amber-500' : 'bg-red-500'
                        }`} />
                        <span className="text-[13px] font-medium text-gray-900">
                          {product.total_stock || 0}
                        </span>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Link href={`/${product.slug}`} target="_blank" className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-gray-900 hover:bg-gray-100 transition-colors" title="View Storefront">
                          <ExternalLink className="w-4 h-4" />
                        </Link>
                        <Link href={`/admin/products/${product.group_id}`} className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-primary hover:bg-primary/5 transition-colors" title="Edit">
                          <Edit className="w-4 h-4" />
                        </Link>
                        <button 
                          onClick={() => handleDelete(product.group_id)}
                          className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors" 
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Footer info */}
        <div className="p-4 border-t border-gray-100 flex items-center justify-between">
          <p className="text-[13px] text-gray-500 font-medium">
            Showing {products.length} products on this page
          </p>

          {totalPages > 1 && (
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-3 py-1.5 rounded-lg border border-gray-200 text-[12px] font-medium text-gray-700 disabled:opacity-50 hover:bg-gray-50"
              >
                Previous
              </button>
              <span className="text-[12px] text-gray-500 font-medium px-2">
                Page {page} of {totalPages}
              </span>
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="px-3 py-1.5 rounded-lg border border-gray-200 text-[12px] font-medium text-gray-700 disabled:opacity-50 hover:bg-gray-50"
              >
                Next
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
