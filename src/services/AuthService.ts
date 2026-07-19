import bcrypt from "bcryptjs";
import { UserRepository } from "@/repositories/UserRepository";
import { JwtService, JwtPayload } from "@/core/auth/jwt";
import { 
  ConflictError, 
  UnauthorizedError, 
  BadRequestError, 
  ValidationError 
} from "@/core/exceptions";
import { Role, User } from "@prisma/client";
import { z } from "zod";
import { logger } from "@/utils/logger";

const registerSchema = z.object({
  email: z.string().email("Invalid email format"),
  name: z.string().min(2, "Name must be at least 2 characters"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  phoneNumber: z.string().regex(/^\+?[1-9]\d{1,14}$/, "Invalid phone number format").optional(),
  role: z.nativeEnum(Role).default(Role.CUSTOMER),
});

const loginSchema = z.object({
  email: z.string().email("Invalid email format"),
  password: z.string().min(1, "Password is required"),
});

// In-memory OTP cache for development/mocking (maps phone number to { otp, expiresAt })
const otpCache = new Map<string, { otp: string; expiresAt: number }>();

export class AuthService {
  private userRepository = new UserRepository();

  async register(input: z.infer<typeof registerSchema>): Promise<{ user: Omit<User, "passwordHash">; token: string }> {
    const parseResult = registerSchema.safeParse(input);
    if (!parseResult.success) {
      throw new ValidationError("Registration validation failed", parseResult.error.format());
    }

    const { email, name, password, phoneNumber, role } = parseResult.data;

    // Check email uniqueness
    const existingUserByEmail = await this.userRepository.findByEmail(email);
    if (existingUserByEmail) {
      throw new ConflictError("Email is already registered");
    }

    // Check phone number uniqueness if provided
    if (phoneNumber) {
      const existingUserByPhone = await this.userRepository.findByPhoneNumber(phoneNumber);
      if (existingUserByPhone) {
        throw new ConflictError("Phone number is already registered");
      }
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // Create user with corresponding role profiles
    logger.info(`Creating new user with email ${email} and role ${role}`);
    const user = await this.userRepository.create({
      email,
      name,
      passwordHash,
      phoneNumber,
      role,
      profile: {
        create: {}, // Blank user profile
      },
      ...(role === Role.SELLER ? {
        sellerProfile: {
          create: {
            shopName: `${name}'s Shop`, // Temporary placeholder shop name
          }
        }
      } : {}),
      ...(role === Role.DELIVERY_PARTNER ? {
        deliveryProfile: {
          create: {
            vehicleType: "MOTORCYCLE" // Default vehicle type
          }
        }
      } : {}),
    });

    const tokenPayload: JwtPayload = {
      id: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
    };
    const token = JwtService.sign(tokenPayload);

    const userWithoutPassword = { ...user } as Record<string, unknown>;
    delete userWithoutPassword.passwordHash;
    return { user: userWithoutPassword as Omit<User, "passwordHash">, token };
  }

  async login(input: z.infer<typeof loginSchema>): Promise<{ user: Omit<User, "passwordHash">; token: string }> {
    const parseResult = loginSchema.safeParse(input);
    if (!parseResult.success) {
      throw new ValidationError("Login validation failed", parseResult.error.format());
    }

    const { email, password } = parseResult.data;

    const user = await this.userRepository.findByEmail(email);
    if (!user || !user.passwordHash) {
      throw new UnauthorizedError("Invalid email or password");
    }

    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      throw new UnauthorizedError("Invalid email or password");
    }

    const tokenPayload: JwtPayload = {
      id: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
    };
    const token = JwtService.sign(tokenPayload);

    const userWithoutPassword = { ...user } as Record<string, unknown>;
    delete userWithoutPassword.passwordHash;
    return { user: userWithoutPassword as Omit<User, "passwordHash">, token };
  }

  async loginWithGoogle(email: string, name: string): Promise<{ user: Omit<User, "passwordHash">; token: string }> {
    if (!email) {
      throw new BadRequestError("Google email is required");
    }

    let user = await this.userRepository.findByEmail(email);

    if (!user) {
      logger.info(`Creating new user via Google OAuth: ${email}`);
      user = await this.userRepository.create({
        email,
        name,
        role: Role.CUSTOMER,
        profile: {
          create: {},
        },
      });
    }

    const tokenPayload: JwtPayload = {
      id: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
    };
    const token = JwtService.sign(tokenPayload);

    const userWithoutPassword = { ...user } as Record<string, unknown>;
    delete userWithoutPassword.passwordHash;
    return { user: userWithoutPassword as Omit<User, "passwordHash">, token };
  }

  async sendOtp(phoneNumber: string): Promise<{ message: string; mockOtp: string }> {
    if (!phoneNumber || !/^\+?[1-9]\d{1,14}$/.test(phoneNumber)) {
      throw new BadRequestError("Valid phone number is required");
    }

    // Generate 6 digit mock OTP code
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = Date.now() + 5 * 60 * 1000; // 5 minutes expiration

    otpCache.set(phoneNumber, { otp, expiresAt });
    logger.info(`[MOCK OTP] Sent code ${otp} to ${phoneNumber}`);

    // Return the OTP in development mode so the user can use it easily without an actual SMS integration setup
    return {
      message: "OTP sent successfully (mocked)",
      mockOtp: otp,
    };
  }

  async verifyOtp(phoneNumber: string, code: string): Promise<{ user: Omit<User, "passwordHash">; token: string }> {
    if (!phoneNumber || !code) {
      throw new BadRequestError("Phone number and OTP code are required");
    }

    const cached = otpCache.get(phoneNumber);
    if (!cached) {
      throw new UnauthorizedError("OTP request expired or not found");
    }

    if (Date.now() > cached.expiresAt) {
      otpCache.delete(phoneNumber);
      throw new UnauthorizedError("OTP has expired");
    }

    if (cached.otp !== code) {
      throw new UnauthorizedError("Invalid OTP code");
    }

    // OTP verified, clear it from cache
    otpCache.delete(phoneNumber);

    let user = await this.userRepository.findByPhoneNumber(phoneNumber);
    if (!user) {
      // Auto-register OTP user as Customer if they do not exist
      logger.info(`Auto-registering user with phone ${phoneNumber} via OTP login`);
      const tempEmail = `phone_${phoneNumber.replace("+", "")}@novacart.ai`;
      user = await this.userRepository.create({
        email: tempEmail,
        phoneNumber,
        name: `User ${phoneNumber}`,
        role: Role.CUSTOMER,
        profile: {
          create: {},
        },
      });
    }

    const tokenPayload: JwtPayload = {
      id: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
    };
    const token = JwtService.sign(tokenPayload);

    const userWithoutPassword = { ...user } as Record<string, unknown>;
    delete userWithoutPassword.passwordHash;
    return { user: userWithoutPassword as Omit<User, "passwordHash">, token };
  }
}
