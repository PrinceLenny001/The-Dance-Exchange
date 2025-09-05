import Stripe from 'stripe';
import { stripe, PLATFORM_COMMISSION_PERCENTAGE, calculatePlatformFee, calculateSellerAmount } from './stripe';

// Stripe Connect configuration
export const STRIPE_CONNECT_CLIENT_ID = process.env.STRIPE_CONNECT_CLIENT_ID!;

// Create a Stripe Connect account for a seller
export async function createConnectAccount(sellerId: string, email: string) {
  try {
    const account = await stripe.accounts.create({
      type: 'express',
      country: 'US', // You might want to make this configurable
      email: email,
      metadata: {
        sellerId: sellerId,
      },
    });

    return account;
  } catch (error) {
    console.error('Error creating Connect account:', error);
    throw error;
  }
}

// Create account link for seller onboarding
export async function createAccountLink(accountId: string, refreshUrl: string, returnUrl: string) {
  try {
    const accountLink = await stripe.accountLinks.create({
      account: accountId,
      refresh_url: refreshUrl,
      return_url: returnUrl,
      type: 'account_onboarding',
    });

    return accountLink;
  } catch (error) {
    console.error('Error creating account link:', error);
    throw error;
  }
}

// Get account status
export async function getAccountStatus(accountId: string) {
  try {
    const account = await stripe.accounts.retrieve(accountId);
    return {
      id: account.id,
      charges_enabled: account.charges_enabled,
      payouts_enabled: account.payouts_enabled,
      details_submitted: account.details_submitted,
      requirements: account.requirements,
    };
  } catch (error) {
    console.error('Error retrieving account status:', error);
    throw error;
  }
}

// Create payment intent with application fee (commission)
export async function createPaymentIntentWithCommission({
  amount,
  currency = 'usd',
  sellerAccountId,
  applicationFeeAmount,
  metadata = {},
}: {
  amount: number;
  currency?: string;
  sellerAccountId: string;
  applicationFeeAmount: number;
  metadata?: Record<string, string>;
}) {
  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency,
      application_fee_amount: applicationFeeAmount,
      transfer_data: {
        destination: sellerAccountId,
      },
      metadata,
    });

    return paymentIntent;
  } catch (error) {
    console.error('Error creating payment intent with commission:', error);
    throw error;
  }
}

// Process marketplace payment
export async function processMarketplacePayment({
  totalAmount,
  sellerAccountId,
  items,
  metadata = {},
}: {
  totalAmount: number;
  sellerAccountId: string;
  items: Array<{ costumeId: string; price: number; quantity: number }>;
  metadata?: Record<string, string>;
}) {
  try {
    const platformFee = calculatePlatformFee(totalAmount);
    const sellerAmount = calculateSellerAmount(totalAmount);

    // Create payment intent with commission
    const paymentIntent = await createPaymentIntentWithCommission({
      amount: totalAmount,
      sellerAccountId,
      applicationFeeAmount: platformFee,
      metadata: {
        ...metadata,
        platform_fee: platformFee.toString(),
        seller_amount: sellerAmount.toString(),
        item_count: items.length.toString(),
      },
    });

    return {
      paymentIntent,
      platformFee,
      sellerAmount,
    };
  } catch (error) {
    console.error('Error processing marketplace payment:', error);
    throw error;
  }
}

// Get seller's Stripe account ID from database
export async function getSellerStripeAccountId(sellerId: string) {
  // This would typically query your database
  // For now, we'll return null and handle it in the API
  return null;
}
