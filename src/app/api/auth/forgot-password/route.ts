import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { sendPasswordResetEmail } from "@/lib/email/sendEmail";
import { z } from "zod";
import crypto from "crypto";

const forgotPasswordSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate input
    const validationResult = forgotPasswordSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { 
          error: "Validation failed", 
          errors: validationResult.error.flatten().fieldErrors 
        },
        { status: 400 }
      );
    }

    const { email } = validationResult.data;

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email },
    });

    // Always return success to prevent email enumeration attacks
    // But only send email if user exists
    if (user) {
      // Generate reset token
      const resetToken = crypto.randomBytes(32).toString("hex");
      const hashedToken = crypto.createHash("sha256").update(resetToken).digest("hex");
      
      // Set expiration to 1 hour from now
      const resetExpires = new Date(Date.now() + 60 * 60 * 1000);

      // Update user with reset token
      await prisma.user.update({
        where: { id: user.id },
        data: {
          passwordResetToken: hashedToken,
          passwordResetExpires: resetExpires,
        },
      });

      // Send reset email
      try {
        await sendPasswordResetEmail(email, user.firstName || user.username || "User", resetToken);
      } catch (error) {
        console.error("Failed to send password reset email:", error);
        // Don't fail the request if email sending fails
      }
    }

    // Always return success response
    return NextResponse.json(
      {
        message: "If an account with that email exists, we've sent a password reset link.",
      },
      { status: 200 }
    );

  } catch (error) {
    console.error("Forgot password error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
