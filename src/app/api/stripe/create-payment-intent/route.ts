import { NextRequest, NextResponse } from "next/server";
import { stripe, calculatePlatformFee } from "@/lib/stripe";
import { z } from "zod";

const createPaymentIntentSchema = z.object({
  amount: z.number().min(50), // Minimum $0.50
  currency: z.string().default("usd"),
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
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log("Payment intent request body:", JSON.stringify(body, null, 2));
    const { amount, currency, items, shippingAddress } = createPaymentIntentSchema.parse(body);

    // Get user from headers (you would typically get this from JWT token)
    const userId = request.headers.get("x-user-id");
    if (!userId) {
      return NextResponse.json(
        { error: "User not authenticated" },
        { status: 401 }
      );
    }

    // Calculate platform fee
    const platformFee = calculatePlatformFee(amount);

    // Create payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency,
      automatic_payment_methods: {
        enabled: true,
      },
      metadata: {
        userId,
        itemCount: items.length.toString(),
        platformFee: platformFee.toString(),
      },
      description: `Second Act - ${items.length} costume${items.length > 1 ? 's' : ''}`,
      shipping: {
        name: `${shippingAddress.firstName} ${shippingAddress.lastName}`,
        address: {
          line1: shippingAddress.address,
          city: shippingAddress.city,
          state: shippingAddress.state,
          postal_code: shippingAddress.zipCode,
          country: shippingAddress.country,
        },
      },
    });

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
    });

  } catch (error) {
    console.error("Create payment intent error:", error);
    
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
