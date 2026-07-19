"use client";

import React, { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { CheckCircle2, ArrowRight, ShoppingBag, ShieldCheck } from "lucide-react";
import { motion } from "framer-motion";

function SuccessContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("orderId") || "N/A";

  return (
    <div className="flex-1 flex flex-col items-center justify-center min-h-[70vh] px-4 text-center max-w-md mx-auto space-y-6">
      
      {/* Success Icon */}
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 200, damping: 20 }}
        className="h-16 w-16 rounded-full bg-secondary/10 flex items-center justify-center border border-secondary/20 shadow shadow-secondary/10 text-secondary"
      >
        <CheckCircle2 className="h-8 w-8" />
      </motion.div>

      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-2xl font-black text-white tracking-tight">Order Placed Successfully!</h1>
        <p className="text-xs text-muted-foreground leading-relaxed">
          Thank you for shopping with NovaCart AI. Your order transaction completed and is being processed by the merchant seller storefronts.
        </p>
      </div>

      {/* Order Info Box */}
      <div className="w-full rounded-2xl border border-white/5 bg-card p-4 space-y-2 text-left">
        <div className="flex justify-between text-xs">
          <span className="text-muted-foreground">Order ID:</span>
          <span className="font-bold text-white uppercase font-mono truncate max-w-[12rem]">{orderId}</span>
        </div>
        <div className="flex justify-between text-xs pt-2 border-t border-white/5">
          <span className="text-muted-foreground">Status:</span>
          <span className="text-[10px] font-bold text-secondary bg-secondary/15 border border-secondary/20 px-2 py-0.5 rounded-full uppercase tracking-wider">
            Processing
          </span>
        </div>
      </div>

      {/* Navigation Buttons */}
      <div className="w-full grid grid-cols-1 gap-3">
        <Link
          href="/products"
          className="h-11 flex items-center justify-center gap-1.5 rounded-xl bg-primary hover:bg-primary/95 text-xs font-bold text-white transition shadow shadow-primary/20"
        >
          <ShoppingBag className="h-4 w-4" />
          Continue Shopping
        </Link>
        <Link
          href="/"
          className="h-11 flex items-center justify-center gap-1.5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-xs font-semibold text-white transition"
        >
          Return to Home
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>

      <div className="flex items-center justify-center gap-1.5 text-[9px] text-muted-foreground">
        <ShieldCheck className="h-3.5 w-3.5 text-secondary" />
        Transactions verified by NovaCart SSL
      </div>

    </div>
  );
}

export default function CheckoutSuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 flex-1 flex flex-col items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="text-xs text-muted-foreground mt-4 font-semibold">Loading success page details...</p>
        </div>
      }
    >
      <SuccessContent />
    </Suspense>
  );
}
