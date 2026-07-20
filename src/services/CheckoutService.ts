import { prisma } from "@/core/database/prisma";
import { NotFoundError, BadRequestError } from "@/core/exceptions";
import { Order, OrderStatus } from "@prisma/client";

export class CheckoutService {
  async processCheckout(userId: string, addressData: {
    street: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  }): Promise<Order> {
    // 1. Fetch user's cart items
    const cart = await prisma.cart.findUnique({
      where: { userId },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    });

    if (!cart || cart.items.length === 0) {
      throw new BadRequestError("Cannot checkout an empty shopping cart");
    }

    // 2. Execute transactional checkout sequence
    const resultOrder = await prisma.$transaction(async (tx) => {
      // Validate and deduct stock for all items
      for (const item of cart.items) {
        const product = await tx.product.findUnique({
          where: { id: item.productId },
        });

        if (!product) {
          throw new NotFoundError(`Product '${item.product.name}' was not found in catalog`);
        }

        if (product.stock < item.quantity) {
          throw new BadRequestError(`Insufficient stock for product '${product.name}'. Requested ${item.quantity}, but only ${product.stock} are available.`);
        }

        // Deduct inventory
        await tx.product.update({
          where: { id: product.id },
          data: {
            stock: product.stock - item.quantity,
          },
        });
      }

      // Create address row for historical checkout tracking
      const address = await tx.address.create({
        data: {
          userId,
          title: "Checkout Address",
          street: addressData.street,
          city: addressData.city,
          state: addressData.state,
          postalCode: addressData.postalCode,
          country: addressData.country,
          isDefault: false,
        },
      });

      // Calculate totals
      const itemsTotal = cart.items.reduce((sum, item) => sum + (Number(item.product.price) * item.quantity), 0);
      const shippingCost = itemsTotal > 150 ? 0.00 : 10.00;
      const estimatedTax = itemsTotal * 0.05;
      const totalAmount = itemsTotal + shippingCost + estimatedTax;

      // Create order
      const order = await tx.order.create({
        data: {
          customerId: userId,
          addressId: address.id,
          status: OrderStatus.PENDING, // New orders start as PENDING for seller confirmation
          totalAmount,
          shippingCost,
        },
      });

      // Create order items
      const orderItemData = cart.items.map((item) => ({
        orderId: order.id,
        productId: item.productId,
        quantity: item.quantity,
        price: item.product.price,
      }));

      await tx.orderItem.createMany({
        data: orderItemData,
      });

      // Clear cart items
      await tx.cartItem.deleteMany({
        where: { cartId: cart.id },
      });

      return order;
    });

    return resultOrder;
  }
}
