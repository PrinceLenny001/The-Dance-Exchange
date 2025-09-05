import { GET as getCostume } from "@/app/api/costumes/[id]/route";
import { NextRequest } from "next/server";

// Mock Prisma
jest.mock("@/lib/db", () => ({
  prisma: {
    costume: {
      findUnique: jest.fn(),
    },
  },
}));

describe("Costume Detail API", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("GET /api/costumes/[id]", () => {
    it("should return costume details with shipping information", async () => {
      const { prisma } = require("@/lib/db");

      const mockCostume = {
        id: "costume-1",
        title: "Ballet Tutu",
        description: "Beautiful pink ballet tutu",
        price: 150.00,
        size: "Adult M",
        condition: "LIKE_NEW",
        status: "available",
        shippingCost: 15.00,
        shippingMethod: "Standard Shipping",
        estimatedDelivery: "3-5 business days",
        createdAt: new Date("2024-01-15"),
        updatedAt: new Date("2024-01-15"),
        images: [
          {
            id: "img-1",
            imageUrl: "https://example.com/image1.jpg",
            isPrimary: true,
          },
        ],
        categories: [
          {
            category: {
              id: "cat-1",
              name: "Ballet",
            },
          },
        ],
        seller: {
          id: "user-1",
          username: "dancer1",
          firstName: "Jane",
          lastName: "Doe",
          profilePictureUrl: "https://example.com/profile.jpg",
        },
      };

      prisma.costume.findUnique.mockResolvedValue(mockCostume);

      const request = new NextRequest("http://localhost:3000/api/costumes/costume-1");

      const response = await getCostume(request, { params: Promise.resolve({ id: "costume-1" }) });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.costume).toEqual(mockCostume);
      expect(data.costume.shippingCost).toBe(15.00);
      expect(data.costume.shippingMethod).toBe("Standard Shipping");
      expect(data.costume.estimatedDelivery).toBe("3-5 business days");

      // Verify Prisma call
      expect(prisma.costume.findUnique).toHaveBeenCalledWith({
        where: { id: "costume-1" },
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
    });

    it("should return costume without shipping information", async () => {
      const { prisma } = require("@/lib/db");

      const mockCostume = {
        id: "costume-2",
        title: "Jazz Costume",
        description: "Black jazz costume",
        price: 75.00,
        size: "Adult S",
        condition: "GOOD",
        status: "available",
        shippingCost: null,
        shippingMethod: null,
        estimatedDelivery: null,
        createdAt: new Date("2024-01-10"),
        updatedAt: new Date("2024-01-10"),
        images: [],
        categories: [
          {
            category: {
              id: "cat-2",
              name: "Jazz",
            },
          },
        ],
        seller: {
          id: "user-2",
          username: "dancer2",
          firstName: "John",
          lastName: "Smith",
          profilePictureUrl: null,
        },
      };

      prisma.costume.findUnique.mockResolvedValue(mockCostume);

      const request = new NextRequest("http://localhost:3000/api/costumes/costume-2");

      const response = await getCostume(request, { params: Promise.resolve({ id: "costume-2" }) });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.costume).toEqual(mockCostume);
      expect(data.costume.shippingCost).toBeNull();
      expect(data.costume.shippingMethod).toBeNull();
      expect(data.costume.estimatedDelivery).toBeNull();
    });

    it("should return 404 for non-existent costume", async () => {
      const { prisma } = require("@/lib/db");

      prisma.costume.findUnique.mockResolvedValue(null);

      const request = new NextRequest("http://localhost:3000/api/costumes/non-existent");

      const response = await getCostume(request, { params: Promise.resolve({ id: "non-existent" }) });
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.error).toBe("Costume not found");
    });

    it("should handle database errors gracefully", async () => {
      const { prisma } = require("@/lib/db");

      prisma.costume.findUnique.mockRejectedValue(new Error("Database error"));

      const request = new NextRequest("http://localhost:3000/api/costumes/costume-1");

      const response = await getCostume(request, { params: Promise.resolve({ id: "costume-1" }) });
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe("Internal server error");
    });

    it("should include all required costume fields", async () => {
      const { prisma } = require("@/lib/db");

      const mockCostume = {
        id: "costume-3",
        title: "Tap Shoes",
        description: "Professional tap shoes",
        price: 120.00,
        size: "Adult 8",
        condition: "NEW",
        status: "available",
        shippingCost: 20.00,
        shippingMethod: "Express Shipping",
        estimatedDelivery: "1-2 business days",
        createdAt: new Date("2024-01-20"),
        updatedAt: new Date("2024-01-20"),
        images: [
          {
            id: "img-3",
            imageUrl: "https://example.com/tap-shoes.jpg",
            isPrimary: true,
          },
        ],
        categories: [
          {
            category: {
              id: "cat-3",
              name: "Tap",
            },
          },
        ],
        seller: {
          id: "user-3",
          username: "tapper1",
          firstName: "Alice",
          lastName: "Johnson",
          profilePictureUrl: "https://example.com/alice.jpg",
        },
      };

      prisma.costume.findUnique.mockResolvedValue(mockCostume);

      const request = new NextRequest("http://localhost:3000/api/costumes/costume-3");

      const response = await getCostume(request, { params: Promise.resolve({ id: "costume-3" }) });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.costume).toHaveProperty("id");
      expect(data.costume).toHaveProperty("title");
      expect(data.costume).toHaveProperty("description");
      expect(data.costume).toHaveProperty("price");
      expect(data.costume).toHaveProperty("size");
      expect(data.costume).toHaveProperty("condition");
      expect(data.costume).toHaveProperty("status");
      expect(data.costume).toHaveProperty("shippingCost");
      expect(data.costume).toHaveProperty("shippingMethod");
      expect(data.costume).toHaveProperty("estimatedDelivery");
      expect(data.costume).toHaveProperty("createdAt");
      expect(data.costume).toHaveProperty("updatedAt");
      expect(data.costume).toHaveProperty("images");
      expect(data.costume).toHaveProperty("categories");
      expect(data.costume).toHaveProperty("seller");
    });
  });
});
