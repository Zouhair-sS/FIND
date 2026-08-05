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
  "Orange": "#e37424"
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
    const matchingImage = product.images.find(img => {
      const url = img.url.toLowerCase();
      // Match if the URL contains the main word of the color (e.g. 'black', 'silver', 'midnight')
      return selectedTokens.some(token => token.length >= 3 && url.includes(token));
    });
    if (matchingImage) {
      displayImageUrl = matchingImage.url;
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
              className="object-contain group-hover:scale-105 transition-transform duration-300"
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
      {colors.length > 0 && (
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
