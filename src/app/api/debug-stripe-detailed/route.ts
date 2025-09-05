import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { createConnectAccount } from "@/lib/stripe-connect";

export async function GET(request: NextRequest) {
  try {
    const userId = request.headers.get("x-user-id");
    
    if (!userId) {
      return NextResponse.json({
        error: "No user ID provided",
        message: "Add x-user-id header to test with a specific user"
      });
    }

    // Test database connection
    let dbTest = "❌ Failed";
    let userData = null;
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { id: true, email: true, stripeAccountId: true, stripeAccountStatus: true },
      });
      dbTest = "✅ Connected";
      userData = user;
    } catch (error) {
      dbTest = `❌ Error: ${error}`;
    }

    // Test Stripe Connect account creation (dry run)
    let stripeTest = "❌ Failed";
    let stripeError = null;
    try {
      // We'll just test the Stripe client initialization, not actually create an account
      const { stripe } = await import("@/lib/stripe");
      stripeTest = "✅ Stripe client initialized";
    } catch (error) {
      stripeTest = "❌ Failed";
      stripeError = error;
    }

    return NextResponse.json({
      message: "Detailed Stripe Connect Debug",
      timestamp: new Date().toISOString(),
      userId,
      tests: {
        database: dbTest,
        stripe: stripeTest,
        userData,
        stripeError: stripeError ? String(stripeError) : null
      },
      environment: {
        NODE_ENV: process.env.NODE_ENV,
        STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY ? "✅ Set" : "❌ Missing",
        STRIPE_CONNECT_CLIENT_ID: process.env.STRIPE_CONNECT_CLIENT_ID ? "✅ Set" : "❌ Missing",
        NEXTAUTH_URL: process.env.NEXTAUTH_URL || "❌ Missing",
      }
    });

  } catch (error) {
    return NextResponse.json({
      error: "Debug endpoint failed",
      message: String(error),
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}
