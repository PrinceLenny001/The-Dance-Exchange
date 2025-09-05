import { POST } from "@/app/api/costumes/route";
import { NextRequest } from "next/server";

// Mock Prisma
jest.mock("@/lib/db", () => ({
  prisma: {
    costumeCategory: {
      findMany: jest.fn(),
    },
    costume: {
      create: jest.fn(),
      findUnique: jest.fn(),
    },
    costumeImage: {
      create: jest.fn(),
    },
    costumeToCategory: {
      create: jest.fn(),
    },
    $transaction: jest.fn(),
  },
}));

// Mock JWT
jest.mock("@/lib/jwt", () => ({
  verifyToken: jest.fn(),
}));

describe("/api/costumes", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("POST", () => {
    it("should create costume successfully", async () => {
      const { prisma } = require("@/lib/db");
      const { verifyToken } = require("@/lib/jwt");

      // Mock token verification
      verifyToken.mockReturnValue({ userId: "user-123" });

      // Mock categories exist
      prisma.costumeCategory.findMany.mockResolvedValue([
        { id: "cat-1", name: "Ballet" },
        { id: "cat-2", name: "Jazz" },
      ]);

      // Mock transaction
      const mockCostume = {
        id: "costume-123",
        sellerId: "user-123",
        title: "Beautiful Ballet Tutu",
        description: "A stunning ballet tutu in excellent condition",
        price: 150.00,
        size: "Adult M",
        condition: "LIKE_NEW",
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      prisma.$transaction.mockImplementation(async (callback) => {
        return await callback({
          costume: {
            create: jest.fn().mockResolvedValue(mockCostume),
          },
          costumeImage: {
            create: jest.fn().mockResolvedValue({ id: "img-1" }),
          },
          costumeToCategory: {
            create: jest.fn().mockResolvedValue({ id: "cat-link-1" }),
          },
        });
      });

      // Mock final costume fetch
      prisma.costume.findUnique.mockResolvedValue({
        ...mockCostume,
        images: [{ id: "img-1", imageUrl: "https://example.com/image.jpg", isPrimary: true }],
        categories: [{ category: { id: "cat-1", name: "Ballet" } }],
        seller: { id: "user-123", username: "johndoe" },
      });

      const requestBody = {
        title: "Beautiful Ballet Tutu",
        description: "A stunning ballet tutu in excellent condition",
        price: 150.00,
        size: "Adult M",
        condition: "LIKE_NEW",
        categoryIds: ["cat-1", "cat-2"],
        imageUrls: ["https://example.com/image.jpg"],
        primaryImageIndex: 0,
        shippingCost: 8.99,
        shippingMethod: "standard",
        estimatedDelivery: "5-7",
      };

      const request = new NextRequest("http://localhost:3000/api/costumes", {
        method: "POST",
        headers: {
          "Authorization": "Bearer valid-token",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.message).toBe("Costume created successfully");
      expect(data.costume).toBeDefined();

      // Verify Prisma calls
      expect(prisma.costumeCategory.findMany).toHaveBeenCalledWith({
        where: { id: { in: ["cat-1", "cat-2"] } },
      });

      expect(prisma.$transaction).toHaveBeenCalled();
    });

    it("should return 401 for missing token", async () => {
      const request = new NextRequest("http://localhost:3000/api/costumes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({}),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toBe("Authorization token required");
    });

    it("should return 401 for invalid token", async () => {
      const { verifyToken } = require("@/lib/jwt");

      // Mock invalid token
      verifyToken.mockReturnValue(null);

      const request = new NextRequest("http://localhost:3000/api/costumes", {
        method: "POST",
        headers: {
          "Authorization": "Bearer invalid-token",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({}),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toBe("Invalid or expired token");
    });

    it("should return 400 for validation errors", async () => {
      const { verifyToken } = require("@/lib/jwt");

      // Mock token verification
      verifyToken.mockReturnValue({ userId: "user-123" });

      const requestBody = {
        title: "", // Invalid: empty title
        description: "A description",
        price: -10, // Invalid: negative price
        size: "Adult M",
        condition: "INVALID", // Invalid condition
        categoryIds: [], // Invalid: empty categories
        imageUrls: [], // Invalid: empty images
        primaryImageIndex: 0,
        shippingCost: 8.99,
        shippingMethod: "standard",
      };

      const request = new NextRequest("http://localhost:3000/api/costumes", {
        method: "POST",
        headers: {
          "Authorization": "Bearer valid-token",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe("Validation failed");
      expect(data.errors).toHaveProperty("title");
      expect(data.errors).toHaveProperty("price");
      expect(data.errors).toHaveProperty("condition");
      expect(data.errors).toHaveProperty("categoryIds");
      expect(data.errors).toHaveProperty("imageUrls");
    });

    it("should return 400 for non-existent categories", async () => {
      const { prisma } = require("@/lib/db");
      const { verifyToken } = require("@/lib/jwt");

      // Mock token verification
      verifyToken.mockReturnValue({ userId: "user-123" });

      // Mock categories not found
      prisma.costumeCategory.findMany.mockResolvedValue([
        { id: "cat-1", name: "Ballet" },
        // Missing cat-2
      ]);

      const requestBody = {
        title: "Beautiful Ballet Tutu",
        description: "A stunning ballet tutu in excellent condition",
        price: 150.00,
        size: "Adult M",
        condition: "LIKE_NEW",
        categoryIds: ["cat-1", "cat-2"], // cat-2 doesn't exist
        imageUrls: ["https://example.com/image.jpg"],
        primaryImageIndex: 0,
        shippingCost: 8.99,
        shippingMethod: "standard",
      };

      const request = new NextRequest("http://localhost:3000/api/costumes", {
        method: "POST",
        headers: {
          "Authorization": "Bearer valid-token",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe("One or more categories not found");
    });
  });
});
