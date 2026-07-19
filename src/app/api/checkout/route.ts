import { NextRequest } from "next/server";
import { cookies } from "next/headers";
import { JwtService } from "@/core/auth/jwt";
import { CheckoutService } from "@/services/CheckoutService";
import { handleApiError, handleApiSuccess } from "@/utils/api";
import { UnauthorizedError } from "@/core/exceptions";
import { z } from "zod";

const checkoutSchema = z.object({
  street: z.string().min(2, "Street address must be at least 2 characters"),
  city: z.string().min(2, "City must be at least 2 characters"),
  state: z.string().min(2, "State must be at least 2 characters"),
  postalCode: z.string().min(4, "Postal code must be at least 4 characters"),
  country: z.string().min(2, "Country must be at least 2 characters"),
});

export async function POST(req: NextRequest) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    if (!token) {
      throw new UnauthorizedError("Please login to proceed with checkout");
    }

    const decoded = JwtService.verify(token);
    const body = await req.json();

    const parsed = checkoutSchema.safeParse(body);
    if (!parsed.success) {
      return handleApiError(parsed.error);
    }

    const checkoutService = new CheckoutService();
    const order = await checkoutService.processCheckout(decoded.id, parsed.data);

    return handleApiSuccess(order, "Order placed successfully", 201);
  } catch (error) {
    return handleApiError(error);
  }
}
