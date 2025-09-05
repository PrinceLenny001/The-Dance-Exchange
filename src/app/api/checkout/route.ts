import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { z } from "zod";

const checkoutSchema = z.object({
  items: z.array(z.object({
    costumeId: z.string(),
    price: z.number(),
    quantity: z.number().default(1),
  })),
  shippingAddress: z.object({
    firstName: z.string(),
    lastName: z.string(),
    address: z.string(),
    city: z.string(),
    state: z.string(),
    zipCode: z.string(),
    country: z.string(),
  }),
  paymentMethod: z.string(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { items, shippingAddress, paymentMethod } = checkoutSchema.parse(body);

    // Get user from headers (you would typically get this from JWT token)
    const userId = request.headers.get("x-user-id");
    if (!userId) {
      return NextResponse.json(
        { error: "User not authenticated" },
        { status: 401 }
      );
    }

    // Verify user exists
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // Verify all costumes exist and are available
    const costumeIds = items.map(item => item.costumeId);
    const costumes = await prisma.costume.findMany({
      where: {
        id: { in: costumeIds },
        status: "available",
      },
      include: {
        seller: true,
      },
    });

    if (costumes.length !== items.length) {
      return NextResponse.json(
        { error: "Some costumes are no longer available" },
        { status: 400 }
      );
    }

    // Calculate total price
    const totalPrice = items.reduce((sum, item) => {
      const costume = costumes.find(c => c.id === item.costumeId);
      return sum + (costume ? Number(costume.price) * item.quantity : 0);
    }, 0);

    // Here you would integrate with Stripe for payment processing
    // For now, we'll simulate a successful payment
    const paymentIntentId = `pi_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Create order
    const order = await prisma.order.create({
      data: {
        buyerId: userId,
        totalPrice: totalPrice,
        status: "processing",
        shippingAddress: shippingAddress,
        orderItems: {
          create: items.map(item => ({
            costumeId: item.costumeId,
            priceAtPurchase: item.price,
            quantity: item.quantity,
          })),
        },
      },
      include: {
        orderItems: {
          include: {
            costume: {
              include: {
                seller: true,
              },
            },
          },
        },
      },
    });

    // Update costume status to sold
    await prisma.costume.updateMany({
      where: {
        id: { in: costumeIds },
      },
      data: {
        status: "sold",
      },
    });

    // Here you would send confirmation emails
    // For now, we'll just log the order
    console.log("Order created:", order.id);
    console.log("Payment Intent ID:", paymentIntentId);

    return NextResponse.json({
      success: true,
      orderId: order.id,
      paymentIntentId,
      message: "Order placed successfully",
    });

  } catch (error) {
    console.error("Checkout error:", error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid request data", details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
