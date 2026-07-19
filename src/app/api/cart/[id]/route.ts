import { NextRequest } from "next/server";
import { cookies } from "next/headers";
import { JwtService } from "@/core/auth/jwt";
import { CartService } from "@/services/CartService";
import { handleApiError, handleApiSuccess } from "@/utils/api";
import { UnauthorizedError } from "@/core/exceptions";
import { z } from "zod";

interface RouteParams {
  params: Promise<{ id: string }>;
}

const updateSchema = z.object({
  quantity: z.number().int().min(1, "Quantity must be at least 1"),
});

export async function PUT(req: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    if (!token) {
      throw new UnauthorizedError("Please login to update cart items");
    }

    const decoded = JwtService.verify(token);
    const body = await req.json();

    const parsed = updateSchema.safeParse(body);
    if (!parsed.success) {
      return handleApiError(parsed.error);
    }

    const cartService = new CartService();
    const updatedItem = await cartService.updateQuantity(decoded.id, id, parsed.data.quantity);

    return handleApiSuccess(updatedItem, "Cart item updated successfully");
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(_req: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    if (!token) {
      throw new UnauthorizedError("Please login to remove cart items");
    }

    const decoded = JwtService.verify(token);
    const cartService = new CartService();
    await cartService.removeItem(decoded.id, id);

    return handleApiSuccess(null, "Cart item removed successfully");
  } catch (error) {
    return handleApiError(error);
  }
}
