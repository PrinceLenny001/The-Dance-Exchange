import Stripe from 'stripe';
import { loadStripe } from '@stripe/stripe-js';

// Server-side Stripe instance
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

// Client-side Stripe instance
export const getStripe = () => {
  return loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);
};

// Platform commission percentage
export const PLATFORM_COMMISSION_PERCENTAGE = parseInt(process.env.STRIPE_COMMISSION_PERCENTAGE || '12');

// Helper function to calculate platform fee
export const calculatePlatformFee = (amount: number): number => {
  return Math.round(amount * (PLATFORM_COMMISSION_PERCENTAGE / 100));
};

// Helper function to calculate seller amount
export const calculateSellerAmount = (amount: number): number => {
  return amount - calculatePlatformFee(amount);
};
