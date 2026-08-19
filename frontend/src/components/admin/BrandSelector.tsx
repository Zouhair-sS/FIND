import React, { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { ChevronDown, Check } from 'lucide-react';

interface Brand {
  id: number;
  name: string;
}

interface BrandSelectorProps {
  value: string | number;
  onChange: (value: string | number) => void;
  brands: Brand[];
}

const BRAND_LOGOS: Record<string, string> = {
  "Apple":            "/images/LOGOS/Brands/apple logo.svg",
  "Samsung":          "/images/LOGOS/Brands/samsung.svg",
  "Google":           "/images/LOGOS/Brands/Google.svg",
  "Lenovo":           "/images/LOGOS/Brands/lenovo.svg",
  "Dell":             "/images/LOGOS/Brands/dell.svg",
  "ASUS":             "/images/LOGOS/Brands/Rog strix.png",
  "ROG Strix":        "/images/LOGOS/Brands/Rog strix.png",
  "Samsung Odyssey":  "/images/LOGOS/Brands/Samsung_Odyssey.svg",
  "Beats":            "/images/LOGOS/Brands/beats-electronics.svg",
  "Bose":             "/images/LOGOS/Brands/bose.svg",
  "Gigabyte":         "/images/LOGOS/Brands/gigabyte-technology-logo-2008.svg",
  "HP":               "/images/LOGOS/Brands/hp.svg",
  "Huawei":           "/images/LOGOS/Brands/huawei-pure-.svg",
  "JBL":              "/images/LOGOS/Brands/jbl-2.svg",
  "LG":               "/images/LOGOS/Brands/lg-electronics.svg",
  "Logitech":         "/images/LOGOS/Brands/logitech-gaming-2.svg",
  "Microsoft":        "/images/LOGOS/Brands/microsoft-5.svg",
  "MSI":              "/images/LOGOS/Brands/msi-3.svg",
  "Razer":            "/images/LOGOS/Brands/razer.svg",
  "Sony":             "/images/LOGOS/Brands/sony-logo-1.svg",
  "Soundcore":        "/images/LOGOS/Brands/soundcore.svg",
  "Xiaomi":           "/images/LOGOS/Brands/xiaomi-logo-2.svg",
};

export default function BrandSelector({ value, onChange, brands = [] }: BrandSelectorProps) {
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

  const selectedBrand = brands.find(b => String(b.id) === String(value));
  const selectedLogo = selectedBrand ? BRAND_LOGOS[selectedBrand.name] : null;

  return (
    <div className="relative" ref={containerRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm bg-white flex items-center justify-between hover:bg-gray-50 transition-all focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary shadow-sm h-[42px]"
      >
        <div className="flex items-center gap-3">
          {selectedLogo ? (
            <div className="w-5 h-5 relative opacity-80 mix-blend-multiply">
              <Image src={selectedLogo} alt={selectedBrand?.name || 'Brand'} fill className="object-contain" />
            </div>
          ) : (
            <div className="w-5 h-5 bg-gray-100 rounded flex items-center justify-center">
              <span className="text-[10px] text-gray-400 font-medium">B</span>
            </div>
          )}
          <span className={value ? "text-gray-900 font-semibold tracking-wide" : "text-gray-400 font-medium"}>
            {selectedBrand ? selectedBrand.name : 'Select Brand'}
          </span>
        </div>
        <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute z-50 top-full left-0 mt-2 w-full max-h-[300px] overflow-y-auto bg-white border border-gray-100 rounded-xl shadow-xl py-2">
          <button
            type="button"
            onClick={() => { onChange(""); setIsOpen(false); }}
            className="w-full px-4 py-2.5 text-left text-sm text-gray-500 hover:bg-gray-50 hover:text-gray-900 transition-colors font-medium"
          >
            Select Brand
          </button>
          {brands.map((b) => {
            const isSelected = String(b.id) === String(value);
            const logo = BRAND_LOGOS[b.name];
            return (
              <button
                key={b.id}
                type="button"
                onClick={() => { onChange(b.id); setIsOpen(false); }}
                className={`w-full px-4 py-2.5 flex items-center justify-between text-left text-sm transition-colors group ${
                  isSelected ? 'bg-gray-50' : 'hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center gap-3">
                  {logo ? (
                    <div className="w-6 h-6 relative opacity-70 group-hover:opacity-100 mix-blend-multiply transition-opacity">
                      <Image src={logo} alt={b.name} fill className="object-contain" />
                    </div>
                  ) : (
                    <div className="w-6 h-6 bg-gray-100 rounded flex items-center justify-center">
                      <span className="text-xs text-gray-400 font-medium">{b.name[0]}</span>
                    </div>
                  )}
                  <span className={`font-semibold tracking-wide ${isSelected ? 'text-gray-900' : 'text-gray-600 group-hover:text-gray-900'}`}>
                    {b.name}
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
