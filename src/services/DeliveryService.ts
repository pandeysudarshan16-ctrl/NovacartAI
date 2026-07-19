import { prisma } from "@/core/database/prisma";
import { NotFoundError, BadRequestError } from "@/core/exceptions";
import { DeliveryStatus, OrderStatus, Delivery } from "@prisma/client";

export class DeliveryService {
  // Fetch delivery profile by user ID
  async getProfile(userId: string) {
    const profile = await prisma.deliveryProfile.findUnique({
      where: { userId },
    });
    if (!profile) {
      throw new NotFoundError("Delivery partner profile not found");
    }
    return profile;
  }

  // Toggle online availability and vehicle details
  async updateProfile(userId: string, data: {
    isOnline?: boolean;
    vehicleType?: string;
    vehicleNumber?: string;
    licenseNumber?: string;
  }) {
    const profile = await this.getProfile(userId);
    return prisma.deliveryProfile.update({
      where: { id: profile.id },
      data,
    });
  }

  // Fetch all orders ready for delivery pickup (PROCESSING status and no agent assigned)
  async getQueue() {
    return prisma.order.findMany({
      where: {
        status: OrderStatus.PROCESSING,
        delivery: {
          is: null,
        },
      },
      include: {
        customer: {
          select: {
            name: true,
            phoneNumber: true,
          },
        },
        shippingAddress: true,
        items: {
          include: {
            product: {
              select: {
                name: true,
                images: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: "asc" },
    });
  }

  // Retrieve the currently active delivery assignment for this agent
  async getActiveDelivery(userId: string) {
    const profile = await this.getProfile(userId);

    return prisma.delivery.findFirst({
      where: {
        deliveryProfileId: profile.id,
        status: {
          in: [DeliveryStatus.ASSIGNED, DeliveryStatus.PICKED_UP],
        },
      },
      include: {
        order: {
          include: {
            customer: {
              select: {
                name: true,
                email: true,
                phoneNumber: true,
              },
            },
            shippingAddress: true,
            items: {
              include: {
                product: {
                  select: {
                    name: true,
                    images: true,
                  },
                },
              },
            },
          },
        },
      },
    });
  }

  // Accept a package for delivery
  async acceptDelivery(userId: string, orderId: string): Promise<Delivery> {
    const profile = await this.getProfile(userId);
    if (!profile.isOnline) {
      throw new BadRequestError("You must toggle online status to accept delivery packages");
    }

    // Check if agent already has an active delivery
    const active = await this.getActiveDelivery(userId);
    if (active) {
      throw new BadRequestError("You already have an active package assignment in progress");
    }

    // Generate random 4-digit delivery confirmation OTP
    const otpCode = Math.floor(1000 + Math.random() * 9000).toString();

    // Verify order is PROCESSING (packed and ready)
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { delivery: true },
    });

    if (!order) {
      throw new NotFoundError("Order not found");
    }

    if (order.status !== OrderStatus.PROCESSING || order.delivery) {
      throw new BadRequestError("Order is not available for pickup assignment");
    }

    // Assign agent and create Delivery entry
    const delivery = await prisma.delivery.create({
      data: {
        orderId,
        deliveryProfileId: profile.id,
        status: DeliveryStatus.ASSIGNED,
        otpCode,
      },
    });

    // Update order status to SHIPPED (accepted by courier)
    await prisma.order.update({
      where: { id: orderId },
      data: { status: OrderStatus.SHIPPED },
    });

    return delivery;
  }

  // Transition package status from ASSIGNED to PICKED_UP (picked up from seller store)
  async pickupPackage(userId: string, orderId: string) {
    const profile = await this.getProfile(userId);
    const delivery = await prisma.delivery.findUnique({
      where: { orderId },
    });

    if (!delivery || delivery.deliveryProfileId !== profile.id) {
      throw new BadRequestError("This delivery is not assigned to you");
    }

    if (delivery.status !== DeliveryStatus.ASSIGNED) {
      throw new BadRequestError("Order package has already been picked up");
    }

    const updated = await prisma.delivery.update({
      where: { id: delivery.id },
      data: {
        status: DeliveryStatus.PICKED_UP,
        pickupTime: new Date(),
      },
    });

    // Update global order status to OUT_FOR_DELIVERY
    await prisma.order.update({
      where: { id: orderId },
      data: { status: OrderStatus.OUT_FOR_DELIVERY },
    });

    return updated;
  }

  // Complete delivery by verifying OTP code
  async completeDelivery(userId: string, orderId: string, otpCode: string) {
    const profile = await this.getProfile(userId);
    const delivery = await prisma.delivery.findUnique({
      where: { orderId },
    });

    if (!delivery || delivery.deliveryProfileId !== profile.id) {
      throw new BadRequestError("This delivery is not assigned to you");
    }

    if (delivery.status !== DeliveryStatus.PICKED_UP) {
      throw new BadRequestError("Cannot complete delivery. Pack must be picked up first.");
    }

    if (delivery.otpCode !== otpCode) {
      throw new BadRequestError("Invalid delivery confirmation OTP code");
    }

    const updated = await prisma.delivery.update({
      where: { id: delivery.id },
      data: {
        status: DeliveryStatus.DELIVERED,
        deliveryTime: new Date(),
      },
    });

    // Update global order status to DELIVERED
    await prisma.order.update({
      where: { id: orderId },
      data: { status: OrderStatus.DELIVERED },
    });

    return updated;
  }
}
