import { NextRequest } from "next/server";
import { cookies } from "next/headers";
import { JwtService } from "@/core/auth/jwt";
import { DeliveryService } from "@/services/DeliveryService";
import { handleApiError, handleApiSuccess } from "@/utils/api";
import { UnauthorizedError, ForbiddenError } from "@/core/exceptions";
import { z } from "zod";

const pickupSchema = z.object({
  orderId: z.string().uuid("Invalid order ID"),
});

async function checkDeliveryAuth() {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  if (!token) {
    throw new UnauthorizedError("Please login to access delivery features");
  }

  const decoded = JwtService.verify(token);
  if (decoded.role !== "DELIVERY_PARTNER") {
    throw new ForbiddenError("Access restricted to Courier and Delivery Partners only");
  }

  return decoded;
}

export async function PUT(req: NextRequest) {
  try {
    const decoded = await checkDeliveryAuth();
    const body = await req.json();

    const parsed = pickupSchema.safeParse(body);
    if (!parsed.success) {
      return handleApiError(parsed.error);
    }

    const deliveryService = new DeliveryService();
    const updated = await deliveryService.pickupPackage(decoded.id, parsed.data.orderId);

    return handleApiSuccess(updated, "Package marked as picked up from vendor store");
  } catch (error) {
    return handleApiError(error);
  }
}
