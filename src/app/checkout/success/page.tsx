"use client";

import React from "react";
import Link from "next/link";
import { CheckCircle, Package, ArrowRight, Home } from "lucide-react";

export default function CheckoutSuccessPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-neutral-50 dark:from-neutral-900 dark:to-neutral-950">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto text-center">
          <div className="w-24 h-24 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="h-12 w-12 text-green-600 dark:text-green-400" />
          </div>
          
          <h1 className="text-4xl font-bold text-neutral-900 dark:text-white mb-4">
            Order Confirmed!
          </h1>
          
          <p className="text-lg text-neutral-600 dark:text-neutral-400 mb-8">
            Thank you for your purchase! Your order has been successfully placed and you will receive a confirmation email shortly.
          </p>

          <div className="bg-white dark:bg-neutral-800 rounded-2xl shadow-lg p-6 mb-8">
            <h2 className="text-xl font-semibold text-neutral-900 dark:text-white mb-4">
              What happens next?
            </h2>
            <div className="space-y-4 text-left">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-brandBlue-100 dark:bg-brandBlue-900/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-sm font-medium text-brandBlue-600 dark:text-brandBlue-400">1</span>
                </div>
                <div>
                  <h3 className="font-medium text-neutral-900 dark:text-white">Order Processing</h3>
                  <p className="text-sm text-neutral-600 dark:text-neutral-400">
                    The seller will be notified of your order and will prepare your costume for shipping.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-brandBlue-100 dark:bg-brandBlue-900/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-sm font-medium text-brandBlue-600 dark:text-brandBlue-400">2</span>
                </div>
                <div>
                  <h3 className="font-medium text-neutral-900 dark:text-white">Shipping</h3>
                  <p className="text-sm text-neutral-600 dark:text-neutral-400">
                    Your costume will be shipped to the address you provided. You'll receive tracking information via email.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-brandBlue-100 dark:bg-brandBlue-900/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-sm font-medium text-brandBlue-600 dark:text-brandBlue-400">3</span>
                </div>
                <div>
                  <h3 className="font-medium text-neutral-900 dark:text-white">Delivery</h3>
                  <p className="text-sm text-neutral-600 dark:text-neutral-400">
                    Once delivered, you can leave a review for the seller to help other buyers.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/profile"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-gradient-to-r from-brandBlue-500 to-brandBlue-600 text-white hover:from-brandBlue-600 hover:to-brandBlue-700 transition-all"
            >
              <Package className="h-5 w-5" />
              View My Orders
            </Link>
            <Link
              href="/search"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-700 transition-all"
            >
              <ArrowRight className="h-5 w-5" />
              Continue Shopping
            </Link>
            <Link
              href="/"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-700 transition-all"
            >
              <Home className="h-5 w-5" />
              Go Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
