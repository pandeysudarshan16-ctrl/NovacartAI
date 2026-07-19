import { describe, it, expect, vi, beforeEach } from "vitest";
import { AuthService } from "../AuthService";
import { JwtService } from "@/core/auth/jwt";
import { 
  ConflictError, 
  UnauthorizedError, 
  ValidationError, 
  BadRequestError 
} from "@/core/exceptions";
import { Role } from "@prisma/client";
import bcrypt from "bcryptjs";

// Mock UserRepository instance
const mockUserRepositoryInstance = {
  findByEmail: vi.fn(),
  findByPhoneNumber: vi.fn(),
  create: vi.fn(),
  update: vi.fn(),
};

vi.mock("@/repositories/UserRepository", () => {
  return {
    UserRepository: vi.fn().mockImplementation(function () {
      return mockUserRepositoryInstance;
    }),
  };
});

describe("AuthService", () => {
  let authService: AuthService;
  let mockUserRepository: typeof mockUserRepositoryInstance;

  beforeEach(() => {
    vi.clearAllMocks();
    authService = new AuthService();
    mockUserRepository = (authService as unknown as { userRepository: typeof mockUserRepositoryInstance }).userRepository;
  });

  describe("register", () => {
    it("should successfully register a customer and return user details and token", async () => {
      const mockUserInput = {
        name: "Test User",
        email: "test@novacart.ai",
        password: "password123",
        role: Role.CUSTOMER,
      };

      const mockDbUser = {
        id: "user-id-123",
        name: "Test User",
        email: "test@novacart.ai",
        phoneNumber: null,
        role: Role.CUSTOMER,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockUserRepository.findByEmail.mockResolvedValue(null);
      mockUserRepository.create.mockResolvedValue(mockDbUser);

      const result = await authService.register(mockUserInput);

      expect(mockUserRepository.findByEmail).toHaveBeenCalledWith("test@novacart.ai");
      expect(mockUserRepository.create).toHaveBeenCalled();
      expect(result.user).toEqual({
        id: "user-id-123",
        name: "Test User",
        email: "test@novacart.ai",
        phoneNumber: null,
        role: Role.CUSTOMER,
        createdAt: expect.any(Date),
        updatedAt: expect.any(Date),
      });
      expect(result.token).toBeDefined();
      
      const decoded = JwtService.verify(result.token);
      expect(decoded.id).toBe("user-id-123");
      expect(decoded.role).toBe(Role.CUSTOMER);
    });

    it("should throw ValidationError if email is invalid", async () => {
      const mockUserInput = {
        name: "Test User",
        email: "invalid-email",
        password: "password123",
        role: Role.CUSTOMER,
      };

      await expect(authService.register(mockUserInput)).rejects.toThrow(ValidationError);
    });

    it("should throw ConflictError if email is already registered", async () => {
      const mockUserInput = {
        name: "Test User",
        email: "taken@novacart.ai",
        password: "password123",
        role: Role.CUSTOMER,
      };

      mockUserRepository.findByEmail.mockResolvedValue({ id: "existing-user-id" });

      await expect(authService.register(mockUserInput)).rejects.toThrow(ConflictError);
    });
  });

  describe("login", () => {
    it("should log in user and return user details and token", async () => {
      const mockLoginInput = {
        email: "test@novacart.ai",
        password: "password123",
      };

      // Hash password using bcrypt manually for test
      const passwordHash = await bcrypt.hash("password123", 10);

      const mockDbUser = {
        id: "user-id-123",
        name: "Test User",
        email: "test@novacart.ai",
        passwordHash,
        role: Role.CUSTOMER,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockUserRepository.findByEmail.mockResolvedValue(mockDbUser);

      const result = await authService.login(mockLoginInput);

      expect(mockUserRepository.findByEmail).toHaveBeenCalledWith("test@novacart.ai");
      expect(result.user.id).toBe("user-id-123");
      expect(result.token).toBeDefined();
    });

    it("should throw UnauthorizedError if password is incorrect", async () => {
      const mockLoginInput = {
        email: "test@novacart.ai",
        password: "wrongpassword",
      };

      const passwordHash = await bcrypt.hash("password123", 10);

      const mockDbUser = {
        id: "user-id-123",
        name: "Test User",
        email: "test@novacart.ai",
        passwordHash,
        role: Role.CUSTOMER,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockUserRepository.findByEmail.mockResolvedValue(mockDbUser);

      await expect(authService.login(mockLoginInput)).rejects.toThrow(UnauthorizedError);
    });

    it("should throw UnauthorizedError if user does not exist", async () => {
      const mockLoginInput = {
        email: "notfound@novacart.ai",
        password: "password123",
      };

      mockUserRepository.findByEmail.mockResolvedValue(null);

      await expect(authService.login(mockLoginInput)).rejects.toThrow(UnauthorizedError);
    });
  });

  describe("loginWithGoogle", () => {
    it("should find and log in existing Google user", async () => {
      const mockDbUser = {
        id: "user-id-123",
        name: "Google User",
        email: "google@novacart.ai",
        passwordHash: null,
        role: Role.CUSTOMER,
      };

      mockUserRepository.findByEmail.mockResolvedValue(mockDbUser);

      const result = await authService.loginWithGoogle("google@novacart.ai", "Google User");

      expect(mockUserRepository.findByEmail).toHaveBeenCalledWith("google@novacart.ai");
      expect(mockUserRepository.create).not.toHaveBeenCalled();
      expect(result.user.id).toBe("user-id-123");
    });

    it("should register and log in new Google user", async () => {
      const mockDbUser = {
        id: "new-user-id",
        name: "New Google User",
        email: "newgoogle@novacart.ai",
        passwordHash: null,
        role: Role.CUSTOMER,
      };

      mockUserRepository.findByEmail.mockResolvedValue(null);
      mockUserRepository.create.mockResolvedValue(mockDbUser);

      const result = await authService.loginWithGoogle("newgoogle@novacart.ai", "New Google User");

      expect(mockUserRepository.findByEmail).toHaveBeenCalledWith("newgoogle@novacart.ai");
      expect(mockUserRepository.create).toHaveBeenCalled();
      expect(result.user.id).toBe("new-user-id");
    });
  });

  describe("OTP login flow", () => {
    it("should generate, send and verify OTP code successfully", async () => {
      const phoneNumber = "+919876543210";
      
      // Send OTP
      const sendResult = await authService.sendOtp(phoneNumber);
      expect(sendResult.message).toContain("OTP sent successfully");
      expect(sendResult.mockOtp).toBeDefined();
      expect(sendResult.mockOtp.length).toBe(6);

      const mockDbUser = {
        id: "otp-user-id",
        name: "OTP User",
        email: "phone_919876543210@novacart.ai",
        phoneNumber: phoneNumber,
        passwordHash: null,
        role: Role.CUSTOMER,
      };

      // Verify OTP - existing user
      mockUserRepository.findByPhoneNumber.mockResolvedValue(mockDbUser);
      const verifyResult = await authService.verifyOtp(phoneNumber, sendResult.mockOtp);

      expect(mockUserRepository.findByPhoneNumber).toHaveBeenCalledWith(phoneNumber);
      expect(verifyResult.user.id).toBe("otp-user-id");
      expect(verifyResult.token).toBeDefined();
    });

    it("should throw BadRequestError if phone format is invalid for sending OTP", async () => {
      await expect(authService.sendOtp("abc")).rejects.toThrow(BadRequestError);
    });

    it("should throw UnauthorizedError for incorrect OTP verification code", async () => {
      const phoneNumber = "+919876543210";
      await authService.sendOtp(phoneNumber);
      
      await expect(authService.verifyOtp(phoneNumber, "000000")).rejects.toThrow(UnauthorizedError);
    });
  });
});
