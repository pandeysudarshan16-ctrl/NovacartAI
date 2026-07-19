import { NextRequest } from "next/server";
import { cookies } from "next/headers";
import { JwtService } from "@/core/auth/jwt";
import { CartService } from "@/services/CartService";
import { handleApiError, handleApiSuccess } from "@/utils/api";
import { UnauthorizedError } from "@/core/exceptions";
import { z } from "zod";

const cartAddSchema = z.object({
  productId: z.string().uuid("Invalid product ID"),
  quantity: z.number().int().min(1, "Quantity must be at least 1").default(1),
});

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    if (!token) {
      throw new UnauthorizedError("Please login to view your cart");
    }

    const decoded = JwtService.verify(token);
    const cartService = new CartService();
    const cartItems = await cartService.getCart(decoded.id);

    return handleApiSuccess(cartItems);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(req: NextRequest) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    if (!token) {
      throw new UnauthorizedError("Please login to add items to your cart");
    }

    const decoded = JwtService.verify(token);
    const body = await req.json();
    
    const parsed = cartAddSchema.safeParse(body);
    if (!parsed.success) {
      return handleApiError(parsed.error);
    }

    const { productId, quantity } = parsed.data;
    const cartService = new CartService();
    const cartItem = await cartService.addToCart(decoded.id, productId, quantity);

    return handleApiSuccess(cartItem, "Item added to cart successfully", 201);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    if (!token) {
      throw new UnauthorizedError("Please login to clear your cart");
    }

    const decoded = JwtService.verify(token);
    const cartService = new CartService();
    await cartService.clearCart(decoded.id);

    return handleApiSuccess(null, "Cart cleared successfully");
  } catch (error) {
    return handleApiError(error);
  }
}
