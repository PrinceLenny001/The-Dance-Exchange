import { GET } from "@/app/api/users/[username]/route";
import { NextRequest } from "next/server";

// Mock Prisma
jest.mock("@/lib/db", () => ({
  prisma: {
    user: {
      findUnique: jest.fn(),
    },
  },
}));

describe("/api/users/[username]", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should return public user profile successfully", async () => {
    const { prisma } = require("@/lib/db");

    // Mock user data
    prisma.user.findUnique.mockResolvedValue({
      id: "user-123",
      firstName: "John",
      lastName: "Doe",
      username: "johndoe",
      profilePictureUrl: "https://example.com/avatar.jpg",
      createdAt: new Date("2024-01-01"),
    });

    const request = new NextRequest("http://localhost:3000/api/users/johndoe", {
      method: "GET",
    });

    const response = await GET(request, { params: Promise.resolve({ username: "johndoe" }) });
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.user).toEqual({
      id: "user-123",
      firstName: "John",
      lastName: "Doe",
      username: "johndoe",
      profilePictureUrl: "https://example.com/avatar.jpg",
      createdAt: expect.any(Date),
      averageRating: 0,
      totalReviews: 0,
    });
    expect(data.costumes).toEqual([]);

    // Verify Prisma call
    expect(prisma.user.findUnique).toHaveBeenCalledWith({
      where: { username: "johndoe" },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        username: true,
        profilePictureUrl: true,
        createdAt: true,
      },
    });
  });

  it("should return 404 for non-existent user", async () => {
    const { prisma } = require("@/lib/db");

    // Mock no user found
    prisma.user.findUnique.mockResolvedValue(null);

    const request = new NextRequest("http://localhost:3000/api/users/nonexistent", {
      method: "GET",
    });

    const response = await GET(request, { params: Promise.resolve({ username: "nonexistent" }) });
    const data = await response.json();

    expect(response.status).toBe(404);
    expect(data.error).toBe("User not found");
  });

  it("should handle user with no profile picture", async () => {
    const { prisma } = require("@/lib/db");

    // Mock user data without profile picture
    prisma.user.findUnique.mockResolvedValue({
      id: "user-123",
      firstName: "Jane",
      lastName: "Smith",
      username: "janesmith",
      profilePictureUrl: null,
      createdAt: new Date("2024-01-01"),
    });

    const request = new NextRequest("http://localhost:3000/api/users/janesmith", {
      method: "GET",
    });

    const response = await GET(request, { params: Promise.resolve({ username: "janesmith" }) });
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.user).toEqual({
      id: "user-123",
      firstName: "Jane",
      lastName: "Smith",
      username: "janesmith",
      profilePictureUrl: null,
      createdAt: expect.any(Date),
      averageRating: 0,
      totalReviews: 0,
    });
  });
});
