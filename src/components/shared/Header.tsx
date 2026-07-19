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
    <header className="sticky top-0 z-50 w-full border-b border-white/5 bg-black/60 backdrop-blur-md">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between gap-8">

          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center gap-3 group">
              <div className="flex h-9 w-9 items-center justify-center border border-white/10 bg-zinc-900 text-white transition-all duration-300 group-hover:border-white/20">
                <ShoppingBag className="h-4 w-4 text-white" />
              </div>
              <span className="animated-gradient text-lg font-bold tracking-tight uppercase">
                NovaCartAI
              </span>
            </Link>

            {/* Desktop Navigation Links */}
            <div className="hidden md:flex items-center gap-8 ml-10">
              <Link 
                href="/products" 
                className="text-[11px] uppercase tracking-wider text-muted-foreground hover:text-white transition font-bold"
              >
                Shop
              </Link>
              <Link 
                href="/products?categorySlug=electronics" 
                className="text-[11px] uppercase tracking-wider text-muted-foreground hover:text-white transition font-bold"
              >
                Electronics
              </Link>
              <Link 
                href="/products?categorySlug=fashion" 
                className="text-[11px] uppercase tracking-wider text-muted-foreground hover:text-white transition font-bold"
              >
                Fashion
              </Link>
            </div>
          </div>

          {/* Search bar - Desktop */}
          <form onSubmit={handleSearchSubmit} className="hidden md:flex max-w-md flex-1 relative">
            <div className="relative w-full">
              <input
                type="text"
                placeholder="Search catalog..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-9 pl-9 pr-4 bg-zinc-950 border border-white/5 text-xs text-white placeholder:text-zinc-500 focus:outline-none focus:border-white/20 transition-all duration-300"
              />
              <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-zinc-500" />
            </div>
          </form>

          {/* Actions */}
          <div className="flex items-center gap-4">

            {/* Search Toggle Mobile */}
            <button className="md:hidden p-2 text-muted-foreground hover:text-white transition">
              <Search className="h-4 w-4" />
            </button>

            {/* Cart Button */}
            <div className="relative">
              <button
                onClick={() => setCartDropdownOpen(!cartDropdownOpen)}
                onBlur={() => setTimeout(() => setCartDropdownOpen(false), 200)}
                className="relative p-2 text-muted-foreground hover:text-white transition border border-transparent hover:border-white/5 bg-transparent hover:bg-zinc-950"
              >
                <ShoppingCart className="h-4 w-4" />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center bg-white text-[9px] font-black text-black ring-1 ring-black">
                    {cartCount}
                  </span>
                )}
              </button>

              {/* Cart Dropdown */}
              {cartDropdownOpen && (
                <div className="absolute right-0 mt-3 w-80 border border-white/5 bg-zinc-950 p-4 shadow-2xl z-50">
                  <h3 className="font-bold text-xs uppercase tracking-wider text-zinc-400 mb-3">Shopping Cart ({cartCount})</h3>
                  {items.length === 0 ? (
                    <div className="text-center py-8 text-xs text-zinc-500">
                      Your cart is empty.
                    </div>
                  ) : (
                    <>
                      <div className="max-h-60 overflow-y-auto space-y-4 mb-4 pr-1">
                        {items.map((item) => (
                          <div key={item.id} className="flex justify-between items-center gap-3 pb-3 border-b border-white/5 last:border-0 last:pb-0">
                            <div className="h-9 w-9 flex-shrink-0 overflow-hidden bg-zinc-900 border border-white/5">
                              <img
                                src={item.product.images[0] || "/placeholder-product.png"}
                                alt={item.product.name}
                                className="h-full w-full object-cover"
                              />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="text-xs font-medium text-white truncate">{item.product.name}</h4>
                              <p className="text-[10px] text-zinc-500">Qty: {item.quantity}</p>
                            </div>
                            <div className="text-right">
                              <span className="text-xs font-bold text-white">
                                ₹{Number(item.product.price) * item.quantity}
                              </span>
                              <button
                                onClick={() => removeItem(item.id)}
                                className="block text-[9px] text-red-400 hover:text-red-300 hover:underline ml-auto mt-0.5"
                              >
                                Remove
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                      <div className="border-t border-white/5 pt-3 flex justify-between items-center mb-3">
                        <span className="text-xs font-medium text-zinc-400 uppercase tracking-wider">Subtotal</span>
                        <span className="text-sm font-bold text-white">₹{cartTotal.toFixed(2)}</span>
                      </div>
                      <Link
                        href="/cart"
                        className="block w-full text-center py-2 bg-white hover:bg-zinc-200 text-xs font-bold text-black uppercase tracking-wider transition-colors duration-200"
                      >
                        Checkout
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
                  className="flex items-center gap-2 p-1.5 border border-white/10 hover:border-white/20 transition-all duration-300"
                >
                  <div className="flex h-6 w-6 items-center justify-center bg-zinc-800 font-bold text-xs text-white uppercase">
                    {user.name.charAt(0)}
                  </div>
                  <ChevronDown className="h-3 w-3 text-zinc-400" />
                </button>

                {/* Profile Dropdown */}
                {profileDropdownOpen && (
                  <div className="absolute right-0 mt-3 w-56 border border-white/5 bg-zinc-950 p-2 shadow-2xl z-50">
                    <div className="px-3 py-2.5 border-b border-white/5">
                      <p className="text-xs font-bold text-white truncate uppercase tracking-wider">{user.name}</p>
                      <p className="text-[10px] text-zinc-500 truncate">{user.email}</p>
                      <span className="inline-block mt-1.5 text-[8px] font-bold bg-zinc-800 text-zinc-300 px-2 py-0.5 rounded-none uppercase tracking-wider">
                        {user.role}
                      </span>
                    </div>
                    {user.role !== "CUSTOMER" && (
                      <Link
                        href={getDashboardLink()}
                        className="flex w-full items-center gap-2 px-3 py-2 text-xs text-zinc-400 hover:text-white hover:bg-white/5 transition"
                      >
                        <LayoutDashboard className="h-3.5 w-3.5" />
                        Dashboard
                      </Link>
                    )}
                    <button
                      onClick={logout}
                      className="flex w-full items-center gap-2 px-3 py-2 text-xs text-red-400 hover:text-red-300 hover:bg-white/5 transition text-left"
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
                className="hidden sm:flex items-center gap-1.5 px-4 py-2 border border-white text-white hover:bg-white hover:text-black text-xs font-bold uppercase tracking-wider transition-all duration-200"
              >
                <User className="h-3.5 w-3.5" />
                Sign In
              </Link>
            )}

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-muted-foreground hover:text-white transition"
            >
              {mobileMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </button>

          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-white/5 bg-zinc-950 px-4 py-4 space-y-4 z-50">
          <form onSubmit={handleSearchSubmit} className="relative w-full">
            <input
              type="text"
              placeholder="Search catalog..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-9 pl-9 pr-4 bg-zinc-900 border border-white/5 text-xs text-white placeholder:text-zinc-500 focus:outline-none focus:border-white/20 transition-all duration-300"
            />
            <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-zinc-500" />
          </form>
          <div className="space-y-1">
            <Link
              href="/products"
              className="block px-3 py-2 text-xs text-zinc-400 hover:text-white uppercase tracking-wider font-bold"
            >
              Shop Catalog
            </Link>
            {!user && (
              <Link
                href="/login"
                className="block px-3 py-2 text-xs text-white uppercase tracking-wider font-bold"
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
