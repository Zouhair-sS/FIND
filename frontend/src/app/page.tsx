import { fetchProducts, fetchCategories } from "@/lib/api";
import HomeClient from "@/components/HomeClient";

export default async function HomePage() {
  let products = null;
  let categories = null;

  try {
    const [productsRes, categoriesRes] = await Promise.all([
      fetchProducts("per_page=100"),
      fetchCategories(),
    ]);
    products = productsRes;
    categories = categoriesRes;
  } catch {
    // API not available — show static fallback
  }

  return <HomeClient products={products} categories={categories} />;
}
