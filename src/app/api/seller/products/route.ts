import { NextRequest } from "next/server";
import { cookies } from "next/headers";
import { JwtService } from "@/core/auth/jwt";
import { SellerService } from "@/services/SellerService";
import { handleApiError, handleApiSuccess } from "@/utils/api";
import { UnauthorizedError, ForbiddenError } from "@/core/exceptions";
import { z } from "zod";

const productCreateSchema = z.object({
  name: z.string().min(2, "Product name must be at least 2 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  price: z.number().positive("Price must be greater than 0"),
  comparePrice: z.number().positive("Compare price must be greater than 0").optional(),
  stock: z.number().int().nonnegative("Stock cannot be negative"),
  categoryId: z.string().uuid("Invalid category ID"),
  images: z.array(z.string().url("Invalid image URL")).min(1, "At least one image is required"),
  specifications: z.record(z.string(), z.string()).optional(),
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
    const products = await sellerService.getProducts(decoded.id);

    return handleApiSuccess(products);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(req: NextRequest) {
  try {
    const decoded = await checkSellerAuth();
    const body = await req.json();

    const parsed = productCreateSchema.safeParse(body);
    if (!parsed.success) {
      return handleApiError(parsed.error);
    }

    const sellerService = new SellerService();
    const product = await sellerService.createProduct(decoded.id, parsed.data);

    return handleApiSuccess(product, "Product created successfully and pending review", 201);
  } catch (error) {
    return handleApiError(error);
  }
}
