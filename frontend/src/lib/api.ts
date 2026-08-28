const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000/api";

export interface FilterOption {
  value: string | number;
  count: number;
}

export interface FilterGroup {
  name: string;
  slug: string;
  type: string;
  values: FilterOption[];
}

export interface Category {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  parent_id: number | null;
  image_url: string | null;
  children?: Category[];
  products?: Product[];
  filters?: FilterGroup[];
  price?: { min: number; max: number };
}

export interface ProductImage {
  id: number;
  product_id: number;
  url: string;
  sort_order: number;
}

export function getImageUrl(url: string | null | undefined): string {
  if (!url) return '';
  if (url.startsWith('http')) return url;
  if (url.startsWith('/images/')) return url;
  const baseUrl = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://127.0.0.1:8000';
  return `${baseUrl}${url}`;
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
  product_image_id: number | null;
  attributes: Record<string, string | number | boolean> | null;
}

export interface Brand {
  id: number;
  name: string;
  slug: string;
}

export interface Series {
  id: number;
  brand_id: number;
  name: string;
  slug: string;
}

export interface Attribute {
  id: number;
  name: string;
  slug: string;
}

export interface AttributeValue {
  id: number;
  attribute_id: number;
  value: string;
  attribute?: Attribute;
}

export interface Collection {
  id: number;
  name: string;
  slug: string;
}

