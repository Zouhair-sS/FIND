"use client";

import { motion } from "framer-motion";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import type { Product } from "@/lib/api";
import { formatPrice } from "@/lib/formatPrice";
import { getImageUrl } from "@/lib/api";

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

const BRAND_LOGOS: Record<string, string> = {
  "Apple": "/images/LOGOS/Brands/apple logo.svg",
  "Samsung": "/images/LOGOS/Brands/samsung.svg",
  "Google": "/images/LOGOS/Brands/Google.svg",
  "Lenovo": "/images/LOGOS/Brands/lenovo.svg",
  "Dell": "/images/LOGOS/Brands/dell.svg",
  "ASUS": "/images/LOGOS/Brands/Rog strix.png",
};

const PROCESSOR_BADGES: Record<string, string> = {
  "M3": "/images/LOGOS/processors/apple m3.png",
  "M3 Pro": "/images/LOGOS/processors/apple m3Pro.png",
  "M3 Max 30-core": "/images/LOGOS/processors/apple m3 max.png",
  "M3 Max (30-core GPU)": "/images/LOGOS/processors/apple m3 max.png",
  "M3 Max (40-core GPU)": "/images/LOGOS/processors/apple m3 max.png",
  "M3 Max 40-core": "/images/LOGOS/processors/apple m3 max.png",
  "M4 Pro": "/images/LOGOS/processors/apple m4Pro.png",
  "M4 Max 32-core": "/images/LOGOS/processors/apple m4 Max.png",
  "M4 Max 40-core": "/images/LOGOS/processors/apple m4 Max.png",
  "M5 Pro": "/images/LOGOS/processors/apple m5 Pro.png",
  "M5 Max 32-core": "/images/LOGOS/processors/apple m5 max.png",
  "M5 Max 40-core": "/images/LOGOS/processors/apple m5 max.png",
  "Core Ultra 5": "/images/LOGOS/processors/Core Ultra 5.png",
  "Core Ultra 7": "/images/LOGOS/processors/Core Ultra 7.png",
  "Core i7": "/images/LOGOS/processors/core i7.png",
  "Core i9": "/images/LOGOS/processors/core i9.webp",
};

const getScaleClass = (brand?: string | null, categorySlug?: string | null, productName?: string) => {
  if (categorySlug === 'laptops') {
    if (brand?.toLowerCase() === 'apple') return 'scale-[1.15] group-hover:scale-[1.2]';
    return 'scale-[0.95] group-hover:scale-100';
  }
  if (categorySlug === 'smartphones') {
    if (brand?.toLowerCase() === 'apple') return 'scale-[0.85] group-hover:scale-90';
    if (brand?.toLowerCase() === 'samsung') {
      if (productName?.toLowerCase().includes('ultra')) return 'scale-[1.15] group-hover:scale-[1.2]';
      return 'scale-[1.1] group-hover:scale-[1.15]';
    }
    if (brand?.toLowerCase() === 'google') {
      return 'scale-[1.1] group-hover:scale-[1.15]';
    }
    return 'scale-[0.9] group-hover:scale-[0.95]';
  }
  return 'scale-100 group-hover:scale-105';
};

