import { fetchCategoryBySlug } from "@/lib/api";
import CategoryClient from "@/components/CategoryClient";
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

  return <CategoryClient category={categoryData} />;
}
