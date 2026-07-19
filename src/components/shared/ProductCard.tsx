"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useCart } from "@/context/CartContext";
import { Star, ShoppingCart, Loader2, Check } from "lucide-react";
import { motion } from "framer-motion";

interface ProductCardProps {
  product: {
    id: string;
    name: string;
    slug: string;
    price: number | string | { toString(): string };
    comparePrice: number | string | { toString(): string } | null;
    images: string[];
    stock: number;
    seller: {
      shopName: string;
    };
  };
}

export default function ProductCard({ product }: ProductCardProps) {
  const { addItem } = useCart();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault(); // Stop redirection to dynamic details page
    if (product.stock <= 0) return;

    setLoading(true);
    try {
      await addItem(product.id, 1);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 2000);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const discount = product.comparePrice
    ? Math.round(
        ((Number(product.comparePrice) - Number(product.price)) /
          Number(product.comparePrice)) *
          100
      )
    : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -5 }}
      transition={{ duration: 0.3 }}
      className="group relative flex flex-col overflow-hidden rounded-2xl border border-white/5 bg-card text-foreground"
    >
      {/* Product Image Area */}
      <Link href={`/products/${product.slug}`} className="relative block aspect-square overflow-hidden bg-muted">
        {discount > 0 && (
          <span className="absolute left-3 top-3 z-10 rounded-full bg-secondary px-2 py-0.5 text-[10px] font-bold text-secondary-foreground shadow">
            -{discount}% OFF
          </span>
        )}
        {product.stock <= 0 && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/60 backdrop-blur-[2px]">
            <span className="rounded-full bg-destructive/20 border border-destructive/30 px-3 py-1 text-xs font-semibold text-destructive-foreground tracking-wide">
              OUT OF STOCK
            </span>
          </div>
        )}
        <img
          src={product.images[0] || "/placeholder-product.png"}
          alt={product.name}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
        />
      </Link>

      {/* Info Block */}
      <div className="flex flex-1 flex-col p-4">
        {/* Vendor */}
        <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1 font-semibold">
          {product.seller.shopName}
        </p>

        {/* Title */}
        <Link href={`/products/${product.slug}`} className="hover:text-primary transition">
          <h3 className="line-clamp-2 text-sm font-semibold leading-tight text-white mb-2">
            {product.name}
          </h3>
        </Link>

        {/* Rating Mock */}
        <div className="flex items-center gap-1 mb-3">
          <div className="flex items-center gap-0.5">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className={`h-3 w-3 ${i < 4 ? "fill-secondary text-secondary" : "text-white/20"}`} />
            ))}
          </div>
          <span className="text-[10px] text-muted-foreground font-medium">(18)</span>
        </div>

        {/* Price & Cart Action */}
        <div className="mt-auto flex items-center justify-between pt-2 border-t border-white/5 gap-2">
          {/* Price Block */}
          <div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-sm font-bold text-white">₹{Number(product.price).toFixed(2)}</span>
              {product.comparePrice && (
                <span className="text-[10px] text-muted-foreground line-through">
                  ₹{Number(product.comparePrice).toFixed(2)}
                </span>
              )}
            </div>
          </div>

          {/* Add to Cart button */}
          <button
            onClick={handleAddToCart}
            disabled={product.stock <= 0 || loading}
            className={`flex h-8 w-8 items-center justify-center rounded-lg transition-colors duration-200 border ${
              success
                ? "bg-secondary/20 border-secondary text-secondary"
                : product.stock <= 0
                ? "bg-white/5 border-white/5 text-white/20 cursor-not-allowed"
                : "bg-primary/10 border-primary/20 hover:bg-primary text-primary hover:text-white"
            }`}
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : success ? (
              <Check className="h-4 w-4" />
            ) : (
              <ShoppingCart className="h-4 w-4" />
            )}
          </button>
        </div>

      </div>
    </motion.div>
  );
}
