import { GET as searchCostumes } from "@/app/api/costumes/search/route";
import { NextRequest } from "next/server";

// Mock Prisma
jest.mock("@/lib/db", () => ({
  prisma: {
    costume: {
      count: jest.fn(),
      findMany: jest.fn(),
    },
  },
}));

describe("Costume Search API", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("GET /api/costumes/search", () => {
    it("should return costumes with basic search", async () => {
      const { prisma } = require("@/lib/db");

      // Mock search results
      const mockCostumes = [
        {
          id: "costume-1",
          title: "Ballet Tutu",
          price: 150.00,
          size: "Adult M",
          condition: "LIKE_NEW",
          status: "available",
          images: [{ id: "img-1", imageUrl: "https://example.com/image.jpg", isPrimary: true }],
          categories: [{ category: { id: "cat-1", name: "Ballet" } }],
          seller: { id: "user-1", username: "dancer1" },
        },
      ];

      prisma.costume.count.mockResolvedValue(1);
      prisma.costume.findMany.mockResolvedValue(mockCostumes);

      const request = new NextRequest("http://localhost:3000/api/costumes/search?q=ballet");

      const response = await searchCostumes(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.costumes).toEqual(mockCostumes);
      expect(data.totalResults).toBe(1);
      expect(data.totalPages).toBe(1);

      // Verify Prisma calls
      expect(prisma.costume.count).toHaveBeenCalledWith({
        where: {
          status: "available",
          OR: [
            { title: { contains: "ballet", mode: "insensitive" } },
            { description: { contains: "ballet", mode: "insensitive" } },
          ],
        },
      });

      expect(prisma.costume.findMany).toHaveBeenCalledWith({
        where: {
          status: "available",
          OR: [
            { title: { contains: "ballet", mode: "insensitive" } },
            { description: { contains: "ballet", mode: "insensitive" } },
          ],
        },
        orderBy: { createdAt: "desc" },
        skip: 0,
        take: 24,
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
    });

    it("should filter by categories", async () => {
      const { prisma } = require("@/lib/db");

      prisma.costume.count.mockResolvedValue(0);
      prisma.costume.findMany.mockResolvedValue([]);

      const request = new NextRequest("http://localhost:3000/api/costumes/search?categories=cat-1,cat-2");

      const response = await searchCostumes(request);
      const data = await response.json();

      expect(response.status).toBe(200);

      // Verify category filter
      expect(prisma.costume.count).toHaveBeenCalledWith({
        where: {
          status: "available",
          categories: {
            some: {
              categoryId: { in: ["cat-1", "cat-2"] },
            },
          },
        },
      });
    });

    it("should filter by sizes", async () => {
      const { prisma } = require("@/lib/db");

      prisma.costume.count.mockResolvedValue(0);
      prisma.costume.findMany.mockResolvedValue([]);

      const request = new NextRequest("http://localhost:3000/api/costumes/search?sizes=Adult M,Adult L");

      const response = await searchCostumes(request);
      const data = await response.json();

      expect(response.status).toBe(200);

      // Verify size filter
      expect(prisma.costume.count).toHaveBeenCalledWith({
        where: {
          status: "available",
          size: { in: ["Adult M", "Adult L"] },
        },
      });
    });

    it("should filter by conditions", async () => {
      const { prisma } = require("@/lib/db");

      prisma.costume.count.mockResolvedValue(0);
      prisma.costume.findMany.mockResolvedValue([]);

      const request = new NextRequest("http://localhost:3000/api/costumes/search?conditions=NEW,LIKE_NEW");

      const response = await searchCostumes(request);
      const data = await response.json();

      expect(response.status).toBe(200);

      // Verify condition filter
      expect(prisma.costume.count).toHaveBeenCalledWith({
        where: {
          status: "available",
          condition: { in: ["NEW", "LIKE_NEW"] },
        },
      });
    });

    it("should filter by price range", async () => {
      const { prisma } = require("@/lib/db");

      prisma.costume.count.mockResolvedValue(0);
      prisma.costume.findMany.mockResolvedValue([]);

      const request = new NextRequest("http://localhost:3000/api/costumes/search?minPrice=50&maxPrice=200");

      const response = await searchCostumes(request);
      const data = await response.json();

      expect(response.status).toBe(200);

      // Verify price range filter
      expect(prisma.costume.count).toHaveBeenCalledWith({
        where: {
          status: "available",
          price: {
            gte: 50,
            lte: 200,
          },
        },
      });
    });

    it("should sort by price ascending", async () => {
      const { prisma } = require("@/lib/db");

      prisma.costume.count.mockResolvedValue(0);
      prisma.costume.findMany.mockResolvedValue([]);

      const request = new NextRequest("http://localhost:3000/api/costumes/search?sortBy=price&sortOrder=asc");

      const response = await searchCostumes(request);
      const data = await response.json();

      expect(response.status).toBe(200);

      // Verify sorting
      expect(prisma.costume.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          orderBy: { price: "asc" },
        })
      );
    });

    it("should handle pagination", async () => {
      const { prisma } = require("@/lib/db");

      prisma.costume.count.mockResolvedValue(50);
      prisma.costume.findMany.mockResolvedValue([]);

      const request = new NextRequest("http://localhost:3000/api/costumes/search?page=2&limit=10");

      const response = await searchCostumes(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.totalResults).toBe(50);
      expect(data.totalPages).toBe(5);
      expect(data.currentPage).toBe(2);
      expect(data.limit).toBe(10);

      // Verify pagination
      expect(prisma.costume.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          skip: 10, // (page - 1) * limit = (2 - 1) * 10 = 10
          take: 10,
        })
      );
    });

    it("should return empty results when no costumes match", async () => {
      const { prisma } = require("@/lib/db");

      prisma.costume.count.mockResolvedValue(0);
      prisma.costume.findMany.mockResolvedValue([]);

      const request = new NextRequest("http://localhost:3000/api/costumes/search?q=nonexistent");

      const response = await searchCostumes(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.costumes).toEqual([]);
      expect(data.totalResults).toBe(0);
      expect(data.totalPages).toBe(0);
    });

    it("should handle complex filters", async () => {
      const { prisma } = require("@/lib/db");

      prisma.costume.count.mockResolvedValue(0);
      prisma.costume.findMany.mockResolvedValue([]);

      const request = new NextRequest("http://localhost:3000/api/costumes/search?q=ballet&categories=cat-1&sizes=Adult M&conditions=NEW&minPrice=100&maxPrice=300&sortBy=price&sortOrder=asc&page=1&limit=12");

      const response = await searchCostumes(request);
      const data = await response.json();

      expect(response.status).toBe(200);

      // Verify complex filter combination
      expect(prisma.costume.count).toHaveBeenCalledWith({
        where: {
          status: "available",
          OR: [
            { title: { contains: "ballet", mode: "insensitive" } },
            { description: { contains: "ballet", mode: "insensitive" } },
          ],
          categories: {
            some: {
              categoryId: { in: ["cat-1"] },
            },
          },
          size: { in: ["Adult M"] },
          condition: { in: ["NEW"] },
          price: {
            gte: 100,
            lte: 300,
          },
        },
      });

      expect(prisma.costume.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          orderBy: { price: "asc" },
          skip: 0,
          take: 12,
        })
      );
    });

    it("should handle database errors gracefully", async () => {
      const { prisma } = require("@/lib/db");

      prisma.costume.count.mockRejectedValue(new Error("Database error"));

      const request = new NextRequest("http://localhost:3000/api/costumes/search");

      const response = await searchCostumes(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe("Internal server error");
    });
  });
});
