import { cookies } from "next/headers";
import { JwtService } from "@/core/auth/jwt";
import { DeliveryService } from "@/services/DeliveryService";
import { handleApiError, handleApiSuccess } from "@/utils/api";
import { UnauthorizedError, ForbiddenError } from "@/core/exceptions";

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
    const active = await deliveryService.getActiveDelivery(decoded.id);

    return handleApiSuccess(active);
  } catch (error) {
    return handleApiError(error);
  }
}
