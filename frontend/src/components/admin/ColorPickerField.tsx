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
        className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm bg-white flex items-center justify-between hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary shadow-sm"
      >
        <div className="flex items-center gap-3">
          <span 
            className="w-5 h-5 rounded-full border border-gray-200 block shadow-inner" 
            style={{ backgroundColor: displayHex }} 
          />
          <span className={value ? "text-gray-900 font-medium" : "text-gray-400"}>
            {displayName}
          </span>
        </div>
        <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute z-50 top-full left-0 mt-2 w-[340px] bg-white border border-gray-100 rounded-2xl shadow-xl overflow-hidden flex flex-col max-h-[450px]">
          <div className="p-4 border-b border-gray-100 sticky top-0 bg-white z-10">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input 
                ref={searchInputRef}
                type="text"
                placeholder="Search colors..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
            </div>
          </div>
          <div className="overflow-y-auto p-5 space-y-6">
            {filteredCategories.length > 0 ? filteredCategories.map((category) => (
              <div key={category.name}>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-widest mb-3">
                  {category.name}
                </label>
                <div className="grid grid-cols-4 gap-3">
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
                        className={`group flex flex-col items-center gap-2 p-2 rounded-xl transition-all ${
                          isSelected ? 'bg-gray-100/80 ring-1 ring-gray-200' : 'hover:bg-gray-50'
                        }`}
                        title={color.name}
                      >
                        <div className="relative">
                          <span 
                            className="w-8 h-8 rounded-full border border-gray-200 block shadow-sm transition-transform group-hover:scale-110"
                            style={{ backgroundColor: color.hex }}
                          />
                          {isSelected && (
                           <span className="absolute inset-0 flex items-center justify-center">
                              <Check className={`w-4 h-4 ${['#ffffff', '#f4f4f4', '#f2f1ed', '#f9f6ef', '#f8f8f8', '#e8e8e8'].includes(color.hex) ? 'text-gray-900' : 'text-white'}`} strokeWidth={3} />
                            </span>
                          )}
                        </div>
                        <span className="text-[10px] font-medium text-gray-600 text-center leading-tight h-6 flex items-center justify-center">
                          {color.name}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )) : (
              <div className="py-8 text-center text-gray-500 text-sm">
                No colors found for "{searchQuery}"
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
