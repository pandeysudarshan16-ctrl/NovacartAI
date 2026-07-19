import { NextRequest } from "next/server";
import { cookies } from "next/headers";
import { JwtService } from "@/core/auth/jwt";
import { SellerService } from "@/services/SellerService";
import { handleApiError, handleApiSuccess } from "@/utils/api";
import { UnauthorizedError, ForbiddenError } from "@/core/exceptions";
import { z } from "zod";

const profileUpdateSchema = z.object({
  shopName: z.string().min(2, "Shop name must be at least 2 characters").optional(),
  shopDescription: z.string().optional(),
  gstin: z.string().optional(),
  taxId: z.string().optional(),
  shopLogo: z.string().url("Invalid URL").optional().or(z.literal("")),
  shopBanner: z.string().url("Invalid URL").optional().or(z.literal("")),
});

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
    const profile = await sellerService.getProfile(decoded.id);

    return handleApiSuccess(profile);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PUT(req: NextRequest) {
  try {
    const decoded = await checkSellerAuth();
    const body = await req.json();

    const parsed = profileUpdateSchema.safeParse(body);
    if (!parsed.success) {
      return handleApiError(parsed.error);
    }

    const sellerService = new SellerService();
    const updated = await sellerService.updateProfile(decoded.id, parsed.data);

    return handleApiSuccess(updated, "Seller profile updated successfully");
  } catch (error) {
    return handleApiError(error);
  }
}
