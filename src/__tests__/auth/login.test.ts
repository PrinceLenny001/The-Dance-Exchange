import { POST } from "@/app/api/auth/login/route";
import { NextRequest } from "next/server";

// Mock Prisma
jest.mock("@/lib/db", () => ({
  prisma: {
    user: {
      findFirst: jest.fn(),
    },
  },
}));

// Mock JWT
jest.mock("@/lib/jwt", () => ({
  generateToken: jest.fn(() => "mock-jwt-token"),
}));

describe("/api/auth/login", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should login user successfully with email", async () => {
    const { prisma } = require("@/lib/db");
    const { generateToken } = require("@/lib/jwt");

    // Mock user found by email
    prisma.user.findFirst.mockResolvedValue({
      id: "user-123",
      firstName: "John",
      lastName: "Doe",
      username: "johndoe",
      email: "john@example.com",
      passwordHash: "$2a$12$hashedpassword",
      profilePictureUrl: null,
    });

    // Mock bcrypt compare
    const bcrypt = require("bcryptjs");
    jest.spyOn(bcrypt, "compare").mockResolvedValue(true);

    const requestBody = {
      emailOrUsername: "john@example.com",
      password: "password123!",
    };

    const request = new NextRequest("http://localhost:3000/api/auth/login", {
      method: "POST",
      body: JSON.stringify(requestBody),
      headers: {
        "Content-Type": "application/json",
      },
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.message).toBe("Login successful");
    expect(data.token).toBe("mock-jwt-token");
    expect(data.user).toEqual({
      id: "user-123",
      firstName: "John",
      lastName: "Doe",
      username: "johndoe",
      email: "john@example.com",
      profilePictureUrl: null,
    });

    // Verify Prisma call
    expect(prisma.user.findFirst).toHaveBeenCalledWith({
      where: {
        OR: [
          { email: "john@example.com" },
          { username: "john@example.com" },
        ],
      },
    });

    // Verify JWT generation
    expect(generateToken).toHaveBeenCalledWith({
      userId: "user-123",
      email: "john@example.com",
      username: "johndoe",
    });
  });

  it("should login user successfully with username", async () => {
    const { prisma } = require("@/lib/db");
    const { generateToken } = require("@/lib/jwt");

    // Mock user found by username
    prisma.user.findFirst.mockResolvedValue({
      id: "user-123",
      firstName: "John",
      lastName: "Doe",
      username: "johndoe",
      email: "john@example.com",
      passwordHash: "$2a$12$hashedpassword",
      profilePictureUrl: null,
    });

    // Mock bcrypt compare
    const bcrypt = require("bcryptjs");
    jest.spyOn(bcrypt, "compare").mockResolvedValue(true);

    const requestBody = {
      emailOrUsername: "johndoe",
      password: "password123!",
    };

    const request = new NextRequest("http://localhost:3000/api/auth/login", {
      method: "POST",
      body: JSON.stringify(requestBody),
      headers: {
        "Content-Type": "application/json",
      },
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.message).toBe("Login successful");
    expect(data.token).toBe("mock-jwt-token");
  });

  it("should return error if user not found", async () => {
    const { prisma } = require("@/lib/db");

    // Mock no user found
    prisma.user.findFirst.mockResolvedValue(null);

    const requestBody = {
      emailOrUsername: "nonexistent@example.com",
      password: "password123!",
    };

    const request = new NextRequest("http://localhost:3000/api/auth/login", {
      method: "POST",
      body: JSON.stringify(requestBody),
      headers: {
        "Content-Type": "application/json",
      },
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data.error).toBe("Invalid credentials");
  });

  it("should return error if user has no password (OAuth only)", async () => {
    const { prisma } = require("@/lib/db");

    // Mock user without password
    prisma.user.findFirst.mockResolvedValue({
      id: "user-123",
      email: "john@example.com",
      passwordHash: null,
    });

    const requestBody = {
      emailOrUsername: "john@example.com",
      password: "password123!",
    };

    const request = new NextRequest("http://localhost:3000/api/auth/login", {
      method: "POST",
      body: JSON.stringify(requestBody),
      headers: {
        "Content-Type": "application/json",
      },
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data.error).toBe("Please use the email sign-in method for this account");
  });

  it("should return error for invalid password", async () => {
    const { prisma } = require("@/lib/db");

    // Mock user found
    prisma.user.findFirst.mockResolvedValue({
      id: "user-123",
      email: "john@example.com",
      passwordHash: "$2a$12$hashedpassword",
    });

    // Mock bcrypt compare returning false
    const bcrypt = require("bcryptjs");
    jest.spyOn(bcrypt, "compare").mockResolvedValue(false);

    const requestBody = {
      emailOrUsername: "john@example.com",
      password: "wrongpassword",
    };

    const request = new NextRequest("http://localhost:3000/api/auth/login", {
      method: "POST",
      body: JSON.stringify(requestBody),
      headers: {
        "Content-Type": "application/json",
      },
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data.error).toBe("Invalid credentials");
  });

  it("should return validation error for invalid input", async () => {
    const requestBody = {
      emailOrUsername: "",
      password: "",
    };

    const request = new NextRequest("http://localhost:3000/api/auth/login", {
      method: "POST",
      body: JSON.stringify(requestBody),
      headers: {
        "Content-Type": "application/json",
      },
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe("Validation failed");
    expect(data.errors).toHaveProperty("emailOrUsername");
    expect(data.errors).toHaveProperty("password");
  });
});
