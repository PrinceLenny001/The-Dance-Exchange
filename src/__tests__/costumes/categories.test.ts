import { GET } from "@/app/api/costumes/categories/route";

// Mock Prisma
jest.mock("@/lib/db", () => ({
  prisma: {
    costumeCategory: {
      findMany: jest.fn(),
    },
  },
}));

describe("/api/costumes/categories", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should return categories successfully", async () => {
    const { prisma } = require("@/lib/db");

    // Mock categories data
    const mockCategories = [
      { id: "cat-1", name: "Ballet" },
      { id: "cat-2", name: "Jazz" },
      { id: "cat-3", name: "Tap" },
      { id: "cat-4", name: "Lyrical" },
      { id: "cat-5", name: "Contemporary" },
    ];

    prisma.costumeCategory.findMany.mockResolvedValue(mockCategories);

    const response = await GET();
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.categories).toEqual(mockCategories);

    // Verify Prisma call
    expect(prisma.costumeCategory.findMany).toHaveBeenCalledWith({
      orderBy: { name: "asc" },
    });
  });

  it("should return empty array when no categories exist", async () => {
    const { prisma } = require("@/lib/db");

    // Mock empty categories
    prisma.costumeCategory.findMany.mockResolvedValue([]);

    const response = await GET();
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.categories).toEqual([]);
  });

  it("should handle database errors", async () => {
    const { prisma } = require("@/lib/db");

    // Mock database error
    prisma.costumeCategory.findMany.mockRejectedValue(new Error("Database error"));

    const response = await GET();
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.error).toBe("Internal server error");
  });
});
