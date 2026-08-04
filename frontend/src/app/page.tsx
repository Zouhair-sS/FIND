import Link from "next/link";
import Image from "next/image";
import ProductCard from "@/components/ProductCard";
import { fetchProducts, fetchCategories } from "@/lib/api";

const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  laptops: (
    <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
  ),
  smartphones: (
    <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.2} d="M10.5 1.5H8.25A2.25 2.25 0 006 3.75v16.5a2.25 2.25 0 002.25 2.25h7.5A2.25 2.25 0 0018 20.25V3.75a2.25 2.25 0 00-2.25-2.25H13.5m-3 0V3h3V1.5m-3 0h3m-3 18.75h3" /></svg>
  ),
  monitors: (
    <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.2} d="M9 17.25v1.007a3 3 0 01-.879 2.122L7.5 21h9l-.621-.621A3 3 0 0115 18.257V17.25m6-12V15a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 15V5.25A2.25 2.25 0 015.25 3h13.5A2.25 2.25 0 0121 5.25z" /></svg>
  ),
  accessories: (
    <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.2} d="M21 7.5l-2.25-1.313M21 7.5v2.25m0-2.25l-2.25 1.313M3 7.5l2.25-1.313M3 7.5l2.25 1.313M3 7.5v2.25m9 3l2.25-1.313M12 12.75l-2.25-1.313M12 12.75V15m0 6.75l2.25-1.313M12 21.75V19.5m0 2.25l-2.25-1.313m0-16.875L12 2.25l2.25 1.313M21 14.25v2.25l-2.25 1.313m-13.5 0L3 16.5v-2.25" /></svg>
  ),
};

export default async function HomePage() {
  let products = null;
  let categories = null;

  try {
    const [productsRes, categoriesRes] = await Promise.all([
      fetchProducts(),
      fetchCategories(),
    ]);
    products = productsRes;
    categories = categoriesRes;
  } catch {
    // API not available — show static fallback
  }

  const featured = products?.data?.slice(0, 4) ?? [];

  return (
    <>
      {/* ── Hero Section ─────────────────────────────────────── */}
      <section className="bg-gray-50 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-6 py-20 md:py-28 flex flex-col md:flex-row items-center gap-12">
          <div className="flex-1 max-w-lg">
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-gray-900 leading-tight">
              Power that gets<br />out of your way.
            </h1>
            <p className="mt-5 text-gray-500 text-lg leading-relaxed">
              Technology tuned for people who just want to work — not tinker with drivers, bloatware, or settings menus.
            </p>
            <div className="mt-8 flex gap-3">
              <Link
                href="/laptops"
                className="px-5 py-2.5 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-800 transition-colors"
              >
                Shop laptops
              </Link>
              <Link
                href="/monitors"
                className="px-5 py-2.5 border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:border-gray-400 transition-colors"
              >
                Explore monitors
              </Link>
            </div>
          </div>

          {/* Hero image */}
          <div className="flex-1 relative w-full h-full flex items-center justify-center">
            <div className="relative w-full max-w-2xl aspect-[4/3] mx-auto">
              <Image
                src="/images/products/home%20page%20components/HomePage%20image.png"
                alt="Featured Apple ecosystem"
                fill
                className="object-contain scale-110"
                priority
                sizes="(max-width: 768px) 100vw, 50vw"
              />
            </div>
          </div>
        </div>
      </section>

      {/* ── Category Grid ────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-6 py-14">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {(categories ?? [
            { slug: "laptops", name: "Laptops", description: "Thin, fast, all-day battery" },
            { slug: "smartphones", name: "Smartphones", description: "Always connected, always ready" },
            { slug: "monitors", name: "Monitors", description: "See more, strain less" },
            { slug: "accessories", name: "Accessories", description: "Small things, big difference" },
          ]).map((cat) => (
            <Link
              key={cat.slug}
              href={`/${cat.slug}`}
              className="group border border-gray-100 rounded-xl p-6 hover:border-gray-200 hover:shadow-sm transition-all duration-200"
            >
              <div className="text-gray-400 group-hover:text-blue-600 transition-colors mb-4">
                {CATEGORY_ICONS[cat.slug] ?? CATEGORY_ICONS.accessories}
              </div>
              <h3 className="text-sm font-semibold text-gray-900">{cat.name}</h3>
              <p className="text-xs text-gray-500 mt-1">{cat.description}</p>
            </Link>
          ))}
        </div>
      </section>

      {/* ── Featured Products ────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-6 pb-16">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Featured</h2>
          <Link href="/laptops" className="text-sm text-blue-600 hover:text-blue-700 font-medium transition-colors">
            View all →
          </Link>
        </div>

        {featured.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {featured.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 text-gray-400">
            <p className="text-lg">Start the Laravel server to see products</p>
            <code className="mt-2 block text-sm text-gray-500">php artisan serve</code>
          </div>
        )}
      </section>
    </>
  );
}
