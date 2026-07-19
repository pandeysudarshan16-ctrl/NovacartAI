"use client";

import React, { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { 
  LayoutDashboard, 
  Package, 
  ShoppingBag, 
  Settings, 
  ArrowLeft, 
  Store,
  Menu,
  X,
  Loader2,
  ChevronDown,
  LogOut
} from "lucide-react";

export default function SellerLayout({ children }: { children: React.ReactNode }) {
  const { user, loading, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
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
    if (!loading && (!user || user.role !== "SELLER")) {
      router.push("/login");
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background text-foreground">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-xs text-muted-foreground font-semibold">Verifying credentials...</p>
        </div>
      </div>
    );
  }

  if (!user || user.role !== "SELLER") {
    return null; // Let useEffect redirect
  }

  const navItems = [
    { name: "Overview", href: "/seller", icon: LayoutDashboard },
    { name: "Products", href: "/seller/products", icon: Package },
    { name: "Orders", href: "/seller/orders", icon: ShoppingBag },
    { name: "Shop Settings", href: "/seller/settings", icon: Settings },
  ];

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-64 border-r border-white/5 bg-card">
        {/* Brand */}
        <div className="flex h-16 items-center px-6 border-b border-white/5">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-tr from-primary to-purple-600 shadow shadow-primary/20">
              <Store className="h-4 w-4 text-white" />
            </div>
            <span className="text-sm font-bold text-white tracking-wide">
              NovaCart<span className="text-primary">Seller</span>
            </span>
          </Link>
        </div>

        {/* Links */}
        <nav className="flex-1 px-4 py-6 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-semibold tracking-wide transition ${
                  active 
                    ? "bg-primary text-white" 
                    : "text-muted-foreground hover:bg-white/5 hover:text-foreground"
                }`}
              >
                <Icon className="h-4 w-4" />
                {item.name}
              </Link>
            );
          })}
        </nav>

        {/* Return to shop */}
        <div className="p-4 border-t border-white/5">
          <Link
            href="/"
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold text-muted-foreground hover:text-white transition hover:bg-white/5"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Marketplace
          </Link>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        
        {/* Header */}
        <header className="flex h-16 items-center justify-between px-6 border-b border-white/5 bg-card/50 backdrop-blur-md sticky top-0 z-40">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setMobileSidebarOpen(true)}
              className="md:hidden p-2 text-muted-foreground hover:text-foreground rounded-lg"
            >
              <Menu className="h-5 w-5" />
            </button>
            <h2 className="text-sm font-bold text-white uppercase tracking-wider">
              {pathname === "/seller"
                ? "Overview"
                : pathname.includes("products")
                ? "Inventory Manager"
                : pathname.includes("orders")
                ? "Fulfillments"
                : "Shop Profile Settings"}
            </h2>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-[10px] font-bold bg-primary/20 text-primary border border-primary/30 px-2 py-0.5 rounded-full uppercase tracking-wider">
              Seller Account
            </span>
            <div className="relative" ref={profileDropdownRef}>
              <button
                onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                className="flex items-center gap-1.5 p-1 rounded-full hover:bg-white/5 border border-white/10"
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-tr from-purple-600 to-indigo-600 text-xs font-bold text-white shadow shadow-primary/20 border border-white/10">
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
        </header>

        {/* Dynamic page container */}
        <main className="flex-1 p-6 md:p-8 overflow-y-auto">{children}</main>

      </div>

      {/* Mobile Sidebar overlay */}
      {mobileSidebarOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden bg-black/60 backdrop-blur-sm">
          <aside className="w-64 bg-card p-6 flex flex-col justify-between border-r border-white/10">
            <div className="space-y-6">
              <div className="flex items-center justify-between gap-4">
                <Link href="/" className="flex items-center gap-2">
                  <span className="text-sm font-bold text-white">NovaCart<span className="text-primary">Seller</span></span>
                </Link>
                <button
                  onClick={() => setMobileSidebarOpen(false)}
                  className="p-1 text-muted-foreground hover:text-white rounded-lg"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <nav className="space-y-1">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const active = pathname === item.href;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setMobileSidebarOpen(false)}
                      className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-semibold tracking-wide transition ${
                        active 
                          ? "bg-primary text-white" 
                          : "text-muted-foreground hover:bg-white/5 hover:text-foreground"
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                      {item.name}
                    </Link>
                  );
                })}
              </nav>
            </div>
            <Link
              href="/"
              onClick={() => setMobileSidebarOpen(false)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold text-muted-foreground hover:text-white transition"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Marketplace
            </Link>
          </aside>
        </div>
      )}

    </div>
  );
}
