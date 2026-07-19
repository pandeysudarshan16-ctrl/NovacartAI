"use client";

import React, { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { apiClient } from "@/lib/api-client";
import { 
  Truck, 
  LogOut, 
  Loader2,
  Power,
  ChevronDown
} from "lucide-react";

interface DeliveryProfileData {
  id: string;
  isOnline: boolean;
  vehicleType: string;
  vehicleNumber: string | null;
}

export default function DeliveryLayout({ children }: { children: React.ReactNode }) {
  const { user, loading, logout } = useAuth();
  const router = useRouter();
  
  const [profile, setProfile] = useState<DeliveryProfileData | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [togglingOnline, setTogglingOnline] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const profileDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (profileDropdownRef.current && !profileDropdownRef.current.contains(event.target as Node)) {
        setProfileDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Authorization check
  useEffect(() => {
    if (!loading && (!user || user.role !== "DELIVERY_PARTNER")) {
      router.push("/login");
    }
  }, [user, loading, router]);

  const loadProfile = async () => {
    try {
      const data = await apiClient.get<DeliveryProfileData>("/api/delivery/profile");
      setProfile(data);
    } catch (err) {
      console.error("Failed to load delivery profile:", err);
    } finally {
      setLoadingProfile(false);
    }
  };

  useEffect(() => {
    if (user && user.role === "DELIVERY_PARTNER") {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      loadProfile();
    }
  }, [user]);

  const handleToggleOnline = async () => {
    if (!profile) return;
    setTogglingOnline(true);
    try {
      const updated = await apiClient.put<DeliveryProfileData>("/api/delivery/profile", {
        isOnline: !profile.isOnline,
      });
      setProfile(updated);
    } catch (err) {
      console.error("Failed to toggle online status", err);
    } finally {
      setTogglingOnline(false);
    }
  };

  if (loading || (user && user.role === "DELIVERY_PARTNER" && loadingProfile)) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background text-foreground">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-xs text-muted-foreground font-semibold">Verifying delivery logs...</p>
        </div>
      </div>
    );
  }

  if (!user || user.role !== "DELIVERY_PARTNER") {
    return null;
  }

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      
      {/* Sticky Premium Header */}
      <header className="sticky top-0 z-40 w-full border-b border-white/5 bg-card/85 backdrop-blur-md">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between gap-4">
            
            {/* Logo */}
            <div className="flex items-center">
              <Link href="/delivery" className="flex items-center gap-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-tr from-primary to-purple-600 shadow shadow-primary/20">
                  <Truck className="h-4 w-4 text-white" />
                </div>
                <span className="text-sm font-bold text-white tracking-wide">
                  NovaCart<span className="text-primary">Logistics</span>
                </span>
              </Link>
            </div>

            {/* Online Status Toggle */}
            {profile && (
              <div className="flex items-center gap-2">
                <button
                  onClick={handleToggleOnline}
                  disabled={togglingOnline}
                  className={`flex h-9 items-center gap-2 px-4 rounded-xl text-xs font-semibold transition border duration-200 ${
                    profile.isOnline
                      ? "bg-secondary/15 border-secondary/20 text-secondary hover:bg-secondary/25"
                      : "bg-white/5 border-white/5 text-muted-foreground hover:bg-white/10"
                  }`}
                >
                  <Power className={`h-3.5 w-3.5 ${profile.isOnline ? "animate-pulse" : ""}`} />
                  {profile.isOnline ? "Available (Online)" : "Go Online"}
                </button>
              </div>
            )}

            {/* Account dropdown */}
            <div className="flex items-center gap-3">
              <div className="relative" ref={profileDropdownRef}>
                <button
                  onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                  className="flex items-center gap-1.5 p-1 rounded-full hover:bg-white/5 border border-white/10"
                >
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-tr from-purple-600 to-indigo-600 font-bold text-xs text-white">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <ChevronDown className="h-3 w-3 text-muted-foreground" />
                </button>

                {profileDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 rounded-xl border border-white/10 bg-card p-2 shadow-xl z-50">
                    <button
                      onClick={logout}
                      className="flex w-full items-center gap-2 px-3 py-2 rounded-lg text-xs hover:bg-destructive/10 text-destructive transition text-left"
                    >
                      <LogOut className="h-3.5 w-3.5" />
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            </div>

          </div>
        </div>
      </header>

      {/* Main page container */}
      <main className="flex-1 flex flex-col mx-auto max-w-4xl px-4 py-8 sm:px-6 w-full gap-6">
        {children}
      </main>

    </div>
  );
}
