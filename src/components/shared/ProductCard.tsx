"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useCart } from "@/context/CartContext";
import { Star, ShoppingCart, Loader2, Check, Heart, Eye } from "lucide-react";
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
  const [wishlisted, setWishlisted] = useState(false);

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
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
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="group relative flex flex-col bg-zinc-950 border border-white/5 text-white transition-all duration-300 hover:border-white/15"
    >
      {/* Product Image Area */}
      <div className="relative aspect-square w-full overflow-hidden bg-zinc-900 border-b border-white/5">
        {discount > 0 && (
          <span className="absolute left-3 top-3 z-10 bg-white px-2 py-0.5 text-[9px] font-black text-black uppercase tracking-wider">
            {discount}% OFF
          </span>
        )}
        
        {product.stock <= 0 && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/80 backdrop-blur-[1px]">
            <span className="border border-white/20 bg-zinc-950 px-3 py-1 text-[10px] font-bold text-white uppercase tracking-widest">
              OUT OF STOCK
            </span>
          </div>
        )}

        {/* Wishlist toggle */}
        <button
          onClick={(e) => {
            e.preventDefault();
            setWishlisted(!wishlisted);
          }}
          className="absolute right-3 top-3 z-10 p-1.5 border border-white/5 hover:border-white/20 bg-zinc-950/80 text-zinc-400 hover:text-white transition-all duration-200"
        >
          <Heart className={`h-3.5 w-3.5 ${wishlisted ? "fill-white text-white" : ""}`} />
        </button>

        {/* Hover quick action overlay */}
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-5 flex items-center justify-center gap-2">
          <Link
            href={`/products/${product.slug}`}
            className="p-2 border border-white bg-white text-black hover:bg-transparent hover:text-white transition-colors duration-200"
            title="View Details"
          >
            <Eye className="h-4 w-4" />
          </Link>
        </div>

        <img
          src={product.images[0] || "/placeholder-product.png"}
          alt={product.name}
          className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
          loading="lazy"
        />
      </div>

      {/* Info Block */}
      <div className="flex flex-1 flex-col p-4">
        {/* Vendor */}
        <p className="text-[9px] uppercase tracking-widest text-zinc-500 mb-1.5 font-bold">
          {product.seller.shopName}
        </p>

        {/* Title */}
        <Link href={`/products/${product.slug}`} className="hover:text-zinc-300 transition">
          <h3 className="line-clamp-2 text-xs font-bold leading-relaxed text-white mb-2 uppercase tracking-wide">
            {product.name}
          </h3>
        </Link>

        {/* Rating Mock - Monochromatic and minimal */}
        <div className="flex items-center gap-1.5 mb-4">
          <div className="flex items-center gap-0.5">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className={`h-3 w-3 ${i < 4 ? "fill-zinc-400 text-zinc-400" : "text-zinc-800"}`} />
            ))}
          </div>
          <span className="text-[9px] text-zinc-500 font-bold">(18)</span>
        </div>

        {/* Price & Cart Action */}
        <div className="mt-auto flex items-center justify-between pt-3 border-t border-white/5 gap-2">
          {/* Price Block */}
          <div>
            <div className="flex items-baseline gap-2">
              <span className="text-xs font-black text-white">₹{Number(product.price).toFixed(2)}</span>
              {product.comparePrice && (
                <span className="text-[10px] text-zinc-500 line-through">
                  ₹{Number(product.comparePrice).toFixed(2)}
                </span>
              )}
            </div>
          </div>

          {/* Add to Cart button */}
          <button
            onClick={handleAddToCart}
            disabled={product.stock <= 0 || loading}
            className={`flex h-8 px-2.5 items-center justify-center border text-[9px] font-bold uppercase tracking-wider transition-all duration-200 ${
              success
                ? "bg-zinc-800 border-zinc-700 text-green-400"
                : product.stock <= 0
                ? "bg-transparent border-white/5 text-zinc-700 cursor-not-allowed"
                : "bg-transparent border-white/10 hover:border-white text-white hover:bg-white hover:text-black"
            }`}
          >
            {loading ? (
              <Loader2 className="h-3 w-3 animate-spin" />
            ) : success ? (
              <Check className="h-3 w-3 mr-1" />
            ) : (
              <ShoppingCart className="h-3 w-3 mr-1" />
            )}
            {success ? "Added" : "Buy"}
          </button>
        </div>

      </div>
    </motion.div>
  );
}
