"use client";

import React, { useState, useEffect } from "react";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { 
  ArrowLeft, 
  Package, 
  CreditCard, 
  MapPin, 
  User,
  Lock,
  CheckCircle
} from "lucide-react";
import StripeElements from "@/components/StripeElements";
import Link from "next/link";
import { toast } from "react-toastify";

interface ShippingAddress {
  firstName: string;
  lastName: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}


export default function CheckoutPage() {
  const { items, getTotalPrice, getItemCount, clearCart } = useCart();
  const { user } = useAuth();
  const router = useRouter();
  
  const [currentStep, setCurrentStep] = useState(1);
  const [isProcessing, setIsProcessing] = useState(false);
  const [shippingAddress, setShippingAddress] = useState<ShippingAddress>({
    firstName: "",
    lastName: "",
    address: "",
    city: "",
    state: "",
    zipCode: "",
    country: "US",
  });

  useEffect(() => {
    if (!user) {
      toast.error("Please log in to proceed to checkout");
      router.push("/auth/login");
      return;
    }

    if (items.length === 0) {
      toast.error("Your cart is empty");
      router.push("/cart");
      return;
    }
  }, [user, items, router]);

  const calculateShipping = () => {
    // Calculate shipping based on individual item shipping costs
    return items.reduce((total, item) => {
      return total + (item.shippingCost * item.quantity);
    }, 0);
  };

  const calculateTotal = () => {
    return getTotalPrice() + calculateShipping();
  };

  const handleShippingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentStep(2);
  };

  const handlePaymentSuccess = async (paymentIntentId: string) => {
    try {
      // Process the order with the payment intent ID
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-user-id": user?.id || "",
        },
        body: JSON.stringify({
          items: items.map(item => ({
            costumeId: item.costumeId,
            price: item.price,
            quantity: item.quantity,
          })),
          shippingAddress,
          paymentMethod: "stripe",
          paymentIntentId,
        }),
      });

      if (response.ok) {
        toast.success("Payment successful! Your order has been placed.");
        clearCart();
        router.push("/checkout/success");
      } else {
        const error = await response.json();
        toast.error(error.error || "Order processing failed");
      }
    } catch (error) {
      console.error("Order processing error:", error);
      toast.error("Order processing failed. Please contact support.");
    }
  };

  const handlePaymentError = (error: string) => {
    toast.error(error);
    setIsProcessing(false);
  };


  if (!user || items.length === 0) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-neutral-50 dark:from-neutral-900 dark:to-neutral-950">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="flex items-center gap-4 mb-8">
            <Link
              href="/cart"
              className="flex items-center gap-2 text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Cart
            </Link>
            <h1 className="text-3xl font-bold text-neutral-900 dark:text-white">
              Checkout
            </h1>
          </div>

          {/* Progress Steps */}
          <div className="flex items-center justify-center mb-8">
            <div className="flex items-center space-x-8">
              <div className={`flex items-center ${currentStep >= 1 ? 'text-brandBlue-600 dark:text-brandBlue-400' : 'text-neutral-400'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${currentStep >= 1 ? 'bg-brandBlue-500 text-white' : 'bg-neutral-200 dark:bg-neutral-700'}`}>
                  {currentStep > 1 ? <CheckCircle className="h-4 w-4" /> : '1'}
                </div>
                <span className="ml-2 font-medium">Shipping</span>
              </div>
              <div className={`w-16 h-0.5 ${currentStep >= 2 ? 'bg-brandBlue-500' : 'bg-neutral-200 dark:bg-neutral-700'}`} />
              <div className={`flex items-center ${currentStep >= 2 ? 'text-brandBlue-600 dark:text-brandBlue-400' : 'text-neutral-400'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${currentStep >= 2 ? 'bg-brandBlue-500 text-white' : 'bg-neutral-200 dark:bg-neutral-700'}`}>
                  {currentStep > 2 ? <CheckCircle className="h-4 w-4" /> : '2'}
                </div>
                <span className="ml-2 font-medium">Payment</span>
              </div>
              <div className={`w-16 h-0.5 ${currentStep >= 3 ? 'bg-brandBlue-500' : 'bg-neutral-200 dark:bg-neutral-700'}`} />
              <div className={`flex items-center ${currentStep >= 3 ? 'text-brandBlue-600 dark:text-brandBlue-400' : 'text-neutral-400'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${currentStep >= 3 ? 'bg-brandBlue-500 text-white' : 'bg-neutral-200 dark:bg-neutral-700'}`}>
                  3
                </div>
                <span className="ml-2 font-medium">Review</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Checkout Form */}
            <div className="lg:col-span-2">
              {currentStep === 1 && (
                <form onSubmit={handleShippingSubmit} className="bg-white dark:bg-neutral-800 rounded-2xl shadow-lg p-6">
                  <h2 className="text-xl font-semibold text-neutral-900 dark:text-white mb-6 flex items-center gap-2">
                    <MapPin className="h-5 w-5" />
                    Shipping Address
                  </h2>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                        First Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={shippingAddress.firstName}
                        onChange={(e) => setShippingAddress(prev => ({ ...prev, firstName: e.target.value }))}
                        className="w-full px-3 py-2 border border-neutral-200 dark:border-neutral-700 rounded-lg bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brandBlue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                        Last Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={shippingAddress.lastName}
                        onChange={(e) => setShippingAddress(prev => ({ ...prev, lastName: e.target.value }))}
                        className="w-full px-3 py-2 border border-neutral-200 dark:border-neutral-700 rounded-lg bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brandBlue-500"
                      />
                    </div>
                  </div>

                  <div className="mt-4">
                    <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                      Address *
                    </label>
                    <input
                      type="text"
                      required
                      value={shippingAddress.address}
                      onChange={(e) => setShippingAddress(prev => ({ ...prev, address: e.target.value }))}
                      className="w-full px-3 py-2 border border-neutral-200 dark:border-neutral-700 rounded-lg bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brandBlue-500"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                    <div>
                      <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                        City *
                      </label>
                      <input
                        type="text"
                        required
                        value={shippingAddress.city}
                        onChange={(e) => setShippingAddress(prev => ({ ...prev, city: e.target.value }))}
                        className="w-full px-3 py-2 border border-neutral-200 dark:border-neutral-700 rounded-lg bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brandBlue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                        State *
                      </label>
                      <input
                        type="text"
                        required
                        value={shippingAddress.state}
                        onChange={(e) => setShippingAddress(prev => ({ ...prev, state: e.target.value }))}
                        className="w-full px-3 py-2 border border-neutral-200 dark:border-neutral-700 rounded-lg bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brandBlue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                        ZIP Code *
                      </label>
                      <input
                        type="text"
                        required
                        value={shippingAddress.zipCode}
                        onChange={(e) => setShippingAddress(prev => ({ ...prev, zipCode: e.target.value }))}
                        className="w-full px-3 py-2 border border-neutral-200 dark:border-neutral-700 rounded-lg bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brandBlue-500"
                      />
                    </div>
                  </div>

                  <div className="mt-4">
                    <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                      Country *
                    </label>
                    <select
                      required
                      value={shippingAddress.country}
                      onChange={(e) => setShippingAddress(prev => ({ ...prev, country: e.target.value }))}
                      className="w-full px-3 py-2 border border-neutral-200 dark:border-neutral-700 rounded-lg bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brandBlue-500"
                    >
                      <option value="US">United States</option>
                      <option value="CA">Canada</option>
                    </select>
                  </div>

                  <button
                    type="submit"
                    className="w-full mt-6 bg-gradient-to-r from-brandBlue-500 to-brandBlue-600 hover:from-brandBlue-600 hover:to-brandBlue-700 text-white py-3 rounded-lg font-medium transition-all"
                  >
                    Continue to Payment
                  </button>
                </form>
              )}

              {currentStep === 2 && (
                <div className="bg-white dark:bg-neutral-800 rounded-2xl shadow-lg p-6">
                  <h2 className="text-xl font-semibold text-neutral-900 dark:text-white mb-6 flex items-center gap-2">
                    <CreditCard className="h-5 w-5" />
                    Payment Information
                  </h2>

                  <StripeElements
                    onPaymentSuccess={handlePaymentSuccess}
                    onPaymentError={handlePaymentError}
                    isProcessing={isProcessing}
                    setIsProcessing={setIsProcessing}
                    totalAmount={calculateTotal()}
                    shippingAddress={shippingAddress}
                    items={items}
                  />
                </div>
              )}
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white dark:bg-neutral-800 rounded-2xl shadow-lg p-6 sticky top-24">
                <h2 className="text-xl font-semibold text-neutral-900 dark:text-white mb-6">
                  Order Summary
                </h2>

                <div className="space-y-4">
                  {items.map((item) => (
                    <div key={item.id} className="space-y-2">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-neutral-100 dark:bg-neutral-700 rounded-lg flex items-center justify-center">
                          {item.imageUrl ? (
                            <img
                              src={item.imageUrl}
                              alt={item.title}
                              className="w-full h-full object-cover rounded-lg"
                            />
                          ) : (
                            <Package className="h-6 w-6 text-neutral-400" />
                          )}
                        </div>
                        <div className="flex-1">
                          <h4 className="font-medium text-neutral-900 dark:text-white text-sm">
                            {item.title}
                          </h4>
                          <p className="text-xs text-neutral-500 dark:text-neutral-400">
                            {item.size} • {item.condition}
                          </p>
                        </div>
                        <div className="text-sm font-medium text-neutral-900 dark:text-white">
                          ${item.price.toFixed(2)}
                        </div>
                      </div>
                      
                      {/* Shipping details for this item */}
                      <div className="ml-15 text-xs text-neutral-500 dark:text-neutral-400 bg-neutral-50 dark:bg-neutral-700/50 rounded-lg p-2">
                        <div className="flex justify-between items-center">
                          <span>
                            <strong>Shipping:</strong> {item.shippingMethod}
                            {item.shippingCost === 0 && " (Free)"}
                          </span>
                          <span>
                            {item.shippingCost === 0 ? "Free" : `$${item.shippingCost.toFixed(2)}`}
                          </span>
                        </div>
                        <div className="text-xs text-neutral-400 dark:text-neutral-500 mt-1">
                          Est. delivery: {item.estimatedDelivery}
                        </div>
                      </div>
                    </div>
                  ))}

                  <hr className="border-neutral-200 dark:border-neutral-700" />

                  <div className="space-y-2">
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
                    
                    {/* Show shipping method summary if all items have same shipping method */}
                    {items.length > 0 && items.every(item => item.shippingMethod === items[0].shippingMethod) && (
                      <div className="text-xs text-neutral-500 dark:text-neutral-400 bg-neutral-50 dark:bg-neutral-700/50 rounded-lg p-2">
                        <strong>Shipping Method:</strong> {items[0].shippingMethod}
                        {items[0].shippingCost === 0 && " (Free pickup)"}
                      </div>
                    )}

                    <hr className="border-neutral-200 dark:border-neutral-700" />

                    <div className="flex justify-between text-lg font-semibold text-neutral-900 dark:text-white">
                      <span>Total</span>
                      <span>${calculateTotal().toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
