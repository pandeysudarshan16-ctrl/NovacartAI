"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";
import {
  ShoppingBag,
  Search,
  User,
  LogOut,
  Menu,
  X,
  ChevronDown,
  LayoutDashboard,
  ShoppingCart
} from "lucide-react";

export default function Header() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const { cartCount, items, cartTotal, removeItem } = useCart();

  const [searchQuery, setSearchQuery] = useState("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [cartDropdownOpen, setCartDropdownOpen] = useState(false);
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

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/products?query=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const getDashboardLink = () => {
    if (!user) return "/";
    switch (user.role) {
      case "ADMIN":
        return "/admin";
      case "SELLER":
        return "/seller";
      case "DELIVERY_PARTNER":
        return "/delivery";
      default:
        return "/";
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/10 bg-background/80 backdrop-blur-md">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between gap-4">

          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-primary to-purple-600 shadow-lg shadow-primary/20">
                <ShoppingBag className="h-5 w-5 text-white" />
              </div>
              <span className="bg-gradient-to-r from-white via-slate-200 to-purple-400 bg-clip-text text-xl font-bold tracking-tight text-transparent">
                NovaCart<span className="text-primary">AI</span>
              </span>
            </Link>

            {/* Desktop Navigation Links */}
            <div className="hidden md:flex items-center gap-6 ml-8">
              <Link href="/products" className="text-xs text-muted-foreground hover:text-foreground transition font-medium">
                Shop
              </Link>
            </div>
          </div>

          {/* Search bar - Desktop */}
          <form onSubmit={handleSearchSubmit} className="hidden md:flex max-w-md flex-1 relative">
            <div className="relative w-full">
              <input
                type="text"
                placeholder="Search products, brands, categories..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-10 pl-10 pr-4 rounded-xl bg-muted border border-white/15 focus:outline-none focus:border-primary/50 text-sm placeholder:text-muted-foreground transition"
              />
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            </div>
          </form>

          {/* Actions */}
          <div className="flex items-center gap-4">

            {/* Search Toggle Mobile */}
            <button className="md:hidden p-2 text-muted-foreground hover:text-foreground">
              <Search className="h-5 w-5" />
            </button>

            {/* Cart Button */}
            <div className="relative">
              <button
                onClick={() => setCartDropdownOpen(!cartDropdownOpen)}
                onBlur={() => setTimeout(() => setCartDropdownOpen(false), 200)}
                className="relative p-2 text-muted-foreground hover:text-foreground transition rounded-lg hover:bg-white/5"
              >
                <ShoppingCart className="h-5 w-5" />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-white ring-2 ring-background animate-pulse">
                    {cartCount}
                  </span>
                )}
              </button>

              {/* Cart Dropdown */}
              {cartDropdownOpen && (
                <div className="absolute right-0 mt-2 w-80 rounded-2xl border border-white/10 bg-card p-4 shadow-xl z-50">
                  <h3 className="font-semibold text-sm mb-3">Shopping Cart ({cartCount})</h3>
                  {items.length === 0 ? (
                    <div className="text-center py-6 text-sm text-muted-foreground">
                      Your cart is empty.
                    </div>
                  ) : (
                    <>
                      <div className="max-h-60 overflow-y-auto space-y-3 mb-4 pr-1">
                        {items.map((item) => (
                          <div key={item.id} className="flex justify-between items-center gap-3">
                            <div className="h-10 w-10 flex-shrink-0 overflow-hidden rounded-lg bg-muted">
                              <img
                                src={item.product.images[0] || "/placeholder-product.png"}
                                alt={item.product.name}
                                className="h-full w-full object-cover"
                              />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="text-xs font-medium truncate">{item.product.name}</h4>
                              <p className="text-[10px] text-muted-foreground">Qty: {item.quantity}</p>
                            </div>
                            <div className="text-right">
                              <span className="text-xs font-semibold text-primary">
                                ₹{Number(item.product.price) * item.quantity}
                              </span>
                              <button
                                onClick={() => removeItem(item.id)}
                                className="block text-[10px] text-destructive hover:underline ml-auto mt-0.5"
                              >
                                Remove
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                      <div className="border-t border-white/10 pt-3 flex justify-between items-center mb-3">
                        <span className="text-xs font-semibold text-muted-foreground">Subtotal</span>
                        <span className="text-sm font-bold text-white">₹{cartTotal.toFixed(2)}</span>
                      </div>
                      <Link
                        href="/cart"
                        className="block w-full text-center py-2 rounded-xl bg-primary hover:bg-primary/90 text-xs font-semibold text-white transition"
                      >
                        View & Checkout
                      </Link>
                    </>
                  )}
                </div>
              )}
            </div>

            {/* Profile / Authenticated actions */}
            {user ? (
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

                {/* Profile Dropdown */}
                {profileDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 rounded-2xl border border-white/10 bg-card p-2 shadow-xl z-50">
                    <div className="px-3 py-2 border-b border-white/5">
                      <p className="text-xs font-medium truncate">{user.name}</p>
                      <p className="text-[10px] text-muted-foreground truncate">{user.email}</p>
                      <span className="inline-block mt-1 text-[8px] font-bold bg-primary/20 text-primary px-1.5 py-0.5 rounded-full">
                        {user.role}
                      </span>
                    </div>
                    {user.role !== "CUSTOMER" && (
                      <Link
                        href={getDashboardLink()}
                        className="flex w-full items-center gap-2 px-3 py-2 rounded-xl text-xs hover:bg-white/5 transition text-foreground"
                      >
                        <LayoutDashboard className="h-3.5 w-3.5" />
                        Go to Dashboard
                      </Link>
                    )}
                    <button
                      onClick={logout}
                      className="flex w-full items-center gap-2 px-3 py-2 rounded-xl text-xs hover:bg-destructive/10 text-destructive transition text-left"
                    >
                      <LogOut className="h-3.5 w-3.5" />
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link
                href="/login"
                className="hidden sm:flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white text-black hover:bg-white/90 text-xs font-semibold tracking-wide transition shadow shadow-white/10"
              >
                <User className="h-3.5 w-3.5" />
                Sign In
              </Link>
            )}

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-muted-foreground hover:text-foreground rounded-lg"
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>

          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-white/10 bg-background/95 backdrop-blur-lg px-4 py-4 space-y-3 z-50">
          <form onSubmit={handleSearchSubmit} className="relative w-full">
            <input
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-10 pl-10 pr-4 rounded-xl bg-muted border border-white/10 focus:outline-none focus:border-primary text-sm"
            />
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          </form>
          <div className="space-y-1">
            <Link
              href="/products"
              className="block px-3 py-2 text-sm text-muted-foreground hover:text-foreground rounded-xl hover:bg-white/5"
            >
              Shop Catalog
            </Link>
            {!user && (
              <Link
                href="/login"
                className="block px-3 py-2 text-sm text-primary font-medium rounded-xl hover:bg-white/5"
              >
                Sign In / Register
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
