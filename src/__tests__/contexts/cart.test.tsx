import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { CartProvider, useCart } from "@/contexts/CartContext";
import { toast } from "react-toastify";

// Mock react-toastify
jest.mock("react-toastify", () => ({
  toast: {
    success: jest.fn(),
    info: jest.fn(),
    error: jest.fn(),
  },
}));

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
Object.defineProperty(window, "localStorage", {
  value: localStorageMock,
});

// Test component that uses the cart context
function TestComponent() {
  const { items, addItem, removeItem, clearCart, getTotalPrice, getItemCount } = useCart();

  return (
    <div>
      <div data-testid="item-count">{getItemCount()}</div>
      <div data-testid="total-price">{getTotalPrice()}</div>
      <div data-testid="items">
        {items.map((item) => (
          <div key={item.id} data-testid={`item-${item.id}`}>
            {item.title} - ${item.price}
            <button onClick={() => removeItem(item.id)}>Remove</button>
          </div>
        ))}
      </div>
      <button
        onClick={() =>
          addItem({
            title: "Test Costume",
            price: 100,
            size: "M",
            condition: "NEW",
            imageUrl: "test.jpg",
            seller: { id: "seller-1", username: "test-seller" },
          })
        }
      >
        Add Item
      </button>
      <button onClick={clearCart}>Clear Cart</button>
    </div>
  );
}

describe("CartContext", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorageMock.getItem.mockReturnValue(null);
  });

  it("should provide cart context to children", () => {
    render(
      <CartProvider>
        <TestComponent />
      </CartProvider>
    );

    expect(screen.getByTestId("item-count")).toHaveTextContent("0");
    expect(screen.getByTestId("total-price")).toHaveTextContent("0");
  });

  it("should add item to cart", async () => {
    render(
      <CartProvider>
        <TestComponent />
      </CartProvider>
    );

    const addButton = screen.getByText("Add Item");
    fireEvent.click(addButton);

    await waitFor(() => {
      expect(screen.getByTestId("item-count")).toHaveTextContent("1");
      expect(screen.getByTestId("total-price")).toHaveTextContent("100");
      expect(screen.getByTestId("items")).toHaveTextContent("Test Costume - $100");
    });

    expect(toast.success).toHaveBeenCalledWith("Added to cart!");
  });

  it("should not add duplicate items", async () => {
    render(
      <CartProvider>
        <TestComponent />
      </CartProvider>
    );

    const addButton = screen.getByText("Add Item");
    
    // Add first item
    fireEvent.click(addButton);
    await waitFor(() => {
      expect(screen.getByTestId("item-count")).toHaveTextContent("1");
    });

    // Try to add same item again
    fireEvent.click(addButton);
    await waitFor(() => {
      expect(screen.getByTestId("item-count")).toHaveTextContent("1"); // Should still be 1
    });

    expect(toast.info).toHaveBeenCalledWith("This item is already in your cart");
  });

  it("should remove item from cart", async () => {
    render(
      <CartProvider>
        <TestComponent />
      </CartProvider>
    );

    // Add item first
    const addButton = screen.getByText("Add Item");
    fireEvent.click(addButton);

    await waitFor(() => {
      expect(screen.getByTestId("item-count")).toHaveTextContent("1");
    });

    // Remove item
    const removeButton = screen.getByText("Remove");
    fireEvent.click(removeButton);

    await waitFor(() => {
      expect(screen.getByTestId("item-count")).toHaveTextContent("0");
      expect(screen.getByTestId("total-price")).toHaveTextContent("0");
    });

    expect(toast.success).toHaveBeenCalledWith("Removed from cart");
  });

  it("should clear all items from cart", async () => {
    render(
      <CartProvider>
        <TestComponent />
      </CartProvider>
    );

    // Add multiple items
    const addButton = screen.getByText("Add Item");
    fireEvent.click(addButton);
    fireEvent.click(addButton);

    await waitFor(() => {
      expect(screen.getByTestId("item-count")).toHaveTextContent("1"); // Only one due to duplicate prevention
    });

    // Clear cart
    const clearButton = screen.getByText("Clear Cart");
    fireEvent.click(clearButton);

    await waitFor(() => {
      expect(screen.getByTestId("item-count")).toHaveTextContent("0");
      expect(screen.getByTestId("total-price")).toHaveTextContent("0");
    });

    expect(toast.success).toHaveBeenCalledWith("Cart cleared");
  });

  it("should load cart from localStorage on mount", () => {
    const savedCart = [
      {
        id: "test-1",
        title: "Saved Costume",
        price: 150,
        size: "L",
        condition: "GOOD",
        imageUrl: "saved.jpg",
        seller: { id: "seller-2", username: "saved-seller" },
      },
    ];

    localStorageMock.getItem.mockReturnValue(JSON.stringify(savedCart));

    render(
      <CartProvider>
        <TestComponent />
      </CartProvider>
    );

    expect(screen.getByTestId("item-count")).toHaveTextContent("1");
    expect(screen.getByTestId("total-price")).toHaveTextContent("150");
    expect(screen.getByTestId("items")).toHaveTextContent("Saved Costume - $150");
  });

  it("should save cart to localStorage when items change", async () => {
    render(
      <CartProvider>
        <TestComponent />
      </CartProvider>
    );

    const addButton = screen.getByText("Add Item");
    fireEvent.click(addButton);

    await waitFor(() => {
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        "cart",
        expect.stringContaining("Test Costume")
      );
    });
  });

  it("should handle localStorage errors gracefully", () => {
    localStorageMock.getItem.mockImplementation(() => {
      throw new Error("localStorage error");
    });

    // Should not throw error
    expect(() => {
      render(
        <CartProvider>
          <TestComponent />
        </CartProvider>
      );
    }).not.toThrow();

    expect(screen.getByTestId("item-count")).toHaveTextContent("0");
  });

  it("should calculate total price correctly with multiple items", async () => {
    // Create a component that adds multiple different items
    function MultiItemComponent() {
      const { items, addItem, getTotalPrice, getItemCount } = useCart();

      return (
        <div>
          <div data-testid="item-count">{getItemCount()}</div>
          <div data-testid="total-price">{getTotalPrice()}</div>
          <button
            onClick={() =>
              addItem({
                title: "Costume 1",
                price: 100,
                size: "M",
                condition: "NEW",
                imageUrl: "test1.jpg",
                seller: { id: "seller-1", username: "seller1" },
              })
            }
          >
            Add Item 1
          </button>
          <button
            onClick={() =>
              addItem({
                title: "Costume 2",
                price: 200,
                size: "L",
                condition: "GOOD",
                imageUrl: "test2.jpg",
                seller: { id: "seller-2", username: "seller2" },
              })
            }
          >
            Add Item 2
          </button>
        </div>
      );
    }

    render(
      <CartProvider>
        <MultiItemComponent />
      </CartProvider>
    );

    // Add first item
    fireEvent.click(screen.getByText("Add Item 1"));
    await waitFor(() => {
      expect(screen.getByTestId("total-price")).toHaveTextContent("100");
    });

    // Add second item
    fireEvent.click(screen.getByText("Add Item 2"));
    await waitFor(() => {
      expect(screen.getByTestId("total-price")).toHaveTextContent("300");
      expect(screen.getByTestId("item-count")).toHaveTextContent("2");
    });
  });
});
