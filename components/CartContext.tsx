"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

export interface CartLineItem {
  productId: string;
  variantId: string | null;
  quantity: number;
}

const CART_KEY = "lumora:cart";

function readCart(): CartLineItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(CART_KEY);
    return raw ? (JSON.parse(raw) as CartLineItem[]) : [];
  } catch {
    return [];
  }
}

interface CartContextValue {
  items: CartLineItem[];
  count: number;
  addItem: (productId: string, variantId: string | null, quantity?: number) => void;
  removeItem: (productId: string, variantId: string | null) => void;
  updateQuantity: (productId: string, variantId: string | null, quantity: number) => void;
  clear: () => void;
}

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartLineItem[]>([]);
  const [hydrated, setHydrated] = useState(false);

  // Starts empty to match SSR output, then loads localStorage after mount —
  // same hydration-safety pattern as HeroVideo's reducedMotion state.
  useEffect(() => {
    setItems(readCart());
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (hydrated) localStorage.setItem(CART_KEY, JSON.stringify(items));
  }, [items, hydrated]);

  function addItem(productId: string, variantId: string | null, quantity = 1) {
    setItems((prev) => {
      const idx = prev.findIndex((i) => i.productId === productId && i.variantId === variantId);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = { ...next[idx], quantity: next[idx].quantity + quantity };
        return next;
      }
      return [...prev, { productId, variantId, quantity }];
    });
  }

  function removeItem(productId: string, variantId: string | null) {
    setItems((prev) => prev.filter((i) => !(i.productId === productId && i.variantId === variantId)));
  }

  function updateQuantity(productId: string, variantId: string | null, quantity: number) {
    setItems((prev) =>
      prev.map((i) => (i.productId === productId && i.variantId === variantId ? { ...i, quantity } : i))
    );
  }

  function clear() {
    setItems([]);
  }

  const count = items.reduce((sum, i) => sum + i.quantity, 0);

  return (
    <CartContext.Provider value={{ items, count, addItem, removeItem, updateQuantity, clear }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
