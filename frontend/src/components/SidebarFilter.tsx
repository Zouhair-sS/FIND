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
  selectedPriceRange: { min: number; max: number };
  onPriceChange: (value: { min: number; max: number }) => void;
  inStockOnly: boolean;
  onInStockChange: (val: boolean) => void;
  veryLimitedStockOnly: boolean;
  onVeryLimitedStockChange: (val: boolean) => void;
}

export default function SidebarFilter({
  filters,
  priceRange,
  selectedFilters,
  onFilterChange,
  selectedPriceRange,
  onPriceChange,
  inStockOnly,
  onInStockChange,
  veryLimitedStockOnly,
  onVeryLimitedStockChange,
}: SidebarFilterProps) {
  return (
    <div className="w-full">
      <h2 className="text-lg font-bold text-gray-900 mb-6">Filters</h2>

      {/* Price Range */}
      {priceRange.max > priceRange.min && (
        <div className="mb-8 p-4 bg-white rounded-xl shadow-sm border border-gray-100/50">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-[15px] font-semibold text-gray-900">Gamme de prix</h3>
            <ChevronUp className="w-4 h-4 text-gray-500" />
          </div>
          
          <div className="relative w-full h-6 flex items-center mb-6">
            {/* Track Background */}
            <div className="absolute w-full h-[3px] bg-gray-200 rounded-full" />
            {/* Active Track */}
            <div 
              className="absolute h-[3px] bg-[#002366] rounded-full"
              style={{ 
                left: `${((selectedPriceRange.min - priceRange.min) / (priceRange.max - priceRange.min)) * 100}%`, 
                right: `${100 - ((selectedPriceRange.max - priceRange.min) / (priceRange.max - priceRange.min)) * 100}%` 
              }}
            />
            {/* Min Slider */}
            <input
              type="range"
              min={priceRange.min}
              max={priceRange.max}
              value={selectedPriceRange.min}
              onChange={(e) => {
                const val = Math.min(Number(e.target.value), selectedPriceRange.max - (priceRange.max - priceRange.min) * 0.05);
                onPriceChange({ ...selectedPriceRange, min: val });
              }}
              className="absolute w-full h-full pointer-events-none dual-slider-thumb z-20"
            />
            {/* Max Slider */}
            <input
              type="range"
              min={priceRange.min}
              max={priceRange.max}
              value={selectedPriceRange.max}
              onChange={(e) => {
                const val = Math.max(Number(e.target.value), selectedPriceRange.min + (priceRange.max - priceRange.min) * 0.05);
                onPriceChange({ ...selectedPriceRange, max: val });
              }}
              className="absolute w-full h-full pointer-events-none dual-slider-thumb z-20"
            />
          </div>
          <div className="flex justify-between text-[15px] text-gray-500">
            <span>{formatPrice(selectedPriceRange.min)} <span className="text-xs">DH</span></span>
            <span>{formatPrice(selectedPriceRange.max)} <span className="text-xs">DH</span></span>
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

      {/* Stock Filters */}
      <div className="mt-8 pt-6 border-t border-gray-100 space-y-4">
        <label className="flex items-center justify-between cursor-pointer group">
          <span className="text-sm font-medium text-gray-900 group-hover:text-gray-700 transition-colors">In stock only</span>
          <input
            type="checkbox"
            checked={inStockOnly}
            onChange={(e) => onInStockChange(e.target.checked)}
            className="w-4 h-4 text-gray-900 bg-gray-100 border-gray-300 rounded focus:ring-gray-900 cursor-pointer"
          />
        </label>
        
        <label className="flex items-center justify-between cursor-pointer group">
          <span className="text-sm font-medium text-yellow-600 group-hover:text-yellow-700 transition-colors">Very Limited Stock</span>
          <input
            type="checkbox"
            checked={veryLimitedStockOnly}
            onChange={(e) => onVeryLimitedStockChange(e.target.checked)}
            className="w-4 h-4 text-yellow-600 bg-gray-100 border-gray-300 rounded focus:ring-yellow-600 cursor-pointer"
          />
        </label>
      </div>
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
        <div className="mt-3 space-y-2 max-h-[240px] overflow-y-auto custom-scrollbar pr-1">
          {filterGroup.slug === "category" ? (
            (() => {
              const ACCESSORY_SUBCATEGORIES = ['Headphones & Earbuds', 'Mice', 'Keyboards', 'SmartWatches'];
              const mainOptions = filterGroup.values.filter(opt => !ACCESSORY_SUBCATEGORIES.includes(String(opt.value)));
              const accessoryOptions = filterGroup.values.filter(opt => ACCESSORY_SUBCATEGORIES.includes(String(opt.value)));
              
              const accessoriesCount = accessoryOptions.reduce((sum, opt) => sum + (opt.count || 0), 0);

              return (
                <div key="category-group" className="w-full space-y-1">
                  {mainOptions.map(option => (
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
                          {option.value}
                        </span>
                      </div>
                      <span className="text-xs text-gray-400 transition-colors duration-300">{option.count}</span>
                    </button>
                  ))}

                  {accessoryOptions.length > 0 && (
                    <div className="group/acc relative w-full">
                      <button
                        onClick={() => onChange("Accessories")}
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
                          <span className="text-sm font-medium text-gray-700 group-hover:text-gray-900 transform group-hover:translate-x-1 transition-all duration-300">
                            Accessories
                          </span>
                        </div>
                        <span className="text-xs text-gray-400 transition-colors duration-300">{accessoriesCount}</span>
                      </button>
                      
                      {/* Subcategories reveal on hover */}
                      <div className="grid grid-rows-[0fr] opacity-0 group-hover/acc:grid-rows-[1fr] group-hover/acc:opacity-100 transition-all duration-500 ease-in-out">
                        <div className="overflow-hidden">
                          <div className="py-2 space-y-1.5 border-l-2 border-gray-100 ml-1.5 pl-3">
                            {accessoryOptions.map(option => (
                              <button
                                key={option.value}
                                onClick={() => onChange(option.value)}
                                className="flex items-center justify-between w-full cursor-pointer group/sub py-1"
                              >
                                <span className="text-[13px] text-gray-500 group-hover/sub:text-gray-900 transition-colors duration-300 transform group-hover/sub:translate-x-1">
                                  {option.value}
                                </span>
                                <span className="text-[11px] text-gray-400">{option.count}</span>
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })()
          ) : filterGroup.slug === "processor" ? (
            <ProcessorFilter 
              options={filterGroup.values} 
              selectedValues={selectedValues} 
              onChange={onChange} 
            />
          ) : (
            filterGroup.values.map((option) => {
              const isChecked = selectedValues.includes(option.value);
              // Format labels for RAM and Storage nicely if they are numbers
              let label = String(option.value);
              if (filterGroup.slug === "ram_gb") label += "GB";
              if (filterGroup.slug === "storage_gb") {
                label = Number(option.value) >= 1000 ? (Number(option.value) % 1024 === 0 ? `${Number(option.value) / 1024}TB` : `${Number(option.value) / 1000}TB`) : `${option.value}GB`;
              }
              if (filterGroup.slug === "screen_size") label += '"';

              return (
                <label
                  key={option.value}
                  className="flex items-center justify-between cursor-pointer group py-0.5"
                >
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => onChange(option.value)}
                      className="w-3.5 h-3.5 text-gray-900 bg-gray-100 border-gray-300 rounded focus:ring-gray-900 transition-all duration-200"
                    />
                    <span className="ml-2.5 text-[13px] text-gray-700 group-hover:text-gray-900 transition-colors duration-200">
                      {label}
                    </span>
                  </div>
                  <span className="text-[11px] text-gray-400">{option.count}</span>
                </label>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}

function ProcessorFilter({
  options,
  selectedValues,
  onChange,
}: {
  options: { value: string | number; count: number }[];
  selectedValues: (string | number)[];
  onChange: (value: string | number) => void;
}) {
  const groups: Record<string, Record<string, typeof options>> = {
    'Apple M Processors': {
      'M1 Family': [], 'M2 Family': [], 'M3 Family': [], 'M4 Family': [], 'M5 Family': []
    },
    'Intel Processors': {
      'Core Ultra': [], 'Core i3': [], 'Core i5': [], 'Core i7': [], 'Core i9': [], 'Other Intel': []
    },
    'AMD Processors': {
      'Ryzen 3': [], 'Ryzen 5': [], 'Ryzen 7': [], 'Ryzen 9': [], 'Other AMD': []
    },
    'Other': {
      'All': []
    }
  };

  options.forEach(opt => {
    const v = String(opt.value);
    if (v.startsWith('M1')) groups['Apple M Processors']['M1 Family'].push(opt);
    else if (v.startsWith('M2')) groups['Apple M Processors']['M2 Family'].push(opt);
    else if (v.startsWith('M3')) groups['Apple M Processors']['M3 Family'].push(opt);
    else if (v.startsWith('M4')) groups['Apple M Processors']['M4 Family'].push(opt);
    else if (v.startsWith('M5')) groups['Apple M Processors']['M5 Family'].push(opt);
    else if (v.startsWith('Core Ultra')) groups['Intel Processors']['Core Ultra'].push(opt);
    else if (v.startsWith('Core i3')) groups['Intel Processors']['Core i3'].push(opt);
    else if (v.startsWith('Core i5')) groups['Intel Processors']['Core i5'].push(opt);
    else if (v.startsWith('Core i7')) groups['Intel Processors']['Core i7'].push(opt);
    else if (v.startsWith('Core i9')) groups['Intel Processors']['Core i9'].push(opt);
    else if (v.startsWith('Core') || v.startsWith('Intel')) groups['Intel Processors']['Other Intel'].push(opt);
    else if (v.startsWith('Ryzen 3')) groups['AMD Processors']['Ryzen 3'].push(opt);
    else if (v.startsWith('Ryzen 5')) groups['AMD Processors']['Ryzen 5'].push(opt);
    else if (v.startsWith('Ryzen 7')) groups['AMD Processors']['Ryzen 7'].push(opt);
    else if (v.startsWith('Ryzen 9')) groups['AMD Processors']['Ryzen 9'].push(opt);
    else if (v.startsWith('Ryzen') || v.startsWith('AMD')) groups['AMD Processors']['Other AMD'].push(opt);
    else groups['Other']['All'].push(opt);
  });

  return (
    <div className="w-full space-y-1.5 max-h-[240px] overflow-y-auto custom-scrollbar pr-1 pl-2.5 border-l-2 border-gray-200/60 ml-1.5 mt-1.5">
      {Object.entries(groups).map(([brandName, families]) => {
        const activeFamilies = Object.entries(families).filter(([k, v]) => v.length > 0);
        if (activeFamilies.length === 0) return null;

        return (
          <div key={brandName} className="group/brand relative w-full mb-1">
            <div className="flex items-center justify-between w-full cursor-pointer py-1.5">
              <span className="text-[13px] font-medium text-gray-700 group-hover/brand:text-gray-900 transition-colors">
                {brandName}
              </span>
              <ChevronDown className="w-3.5 h-3.5 text-gray-400 group-hover/brand:text-gray-600" />
            </div>
            
            {/* Families dropdown, reveals on brand hover */}
            <div className="grid grid-rows-[0fr] opacity-0 group-hover/brand:grid-rows-[1fr] group-hover/brand:opacity-100 transition-all duration-300">
              <div className="overflow-hidden">
                <div className="py-1 border-l-2 border-gray-100 ml-2 pl-3 space-y-1">
                  {activeFamilies.map(([familyName, opts]) => (
                    <ProcessorFamily key={familyName} name={familyName} options={opts} selectedValues={selectedValues} onChange={onChange} />
                  ))}
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function ProcessorFamily({ name, options, selectedValues, onChange }: { name: string, options: any[], selectedValues: any[], onChange: any }) {
  const [isOpen, setIsOpen] = useState(false);
  
  if (name === 'All') {
    return (
      <div className="w-full space-y-1">
        {options.map(opt => (
          <label key={opt.value} className="flex items-center justify-between cursor-pointer group/opt py-0.5">
             <div className="flex items-center">
               <input
                 type="checkbox"
                 checked={selectedValues.includes(opt.value)}
                 onChange={() => onChange(opt.value)}
                 className="w-3.5 h-3.5 text-gray-900 bg-gray-100 border-gray-300 rounded focus:ring-gray-900 transition-all duration-200"
               />
               <span className="ml-2 text-[13px] text-gray-500 group-hover/opt:text-gray-900">{opt.value}</span>
             </div>
             <span className="text-[10px] text-gray-400">{opt.count}</span>
          </label>
        ))}
      </div>
    );
  }

  return (
    <div className="w-full">
      <button onClick={() => setIsOpen(!isOpen)} className="flex items-center justify-between w-full cursor-pointer py-1 group/fam">
        <span className="text-[13px] text-gray-600 group-hover/fam:text-gray-900">{name}</span>
        <span className="text-[10px] text-gray-400 font-mono">{isOpen ? '-' : '+'}</span>
      </button>
      
      {isOpen && (
        <div className="py-1 border-l border-gray-100 ml-2 pl-2 space-y-1 mt-1">
          {options.map(opt => (
            <label key={opt.value} className="flex items-center justify-between cursor-pointer group/opt py-0.5">
               <div className="flex items-center">
                 <input
                   type="checkbox"
                   checked={selectedValues.includes(opt.value)}
                   onChange={() => onChange(opt.value)}
                   className="w-3.5 h-3.5 text-gray-900 bg-gray-100 border-gray-300 rounded focus:ring-gray-900 transition-all duration-200"
                 />
                 <span className="ml-2 text-[12px] text-gray-500 group-hover/opt:text-gray-900">{opt.value}</span>
               </div>
               <span className="text-[10px] text-gray-400">{opt.count}</span>
            </label>
          ))}
        </div>
      )}
    </div>
  )
}
