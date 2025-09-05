import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { verifyToken } from "@/lib/jwt";
import { z } from "zod";

const updateCostumeSchema = z.object({
  title: z.string().min(1, "Title is required").max(100, "Title must be less than 100 characters").optional(),
  description: z.string().min(1, "Description is required").max(1000, "Description must be less than 1000 characters").optional(),
  price: z.number().positive("Price must be positive").optional(),
  size: z.string().min(1, "Size is required").optional(),
  condition: z.enum(["NEW", "LIKE_NEW", "GOOD", "FAIR"], {
    errorMap: () => ({ message: "Invalid condition" })
  }).optional(),
  status: z.enum(["available", "sold"], {
    errorMap: () => ({ message: "Invalid status" })
  }).optional(),
  categoryIds: z.array(z.string()).min(1, "At least one category is required").optional(),
  imageUrls: z.array(z.string()).min(1, "At least one image is required").optional(),
  primaryImageIndex: z.number().min(0).max(9).optional(),
  shippingCost: z.number().min(0, "Shipping cost cannot be negative").optional(),
  shippingMethod: z.string().min(1, "Shipping method is required").optional(),
  estimatedDelivery: z.string().optional(),
});

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

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Get token from Authorization header
    const authHeader = request.headers.get("authorization");
    const token = authHeader?.replace("Bearer ", "");

    if (!token) {
      return NextResponse.json(
        { error: "Authorization token required" },
        { status: 401 }
      );
    }

    // Verify token
    const payload = verifyToken(token);
    if (!payload) {
      return NextResponse.json(
        { error: "Invalid or expired token" },
        { status: 401 }
      );
    }

    const { id } = await params;
    const body = await request.json();
    
    // Validate input
    const validationResult = updateCostumeSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { 
          error: "Validation failed", 
          errors: validationResult.error.flatten().fieldErrors 
        },
        { status: 400 }
      );
    }

    // Check if costume exists and belongs to user
    const existingCostume = await prisma.costume.findUnique({
      where: { id },
      select: { sellerId: true, status: true },
    });

    if (!existingCostume) {
      return NextResponse.json(
        { error: "Costume not found" },
        { status: 404 }
      );
    }

    if (existingCostume.sellerId !== payload.userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 403 }
      );
    }

    // Check if costume is sold (cannot edit sold costumes)
    if (existingCostume.status === "sold") {
      return NextResponse.json(
        { error: "Cannot edit sold costumes" },
        { status: 400 }
      );
    }

    const updateData = validationResult.data;

    // Update costume in a transaction
    const costume = await prisma.$transaction(async (tx) => {
      // Update the costume
      const updatedCostume = await tx.costume.update({
        where: { id },
        data: {
          title: updateData.title,
          description: updateData.description,
          price: updateData.price,
          size: updateData.size,
          condition: updateData.condition,
          status: updateData.status,
        },
      });

      // Update categories if provided
      if (updateData.categoryIds) {
        // Verify categories exist
        const categories = await tx.costumeCategory.findMany({
          where: { id: { in: updateData.categoryIds } },
        });

        if (categories.length !== updateData.categoryIds.length) {
          throw new Error("One or more categories not found");
        }

        // Delete existing category associations
        await tx.costumeToCategory.deleteMany({
          where: { costumeId: id },
        });

        // Create new category associations
        await Promise.all(
          updateData.categoryIds.map((categoryId) =>
            tx.costumeToCategory.create({
              data: {
                costumeId: id,
                categoryId,
              },
            })
          )
        );
      }

      // Update images if provided
      if (updateData.imageUrls) {
        // Delete existing images
        await tx.costumeImage.deleteMany({
          where: { costumeId: id },
        });

        // Create new images
        await Promise.all(
          updateData.imageUrls.map((imageUrl, index) =>
            tx.costumeImage.create({
              data: {
                costumeId: id,
                imageUrl,
                isPrimary: index === (updateData.primaryImageIndex || 0),
              },
            })
          )
        );
      }

      return updatedCostume;
    });

    // Return the updated costume with relations
    const costumeWithRelations = await prisma.costume.findUnique({
      where: { id: costume.id },
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

    return NextResponse.json({
      message: "Costume updated successfully",
      costume: costumeWithRelations,
    });

  } catch (error) {
    console.error("Update costume error:", error);
    if (error instanceof Error && error.message === "One or more categories not found") {
      return NextResponse.json(
        { error: "One or more categories not found" },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Get token from Authorization header
    const authHeader = request.headers.get("authorization");
    const token = authHeader?.replace("Bearer ", "");

    if (!token) {
      return NextResponse.json(
        { error: "Authorization token required" },
        { status: 401 }
      );
    }

    // Verify token
    const payload = verifyToken(token);
    if (!payload) {
      return NextResponse.json(
        { error: "Invalid or expired token" },
        { status: 401 }
      );
    }

    const { id } = await params;

    // Check if costume exists and belongs to user
    const existingCostume = await prisma.costume.findUnique({
      where: { id },
      select: { sellerId: true, status: true },
    });

    if (!existingCostume) {
      return NextResponse.json(
        { error: "Costume not found" },
        { status: 404 }
      );
    }

    if (existingCostume.sellerId !== payload.userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 403 }
      );
    }

    // Check if costume is sold (cannot delete sold costumes)
    if (existingCostume.status === "sold") {
      return NextResponse.json(
        { error: "Cannot delete sold costumes" },
        { status: 400 }
      );
    }

    // Delete costume (cascade will handle related records)
    await prisma.costume.delete({
      where: { id },
    });

    return NextResponse.json({
      message: "Costume deleted successfully",
    });

  } catch (error) {
    console.error("Delete costume error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}