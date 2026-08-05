const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000/api";

export interface Category {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  parent_id: number | null;
  image_url: string | null;
  children?: Category[];
}

export interface ProductImage {
  id: number;
  product_id: number;
  url: string;
  sort_order: number;
}

export interface ProductVariant {
  id: number;
  product_id: number;
  sku: string;
  price: string;
  stock_quantity: number;
  ram_gb: number | null;
  storage_gb: number | null;
  screen_size: number | null;
  color: string | null;
  processor: string | null;
  attributes: Record<string, string | number | boolean> | null;
}

export interface Product {
  id: number;
  category_id: number;
  name: string;
  slug: string;
  brand: string | null;
  description: string | null;
  status: string;
  category?: Category;
  variants?: ProductVariant[];
  images?: ProductImage[];
}

export interface PaginatedResponse<T> {
  data: T[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
}

export async function fetchCategories(): Promise<Category[]> {
  const res = await fetch(`${API_BASE}/categories`, { next: { revalidate: 60 } });
  if (!res.ok) throw new Error("Failed to fetch categories");
  return res.json();
}

export async function fetchCategoryBySlug(slug: string): Promise<Category & { products: Product[] }> {
  const res = await fetch(`${API_BASE}/categories/${slug}`, { next: { revalidate: 60 } });
  if (!res.ok) throw new Error("Failed to fetch category");
  return res.json();
}

export async function fetchProducts(params?: string): Promise<PaginatedResponse<Product>> {
  const url = params ? `${API_BASE}/products?${params}` : `${API_BASE}/products`;
  const res = await fetch(url, { next: { revalidate: 60 } });
  if (!res.ok) throw new Error("Failed to fetch products");
  return res.json();
}

export async function fetchProductBySlug(slug: string): Promise<Product> {
  const res = await fetch(`${API_BASE}/products/${slug}?include=variants,images,category`, {
    next: { revalidate: 60 },
  });
  if (!res.ok) throw new Error("Failed to fetch product");
  return res.json();
}

export async function searchProducts(query: string): Promise<Product[]> {
  const res = await fetch(`${API_BASE}/products/search?q=${encodeURIComponent(query)}`, {
    cache: "no-store",
  });
  if (!res.ok) throw new Error("Failed to search products");
  return res.json();
}
