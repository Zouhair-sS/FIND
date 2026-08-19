"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter, usePathname } from "next/navigation";
import { ChevronRight } from "lucide-react";

import { getImageUrl, type Product } from "@/lib/api";
import { useCart } from "./CartContext";
import { useAuth } from "@/components/AuthContext";
import { formatPrice } from "@/lib/formatPrice";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000/api";

const NAV_LINKS = [
  { label: "All Products", href: "/products" },
  { label: "Laptops", href: "/laptops" },
  { label: "Smartphones", href: "/smartphones" },
  { label: "Monitors", href: "/monitors" },
];

const ACCESSORIES_SUBCATEGORIES = [
  {
    label: "Headphones & Earbuds",
    href: "/headphones-earbuds",
    icon: "/images/UI/headphones.png",
    desc: "Wireless, ANC & more"
  },
  {
    label: "Mouses",
    href: "/mice",
    icon: "/images/UI/mouse.png",
    desc: "Gaming & productivity"
  },
  {
    label: "Keyboards",
    href: "/keyboards",
    icon: "/images/UI/keyboard(1).png",
    desc: "Mechanical & wireless"
  },
  {
    label: "Smartwatches",
    href: "/accessories-smartwatches",
    icon: "/images/UI/smartwatch.png",
    desc: "Apple Watch, Galaxy & more"
  },
];

const placeholders = ["what are you looking for ?", "iphone 16", "macbook pro"];

