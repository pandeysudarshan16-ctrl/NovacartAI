"use client";

import React from "react";
import Link from "next/link";
import { useCart } from "@/context/CartContext";
import { 
  Trash2, 
  Plus, 
  Minus, 
  ArrowLeft, 
  ShoppingCart, 
  ShieldCheck,
  CreditCard 
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function CartPage() {
  const { items, loading, updateQuantity, removeItem, cartTotal, cartCount } = useCart();

  // Premium checkout calculations
  const shippingCost = cartTotal > 150 || cartTotal === 0 ? 0.00 : 10.00;
  const estimatedTax = cartTotal * 0.05; // 5% flat tax rate
  const finalTotal = cartTotal + shippingCost + estimatedTax;

  if (loading) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 flex-1 flex flex-col items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        <p className="text-xs text-muted-foreground mt-4 font-semibold">Loading shopping cart details...</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 flex-1 flex flex-col gap-6 w-full">
      
      {/* Title */}
      <div>
        <h1 className="text-3xl font-extrabold text-white tracking-tight flex items-center gap-2">
          <ShoppingCart className="h-8 w-8 text-primary" />
          Shopping Cart
        </h1>
        <p className="text-xs text-muted-foreground mt-1">
          Review your items and complete checkout using our secure payment gateway options.
        </p>
      </div>

      <AnimatePresence mode="popLayout">
        {items.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center justify-center py-20 border border-dashed border-white/10 rounded-3xl text-center p-6"
          >
            <div className="h-16 w-16 rounded-3xl bg-white/5 flex items-center justify-center text-muted-foreground mb-4">
              🛒
            </div>
            <h3 className="text-base font-bold text-white mb-2">Your shopping cart is empty</h3>
            <p className="text-xs text-muted-foreground max-w-xs mb-6">
              Looks like you haven&apos;t added any items to your cart yet. Explore our catalog to get started.
            </p>
            <Link
              href="/products"
              className="py-2.5 px-6 rounded-xl bg-primary hover:bg-primary/95 text-xs font-semibold text-primary-foreground transition flex items-center gap-1.5"
            >
              <ArrowLeft className="h-4 w-4" />
              Continue Shopping
            </Link>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Left Items Column */}
            <div className="lg:col-span-8 space-y-4">
              {items.map((item) => (
                <motion.div
                  key={item.id}
                  layout
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  transition={{ duration: 0.2 }}
                  className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-2xl border border-white/5 bg-card"
                >
                  {/* Image & Title block */}
                  <div className="flex items-center gap-4">
                    <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-xl bg-muted border border-white/5">
                      <img
                        src={item.product.images[0] || "/placeholder-product.png"}
                        alt={item.product.name}
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <div>
                      <span className="text-[10px] uppercase text-muted-foreground font-semibold">
                        {item.product.seller.shopName}
                      </span>
                      <h4 className="text-sm font-semibold text-white line-clamp-1 hover:underline">
                        <Link href={`/products/${item.product.slug}`}>{item.product.name}</Link>
                      </h4>
                      <p className="text-xs font-bold text-primary mt-1">₹{Number(item.product.price).toFixed(2)}</p>
                    </div>
                  </div>

                  {/* Quantity Controller & Actions */}
                  <div className="flex items-center justify-between w-full sm:w-auto gap-6 border-t sm:border-t-0 border-white/5 pt-3 sm:pt-0">
                    
                    {/* Quantity selectors */}
                    <div className="flex items-center rounded-lg border border-white/10 bg-muted overflow-hidden">
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="p-1.5 hover:bg-white/5 transition text-muted-foreground hover:text-white"
                      >
                        <Minus className="h-3 w-3" />
                      </button>
                      <span className="px-3 text-xs font-bold text-white min-w-[1.5rem] text-center select-none">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="p-1.5 hover:bg-white/5 transition text-muted-foreground hover:text-white"
                      >
                        <Plus className="h-3 w-3" />
                      </button>
                    </div>

                    {/* Subtotal & Delete button */}
                    <div className="flex items-center gap-4">
                      <span className="text-sm font-bold text-white min-w-[4rem] text-right">
                        ₹{(Number(item.product.price) * item.quantity).toFixed(2)}
                      </span>
                      <button
                        onClick={() => removeItem(item.id)}
                        className="p-2 rounded-lg bg-destructive/10 text-destructive hover:bg-destructive hover:text-white transition"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>

                  </div>
                </motion.div>
              ))}

              <div>
                <Link
                  href="/products"
                  className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-white transition"
                >
                  <ArrowLeft className="h-3.5 w-3.5" />
                  Continue shopping and discover more gear
                </Link>
              </div>
            </div>

            {/* Right Summary Column */}
            <div className="lg:col-span-4 rounded-3xl border border-white/5 bg-card p-6 space-y-6">
              <h3 className="font-bold text-base text-white">Order Summary</h3>
              
              <div className="space-y-3 text-xs border-b border-white/5 pb-4">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal ({cartCount} items)</span>
                  <span className="font-semibold text-white">₹{cartTotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Shipping Cost</span>
                  <span className="font-semibold text-white">
                    {shippingCost === 0 ? (
                      <span className="text-secondary">FREE</span>
                    ) : (
                      `₹${shippingCost.toFixed(2)}`
                    )}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Estimated Tax (5%)</span>
                  <span className="font-semibold text-white">₹{estimatedTax.toFixed(2)}</span>
                </div>
              </div>

              {/* Promo input */}
              <div className="space-y-2">
                <label className="text-[10px] uppercase font-bold text-muted-foreground">Coupon Code</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="NOVACART40"
                    disabled
                    className="flex-1 h-9 px-3 rounded-lg bg-muted border border-white/10 text-xs text-white/55 cursor-not-allowed placeholder:text-muted-foreground/45"
                  />
                  <button
                    disabled
                    className="h-9 px-3 rounded-lg bg-white/5 border border-white/5 text-[10px] font-bold text-white/40 cursor-not-allowed"
                  >
                    Apply
                  </button>
                </div>
              </div>

              {/* Final price */}
              <div className="flex justify-between items-baseline">
                <span className="text-sm font-bold text-white">Total</span>
                <span className="text-2xl font-extrabold text-secondary tracking-tight">
                  ₹{finalTotal.toFixed(2)}
                </span>
              </div>

              {/* Checkout buttons */}
              <div className="space-y-3 pt-2">
                <Link
                  href="/checkout"
                  className="w-full h-11 flex items-center justify-center gap-2 rounded-xl bg-primary hover:bg-primary/95 text-xs font-semibold text-primary-foreground transition shadow shadow-primary/20"
                >
                  <CreditCard className="h-4 w-4" />
                  Proceed to Secure Checkout
                </Link>
                <div className="flex items-center justify-center gap-1.5 text-[10px] text-muted-foreground">
                  <ShieldCheck className="h-3.5 w-3.5 text-secondary" />
                  Secured by 256-bit SSL Platform encryption
                </div>
              </div>

            </div>

          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
