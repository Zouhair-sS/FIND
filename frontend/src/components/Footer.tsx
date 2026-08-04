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
      {/* Trust badges */}
      <div className="max-w-7xl mx-auto px-6 py-10 grid grid-cols-2 md:grid-cols-4 gap-6 border-b border-gray-100">
        <TrustBadge
          icon={
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 00-3.213-9.193 2.056 2.056 0 00-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 00-10.026 0 1.106 1.106 0 00-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12" /></svg>
          }
          title="Free shipping"
          desc="On every order over $50"
        />
        <TrustBadge
          icon={
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" /></svg>
          }
          title="2-year warranty"
          desc="Standard on every device"
        />
        <TrustBadge
          icon={
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20.25 8.511c.884.284 1.5 1.128 1.5 2.097v4.286c0 1.136-.847 2.1-1.98 2.193-.34.027-.68.052-1.02.072v3.091l-3-3c-1.354 0-2.694-.055-4.02-.163a2.115 2.115 0 01-.825-.242m9.345-8.334a2.126 2.126 0 00-.476-.095 48.64 48.64 0 00-8.048 0c-1.131.094-1.976 1.057-1.976 2.192v4.286c0 .837.46 1.58 1.155 1.951m9.345-8.334V6.637c0-1.621-1.152-3.026-2.76-3.235A48.455 48.455 0 0011.25 3c-2.115 0-4.198.137-6.24.402-1.608.209-2.76 1.614-2.76 3.235v6.226c0 1.621 1.152 3.026 2.76 3.235.577.075 1.157.14 1.74.194V21l4.155-4.155" /></svg>
          }
          title="24/7 real support"
          desc="Talk to an actual human"
        />
        <TrustBadge
          icon={
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182" /></svg>
          }
          title="30-day returns"
          desc="No questions asked"
        />
      </div>

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
