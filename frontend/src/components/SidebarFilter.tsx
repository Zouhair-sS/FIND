"use client";

import { useState } from "react";
import { FilterGroup } from "@/lib/api";
import { ChevronDown, ChevronUp } from "lucide-react";
import { formatPrice } from "@/lib/formatPrice";

interface SidebarFilterProps {
  filters: FilterGroup[];
  priceRange: { min: number; max: number };
  selectedFilters: Record<string, (string | number)[]>;
  onFilterChange: (slug: string, value: string | number) => void;
  selectedMaxPrice: number;
  onPriceChange: (value: number) => void;
  inStockOnly: boolean;
  onInStockChange: (val: boolean) => void;
}

export default function SidebarFilter({
  filters,
  priceRange,
  selectedFilters,
  onFilterChange,
  selectedMaxPrice,
  onPriceChange,
  inStockOnly,
  onInStockChange,
}: SidebarFilterProps) {
  return (
    <div className="w-full">
      <h2 className="text-lg font-bold text-gray-900 mb-6">Filters</h2>

      {/* Price Slider */}
      {priceRange.max > priceRange.min && (
        <div className="mb-8">
          <h3 className="text-xs font-semibold tracking-wider text-gray-500 uppercase mb-4">Price</h3>
          <input
            type="range"
            min={priceRange.min}
            max={priceRange.max}
            step={1}
            value={selectedMaxPrice}
            onChange={(e) => onPriceChange(Number(e.target.value))}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-gray-900"
          />
          <div className="flex justify-between text-sm text-gray-500 mt-2">
            <span>{formatPrice(priceRange.min)} MAD</span>
            <span>{formatPrice(selectedMaxPrice)} MAD</span>
          </div>
        </div>
      )}

      {/* Dynamic Filters */}
      {filters.map((filterGroup, idx) => (
        <FilterSection
          key={filterGroup.slug}
          filterGroup={filterGroup}
          selectedValues={selectedFilters[filterGroup.slug] || []}
          onChange={(val) => onFilterChange(filterGroup.slug, val)}
          defaultOpen={idx < 4} // Open first 4 by default
        />
      ))}

      {/* In Stock Only */}
      <label className="mt-8 pt-6 border-t border-gray-100 flex items-center justify-between cursor-pointer group">
        <span className="text-sm font-medium text-gray-900 group-hover:text-gray-700 transition-colors">In stock only</span>
        <input
          type="checkbox"
          checked={inStockOnly}
          onChange={(e) => onInStockChange(e.target.checked)}
          className="w-4 h-4 text-gray-900 bg-gray-100 border-gray-300 rounded focus:ring-gray-900 cursor-pointer"
        />
      </label>
    </div>
  );
}

function FilterSection({
  filterGroup,
  selectedValues,
  onChange,
  defaultOpen,
}: {
  filterGroup: FilterGroup;
  selectedValues: (string | number)[];
  onChange: (value: string | number) => void;
  defaultOpen: boolean;
}) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  if (filterGroup.values.length === 0) return null;

  return (
    <div className="mb-6">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between w-full text-left"
      >
        <h3 className="text-xs font-semibold tracking-wider text-gray-500 uppercase">
          {filterGroup.name}
        </h3>
        {isOpen ? (
          <ChevronUp className="w-4 h-4 text-gray-400" />
        ) : (
          <ChevronDown className="w-4 h-4 text-gray-400" />
        )}
      </button>

      {isOpen && (
        <div className="mt-4 space-y-3">
          {filterGroup.values.map((option) => {
            const isChecked = selectedValues.includes(option.value);
            // Format labels for RAM and Storage nicely if they are numbers
            let label = String(option.value);
            if (filterGroup.slug === "ram_gb") label += "GB";
            if (filterGroup.slug === "storage_gb") {
              label = Number(option.value) >= 1024 ? `${Number(option.value) / 1024}TB` : `${option.value}GB`;
            }
            if (filterGroup.slug === "screen_size") label += '"';

            if (filterGroup.slug === "category") {
              return (
                <button
                  key={option.value}
                  onClick={() => onChange(option.value)}
                  className="flex items-center justify-between w-full cursor-pointer group py-1.5"
                >
                  <div className="flex items-center">
                    <svg 
                      className="w-3.5 h-3.5 text-gray-400 group-hover:text-gray-900 transform group-hover:translate-x-1 transition-all duration-300 mr-2" 
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                    </svg>
                    <span className="text-sm text-gray-700 group-hover:text-gray-900 transform group-hover:translate-x-1 transition-all duration-300">
                      {label}
                    </span>
                  </div>
                  <span className="text-xs text-gray-400 transition-colors duration-300">{option.count}</span>
                </button>
              );
            }

            return (
              <label
                key={option.value}
                className="flex items-center justify-between cursor-pointer group py-1"
              >
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={() => onChange(option.value)}
                    className="w-4 h-4 text-gray-900 bg-gray-100 border-gray-300 rounded focus:ring-gray-900 transition-all duration-200"
                  />
                  <span className="ml-3 text-sm text-gray-700 group-hover:text-gray-900 transition-colors duration-200">
                    {label}
                  </span>
                </div>
                <span className="text-xs text-gray-400">{option.count}</span>
              </label>
            );
          })}
        </div>
      )}
    </div>
  );
}
