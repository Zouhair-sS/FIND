"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode, useMemo, useRef, useCallback } from "react";
import { fetchProductBySlug } from "@/lib/api";
import { useAuth } from "@/components/AuthContext";

// A UUID generator for the cart
function generateUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

export interface CartItem {
  productId: number;
  productSlug: string;
  variantId: number; // Important: we store the variant ID
  quantity: number;
  
  // Cached for fast rendering before API loads the fresh price/data
  cachedPrice?: number;
  cachedTitle: string;
  cachedImage?: string;
  cachedAttributes?: string; 
}

export interface EnrichedCartItem extends CartItem {
  price: number | null; // Fetched live price
  stock_quantity: number | null; // Fetched live stock
}

interface CartState {
  cartId: string;
  items: CartItem[];
}

interface CartContextType {
  cartId: string;
  items: CartItem[];
  enrichedItems: EnrichedCartItem[];
  isCartOpen: boolean;
  setIsCartOpen: (isOpen: boolean) => void;
  addItem: (item: Omit<CartItem, "quantity"> & { quantity?: number }) => void;
  removeItem: (variantId: number) => void;
  updateQuantity: (variantId: number, quantity: number) => void;
  clearCart: () => void;
  itemCount: number;
  subtotal: number;
  isLoadingPrices: boolean;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const EMPTY_CART: CartState = { cartId: "", items: [] };

/** Returns the localStorage key for the cart based on the current user */
function getCartStorageKey(userId: number | null): string {
  return userId ? `find_cart_v3_user_${userId}` : "find_cart_v3_guest";
}

/** Load cart state from localStorage for a given user */
function loadCartFromStorage(userId: number | null): CartState {
  try {
    const key = getCartStorageKey(userId);
    const saved = localStorage.getItem(key);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (!parsed.cartId) parsed.cartId = generateUUID();
      return parsed;
    }
  } catch {
    // Corrupted data, start fresh
  }
  return { cartId: generateUUID(), items: [] };
}

/** Save cart state to localStorage for a given user */
function saveCartToStorage(userId: number | null, state: CartState) {
  try {
    const key = getCartStorageKey(userId);
    localStorage.setItem(key, JSON.stringify(state));
  } catch {
    console.error("Failed to save cart to localStorage");
  }
}

export function CartProvider({ children }: { children: ReactNode }) {
  const { user, loading: authLoading } = useAuth();
  const [state, setState] = useState<CartState>(EMPTY_CART);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [livePrices, setLivePrices] = useState<Record<number, { price: number; stock: number }>>({});
  const [isLoadingPrices, setIsLoadingPrices] = useState(false);
  
  // Track the current user ID to detect changes and persist to the right key
  const currentUserIdRef = useRef<number | null | undefined>(undefined);

  // 1. Load cart when auth state resolves or user changes
  useEffect(() => {
    // Don't load until we're client-side and auth has resolved
    if (authLoading) return;

    const userId = user?.id ?? null;

    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsMounted(true);

    // If the user identity hasn't changed, don't reload
    if (currentUserIdRef.current === userId) return;
    
    currentUserIdRef.current = userId;
    const loaded = loadCartFromStorage(userId);
    setState(loaded);
    // Reset live prices when switching users
    setLivePrices({});
  }, [user, authLoading]);

  // 2. Save to localStorage whenever cart state changes
  useEffect(() => {
    if (!isMounted || !state.cartId) return;
    // currentUserIdRef always holds the resolved user
    const userId = currentUserIdRef.current;
    if (userId === undefined) return; // auth hasn't resolved yet
    saveCartToStorage(userId, state);
  }, [state, isMounted]);

  // 3. Fetch live prices for variants in cart
  useEffect(() => {
    if (!isMounted || state.items.length === 0) return;

    let isCanceled = false;

    const fetchPrices = async () => {
      setIsLoadingPrices(true);
      const newLivePrices = { ...livePrices };
      
      const uniqueSlugs = Array.from(new Set(state.items.map(i => i.productSlug)));
      
      try {
        await Promise.all(uniqueSlugs.map(async (slug) => {
          try {
            const product = await fetchProductBySlug(slug);
            product.variants?.forEach((v) => {
              newLivePrices[v.id] = {
                price: parseFloat(v.price),
                stock: v.stock_quantity
              };
            });
          } catch {
            console.error(`Failed to fetch product ${slug} for live prices`);
          }
        }));

        if (!isCanceled) {
          setLivePrices(newLivePrices);
        }
      } finally {
        if (!isCanceled) setIsLoadingPrices(false);
      }
    };

    fetchPrices();

    return () => {
      isCanceled = true;
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.items, isMounted]); // livePrices deliberately omitted to avoid infinite loops

  const addItem = useCallback((newItem: Omit<CartItem, "quantity"> & { quantity?: number }) => {
    const qty = newItem.quantity || 1;
    setState((prev) => {
      const existing = prev.items.find((i) => i.variantId === newItem.variantId);
      const stock = livePrices[newItem.variantId]?.stock;

      if (existing) {
        let newQty = existing.quantity + qty;
        if (stock !== undefined && newQty > stock) newQty = stock;
        return {
          ...prev,
          items: prev.items.map((i) =>
            i.variantId === newItem.variantId ? { ...i, quantity: newQty } : i
          ),
        };
      }
      
      let initialQty = qty;
      if (stock !== undefined && initialQty > stock) initialQty = stock;
      
      return {
        ...prev,
        items: [...prev.items, { ...newItem, quantity: initialQty }],
      };
    });
    setIsCartOpen(true);
  }, [livePrices]);

  const removeItem = useCallback((variantId: number) => {
    setState((prev) => ({
      ...prev,
      items: prev.items.filter((i) => i.variantId !== variantId),
    }));
  }, []);

  const updateQuantity = useCallback((variantId: number, quantity: number) => {
    if (quantity <= 0) {
      removeItem(variantId);
      return;
    }
    
    const stock = livePrices[variantId]?.stock;
    const finalQuantity = (stock !== undefined && quantity > stock) ? stock : quantity;

    setState((prev) => ({
      ...prev,
      items: prev.items.map((i) => (i.variantId === variantId ? { ...i, quantity: finalQuantity } : i)),
    }));
  }, [livePrices, removeItem]);

  const clearCart = useCallback(() => setState(prev => ({ ...prev, items: [] })), []);

  // Derived state
  const enrichedItems: EnrichedCartItem[] = useMemo(() => {
    return state.items.map(item => ({
      ...item,
      price: livePrices[item.variantId]?.price ?? item.cachedPrice ?? null,
      stock_quantity: livePrices[item.variantId]?.stock ?? null,
    }));
  }, [state.items, livePrices]);

  const itemCount = useMemo(() => state.items.reduce((total, item) => total + item.quantity, 0), [state.items]);
  
  const subtotal = useMemo(() => {
    return enrichedItems.reduce((total, item) => {
      if (item.price !== null) {
        return total + item.price * item.quantity;
      }
      return total;
    }, 0);
  }, [enrichedItems]);

  return (
    <CartContext.Provider
      value={{
        cartId: state.cartId,
        items: state.items,
        enrichedItems,
        isCartOpen,
        setIsCartOpen,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        itemCount,
        subtotal,
        isLoadingPrices,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
