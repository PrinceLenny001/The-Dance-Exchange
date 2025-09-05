"use client";

import React, { useEffect, useState } from "react";
import { loadStripe } from "@stripe/stripe-js";
import {
  Elements,
  CardElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import { toast } from "react-toastify";

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

interface PaymentFormProps {
  onPaymentSuccess: (paymentIntentId: string) => void;
  onPaymentError: (error: string) => void;
  isProcessing: boolean;
  setIsProcessing: (processing: boolean) => void;
  totalAmount: number;
  shippingAddress: any;
  items: any[];
  userId: string;
}

function PaymentForm({
  onPaymentSuccess,
  onPaymentError,
  isProcessing,
  setIsProcessing,
  totalAmount,
  shippingAddress,
  items,
  userId,
}: PaymentFormProps) {
  const stripe = useStripe();
  const elements = useElements();

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsProcessing(true);

    try {
      // Create payment intent on the server
      const response = await fetch("/api/stripe/create-payment-intent", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-user-id": userId,
        },
        body: JSON.stringify({
          amount: Math.round(totalAmount * 100), // Convert to cents
          currency: "usd",
          items,
          shippingAddress,
        }),
      });

      const { clientSecret, error: serverError } = await response.json();

      if (serverError) {
        throw new Error(serverError);
      }

      // Confirm payment with Stripe
      const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: elements.getElement(CardElement)!,
          billing_details: {
            name: shippingAddress.firstName + " " + shippingAddress.lastName,
            address: {
              line1: shippingAddress.address,
              city: shippingAddress.city,
              state: shippingAddress.state,
              postal_code: shippingAddress.zipCode,
              country: shippingAddress.country,
            },
          },
        },
      });

      if (error) {
        onPaymentError(error.message || "Payment failed");
      } else if (paymentIntent.status === "succeeded") {
        onPaymentSuccess(paymentIntent.id);
      }
    } catch (error) {
      console.error("Payment error:", error);
      onPaymentError(error instanceof Error ? error.message : "Payment failed");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
          Card Information *
        </label>
        <div className="p-3 border border-neutral-200 dark:border-neutral-700 rounded-lg bg-white dark:bg-neutral-800">
          <CardElement
            options={{
              style: {
                base: {
                  fontSize: "16px",
                  color: "#424770",
                  "::placeholder": {
                    color: "#aab7c4",
                  },
                },
                invalid: {
                  color: "#9e2146",
                },
              },
            }}
          />
        </div>
      </div>

      <div className="flex items-center gap-2 text-sm text-neutral-500 dark:text-neutral-400 mb-4">
        <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
        </svg>
        <span>Your payment information is secure and encrypted</span>
      </div>
      
      <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 mb-6">
        <div className="flex items-start gap-2">
          <div className="w-5 h-5 text-yellow-600 dark:text-yellow-400 mt-0.5">
            ⚠️
          </div>
          <div className="text-sm">
            <p className="text-yellow-800 dark:text-yellow-200 font-medium mb-1">
              Development Mode Notice
            </p>
            <p className="text-yellow-700 dark:text-yellow-300">
              In development mode, you may see browser warnings about secure connections. 
              This is normal for local development. In production, all payments are processed securely via HTTPS.
            </p>
            <p className="text-yellow-700 dark:text-yellow-300 mt-2">
              <strong>For testing:</strong> Use test card numbers like 4242 4242 4242 4242 with any future expiry date and any 3-digit CVV.
            </p>
          </div>
        </div>
      </div>

      <div className="flex gap-4">
        <button
          type="button"
          onClick={() => window.history.back()}
          className="flex-1 px-4 py-3 border border-neutral-200 dark:border-neutral-700 rounded-lg bg-white dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-700 transition-all"
        >
          Back to Shipping
        </button>
        <button
          type="submit"
          disabled={!stripe || isProcessing}
          className="flex-1 bg-gradient-to-r from-brandBlue-500 to-brandBlue-600 hover:from-brandBlue-600 hover:to-brandBlue-700 text-white py-3 rounded-lg font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isProcessing ? "Processing..." : `Pay $${totalAmount.toFixed(2)}`}
        </button>
      </div>
    </form>
  );
}

interface StripeElementsProps {
  onPaymentSuccess: (paymentIntentId: string) => void;
  onPaymentError: (error: string) => void;
  isProcessing: boolean;
  setIsProcessing: (processing: boolean) => void;
  totalAmount: number;
  shippingAddress: any;
  items: any[];
  userId: string;
}

export default function StripeElements({
  onPaymentSuccess,
  onPaymentError,
  isProcessing,
  setIsProcessing,
  totalAmount,
  shippingAddress,
  items,
  userId,
}: StripeElementsProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="bg-white dark:bg-neutral-800 rounded-2xl shadow-lg p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-neutral-200 dark:bg-neutral-700 rounded mb-4"></div>
          <div className="h-32 bg-neutral-200 dark:bg-neutral-700 rounded mb-4"></div>
          <div className="h-10 bg-neutral-200 dark:bg-neutral-700 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <Elements stripe={stripePromise}>
      <PaymentForm
        onPaymentSuccess={onPaymentSuccess}
        onPaymentError={onPaymentError}
        isProcessing={isProcessing}
        setIsProcessing={setIsProcessing}
        totalAmount={totalAmount}
        shippingAddress={shippingAddress}
        items={items}
        userId={userId}
      />
    </Elements>
  );
}
