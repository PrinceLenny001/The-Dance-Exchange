import { POST as checkoutOrder } from "@/app/api/checkout/route";
import { NextRequest } from "next/server";

// Mock Prisma
jest.mock("@/lib/db", () => ({
  prisma: {
    user: {
      findUnique: jest.fn(),
    },
    costume: {
      findMany: jest.fn(),
      updateMany: jest.fn(),
    },
    order: {
      create: jest.fn(),
    },
  },
}));

describe("Checkout API", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("POST /api/checkout", () => {
    const mockUserId = "user-123";
    const mockRequest = {
      headers: {
        get: jest.fn().mockReturnValue(mockUserId),
      },
      json: jest.fn(),
    } as unknown as NextRequest;

    const validCheckoutData = {
      items: [
        {
          costumeId: "costume-1",
          price: 150.00,
          quantity: 1,
        },
        {
          costumeId: "costume-2",
          price: 75.00,
          quantity: 1,
        },
      ],
      shippingAddress: {
        firstName: "John",
        lastName: "Doe",
        address: "123 Main St",
        city: "New York",
        state: "NY",
        zipCode: "10001",
        country: "US",
      },
      paymentMethod: "card",
    };

    it("should process a valid checkout successfully", async () => {
      const { prisma } = require("@/lib/db");

      // Mock user exists
      prisma.user.findUnique.mockResolvedValue({
        id: mockUserId,
        username: "testuser",
      });

      // Mock costumes are available
      const mockCostumes = [
        {
          id: "costume-1",
          price: 150.00,
          status: "available",
          seller: { id: "seller-1", username: "seller1" },
        },
        {
          id: "costume-2",
          price: 75.00,
          status: "available",
          seller: { id: "seller-2", username: "seller2" },
        },
      ];
      prisma.costume.findMany.mockResolvedValue(mockCostumes);

      // Mock order creation
      const mockOrder = {
        id: "order-123",
        buyerId: mockUserId,
        totalPrice: 225.00,
        status: "processing",
        orderItems: [
          {
            id: "item-1",
            costumeId: "costume-1",
            priceAtPurchase: 150.00,
            quantity: 1,
          },
          {
            id: "item-2",
            costumeId: "costume-2",
            priceAtPurchase: 75.00,
            quantity: 1,
          },
        ],
      };
      prisma.order.create.mockResolvedValue(mockOrder);

      // Mock costume status update
      prisma.costume.updateMany.mockResolvedValue({ count: 2 });

      (mockRequest.json as jest.Mock).mockResolvedValue(validCheckoutData);

      const response = await checkoutOrder(mockRequest);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.orderId).toBe("order-123");
      expect(data.paymentIntentId).toMatch(/^pi_\d+_[a-z0-9]+$/);

      // Verify Prisma calls
      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { id: mockUserId },
      });

      expect(prisma.costume.findMany).toHaveBeenCalledWith({
        where: {
          id: { in: ["costume-1", "costume-2"] },
          status: "available",
        },
        include: {
          seller: true,
        },
      });

      expect(prisma.order.create).toHaveBeenCalledWith({
        data: {
          buyerId: mockUserId,
          totalPrice: 225.00,
          status: "processing",
          shippingAddress: validCheckoutData.shippingAddress,
          orderItems: {
            create: [
              {
                costumeId: "costume-1",
                priceAtPurchase: 150.00,
                quantity: 1,
              },
              {
                costumeId: "costume-2",
                priceAtPurchase: 75.00,
                quantity: 1,
              },
            ],
          },
        },
        include: {
          orderItems: {
            include: {
              costume: {
                include: {
                  seller: true,
                },
              },
            },
          },
        },
      });

      expect(prisma.costume.updateMany).toHaveBeenCalledWith({
        where: {
          id: { in: ["costume-1", "costume-2"] },
        },
        data: {
          status: "sold",
        },
      });
    });

    it("should return 401 if user is not authenticated", async () => {
      const requestWithoutUser = {
        ...mockRequest,
        headers: {
          get: jest.fn().mockReturnValue(null),
        },
      } as unknown as NextRequest;

      (requestWithoutUser.json as jest.Mock).mockResolvedValue(validCheckoutData);

      const response = await checkoutOrder(requestWithoutUser);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toBe("User not authenticated");
    });

    it("should return 404 if user is not found", async () => {
      const { prisma } = require("@/lib/db");

      prisma.user.findUnique.mockResolvedValue(null);
      (mockRequest.json as jest.Mock).mockResolvedValue(validCheckoutData);

      const response = await checkoutOrder(mockRequest);
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.error).toBe("User not found");
    });

    it("should return 400 if some costumes are not available", async () => {
      const { prisma } = require("@/lib/db");

      prisma.user.findUnique.mockResolvedValue({
        id: mockUserId,
        username: "testuser",
      });

      // Only one costume is available
      prisma.costume.findMany.mockResolvedValue([
        {
          id: "costume-1",
          price: 150.00,
          status: "available",
          seller: { id: "seller-1", username: "seller1" },
        },
      ]);

      (mockRequest.json as jest.Mock).mockResolvedValue(validCheckoutData);

      const response = await checkoutOrder(mockRequest);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe("Some costumes are no longer available");
    });

    it("should return 400 for invalid request data", async () => {
      const invalidData = {
        items: [], // Empty items array
        shippingAddress: {
          firstName: "John",
          // Missing required fields
        },
      };

      (mockRequest.json as jest.Mock).mockResolvedValue(invalidData);

      const response = await checkoutOrder(mockRequest);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe("Invalid request data");
      expect(data.details).toBeDefined();
    });

    it("should handle database errors gracefully", async () => {
      const { prisma } = require("@/lib/db");

      prisma.user.findUnique.mockRejectedValue(new Error("Database error"));
      (mockRequest.json as jest.Mock).mockResolvedValue(validCheckoutData);

      const response = await checkoutOrder(mockRequest);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe("Internal server error");
    });

    it("should calculate total price correctly", async () => {
      const { prisma } = require("@/lib/db");

      prisma.user.findUnique.mockResolvedValue({
        id: mockUserId,
        username: "testuser",
      });

      const mockCostumes = [
        {
          id: "costume-1",
          price: 100.00,
          status: "available",
          seller: { id: "seller-1", username: "seller1" },
        },
        {
          id: "costume-2",
          price: 50.00,
          status: "available",
          seller: { id: "seller-2", username: "seller2" },
        },
      ];
      prisma.costume.findMany.mockResolvedValue(mockCostumes);

      const checkoutDataWithQuantities = {
        ...validCheckoutData,
        items: [
          {
            costumeId: "costume-1",
            price: 100.00,
            quantity: 2, // 2 items
          },
          {
            costumeId: "costume-2",
            price: 50.00,
            quantity: 1, // 1 item
          },
        ],
      };

      prisma.order.create.mockResolvedValue({
        id: "order-123",
        totalPrice: 250.00, // 100*2 + 50*1 = 250
      });

      prisma.costume.updateMany.mockResolvedValue({ count: 2 });

      (mockRequest.json as jest.Mock).mockResolvedValue(checkoutDataWithQuantities);

      const response = await checkoutOrder(mockRequest);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);

      // Verify order was created with correct total
      expect(prisma.order.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            totalPrice: 250.00,
          }),
        })
      );
    });
  });
});
