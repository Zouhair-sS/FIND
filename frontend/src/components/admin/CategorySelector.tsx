import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check, Laptop, Smartphone, Monitor, Headphones } from 'lucide-react';

interface Category {
  id: number;
  name: string;
}

interface CategorySelectorProps {
  value: string | number;
  onChange: (value: string | number) => void;
  categories: Category[];
}

const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  "Laptops": <Laptop className="w-4 h-4" />,
  "Smartphones": <Smartphone className="w-4 h-4" />,
  "Monitors": <Monitor className="w-4 h-4" />,
  "Accessories": <Headphones className="w-4 h-4" />
};

export default function CategorySelector({ value, onChange, categories = [] }: CategorySelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Filter to only include the allowed storefront categories
  const allowedCategories = ["Laptops", "Smartphones", "Monitors", "Accessories"];
  const filteredCategories = categories.filter(c => allowedCategories.includes(c.name));

  const selectedCategory = filteredCategories.find(c => String(c.id) === String(value));

  return (
    <div className="relative" ref={containerRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm bg-white flex items-center justify-between hover:bg-gray-50 transition-all focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary shadow-sm h-[42px]"
      >
        <div className="flex items-center gap-3">
          {selectedCategory ? (
            <div className="w-7 h-7 rounded-lg bg-gray-50 border border-gray-100 text-gray-500 flex items-center justify-center">
              {CATEGORY_ICONS[selectedCategory.name]}
            </div>
          ) : (
            <div className="w-7 h-7 bg-gray-50 border border-gray-100 rounded-lg flex items-center justify-center">
              <span className="text-xs text-gray-400 font-medium">C</span>
            </div>
          )}
          <span className={value ? "text-gray-900 font-semibold tracking-wide" : "text-gray-400 font-medium"}>
            {selectedCategory ? selectedCategory.name : 'Select Category'}
          </span>
        </div>
        <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute z-50 top-full left-0 mt-2 w-full max-h-[300px] overflow-y-auto bg-white border border-gray-100 rounded-xl shadow-xl py-2 p-1">
          <button
            type="button"
            onClick={() => { onChange(""); setIsOpen(false); }}
            className="w-full px-4 py-2.5 text-left text-sm text-gray-500 hover:bg-gray-50 hover:text-gray-900 rounded-lg transition-colors font-medium mb-1"
          >
            Select Category
          </button>
          {filteredCategories.map((c) => {
            const isSelected = String(c.id) === String(value);
            return (
              <button
                key={c.id}
                type="button"
                onClick={() => { onChange(c.id); setIsOpen(false); }}
                className={`w-full px-4 py-2.5 flex items-center justify-between text-left text-sm transition-all rounded-lg group ${
                  isSelected ? 'bg-gray-50' : 'hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-7 h-7 rounded-lg flex items-center justify-center transition-colors ${isSelected ? 'bg-white shadow-sm border border-gray-200 text-gray-900' : 'bg-transparent text-gray-500 group-hover:bg-white group-hover:shadow-sm group-hover:border group-hover:border-gray-200 group-hover:text-gray-900'}`}>
                    {CATEGORY_ICONS[c.name]}
                  </div>
                  <span className={`font-semibold tracking-wide ${isSelected ? 'text-gray-900' : 'text-gray-600 group-hover:text-gray-900'}`}>
                    {c.name}
                  </span>
                </div>
                {isSelected && <Check className="w-4 h-4 text-gray-900" strokeWidth={3} />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
