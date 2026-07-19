import { prisma } from "@/core/database/prisma";
import { NotFoundError } from "@/core/exceptions";
import { VerificationStatus, OrderStatus, Role } from "@prisma/client";

export class AdminService {
  // Fetch global platform statistics
  async getMetrics() {
    // 1. Calculate GMV (Gross Merchandise Value) from paid / fulfilled orders
    const paidOrders = await prisma.order.findMany({
      where: {
        status: {
          in: [OrderStatus.CONFIRMED, OrderStatus.PROCESSING, OrderStatus.SHIPPED, OrderStatus.DELIVERED],
        },
      },
      select: { totalAmount: true },
    });

    const gmv = paidOrders.reduce((sum, order) => sum + Number(order.totalAmount), 0);
    const platformCommission = gmv * 0.085; // 8.5% platform commission cut

    // 2. Count platform users
    const activeSellersCount = await prisma.sellerProfile.count();
    const activeCustomersCount = await prisma.user.count({
      where: { role: Role.CUSTOMER },
    });

    // 3. Count items in review queues
    const pendingProductsCount = await prisma.product.count({
      where: { status: VerificationStatus.PENDING },
    });
    const pendingSellersCount = await prisma.sellerProfile.count({
      where: { verificationStatus: VerificationStatus.PENDING },
    });

    return {
      gmv,
      commissionEarned: platformCommission,
      sellersCount: activeSellersCount,
      customersCount: activeCustomersCount,
      pendingProducts: pendingProductsCount,
      pendingSellers: pendingSellersCount,
    };
  }

  // Fetch all registered seller profiles
  async getSellers() {
    return prisma.sellerProfile.findMany({
      include: {
        user: {
          select: {
            name: true,
            email: true,
            phoneNumber: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });
  }

  // Update seller verification status (Approve / Suspend)
  async updateSellerVerification(sellerId: string, status: VerificationStatus) {
    const profile = await prisma.sellerProfile.findUnique({
      where: { id: sellerId },
    });

    if (!profile) {
      throw new NotFoundError("Seller profile not found");
    }

    return prisma.sellerProfile.update({
      where: { id: sellerId },
      data: { verificationStatus: status },
    });
  }

  // Fetch all products (includes pending and approved for moderation)
  async getProducts() {
    return prisma.product.findMany({
      include: {
        category: true,
        seller: {
          select: {
            shopName: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });
  }

  // Update product verification status (Approve / Reject)
  async updateProductVerification(productId: string, status: VerificationStatus) {
    const product = await prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      throw new NotFoundError("Product not found");
    }

    return prisma.product.update({
      where: { id: productId },
      data: { status },
    });
  }
}
