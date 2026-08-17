import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';

interface Option {
  value: string | number;
  label: string;
}

interface CustomSelectProps {
  value: string | number;
  onChange: (value: string | number) => void;
  options: Option[];
  placeholder?: string;
}

export default function CustomSelect({ value, onChange, options, placeholder = "Select an option" }: CustomSelectProps) {
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

  const selectedOption = options.find(o => String(o.value) === String(value));

  return (
    <div className="relative" ref={containerRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm bg-white flex items-center justify-between hover:bg-gray-50 transition-all focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary shadow-sm h-[42px]"
      >
        <span className={value !== "" && value !== null ? "text-gray-900 font-semibold tracking-wide" : "text-gray-400 font-medium"}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute z-50 top-full left-0 mt-2 w-full max-h-[300px] overflow-y-auto bg-white border border-gray-100 rounded-xl shadow-xl py-2 p-1">
          <button
            type="button"
            onClick={() => { onChange(""); setIsOpen(false); }}
            className="w-full px-4 py-2.5 text-left text-sm text-gray-500 hover:bg-gray-50 hover:text-gray-900 rounded-lg transition-colors font-medium mb-1"
          >
            {placeholder}
          </button>
          {options.map((o) => {
            const isSelected = String(o.value) === String(value);
            return (
              <button
                key={o.value}
                type="button"
                onClick={() => { onChange(o.value); setIsOpen(false); }}
                className={`w-full px-4 py-2.5 flex items-center justify-between text-left text-sm transition-all rounded-lg group ${
                  isSelected ? 'bg-gray-50' : 'hover:bg-gray-50'
                }`}
              >
                <span className={`font-semibold tracking-wide ${isSelected ? 'text-gray-900' : 'text-gray-600 group-hover:text-gray-900'}`}>
                  {o.label}
                </span>
                {isSelected && <Check className="w-4 h-4 text-gray-900" strokeWidth={3} />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
