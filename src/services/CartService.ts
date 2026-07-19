import { CartRepository } from "@/repositories/CartRepository";
import { ProductRepository } from "@/repositories/ProductRepository";
import { NotFoundError, BadRequestError } from "@/core/exceptions";
import { CartItem } from "@prisma/client";

export class CartService {
  private cartRepository = new CartRepository();
  private productRepository = new ProductRepository();

  async getCart(userId: string) {
    return this.cartRepository.findByUserId(userId);
  }

  async addToCart(userId: string, productId: string, quantity: number): Promise<CartItem> {
    const product = await this.productRepository.findById(productId);
    if (!product) {
      throw new NotFoundError("Product not found");
    }

    if (product.stock < quantity) {
      throw new BadRequestError(`Insufficient stock. Only ${product.stock} items left.`);
    }

    return this.cartRepository.addItem(userId, productId, quantity);
  }

  async updateQuantity(userId: string, cartItemId: string, quantity: number): Promise<CartItem> {
    const cartItems = await this.cartRepository.findByUserId(userId);
    const item = cartItems.find((i) => i.id === cartItemId);
    
    if (!item) {
      throw new NotFoundError("Cart item not found");
    }

    const product = await this.productRepository.findById(item.productId);
    if (!product) {
      throw new NotFoundError("Product not found");
    }

    if (product.stock < quantity) {
      throw new BadRequestError(`Insufficient stock. Only ${product.stock} items left.`);
    }

    return this.cartRepository.updateItemQuantity(userId, cartItemId, quantity);
  }

  async removeItem(userId: string, cartItemId: string): Promise<void> {
    try {
      await this.cartRepository.removeItem(userId, cartItemId);
    } catch {
      throw new NotFoundError("Cart item not found or unauthorized");
    }
  }

  async clearCart(userId: string): Promise<void> {
    await this.cartRepository.clearCart(userId);
  }
}
