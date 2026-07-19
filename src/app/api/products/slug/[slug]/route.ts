import { NextRequest } from "next/server";
import { ProductService } from "@/services/ProductService";
import { handleApiError, handleApiSuccess } from "@/utils/api";

interface RouteParams {
  params: Promise<{ slug: string }>;
}

export async function GET(_req: NextRequest, { params }: RouteParams) {
  try {
    const { slug } = await params;
    const productService = new ProductService();
    const product = await productService.getProductBySlug(slug);
    return handleApiSuccess(product);
  } catch (error) {
    return handleApiError(error);
  }
}
