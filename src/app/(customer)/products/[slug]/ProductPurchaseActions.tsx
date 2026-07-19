"use client";

import React, { useState } from "react";
import { useCart } from "@/context/CartContext";
import { Plus, Minus, ShoppingCart, Loader2, Check } from "lucide-react";

interface ProductPurchaseActionsProps {
  productId: string;
  stock: number;
}

export default function ProductPurchaseActions({ productId, stock }: ProductPurchaseActionsProps) {
  const { addItem } = useCart();
  
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleIncrement = () => {
    if (quantity < stock) {
      setQuantity(quantity + 1);
    }
  };

  const handleDecrement = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1);
    }
  };

  const handleAddToCart = async () => {
    if (stock <= 0) return;
    
    setLoading(true);
    try {
      await addItem(productId, quantity);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 2000);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4 pt-4 border-t border-white/5">
      
      {stock > 0 ? (
        <>
          {/* Quantity Selector */}
          <div className="flex items-center gap-4">
            <span className="text-xs font-semibold text-muted-foreground">Select Quantity</span>
            <div className="flex items-center rounded-xl border border-white/10 bg-muted overflow-hidden">
              <button
                onClick={handleDecrement}
                disabled={quantity <= 1 || loading}
                className="p-2.5 hover:bg-white/5 transition text-muted-foreground hover:text-white disabled:opacity-40"
              >
                <Minus className="h-3.5 w-3.5" />
              </button>
              <span className="px-4 text-xs font-bold text-white min-w-[2rem] text-center select-none">
                {quantity}
              </span>
              <button
                onClick={handleIncrement}
                disabled={quantity >= stock || loading}
                className="p-2.5 hover:bg-white/5 transition text-muted-foreground hover:text-white disabled:opacity-40"
              >
                <Plus className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>

          {/* Add to Cart button */}
          <div className="flex gap-4 pt-2">
            <button
              onClick={handleAddToCart}
              disabled={loading}
              className={`flex-1 h-12 flex items-center justify-center gap-2 rounded-xl transition duration-200 border text-sm font-semibold tracking-wide ${
                success
                  ? "bg-secondary/20 border-secondary text-secondary"
                  : "bg-primary border-primary text-white hover:bg-primary/95 shadow shadow-primary/10"
              }`}
            >
              {loading ? (
                <>
                  <Loader2 className="h-4.5 w-4.5 animate-spin" />
                  Adding to Shopping Cart...
                </>
              ) : success ? (
                <>
                  <Check className="h-4.5 w-4.5 animate-bounce" />
                  Successfully Added!
                </>
              ) : (
                <>
                  <ShoppingCart className="h-4.5 w-4.5" />
                  Add to Shopping Cart
                </>
              )}
            </button>
          </div>
        </>
      ) : (
        <button
          disabled
          className="w-full h-12 rounded-xl bg-white/5 border border-white/5 text-xs text-white/40 cursor-not-allowed font-semibold tracking-wide"
        >
          Product Unavailable (Out of Stock)
        </button>
      )}

    </div>
  );
}
