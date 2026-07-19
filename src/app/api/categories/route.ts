import { prisma } from "@/core/database/prisma";
import { handleApiError, handleApiSuccess } from "@/utils/api";

export async function GET() {
  try {
    const categories = await prisma.category.findMany({
      orderBy: { name: "asc" },
    });
    return handleApiSuccess(categories);
  } catch (error) {
    return handleApiError(error);
  }
}
