"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import type { Product } from "@/lib/api";

const COLOR_MAP: Record<string, string> = {
  "Midnight": "#1c1f24",
  "Starlight": "#f0e4d3",
  "Silver": "#e3e4e5",
  "Skyblue": "#b0c4de",
  "Sky Blue": "#b0c4de",
  "Space Black": "#2e2e2e",
  "Black": "#000000",
  "Titanium Gray": "#878681",
  "Titanium Violet": "#5b5666",
  "Obsidian": "#222222",
  "Porcelain": "#f4f4f0",
  "Teal": "#008080",
  "Ultramarine": "#120a8f",
  "White": "#ffffff",
  "Intense Blue": "#234e70",
  "Blue Intense": "#234e70",
  "Orange": "#e37424",
  "Jade": "#8b9c90",
  "Moonstone": "#e3e0d8",
  "Titanium Black": "#3b3b3b",
  "Titanium Gold": "#cfba9e",
  "Titanium Silver Blue": "#8ea2b3",
  "Titanium White Silver": "#e8e8e8",
  "Violet": "#a89eb6",
  "Cobalt Violet": "#483d8b",
  "Pink Gold": "#f0dfdb",
  "Navy": "#1a2238",
  "Pink": "#f3d1d6",
  "Silver Shadow": "#b2b6b9",
  "Cloud White": "#f8f8f8",
  "Light Gold": "#e8d8c8",
  "Lavender": "#c9c2d6",
  "Mist Blue": "#a8bccc",
  "Sage": "#9ea996"
};

const getScaleClass = (brand?: string | null, categorySlug?: string | null) => {
  if (categorySlug === 'laptops') {
    if (brand?.toLowerCase() === 'apple') return 'scale-[1.35] group-hover:scale-[1.4]'; 
    return 'scale-[0.95] group-hover:scale-100'; 
  }
  if (categorySlug === 'smartphones') {
    if (brand?.toLowerCase() === 'google' || brand?.toLowerCase() === 'samsung') {
      return 'scale-[1.6] group-hover:scale-[1.65]';
    }
    return 'scale-100 group-hover:scale-105';
  }
  return 'scale-100 group-hover:scale-105';
};

export default function ProductCard({ product }: { product: Product }) {
  const firstVariant = product.variants?.[0];
  const firstImage = product.images?.[0];
  const price = firstVariant ? parseFloat(firstVariant.price) : 0;
  
  // Extract unique colors
  const colors = Array.from(new Set(product.variants?.map(v => v.color).filter(Boolean))) as string[];
  const [selectedColor, setSelectedColor] = useState<string | null>(colors.length > 0 ? colors[0] : null);

  // Find image for selected color
  let displayImageUrl = firstImage?.url;
  if (selectedColor && product.images) {
    const selectedTokens = selectedColor.toLowerCase().split(' ');
    let bestMatch = null;
    let maxScore = -1;
    product.images.forEach(img => {
      const url = decodeURIComponent(img.url).toLowerCase();
      let score = 0;
      if (url.includes(selectedColor.toLowerCase())) score += 10;
      selectedTokens.forEach(token => {
        if (token.length >= 3 && url.includes(token)) score += 1;
      });
      if (score > maxScore) {
        maxScore = score;
        bestMatch = img;
      }
    });
    if (bestMatch && maxScore > 0) {
      displayImageUrl = (bestMatch as any).url;
    }
  }

  return (
    <div className="group block mb-6">
      <Link href={`/product/${product.slug}`} className="block">
        {/* Image */}
        <div className="relative aspect-square mb-4 flex items-center justify-center">
          {displayImageUrl ? (
            <Image
              src={displayImageUrl}
              alt={product.name}
              fill
              className={`object-contain transition-transform duration-300 ${getScaleClass(product.brand, product.category?.slug)}`}
              sizes="(max-width: 768px) 50vw, 25vw"
            />
          ) : (
            <div className="text-gray-300">
              <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
          )}
        </div>

        {/* Info */}
        <h3 className="text-sm font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
          {product.name}
        </h3>

        <p className="text-sm text-gray-500 mt-1">
          {price > 0 ? `$${price.toLocaleString()}` : "Price unavailable"}
        </p>
      </Link>

      {/* Color Swatches */}
      {colors.length > 0 && product.category?.slug !== 'monitors' && (
        <div className="flex items-center gap-2 mt-3 pl-1">
          {colors.map((color) => {
            const hex = COLOR_MAP[color] || "#cccccc";
            const isSelected = selectedColor === color;
            return (
              <button
                key={color}
                onClick={(e) => {
                  e.preventDefault();
                  setSelectedColor(color);
                }}
                className={`w-4 h-4 rounded-full flex items-center justify-center transition-all cursor-pointer ${
                  isSelected ? "ring-2 ring-offset-2 ring-gray-900 scale-110" : "hover:scale-110 opacity-70 hover:opacity-100"
                }`}
                title={color}
              >
                <span
                  className="w-full h-full rounded-full border border-gray-200"
                  style={{ backgroundColor: hex }}
                />
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
