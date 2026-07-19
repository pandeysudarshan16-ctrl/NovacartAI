import React from "react";
import Link from "next/link";
import { ShoppingBag, Mail } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-black border-t border-white/5 mt-auto">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
          
          {/* Logo & Description */}
          <div className="space-y-6">
            <Link href="/" className="flex items-center gap-3 group">
              <div className="flex h-8 w-8 items-center justify-center border border-white/10 bg-zinc-900 transition-all duration-300 group-hover:border-white/20">
                <ShoppingBag className="h-4 w-4 text-white" />
              </div>
              <span className="text-sm font-bold text-white tracking-widest uppercase">
                NovaCartAI
              </span>
            </Link>
            <p className="text-xs text-zinc-500 leading-relaxed max-w-xs uppercase tracking-wider text-[10px] font-medium">
              Next-generation multi-vendor e-commerce platform driven by advanced artificial intelligence workflows.
            </p>
          </div>

          {/* Shop Links */}
          <div>
            <h3 className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-6">Shop Catalog</h3>
            <ul className="space-y-3.5">
              <li>
                <Link href="/products" className="text-xs text-zinc-500 hover:text-white transition uppercase tracking-wide">
                  All Products
                </Link>
              </li>
              <li>
                <Link href="/products?categorySlug=electronics" className="text-xs text-zinc-500 hover:text-white transition uppercase tracking-wide">
                  Electronics
                </Link>
              </li>
              <li>
                <Link href="/products?categorySlug=fashion" className="text-xs text-zinc-500 hover:text-white transition uppercase tracking-wide">
                  Fashion
                </Link>
              </li>
            </ul>
          </div>

          {/* Portals */}
          <div>
            <h3 className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-6">Partners</h3>
            <ul className="space-y-3.5">
              <li>
                <Link href="/seller" className="text-xs text-zinc-500 hover:text-white transition uppercase tracking-wide">
                  Seller Portal
                </Link>
              </li>
              <li>
                <Link href="/delivery" className="text-xs text-zinc-500 hover:text-white transition uppercase tracking-wide">
                  Delivery Partner
                </Link>
              </li>
              <li>
                <Link href="/admin" className="text-xs text-zinc-500 hover:text-white transition uppercase tracking-wide">
                  Admin Control
                </Link>
              </li>
            </ul>
          </div>

          {/* Newsletter */}
          <div className="space-y-4">
            <h3 className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-6">Subscription</h3>
            <p className="text-xs text-zinc-500 leading-relaxed">
              Sign up for our newsletter to get notifications on discounts and new vendor arrivals.
            </p>
            <form className="relative flex">
              <input
                type="email"
                placeholder="EMAIL ADDRESS"
                required
                className="w-full h-9 pl-3 pr-10 bg-zinc-950 border border-white/5 focus:outline-none focus:border-white/20 text-xs text-white placeholder:text-zinc-600 uppercase tracking-wider"
              />
              <button
                type="submit"
                className="absolute right-1 top-1 h-7 w-7 bg-white hover:bg-zinc-200 flex items-center justify-center text-black transition-colors duration-200"
              >
                <Mail className="h-3.5 w-3.5" />
              </button>
            </form>
          </div>

        </div>

        {/* Bottom Banner */}
        <div className="border-t border-white/5 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-[9px] text-zinc-600 uppercase tracking-widest text-center sm:text-left">
            &copy; {new Date().getFullYear()} NovaCart AI Marketplace. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            <Link href="/terms" className="text-[9px] text-zinc-600 hover:text-white transition uppercase tracking-widest">
              Terms
            </Link>
            <Link href="/privacy" className="text-[9px] text-zinc-600 hover:text-white transition uppercase tracking-widest">
              Privacy
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
