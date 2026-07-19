import { NextRequest } from "next/server";
import { cookies } from "next/headers";
import { JwtService } from "@/core/auth/jwt";
import { SellerService } from "@/services/SellerService";
import { handleApiError, handleApiSuccess } from "@/utils/api";
import { UnauthorizedError, ForbiddenError } from "@/core/exceptions";

interface RouteParams {
  params: Promise<{ id: string }>;
}

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

export async function PUT(_req: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const decoded = await checkSellerAuth();
    const sellerService = new SellerService();
    const updated = await sellerService.fulfillOrder(decoded.id, id);

    return handleApiSuccess(updated, "Order status marked as ready for delivery partner pickup");
  } catch (error) {
    return handleApiError(error);
  }
}
