import { NextRequest } from "next/server";
import { AuthService } from "@/services/AuthService";
import { handleApiError, handleApiSuccess } from "@/utils/api";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { phoneNumber } = body;

    const authService = new AuthService();
    const result = await authService.sendOtp(phoneNumber);

    return handleApiSuccess(result, "OTP code sent");
  } catch (error) {
    return handleApiError(error);
  }
}
