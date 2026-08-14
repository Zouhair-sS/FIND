import Link from "next/link";

const SHOP_LINKS = [
  { label: "Laptops", href: "/laptops" },
  { label: "Smartphones", href: "/smartphones" },
  { label: "Monitors", href: "/monitors" },
  { label: "Accessories", href: "/accessories" },
];

const SUPPORT_LINKS = [
  { label: "Contact us", href: "#" },
  { label: "Warranty", href: "#" },
  { label: "Returns", href: "#" },
  { label: "Order status", href: "#" },
];

export default function Footer() {
  return (
    <footer className="bg-white border-t border-gray-100">
      {/* Trust badges removed as requested */}

      {/* Footer links */}
      <div className="max-w-7xl mx-auto px-6 py-12 grid grid-cols-1 md:grid-cols-4 gap-10">
        <div>
          <Link href="/" className="text-xl font-bold tracking-tight text-gray-900">
            FIND<span className="text-blue-600">.</span>
          </Link>
          <p className="mt-3 text-sm text-gray-500">
            Technology built for focus, not fuss.
          </p>
        </div>

        <div>
          <h4 className="text-xs font-semibold tracking-wider text-gray-400 uppercase mb-4">Shop</h4>
          <ul className="space-y-2.5">
            {SHOP_LINKS.map((l) => (
              <li key={l.href}>
                <Link href={l.href} className="text-sm text-gray-600 hover:text-gray-900 transition-colors">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="text-xs font-semibold tracking-wider text-gray-400 uppercase mb-4">Support</h4>
          <ul className="space-y-2.5">
            {SUPPORT_LINKS.map((l) => (
              <li key={l.href}>
                <Link href={l.href} className="text-sm text-gray-600 hover:text-gray-900 transition-colors">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="text-xs font-semibold tracking-wider text-gray-400 uppercase mb-4">Stay in the loop</h4>
          <div className="flex">
            <input
              type="email"
              placeholder="you@email.com"
              className="flex-1 px-3 py-2 text-sm border border-gray-200 rounded-l-lg focus:outline-none focus:border-gray-400"
            />
            <button className="px-4 py-2 bg-gray-900 text-white text-sm font-medium rounded-r-lg hover:bg-gray-800 transition-colors">
              Join
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-4 border-t border-gray-100">
        <p className="text-xs text-gray-400 text-center">
          © {new Date().getFullYear()} FIND. All rights reserved.
        </p>
      </div>
    </footer>
  );
}

function TrustBadge({ icon, title, desc }: { icon: React.ReactNode; title: string; desc: string }) {
  return (
    <div className="flex items-start gap-3">
      <div className="text-blue-600 mt-0.5">{icon}</div>
      <div>
        <p className="text-sm font-semibold text-gray-900">{title}</p>
        <p className="text-xs text-gray-500">{desc}</p>
      </div>
    </div>
  );
}
