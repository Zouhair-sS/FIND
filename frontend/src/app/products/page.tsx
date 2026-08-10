import { fetchAllProductsWithFilters } from "@/lib/api";
import CategoryClient from "@/components/CategoryClient";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "All Products | FIND.",
  description: "Browse our complete catalog of products.",
};

export default async function AllProductsPage() {
  let categoryData;
  try {
    categoryData = await fetchAllProductsWithFilters();
  } catch {
    notFound();
  }

  return <CategoryClient category={categoryData} />;
}
