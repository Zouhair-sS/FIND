"use client";

import { useState, useMemo, useEffect } from "react";
import { Category } from "@/lib/api";
import ProductCard from "./ProductCard";
import SidebarFilter from "./SidebarFilter";
import { X } from "lucide-react";
import { formatPrice } from "@/lib/formatPrice";
import { useRouter } from "next/navigation";
import { useCart } from "@/components/CartContext";

const variantLevelSlugs = ["ram_gb", "storage_gb", "processor", "screen_size"];

export default function CategoryClient({ category }: { category: Category }) {
  const products = useMemo(() => category.products ?? [], [category.products]);
  const filtersDef = category.filters ?? [];
  const priceRange = category.price ?? { min: 0, max: 0 };
  const router = useRouter();
  const { items: cartItems } = useCart();

  const [selectedFilters, setSelectedFilters] = useState<Record<string, (string | number)[]>>({});
  const [selectedPriceRange, setSelectedPriceRange] = useState<{min: number, max: number}>(priceRange);
  const [inStockOnly, setInStockOnly] = useState<boolean>(false);
  const [veryLimitedStockOnly, setVeryLimitedStockOnly] = useState<boolean>(false);

  const [activeFilters, setActiveFilters] = useState(selectedFilters);
  const [activePriceRange, setActivePriceRange] = useState(selectedPriceRange);
  const [activeInStockOnly, setActiveInStockOnly] = useState(inStockOnly);
  const [activeVeryLimitedStockOnly, setActiveVeryLimitedStockOnly] = useState(veryLimitedStockOnly);
  const [isFiltering, setIsFiltering] = useState(false);

  useEffect(() => {
    setIsFiltering(true);
    const t = setTimeout(() => {
      setActiveFilters(selectedFilters);
      setActivePriceRange(selectedPriceRange);
      setActiveInStockOnly(inStockOnly);
      setActiveVeryLimitedStockOnly(veryLimitedStockOnly);
      setIsFiltering(false);
    }, 300);
    return () => clearTimeout(t);
  }, [selectedFilters, selectedPriceRange, inStockOnly, veryLimitedStockOnly]);

  const handleFilterChange = (slug: string, value: string | number) => {
    if (slug === "category") {
      const categorySlug = String(value)
        .toLowerCase()
        .replace(/\s*&\s*/g, '-')
        .replace(/\s+/g, '-');
      router.push(`/${categorySlug}`);
      return;
    }

    setSelectedFilters((prev) => {
      const current = prev[slug] || [];
      if (current.includes(value)) {
        return { ...prev, [slug]: current.filter((v) => v !== value) };
      } else {
        return { ...prev, [slug]: [...current, value] };
      }
    });
  };

  const clearFilter = (slug: string, value: string | number) => {
    handleFilterChange(slug, value);
  };

  const clearAllFilters = () => {
    setSelectedFilters({});
    setSelectedPriceRange(priceRange);
    setInStockOnly(false);
    setVeryLimitedStockOnly(false);
  };

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      // 1. Stock Checks
      const totalStock = product.variants && product.variants.length > 0 
        ? product.variants.reduce((acc, v) => acc + (v.stock_quantity || 0), 0)
        : (product.stock || 0);
        
      const quantityInCart = product.variants && product.variants.length > 0
        ? product.variants.reduce((acc, v) => {
            const item = cartItems.find(i => i.productId === product.id && i.variantId === v.id);
            return acc + (item ? item.quantity : 0);
          }, 0)
        : (cartItems.find(i => i.productId === product.id)?.quantity || 0);

      const availableStock = totalStock - quantityInCart;

      if (activeInStockOnly && availableStock <= 0) return false;
      if (activeVeryLimitedStockOnly && (availableStock <= 0 || availableStock >= 5)) return false;

      // 2. Product-level Filters (Brand, Custom Attributes)
      for (const [slug, values] of Object.entries(activeFilters)) {
        if (values.length === 0) continue;
        if (variantLevelSlugs.includes(slug)) continue;

        if (slug === "brand") {
          if (!product.brand || !values.includes(product.brand.name)) return false;
        } else if (slug === "category") {
          if (!product.category || !values.includes(product.category.name)) return false;
        } else {
          // Custom attribute like 'os' or 'usage'
          const hasAttr = product.attribute_values?.some(
            (av: import("@/lib/api").AttributeValue) => av.attribute?.slug === slug && values.includes(av.value)
          );
          if (!hasAttr) return false;
        }
      }

      // 3. Variant-level Filters (RAM, Storage, Processor, Price)
      // A product is valid if at least ONE variant satisfies ALL selected variant filters AND price
      const activeVariantFilters = Object.entries(activeFilters).filter(
        ([slug, values]) => variantLevelSlugs.includes(slug) && values.length > 0
      );

      // If no variants exist for this product (rare/invalid data), just check price
      if (!product.variants || product.variants.length === 0) {
        return true; 
      }

      const hasMatchingVariant = product.variants.some((variant) => {
        // Price check
        const price = parseFloat(variant.price);
        if (price > activePriceRange.max || price < activePriceRange.min) return false;

        // Variant filters check
        for (const [slug, values] of activeVariantFilters) {
          const vVal = variant[slug as keyof typeof variant];
          if (!values.map(String).includes(String(vVal))) return false;
        }
        return true;
      });

      if (!hasMatchingVariant) return false;

      return true;
    });
  }, [products, activeInStockOnly, activeVeryLimitedStockOnly, activeFilters, activePriceRange, cartItems]);

  // Active Chips
  const activeChips: { slug: string; value: string | number; label: string }[] = [];
  Object.entries(selectedFilters).forEach(([slug, values]) => {
    values.forEach((val) => {
      let label = String(val);
      if (slug === "ram_gb") label += "GB";
      if (slug === "storage_gb") {
        label = Number(val) >= 1024 ? `${Number(val) / 1024}TB` : `${val}GB`;
      }
      if (slug === "screen_size") label += '"';
      activeChips.push({ slug, value: val, label });
    });
  });

  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  return (
    <div className="max-w-[1400px] mx-auto px-6 py-10 w-full">
      {/* Header */}
      <div className="flex flex-col mb-8 border-b border-gray-100 pb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            <h1 className="text-3xl font-bold text-gray-900">{category.name}</h1>
            <button 
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="flex items-center gap-2 px-4 py-2 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-full text-sm font-medium text-gray-700 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
              </svg>
              Filters
            </button>
          </div>
          <span className="text-sm text-gray-500 font-medium">
            {filteredProducts.length} {filteredProducts.length === 1 ? "result" : "results"}
          </span>
        </div>

        {/* Active Filters */}
        {(activeChips.length > 0 || selectedPriceRange.min > priceRange.min || selectedPriceRange.max < priceRange.max || inStockOnly || veryLimitedStockOnly) && (
          <div className="flex flex-wrap items-center gap-2 mt-2">
            <span className="text-xs text-gray-400 mr-2 uppercase tracking-wider font-semibold">Active:</span>
            
            {activeChips.map((chip) => (
              <button
                key={`${chip.slug}-${chip.value}`}
                onClick={() => clearFilter(chip.slug, chip.value)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-[#002366]/5 hover:bg-[#002366]/10 border border-[#002366]/10 text-[#002366] font-medium text-[13px] rounded-full transition-colors"
              >
                {chip.label}
                <X className="w-3 h-3 text-gray-500" />
              </button>
            ))}

            {(selectedPriceRange.min > priceRange.min || selectedPriceRange.max < priceRange.max) && (
              <button
                onClick={() => setSelectedPriceRange(priceRange)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-[#002366]/5 hover:bg-[#002366]/10 border border-[#002366]/10 text-[#002366] font-medium text-[13px] rounded-full transition-colors"
              >
                {formatPrice(selectedPriceRange.min)} - {formatPrice(selectedPriceRange.max)} MAD
                <X className="w-3 h-3 text-gray-500" />
              </button>
            )}

            {inStockOnly && (
              <button
                onClick={() => setInStockOnly(false)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-[#002366]/5 hover:bg-[#002366]/10 border border-[#002366]/10 text-[#002366] font-medium text-[13px] rounded-full transition-colors"
              >
                In Stock
                <X className="w-3 h-3 text-gray-500" />
              </button>
            )}

            {veryLimitedStockOnly && (
              <button
                onClick={() => setVeryLimitedStockOnly(false)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-[#002366]/5 hover:bg-[#002366]/10 border border-[#002366]/10 text-[#002366] font-medium text-[13px] rounded-full transition-colors"
              >
                Very Limited Stock
                <X className="w-3 h-3 text-gray-500" />
              </button>
            )}

            <button
              onClick={clearAllFilters}
              className="text-sm text-gray-500 hover:text-gray-900 underline ml-2 transition-colors"
            >
              Clear All
            </button>
          </div>
        )}
      </div>

      <div className="flex flex-col lg:flex-row gap-10">
        {/* Sidebar */}
        <div 
          className={`transition-all duration-500 ease-in-out origin-left flex-shrink-0 ${
            isSidebarOpen 
              ? "w-full lg:w-[260px] opacity-100 translate-x-0" 
              : "w-0 opacity-0 -translate-x-full overflow-hidden absolute lg:static"
          }`}
        >
          <div className="w-full lg:w-[260px] sticky top-24 max-h-[calc(100vh-120px)] overflow-y-auto overflow-x-hidden p-5 bg-[#f8f9fa] rounded-2xl border border-gray-100 custom-scrollbar">
            <SidebarFilter
              filters={filtersDef}
              priceRange={priceRange}
              selectedFilters={selectedFilters}
              onFilterChange={handleFilterChange}
              selectedPriceRange={selectedPriceRange}
              onPriceChange={setSelectedPriceRange}
              inStockOnly={inStockOnly}
              onInStockChange={setInStockOnly}
              veryLimitedStockOnly={veryLimitedStockOnly}
              onVeryLimitedStockChange={setVeryLimitedStockOnly}
            />
          </div>
        </div>

        {/* Product Grid */}
        <div className="flex-1 relative">
          {isFiltering && (
            <div className="absolute inset-0 z-10 bg-white/50 backdrop-blur-[2px] rounded-2xl transition-all duration-300 flex items-start justify-center pt-32">
              <div className="flex gap-2">
                <div className="w-2.5 h-2.5 bg-[#002366] rounded-full animate-silky-pulse" style={{ animationDelay: '0ms' }}></div>
                <div className="w-2.5 h-2.5 bg-[#002366] rounded-full animate-silky-pulse" style={{ animationDelay: '200ms' }}></div>
                <div className="w-2.5 h-2.5 bg-[#002366] rounded-full animate-silky-pulse" style={{ animationDelay: '400ms' }}></div>
              </div>
            </div>
          )}
          {filteredProducts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredProducts.map((product) => (
                <ProductCard 
                  key={product.id} 
                  product={{ ...product, category: product.category || category }} 
                  activeFilters={activeFilters}
                  activePriceRange={activePriceRange}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-24 bg-gray-50 rounded-2xl border border-gray-100">
              <p className="text-lg text-gray-500">No products match your selected filters.</p>
              <button 
                onClick={clearAllFilters}
                className="mt-4 px-6 py-2 bg-gray-900 text-white rounded-full text-sm font-medium hover:bg-gray-800 transition-colors"
              >
                Clear all filters
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
