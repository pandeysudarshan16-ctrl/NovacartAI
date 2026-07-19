import { cookies } from "next/headers";
import { JwtService } from "@/core/auth/jwt";
import { SellerService } from "@/services/SellerService";
import { handleApiError, handleApiSuccess } from "@/utils/api";
import { UnauthorizedError, ForbiddenError } from "@/core/exceptions";

async function checkSellerAuth() {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  if (!token) {
    throw new UnauthorizedError("Please login to access seller features");
  }

  const decoded = JwtService.verify(token);
  if (decoded.role !== "SELLER") {
    throw new ForbiddenError("Access restricted to Seller accounts only");
  }

  return decoded;
}

export async function GET() {
  try {
    const decoded = await checkSellerAuth();
    const sellerService = new SellerService();
    const orders = await sellerService.getOrders(decoded.id);

    return handleApiSuccess(orders);
  } catch (error) {
    return handleApiError(error);
  }
}
