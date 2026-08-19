"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { Product, ProductVariant, ProductImage } from "@/lib/api";
import { useCart } from "./CartContext";
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

const getScaleClass = (brand?: string | null, categorySlug?: string | null) => {
  const b = brand?.toLowerCase() || '';
  if (categorySlug === 'laptops') {
    if (b === 'apple') return 'scale-[1.35]'; 
    if (b === 'dell' || b === 'alienware') return 'scale-[1.25]';
    if (b === 'lenovo') return 'scale-[0.9]';
    return 'scale-[1.1]'; 
  }
  if (categorySlug === 'smartphones') {
    if (b === 'google' || b === 'samsung') {
      return 'scale-[1.6]';
    }
    return 'scale-[1.1]';
  }
  return 'scale-100';
};

const imageVariants = {
  enter: (direction: number) => ({
    x: direction === 0 ? 0 : (direction > 0 ? 40 : -40),
    opacity: 0
  }),
  center: {
    x: 0,
    opacity: 1
  },
  exit: (direction: number) => ({
    x: direction === 0 ? 0 : (direction < 0 ? 40 : -40),
    opacity: 0
  })
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
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [slideDirection, setSlideDirection] = useState(0);

  useEffect(() => {
    setMounted(true);
    const apiBase = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000/api";
    fetch(`${apiBase}/products/${product.slug}/configurations`)
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
    const colorVariant = variants.find(v => v.color === color);
    if (colorVariant?.product_image_id) {
      const exactImgIdx = images.findIndex(img => img.id === colorVariant.product_image_id);
      if (exactImgIdx !== -1) {
        setSlideDirection(0);
        setSelectedImageIdx(exactImgIdx);
        return; // Exact match found, stop here
      }
    }

    // Fallback heuristic if no exact image is linked
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
      setSlideDirection(0);
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
      cachedPrice: price,
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
          <div 
            className="relative aspect-square rounded-xl overflow-hidden mb-4 bg-gray-50/50 group cursor-zoom-in"
            onClick={() => setIsLightboxOpen(true)}
          >
            <AnimatePresence mode="wait" initial={false} custom={slideDirection}>
              {images[selectedImageIdx] ? (
                <motion.div
                  key={selectedImageIdx}
                  custom={slideDirection}
                  variants={imageVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{ duration: 0.25, ease: "easeInOut" }}
                  className="absolute inset-0 flex items-center justify-center pointer-events-none"
                >
                  <Image
                    unoptimized
                    src={getImageUrl(images[selectedImageIdx].url)}
                    alt={product.name}
                    fill
                    className={`object-contain p-8 ${getScaleClass(product.brand?.name, product.category?.slug)}`}
                    sizes="(max-width: 768px) 100vw, 50vw"
                    priority
                  />
                </motion.div>
              ) : (
                <div className="absolute inset-0 flex items-center justify-center text-gray-300 pointer-events-none">
                  <svg className="w-24 h-24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
              )}
            </AnimatePresence>
            
            {/* Arrows for multiple images */}
            {images.length > 1 && (
              <>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setSlideDirection(-1);
                    setSelectedImageIdx((prev) => (prev > 0 ? prev - 1 : images.length - 1));
                  }}
                  className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/80 hover:bg-white text-gray-800 rounded-full flex items-center justify-center shadow-md opacity-0 group-hover:opacity-100 transition-all z-10"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setSlideDirection(1);
                    setSelectedImageIdx((prev) => (prev < images.length - 1 ? prev + 1 : 0));
                  }}
                  className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/80 hover:bg-white text-gray-800 rounded-full flex items-center justify-center shadow-md opacity-0 group-hover:opacity-100 transition-all z-10"
                >
                  <ChevronRight className="w-6 h-6" />
                </button>
              </>
            )}
          </div>

          {/* Thumbnails */}
          {images.length > 1 && (
            <div className="flex gap-2">
              {images.map((img, idx) => (
                <button
                  key={img.id}
                  onClick={() => {
                    if (idx !== selectedImageIdx) {
                      setSlideDirection(idx > selectedImageIdx ? 1 : -1);
                      setSelectedImageIdx(idx);
                    }
                  }}
                  className={`relative w-16 h-16 rounded-lg overflow-hidden border-2 transition-colors cursor-pointer ${
                    idx === selectedImageIdx ? "border-gray-900" : "border-gray-100 hover:border-gray-300"
                  }`}
                >
                  <Image unoptimized src={getImageUrl(img.url)} alt="" fill className="object-contain p-1" sizes="64px" />
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

          <div className="mt-6 mb-2 min-h-[60px]">
            <alya-placement
              key={`credit-promotion-${price}`}
              price={price}
              currency="MAD"
              lang="fr"
              installments="4"
              variant="interactive"
              theme="light-plain"
              detail="panel"
              logo-position="left"
            />
          </div>

          <p className="text-gray-500 mt-4 leading-relaxed">{product.description}</p>

          {/* Color selector */}
          {colors.length > 0 && product.category?.slug !== 'monitors' && (
            <div className="mt-8">
              <h4 className="text-xs font-semibold tracking-wider text-gray-500 uppercase mb-3">Color</h4>
              <div className="flex flex-col gap-2">
                {colors.map((color) => {
                  const hex = color.startsWith('#') ? color : (COLOR_MAP[color] || "#cccccc");
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

      {/* Lightbox Modal */}
      {mounted && createPortal(
        <AnimatePresence>
          {isLightboxOpen && images[selectedImageIdx] && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsLightboxOpen(false)}
              className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm cursor-zoom-out"
            >
              {/* Lightbox Arrows */}
              {images.length > 1 && (
                <>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedImageIdx((prev) => (prev > 0 ? prev - 1 : images.length - 1));
                    }}
                    className="absolute left-4 md:left-8 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/10 hover:bg-white/20 text-white rounded-full flex items-center justify-center transition-all z-10"
                  >
                    <ChevronLeft className="w-8 h-8" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedImageIdx((prev) => (prev < images.length - 1 ? prev + 1 : 0));
                    }}
                    className="absolute right-4 md:right-8 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/10 hover:bg-white/20 text-white rounded-full flex items-center justify-center transition-all z-10"
                  >
                    <ChevronRight className="w-8 h-8" />
                  </button>
                </>
              )}
              <motion.div 
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                transition={{ type: "spring", damping: 25, stiffness: 300 }}
                className="relative w-[90vw] h-[90vh] max-w-5xl max-h-[800px] overflow-hidden rounded-xl"
                onClick={(e) => e.stopPropagation()}
              >
                <AnimatePresence mode="wait" initial={false} custom={slideDirection}>
                  <motion.div
                    key={selectedImageIdx}
                    custom={slideDirection}
                    variants={imageVariants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    transition={{ duration: 0.25, ease: "easeInOut" }}
                    className="absolute inset-0"
                  >
                    <Image
                      unoptimized
                      src={getImageUrl(images[selectedImageIdx].url)}
                      alt={product.name}
                      fill
                      className="object-contain"
                      sizes="100vw"
                      quality={100}
                    />
                  </motion.div>
                </AnimatePresence>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}
    </div>
  );
}
