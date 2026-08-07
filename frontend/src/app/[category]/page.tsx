import { fetchCategoryBySlug } from "@/lib/api";
import ProductCard from "@/components/ProductCard";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

type PageProps = {
  params: Promise<{ category: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { category } = await params;
  return {
    title: `${category.charAt(0).toUpperCase() + category.slice(1)} | FIND.`,
    description: `Browse our curated selection of ${category}.`,
  };
}

export default async function CategoryPage({ params }: PageProps) {
  const { category: slug } = await params;

  let categoryData;
  try {
    categoryData = await fetchCategoryBySlug(slug);
  } catch {
    notFound();
  }

  const products = categoryData.products ?? [];

  return (
    <div className="max-w-7xl mx-auto px-6 py-10">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-gray-900">{categoryData.name}</h1>
        <span className="text-sm text-gray-400">
          {products.length} {products.length === 1 ? "result" : "results"}
        </span>
      </div>

      {/* Product Grid */}
      {products.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
          {products.map((product) => (
            <ProductCard key={product.id} product={{ ...product, category: categoryData as any }} />
          ))}
        </div>
      ) : (
        <div className="text-center py-20 text-gray-400">
          <p className="text-lg">No products found in this category.</p>
        </div>
      )}
    </div>
  );
}
