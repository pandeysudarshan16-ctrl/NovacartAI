"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { apiClient } from "@/lib/api-client";
import { 
  CreditCard, 
  MapPin, 
  ArrowLeft, 
  Lock, 
  Loader2,
  ShieldCheck
} from "lucide-react";
import { Order } from "@prisma/client";

export default function CheckoutPage() {
  const { items, loading: cartLoading, cartTotal, cartCount, clearCart } = useCart();
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  // Form states
  const [street, setStreet] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [country, setCountry] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Redirect to cart if empty
  useEffect(() => {
    if (!cartLoading && items.length === 0) {
      router.push("/cart");
    }
  }, [items, cartLoading, router]);

  // Pre-fill user details if default address is available (mocked default values for fast UX)
  useEffect(() => {
    if (user) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setStreet("123 Main Street");
      setCity("Bangalore");
      setState("Karnataka");
      setPostalCode("560001");
      setCountry("India");
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;

    setError(null);
    setSubmitting(true);

    try {
      const order = await apiClient.post<Order>("/api/checkout", {
        street,
        city,
        state,
        postalCode,
        country,
      });

      // Clear cart items client-side
      await clearCart();

      // Redirect to success screen
      router.push(`/checkout/success?orderId=${order.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to place order");
      setSubmitting(false);
    }
  };

  if (cartLoading || authLoading) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 flex-1 flex flex-col items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-xs text-muted-foreground mt-4 font-semibold">Initializing secure checkout environment...</p>
      </div>
    );
  }

  const shippingCost = cartTotal > 150 ? 0.00 : 10.00;
  const estimatedTax = cartTotal * 0.05;
  const finalTotal = cartTotal + shippingCost + estimatedTax;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 flex-1 flex flex-col gap-6 w-full">
      
      {/* Back button */}
      <div>
        <Link href="/cart" className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-white transition">
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to Cart
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Form Column */}
        <div className="lg:col-span-8 space-y-6">
          <div className="rounded-3xl border border-white/5 bg-card p-6 md:p-8 space-y-6">
            
            <div className="space-y-1">
              <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
                <MapPin className="h-5 w-5 text-primary" />
                Shipping Details
              </h2>
              <p className="text-[10px] text-muted-foreground">Specify the doorstep delivery coordinates for this shipment.</p>
            </div>

            {error && (
              <div className="p-4 rounded-xl bg-destructive/15 border border-destructive/20 text-xs font-semibold text-destructive">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              
              <div className="sm:col-span-2 space-y-1.5">
                <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Street Address</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 123 Main Street"
                  value={street}
                  onChange={(e) => setStreet(e.target.value)}
                  className="w-full h-11 px-4 rounded-xl bg-muted border border-white/10 text-xs text-white placeholder:text-muted-foreground/45 focus:outline-none focus:border-primary transition"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">City</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Bangalore"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full h-11 px-4 rounded-xl bg-muted border border-white/10 text-xs text-white placeholder:text-muted-foreground/45 focus:outline-none focus:border-primary transition"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">State / Province</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Karnataka"
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  className="w-full h-11 px-4 rounded-xl bg-muted border border-white/10 text-xs text-white placeholder:text-muted-foreground/45 focus:outline-none focus:border-primary transition"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Postal / ZIP Code</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 560001"
                  value={postalCode}
                  onChange={(e) => setPostalCode(e.target.value)}
                  className="w-full h-11 px-4 rounded-xl bg-muted border border-white/10 text-xs text-white placeholder:text-muted-foreground/45 focus:outline-none focus:border-primary transition"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Country</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. India"
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  className="w-full h-11 px-4 rounded-xl bg-muted border border-white/10 text-xs text-white placeholder:text-muted-foreground/45 focus:outline-none focus:border-primary transition"
                />
              </div>

              <div className="sm:col-span-2 pt-4 border-t border-white/5 space-y-4">
                <h3 className="text-xs font-bold text-white uppercase flex items-center gap-1.5">
                  <CreditCard className="h-4 w-4 text-secondary" /> Payment Method
                </h3>
                <div className="p-4 rounded-2xl bg-white/[0.01] border border-white/5 flex items-center justify-between gap-4">
                  <div>
                    <h4 className="text-xs font-semibold text-white">NovaCart Sandbox Gateway</h4>
                    <p className="text-[10px] text-muted-foreground mt-0.5">Your order will process instantly for staging/fulfillment checks.</p>
                  </div>
                  <span className="text-[9px] uppercase font-bold bg-secondary/15 text-secondary border border-secondary/20 px-2 py-0.5 rounded-full">
                    Active (Demo)
                  </span>
                </div>
              </div>

              <div className="sm:col-span-2 pt-4">
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full h-12 flex items-center justify-center gap-2 rounded-xl bg-primary hover:bg-primary/95 text-xs font-bold text-white transition disabled:opacity-50 shadow shadow-primary/20"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="h-4.5 w-4.5 animate-spin" />
                      Processing Transaction...
                    </>
                  ) : (
                    <>
                      <Lock className="h-4 w-4" />
                      Place Secure Order (₹{finalTotal.toFixed(2)})
                    </>
                  )}
                </button>
              </div>

            </form>
          </div>
        </div>

        {/* Right Summary Sidebar */}
        <div className="lg:col-span-4 space-y-4">
          
          {/* Summary block */}
          <div className="rounded-3xl border border-white/5 bg-card p-6 space-y-6">
            <h3 className="font-bold text-base text-white">Order Summary</h3>
            
            <div className="space-y-4 max-h-60 overflow-y-auto pr-1">
              {items.map((item) => (
                <div key={item.id} className="flex justify-between items-center gap-4 text-xs">
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="h-10 w-10 rounded-lg overflow-hidden bg-muted border border-white/5 flex-shrink-0">
                      <img src={item.product.images[0] || "/placeholder-product.png"} alt={item.product.name} className="h-full w-full object-cover" />
                    </div>
                    <div className="min-w-0">
                      <h4 className="font-semibold text-white truncate max-w-[10rem]">{item.product.name}</h4>
                      <span className="text-[10px] text-muted-foreground">Qty: {item.quantity}</span>
                    </div>
                  </div>
                  <span className="font-semibold text-white">₹{(Number(item.product.price) * item.quantity).toFixed(2)}</span>
                </div>
              ))}
            </div>

            <div className="space-y-3 text-xs border-t border-white/5 pt-4">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal ({cartCount} items)</span>
                <span className="font-semibold text-white">₹{cartTotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Shipping Cost</span>
                <span className="font-semibold text-white">
                  {shippingCost === 0 ? <span className="text-secondary">FREE</span> : `₹${shippingCost.toFixed(2)}`}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Estimated Tax (5%)</span>
                <span className="font-semibold text-white">₹{estimatedTax.toFixed(2)}</span>
              </div>
            </div>

            <div className="flex justify-between items-baseline border-t border-white/5 pt-4">
              <span className="text-sm font-bold text-white">Total</span>
              <span className="text-2xl font-extrabold text-secondary tracking-tight">
                ₹{finalTotal.toFixed(2)}
              </span>
            </div>

            <div className="flex items-center justify-center gap-1.5 text-[9px] text-muted-foreground border-t border-white/5 pt-4">
              <ShieldCheck className="h-4 w-4 text-secondary" />
              Secured by 256-bit SSL Platform encryption
            </div>

          </div>

        </div>

      </div>

    </div>
  );
}
