import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check, Search } from 'lucide-react';

const COLOR_CATEGORIES = [
  {
    name: 'Standard / Generic',
    colors: [
      { name: 'Black', hex: '#000000' },
      { name: 'White', hex: '#ffffff' },
      { name: 'Navy', hex: '#1a2238' },
      { name: 'Pink', hex: '#f3d1d6' },
      { name: 'Teal', hex: '#008080' },
      { name: 'Ultramarine', hex: '#120a8f' },
      { name: 'Intense Blue', hex: '#234e70' },
      { name: 'Orange', hex: '#e37424' },
      { name: 'Jade', hex: '#8b9c90' },
      { name: 'Moonstone', hex: '#e3e0d8' },
      { name: 'Violet', hex: '#a89eb6' },
      { name: 'Cloud White', hex: '#f8f8f8' },
      { name: 'Light Gold', hex: '#e8d8c8' },
      { name: 'Lavender', hex: '#c9c2d6' },
      { name: 'Mist Blue', hex: '#a8bccc' },
      { name: 'Sage', hex: '#9ea996' },
    ]
  },
  {
    name: 'Apple Colors',
    colors: [
      { name: 'Space Black', hex: '#2e2e2e' },
      { name: 'Silver', hex: '#e3e4e5' },
      { name: 'Starlight', hex: '#f0e4d3' },
      { name: 'Midnight', hex: '#1c1f24' },
      { name: 'Sky Blue', hex: '#b0c4de' },
    ]
  },
  {
    name: 'Samsung Colors',
    colors: [
      { name: 'Titanium Gray', hex: '#878681' },
      { name: 'Titanium Violet', hex: '#5b5666' },
      { name: 'Titanium Black', hex: '#3b3b3b' },
      { name: 'Titanium Gold', hex: '#cfba9e' },
      { name: 'Titanium Silver Blue', hex: '#8ea2b3' },
      { name: 'Titanium White Silver', hex: '#e8e8e8' },
      { name: 'Cobalt Violet', hex: '#483d8b' },
      { name: 'Pink Gold', hex: '#f0dfdb' },
      { name: 'Silver Shadow', hex: '#b2b6b9' },
    ]
  },
  {
    name: 'Google Colors',
    colors: [
      { name: 'Obsidian', hex: '#222222' },
      { name: 'Porcelain', hex: '#f4f4f0' },
      { name: 'Hazel', hex: '#4f5550' },
      { name: 'Rose', hex: '#f1d6d2' },
      { name: 'Aloe', hex: '#d4e1d1' },
      { name: 'Peony', hex: '#e8b8c5' },
      { name: 'Wintergreen', hex: '#b8c9c0' },
    ]
  }
];

interface ColorPickerFieldProps {
  value: string;
  onChange: (value: string) => void;
}

export default function ColorPickerField({ value, onChange }: ColorPickerFieldProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      setTimeout(() => searchInputRef.current?.focus(), 50);
    } else {
      setSearchQuery(""); // Clear search when closing
    }
  }, [isOpen]);

  let displayHex = '#cccccc';
  let displayName = value || 'Select Color';

  if (value) {
    let found = false;
    for (const cat of COLOR_CATEGORIES) {
      const match = cat.colors.find(c => c.name.toLowerCase() === value.toLowerCase());
      if (match) {
        displayHex = match.hex;
        displayName = match.name;
        found = true;
        break;
      }
    }
  }

  const filteredCategories = COLOR_CATEGORIES.map(category => ({
    ...category,
    colors: category.colors.filter(color => 
      color.name.toLowerCase().includes(searchQuery.toLowerCase())
    )
  })).filter(category => category.colors.length > 0);

  return (
    <div className="relative" ref={containerRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-3 py-2 border border-gray-200/80 rounded-lg text-sm bg-white/50 backdrop-blur-sm flex items-center justify-between hover:bg-gray-50/80 hover:border-gray-300 transition-all focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary shadow-sm"
      >
        <div className="flex items-center gap-2.5">
          {value ? (
            <span 
              className="w-4 h-4 rounded-full border border-black/10 shadow-sm" 
              style={{ backgroundColor: displayHex }} 
            />
          ) : (
            <div className="w-4 h-4 rounded-full border border-dashed border-gray-300" />
          )}
          <span className={value ? "text-gray-900 font-medium text-[13px]" : "text-gray-400 text-[13px]"}>
            {displayName}
          </span>
        </div>
        <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute z-50 top-full left-0 mt-2 w-[280px] bg-white/95 backdrop-blur-xl border border-gray-100 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[400px] animate-in fade-in zoom-in-95 duration-200">
          <div className="p-3 border-b border-gray-100/50 sticky top-0 bg-white/50 backdrop-blur-xl z-10">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
              <input 
                ref={searchInputRef}
                type="text"
                placeholder="Search colors..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 bg-gray-50/50 border border-gray-200/50 rounded-lg text-[13px] focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all placeholder:text-gray-400"
              />
            </div>
          </div>
          <div className="overflow-y-auto p-4 space-y-6">
            {filteredCategories.length > 0 ? filteredCategories.map((category) => (
              <div key={category.name}>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-3 px-1">
                  {category.name}
                </label>
                <div className="grid grid-cols-5 gap-y-3 gap-x-2">
                  {category.colors.map((color) => {
                    const isSelected = value.toLowerCase() === color.name.toLowerCase();
                    return (
                      <button
                        key={color.name}
                        type="button"
                        onClick={() => {
                          onChange(color.name);
                          setIsOpen(false);
                        }}
                        className="group flex flex-col items-center gap-1.5 relative outline-none"
                        title={color.name}
                      >
                        <div className="relative">
                          <span 
                            className={`w-7 h-7 rounded-full border flex items-center justify-center transition-all duration-300 ${
                              isSelected ? 'border-primary shadow-md scale-110' : 'border-black/5 hover:scale-110 hover:shadow-md'
                            }`}
                            style={{ backgroundColor: color.hex }}
                          >
                            {isSelected && (
                              <Check className={`w-3.5 h-3.5 ${['#ffffff', '#f4f4f4', '#f2f1ed', '#f9f6ef', '#f8f8f8', '#e8e8e8'].includes(color.hex) ? 'text-gray-900' : 'text-white'}`} strokeWidth={3} />
                            )}
                          </span>
                        </div>
                        {/* Tooltip on hover */}
                        <span className="absolute -top-7 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-[10px] font-medium px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
                          {color.name}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )) : (
              <div className="py-8 text-center text-gray-400 text-[13px]">
                No colors match "{searchQuery}"
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
