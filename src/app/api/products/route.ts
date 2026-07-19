import { NextRequest } from "next/server";
import { ProductService } from "@/services/ProductService";
import { handleApiError, handleApiSuccess } from "@/utils/api";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = req.nextUrl;
    const categorySlug = searchParams.get("categorySlug") || undefined;
    const query = searchParams.get("query") || undefined;
    const minPrice = searchParams.get("minPrice") || undefined;
    const maxPrice = searchParams.get("maxPrice") || undefined;
    const sort = searchParams.get("sort") || undefined;
    const page = searchParams.get("page") || undefined;
    const limit = searchParams.get("limit") || undefined;

    const productService = new ProductService();
    const result = await productService.getProducts({
      categorySlug,
      query,
      minPrice,
      maxPrice,
      sort,
      page,
      limit,
    });

    return handleApiSuccess(result);
  } catch (error) {
    return handleApiError(error);
  }
}
