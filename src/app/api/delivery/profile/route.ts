import { NextRequest } from "next/server";
import { cookies } from "next/headers";
import { JwtService } from "@/core/auth/jwt";
import { DeliveryService } from "@/services/DeliveryService";
import { handleApiError, handleApiSuccess } from "@/utils/api";
import { UnauthorizedError, ForbiddenError } from "@/core/exceptions";
import { z } from "zod";

const profileUpdateSchema = z.object({
  isOnline: z.boolean().optional(),
  vehicleType: z.string().min(2).optional(),
  vehicleNumber: z.string().optional(),
  licenseNumber: z.string().optional(),
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

export async function GET() {
  try {
    const decoded = await checkDeliveryAuth();
    const deliveryService = new DeliveryService();
    const profile = await deliveryService.getProfile(decoded.id);

    return handleApiSuccess(profile);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PUT(req: NextRequest) {
  try {
    const decoded = await checkDeliveryAuth();
    const body = await req.json();

    const parsed = profileUpdateSchema.safeParse(body);
    if (!parsed.success) {
      return handleApiError(parsed.error);
    }

    const deliveryService = new DeliveryService();
    const updated = await deliveryService.updateProfile(decoded.id, parsed.data);

    return handleApiSuccess(updated, "Delivery partner profile updated successfully");
  } catch (error) {
    return handleApiError(error);
  }
}
