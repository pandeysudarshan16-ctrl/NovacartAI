import { prisma } from "@/core/database/prisma";
import { CartItem } from "@prisma/client";

export class CartRepository {
  // Find all cart items for a specific user
  async findByUserId(userId: string) {
    const cart = await prisma.cart.findUnique({
      where: { userId },
      include: {
        items: {
          include: {
            product: {
              include: {
                seller: {
                  select: {
                    shopName: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!cart) {
      return [];
    }

    return cart.items;
  }

  // Add an item to user's cart
  async addItem(userId: string, productId: string, quantity: number) {
    // 1. Find or create the user's cart
    let cart = await prisma.cart.findUnique({
      where: { userId },
    });

    if (!cart) {
      cart = await prisma.cart.create({
        data: { userId },
      });
    }

    // 2. Check if product already exists in the cart
    const existingItem = await prisma.cartItem.findUnique({
      where: {
        cartId_productId: {
          cartId: cart.id,
          productId,
        },
      },
    });

    if (existingItem) {
      // Increment quantity
      return prisma.cartItem.update({
        where: { id: existingItem.id },
        data: { quantity: existingItem.quantity + quantity },
      });
    } else {
      // Create new cart item
      return prisma.cartItem.create({
        data: {
          cartId: cart.id,
          productId,
          quantity,
        },
      });
    }
  }

  // Update item quantity
  async updateItemQuantity(userId: string, cartItemId: string, quantity: number): Promise<CartItem> {
    const cartItem = await prisma.cartItem.findFirst({
      where: {
        id: cartItemId,
        cart: {
          userId,
        },
      },
    });

    if (!cartItem) {
      throw new Error("Cart item not found or unauthorized");
    }

    return prisma.cartItem.update({
      where: { id: cartItemId },
      data: { quantity },
    });
  }

  // Remove item from cart
  async removeItem(userId: string, cartItemId: string): Promise<void> {
    const cartItem = await prisma.cartItem.findFirst({
      where: {
        id: cartItemId,
        cart: {
          userId,
        },
      },
    });

    if (!cartItem) {
      throw new Error("Cart item not found or unauthorized");
    }

    await prisma.cartItem.delete({
      where: { id: cartItemId },
    });
  }

  // Clear user's cart
  async clearCart(userId: string): Promise<void> {
    const cart = await prisma.cart.findUnique({
      where: { userId },
    });

    if (cart) {
      await prisma.cartItem.deleteMany({
        where: { cartId: cart.id },
      });
    }
  }
}
