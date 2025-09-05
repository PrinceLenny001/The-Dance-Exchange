import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";

export async function GET() {
  try {
    // Test basic Stripe connection
    const balance = await stripe.balance.retrieve();
    
    return NextResponse.json({
      success: true,
      message: "Stripe connection successful",
      balance: balance.available[0]?.amount || 0,
      currency: balance.available[0]?.currency || 'usd',
      environment: process.env.NODE_ENV,
      hasSecretKey: !!process.env.STRIPE_SECRET_KEY,
      hasPublishableKey: !!process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
      hasConnectClientId: !!process.env.STRIPE_CONNECT_CLIENT_ID,
    });
  } catch (error) {
    console.error("Stripe test error:", error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
      environment: process.env.NODE_ENV,
      hasSecretKey: !!process.env.STRIPE_SECRET_KEY,
      hasPublishableKey: !!process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
      hasConnectClientId: !!process.env.STRIPE_CONNECT_CLIENT_ID,
    }, { status: 500 });
  }
}
