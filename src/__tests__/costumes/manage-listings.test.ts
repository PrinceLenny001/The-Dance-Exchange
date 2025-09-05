import { GET as getUserCostumes } from "@/app/api/users/me/costumes/route";
import { PUT, DELETE } from "@/app/api/costumes/[id]/route";
import { NextRequest } from "next/server";

// Mock Prisma
jest.mock("@/lib/db", () => ({
  prisma: {
    costume: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    costumeCategory: {
      findMany: jest.fn(),
    },
    costumeImage: {
      deleteMany: jest.fn(),
      create: jest.fn(),
    },
    costumeToCategory: {
      deleteMany: jest.fn(),
      create: jest.fn(),
    },
    $transaction: jest.fn(),
  },
}));

// Mock JWT
jest.mock("@/lib/jwt", () => ({
  verifyToken: jest.fn(),
}));

describe("Listing Management", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("GET /api/users/me/costumes", () => {
    it("should return user's costumes successfully", async () => {
      const { prisma } = require("@/lib/db");
      const { verifyToken } = require("@/lib/jwt");

      // Mock token verification
      verifyToken.mockReturnValue({ userId: "user-123" });

      // Mock costumes data
      const mockCostumes = [
        {
          id: "costume-1",
          title: "Ballet Tutu",
          price: 150.00,
          status: "available",
          images: [{ id: "img-1", imageUrl: "https://example.com/image.jpg", isPrimary: true }],
          categories: [{ category: { id: "cat-1", name: "Ballet" } }],
        },
        {
          id: "costume-2",
          title: "Jazz Costume",
          price: 100.00,
          status: "sold",
          images: [{ id: "img-2", imageUrl: "https://example.com/image2.jpg", isPrimary: true }],
          categories: [{ category: { id: "cat-2", name: "Jazz" } }],
        },
      ];

      prisma.costume.findMany.mockResolvedValue(mockCostumes);

      const request = new NextRequest("http://localhost:3000/api/users/me/costumes", {
        method: "GET",
        headers: {
          "Authorization": "Bearer valid-token",
        },
      });

      const response = await getUserCostumes(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.costumes).toEqual(mockCostumes);

      // Verify Prisma call
      expect(prisma.costume.findMany).toHaveBeenCalledWith({
        where: { sellerId: "user-123" },
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
        },
        orderBy: { createdAt: "desc" },
      });
    });

    it("should return 401 for missing token", async () => {
      const request = new NextRequest("http://localhost:3000/api/users/me/costumes", {
        method: "GET",
      });

      const response = await getUserCostumes(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toBe("Authorization token required");
    });
  });

  describe("PUT /api/costumes/[id]", () => {
    it("should update costume successfully", async () => {
      const { prisma } = require("@/lib/db");
      const { verifyToken } = require("@/lib/jwt");

      // Mock token verification
      verifyToken.mockReturnValue({ userId: "user-123" });

      // Mock existing costume
      prisma.costume.findUnique.mockResolvedValue({
        sellerId: "user-123",
        status: "available",
      });

      // Mock categories exist
      prisma.costumeCategory.findMany.mockResolvedValue([
        { id: "cat-1", name: "Ballet" },
      ]);

      // Mock transaction
      const mockUpdatedCostume = {
        id: "costume-123",
        title: "Updated Ballet Tutu",
        price: 175.00,
        status: "available",
      };

      prisma.$transaction.mockImplementation(async (callback) => {
        return await callback({
          costume: {
            update: jest.fn().mockResolvedValue(mockUpdatedCostume),
          },
          costumeCategory: {
            findMany: jest.fn().mockResolvedValue([{ id: "cat-1", name: "Ballet" }]),
          },
          costumeToCategory: {
            deleteMany: jest.fn().mockResolvedValue({}),
            create: jest.fn().mockResolvedValue({}),
          },
          costumeImage: {
            deleteMany: jest.fn().mockResolvedValue({}),
            create: jest.fn().mockResolvedValue({}),
          },
        });
      });

      // Mock final costume fetch
      prisma.costume.findUnique.mockResolvedValue({
        ...mockUpdatedCostume,
        images: [{ id: "img-1", imageUrl: "https://example.com/image.jpg", isPrimary: true }],
        categories: [{ category: { id: "cat-1", name: "Ballet" } }],
        seller: { id: "user-123", username: "johndoe" },
      });

      const requestBody = {
        title: "Updated Ballet Tutu",
        price: 175.00,
        categoryIds: ["cat-1"],
      };

      const request = new NextRequest("http://localhost:3000/api/costumes/costume-123", {
        method: "PUT",
        headers: {
          "Authorization": "Bearer valid-token",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });

      const response = await PUT(request, { params: Promise.resolve({ id: "costume-123" }) });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.message).toBe("Costume updated successfully");
      expect(data.costume).toBeDefined();
    });

    it("should return 403 for unauthorized user", async () => {
      const { prisma } = require("@/lib/db");
      const { verifyToken } = require("@/lib/jwt");

      // Mock token verification
      verifyToken.mockReturnValue({ userId: "user-123" });

      // Mock costume belongs to different user
      prisma.costume.findUnique.mockResolvedValue({
        sellerId: "user-456",
        status: "available",
      });

      const request = new NextRequest("http://localhost:3000/api/costumes/costume-123", {
        method: "PUT",
        headers: {
          "Authorization": "Bearer valid-token",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ title: "Updated Title" }),
      });

      const response = await PUT(request, { params: Promise.resolve({ id: "costume-123" }) });
      const data = await response.json();

      expect(response.status).toBe(403);
      expect(data.error).toBe("Unauthorized");
    });

    it("should return 400 for sold costume", async () => {
      const { prisma } = require("@/lib/db");
      const { verifyToken } = require("@/lib/jwt");

      // Mock token verification
      verifyToken.mockReturnValue({ userId: "user-123" });

      // Mock sold costume
      prisma.costume.findUnique.mockResolvedValue({
        sellerId: "user-123",
        status: "sold",
      });

      const request = new NextRequest("http://localhost:3000/api/costumes/costume-123", {
        method: "PUT",
        headers: {
          "Authorization": "Bearer valid-token",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ title: "Updated Title" }),
      });

      const response = await PUT(request, { params: Promise.resolve({ id: "costume-123" }) });
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe("Cannot edit sold costumes");
    });
  });

  describe("DELETE /api/costumes/[id]", () => {
    it("should delete costume successfully", async () => {
      const { prisma } = require("@/lib/db");
      const { verifyToken } = require("@/lib/jwt");

      // Mock token verification
      verifyToken.mockReturnValue({ userId: "user-123" });

      // Mock existing costume
      prisma.costume.findUnique.mockResolvedValue({
        sellerId: "user-123",
        status: "available",
      });

      // Mock successful deletion
      prisma.costume.delete.mockResolvedValue({});

      const request = new NextRequest("http://localhost:3000/api/costumes/costume-123", {
        method: "DELETE",
        headers: {
          "Authorization": "Bearer valid-token",
        },
      });

      const response = await DELETE(request, { params: Promise.resolve({ id: "costume-123" }) });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.message).toBe("Costume deleted successfully");

      // Verify Prisma call
      expect(prisma.costume.delete).toHaveBeenCalledWith({
        where: { id: "costume-123" },
      });
    });

    it("should return 400 for sold costume", async () => {
      const { prisma } = require("@/lib/db");
      const { verifyToken } = require("@/lib/jwt");

      // Mock token verification
      verifyToken.mockReturnValue({ userId: "user-123" });

      // Mock sold costume
      prisma.costume.findUnique.mockResolvedValue({
        sellerId: "user-123",
        status: "sold",
      });

      const request = new NextRequest("http://localhost:3000/api/costumes/costume-123", {
        method: "DELETE",
        headers: {
          "Authorization": "Bearer valid-token",
        },
      });

      const response = await DELETE(request, { params: Promise.resolve({ id: "costume-123" }) });
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe("Cannot delete sold costumes");
    });

    it("should return 404 for non-existent costume", async () => {
      const { prisma } = require("@/lib/db");
      const { verifyToken } = require("@/lib/jwt");

      // Mock token verification
      verifyToken.mockReturnValue({ userId: "user-123" });

      // Mock costume not found
      prisma.costume.findUnique.mockResolvedValue(null);

      const request = new NextRequest("http://localhost:3000/api/costumes/costume-123", {
        method: "DELETE",
        headers: {
          "Authorization": "Bearer valid-token",
        },
      });

      const response = await DELETE(request, { params: Promise.resolve({ id: "costume-123" }) });
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.error).toBe("Costume not found");
    });
  });
});