export default function ProductCard({
  product,
  activeFilters = {},
  activePriceRange
}: {
  product: Product;
  activeFilters?: Record<string, (string | number)[]>;
  activePriceRange?: { min: number, max: number };
}) {
  const variantLevelSlugs = ["ram_gb", "storage_gb", "processor", "screen_size"];

  const activeVariantFilters = Object.entries(activeFilters).filter(
    ([slug, values]) => variantLevelSlugs.includes(slug) && values.length > 0
  );

  let bestPrice = 0;

  if (product.variants && product.variants.length > 0) {
    const matchingVariants = product.variants.filter((variant) => {
      const vPrice = parseFloat(variant.price);
      if (activePriceRange && (vPrice > activePriceRange.max || vPrice < activePriceRange.min)) return false;

      for (const [slug, values] of activeVariantFilters) {
        const vVal = variant[slug as keyof typeof variant];
        if (!values.map(String).includes(String(vVal))) return false;
      }
      return true;
    });

    if (matchingVariants.length > 0) {
      bestPrice = Math.min(...matchingVariants.map(v => parseFloat(v.price)));
    } else {
      bestPrice = Math.min(...product.variants.map(v => parseFloat(v.price)));
    }
  }

  const price = bestPrice;

  // Hash function for deterministic color selection
  const hashString = (str: string) => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) hash = (hash << 5) - hash + str.charCodeAt(i);
    return Math.abs(hash);
  };

  const colors = Array.from(new Set(product.variants?.map(v => v.color).filter(Boolean))) as string[];
  const activeColors = colors.filter(c => product.variants?.some(v => v.color === c && v.stock_quantity > 0));

  // Calculate deterministic initial color based on product unique signature
  const configVariant = product.variants?.[0];
  const configString = `${product.brand?.name}-${product.name}-${configVariant?.processor}-${configVariant?.ram_gb}-${configVariant?.storage_gb}`;

  const initialColor = activeColors.length > 0
    ? activeColors[hashString(configString) % activeColors.length]
    : (colors[0] || null);

  const [selectedColor, setSelectedColor] = useState<string | null>(initialColor);

  let displayImageUrl = product.thumbnail || product.images?.[0]?.url;
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
      displayImageUrl = (bestMatch as import("@/lib/api").ProductImage).url;
    }
  }

  // Get Brand Logo
  const brandLogo = product.brand?.name ? BRAND_LOGOS[product.brand.name] : null;
  // Get Processor Badge
  const processor = product.variants?.[0]?.processor;
  const processorBadge = processor ? PROCESSOR_BADGES[processor] : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="group block mb-6"
    >
      <Link href={`/product/${product.slug}`} className="block">
        {/* Image Container */}
        <div className="relative aspect-square mb-4 flex items-center justify-center overflow-hidden rounded-3xl bg-white border border-gray-100 shadow-sm hover:shadow-lg transition-all duration-300">

          {/* Top Left Area - Brand Logo & Badge */}
          <div className="absolute top-4 left-4 z-10 flex items-center gap-2 opacity-80 mix-blend-multiply">
            {brandLogo && (
              <div className={`relative w-7 h-7 ${product.brand?.name?.toLowerCase() === 'apple' ? 'scale-[0.7]' :
                  product.brand?.name?.toLowerCase() === 'dell' ? 'scale-[0.8]' : 'scale-90'
                }`}>
                <Image src={brandLogo} alt={product.brand?.name || 'Brand logo'} fill className="object-contain" />
              </div>
            )}
          </div>

          {/* Product Image */}
          {displayImageUrl ? (
            <Image
              unoptimized
              src={getImageUrl(displayImageUrl)}
              alt={product.name}
              fill
              className={`object-contain p-4 transition-transform duration-500 ease-[cubic-bezier(0.2,0.8,0.2,1)] mix-blend-multiply ${getScaleClass(product.brand?.name, product.category?.slug, product.name)}`}
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              priority
            />
          ) : (
            <div className="text-gray-300">
              <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
          )}

          {/* Processor Badge - Bottom Right */}
          {processorBadge && (
            <div className="absolute bottom-3 right-3 z-10 w-9 h-9 pointer-events-none">
              <Image
                src={processorBadge}
                alt={processor || 'Processor badge'}
                fill
                className={`object-contain rounded drop-shadow-sm ${processor?.toLowerCase().includes('m5') ? 'scale-[1.8]' :
                    processor?.toLowerCase().includes('m4') ? 'scale-[1.15]' :
                      processor?.toLowerCase().includes('m3') ? 'scale-[1.15]' :
                        'scale-[0.85]'
                  }`}
              />
            </div>
          )}
        </div>

        {/* Info */}
        <h3 className="text-sm font-bold text-gray-900 group-hover:text-gray-600 transition-colors">
          {product.name}
        </h3>

        {(() => {
          const v = product.variants?.[0];
          const configParts = [];
          if (v?.ram_gb) configParts.push(`${v.ram_gb}GB`);
          if (v?.storage_gb) {
            configParts.push(v.storage_gb >= 1024 ? `${v.storage_gb / 1024}TB` : `${v.storage_gb}GB`);
          }
          if (configParts.length === 0) return null;
          return <p className="text-xs text-gray-500 mt-1">{configParts.join(' · ')}</p>;
        })()}

        <p className="text-sm font-bold text-gray-900 mt-1">
          {price > 0 ? (
            <>
              {formatPrice(price)}{' '}
              <span className="text-xs text-gray-400 font-normal">MAD</span>
            </>
          ) : "Price unavailable"}
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
                className={`w-4 h-4 rounded-full flex items-center justify-center transition-all cursor-pointer ${isSelected ? "ring-2 ring-offset-2 ring-primary scale-110" : "hover:scale-110 opacity-70 hover:opacity-100"
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
    </motion.div>
  );
}
