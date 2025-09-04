import { POST } from "@/app/api/auth/forgot-password/route";
import { NextRequest } from "next/server";

// Mock Prisma
jest.mock("@/lib/db", () => ({
  prisma: {
    user: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
  },
}));

// Mock email service
jest.mock("@/lib/email/sendEmail", () => ({
  sendPasswordResetEmail: jest.fn(),
}));

describe("/api/auth/forgot-password", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should send reset email for existing user", async () => {
    const { prisma } = require("@/lib/db");
    const { sendPasswordResetEmail } = require("@/lib/email/sendEmail");

    // Mock existing user
    prisma.user.findUnique.mockResolvedValue({
      id: "user-123",
      email: "john@example.com",
      firstName: "John",
      username: "johndoe",
    });

    // Mock successful update
    prisma.user.update.mockResolvedValue({});

    const requestBody = {
      email: "john@example.com",
    };

    const request = new NextRequest("http://localhost:3000/api/auth/forgot-password", {
      method: "POST",
      body: JSON.stringify(requestBody),
      headers: {
        "Content-Type": "application/json",
      },
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.message).toBe("If an account with that email exists, we've sent a password reset link.");

    // Verify Prisma calls
    expect(prisma.user.findUnique).toHaveBeenCalledWith({
      where: { email: "john@example.com" },
    });

    expect(prisma.user.update).toHaveBeenCalledWith({
      where: { id: "user-123" },
      data: {
        passwordResetToken: expect.any(String),
        passwordResetExpires: expect.any(Date),
      },
    });

    // Verify email was sent
    expect(sendPasswordResetEmail).toHaveBeenCalledWith(
      "john@example.com",
      "John",
      expect.any(String)
    );
  });

  it("should return success even for non-existing user (security)", async () => {
    const { prisma } = require("@/lib/db");
    const { sendPasswordResetEmail } = require("@/lib/email/sendEmail");

    // Mock no user found
    prisma.user.findUnique.mockResolvedValue(null);

    const requestBody = {
      email: "nonexistent@example.com",
    };

    const request = new NextRequest("http://localhost:3000/api/auth/forgot-password", {
      method: "POST",
      body: JSON.stringify(requestBody),
      headers: {
        "Content-Type": "application/json",
      },
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.message).toBe("If an account with that email exists, we've sent a password reset link.");

    // Verify Prisma calls
    expect(prisma.user.findUnique).toHaveBeenCalledWith({
      where: { email: "nonexistent@example.com" },
    });

    // Should not update or send email for non-existing user
    expect(prisma.user.update).not.toHaveBeenCalled();
    expect(sendPasswordResetEmail).not.toHaveBeenCalled();
  });

  it("should return validation error for invalid email", async () => {
    const requestBody = {
      email: "invalid-email",
    };

    const request = new NextRequest("http://localhost:3000/api/auth/forgot-password", {
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
    expect(data.errors).toHaveProperty("email");
  });

  it("should handle email sending failure gracefully", async () => {
    const { prisma } = require("@/lib/db");
    const { sendPasswordResetEmail } = require("@/lib/email/sendEmail");

    // Mock existing user
    prisma.user.findUnique.mockResolvedValue({
      id: "user-123",
      email: "john@example.com",
      firstName: "John",
      username: "johndoe",
    });

    // Mock successful update
    prisma.user.update.mockResolvedValue({});

    // Mock email sending failure
    sendPasswordResetEmail.mockRejectedValue(new Error("Email service unavailable"));

    const requestBody = {
      email: "john@example.com",
    };

    const request = new NextRequest("http://localhost:3000/api/auth/forgot-password", {
      method: "POST",
      body: JSON.stringify(requestBody),
      headers: {
        "Content-Type": "application/json",
      },
    });

    const response = await POST(request);
    const data = await response.json();

    // Should still return success even if email fails
    expect(response.status).toBe(200);
    expect(data.message).toBe("If an account with that email exists, we've sent a password reset link.");
  });
});
