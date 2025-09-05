"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { toast } from "react-toastify";

interface CartItem {
  id: string;
  costumeId: string;
  title: string;
  price: number;
  size: string;
  condition: string;
  imageUrl: string;
  quantity: number;
  shippingCost: number;
  shippingMethod: string;
  estimatedDelivery: string;
  seller: {
    id: string;
    username: string;
  };
}

interface CartContextType {
  items: CartItem[];
  addItem: (item: Omit<CartItem, "id">) => void;
  removeItem: (id: string) => void;
  clearCart: () => void;
  getTotalPrice: () => number;
  getItemCount: () => number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);

  // Load cart from localStorage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem("cart");
    if (savedCart) {
      try {
        setItems(JSON.parse(savedCart));
      } catch (error) {
        console.error("Error loading cart from localStorage:", error);
      }
    }
  }, []);

  // Save cart to localStorage whenever items change
  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(items));
  }, [items]);

  const addItem = (item: Omit<CartItem, "id">) => {
    const cartItem: CartItem = {
      ...item,
      quantity: item.quantity || 1,
      id: `${item.costumeId}-${item.seller.id}-${item.title}-${item.size}-${Date.now()}`,
    };

    setItems(prev => {
      // Check if item already exists (same seller, title, size)
      const existingItem = prev.find(
        existing => 
          existing.seller.id === cartItem.seller.id &&
          existing.title === cartItem.title &&
          existing.size === cartItem.size
      );

      if (existingItem) {
        toast.info("This item is already in your cart");
        return prev;
      }

      toast.success("Added to cart!");
      return [...prev, cartItem];
    });
  };

  const removeItem = (id: string) => {
    setItems(prev => prev.filter(item => item.id !== id));
    toast.success("Removed from cart");
  };

  const clearCart = () => {
    setItems([]);
    toast.success("Cart cleared");
  };

  const getTotalPrice = () => {
    return items.reduce((total, item) => total + item.price, 0);
  };

  const getItemCount = () => {
    return items.length;
  };

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        removeItem,
        clearCart,
        getTotalPrice,
        getItemCount,
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
