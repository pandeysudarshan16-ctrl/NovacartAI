import { describe, it, expect, vi, beforeEach } from "vitest";
import { CartService } from "../CartService";
import { NotFoundError, BadRequestError } from "@/core/exceptions";

// Mock CartRepository
const mockCartRepositoryInstance = {
  findByUserId: vi.fn(),
  addItem: vi.fn(),
  updateItemQuantity: vi.fn(),
  removeItem: vi.fn(),
  clearCart: vi.fn(),
};

vi.mock("@/repositories/CartRepository", () => {
  return {
    CartRepository: vi.fn().mockImplementation(function () {
      return mockCartRepositoryInstance;
    }),
  };
});

// Mock ProductRepository
const mockProductRepositoryInstance = {
  findById: vi.fn(),
  findBySlug: vi.fn(),
  findMany: vi.fn(),
  create: vi.fn(),
};

vi.mock("@/repositories/ProductRepository", () => {
  return {
    ProductRepository: vi.fn().mockImplementation(function () {
      return mockProductRepositoryInstance;
    }),
  };
});

describe("CartService", () => {
  let cartService: CartService;
  let mockCartRepository: typeof mockCartRepositoryInstance;
  let mockProductRepository: typeof mockProductRepositoryInstance;

  beforeEach(() => {
    vi.clearAllMocks();
    cartService = new CartService();
    mockCartRepository = mockCartRepositoryInstance;
    mockProductRepository = mockProductRepositoryInstance;
  });

  describe("addToCart", () => {
    it("should successfully add item if stock is sufficient", async () => {
      const mockProduct = {
        id: "prod-123",
        name: "Premium Wireless Mouse",
        price: 49.99,
        stock: 10,
      };

      const mockCartItem = {
        id: "item-789",
        cartId: "cart-456",
        productId: "prod-123",
        quantity: 2,
      };

      mockProductRepository.findById.mockResolvedValue(mockProduct);
      mockCartRepository.addItem.mockResolvedValue(mockCartItem);

      const result = await cartService.addToCart("user-555", "prod-123", 2);

      expect(mockProductRepository.findById).toHaveBeenCalledWith("prod-123");
      expect(mockCartRepository.addItem).toHaveBeenCalledWith("user-555", "prod-123", 2);
      expect(result).toEqual(mockCartItem);
    });

    it("should throw NotFoundError if product does not exist", async () => {
      mockProductRepository.findById.mockResolvedValue(null);

      await expect(cartService.addToCart("user-555", "prod-999", 1)).rejects.toThrow(NotFoundError);
    });

    it("should throw BadRequestError if quantity exceeds stock", async () => {
      const mockProduct = {
        id: "prod-123",
        name: "Premium Wireless Mouse",
        price: 49.99,
        stock: 5,
      };

      mockProductRepository.findById.mockResolvedValue(mockProduct);

      await expect(cartService.addToCart("user-555", "prod-123", 6)).rejects.toThrow(BadRequestError);
    });
  });

  describe("updateQuantity", () => {
    it("should successfully update item quantity if stock is sufficient", async () => {
      const mockCartItems = [
        {
          id: "item-789",
          productId: "prod-123",
          quantity: 2,
        },
      ];

      const mockProduct = {
        id: "prod-123",
        name: "Premium Wireless Mouse",
        price: 49.99,
        stock: 10,
      };

      const mockUpdatedItem = {
        id: "item-789",
        productId: "prod-123",
        quantity: 5,
      };

      mockCartRepository.findByUserId.mockResolvedValue(mockCartItems);
      mockProductRepository.findById.mockResolvedValue(mockProduct);
      mockCartRepository.updateItemQuantity.mockResolvedValue(mockUpdatedItem);

      const result = await cartService.updateQuantity("user-555", "item-789", 5);

      expect(mockCartRepository.findByUserId).toHaveBeenCalledWith("user-555");
      expect(mockProductRepository.findById).toHaveBeenCalledWith("prod-123");
      expect(mockCartRepository.updateItemQuantity).toHaveBeenCalledWith("user-555", "item-789", 5);
      expect(result).toEqual(mockUpdatedItem);
    });

    it("should throw NotFoundError if cart item is not found in user's cart", async () => {
      mockCartRepository.findByUserId.mockResolvedValue([]);

      await expect(cartService.updateQuantity("user-555", "item-999", 5)).rejects.toThrow(NotFoundError);
    });

    it("should throw BadRequestError if new quantity exceeds product stock limit", async () => {
      const mockCartItems = [
        {
          id: "item-789",
          productId: "prod-123",
          quantity: 2,
        },
      ];

      const mockProduct = {
        id: "prod-123",
        name: "Premium Wireless Mouse",
        price: 49.99,
        stock: 4,
      };

      mockCartRepository.findByUserId.mockResolvedValue(mockCartItems);
      mockProductRepository.findById.mockResolvedValue(mockProduct);

      await expect(cartService.updateQuantity("user-555", "item-789", 5)).rejects.toThrow(BadRequestError);
    });
  });
});
