"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { useAuth } from "./AuthContext";
import { apiClient } from "@/lib/api-client";

export interface CartItem {
  id: string; // Unique cart item ID
  productId: string;
  quantity: number;
  product: {
    id: string;
    name: string;
    slug: string;
    price: number;
    comparePrice: number | null;
    images: string[];
    stock: number;
    seller: {
      shopName: string;
    };
  };
}

interface CartContextType {
  items: CartItem[];
  loading: boolean;
  addItem: (productId: string, quantity?: number) => Promise<void>;
  removeItem: (cartItemId: string) => Promise<void>;
  updateQuantity: (cartItemId: string, quantity: number) => Promise<void>;
  clearCart: () => Promise<void>;
  cartCount: number;
  cartTotal: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading: authLoading } = useAuth();
  const [items, setItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Helper to fetch cart from backend
  const fetchBackendCart = useCallback(async () => {
    try {
      const data = await apiClient.get<CartItem[]>("/api/cart");
      setItems(data);
    } catch (error) {
      console.error("Failed to fetch backend cart:", error);
    }
  }, []);

  // Sync / Load Cart
  useEffect(() => {
    if (authLoading) return;

    const loadCart = async () => {
      setLoading(true);
      if (user) {
        // Authenticated: Sync local storage cart to database, then load database cart
        const localCartData = localStorage.getItem("novacart_guest_cart");
        if (localCartData) {
          try {
            const localItems = JSON.parse(localCartData) as { productId: string; quantity: number }[];
            // Sync items sequentially to database
            for (const item of localItems) {
              await apiClient.post("/api/cart", { productId: item.productId, quantity: item.quantity });
            }
            // Clear local storage guest cart after sync
            localStorage.removeItem("novacart_guest_cart");
          } catch (e) {
            console.error("Error syncing local cart to database", e);
          }
        }
        await fetchBackendCart();
      } else {
        // Guest user: Load from local storage
        const localCartData = localStorage.getItem("novacart_guest_cart");
        if (localCartData) {
          try {
            // Since we need product details, let's keep details. In a real guest cart, 
            // product details can be stored, or fetched. For simplicity, we save details in localstorage
            // so we don't need to batch fetch product details on every page reload.
            const parsed = JSON.parse(localCartData) as CartItem[];
            setItems(parsed);
          } catch {
            setItems([]);
          }
        } else {
          setItems([]);
        }
      }
      setLoading(false);
    };

    loadCart();
  }, [user, authLoading, fetchBackendCart]);

  // Add Item
  const addItem = async (productId: string, quantity = 1) => {
    if (user) {
      setLoading(true);
      try {
        await apiClient.post("/api/cart", { productId, quantity });
        await fetchBackendCart();
      } finally {
        setLoading(false);
      }
    } else {
      // Guest: we need to fetch product info to store it locally (simulated or real endpoint /api/products/[id])
      setLoading(true);
      try {
        const product = await apiClient.get<CartItem["product"]>(`/api/products/id/${productId}`);
        const updated = [...items];
        const existingIndex = updated.findIndex((i) => i.productId === productId);

        if (existingIndex > -1) {
          updated[existingIndex].quantity = Math.min(
            product.stock,
            updated[existingIndex].quantity + quantity
          );
        } else {
          updated.push({
            id: `guest-${productId}`,
            productId,
            quantity,
            product,
          });
        }
        setItems(updated);
        localStorage.setItem("novacart_guest_cart", JSON.stringify(updated));
      } catch (err) {
        console.error("Failed to add guest item", err);
      } finally {
        setLoading(false);
      }
    }
  };

  // Remove Item
  const removeItem = async (cartItemId: string) => {
    if (user) {
      setLoading(true);
      try {
        await apiClient.delete(`/api/cart/${cartItemId}`);
        await fetchBackendCart();
      } finally {
        setLoading(false);
      }
    } else {
      const updated = items.filter((i) => i.id !== cartItemId);
      setItems(updated);
      localStorage.setItem("novacart_guest_cart", JSON.stringify(updated));
    }
  };

  // Update Quantity
  const updateQuantity = async (cartItemId: string, quantity: number) => {
    if (quantity <= 0) {
      await removeItem(cartItemId);
      return;
    }

    if (user) {
      setLoading(true);
      try {
        await apiClient.put(`/api/cart/${cartItemId}`, { quantity });
        await fetchBackendCart();
      } finally {
        setLoading(false);
      }
    } else {
      const updated = items.map((i) => {
        if (i.id === cartItemId) {
          return { ...i, quantity: Math.min(i.product.stock, quantity) };
        }
        return i;
      });
      setItems(updated);
      localStorage.setItem("novacart_guest_cart", JSON.stringify(updated));
    }
  };

  // Clear Cart
  const clearCart = async () => {
    if (user) {
      setLoading(true);
      try {
        await apiClient.delete("/api/cart");
        setItems([]);
      } finally {
        setLoading(false);
      }
    } else {
      setItems([]);
      localStorage.removeItem("novacart_guest_cart");
    }
  };

  const cartCount = items.reduce((count, item) => count + item.quantity, 0);
  const cartTotal = items.reduce((total, item) => total + Number(item.product.price) * item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        items,
        loading,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        cartCount,
        cartTotal,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
};
