import { cookies } from "next/headers";
import { JwtService } from "@/core/auth/jwt";
import { UserRepository } from "@/repositories/UserRepository";
import { handleApiError, handleApiSuccess } from "@/utils/api";

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    if (!token) {
      return handleApiSuccess(null, "No active session");
    }

    const decoded = JwtService.verify(token);
    const userRepository = new UserRepository();
    const user = await userRepository.findById(decoded.id);

    if (!user) {
      return handleApiSuccess(null, "User session invalid");
    }

    const userWithoutPassword = { ...user } as Record<string, unknown>;
    delete userWithoutPassword.passwordHash;
    return handleApiSuccess(userWithoutPassword, "Active session retrieved");
  } catch (error) {
    return handleApiError(error);
  }
}
