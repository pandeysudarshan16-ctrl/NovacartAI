"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { apiClient } from "@/lib/api-client";
import ProductCard from "@/components/shared/ProductCard";
import {
  ArrowRight,
  Smartphone,
  Shirt,
  Watch,
  Home as HomeIcon,
  ShieldCheck,
  Truck,
  RotateCcw
} from "lucide-react";
import { motion } from "framer-motion";

// High-quality public domain mockup images
const MOCK_PRODUCTS = [
  {
    id: "prod-1",
    name: "AeroSound Pro Wireless Headphone",
    slug: "aerosound-pro-wireless-headphone",
    price: 199.99,
    comparePrice: 249.99,
    images: ["https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&auto=format&fit=crop&q=80"],
    stock: 15,
    seller: { shopName: "AeroTech Official" },
  },
  {
    id: "prod-2",
    name: "ChronoClassic Minimalist Watch",
    slug: "chronoclassic-minimalist-watch",
    price: 129.00,
    comparePrice: 159.00,
    images: ["https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&auto=format&fit=crop&q=80"],
    stock: 8,
    seller: { shopName: "Chrono Craft" },
  },
  {
    id: "prod-3",
    name: "NovaFit Active Sports Sneaker",
    slug: "novafit-active-sports-sneaker",
    price: 89.99,
    comparePrice: null,
    images: ["https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&auto=format&fit=crop&q=80"],
    stock: 22,
    seller: { shopName: "Nova Apparel" },
  },
  {
    id: "prod-4",
    name: "SleekLeather Crossbody Bag",
    slug: "sleekleather-crossbody-bag",
    price: 145.00,
    comparePrice: 185.00,
    images: ["https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=600&auto=format&fit=crop&q=80"],
    stock: 5,
    seller: { shopName: "Sleek Goods" },
  },
];

const CATEGORIES = [
  { name: "Electronics", slug: "electronics", icon: Smartphone, color: "from-blue-600/20 to-indigo-600/20 border-blue-500/30" },
  { name: "Fashion", slug: "fashion", icon: Shirt, color: "from-pink-600/20 to-rose-600/20 border-pink-500/30" },
  { name: "Accessories", slug: "accessories", icon: Watch, color: "from-amber-600/20 to-orange-600/20 border-amber-500/30" },
  { name: "Home & Living", slug: "home-living", icon: HomeIcon, color: "from-emerald-600/20 to-teal-600/20 border-emerald-500/30" },
];

