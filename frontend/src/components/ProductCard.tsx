import Link from "next/link";
import Image from "next/image";
import type { Product } from "@/lib/api";

export default function ProductCard({ product }: { product: Product }) {
  const firstVariant = product.variants?.[0];
  const firstImage = product.images?.[0];
  const price = firstVariant ? parseFloat(firstVariant.price) : 0;
  const inStock = product.variants?.some((v) => v.stock_quantity > 0) ?? false;

  // Build spec string like "Apple · 16GB · 512GB"
  const specs: string[] = [];
  if (firstVariant?.processor) specs.push(firstVariant.processor);
  if (firstVariant?.ram_gb) specs.push(`${firstVariant.ram_gb}GB`);
  if (firstVariant?.storage_gb) {
    specs.push(firstVariant.storage_gb >= 1024 ? `${firstVariant.storage_gb / 1024}TB` : `${firstVariant.storage_gb}GB`);
  }

  return (
    <Link
      href={`/product/${product.slug}`}
      className="group block border border-gray-100 rounded-xl p-5 hover:border-gray-200 hover:shadow-sm transition-all duration-200"
    >
      {/* Image */}
      <div className="relative aspect-square bg-gray-50 rounded-lg overflow-hidden mb-4 flex items-center justify-center">
        {firstImage ? (
          <Image
            src={firstImage.url}
            alt={product.name}
            fill
            className="object-contain p-4 group-hover:scale-105 transition-transform duration-300"
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
      <h3 className="text-sm font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
        {product.name}
      </h3>

      {specs.length > 0 && (
        <p className="text-xs text-gray-400 mt-1">
          {specs.join(" · ")}
        </p>
      )}

      <p className="text-base font-semibold text-gray-900 mt-2">
        ${price.toLocaleString()}
      </p>

      {/* Stock */}
      <div className="flex items-center gap-1.5 mt-2">
        <span
          className={`w-1.5 h-1.5 rounded-full ${inStock ? "bg-green-500" : "bg-red-400"}`}
        />
        <span className={`text-xs ${inStock ? "text-green-600" : "text-red-500"}`}>
          {inStock ? "In stock" : "Out of stock"}
        </span>
      </div>
    </Link>
  );
}
