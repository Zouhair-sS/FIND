"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState, useEffect } from "react";
import type { Product } from "@/lib/api";
import { useCart } from "./CartContext";

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
    if (brand?.toLowerCase() === 'apple') return 'scale-[1.35]'; 
    return 'scale-[0.95]'; 
  }
  if (categorySlug === 'smartphones') {
    if (brand?.toLowerCase() === 'google' || brand?.toLowerCase() === 'samsung') {
      return 'scale-[1.6]';
    }
    return 'scale-100';
  }
  return 'scale-100';
};

export default function ProductDetailClient({ product }: { product: Product }) {
  const { addItem, items } = useCart();
  const variants = useMemo(() => product.variants ?? [], [product.variants]);
  const images = useMemo(() => product.images ?? [], [product.images]);

  // Unique colors
  const colors = [...new Set(variants.map((v) => v.color).filter(Boolean))] as string[];
  // Unique storage options
  const storageOptions = [...new Set(variants.map((v) => v.storage_gb).filter(Boolean))] as number[];

  const processorOptions = useMemo(() => [...new Set(variants.map((v) => v.processor).filter(Boolean))] as string[], [variants]);
  
  const [selectedColor, setSelectedColor] = useState<string>(colors[0] ?? "");
  const [selectedProcessor, setSelectedProcessor] = useState<string | null | undefined>(
    processorOptions.length > 0 ? processorOptions[0] : undefined
  );
  
  const availableRams = useMemo(() => {
    const valid = variants.filter(v => v.processor === selectedProcessor || !selectedProcessor);
    return [...new Set(valid.map(v => v.ram_gb).filter(Boolean))].sort((a,b)=>(a as number)-(b as number)) as number[];
  }, [variants, selectedProcessor]);

  const [selectedRam, setSelectedRam] = useState<number | null | undefined>(
    availableRams.length > 0 ? availableRams[0] : undefined
  );

  const availableStorages = useMemo(() => {
    const valid = variants.filter(v => (v.processor === selectedProcessor || !selectedProcessor) && (v.ram_gb === selectedRam || !selectedRam));
    return [...new Set(valid.map(v => v.storage_gb).filter(Boolean))].sort((a,b)=>(a as number)-(b as number)) as number[];
  }, [variants, selectedProcessor, selectedRam]);

  const [selectedStorage, setSelectedStorage] = useState<number | null | undefined>(
    storageOptions.length > 0 ? [...storageOptions].sort((a,b)=>(a as number)-(b as number))[0] : undefined
  );

  // Auto update ram and storage when processor changes
  useEffect(() => {
    if (availableRams.length > 0 && selectedRam !== undefined && !availableRams.includes(selectedRam as number)) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setSelectedRam(availableRams[0]);
    }
  }, [availableRams, selectedRam]);

  useEffect(() => {
    if (availableStorages.length > 0 && selectedStorage !== undefined && !availableStorages.includes(selectedStorage as number)) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setSelectedStorage(availableStorages[0]);
    }
  }, [availableStorages, selectedStorage]);


  const [selectedImageIdx, setSelectedImageIdx] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [addedToCart, setAddedToCart] = useState(false);

  // Derive current exact variant or fallback
  const currentVariant = useMemo(() => {
    return variants.find((v) => 
      v.color === selectedColor && 
      (v.storage_gb ?? undefined) === selectedStorage &&
      (v.processor ?? undefined) === selectedProcessor &&
      (v.ram_gb ?? undefined) === selectedRam
    );
  }, [variants, selectedColor, selectedStorage, selectedProcessor, selectedRam]);

  const fallbackVariant = currentVariant ?? variants.find(v => v.color === selectedColor) ?? variants[0];
  if (!fallbackVariant) return null;

  const price = currentVariant ? parseFloat(currentVariant.price) : parseFloat(fallbackVariant.price);
  
  const activeVariantId = currentVariant?.id ?? fallbackVariant.id;
  const cartItem = items.find((i) => i.variantId === activeVariantId);
  const quantityInCart = cartItem ? cartItem.quantity : 0;
  
  const totalStock = currentVariant ? currentVariant.stock_quantity : fallbackVariant.stock_quantity;
  const availableStock = Math.max(0, totalStock - quantityInCart);
  
  const inStock = currentVariant ? availableStock > 0 : false;
  const stockLimit = availableStock;
  
  // Base variant for price diff logic (find cheapest variant for this color and processor and ram)
  const baseStorage = availableStorages.length > 0 ? availableStorages[0] : undefined;
  const baseVariant = variants.find(v => v.color === selectedColor && v.storage_gb === baseStorage && v.processor === selectedProcessor && v.ram_gb === selectedRam) ?? fallbackVariant;
  const basePrice = parseFloat(baseVariant.price);

  const formatStorage = (gb: number) => (gb >= 1024 ? `${gb / 1024}TB` : `${gb}GB`);

  const handleColorChange = (color: string) => {
    setSelectedColor(color);
    // Auto-select storage if current storage is not available in new color
    const hasCurrentStorage = variants.some(v => v.color === color && v.storage_gb === selectedStorage && v.processor === selectedProcessor && v.ram_gb === selectedRam);
    if (!hasCurrentStorage) {
      const availableStorage = variants.find(v => v.color === color && v.processor === selectedProcessor && v.ram_gb === selectedRam)?.storage_gb;
      if (availableStorage !== undefined) setSelectedStorage(availableStorage);
    }
    
    // Switch image
    const colorTokens = color.toLowerCase().split(' ');
    let bestIdx = -1;
    let maxScore = -1;
    images.forEach((img, idx) => {
      const urlDecoded = decodeURIComponent(img.url).toLowerCase();
      let score = 0;
      if (urlDecoded.includes(color.toLowerCase())) score += 10;
      colorTokens.forEach(token => {
        if (token.length >= 3 && urlDecoded.includes(token)) score += 1;
      });
      if (score > maxScore) {
        maxScore = score;
        bestIdx = idx;
      }
    });
    if (bestIdx !== -1 && maxScore > 0) {
      setSelectedImageIdx(bestIdx);
    }
  };

  const handleAddToCart = () => {
    const variantToUse = currentVariant ?? fallbackVariant;
    if (!variantToUse) return;

    const attrs = [];
    if (selectedColor) attrs.push(selectedColor);
    if (selectedProcessor) attrs.push(selectedProcessor);
    if (selectedRam) attrs.push(`${selectedRam}GB RAM`);
    if (selectedStorage) attrs.push(formatStorage(selectedStorage));

    addItem({
      productId: product.id,
      productSlug: product.slug,
      variantId: variantToUse.id,
      quantity,
      cachedTitle: product.name,
      cachedImage: images[selectedImageIdx]?.url,
      cachedAttributes: attrs.join(" • ")
    });

    setQuantity(1);
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 2000);
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
          <div className="relative aspect-square rounded-xl overflow-hidden mb-4 bg-gray-50/50">
            {images[selectedImageIdx] ? (
              <Image
                src={images[selectedImageIdx].url}
                alt={product.name}
                fill
                className={`object-contain p-8 transition-transform duration-500 ${getScaleClass(product.brand?.name, product.category?.slug)}`}
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
          <p className="text-2xl font-semibold text-gray-900 mt-2">MAD {Math.round(price).toLocaleString()}</p>

          <p className="text-gray-500 mt-4 leading-relaxed">{product.description}</p>

          {/* Color selector */}
          {colors.length > 1 && product.category?.slug !== 'monitors' && (
            <div className="mt-6">
              <h4 className="text-xs font-semibold tracking-wider text-gray-500 uppercase mb-3">Color</h4>
              <div className="flex gap-2">
                {colors.map((color) => {
                  const hex = COLOR_MAP[color] || "#cccccc";
                  const isSelected = selectedColor === color;
                  return (
                    <button
                      key={color}
                      onClick={() => handleColorChange(color)}
                      className={`w-8 h-8 rounded-full flex items-center justify-center transition-all cursor-pointer ${
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
            </div>
          )}

          {/* Processor selector */}
          {processorOptions.length > 1 && (
            <div className="mt-6">
              <h4 className="text-xs font-semibold tracking-wider text-gray-500 uppercase mb-3">Processor</h4>
              <div className="flex flex-wrap gap-2">
                {processorOptions.map((proc) => {
                  const isSelected = selectedProcessor === proc;
                  return (
                    <button
                      key={proc}
                      onClick={() => setSelectedProcessor(proc)}
                      className={`px-4 py-2 text-sm rounded-lg border transition-all duration-200 ${
                        isSelected
                          ? "border-gray-900 text-gray-900 bg-gray-50 shadow-sm"
                          : "border-gray-200 text-gray-600 hover:border-gray-400 hover:bg-gray-50 cursor-pointer"
                      }`}
                    >
                      <span className="font-medium">{proc}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* RAM selector */}
          {availableRams.length > 1 && (
            <div className="mt-6">
              <h4 className="text-xs font-semibold tracking-wider text-gray-500 uppercase mb-3">Memory</h4>
              <div className="flex gap-2">
                {availableRams.map((ram) => {
                  const isSelected = selectedRam === ram;
                  return (
                    <button
                      key={ram}
                      onClick={() => setSelectedRam(ram)}
                      className={`px-4 py-2 text-sm rounded-lg border transition-all duration-200 ${
                        isSelected
                          ? "border-gray-900 text-gray-900 bg-gray-50 shadow-sm"
                          : "border-gray-200 text-gray-600 hover:border-gray-400 hover:bg-gray-50 cursor-pointer"
                      }`}
                    >
                      <span className="font-medium">{ram}GB</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Storage selector */}
          {availableStorages.length > 1 && (
            <div className="mt-6">
              <h4 className="text-xs font-semibold tracking-wider text-gray-500 uppercase mb-3">Configuration</h4>
              <div className="flex gap-2">
                {[...availableStorages].sort((a, b) => a - b).map((gb) => {
                  const isSelected = selectedStorage === gb;
                  const matchVariant = variants.find(
                    (v) => v.storage_gb === gb && v.color === selectedColor && v.processor === selectedProcessor && v.ram_gb === selectedRam
                  );
                  const priceDiff = matchVariant ? parseFloat(matchVariant.price) - basePrice : 0;
                  const isAvailable = !!matchVariant;

                  return (
                    <button
                      key={gb}
                      disabled={!isAvailable}
                      onClick={() => setSelectedStorage(gb)}
                      className={`px-4 py-2 text-sm rounded-lg border transition-all duration-200 ${
                        !isAvailable ? "opacity-50 cursor-not-allowed bg-gray-50 border-gray-100" :
                        isSelected
                          ? "border-gray-900 text-gray-900 bg-gray-50 shadow-sm"
                          : "border-gray-200 text-gray-600 hover:border-gray-400 hover:bg-gray-50 cursor-pointer"
                      }`}
                    >
                      <span className="font-medium">{formatStorage(gb)}</span>
                      {isAvailable && priceDiff > 0 && (
                        <span className="block text-xs text-gray-500">+MAD {priceDiff}</span>
                      )}
                      {isAvailable && priceDiff === 0 && <span className="block text-xs text-gray-400">base</span>}
                      {!isAvailable && <span className="block text-xs text-gray-400">N/A</span>}
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
                disabled={quantity <= 1}
                className={`px-3 py-2 transition-colors cursor-pointer ${
                  quantity <= 1
                    ? "text-gray-300 cursor-not-allowed"
                    : "text-gray-500 hover:text-gray-900 hover:bg-gray-50"
                }`}
              >
                −
              </button>
              <span className="px-4 py-2 text-sm font-medium min-w-[40px] text-center">{quantity}</span>
              <button
                onClick={() => setQuantity(Math.min(stockLimit, quantity + 1))}
                disabled={!inStock || quantity >= stockLimit}
                className={`px-3 py-2 transition-colors cursor-pointer ${
                  !inStock || quantity >= stockLimit
                    ? "text-gray-300 cursor-not-allowed"
                    : "text-gray-500 hover:text-gray-900 hover:bg-gray-50"
                }`}
              >
                +
              </button>
            </div>
            <button
              disabled={!inStock}
              onClick={handleAddToCart}
              className={`flex-1 py-3 text-sm font-medium rounded-lg transition-all duration-200 cursor-pointer ${
                addedToCart
                  ? "bg-green-600 text-white"
                  : inStock
                    ? "bg-gray-900 text-white hover:bg-gray-800 active:scale-[0.98]"
                    : "bg-gray-100 text-gray-400 cursor-not-allowed"
              }`}
            >
              {addedToCart ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Added to cart!
                </span>
              ) : inStock ? (
                "Add to cart"
              ) : (
                "Out of stock"
              )}
            </button>
          </div>

          {/* Tech specs */}
          <div className="mt-10 border-t border-gray-100 pt-6">
            <h4 className="text-xs font-semibold tracking-wider text-gray-500 uppercase mb-4">Tech Specs</h4>
            <dl className="space-y-3">
              {fallbackVariant.processor && (
                <div className="flex justify-between text-sm">
                  <dt className="text-gray-500">Processor</dt>
                  <dd className="text-gray-900 font-medium">{fallbackVariant.processor}</dd>
                </div>
              )}
              {fallbackVariant.ram_gb && (
                <div className="flex justify-between text-sm">
                  <dt className="text-gray-500">Memory</dt>
                  <dd className="text-gray-900 font-medium">{fallbackVariant.ram_gb}GB unified</dd>
                </div>
              )}
              {selectedStorage && (
                <div className="flex justify-between text-sm">
                  <dt className="text-gray-500">Storage</dt>
                  <dd className="text-gray-900 font-medium">{formatStorage(selectedStorage)} SSD</dd>
                </div>
              )}
              {fallbackVariant.screen_size && (
                <div className="flex justify-between text-sm">
                  <dt className="text-gray-500">Display</dt>
                  <dd className="text-gray-900 font-medium">{fallbackVariant.screen_size}&quot;</dd>
                </div>
              )}
              {selectedColor && (
                <div className="flex justify-between text-sm">
                  <dt className="text-gray-500">Color</dt>
                  <dd className="text-gray-900 font-medium">{selectedColor}</dd>
                </div>
              )}
              {fallbackVariant.attributes &&
                Object.entries(fallbackVariant.attributes).map(([key, val]) => (
                  <div key={key} className="flex justify-between text-sm">
                    <dt className="text-gray-500 capitalize">{key.replace(/_/g, " ")}</dt>
                    <dd className="text-gray-900 font-medium">{String(val)}</dd>
                  </div>
                ))}
            </dl>
          </div>

          {/* SKU */}
          {currentVariant && <p className="mt-6 text-xs text-gray-400">SKU: {currentVariant.sku}</p>}
        </div>
      </div>
    </div>
  );
}