export default function HomePage() {
  const [products, setProducts] = useState<typeof MOCK_PRODUCTS>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFeaturedProducts = async () => {
      try {
        const data = await apiClient.get<{ products: typeof MOCK_PRODUCTS }>("/api/products?limit=4");
        if (data.products && data.products.length > 0) {
          setProducts(data.products);
        } else {
          setProducts(MOCK_PRODUCTS);
        }
      } catch {
        setProducts(MOCK_PRODUCTS);
      } finally {
        setLoading(false);
      }
    };
    fetchFeaturedProducts();
  }, []);

  return (
    <div className="space-y-16 pb-16">

      {/* Hero Banner Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-purple-950/20 via-muted to-background border-b border-white/5 py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">

            {/* Left Info */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              <motion.span
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="inline-block rounded-full bg-primary/20 border border-primary/30 px-3 py-1 text-xs font-semibold text-primary"
              >
                NovaCart AI Core Launch
              </motion.span>
              <motion.h1
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-gradient-to-r from-white via-slate-100 to-purple-400 bg-clip-text text-4xl font-extrabold tracking-tight text-transparent sm:text-6xl"
              >
                Experience the Smartest Marketplace
              </motion.h1>
              <motion.p
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-base text-muted-foreground max-w-lg mx-auto lg:mx-0 leading-relaxed"
              >
                Discover personalized deals, verify authentic products, and track deliveries in real time on NovaCart AI.
              </motion.p>
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="flex flex-wrap items-center justify-center lg:justify-start gap-4"
              >
                <Link
                  href="/products"
                  className="inline-flex h-11 items-center justify-center rounded-xl bg-primary hover:bg-primary/95 px-6 text-sm font-semibold text-white transition shadow shadow-primary/20 gap-1"
                >
                  Shop Catalog
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  href="/seller"
                  className="inline-flex h-11 items-center justify-center rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 px-6 text-sm font-semibold text-white transition"
                >
                  Sell on NovaCart
                </Link>
              </motion.div>
            </div>

            {/* Right Interactive Card / Banner Graphic */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2, type: "spring" }}
              className="lg:col-span-5 relative"
            >
              <Link
                href="/products/aerosound-pro-wireless-headphone"
                className="block relative aspect-square max-w-md mx-auto rounded-3xl overflow-hidden glass p-6 flex flex-col justify-between group cursor-pointer hover:border-primary/40 transition-all duration-300"
              >
                <div className="absolute top-0 right-0 h-40 w-40 rounded-full bg-primary/20 blur-3xl" />
                <div className="absolute bottom-0 left-0 h-40 w-40 rounded-full bg-secondary/10 blur-3xl" />

                {/* Visual Content inside Glass Card */}
                <div className="flex justify-between items-center z-10">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Trending Now</span>
                  <span className="text-[9px] rounded-full bg-secondary/20 text-secondary border border-secondary/30 px-2 py-0.5 font-bold">HOT</span>
                </div>

                {/* Floating Product Image */}
                <div className="relative flex-1 flex items-center justify-center my-2 z-10">
                  <img
                    src="/aerosound_headphones.png"
                    alt="AeroSound Headphones"
                    className="h-44 w-auto object-contain drop-shadow-[0_15px_15px_rgba(168,85,247,0.3)] group-hover:scale-105 group-hover:-rotate-3 transition-all duration-500 ease-out"
                  />
                </div>

                <div className="space-y-4 z-10">
                  <div className="text-left">
                    <h3 className="text-lg font-bold text-white leading-tight">Smart Tech Gear</h3>
                    <p className="text-[10px] text-muted-foreground">Up to 40% Platform Discount</p>
                  </div>
                  <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-between gap-4">
                    <div>
                      <p className="text-[9px] text-muted-foreground uppercase font-semibold">Featured Gear</p>
                      <p className="text-xs font-bold text-white">AeroSound Headphones</p>
                    </div>
                    <span className="text-xs font-bold text-secondary bg-secondary/10 border border-secondary/20 px-2 py-1 rounded-xl">₹199.99</span>
                  </div>
                </div>
              </Link>
            </motion.div>

          </div>
        </div>
      </section>

      {/* Feature Badges Section */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="flex gap-4 p-6 rounded-2xl border border-white/5 bg-card">
            <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-primary/15 text-primary">
              <Truck className="h-6 w-6" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white mb-1">Fast Delivery</h4>
              <p className="text-xs text-muted-foreground leading-relaxed">Real-time GPS tracking and OTP security verification on all packages.</p>
            </div>
          </div>
          <div className="flex gap-4 p-6 rounded-2xl border border-white/5 bg-card">
            <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-secondary/15 text-secondary">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white mb-1">Secure Payments</h4>
              <p className="text-xs text-muted-foreground leading-relaxed">Integrated Stripe and Razorpay checkouts with instant verification.</p>
            </div>
          </div>
          <div className="flex gap-4 p-6 rounded-2xl border border-white/5 bg-card">
            <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-purple-500/15 text-purple-400">
              <RotateCcw className="h-6 w-6" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white mb-1">Easy Returns</h4>
              <p className="text-xs text-muted-foreground leading-relaxed">7-day hassle-free marketplace returns backed by platform support.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Browser Section */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="flex items-end justify-between">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-white">Browse Categories</h2>
            <p className="text-xs text-muted-foreground mt-1">Explore products across our curated departments.</p>
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {CATEGORIES.map((cat) => {
            const IconComponent = cat.icon;
            return (
              <Link
                key={cat.slug}
                href={`/products?categorySlug=${cat.slug}`}
                className={`flex flex-col items-center p-6 rounded-2xl border bg-gradient-to-b ${cat.color} hover:-translate-y-1 transition duration-300 text-center gap-4`}
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/5 text-white">
                  <IconComponent className="h-6 w-6" />
                </div>
                <span className="text-sm font-bold text-white">{cat.name}</span>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Featured Products Section */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="flex items-end justify-between">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-white">Featured Arrivals</h2>
            <p className="text-xs text-muted-foreground mt-1">Check out our highest rated products this week.</p>
          </div>
          <Link href="/products" className="group flex items-center gap-1 text-xs font-semibold text-primary hover:underline">
            View All Catalog
            <ArrowRight className="h-3 w-3 transition group-hover:translate-x-0.5" />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="animate-pulse flex flex-col gap-4">
                <div className="aspect-square bg-white/5 rounded-2xl" />
                <div className="h-4 w-2/3 bg-white/5 rounded" />
                <div className="h-3 w-1/3 bg-white/5 rounded" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </section>

    </div>
  );
}