export interface Product {
  id: number;
  category_id: number;
  name: string;
  slug: string;
  brand?: Brand | null;
  series?: Series | null;
  description: string | null;
  status: string;
  stock: number;
  thumbnail?: string | null;
  category?: Category;
  variants?: ProductVariant[];
  images?: ProductImage[];
  attribute_values?: AttributeValue[];
  collections?: Collection[];
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
  const res = await fetch(`${API_BASE}/categories/${slug}?includeChildren=true`, { next: { revalidate: 60 } });
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

export async function fetchAllProductsWithFilters(): Promise<Category & { products: Product[] }> {
  const res = await fetch(`${API_BASE}/products/all-with-filters`, { next: { revalidate: 60 } });
  if (!res.ok) throw new Error("Failed to fetch all products");
  return res.json();
}


// --- ADMIN API ENDPOINTS ---
// We use the configured axios instance here because Admin endpoints require Sanctum authentication (cookies).
import axios from './axios';
import adminAxios from './adminAxios';

export async function fetchAdminDashboard(chartPeriod: string = '30_days', sellingPeriod: string = '30_days'): Promise<any> {
  const res = await adminAxios.get(`/api/admin/dashboard?chart_period=${chartPeriod}&selling_period=${sellingPeriod}`);
  return res.data;
}

export async function fetchUserOrders(): Promise<any> {
  const res = await axios.get('/api/user/orders');
  return res.data;
}

export async function updateUserProfile(data: FormData): Promise<any> {
  const res = await axios.post('/api/user/profile?_method=PUT', data, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return res.data;
}

export async function updateUserPassword(data: any): Promise<any> {
  const res = await axios.put('/api/user/password', data);
  return res.data;
}

export async function fetchAdminProfile(): Promise<any> {
  const res = await adminAxios.get('/api/admin/profile');
  return res.data;
}

export async function updateAdminProfile(data: FormData): Promise<any> {
  const res = await adminAxios.post('/api/admin/profile', data, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
  return res.data;
}

export async function fetchAdminOrders(page: number = 1): Promise<PaginatedResponse<any>> {
  const res = await adminAxios.get(`/api/admin/orders?page=${page}`);
  return res.data;
}

export async function fetchAdminOrder(id: string | number): Promise<any> {
  const res = await adminAxios.get(`/api/admin/orders/${id}`);
  return res.data;
}

export const fetchAdminCustomers = async () => {
  return adminAxios.get("/api/admin/customers").then((res) => res.data);
};

export const fetchAdminCustomer = async (id: string) => {
  return adminAxios.get(`/api/admin/customers/${id}`).then((res) => res.data);
};

export const fetchAdminCategories = async () => {
  return adminAxios.get("/api/admin/categories").then((res) => res.data);
};

export const createAdminCategory = async (data: { name: string; slug: string }) => {
  return adminAxios.post("/api/admin/categories", data).then((res) => res.data);
};

export const updateAdminCategory = async (id: number, data: { name: string; slug: string }) => {
  return adminAxios.put(`/api/admin/categories/${id}`, data).then((res) => res.data);
};

export const deleteAdminCategory = async (id: number) => {
  return adminAxios.delete(`/api/admin/categories/${id}`).then((res) => res.data);
};

export const createAdminBrand = async (data: FormData) => {
  return adminAxios.post("/api/admin/brands", data, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }).then((res) => res.data);
};

export const updateAdminBrand = async (id: number, data: FormData) => {
  return adminAxios.post(`/api/admin/brands/${id}`, data, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }).then((res) => res.data);
};

export const deleteAdminBrand = async (id: number) => {
  return adminAxios.delete(`/api/admin/brands/${id}`).then((res) => res.data);
};

export const toggleAdminBrandCategory = async (brandId: number, categoryId: number) => {
  return adminAxios.post(`/api/admin/brands/${brandId}/categories/${categoryId}/toggle`).then((res) => res.data);
};

export async function fetchAdminPayments(page: number = 1): Promise<PaginatedResponse<any>> {
  const res = await adminAxios.get(`/api/admin/payments?page=${page}`);
  return res.data;
}

export async function deleteAdminOrder(id: string | number): Promise<any> {
  const res = await adminAxios.delete(`/api/admin/orders/${id}`);
  return res.data;
}

export async function updateAdminOrderStatus(id: string | number, status: string): Promise<any> {
  const res = await adminAxios.put(`/api/admin/orders/${id}/status`, { status });
  return res.data;
}

export async function fetchAdminMetadata(): Promise<any> {
  const res = await adminAxios.get('/api/admin/metadata');
  return res.data;
}

export async function fetchAdminBrands(): Promise<any[]> {
  const res = await adminAxios.get('/api/admin/brands');
  return res.data;
}

export async function fetchAdminProducts(page: number = 1, search: string = '', categoryId: string = '', stockStatus: string = '', brandId: string = ''): Promise<PaginatedResponse<any>> {
  const params = new URLSearchParams();
  if (page) params.append('page', page.toString());
  if (search) params.append('search', search);
  if (categoryId) params.append('category_id', categoryId);
  if (stockStatus) params.append('stock_status', stockStatus);
  if (brandId) params.append('brand_id', brandId);
  const res = await adminAxios.get(`/api/admin/products?${params.toString()}`);
  return res.data;
}

export async function fetchAdminProduct(id: string | number): Promise<any> {
  const res = await adminAxios.get(`/api/admin/products/${id}`);
  return res.data;
}

export async function createAdminProduct(data: any): Promise<any> {
  const res = await adminAxios.post('/api/admin/products', data);
  return res.data;
}

export async function updateAdminProduct(id: string | number, data: any): Promise<any> {
  if (data instanceof FormData) {
    const res = await adminAxios.post(`/api/admin/products/${id}`, data, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return res.data;
  }
  const res = await adminAxios.put(`/api/admin/products/${id}`, data);
  return res.data;
}

export async function deleteAdminProduct(id: string | number): Promise<any> {
  const res = await adminAxios.delete(`/api/admin/products/${id}`);
  return res.data;
}

// Configurations
export async function addAdminConfiguration(groupId: string | number, data: any): Promise<any> {
  const res = await adminAxios.post(`/api/admin/products/${groupId}/configurations`, data);
  return res.data;
}

export async function deleteAdminConfiguration(configId: string | number): Promise<any> {
  const res = await adminAxios.delete(`/api/admin/products/configurations/${configId}`);
  return res.data;
}

// Variants
export async function createAdminVariant(configId: string | number, data: any): Promise<ProductVariant> {
  const res = await adminAxios.post(`/api/admin/products/configurations/${configId}/variants`, data);
  return res.data;
}

export async function updateAdminVariant(variantId: string | number, data: any): Promise<ProductVariant> {
  const res = await adminAxios.put(`/api/admin/products/variants/${variantId}`, data);
  return res.data;
}

export async function deleteAdminVariant(variantId: string | number): Promise<any> {
  const res = await adminAxios.delete(`/api/admin/products/variants/${variantId}`);
  return res.data;
}

// Images
export async function uploadAdminProductImage(configId: string | number, file: File): Promise<any> {
  const formData = new FormData();
  formData.append('image', file);
  const res = await adminAxios.post(`/api/admin/products/configurations/${configId}/images`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
  return res.data;
}

export async function deleteAdminProductImage(imageId: string | number): Promise<any> {
  const res = await adminAxios.delete(`/api/admin/products/images/${imageId}`);
  return res.data;
}

export async function reorderAdminProductImages(configId: string | number, imageIds: number[]): Promise<any> {
  const res = await adminAxios.put(`/api/admin/products/configurations/${configId}/images/reorder`, { image_ids: imageIds });
  return res.data;
}

