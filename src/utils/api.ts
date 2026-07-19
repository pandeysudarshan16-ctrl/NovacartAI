import { AppError } from "@/core/exceptions";
import { logger } from "@/utils/logger";
import { NextResponse } from "next/server";

export function handleApiError(error: unknown) {
  if (error instanceof AppError) {
    if (error.statusCode >= 500) {
      logger.error(`App Server Error: ${error.message}`, error);
    } else {
      logger.warn(`App Client Error (${error.statusCode}): ${error.message}`, error.details);
    }

    return NextResponse.json(
      {
        success: false,
        error: error.message,
        ...(error.details ? { details: error.details } : {}),
      },
      { status: error.statusCode }
    );
  }

  logger.error("Unhandled Internal Server Error", error);
  
  return NextResponse.json(
    {
      success: false,
      error: "An unexpected error occurred. Please try again later.",
    },
    { status: 500 }
  );
}

export function handleApiSuccess<T>(data: T, message?: string, status = 200) {
  return NextResponse.json(
    {
      success: true,
      ...(message ? { message } : {}),
      data,
    },
    { status }
  );
}
