import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { verifyToken } from "@/lib/jwt";
import { z } from "zod";

const createCostumeSchema = z.object({
  title: z.string().min(1, "Title is required").max(100, "Title must be less than 100 characters"),
  description: z.string().min(1, "Description is required").max(1000, "Description must be less than 1000 characters"),
  price: z.number().positive("Price must be positive"),
  size: z.string().min(1, "Size is required"),
  condition: z.enum(["NEW", "LIKE_NEW", "GOOD", "FAIR"], {
    errorMap: () => ({ message: "Invalid condition" })
  }),
  categoryIds: z.array(z.string()).min(1, "At least one category is required"),
  imageUrls: z.array(z.string()).min(1, "At least one image is required"),
  primaryImageIndex: z.number().min(0).max(9),
  shippingCost: z.number().min(0, "Shipping cost cannot be negative"),
  shippingMethod: z.string().min(1, "Shipping method is required"),
  estimatedDelivery: z.string().optional(),
});

export async function POST(request: NextRequest) {
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

    const body = await request.json();
    
    // Validate input
    const validationResult = createCostumeSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { 
          error: "Validation failed", 
          errors: validationResult.error.flatten().fieldErrors 
        },
        { status: 400 }
      );
    }

    const {
      title,
      description,
      price,
      size,
      condition,
      categoryIds,
      imageUrls,
      primaryImageIndex,
      shippingCost,
      shippingMethod,
      estimatedDelivery,
    } = validationResult.data;

    // Verify categories exist
    const categories = await prisma.costumeCategory.findMany({
      where: { id: { in: categoryIds } },
    });

    if (categories.length !== categoryIds.length) {
      return NextResponse.json(
        { error: "One or more categories not found" },
        { status: 400 }
      );
    }

    // Create costume with images and categories in a transaction
    const costume = await prisma.$transaction(async (tx) => {
      // Create the costume
      const newCostume = await tx.costume.create({
        data: {
          sellerId: payload.userId,
          title,
          description,
          price,
          size,
          condition,
        },
      });

      // Create costume images
      const costumeImages = await Promise.all(
        imageUrls.map((imageUrl, index) =>
          tx.costumeImage.create({
            data: {
              costumeId: newCostume.id,
              imageUrl,
              isPrimary: index === primaryImageIndex,
            },
          })
        )
      );

      // Create category associations
      await Promise.all(
        categoryIds.map((categoryId) =>
          tx.costumeToCategory.create({
            data: {
              costumeId: newCostume.id,
              categoryId,
            },
          })
        )
      );

      return newCostume;
    });

    // Return the created costume with images
    const costumeWithImages = await prisma.costume.findUnique({
      where: { id: costume.id },
      include: {
        images: true,
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
      message: "Costume created successfully",
      costume: costumeWithImages,
    }, { status: 201 });

  } catch (error) {
    console.error("Create costume error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const search = searchParams.get("search") || "";
    const category = searchParams.get("category") || "";
    const minPrice = searchParams.get("minPrice");
    const maxPrice = searchParams.get("maxPrice");
    const size = searchParams.get("size") || "";
    const condition = searchParams.get("condition") || "";
    const sortBy = searchParams.get("sortBy") || "createdAt";
    const sortOrder = searchParams.get("sortOrder") || "desc";

    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = {
      status: "available",
    };

    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
      ];
    }

    if (category) {
      where.categories = {
        some: {
          category: {
            name: { contains: category, mode: "insensitive" },
          },
        },
      };
    }

    if (minPrice || maxPrice) {
      where.price = {};
      if (minPrice) where.price.gte = parseFloat(minPrice);
      if (maxPrice) where.price.lte = parseFloat(maxPrice);
    }

    if (size) {
      where.size = { contains: size, mode: "insensitive" };
    }

    if (condition) {
      where.condition = condition.toUpperCase();
    }

    // Build orderBy clause
    const orderBy: any = {};
    if (sortBy === "price") {
      orderBy.price = sortOrder;
    } else if (sortBy === "title") {
      orderBy.title = sortOrder;
    } else {
      orderBy.createdAt = sortOrder;
    }

    const [costumes, total] = await Promise.all([
      prisma.costume.findMany({
        where,
        orderBy,
        skip,
        take: limit,
        include: {
          images: {
            where: { isPrimary: true },
            take: 1,
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
      }),
      prisma.costume.count({ where }),
    ]);

    return NextResponse.json({
      costumes,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });

  } catch (error) {
    console.error("Get costumes error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
