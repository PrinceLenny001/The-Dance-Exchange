import { GET, PUT } from "@/app/api/users/profile/route";
import { NextRequest } from "next/server";

// Mock Prisma
jest.mock("@/lib/db", () => ({
  prisma: {
    user: {
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      update: jest.fn(),
    },
  },
}));

// Mock JWT
jest.mock("@/lib/jwt", () => ({
  verifyToken: jest.fn(),
}));

describe("/api/users/profile", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("GET", () => {
    it("should return user profile successfully", async () => {
      const { prisma } = require("@/lib/db");
      const { verifyToken } = require("@/lib/jwt");

      // Mock token verification
      verifyToken.mockReturnValue({ userId: "user-123" });

      // Mock user data
      prisma.user.findUnique.mockResolvedValue({
        id: "user-123",
        firstName: "John",
        lastName: "Doe",
        username: "johndoe",
        email: "john@example.com",
        profilePictureUrl: "https://example.com/avatar.jpg",
        createdAt: new Date("2024-01-01"),
        updatedAt: new Date("2024-01-01"),
      });

      const request = new NextRequest("http://localhost:3000/api/users/profile", {
        method: "GET",
        headers: {
          "Authorization": "Bearer valid-token",
        },
      });

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.user).toEqual({
        id: "user-123",
        firstName: "John",
        lastName: "Doe",
        username: "johndoe",
        email: "john@example.com",
        profilePictureUrl: "https://example.com/avatar.jpg",
        createdAt: expect.any(Date),
        updatedAt: expect.any(Date),
      });
      expect(data.stats).toEqual({
        totalCostumes: 0,
        totalSales: 0,
        averageRating: 0,
        totalReviews: 0,
      });

      // Verify Prisma call
      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { id: "user-123" },
        select: {
          id: true,
          firstName: true,
          lastName: true,
          username: true,
          email: true,
          profilePictureUrl: true,
          createdAt: true,
          updatedAt: true,
        },
      });
    });

    it("should return 401 for missing token", async () => {
      const request = new NextRequest("http://localhost:3000/api/users/profile", {
        method: "GET",
      });

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toBe("Authorization token required");
    });

    it("should return 401 for invalid token", async () => {
      const { verifyToken } = require("@/lib/jwt");

      // Mock invalid token
      verifyToken.mockReturnValue(null);

      const request = new NextRequest("http://localhost:3000/api/users/profile", {
        method: "GET",
        headers: {
          "Authorization": "Bearer invalid-token",
        },
      });

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toBe("Invalid or expired token");
    });

    it("should return 404 for non-existent user", async () => {
      const { prisma } = require("@/lib/db");
      const { verifyToken } = require("@/lib/jwt");

      // Mock token verification
      verifyToken.mockReturnValue({ userId: "user-123" });

      // Mock no user found
      prisma.user.findUnique.mockResolvedValue(null);

      const request = new NextRequest("http://localhost:3000/api/users/profile", {
        method: "GET",
        headers: {
          "Authorization": "Bearer valid-token",
        },
      });

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.error).toBe("User not found");
    });
  });

  describe("PUT", () => {
    it("should update user profile successfully", async () => {
      const { prisma } = require("@/lib/db");
      const { verifyToken } = require("@/lib/jwt");

      // Mock token verification
      verifyToken.mockReturnValue({ userId: "user-123" });

      // Mock no existing user with same username
      prisma.user.findFirst.mockResolvedValue(null);

      // Mock successful update
      prisma.user.update.mockResolvedValue({
        id: "user-123",
        firstName: "John",
        lastName: "Doe",
        username: "johndoe",
        email: "john@example.com",
        profilePictureUrl: "https://example.com/new-avatar.jpg",
        createdAt: new Date("2024-01-01"),
        updatedAt: new Date("2024-01-02"),
      });

      const requestBody = {
        firstName: "John",
        lastName: "Doe",
        username: "johndoe",
        profilePictureUrl: "https://example.com/new-avatar.jpg",
      };

      const request = new NextRequest("http://localhost:3000/api/users/profile", {
        method: "PUT",
        headers: {
          "Authorization": "Bearer valid-token",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });

      const response = await PUT(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.message).toBe("Profile updated successfully");
      expect(data.user).toEqual({
        id: "user-123",
        firstName: "John",
        lastName: "Doe",
        username: "johndoe",
        email: "john@example.com",
        profilePictureUrl: "https://example.com/new-avatar.jpg",
        createdAt: expect.any(Date),
        updatedAt: expect.any(Date),
      });

      // Verify Prisma calls
      expect(prisma.user.findFirst).toHaveBeenCalledWith({
        where: {
          username: "johndoe",
          id: { not: "user-123" },
        },
      });

      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { id: "user-123" },
        data: {
          firstName: "John",
          lastName: "Doe",
          username: "johndoe",
          profilePictureUrl: "https://example.com/new-avatar.jpg",
        },
        select: {
          id: true,
          firstName: true,
          lastName: true,
          username: true,
          email: true,
          profilePictureUrl: true,
          createdAt: true,
          updatedAt: true,
        },
      });
    });

    it("should return 409 for username already taken", async () => {
      const { prisma } = require("@/lib/db");
      const { verifyToken } = require("@/lib/jwt");

      // Mock token verification
      verifyToken.mockReturnValue({ userId: "user-123" });

      // Mock existing user with same username
      prisma.user.findFirst.mockResolvedValue({
        id: "user-456",
        username: "johndoe",
      });

      const requestBody = {
        firstName: "John",
        lastName: "Doe",
        username: "johndoe",
        profilePictureUrl: null,
      };

      const request = new NextRequest("http://localhost:3000/api/users/profile", {
        method: "PUT",
        headers: {
          "Authorization": "Bearer valid-token",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });

      const response = await PUT(request);
      const data = await response.json();

      expect(response.status).toBe(409);
      expect(data.error).toBe("Username is already taken");
    });

    it("should return 400 for missing required fields", async () => {
      const { verifyToken } = require("@/lib/jwt");

      // Mock token verification
      verifyToken.mockReturnValue({ userId: "user-123" });

      const requestBody = {
        firstName: "John",
        // Missing lastName and username
      };

      const request = new NextRequest("http://localhost:3000/api/users/profile", {
        method: "PUT",
        headers: {
          "Authorization": "Bearer valid-token",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });

      const response = await PUT(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe("First name, last name, and username are required");
    });
  });
});
