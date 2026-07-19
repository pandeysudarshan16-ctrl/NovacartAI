import { NextRequest } from "next/server";
import { AuthService } from "@/services/AuthService";
import { handleApiError, handleApiSuccess } from "@/utils/api";
import { cookies } from "next/headers";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const authService = new AuthService();
    const { user, token } = await authService.register(body);

    // Set HTTP-only session cookie (Next.js 15+ cookies() must be awaited)
    const cookieStore = await cookies();
    cookieStore.set("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60, // 7 days
      path: "/",
    });

    return handleApiSuccess(user, "User registered successfully", 21);
  } catch (error) {
    return handleApiError(error);
  }
}
