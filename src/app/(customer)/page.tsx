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
  RotateCcw,
  Sparkles
} from "lucide-react";

// High-quality public domain mockup images
const MOCK_PRODUCTS = [
  {
    id: "prod-1",
    name: "AeroSound Pro Wireless Headphone",
    slug: "aerosound-pro-wireless-headphone",
    price: 1199.99,
    comparePrice: 1249.99,
    images: ["https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&auto=format&fit=crop&q=80"],
    stock: 15,
    seller: { shopName: "AeroTech Official" },
  },
  {
    id: "prod-2",
    name: "ChronoClassic Minimalist Watch",
    slug: "chronoclassic-minimalist-watch",
    price: 1129.00,
    comparePrice: 1159.00,
    images: ["https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&auto=format&fit=crop&q=80"],
    stock: 8,
    seller: { shopName: "Chrono Craft" },
  },
  {
    id: "prod-3",
    name: "NovaFit Active Sports Sneaker",
    slug: "novafit-active-sports-sneaker",
    price: 1089.99,
    comparePrice: null,
    images: ["https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&auto=format&fit=crop&q=80"],
    stock: 22,
    seller: { shopName: "Nova Apparel" },
  },
  {
    id: "prod-4",
    name: "SleekLeather Crossbody Bag",
    slug: "sleekleather-crossbody-bag",
    price: 1145.00,
    comparePrice: 1185.00,
    images: ["https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=600&auto=format&fit=crop&q=80"],
    stock: 5,
    seller: { shopName: "Sleek Goods" },
  },
];

