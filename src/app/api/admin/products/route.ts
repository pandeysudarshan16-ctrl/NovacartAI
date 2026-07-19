import { NextRequest } from "next/server";
import { cookies } from "next/headers";
import { JwtService } from "@/core/auth/jwt";
import { AdminService } from "@/services/AdminService";
import { handleApiError, handleApiSuccess } from "@/utils/api";
import { UnauthorizedError, ForbiddenError } from "@/core/exceptions";
import { z } from "zod";

const productVerifySchema = z.object({
  productId: z.string().uuid("Invalid product ID"),
  status: z.enum(["PENDING", "APPROVED", "REJECTED"], { message: "Invalid verification status" }),
});

async function checkAdminAuth() {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  if (!token) {
    throw new UnauthorizedError("Please login to access admin features");
  }

  const decoded = JwtService.verify(token);
  if (decoded.role !== "ADMIN") {
    throw new ForbiddenError("Access restricted to Platform Administrator accounts only");
  }

  return decoded;
}

export async function GET() {
  try {
    await checkAdminAuth();
    const adminService = new AdminService();
    const products = await adminService.getProducts();

    return handleApiSuccess(products);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PUT(req: NextRequest) {
  try {
    await checkAdminAuth();
    const body = await req.json();

    const parsed = productVerifySchema.safeParse(body);
    if (!parsed.success) {
      return handleApiError(parsed.error);
    }

    const adminService = new AdminService();
    const updated = await adminService.updateProductVerification(parsed.data.productId, parsed.data.status);

    return handleApiSuccess(updated, `Product status updated to ${parsed.data.status}`);
  } catch (error) {
    return handleApiError(error);
  }
}