export default function Navbar() {
  const { itemCount, setIsCartOpen } = useCart();
  const { user, isAuthenticated, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [accessoriesOpen, setAccessoriesOpen] = useState(false);
  const [accessoriesHideTimeout, setAccessoriesHideTimeout] = useState<ReturnType<typeof setTimeout> | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const pathname = usePathname();
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleAccessoriesEnter = () => {
    if (accessoriesHideTimeout) clearTimeout(accessoriesHideTimeout);
    setAccessoriesOpen(true);
  };
  const handleAccessoriesLeave = () => {
    const t = setTimeout(() => setAccessoriesOpen(false), 150);
    setAccessoriesHideTimeout(t);
  };

  const [placeholderText, setPlaceholderText] = useState("");
  const [phIndex, setPhIndex] = useState(0);
  const [phCharIndex, setPhCharIndex] = useState(0);
  const [phIsDeleting, setPhIsDeleting] = useState(false);

  if (pathname?.startsWith("/admin")) {
    return null;
  }

  useEffect(() => {
    if (!searchOpen) return;
    
    const currentString = placeholders[phIndex];
    const typingSpeed = phIsDeleting ? 50 : 100;
    
    if (!phIsDeleting && phCharIndex === currentString.length) {
      const timeout = setTimeout(() => setPhIsDeleting(true), 1500);
      return () => clearTimeout(timeout);
    } else if (phIsDeleting && phCharIndex === 0) {
      const timeout = setTimeout(() => {
        setPhIsDeleting(false);
        setPhIndex((prev) => (prev + 1) % placeholders.length);
      }, 500);
      return () => clearTimeout(timeout);
    }
    
    const timeout = setTimeout(() => {
      setPlaceholderText(currentString.substring(0, phCharIndex + (phIsDeleting ? -1 : 1)));
      setPhCharIndex((prev) => prev + (phIsDeleting ? -1 : 1));
    }, typingSpeed);
    
    return () => clearTimeout(timeout);
  }, [phIndex, phCharIndex, phIsDeleting, searchOpen]);

  // Debounced search
  const performSearch = useCallback(async (query: string) => {
    if (query.trim().length < 1) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    try {
      const res = await fetch(
        `${API_BASE}/products/search?q=${encodeURIComponent(query.trim())}`,
        { cache: "no-store" }
      );
      if (res.ok) {
        const data = await res.json();
        setSearchResults(data);
      }
    } catch {
      // Silently fail on network errors
    } finally {
      setIsSearching(false);
    }
  }, []);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (searchQuery.trim().length < 1) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    debounceRef.current = setTimeout(() => {
      performSearch(searchQuery);
    }, 250);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [searchQuery, performSearch]);

  // Close search on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setSearchOpen(false);
      }
      // We will handle userMenu outside click inline or with another ref, 
      // but for simplicity we can just listen to any click
      const target = event.target as Element;
      if (!target.closest('.user-menu-container')) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Focus input when search opens
  useEffect(() => {
    if (searchOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [searchOpen]);

  const handleResultClick = (product: Product) => {
    setSearchOpen(false);
    setSearchQuery("");
    setSearchResults([]);
    router.push(`/product/${product.slug}`);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      setSearchOpen(false);
    } else if (e.key === "Enter" && searchQuery.trim().length > 0) {
      setSearchOpen(false);
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-100">
      <nav className="max-w-[1400px] w-full mx-auto flex items-center justify-between px-6 h-16">
        {/* Logo */}
        <div className="flex items-center gap-10">
          <Link href="/" className="flex items-center">
            <Image 
              src="/images/FIND LOGO/FIND LOGO.png" 
              alt="FIND." 
              width={160} 
              height={48} 
              className="object-contain h-10 md:h-12 w-auto scale-110 origin-left" 
              priority 
            />
          </Link>

          {/* Desktop Nav */}
          <ul className="hidden md:flex items-center gap-8">
            {NAV_LINKS.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
                >
                  {link.label}
                </Link>
              </li>
            ))}
            {/* Accessories with mega dropdown */}
            <li
              className="relative"
              onMouseEnter={handleAccessoriesEnter}
              onMouseLeave={handleAccessoriesLeave}
            >
              <Link
                href="/accessories"
                className={`text-sm transition-colors ${
                  accessoriesOpen ? 'text-gray-900' : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Accessories
              </Link>

              {/* Apple-style Mega Dropdown */}
              <div
                style={{
                  opacity: accessoriesOpen ? 1 : 0,
                  transform: accessoriesOpen ? 'translateY(0) scale(1)' : 'translateY(-6px) scale(0.98)',
                  pointerEvents: accessoriesOpen ? 'auto' : 'none',
                  transition: 'opacity 0.22s cubic-bezier(0.4,0,0.2,1), transform 0.22s cubic-bezier(0.4,0,0.2,1)',
                }}
                className="absolute top-full left-1/2 -translate-x-1/2 mt-4 w-[480px] bg-white/80 backdrop-blur-2xl rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.12)] border border-white/60 p-5 z-[60]"
                onMouseEnter={handleAccessoriesEnter}
                onMouseLeave={handleAccessoriesLeave}
              >
                {/* Arrow pointer */}
                <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-4 h-2 overflow-hidden">
                  <div className="w-3 h-3 bg-white border-l border-t border-white/60 rotate-45 translate-y-1 mx-auto shadow-sm" />
                </div>
                <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-widest mb-3 px-1">Accessories</p>
                <div className="grid grid-cols-2 gap-2">
                  {ACCESSORIES_SUBCATEGORIES.map((sub) => (
                    <Link
                      key={sub.href}
                      href={sub.href}
                      className="flex items-start gap-3 p-3 rounded-xl hover:bg-gray-50/80 transition-all group"
                    >
                      <div className="w-9 h-9 flex-shrink-0 flex items-center justify-center mt-0.5 group-hover:scale-110 transition-transform">
                        <Image src={sub.icon} alt={sub.label} width={36} height={36} className="object-contain" />
                      </div>
                      <div>
                        <p className="text-[13px] font-semibold text-gray-800 group-hover:text-gray-900">{sub.label}</p>
                        <p className="text-[11px] text-gray-400 mt-0.5">{sub.desc}</p>
                      </div>
                    </Link>
                  ))}
                </div>
                <div className="mt-3 pt-3 border-t border-gray-100">
                  <Link
                    href="/accessories"
                    className="flex items-center justify-center gap-1.5 text-[12px] font-medium text-gray-500 hover:text-gray-900 transition-colors py-1"
                  >
                    View all Accessories
                    <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </li>
          </ul>
        </div>

        {/* Right side */}
        <div className="flex items-center gap-4">
          {/* Search */}
          <div ref={searchRef} className="relative hidden sm:flex items-center justify-end h-10" onKeyDown={handleKeyDown}>
            {/* Search trigger / input */}
            <div 
              className={`group flex items-center transition-all duration-300 ease-out overflow-hidden ${
                searchOpen 
                  ? 'w-[320px] px-4 py-2.5 rounded-full border border-[#002366]/15 bg-white shadow-[0_8px_25px_rgba(0,35,102,0.08)] cursor-text' 
                  : 'w-10 h-10 rounded-full border border-transparent bg-transparent hover:bg-gray-100/80 cursor-pointer justify-center'
              }`}
              onClick={() => {
                if (!searchOpen) setSearchOpen(true);
              }}
            >
              <svg className={`flex-shrink-0 transition-colors duration-300 ${searchOpen ? 'w-[18px] h-[18px] text-[#002366]/60' : 'w-5 h-5 text-gray-500 group-hover:text-[#002366]'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={searchOpen ? 2 : 1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              
              <input
                ref={inputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={placeholderText}
                className={`bg-transparent outline-none text-[15px] text-gray-900 placeholder:text-gray-400 transition-all duration-300 ${searchOpen ? 'opacity-100 flex-1 ml-2.5' : 'opacity-0 w-0 flex-none ml-0 pointer-events-none'}`}
                tabIndex={searchOpen ? 0 : -1}
              />
              
              {searchOpen && searchQuery && (
                <button
                  onClick={(e) => { e.stopPropagation(); setSearchQuery(""); setSearchResults([]); }}
                  className="text-gray-400 hover:text-gray-600 transition-colors cursor-pointer flex-shrink-0"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>

            {/* Desktop Search Results Dropdown */}
            {searchOpen && (searchQuery.trim().length > 0 || isSearching) && (
              <div className="absolute top-full right-0 mt-3 w-[650px] bg-white/70 backdrop-blur-2xl rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.08)] border border-white/60 overflow-hidden z-[60]">
                {isSearching ? (
                  <div className="p-12 text-center text-gray-500 flex flex-col items-center gap-3">
                    <div className="inline-block w-6 h-6 border-2 border-gray-200 border-t-[#002366] rounded-full animate-spin" />
                    <span className="text-sm">Searching...</span>
                  </div>
                ) : searchResults.length > 0 ? (
                  <>
                    <div className="max-h-[450px] overflow-y-auto p-2">
                      <div className="grid grid-cols-2 gap-x-2 gap-y-1">
                        {searchResults.slice(0, 6).map((product) => {
                          const displayImageUrl = product.thumbnail || product.images?.[0]?.url;
                          const firstVariant = product.variants?.[0];
                          const price = firstVariant ? parseFloat(firstVariant.price) : 0;
                          
                          // Build a custom name string including variant specifics if any, like the screenshot
                          const specs = [
                            firstVariant?.processor ? (firstVariant.processor.includes('Puce') ? firstVariant.processor : `Puce ${firstVariant.processor}`) : null,
                            firstVariant?.ram_gb ? `${firstVariant.ram_gb}GB` : null,
                            firstVariant?.storage_gb ? (firstVariant.storage_gb >= 1024 ? `${firstVariant.storage_gb/1024}TB` : `${firstVariant.storage_gb}GB`) : null
                          ].filter(Boolean).join(' ');

                          const variantSpecs = specs ? ` - ${specs}` : '';
                          const displayName = `${product.name}${variantSpecs}`;

                          return (
                            <button
                              key={product.id}
                              onClick={() => handleResultClick(product)}
                              className="w-full flex items-center gap-4 p-3 hover:bg-black/5 transition-colors text-left rounded-xl"
                            >
                              {/* Product image */}
                              <div className="relative w-16 h-16 bg-white/60 rounded-lg shadow-sm border border-white/50 flex-shrink-0 flex items-center justify-center overflow-hidden">
                                {displayImageUrl ? (
                                  <Image
                                    unoptimized
                                    src={getImageUrl(displayImageUrl)}
                                    alt={product.name}
                                    fill
                                    className="object-contain p-1 mix-blend-multiply"
                                    sizes="64px"
                                  />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center text-gray-300">
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                    </svg>
                                  </div>
                                )}
                              </div>

                              {/* Product info */}
                              <div className="flex-1 min-w-0">
                                <p className="text-[15px] text-gray-800 leading-tight" title={displayName}>
                                  {displayName}
                                </p>
                                <p className="text-[13px] text-gray-500 mt-1">{product.category?.name}</p>
                                {price > 0 && (
                                  <p className="text-[15px] font-medium text-gray-900 mt-0.5">
                                    {formatPrice(price)}<span className="text-sm">,00DH</span>
                                  </p>
                                )}
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                    {searchResults.length > 0 && (
                      <div className="p-3 bg-black/[0.02] border-t border-black/[0.05]">
                        <button
                          onClick={() => {
                            setSearchOpen(false);
                            router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
                          }}
                          className="w-full py-2.5 bg-[#002366] hover:bg-[#001845] text-white text-[15px] font-medium rounded transition-colors"
                        >
                          View all ({searchResults.length})
                        </button>
                      </div>
                    )}
                  </>
                ) : searchQuery.trim().length > 0 ? (
                  <div className="p-6 text-center">
                    <p className="text-sm text-gray-500">No products found for &ldquo;{searchQuery}&rdquo;</p>
                  </div>
                ) : null}
              </div>
            )}
          </div>

          {/* Account */}
          <div className="relative user-menu-container">
            <button 
              className="p-2 text-gray-500 hover:text-gray-900 transition-colors flex items-center gap-2 cursor-pointer"
              onClick={() => setUserMenuOpen(!userMenuOpen)}
            >
              {isAuthenticated && user ? (
                <>
                  {user.profile_picture ? (
                    <div className="w-8 h-8 rounded-full overflow-hidden border border-gray-200">
                      <Image src={getImageUrl(user.profile_picture)} alt={user.name} width={32} height={32} className="object-cover w-full h-full" unoptimized />
                    </div>
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white text-sm font-bold">
                      {user.name.charAt(0)}
                    </div>
                  )}
                  <span className="text-sm font-medium hidden sm:block">{user.name.split(" ")[0]}</span>
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                  </svg>
                </>
              )}
            </button>

            {userMenuOpen && (
              <div className="absolute top-full right-0 mt-3 w-48 bg-white/70 backdrop-blur-2xl rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.08)] border border-white/60 py-2 z-[60]">
                {isAuthenticated ? (
                  <>
                    <div className="px-4 py-3 border-b border-gray-100 mb-1">
                      <p className="text-sm font-medium text-gray-900">{user?.name}</p>
                      <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                    </div>
                    <Link href="/profile" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-primary">
                      My Profile
                    </Link>
                    <Link href="/orders" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-primary">
                      Order History
                    </Link>
                    <button 
                      onClick={() => { logout(); setUserMenuOpen(false); }}
                      className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                    >
                      Sign Out
                    </button>
                  </>
                ) : (
                  <>
                    <Link href="/login" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-primary">
                      Sign In
                    </Link>
                    <Link href="/register" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-primary">
                      Create Account
                    </Link>
                  </>
                )}
              </div>
            )}
          </div>

          {/* Cart */}
          <button 
            onClick={() => setIsCartOpen(true)}
            className="p-2 text-gray-500 hover:text-gray-900 transition-colors relative cursor-pointer"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
            {itemCount > 0 && (
              <span className="absolute top-0 right-0 inline-flex items-center justify-center px-1.5 py-0.5 text-[10px] font-bold leading-none text-white transform translate-x-1/4 -translate-y-1/4 bg-primary rounded-full">
                {itemCount}
              </span>
            )}
          </button>

          {/* Mobile menu toggle */}
          <button
            className="md:hidden p-2 text-gray-500"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {mobileOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
      </nav>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-gray-100 bg-white px-6 py-4">
          {/* Mobile search */}
          <div className="mb-4">
            <div className="flex items-center gap-2 bg-gray-50 rounded-lg px-3 py-2 text-sm border border-gray-100">
              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => { setSearchQuery(e.target.value); setSearchOpen(true); }}
                placeholder="Search products..."
                className="flex-1 bg-transparent outline-none text-gray-900 placeholder:text-gray-400"
              />
            </div>

            {/* Mobile search results */}
            {searchQuery.trim().length > 0 && (
              <div className="mt-2 bg-gray-50 rounded-lg overflow-hidden">
                {isSearching ? (
                  <div className="p-4 text-center">
                    <div className="inline-block w-4 h-4 border-2 border-gray-200 border-t-blue-500 rounded-full animate-spin" />
                  </div>
                ) : searchResults.length > 0 ? (
                  <div className="max-h-[300px] overflow-y-auto">
                    {searchResults.map((product) => {
                      const displayImageUrl = product.thumbnail || product.images?.[0]?.url;
                      return (
                        <button
                          key={product.id}
                          onClick={() => {
                            handleResultClick(product);
                            setMobileOpen(false);
                          }}
                          className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-gray-100 transition-colors text-left"
                        >
                          <div className="relative w-10 h-10 bg-white rounded-md flex-shrink-0 overflow-hidden">
                            {displayImageUrl ? (
                              <Image
                                src={getImageUrl(displayImageUrl)}
                                alt={product.name}
                                fill
                                className="object-contain p-0.5"
                                sizes="40px"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-gray-300">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                </svg>
                              </div>
                            )}
                          </div>
                          <span className="text-sm text-gray-900 truncate">{product.name}</span>
                        </button>
                      );
                    })}
                  </div>
                ) : (
                  <p className="p-4 text-sm text-gray-400 text-center">No results</p>
                )}
              </div>
            )}
          </div>

          <ul className="space-y-3">
            {NAV_LINKS.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="block text-sm text-gray-600 hover:text-gray-900"
                  onClick={() => setMobileOpen(false)}
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </header>
  );
}
