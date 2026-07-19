import { cookies } from "next/headers";
import { JwtService } from "@/core/auth/jwt";
import { AdminService } from "@/services/AdminService";
import { handleApiError, handleApiSuccess } from "@/utils/api";
import { UnauthorizedError, ForbiddenError } from "@/core/exceptions";

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
    const metrics = await adminService.getMetrics();

    return handleApiSuccess(metrics);
  } catch (error) {
    return handleApiError(error);
  }
}
