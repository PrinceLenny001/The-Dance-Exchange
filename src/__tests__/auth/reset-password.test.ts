import { POST } from "@/app/api/auth/reset-password/[token]/route";
import { NextRequest } from "next/server";

// Mock Prisma
jest.mock("@/lib/db", () => ({
  prisma: {
    user: {
      findFirst: jest.fn(),
      update: jest.fn(),
    },
  },
}));

// Mock bcrypt
jest.mock("bcryptjs", () => ({
  hash: jest.fn(),
}));

describe("/api/auth/reset-password/[token]", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should reset password successfully with valid token", async () => {
    const { prisma } = require("@/lib/db");
    const bcrypt = require("bcryptjs");

    // Mock user with valid reset token
    prisma.user.findFirst.mockResolvedValue({
      id: "user-123",
      email: "john@example.com",
      passwordResetToken: "hashed-token",
      passwordResetExpires: new Date(Date.now() + 60 * 60 * 1000), // 1 hour from now
    });

    // Mock bcrypt hash
    bcrypt.hash.mockResolvedValue("new-hashed-password");

    // Mock successful update
    prisma.user.update.mockResolvedValue({});

    const requestBody = {
      password: "newpassword123!",
    };

    const request = new NextRequest("http://localhost:3000/api/auth/reset-password/valid-token", {
      method: "POST",
      body: JSON.stringify(requestBody),
      headers: {
        "Content-Type": "application/json",
      },
    });

    const response = await POST(request, { params: { token: "valid-token" } });
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.message).toBe("Password reset successfully");

    // Verify Prisma calls
    expect(prisma.user.findFirst).toHaveBeenCalledWith({
      where: {
        passwordResetToken: expect.any(String), // Hashed token
        passwordResetExpires: {
          gt: expect.any(Date),
        },
      },
    });

    expect(prisma.user.update).toHaveBeenCalledWith({
      where: { id: "user-123" },
      data: {
        passwordHash: "new-hashed-password",
        passwordResetToken: null,
        passwordResetExpires: null,
      },
    });

    // Verify bcrypt was called
    expect(bcrypt.hash).toHaveBeenCalledWith("newpassword123!", 12);
  });

  it("should return error for invalid token", async () => {
    const { prisma } = require("@/lib/db");

    // Mock no user found with token
    prisma.user.findFirst.mockResolvedValue(null);

    const requestBody = {
      password: "newpassword123!",
    };

    const request = new NextRequest("http://localhost:3000/api/auth/reset-password/invalid-token", {
      method: "POST",
      body: JSON.stringify(requestBody),
      headers: {
        "Content-Type": "application/json",
      },
    });

    const response = await POST(request, { params: { token: "invalid-token" } });
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe("Invalid or expired reset token");
  });

  it("should return error for expired token", async () => {
    const { prisma } = require("@/lib/db");

    // Mock user with expired token
    prisma.user.findFirst.mockResolvedValue(null); // No user found due to expired date

    const requestBody = {
      password: "newpassword123!",
    };

    const request = new NextRequest("http://localhost:3000/api/auth/reset-password/expired-token", {
      method: "POST",
      body: JSON.stringify(requestBody),
      headers: {
        "Content-Type": "application/json",
      },
    });

    const response = await POST(request, { params: { token: "expired-token" } });
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe("Invalid or expired reset token");
  });

  it("should return validation error for invalid password", async () => {
    const requestBody = {
      password: "123", // Too short
    };

    const request = new NextRequest("http://localhost:3000/api/auth/reset-password/valid-token", {
      method: "POST",
      body: JSON.stringify(requestBody),
      headers: {
        "Content-Type": "application/json",
      },
    });

    const response = await POST(request, { params: { token: "valid-token" } });
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe("Validation failed");
    expect(data.errors).toHaveProperty("password");
  });

  it("should return validation error for missing password", async () => {
    const requestBody = {};

    const request = new NextRequest("http://localhost:3000/api/auth/reset-password/valid-token", {
      method: "POST",
      body: JSON.stringify(requestBody),
      headers: {
        "Content-Type": "application/json",
      },
    });

    const response = await POST(request, { params: { token: "valid-token" } });
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe("Validation failed");
    expect(data.errors).toHaveProperty("password");
  });
});
