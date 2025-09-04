import { POST } from "@/app/api/auth/register/route";
import { NextRequest } from "next/server";

// Mock Prisma
jest.mock("@/lib/db", () => ({
  prisma: {
    user: {
      findFirst: jest.fn(),
      create: jest.fn(),
    },
  },
}));

// Mock email service
jest.mock("@/lib/email/sendEmail", () => ({
  sendWelcomeEmail: jest.fn(),
}));

// Mock JWT
jest.mock("@/lib/jwt", () => ({
  generateToken: jest.fn(() => "mock-jwt-token"),
}));

describe("/api/auth/register", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should register a new user successfully", async () => {
    const { prisma } = require("@/lib/db");
    const { sendWelcomeEmail } = require("@/lib/email/sendEmail");
    const { generateToken } = require("@/lib/jwt");

    // Mock no existing user
    prisma.user.findFirst.mockResolvedValue(null);

    // Mock successful user creation
    prisma.user.create.mockResolvedValue({
      id: "user-123",
      firstName: "John",
      lastName: "Doe",
      username: "johndoe",
      email: "john@example.com",
      createdAt: new Date(),
    });

    const requestBody = {
      firstName: "John",
      lastName: "Doe",
      username: "johndoe",
      email: "john@example.com",
      password: "password123!",
      confirmPassword: "password123!",
    };

    const request = new NextRequest("http://localhost:3000/api/auth/register", {
      method: "POST",
      body: JSON.stringify(requestBody),
      headers: {
        "Content-Type": "application/json",
      },
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(201);
    expect(data.message).toBe("Account created successfully");
    expect(data.token).toBe("mock-jwt-token");
    expect(data.user).toEqual({
      id: "user-123",
      firstName: "John",
      lastName: "Doe",
      username: "johndoe",
      email: "john@example.com",
    });

    // Verify Prisma calls
    expect(prisma.user.findFirst).toHaveBeenCalledWith({
      where: {
        OR: [
          { email: "john@example.com" },
          { username: "johndoe" },
        ],
      },
    });

    expect(prisma.user.create).toHaveBeenCalledWith({
      data: {
        firstName: "John",
        lastName: "Doe",
        username: "johndoe",
        email: "john@example.com",
        passwordHash: expect.any(String),
        profilePictureUrl: null,
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        username: true,
        email: true,
        createdAt: true,
      },
    });

    // Verify email was sent
    expect(sendWelcomeEmail).toHaveBeenCalledWith("john@example.com", "John");
  });

  it("should return error if user already exists", async () => {
    const { prisma } = require("@/lib/db");

    // Mock existing user
    prisma.user.findFirst.mockResolvedValue({
      id: "existing-user",
      email: "john@example.com",
      username: "johndoe",
    });

    const requestBody = {
      firstName: "John",
      lastName: "Doe",
      username: "johndoe",
      email: "john@example.com",
      password: "password123!",
      confirmPassword: "password123!",
    };

    const request = new NextRequest("http://localhost:3000/api/auth/register", {
      method: "POST",
      body: JSON.stringify(requestBody),
      headers: {
        "Content-Type": "application/json",
      },
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(409);
    expect(data.error).toBe("User already exists");
    expect(data.errors).toEqual({
      email: "An account with this email already exists",
      username: "This username is already taken",
    });
  });

  it("should return validation error for invalid input", async () => {
    const requestBody = {
      firstName: "",
      lastName: "Doe",
      username: "johndoe",
      email: "invalid-email",
      password: "123",
      confirmPassword: "456",
    };

    const request = new NextRequest("http://localhost:3000/api/auth/register", {
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
    expect(data.errors).toHaveProperty("firstName");
    expect(data.errors).toHaveProperty("email");
    expect(data.errors).toHaveProperty("password");
    expect(data.errors).toHaveProperty("confirmPassword");
  });
});
