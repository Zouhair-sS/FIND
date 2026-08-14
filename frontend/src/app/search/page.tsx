"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState, Suspense } from "react";
import ProductCard from "@/components/ProductCard";
import type { Product } from "@/lib/api";

function SearchContent() {
  const searchParams = useSearchParams();
  const q = searchParams.get("q") || "";
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!q) {
      setProducts([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000/api";
    fetch(`${API_BASE}/products/search?q=${encodeURIComponent(q)}`)
      .then(res => res.json())
      .then(data => {
        setProducts(data);
        setLoading(false);
      })
      .catch(() => {
        setProducts([]);
        setLoading(false);
      });
  }, [q]);

  return (
    <div className="max-w-[1400px] mx-auto px-6 py-10 w-full">
      {/* Header matching CategoryClient */}
      <div className="flex flex-col mb-8 border-b border-gray-100 pb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Search Results</h1>
        <p className="text-gray-500">
          Showing results for <span className="font-semibold text-gray-900">&ldquo;{q}&rdquo;</span>
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-10 min-h-[60vh]">
        <div className="flex-1 relative">
          {loading ? (
        <div className="flex justify-center items-center py-24">
          <div className="w-8 h-8 border-4 border-gray-200 border-t-[#002366] rounded-full animate-spin" />
        </div>
      ) : products.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <div className="text-center py-24 bg-gray-50 rounded-2xl border border-gray-100">
          <p className="text-lg text-gray-500">No products found for &ldquo;{q}&rdquo;.</p>
        </div>
      )}
        </div>
      </div>
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={
      <div className="flex justify-center py-24 min-h-[60vh]">
        <div className="w-8 h-8 border-4 border-gray-200 border-t-[#002366] rounded-full animate-spin" />
      </div>
    }>
      <SearchContent />
    </Suspense>
  );
}
