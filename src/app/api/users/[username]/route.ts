import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ username: string }> }
) {
  try {
    const { username } = await params;

    // Get user profile
    const user = await prisma.user.findUnique({
      where: { username },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        username: true,
        profilePictureUrl: true,
        createdAt: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // Get user's costumes (placeholder for now)
    const costumes: any[] = [];

    // Calculate average rating (placeholder for now)
    const averageRating = 0;
    const totalReviews = 0;

    return NextResponse.json({
      user: {
        ...user,
        averageRating,
        totalReviews,
      },
      costumes,
    });

  } catch (error) {
    console.error("Get public profile error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
