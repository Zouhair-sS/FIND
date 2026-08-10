"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState, useEffect } from "react";
import type { Product } from "@/lib/api";
import { useCart } from "./CartContext";
import { formatPrice } from "@/lib/formatPrice";

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

interface RelatedConfig {
  id: number;
  slug: string;
  name: string;
  processor: string | null;
  ram_gb: number | null;
  storage_gb: number | null;
  price: number;
}

export default function ProductDetailClient({ product }: { product: Product }) {
  const { addItem, items, setIsCartOpen } = useCart();
  const variants = useMemo(() => product.variants ?? [], [product.variants]);
  const images = useMemo(() => product.images ?? [], [product.images]);

  // Unique colors
  const colors = [...new Set(variants.map((v) => v.color).filter(Boolean))] as string[];
  
  const [selectedColor, setSelectedColor] = useState<string>(colors[0] ?? "");
  const [selectedImageIdx, setSelectedImageIdx] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [addedToCart, setAddedToCart] = useState(false);
  const [relatedConfigs, setRelatedConfigs] = useState<RelatedConfig[]>([]);

  useEffect(() => {
    fetch(`/api/products/${product.slug}/configurations`)
      .then(res => res.json())
      .then(data => setRelatedConfigs(data))
      .catch(console.error);
  }, [product.slug]);

  // Derive current exact variant or fallback
  const currentVariant = useMemo(() => {
    return variants.find((v) => v.color === selectedColor) ?? variants[0];
  }, [variants, selectedColor]);

  if (!currentVariant) return null;

  const price = parseFloat(currentVariant.price);
  
  const activeVariantId = currentVariant.id;
  const cartItem = items.find((i) => i.variantId === activeVariantId);
  const quantityInCart = cartItem ? cartItem.quantity : 0;
  
  const totalStock = currentVariant.stock_quantity;
  const availableStock = Math.max(0, totalStock - quantityInCart);
  
  const inStock = availableStock > 0;
  const stockLimit = availableStock;

  const formatStorage = (gb: number) => (gb >= 1024 ? `${gb / 1024}TB` : `${gb}GB`);

  const handleColorChange = (color: string) => {
    setSelectedColor(color);
    
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
    const attrs = [];
    if (selectedColor) attrs.push(selectedColor);
    if (currentVariant.processor) attrs.push(currentVariant.processor);
    if (currentVariant.ram_gb) attrs.push(`${currentVariant.ram_gb}GB RAM`);
    if (currentVariant.storage_gb) attrs.push(formatStorage(currentVariant.storage_gb));

    addItem({
      productId: product.id,
      productSlug: product.slug,
      variantId: currentVariant.id,
      quantity,
      cachedTitle: product.name,
      cachedImage: images[selectedImageIdx]?.url,
      cachedAttributes: attrs.join(" • ")
    });

    setQuantity(1);
    setAddedToCart(true);
    
    // Open drawer after a short delay
    setTimeout(() => {
      setIsCartOpen(true);
      setAddedToCart(false);
    }, 600);
  };

  const configParts = [];
  if (currentVariant.ram_gb) configParts.push(`${currentVariant.ram_gb}GB`);
  if (currentVariant.storage_gb) configParts.push(formatStorage(currentVariant.storage_gb));
  const configText = configParts.length > 0 ? configParts.join(' · ') : null;

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
                  className={`relative w-16 h-16 rounded-lg overflow-hidden border-2 transition-colors cursor-pointer ${
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
          {configText && <p className="text-lg text-gray-500 mt-1">{configText}</p>}
          
          <p className="text-2xl font-semibold text-gray-900 mt-4">
            {formatPrice(price)}{' '}
            <span className="text-base font-normal text-gray-400 tracking-wide">MAD</span>
          </p>

          <p className="text-gray-500 mt-4 leading-relaxed">{product.description}</p>

          {/* Available Configurations */}
          {relatedConfigs.length > 0 && (
             <div className="mt-8">
               <h4 className="text-sm font-semibold tracking-wider text-gray-900 uppercase mb-4">Choose your configuration</h4>
               <div className="flex flex-col gap-2">
                 
                 {/* Current Config */}
                 <div className="flex justify-between items-center px-4 py-3 border-2 border-gray-900 bg-gray-50 rounded-lg">
                   <div>
                     <p className="text-sm font-semibold text-gray-900">{configText || "Base Configuration"}</p>
                   </div>
                   <p className="text-sm font-bold text-gray-900">{formatPrice(price)} MAD</p>
                 </div>

                 {/* Related Configs */}
                 {relatedConfigs.map(c => {
                   const cParts = [];
                   if (c.ram_gb) cParts.push(`${c.ram_gb}GB`);
                   if (c.storage_gb) cParts.push(formatStorage(c.storage_gb));
                   const cText = cParts.length > 0 ? cParts.join(' · ') : c.processor || "Configuration";
                   return (
                     <Link key={c.id} href={`/product/${c.slug}`} className="flex justify-between items-center px-4 py-3 border border-gray-200 hover:border-gray-400 rounded-lg transition-colors group cursor-pointer">
                       <div>
                         <p className="text-sm font-medium text-gray-600 group-hover:text-gray-900 transition-colors">{cText}</p>
                       </div>
                       <p className="text-sm font-medium text-gray-600 group-hover:text-gray-900 transition-colors">{formatPrice(c.price)} MAD</p>
                     </Link>
                   )
                 })}
               </div>
             </div>
          )}

          {/* Color selector */}
          {colors.length > 0 && product.category?.slug !== 'monitors' && (
            <div className="mt-8">
              <h4 className="text-xs font-semibold tracking-wider text-gray-500 uppercase mb-3">Color</h4>
              <div className="flex flex-col gap-2">
                {colors.map((color) => {
                  const hex = COLOR_MAP[color] || "#cccccc";
                  const isSelected = selectedColor === color;
                  
                  // Find if this color is in stock
                  const colorVariant = variants.find(v => v.color === color);
                  const isColorInStock = colorVariant ? colorVariant.stock_quantity > 0 : false;

                  return (
                    <button
                      key={color}
                      onClick={() => handleColorChange(color)}
                      className={`flex items-center gap-3 w-full text-left p-3 rounded-lg border transition-all cursor-pointer ${
                        isSelected ? "border-gray-900 bg-gray-50" : "border-transparent hover:bg-gray-50"
                      }`}
                    >
                      <span
                        className="w-5 h-5 rounded-full border border-gray-200 flex-shrink-0"
                        style={{ backgroundColor: hex }}
                      />
                      <span className={`font-medium ${isSelected ? 'text-gray-900' : 'text-gray-600'}`}>{color}</span>
                      {!isColorInStock && (
                        <span className="ml-auto text-xs font-semibold text-gray-400 uppercase">Out of stock</span>
                      )}
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
              {currentVariant.processor && (
                <div className="flex justify-between text-sm">
                  <dt className="text-gray-500">Processor</dt>
                  <dd className="text-gray-900 font-medium">{currentVariant.processor}</dd>
                </div>
              )}
              {currentVariant.ram_gb && (
                <div className="flex justify-between text-sm">
                  <dt className="text-gray-500">Memory</dt>
                  <dd className="text-gray-900 font-medium">{currentVariant.ram_gb}GB unified</dd>
                </div>
              )}
              {currentVariant.storage_gb && (
                <div className="flex justify-between text-sm">
                  <dt className="text-gray-500">Storage</dt>
                  <dd className="text-gray-900 font-medium">{formatStorage(currentVariant.storage_gb)} SSD</dd>
                </div>
              )}
              {currentVariant.screen_size && (
                <div className="flex justify-between text-sm">
                  <dt className="text-gray-500">Display</dt>
                  <dd className="text-gray-900 font-medium">{currentVariant.screen_size}&quot;</dd>
                </div>
              )}
              {selectedColor && (
                <div className="flex justify-between text-sm">
                  <dt className="text-gray-500">Color</dt>
                  <dd className="text-gray-900 font-medium">{selectedColor}</dd>
                </div>
              )}
            </dl>
          </div>

          {/* SKU */}
          {currentVariant && <p className="mt-6 text-xs text-gray-400">SKU: {currentVariant.sku}</p>}
        </div>
      </div>
    </div>
  );
}
