import { fetchProductBySlug } from "@/lib/api";
import ProductDetailClient from "@/components/ProductDetailClient";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  try {
    const product = await fetchProductBySlug(slug);
    return {
      title: `${product.name} | FIND.`,
      description: product.description ?? `Shop ${product.name} at FIND.`,
    };
  } catch {
    return { title: "Product Not Found | FIND." };
  }
}

export default async function ProductPage({ params }: PageProps) {
  const { slug } = await params;

  let product;
  try {
    product = await fetchProductBySlug(slug);
  } catch {
    notFound();
  }

  return <ProductDetailClient product={product} />;
}
