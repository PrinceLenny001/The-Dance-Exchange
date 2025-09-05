import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Extract query parameters
    const query = searchParams.get("q") || "";
    const categories = searchParams.get("categories")?.split(",").filter(Boolean) || [];
    const sizes = searchParams.get("sizes")?.split(",").filter(Boolean) || [];
    const conditions = searchParams.get("conditions")?.split(",").filter(Boolean) || [];
    const minPrice = searchParams.get("minPrice");
    const maxPrice = searchParams.get("maxPrice");
    const sortBy = searchParams.get("sortBy") || "createdAt";
    const sortOrder = searchParams.get("sortOrder") || "desc";
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "24");

    // Build where clause
    const where: any = {
      status: "available", // Only show available costumes
    };

    // Text search
    if (query) {
      where.OR = [
        { title: { contains: query, mode: "insensitive" } },
        { description: { contains: query, mode: "insensitive" } },
      ];
    }

    // Category filter
    if (categories.length > 0) {
      where.categories = {
        some: {
          categoryId: { in: categories },
        },
      };
    }

    // Size filter
    if (sizes.length > 0) {
      where.size = { in: sizes };
    }

    // Condition filter
    if (conditions.length > 0) {
      where.condition = { in: conditions };
    }

    // Price range filter
    if (minPrice || maxPrice) {
      where.price = {};
      if (minPrice) {
        where.price.gte = parseFloat(minPrice);
      }
      if (maxPrice) {
        where.price.lte = parseFloat(maxPrice);
      }
    }

    // Build orderBy clause
    let orderBy: any = {};
    if (sortBy === "price") {
      orderBy.price = sortOrder;
    } else if (sortBy === "createdAt") {
      orderBy.createdAt = sortOrder;
    } else {
      orderBy.createdAt = "desc"; // Default sort
    }

    // Calculate pagination
    const skip = (page - 1) * limit;

    // Get total count for pagination
    const totalResults = await prisma.costume.count({ where });

    // Get costumes with pagination
    const costumes = await prisma.costume.findMany({
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
    });

    // Calculate total pages
    const totalPages = Math.ceil(totalResults / limit);

    return NextResponse.json({
      costumes,
      totalResults,
      totalPages,
      currentPage: page,
      limit,
    });

  } catch (error) {
    console.error("Search costumes error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
