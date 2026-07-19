import React from "react";
import Link from "next/link";
import { ShoppingBag, Mail } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-card border-t border-white/5 mt-auto">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          
          {/* Logo & Description */}
          <div className="space-y-4">
            <Link href="/" className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-tr from-primary to-purple-600 shadow shadow-primary/20">
                <ShoppingBag className="h-4 w-4 text-white" />
              </div>
              <span className="text-lg font-bold text-white tracking-wide">
                NovaCart<span className="text-primary">AI</span>
              </span>
            </Link>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Next-generation multi-vendor e-commerce platform driven by advanced artificial intelligence workflows.
            </p>
          </div>

          {/* Shop Links */}
          <div>
            <h3 className="text-sm font-semibold text-white mb-4">Shop</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/products" className="text-xs text-muted-foreground hover:text-foreground transition">
                  All Products
                </Link>
              </li>
              <li>
                <Link href="/products?categorySlug=electronics" className="text-xs text-muted-foreground hover:text-foreground transition">
                  Electronics
                </Link>
              </li>
              <li>
                <Link href="/products?categorySlug=fashion" className="text-xs text-muted-foreground hover:text-foreground transition">
                  Fashion
                </Link>
              </li>
            </ul>
          </div>

          {/* Portals */}
          <div>
            <h3 className="text-sm font-semibold text-white mb-4">Marketplace Portals</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/seller" className="text-xs text-muted-foreground hover:text-foreground transition">
                  Seller Portal
                </Link>
              </li>
              <li>
                <Link href="/delivery" className="text-xs text-muted-foreground hover:text-foreground transition">
                  Delivery Partner Dashboard
                </Link>
              </li>
              <li>
                <Link href="/admin" className="text-xs text-muted-foreground hover:text-foreground transition">
                  Admin Dashboard
                </Link>
              </li>
            </ul>
          </div>

          {/* Newsletter */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-white mb-4">Stay Connected</h3>
            <p className="text-xs text-muted-foreground">
              Sign up for our newsletter to get notifications on discounts and new vendor arrivals.
            </p>
            <form className="relative flex">
              <input
                type="email"
                placeholder="Enter email address"
                required
                className="w-full h-9 pl-3 pr-10 rounded-lg bg-muted border border-white/10 focus:outline-none focus:border-primary text-xs placeholder:text-muted-foreground"
              />
              <button
                type="submit"
                className="absolute right-1 top-1 h-7 w-7 rounded-md bg-primary hover:bg-primary/95 flex items-center justify-center text-white transition"
              >
                <Mail className="h-3.5 w-3.5" />
              </button>
            </form>
          </div>

        </div>

        {/* Bottom Banner */}
        <div className="border-t border-white/5 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-[10px] text-muted-foreground text-center sm:text-left">
            &copy; {new Date().getFullYear()} NovaCart AI Marketplace. Built for high performance scale. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            <Link href="/terms" className="text-[10px] text-muted-foreground hover:text-foreground">
              Terms of Use
            </Link>
            <Link href="/privacy" className="text-[10px] text-muted-foreground hover:text-foreground">
              Privacy Policy
            </Link>
          </div>
        </div>

      </div>
    </footer>
  );
}
