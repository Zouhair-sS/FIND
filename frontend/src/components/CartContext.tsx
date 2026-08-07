"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode, useMemo } from "react";
import { fetchProductBySlug } from "@/lib/api";
import type { Product, ProductVariant } from "@/lib/api";

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

export function CartProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<CartState>({ cartId: "", items: [] });
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [livePrices, setLivePrices] = useState<Record<number, { price: number; stock: number }>>({});
  const [isLoadingPrices, setIsLoadingPrices] = useState(false);

  // 1. Load from local storage
  useEffect(() => {
    setIsMounted(true);
    const saved = localStorage.getItem("find_cart_v2");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (!parsed.cartId) parsed.cartId = generateUUID();
        setState(parsed);
      } catch (e) {
        setState({ cartId: generateUUID(), items: [] });
      }
    } else {
      setState({ cartId: generateUUID(), items: [] });
    }
  }, []);

  // 2. Save to local storage
  useEffect(() => {
    if (isMounted && state.cartId) {
      localStorage.setItem("find_cart_v2", JSON.stringify(state));
    }
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
          } catch (e) {
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

  const addItem = (newItem: Omit<CartItem, "quantity"> & { quantity?: number }) => {
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
  };

  const removeItem = (variantId: number) => {
    setState((prev) => ({
      ...prev,
      items: prev.items.filter((i) => i.variantId !== variantId),
    }));
  };

  const updateQuantity = (variantId: number, quantity: number) => {
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
  };

  const clearCart = () => setState(prev => ({ ...prev, items: [] }));

  // Derived state
  const enrichedItems: EnrichedCartItem[] = useMemo(() => {
    return state.items.map(item => ({
      ...item,
      price: livePrices[item.variantId]?.price ?? null,
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
