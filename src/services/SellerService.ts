import { prisma } from "@/core/database/prisma";
import { NotFoundError, BadRequestError } from "@/core/exceptions";
import { VerificationStatus, OrderStatus, Product, Prisma } from "@prisma/client";

export class SellerService {
  // Retrieve the seller profile by user ID
  async getProfile(userId: string) {
    const profile = await prisma.sellerProfile.findUnique({
      where: { userId },
    });
    if (!profile) {
      throw new NotFoundError("Seller profile not found");
    }
    return profile;
  }

  // Update shop settings
  async updateProfile(userId: string, data: {
    shopName?: string;
    shopDescription?: string;
    gstin?: string;
    taxId?: string;
    shopLogo?: string;
    shopBanner?: string;
  }) {
    const profile = await this.getProfile(userId);
    return prisma.sellerProfile.update({
      where: { id: profile.id },
      data,
    });
  }

  // Fetch all products for the seller
  async getProducts(userId: string): Promise<Product[]> {
    const profile = await this.getProfile(userId);
    return prisma.product.findMany({
      where: { sellerId: profile.id },
      include: {
        category: true,
      },
      orderBy: { createdAt: "desc" },
    });
  }

  // Create a product
  async createProduct(userId: string, data: {
    name: string;
    description: string;
    price: number;
    comparePrice?: number;
    stock: number;
    categoryId: string;
    images: string[];
    specifications?: Record<string, string>;
  }) {
    const profile = await this.getProfile(userId);
    
    // Auto-generate slug
    const slug = data.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)+/g, "") + "-" + Math.random().toString(36).substring(2, 6);

    return prisma.product.create({
      data: {
        sellerId: profile.id,
        name: data.name,
        slug,
        description: data.description,
        price: data.price,
        comparePrice: data.comparePrice || null,
        stock: data.stock,
        categoryId: data.categoryId,
        images: data.images,
        specifications: data.specifications || Prisma.JsonNull,
        status: VerificationStatus.PENDING, // Awaiting admin approval
        isActive: true,
      },
    });
  }

  // Update a product
  async updateProduct(userId: string, productId: string, data: {
    name?: string;
    description?: string;
    price?: number;
    comparePrice?: number;
    stock?: number;
    categoryId?: string;
    images?: string[];
    specifications?: Record<string, string>;
    isActive?: boolean;
  }) {
    const profile = await this.getProfile(userId);
    const product = await prisma.product.findFirst({
      where: { id: productId, sellerId: profile.id },
    });

    if (!product) {
      throw new NotFoundError("Product not found or unauthorized");
    }

    return prisma.product.update({
      where: { id: productId },
      data: {
        ...data,
        comparePrice: data.comparePrice === undefined ? undefined : (data.comparePrice || null),
        specifications: data.specifications === undefined ? undefined : (data.specifications || Prisma.JsonNull),
      },
    });
  }

  // Fetch orders containing the seller's products
  async getOrders(userId: string) {
    const profile = await this.getProfile(userId);

    // Get orders that have items belonging to this seller
    return prisma.order.findMany({
      where: {
        items: {
          some: {
            product: {
              sellerId: profile.id,
            },
          },
        },
      },
      include: {
        items: {
          where: {
            product: {
              sellerId: profile.id,
            },
          },
          include: {
            product: true,
          },
        },
        customer: {
          select: {
            name: true,
            email: true,
            phoneNumber: true,
          },
        },
        shippingAddress: true,
      },
      orderBy: { createdAt: "desc" },
    });
  }

  // Fulfill seller's portion of an order (sets status to PROCESSING or SHIPPED)
  async fulfillOrder(userId: string, orderId: string) {
    const profile = await this.getProfile(userId);

    // Verify order contains seller's items
    const order = await prisma.order.findFirst({
      where: {
        id: orderId,
        items: {
          some: {
            product: {
              sellerId: profile.id,
            },
          },
        },
      },
    });

    if (!order) {
      throw new NotFoundError("Order not found or unauthorized");
    }

    if (order.status !== OrderStatus.PENDING && order.status !== OrderStatus.CONFIRMED) {
      throw new BadRequestError(`Cannot fulfill order in ${order.status} state`);
    }

    // Transition global order status to CONFIRMED / PROCESSING, signaling delivery pickups
    return prisma.order.update({
      where: { id: orderId },
      data: { status: OrderStatus.PROCESSING },
    });
  }

  // Fetch KPI statistics
  async getMetrics(userId: string) {
    const profile = await this.getProfile(userId);

    const products = await prisma.product.findMany({
      where: { sellerId: profile.id },
      select: { id: true, price: true, stock: true },
    });

    // Sum total items sold inside confirmed orders
    const orderItems = await prisma.orderItem.findMany({
      where: {
        product: { sellerId: profile.id },
        order: {
          status: {
            in: [OrderStatus.CONFIRMED, OrderStatus.PROCESSING, OrderStatus.SHIPPED, OrderStatus.DELIVERED],
          },
        },
      },
      select: { price: true, quantity: true },
    });

    const totalSales = orderItems.reduce((acc, item) => acc + Number(item.price) * item.quantity, 0);
    const totalUnitsSold = orderItems.reduce((acc, item) => acc + item.quantity, 0);

    const pendingOrdersCount = await prisma.order.count({
      where: {
        status: {
          in: [OrderStatus.PENDING, OrderStatus.CONFIRMED],
        },
        items: {
          some: {
            product: { sellerId: profile.id },
          },
        },
      },
    });

    return {
      revenue: totalSales,
      unitsSold: totalUnitsSold,
      activeProducts: products.length,
      pendingOrders: pendingOrdersCount,
      outOfStockCount: products.filter((p) => p.stock <= 0).length,
    };
  }
}
