import { NextRequest } from "next/server";
import { AuthService } from "@/services/AuthService";
import { handleApiError, handleApiSuccess } from "@/utils/api";
import { cookies } from "next/headers";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { phoneNumber, code } = body;

    const authService = new AuthService();
    const { user, token } = await authService.verifyOtp(phoneNumber, code);

    const cookieStore = await cookies();
    cookieStore.set("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60, // 7 days
      path: "/",
    });

    return handleApiSuccess(user, "Authenticated successfully via OTP");
  } catch (error) {
    return handleApiError(error);
  }
}
