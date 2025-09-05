"use client";

import React from "react";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { ShoppingCart, Trash2, Plus, Minus, ArrowLeft, Package } from "lucide-react";
import Link from "next/link";
import { toast } from "react-toastify";

export default function CartPage() {
  const { items, removeItem, clearCart, getTotalPrice, getItemCount } = useCart();
  const { user } = useAuth();
  const router = useRouter();

  const handleCheckout = () => {
    if (!user) {
      toast.error("Please log in to proceed to checkout");
      router.push("/auth/login");
      return;
    }

    if (items.length === 0) {
      toast.error("Your cart is empty");
      return;
    }

    router.push("/checkout");
  };

  const handleRemoveItem = (itemId: string) => {
    removeItem(itemId);
  };

  const handleClearCart = () => {
    if (items.length === 0) return;
    
    if (window.confirm("Are you sure you want to clear your cart?")) {
      clearCart();
    }
  };

  const calculateShipping = () => {
    // Calculate shipping based on individual item shipping costs
    return items.reduce((total, item) => {
      return total + (item.shippingCost * item.quantity);
    }, 0);
  };

  const calculateTotal = () => {
    return getTotalPrice() + calculateShipping();
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-white to-neutral-50 dark:from-neutral-900 dark:to-neutral-950">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-2xl mx-auto text-center">
            <div className="w-24 h-24 bg-neutral-100 dark:bg-neutral-800 rounded-full flex items-center justify-center mx-auto mb-6">
              <ShoppingCart className="h-12 w-12 text-neutral-400" />
            </div>
            <h1 className="text-3xl font-bold text-neutral-900 dark:text-white mb-4">
              Your Cart is Empty
            </h1>
            <p className="text-neutral-600 dark:text-neutral-400 mb-8">
              Looks like you haven't added any costumes to your cart yet. Start shopping to find your perfect costume!
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/search"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-gradient-to-r from-brandBlue-500 to-brandBlue-600 text-white hover:from-brandBlue-600 hover:to-brandBlue-700 transition-all"
              >
                <Package className="h-5 w-5" />
                Browse Costumes
              </Link>
              <Link
                href="/"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-700 transition-all"
              >
                <ArrowLeft className="h-5 w-5" />
                Go Home
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-neutral-50 dark:from-neutral-900 dark:to-neutral-950">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <Link
                href="/"
                className="flex items-center gap-2 text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition-colors"
              >
                <ArrowLeft className="h-4 w-4" />
                Continue Shopping
              </Link>
              <h1 className="text-3xl font-bold text-neutral-900 dark:text-white">
                Shopping Cart ({getItemCount()} {getItemCount() === 1 ? 'item' : 'items'})
              </h1>
            </div>
            <button
              onClick={handleClearCart}
              className="text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 transition-colors"
            >
              Clear Cart
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-4">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="bg-white dark:bg-neutral-800 rounded-2xl shadow-lg overflow-hidden"
                >
                  <div className="flex">
                    {/* Item Image */}
                    <div className="w-32 h-32 bg-neutral-100 dark:bg-neutral-700 flex items-center justify-center">
                      {item.imageUrl ? (
                        <img
                          src={item.imageUrl}
                          alt={item.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <Package className="h-8 w-8 text-neutral-400" />
                      )}
                    </div>

                    {/* Item Details */}
                    <div className="flex-1 p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-neutral-900 dark:text-white mb-2">
                            {item.title}
                          </h3>
                          <div className="flex items-center gap-4 text-sm text-neutral-500 dark:text-neutral-400 mb-2">
                            <span>Size: {item.size}</span>
                            <span>•</span>
                            <span>Condition: {item.condition}</span>
                          </div>
                          <div className="text-sm text-neutral-500 dark:text-neutral-400 mb-2">
                            Sold by @{item.seller.username}
                          </div>
                          
                          {/* Shipping Information */}
                          <div className="text-sm text-neutral-600 dark:text-neutral-300 bg-neutral-50 dark:bg-neutral-700/50 rounded-lg p-2">
                            <div className="flex justify-between items-center">
                              <span>
                                <strong>Shipping:</strong> {item.shippingMethod}
                                {item.shippingCost === 0 && " (Free)"}
                              </span>
                              <span className="font-medium">
                                {item.shippingCost === 0 ? "Free" : `$${item.shippingCost.toFixed(2)}`}
                              </span>
                            </div>
                            <div className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
                              Est. delivery: {item.estimatedDelivery}
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold text-brandBlue-600 dark:text-brandBlue-400 mb-2">
                            ${item.price.toFixed(2)}
                          </div>
                          <button
                            onClick={() => handleRemoveItem(item.id)}
                            className="flex items-center gap-1 text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 transition-colors"
                          >
                            <Trash2 className="h-4 w-4" />
                            Remove
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white dark:bg-neutral-800 rounded-2xl shadow-lg p-6 sticky top-24">
                <h2 className="text-xl font-semibold text-neutral-900 dark:text-white mb-6">
                  Order Summary
                </h2>

                <div className="space-y-4">
                  <div className="flex justify-between text-neutral-600 dark:text-neutral-400">
                    <span>Subtotal ({getItemCount()} {getItemCount() === 1 ? 'item' : 'items'})</span>
                    <span>${getTotalPrice().toFixed(2)}</span>
                  </div>
                  
                  <div className="flex justify-between text-neutral-600 dark:text-neutral-400">
                    <span>Shipping</span>
                    <span>
                      {calculateShipping() === 0 ? 'Free' : `$${calculateShipping().toFixed(2)}`}
                    </span>
                  </div>

                  {calculateShipping() > 0 && (
                    <div className="text-sm text-neutral-500 dark:text-neutral-400">
                      Free shipping on orders over $100
                    </div>
                  )}

                  <hr className="border-neutral-200 dark:border-neutral-700" />

                  <div className="flex justify-between text-lg font-semibold text-neutral-900 dark:text-white">
                    <span>Total</span>
                    <span>${calculateTotal().toFixed(2)}</span>
                  </div>
                </div>

                <button
                  onClick={handleCheckout}
                  className="w-full mt-6 bg-gradient-to-r from-brandBlue-500 to-brandBlue-600 hover:from-brandBlue-600 hover:to-brandBlue-700 text-white py-4 rounded-lg font-medium shadow-lg shadow-brandBlue-500/20 transition-all hover:shadow-xl hover:shadow-brandBlue-500/30"
                >
                  Proceed to Checkout
                </button>

                <div className="mt-4 text-center">
                  <p className="text-sm text-neutral-500 dark:text-neutral-400">
                    Secure checkout with Stripe
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
