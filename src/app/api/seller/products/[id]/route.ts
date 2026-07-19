import { NextRequest } from "next/server";
import { cookies } from "next/headers";
import { JwtService } from "@/core/auth/jwt";
import { SellerService } from "@/services/SellerService";
import { handleApiError, handleApiSuccess } from "@/utils/api";
import { UnauthorizedError, ForbiddenError } from "@/core/exceptions";
import { z } from "zod";

interface RouteParams {
  params: Promise<{ id: string }>;
}

const productUpdateSchema = z.object({
  name: z.string().min(2, "Product name must be at least 2 characters").optional(),
  description: z.string().min(10, "Description must be at least 10 characters").optional(),
  price: z.number().positive("Price must be greater than 0").optional(),
  comparePrice: z.number().positive("Compare price must be greater than 0").optional(),
  stock: z.number().int().nonnegative("Stock cannot be negative").optional(),
  categoryId: z.string().uuid("Invalid category ID").optional(),
  images: z.array(z.string().url("Invalid image URL")).min(1, "At least one image is required").optional(),
  specifications: z.record(z.string(), z.string()).optional(),
  isActive: z.boolean().optional(),
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

export async function PUT(req: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const decoded = await checkSellerAuth();
    const body = await req.json();

    const parsed = productUpdateSchema.safeParse(body);
    if (!parsed.success) {
      return handleApiError(parsed.error);
    }

    const sellerService = new SellerService();
    const updated = await sellerService.updateProduct(decoded.id, id, parsed.data);

    return handleApiSuccess(updated, "Product updated successfully");
  } catch (error) {
    return handleApiError(error);
  }
}
