import jwt from "jsonwebtoken";
import { config } from "@/core/config";
import { UnauthorizedError } from "@/core/exceptions";
import { Role } from "@prisma/client";

export interface JwtPayload {
  id: string;
  email: string;
  role: Role;
  name: string;
}

export class JwtService {
  private static readonly secret = config.JWT_SECRET;
  private static readonly expiresIn = config.JWT_EXPIRES_IN;

  public static sign(payload: JwtPayload): string {
    return jwt.sign(payload, this.secret, {
      expiresIn: this.expiresIn as jwt.SignOptions["expiresIn"],
    });
  }

  public static verify(token: string): JwtPayload {
    try {
      const decoded = jwt.verify(token, this.secret) as JwtPayload;
      return decoded;
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        throw new UnauthorizedError("Session has expired. Please login again.");
      }
      throw new UnauthorizedError("Invalid authentication token.");
    }
  }
}
