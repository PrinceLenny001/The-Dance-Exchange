import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const costume = await prisma.costume.findUnique({
      where: { id },
      include: {
        images: {
          orderBy: { isPrimary: "desc" },
        },
        categories: {
          include: {
            category: true,
          },
        },
        seller: {
          select: {
            id: true,
            username: true,
            firstName: true,
            lastName: true,
            profilePictureUrl: true,
          },
        },
      },
    });

    if (!costume) {
      return NextResponse.json(
        { error: "Costume not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      costume,
    });

  } catch (error) {
    console.error("Get costume error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
