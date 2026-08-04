"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import type { Product, ProductVariant } from "@/lib/api";

export default function ProductDetailClient({ product }: { product: Product }) {
  const variants = product.variants ?? [];
  const images = product.images ?? [];
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant>(variants[0]);
  const [selectedImageIdx, setSelectedImageIdx] = useState(0);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    if (variants.length > 0) setSelectedVariant(variants[0]);
  }, [variants]);

  if (!selectedVariant) return null;

  const price = parseFloat(selectedVariant.price);
  const inStock = selectedVariant.stock_quantity > 0;

  // Unique colors
  const colors = [...new Set(variants.map((v) => v.color).filter(Boolean))] as string[];

  // Unique storage options
  const storageOptions = [...new Set(variants.map((v) => v.storage_gb).filter(Boolean))] as number[];

  const formatStorage = (gb: number) => (gb >= 1024 ? `${gb / 1024}TB` : `${gb}GB`);

  // Build a map: color name → best matching image index
  const colorToImageIndex: Record<string, number> = {};
  colors.forEach((color) => {
    const colorLower = color.toLowerCase();
    const idx = images.findIndex((img) => {
      const urlDecoded = decodeURIComponent(img.url).toLowerCase();
      return urlDecoded.includes(colorLower);
    });
    if (idx !== -1) colorToImageIndex[color] = idx;
  });

  // Find variant that matches selections
  const selectBySpec = (color?: string, storage?: number) => {
    // Try to find exact match for both color and storage
    let match = variants.find(
      (v) =>
        (color ? v.color === color : v.color === selectedVariant.color) &&
        (storage !== undefined ? v.storage_gb === storage : v.storage_gb === selectedVariant.storage_gb)
    );

    // Fallback: If exact match not found, just pick the first one matching the new spec
    if (!match) {
      if (color) {
        match = variants.find((v) => v.color === color);
      } else if (storage !== undefined) {
        match = variants.find((v) => v.storage_gb === storage);
      }
    }

    if (match) {
      setSelectedVariant(match);
      // If color was changed (or we fell back to a different color), switch main image to match
      const newColor = match.color;
      if (newColor && colorToImageIndex[newColor] !== undefined) {
        setSelectedImageIdx(colorToImageIndex[newColor]);
      }
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-10">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-xs text-gray-400 uppercase tracking-wider mb-8">
        <Link href={`/${product.category?.slug ?? ""}`} className="hover:text-blue-600 transition-colors">
          {product.category?.name}
        </Link>
        <span>/</span>
        <span className="text-gray-600">{product.name}</span>
      </nav>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        {/* ── Left: Images ──────────────────────────────────── */}
        <div>
          <div className="relative aspect-square bg-gray-50 rounded-xl overflow-hidden mb-4">
            {images[selectedImageIdx] ? (
              <Image
                src={images[selectedImageIdx].url}
                alt={product.name}
                fill
                className="object-contain p-8"
                sizes="(max-width: 768px) 100vw, 50vw"
                priority
              />
            ) : (
              <div className="flex items-center justify-center h-full text-gray-300">
                <svg className="w-24 h-24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
            )}
          </div>

          {/* Thumbnails */}
          {images.length > 1 && (
            <div className="flex gap-2">
              {images.map((img, idx) => (
                <button
                  key={img.id}
                  onClick={() => setSelectedImageIdx(idx)}
                  className={`relative w-16 h-16 rounded-lg overflow-hidden border-2 transition-colors ${
                    idx === selectedImageIdx ? "border-gray-900" : "border-gray-100 hover:border-gray-300"
                  }`}
                >
                  <Image src={img.url} alt="" fill className="object-contain p-1" sizes="64px" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* ── Right: Details ────────────────────────────────── */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{product.name}</h1>
          <p className="text-2xl font-semibold text-gray-900 mt-2">${price.toLocaleString()}</p>

          <p className="text-gray-500 mt-4 leading-relaxed">{product.description}</p>

          {/* Color selector */}
          {colors.length > 1 && (
            <div className="mt-6">
              <h4 className="text-xs font-semibold tracking-wider text-gray-500 uppercase mb-3">Color</h4>
              <div className="flex gap-2">
                {colors.map((color) => (
                  <button
                    key={color}
                    onClick={() => selectBySpec(color, undefined)}
                    className={`px-4 py-2 text-sm rounded-lg border transition-colors ${
                      selectedVariant.color === color
                        ? "border-blue-500 text-blue-600 bg-blue-50"
                        : "border-gray-200 text-gray-600 hover:border-gray-300"
                    }`}
                  >
                    {color}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Storage selector */}
          {storageOptions.length > 1 && (
            <div className="mt-6">
              <h4 className="text-xs font-semibold tracking-wider text-gray-500 uppercase mb-3">Configuration</h4>
              <div className="flex gap-2">
                {storageOptions.sort((a, b) => a - b).map((gb) => {
                  const isSelected = selectedVariant.storage_gb === gb;
                  const matchVariant = variants.find(
                    (v) => v.storage_gb === gb && v.color === selectedVariant.color
                  );
                  const priceDiff = matchVariant ? parseFloat(matchVariant.price) - parseFloat(variants[0].price) : 0;

                  return (
                    <button
                      key={gb}
                      onClick={() => selectBySpec(undefined, gb)}
                      className={`px-4 py-2 text-sm rounded-lg border transition-colors ${
                        isSelected
                          ? "border-blue-500 text-blue-600 bg-blue-50"
                          : "border-gray-200 text-gray-600 hover:border-gray-300"
                      }`}
                    >
                      <span className="font-medium">{formatStorage(gb)}</span>
                      {priceDiff > 0 && (
                        <span className="block text-xs text-blue-500">+${priceDiff}</span>
                      )}
                      {priceDiff === 0 && <span className="block text-xs text-gray-400">base</span>}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Quantity + Add to cart */}
          <div className="mt-8 flex items-center gap-4">
            <div className="flex items-center border border-gray-200 rounded-lg">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="px-3 py-2 text-gray-500 hover:text-gray-900 transition-colors"
              >
                −
              </button>
              <span className="px-4 py-2 text-sm font-medium">{quantity}</span>
              <button
                onClick={() => setQuantity(quantity + 1)}
                className="px-3 py-2 text-gray-500 hover:text-gray-900 transition-colors"
              >
                +
              </button>
            </div>
            <button
              disabled={!inStock}
              className={`flex-1 py-3 text-sm font-medium rounded-lg transition-colors ${
                inStock
                  ? "bg-gray-900 text-white hover:bg-gray-800"
                  : "bg-gray-100 text-gray-400 cursor-not-allowed"
              }`}
            >
              {inStock ? "Add to cart" : "Out of stock"}
            </button>
          </div>

          {/* Tech specs */}
          <div className="mt-10 border-t border-gray-100 pt-6">
            <h4 className="text-xs font-semibold tracking-wider text-gray-500 uppercase mb-4">Tech Specs</h4>
            <dl className="space-y-3">
              {selectedVariant.processor && (
                <div className="flex justify-between text-sm">
                  <dt className="text-gray-500">Processor</dt>
                  <dd className="text-gray-900 font-medium">{selectedVariant.processor}</dd>
                </div>
              )}
              {selectedVariant.ram_gb && (
                <div className="flex justify-between text-sm">
                  <dt className="text-gray-500">Memory</dt>
                  <dd className="text-gray-900 font-medium">{selectedVariant.ram_gb}GB unified</dd>
                </div>
              )}
              {selectedVariant.storage_gb && (
                <div className="flex justify-between text-sm">
                  <dt className="text-gray-500">Storage</dt>
                  <dd className="text-gray-900 font-medium">{formatStorage(selectedVariant.storage_gb)} SSD</dd>
                </div>
              )}
              {selectedVariant.screen_size && (
                <div className="flex justify-between text-sm">
                  <dt className="text-gray-500">Display</dt>
                  <dd className="text-gray-900 font-medium">{selectedVariant.screen_size}&quot;</dd>
                </div>
              )}
              {selectedVariant.color && (
                <div className="flex justify-between text-sm">
                  <dt className="text-gray-500">Color</dt>
                  <dd className="text-gray-900 font-medium">{selectedVariant.color}</dd>
                </div>
              )}
              {selectedVariant.attributes &&
                Object.entries(selectedVariant.attributes).map(([key, val]) => (
                  <div key={key} className="flex justify-between text-sm">
                    <dt className="text-gray-500 capitalize">{key.replace(/_/g, " ")}</dt>
                    <dd className="text-gray-900 font-medium">{String(val)}</dd>
                  </div>
                ))}
            </dl>
          </div>

          {/* SKU */}
          <p className="mt-6 text-xs text-gray-400">SKU: {selectedVariant.sku}</p>
        </div>
      </div>
    </div>
  );
}
