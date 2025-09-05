import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { verifyToken } from "@/lib/jwt";
import { createConnectAccount, createAccountLink } from "@/lib/stripe-connect";

export async function POST(request: NextRequest) {
  let userId: string | null = null;
  
  try {
    // Get user from headers
    userId = request.headers.get("x-user-id");
    if (!userId) {
      return NextResponse.json(
        { error: "User not authenticated" },
        { status: 401 }
      );
    }

    // Get user from database
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true, stripeAccountId: true, stripeAccountStatus: true },
    });

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // Check if user already has a Stripe account
    if (user.stripeAccountId) {
      return NextResponse.json(
        { 
          error: "Stripe account already exists",
          accountId: user.stripeAccountId,
          status: user.stripeAccountStatus,
        },
        { status: 400 }
      );
    }

    // Create Stripe Connect account
    const account = await createConnectAccount(user.id, user.email!);

    // Update user with Stripe account ID
    await prisma.user.update({
      where: { id: user.id },
      data: {
        stripeAccountId: account.id,
        stripeAccountStatus: 'pending',
      },
    });

    // Create account link for onboarding
    const baseUrl = process.env.NEXTAUTH_URL || 'https://secondact.vercel.app';
    const accountLink = await createAccountLink(
      account.id,
      `${baseUrl}/dashboard`,
      `${baseUrl}/dashboard`
    );

    return NextResponse.json({
      accountId: account.id,
      onboardingUrl: accountLink.url,
      message: "Stripe account created successfully",
    });

  } catch (error) {
    console.error("Create Stripe account error:", error);
    console.error("Error details:", {
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      userId,
      timestamp: new Date().toISOString()
    });
    
    return NextResponse.json(
      { 
        error: "Internal server error",
        details: error instanceof Error ? error.message : String(error),
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}
