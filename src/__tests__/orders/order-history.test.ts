import { GET as getUserOrders } from "@/app/api/users/me/orders/route";
import { NextRequest } from "next/server";

// Mock Prisma
jest.mock("@/lib/db", () => ({
  prisma: {
    user: {
      findUnique: jest.fn(),
    },
    order: {
      findMany: jest.fn(),
    },
  },
}));

describe("Order History API", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("GET /api/users/me/orders", () => {
    it("should return user orders successfully", async () => {
      const { prisma } = require("@/lib/db");

      const mockUserId = "user-123";
      const mockUser = {
        id: mockUserId,
        username: "testuser",
      };

      const mockOrders = [
        {
          id: "order-1",
          buyerId: mockUserId,
          totalPrice: 225.00,
          status: "processing",
          shippingAddress: {
            firstName: "John",
            lastName: "Doe",
            address: "123 Main St",
            city: "New York",
            state: "NY",
            zipCode: "10001",
            country: "US",
          },
          createdAt: new Date("2024-01-15"),
          updatedAt: new Date("2024-01-15"),
          orderItems: [
            {
              id: "item-1",
              costumeId: "costume-1",
              priceAtPurchase: 150.00,
              quantity: 1,
              costume: {
                id: "costume-1",
                title: "Ballet Tutu",
                images: [
                  {
                    id: "img-1",
                    imageUrl: "https://example.com/image1.jpg",
                    isPrimary: true,
                  },
                ],
                seller: {
                  id: "seller-1",
                  username: "dancer1",
                },
              },
            },
            {
              id: "item-2",
              costumeId: "costume-2",
              priceAtPurchase: 75.00,
              quantity: 1,
              costume: {
                id: "costume-2",
                title: "Jazz Costume",
                images: [],
                seller: {
                  id: "seller-2",
                  username: "dancer2",
                },
              },
            },
          ],
        },
        {
          id: "order-2",
          buyerId: mockUserId,
          totalPrice: 100.00,
          status: "delivered",
          shippingAddress: {
            firstName: "John",
            lastName: "Doe",
            address: "123 Main St",
            city: "New York",
            state: "NY",
            zipCode: "10001",
            country: "US",
          },
          createdAt: new Date("2024-01-10"),
          updatedAt: new Date("2024-01-12"),
          orderItems: [
            {
              id: "item-3",
              costumeId: "costume-3",
              priceAtPurchase: 100.00,
              quantity: 1,
              costume: {
                id: "costume-3",
                title: "Tap Shoes",
                images: [
                  {
                    id: "img-3",
                    imageUrl: "https://example.com/image3.jpg",
                    isPrimary: true,
                  },
                ],
                seller: {
                  id: "seller-3",
                  username: "tapper1",
                },
              },
            },
          ],
        },
      ];

      prisma.user.findUnique.mockResolvedValue(mockUser);
      prisma.order.findMany.mockResolvedValue(mockOrders);

      const request = new NextRequest("http://localhost:3000/api/users/me/orders", {
        headers: {
          "x-user-id": mockUserId,
        },
      });

      const response = await getUserOrders(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.orders).toEqual(mockOrders);
      expect(data.orders).toHaveLength(2);

      // Verify Prisma calls
      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { id: mockUserId },
      });

      expect(prisma.order.findMany).toHaveBeenCalledWith({
        where: {
          buyerId: mockUserId,
        },
        orderBy: {
          createdAt: "desc",
        },
        include: {
          orderItems: {
            include: {
              costume: {
                include: {
                  images: {
                    where: { isPrimary: true },
                    take: 1,
                  },
                  seller: {
                    select: {
                      id: true,
                      username: true,
                    },
                  },
                },
              },
            },
          },
        },
      });
    });

    it("should return 401 if user is not authenticated", async () => {
      const request = new NextRequest("http://localhost:3000/api/users/me/orders", {
        headers: {
          "x-user-id": null,
        },
      });

      const response = await getUserOrders(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toBe("User not authenticated");
    });

    it("should return 404 if user is not found", async () => {
      const { prisma } = require("@/lib/db");

      const mockUserId = "user-123";
      prisma.user.findUnique.mockResolvedValue(null);

      const request = new NextRequest("http://localhost:3000/api/users/me/orders", {
        headers: {
          "x-user-id": mockUserId,
        },
      });

      const response = await getUserOrders(request);
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.error).toBe("User not found");
    });

    it("should return empty array if user has no orders", async () => {
      const { prisma } = require("@/lib/db");

      const mockUserId = "user-123";
      const mockUser = {
        id: mockUserId,
        username: "testuser",
      };

      prisma.user.findUnique.mockResolvedValue(mockUser);
      prisma.order.findMany.mockResolvedValue([]);

      const request = new NextRequest("http://localhost:3000/api/users/me/orders", {
        headers: {
          "x-user-id": mockUserId,
        },
      });

      const response = await getUserOrders(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.orders).toEqual([]);
      expect(data.orders).toHaveLength(0);
    });

    it("should handle database errors gracefully", async () => {
      const { prisma } = require("@/lib/db");

      const mockUserId = "user-123";
      prisma.user.findUnique.mockRejectedValue(new Error("Database error"));

      const request = new NextRequest("http://localhost:3000/api/users/me/orders", {
        headers: {
          "x-user-id": mockUserId,
        },
      });

      const response = await getUserOrders(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe("Internal server error");
    });

    it("should include all required order fields", async () => {
      const { prisma } = require("@/lib/db");

      const mockUserId = "user-123";
      const mockUser = {
        id: mockUserId,
        username: "testuser",
      };

      const mockOrder = {
        id: "order-1",
        buyerId: mockUserId,
        totalPrice: 150.00,
        status: "processing",
        shippingAddress: {
          firstName: "John",
          lastName: "Doe",
          address: "123 Main St",
          city: "New York",
          state: "NY",
          zipCode: "10001",
          country: "US",
        },
        createdAt: new Date("2024-01-15"),
        updatedAt: new Date("2024-01-15"),
        orderItems: [
          {
            id: "item-1",
            costumeId: "costume-1",
            priceAtPurchase: 150.00,
            quantity: 1,
            costume: {
              id: "costume-1",
              title: "Ballet Tutu",
              images: [],
              seller: {
                id: "seller-1",
                username: "dancer1",
              },
            },
          },
        ],
      };

      prisma.user.findUnique.mockResolvedValue(mockUser);
      prisma.order.findMany.mockResolvedValue([mockOrder]);

      const request = new NextRequest("http://localhost:3000/api/users/me/orders", {
        headers: {
          "x-user-id": mockUserId,
        },
      });

      const response = await getUserOrders(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.orders).toHaveLength(1);
      
      const order = data.orders[0];
      expect(order).toHaveProperty("id");
      expect(order).toHaveProperty("buyerId");
      expect(order).toHaveProperty("totalPrice");
      expect(order).toHaveProperty("status");
      expect(order).toHaveProperty("shippingAddress");
      expect(order).toHaveProperty("createdAt");
      expect(order).toHaveProperty("updatedAt");
      expect(order).toHaveProperty("orderItems");
      
      expect(order.orderItems).toHaveLength(1);
      const orderItem = order.orderItems[0];
      expect(orderItem).toHaveProperty("id");
      expect(orderItem).toHaveProperty("costumeId");
      expect(orderItem).toHaveProperty("priceAtPurchase");
      expect(orderItem).toHaveProperty("quantity");
      expect(orderItem).toHaveProperty("costume");
      
      expect(orderItem.costume).toHaveProperty("id");
      expect(orderItem.costume).toHaveProperty("title");
      expect(orderItem.costume).toHaveProperty("images");
      expect(orderItem.costume).toHaveProperty("seller");
      
      expect(orderItem.costume.seller).toHaveProperty("id");
      expect(orderItem.costume.seller).toHaveProperty("username");
    });

    it("should order orders by creation date descending", async () => {
      const { prisma } = require("@/lib/db");

      const mockUserId = "user-123";
      const mockUser = {
        id: mockUserId,
        username: "testuser",
      };

      prisma.user.findUnique.mockResolvedValue(mockUser);
      prisma.order.findMany.mockResolvedValue([]);

      const request = new NextRequest("http://localhost:3000/api/users/me/orders", {
        headers: {
          "x-user-id": mockUserId,
        },
      });

      const response = await getUserOrders(request);
      const data = await response.json();

      expect(response.status).toBe(200);

      // Verify orderBy parameter
      expect(prisma.order.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          orderBy: {
            createdAt: "desc",
          },
        })
      );
    });
  });
});
