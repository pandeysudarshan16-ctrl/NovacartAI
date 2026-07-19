import { cookies } from "next/headers";
import { handleApiError, handleApiSuccess } from "@/utils/api";

export async function POST() {
  try {
    const cookieStore = await cookies();
    cookieStore.set("token", "", {
      path: "/",
      maxAge: 0,
      expires: new Date(0),
    });
    return handleApiSuccess(null, "Logged out successfully");
  } catch (error) {
    return handleApiError(error);
  }
}
