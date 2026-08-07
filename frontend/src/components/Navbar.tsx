"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import type { Product } from "@/lib/api";
import { useCart } from "./CartContext";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000/api";

const NAV_LINKS = [
  { label: "Laptops", href: "/laptops" },
  { label: "Smartphones", href: "/smartphones" },
  { label: "Monitors", href: "/monitors" },
  { label: "Accessories", href: "/accessories" },
];

const placeholders = ["what are you looking for ?", "iphone 16", "macbook pro"];

export default function Navbar() {
  const { itemCount, setIsCartOpen } = useCart();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [placeholderText, setPlaceholderText] = useState("");
  const [phIndex, setPhIndex] = useState(0);
  const [phCharIndex, setPhCharIndex] = useState(0);
  const [phIsDeleting, setPhIsDeleting] = useState(false);

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
    function handleClickOutside(e: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setSearchOpen(false);
      }
    }
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
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-100">
      <nav className="max-w-7xl mx-auto flex items-center justify-between px-6 h-16">
        {/* Logo */}
        <div className="flex items-center gap-10">
          <Link href="/" className="text-2xl font-bold tracking-tight text-gray-900">
            FIND<span className="text-blue-600">.</span>
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
          </ul>
        </div>

        {/* Right side */}
        <div className="flex items-center gap-4">
          {/* Search */}
          <div ref={searchRef} className="relative hidden sm:flex items-center justify-end h-10" onKeyDown={handleKeyDown}>
            {/* Search trigger / input */}
            <div 
              className={`flex items-center gap-2 border transition-all duration-300 ease-out overflow-hidden ${
                searchOpen 
                  ? 'w-[300px] px-4 py-2 rounded-full border-blue-300 bg-white shadow-sm cursor-text' 
                  : 'w-10 h-10 rounded-full border-transparent bg-transparent hover:bg-gray-100 cursor-pointer justify-center'
              }`}
              onClick={() => {
                if (!searchOpen) setSearchOpen(true);
              }}
            >
              <svg className={`flex-shrink-0 transition-colors ${searchOpen ? 'w-4 h-4 text-gray-400' : 'w-5 h-5 text-gray-500 hover:text-gray-900'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={searchOpen ? 2 : 1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              
              <input
                ref={inputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={placeholderText}
                className={`flex-1 bg-transparent outline-none text-gray-900 placeholder:text-gray-400 transition-opacity duration-300 ${searchOpen ? 'opacity-100' : 'opacity-0 w-0 pointer-events-none'}`}
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

            {/* Search results dropdown */}
            {searchOpen && (searchResults.length > 0 || isSearching || searchQuery.trim().length > 0) && (
              <div className="absolute top-full right-0 mt-2 w-[380px] bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden z-[60]">
                {isSearching ? (
                  <div className="p-6 text-center">
                    <div className="inline-block w-5 h-5 border-2 border-gray-200 border-t-blue-500 rounded-full animate-spin" />
                    <p className="text-sm text-gray-400 mt-2">Searching...</p>
                  </div>
                ) : searchResults.length > 0 ? (
                  <div className="max-h-[400px] overflow-y-auto">
                    {searchResults.map((product) => {
                      const firstImage = product.images?.[0];
                      const firstVariant = product.variants?.[0];
                      const price = firstVariant ? parseFloat(firstVariant.price) : 0;

                      return (
                        <button
                          key={product.id}
                          onClick={() => handleResultClick(product)}
                          className="w-full flex items-center gap-4 px-4 py-3 hover:bg-gray-50 transition-colors text-left border-b border-gray-50 last:border-b-0"
                        >
                          {/* Product image */}
                          <div className="relative w-14 h-14 bg-gray-50 rounded-lg flex-shrink-0 overflow-hidden">
                            {firstImage ? (
                              <Image
                                src={firstImage.url}
                                alt={product.name}
                                fill
                                className="object-contain p-1"
                                sizes="56px"
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
                            <p className="text-sm font-medium text-gray-900 truncate">{product.name}</p>
                            <p className="text-xs text-gray-400 mt-0.5">{product.category?.name}</p>
                          </div>

                          {/* Price */}
                          {price > 0 && (
                            <span className="text-sm font-semibold text-gray-900 flex-shrink-0">
                              MAD ${Math.round(price).toLocaleString()}
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                ) : searchQuery.trim().length > 0 ? (
                  <div className="p-6 text-center">
                    <p className="text-sm text-gray-500">No products found for &ldquo;{searchQuery}&rdquo;</p>
                  </div>
                ) : null}
              </div>
            )}
          </div>

          {/* Account */}
          <button className="p-2 text-gray-500 hover:text-gray-900 transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
            </svg>
          </button>

          {/* Cart */}
          <button 
            className="p-2 text-gray-500 hover:text-gray-900 transition-colors relative cursor-pointer"
            onClick={() => setIsCartOpen(true)}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
            </svg>
            {itemCount > 0 && (
              <span className="absolute top-0 right-0 inline-flex items-center justify-center px-1.5 py-0.5 text-[10px] font-bold leading-none text-white transform translate-x-1/4 -translate-y-1/4 bg-blue-600 rounded-full">
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
                      const firstImage = product.images?.[0];
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
                            {firstImage ? (
                              <Image
                                src={firstImage.url}
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