const CATEGORIES = [
  { name: "Electronics", slug: "electronics", icon: Smartphone },
  { name: "Fashion", slug: "fashion", icon: Shirt },
  { name: "Accessories", slug: "accessories", icon: Watch },
  { name: "Home & Living", slug: "home-living", icon: HomeIcon },
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
    <div className="space-y-24 pb-24">

      {/* Hero Section */}
      <section className="relative overflow-hidden border-b border-white/5 pt-20 pb-20 lg:pt-32 lg:pb-32">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">

            {/* Left Info Column */}
            <div className="lg:col-span-7 space-y-8 text-left">
              
              {/* Launch Badge */}
              <div className="inline-flex items-center gap-2 border border-white/10 bg-zinc-950 px-3.5 py-1 text-[9px] font-black uppercase tracking-widest text-zinc-400">
                <Sparkles className="h-3 w-3 text-white" />
                <span>NovaCart AI Core Launch</span>
              </div>

              {/* Headline */}
              <h1 className="animated-gradient text-4xl sm:text-6xl font-black uppercase tracking-tight leading-none max-w-2xl">
                Experience the Smartest Marketplace
              </h1>

              {/* Supporting paragraph */}
              <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed uppercase tracking-wider max-w-lg font-medium">
                Discover personalized deals, verify authentic products, and track deliveries in real time on NovaCart AI. Built for the modern consumer.
              </p>

              {/* CTAs */}
              <div className="flex flex-wrap items-center gap-4 pt-2">
                <Link
                  href="/products"
                  className="inline-flex h-10 items-center justify-center bg-white hover:bg-zinc-200 px-6 text-xs font-bold text-black uppercase tracking-wider transition-colors duration-200 gap-1.5"
                >
                  Shop Catalog
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
                <Link
                  href="/seller"
                  className="inline-flex h-10 items-center justify-center border border-white/10 hover:border-white bg-transparent hover:bg-white hover:text-black px-6 text-xs font-bold text-white uppercase tracking-wider transition-all duration-200"
                >
                  Sell on NovaCart
                </Link>
              </div>

              {/* Trust Badges */}
              <div className="pt-4 flex flex-wrap gap-8 items-center border-t border-white/5">
                <div className="flex items-center gap-2 text-[9px] font-bold text-zinc-500 uppercase tracking-widest">
                  <ShieldCheck className="h-4 w-4 text-white" />
                  <span>Stripe Secure Checkouts</span>
                </div>
                <div className="flex items-center gap-2 text-[9px] font-bold text-zinc-500 uppercase tracking-widest">
                  <Truck className="h-4 w-4 text-white" />
                  <span>GPS Tracked Delivery</span>
                </div>
              </div>
            </div>

            {/* Right Product Showcase Column */}
            <div className="lg:col-span-5 relative h-[420px] w-full flex items-center justify-center">
              
              {/* Main Showcase Base */}
              <Link
                href="/products/aerosound-pro-wireless-headphone"
                className="absolute inset-0 bg-gradient-to-b from-zinc-900 to-black border border-white/5 p-6 flex flex-col justify-between group cursor-pointer hover:border-white/10 transition-all duration-300"
              >
                {/* Showcase Header */}
                <div className="flex justify-between items-center z-10 border-b border-white/5 pb-3">
                  <span className="text-[9px] font-black uppercase tracking-widest text-zinc-400">Featured Showcase</span>
                  <span className="text-[8px] border border-white/20 bg-zinc-950 text-white px-2 py-0.5 font-bold uppercase tracking-wider">NEW</span>
                </div>
                
                {/* Big Mock Product Image */}
                <div className="relative flex-1 flex items-center justify-center my-4 z-10">
                  <img
                    src="/aerosound_headphones.png"
                    alt="AeroSound Headphones"
                    className="h-40 w-auto object-contain transition-transform duration-700 ease-out group-hover:scale-105 group-hover:-rotate-2"
                  />
                </div>

                {/* Info Block */}
                <div className="space-y-4 z-10">
                  <div className="text-left border-t border-white/5 pt-3">
                    <h3 className="text-xs font-black text-white uppercase tracking-wider leading-none">Smart Tech Gear</h3>
                    <p className="text-[9px] text-zinc-500 uppercase tracking-widest mt-1">Up to 40% Platform Discount</p>
                  </div>
                  <div className="p-3 bg-zinc-900 border border-white/5 flex items-center justify-between gap-4">
                    <div>
                      <p className="text-[9px] text-zinc-500 uppercase font-semibold tracking-wider">AeroSound Headphones</p>
                      <p className="text-xs font-black text-white uppercase mt-0.5">Professional Audio</p>
                    </div>
                    <span className="text-xs font-black bg-white text-black px-2.5 py-1">₹1199.99</span>
                  </div>
                </div>
              </Link>

            </div>

          </div>
        </div>
      </section>

      {/* Feature Badges Grid */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="flex gap-4 p-6 bg-zinc-950 border border-white/5">
            <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center bg-zinc-900 border border-white/10 text-white">
              <Truck className="h-4 w-4" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-1.5">Fast Delivery</h4>
              <p className="text-xs text-zinc-500 leading-relaxed uppercase tracking-wider text-[10px]">Real-time GPS tracking and OTP security verification on all packages.</p>
            </div>
          </div>
          <div className="flex gap-4 p-6 bg-zinc-950 border border-white/5">
            <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center bg-zinc-900 border border-white/10 text-white">
              <ShieldCheck className="h-4 w-4" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-1.5">Secure Payments</h4>
              <p className="text-xs text-zinc-500 leading-relaxed uppercase tracking-wider text-[10px]">Integrated Stripe and Razorpay checkouts with instant verification.</p>
            </div>
          </div>
          <div className="flex gap-4 p-6 bg-zinc-950 border border-white/5">
            <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center bg-zinc-900 border border-white/10 text-white">
              <RotateCcw className="h-4 w-4" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-1.5">Easy Returns</h4>
              <p className="text-xs text-zinc-500 leading-relaxed uppercase tracking-wider text-[10px]">7-day hassle-free marketplace returns backed by platform support.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Browser Section */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="text-left border-b border-white/5 pb-4">
          <h2 className="text-lg font-black uppercase tracking-widest text-zinc-400">Browse Categories</h2>
          <p className="text-xs text-zinc-500 uppercase tracking-wider mt-1">Explore products across our curated departments.</p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {CATEGORIES.map((cat) => {
            const IconComponent = cat.icon;
            return (
              <Link
                key={cat.slug}
                href={`/products?categorySlug=${cat.slug}`}
                className="flex items-center justify-between p-5 bg-zinc-950 border border-white/5 hover:border-white/20 transition-all duration-300 group"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center bg-zinc-900 border border-white/5 text-white">
                    <IconComponent className="h-4 w-4" />
                  </div>
                  <span className="text-xs font-bold text-white uppercase tracking-wider">{cat.name}</span>
                </div>
                <ArrowRight className="h-4 w-4 text-zinc-600 group-hover:text-white transition-colors duration-200" />
              </Link>
            );
          })}
        </div>
      </section>

      {/* Featured Products Section */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="flex items-end justify-between border-b border-white/5 pb-4">
          <div>
            <h2 className="text-lg font-black uppercase tracking-widest text-zinc-400">Featured Arrivals</h2>
            <p className="text-xs text-zinc-500 uppercase tracking-wider mt-1">Check out our highest rated products this week.</p>
          </div>
          <Link href="/products" className="group flex items-center gap-1.5 text-xs font-bold text-white uppercase tracking-wider hover:underline">
            View All
            <ArrowRight className="h-3.5 w-3.5 transition group-hover:translate-x-0.5" />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="animate-pulse flex flex-col gap-4">
                <div className="aspect-square bg-zinc-900 border border-white/5" />
                <div className="h-3.5 w-2/3 bg-zinc-900" />
                <div className="h-3 w-1/3 bg-zinc-900" />
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

      {/* Testimonials section - Luxury minimalist layout */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="text-left border-b border-white/5 pb-4">
          <h2 className="text-lg font-black uppercase tracking-widest text-zinc-400">User Reviews</h2>
          <p className="text-xs text-zinc-500 uppercase tracking-wider mt-1">What our clients say about NovaCart platform.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 bg-zinc-950 border border-white/5 flex flex-col justify-between h-48">
            <p className="text-xs text-zinc-400 italic leading-relaxed">
              &quot;The minimal layout and transaction security makes this shopping experience feel premium. Delivery tracking was extremely fast.&quot;
            </p>
            <div className="border-t border-white/5 pt-3 mt-4">
              <p className="text-[10px] font-bold text-white uppercase tracking-wider">Aravind Sharma</p>
              <p className="text-[8px] text-zinc-500 uppercase tracking-widest">Verified Buyer</p>
            </div>
          </div>
          <div className="p-6 bg-zinc-950 border border-white/5 flex flex-col justify-between h-48">
            <p className="text-xs text-zinc-400 italic leading-relaxed">
              &quot;As a seller, listing products and getting payout approvals takes less than a day. Highly reliable platform workflow.&quot;
            </p>
            <div className="border-t border-white/5 pt-3 mt-4">
              <p className="text-[10px] font-bold text-white uppercase tracking-wider">Priya Nair</p>
              <p className="text-[8px] text-zinc-500 uppercase tracking-widest">Verified Merchant</p>
            </div>
          </div>
          <div className="p-6 bg-zinc-950 border border-white/5 flex flex-col justify-between h-48">
            <p className="text-xs text-zinc-400 italic leading-relaxed">
              &quot;Simple, secure, and clean. No spammy ads or flashing UI. The design is absolutely timeless and confident.&quot;
            </p>
            <div className="border-t border-white/5 pt-3 mt-4">
              <p className="text-[10px] font-bold text-white uppercase tracking-wider">Rohan Sen</p>
              <p className="text-[8px] text-zinc-500 uppercase tracking-widest">Premium Customer</p>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}
