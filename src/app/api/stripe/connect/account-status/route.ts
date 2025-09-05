import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { verifyToken } from "@/lib/jwt";
import { getAccountStatus } from "@/lib/stripe-connect";

export async function GET(request: NextRequest) {
  try {
    // Get user from headers
    const userId = request.headers.get("x-user-id");
    if (!userId) {
      return NextResponse.json(
        { error: "User not authenticated" },
        { status: 401 }
      );
    }

    // Get user from database
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, stripeAccountId: true, stripeAccountStatus: true },
    });

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    if (!user.stripeAccountId) {
      return NextResponse.json({
        hasAccount: false,
        message: "No Stripe account found",
      });
    }

    // Get account status from Stripe
    const accountStatus = await getAccountStatus(user.stripeAccountId);

    // Update user's account status in database
    await prisma.user.update({
      where: { id: user.id },
      data: {
        stripeAccountStatus: accountStatus.charges_enabled ? 'active' : 'pending',
      },
    });

    return NextResponse.json({
      hasAccount: true,
      accountId: user.stripeAccountId,
      status: accountStatus,
      canReceivePayments: accountStatus.charges_enabled && accountStatus.payouts_enabled,
    });

  } catch (error) {
    console.error("Get account status error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
