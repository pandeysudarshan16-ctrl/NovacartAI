"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { apiClient } from "@/lib/api-client";
import { Role } from "@prisma/client";

// Define the User representation exposed to the client
export interface ClientUser {
  id: string;
  email: string;
  name: string;
  phoneNumber: string | null;
  role: Role;
  createdAt: string;
  updatedAt: string;
  profile?: {
    avatarUrl: string | null;
  } | null;
  sellerProfile?: {
    shopName: string;
    shopDescription: string | null;
    verificationStatus: string;
  } | null;
  deliveryProfile?: {
    vehicleType: string;
    isOnline: boolean;
  } | null;
}

interface AuthContextType {
  user: ClientUser | null;
  loading: boolean;
  login: (credentials: unknown) => Promise<void>;
  register: (userData: unknown) => Promise<void>;
  logout: () => Promise<void>;
  sendOtp: (phoneNumber: string) => Promise<{ mockOtp: string }>;
  verifyOtp: (phoneNumber: string, code: string) => Promise<void>;
  refreshSession: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<ClientUser | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshSession = useCallback(async () => {
    try {
      const data = await apiClient.get<ClientUser | null>("/api/auth/session");
      setUser(data);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    refreshSession();
  }, [refreshSession]);

  const login = async (credentials: unknown) => {
    setLoading(true);
    try {
      const loggedUser = await apiClient.post<ClientUser>("/api/auth/login", credentials);
      setUser(loggedUser);
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData: unknown) => {
    setLoading(true);
    try {
      const newUser = await apiClient.post<ClientUser>("/api/auth/register", userData);
      setUser(newUser);
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      await apiClient.post("/api/auth/logout");
      setUser(null);
      window.location.href = "/login";
    } catch {
      setUser(null);
      window.location.href = "/login";
    } finally {
      setLoading(false);
    }
  };

  const sendOtp = async (phoneNumber: string) => {
    return apiClient.post<{ message: string; mockOtp: string }>("/api/auth/otp/send", { phoneNumber });
  };

  const verifyOtp = async (phoneNumber: string, code: string) => {
    setLoading(true);
    try {
      const loggedUser = await apiClient.post<ClientUser>("/api/auth/otp/verify", { phoneNumber, code });
      setUser(loggedUser);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        logout,
        sendOtp,
        verifyOtp,
        refreshSession,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
