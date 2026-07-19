"use client";

import React, { useEffect, useState } from "react";
import { apiClient } from "@/lib/api-client";
import { 
  Truck, 
  MapPin, 
  Phone, 
  User, 
  Package, 
  DollarSign, 
  Lock,
  Loader2,
  Map
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface OrderItem {
  id: string;
  quantity: number;
  product: {
    name: string;
    images: string[];
  };
}

interface Order {
  id: string;
  createdAt: string;
  items: OrderItem[];
  customer: {
    name: string;
    phoneNumber: string | null;
  };
  shippingAddress: {
    street: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
}

interface ActiveDelivery {
  id: string;
  status: "ASSIGNED" | "PICKED_UP" | "DELIVERED" | "FAILED";
  otpCode: string;
  order: {
    id: string;
    customer: {
      name: string;
      email: string;
      phoneNumber: string | null;
    };
    shippingAddress: {
      street: string;
      city: string;
      state: string;
      postalCode: string;
      country: string;
    };
    items: OrderItem[];
  };
}

interface DeliveryProfileData {
  id: string;
  isOnline: boolean;
  vehicleType: string;
  vehicleNumber: string | null;
}

export default function DeliveryDashboardPage() {
  const [profile, setProfile] = useState<DeliveryProfileData | null>(null);
  const [queue, setQueue] = useState<Order[]>([]);
  const [active, setActive] = useState<ActiveDelivery | null>(null);
  const [loading, setLoading] = useState(true);

  // Interaction states
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [otpValue, setOtpValue] = useState("");
  const [otpError, setOtpError] = useState<string | null>(null);

  const loadData = async () => {
    try {
      const prof = await apiClient.get<DeliveryProfileData>("/api/delivery/profile");
      setProfile(prof);

      const act = await apiClient.get<ActiveDelivery | null>("/api/delivery/active");
      setActive(act);

      if (prof.isOnline && !act) {
        const q = await apiClient.get<Order[]>("/api/delivery/queue");
        setQueue(q);
      }
    } catch (err) {
      console.error("Failed to load delivery dashboard data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadData();
  }, []);

  const handleAcceptDelivery = async (orderId: string) => {
    setUpdatingId(orderId);
    try {
      await apiClient.put("/api/delivery/accept", { orderId });
      await loadData();
    } catch (err) {
      const errMsg = err instanceof Error ? err.message : "Failed to assign package";
      alert(errMsg);
    } finally {
      setUpdatingId(null);
    }
  };

  const handleConfirmPickup = async (orderId: string) => {
    setUpdatingId(orderId);
    try {
      await apiClient.put("/api/delivery/pickup", { orderId });
      await loadData();
    } catch (err) {
      const errMsg = err instanceof Error ? err.message : "Pickup confirmation failed";
      alert(errMsg);
    } finally {
      setUpdatingId(null);
    }
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!active || otpValue.length !== 4) return;

    setOtpError(null);
    setUpdatingId(active.order.id);
    try {
      await apiClient.put("/api/delivery/complete", {
        orderId: active.order.id,
        otpCode: otpValue,
      });
      setOtpValue("");
      setActive(null);
      await loadData();
    } catch (err) {
      const errMsg = err instanceof Error ? err.message : "Invalid OTP code";
      setOtpError(errMsg);
    } finally {
      setUpdatingId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
          <p className="text-xs text-muted-foreground">Refreshing shipping logs...</p>
        </div>
      </div>
    );
  }

  // State 1: Offline
  if (profile && !profile.isOnline) {
    return (
      <div className="flex flex-col items-center justify-center py-20 border border-dashed border-white/10 rounded-3xl text-center p-6 bg-card space-y-6">
        <div className="h-16 w-16 rounded-3xl bg-white/5 flex items-center justify-center text-muted-foreground">
          😴
        </div>
        <div className="space-y-2">
          <h3 className="text-base font-bold text-white">You are currently Offline</h3>
          <p className="text-xs text-muted-foreground max-w-sm">
            Toggle your availability to &quot;Go Online&quot; in the header to browse active delivery package queues and begin routing assignments.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      
      {/* Active Shipment Display */}
      {active ? (
        <div className="space-y-6">
          <div>
            <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2">
              <Truck className="h-6 w-6 text-primary" />
              Active Assignment
            </h1>
            <p className="text-xs text-muted-foreground mt-1">
              Fulfill your current dispatch route. Confirm pickup at seller store and verify doorstep completion with OTP.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
            
            {/* Left shipment card details */}
            <div className="md:col-span-8 space-y-4">
              <div className="rounded-2xl border border-white/5 bg-card p-6 space-y-6">
                
                {/* ID Header */}
                <div className="flex justify-between items-center border-b border-white/5 pb-3 gap-4">
                  <div>
                    <span className="text-[10px] text-muted-foreground font-bold uppercase">Shipment ID</span>
                    <h4 className="text-xs font-bold text-white uppercase">{active.id}</h4>
                  </div>
                  <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase ${
                    active.status === "PICKED_UP" 
                      ? "bg-purple-500/15 text-purple-400 border border-purple-500/20" 
                      : "bg-blue-500/15 text-blue-400 border border-blue-500/20"
                  }`}>
                    {active.status === "PICKED_UP" ? "Out for Delivery" : "Assigned (Pickup)"}
                  </span>
                </div>

                {/* Shipping info */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs leading-relaxed">
                  <div className="space-y-2">
                    <span className="text-[10px] text-muted-foreground font-bold uppercase block">Customer Details</span>
                    <div className="flex items-center gap-1.5 text-white font-semibold">
                      <User className="h-4 w-4 text-primary" />
                      {active.order.customer.name}
                    </div>
                    {active.order.customer.phoneNumber && (
                      <div className="flex items-center gap-1.5 text-muted-foreground mt-1">
                        <Phone className="h-3.5 w-3.5 text-primary" />
                        {active.order.customer.phoneNumber}
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <span className="text-[10px] text-muted-foreground font-bold uppercase block">Doorstep Address</span>
                    <div className="flex items-start gap-1.5 text-muted-foreground">
                      <MapPin className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                      <span>
                        {active.order.shippingAddress.street}, {active.order.shippingAddress.city}, {active.order.shippingAddress.state} {active.order.shippingAddress.postalCode}, {active.order.shippingAddress.country}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Items overview */}
                <div className="space-y-3 border-t border-white/5 pt-4">
                  <span className="text-[10px] text-muted-foreground uppercase font-bold block">Package Items</span>
                  {active.order.items.map((item) => (
                    <div key={item.id} className="flex justify-between items-center gap-4 text-xs py-2 border-b border-white/5 last:border-0">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 overflow-hidden rounded-lg bg-muted border border-white/5 flex-shrink-0">
                          <img src={item.product.images[0] || "/placeholder-product.png"} alt={item.product.name} className="h-full w-full object-cover" />
                        </div>
                        <h5 className="font-semibold text-white">{item.product.name}</h5>
                      </div>
                      <span className="text-muted-foreground font-bold font-mono">Qty: {item.quantity}</span>
                    </div>
                  ))}
                </div>

              </div>

              {/* Vector Mock Route Map */}
              {active.status === "PICKED_UP" && (
                <div className="rounded-2xl border border-white/5 bg-card p-6 space-y-4">
                  <div className="flex justify-between items-center gap-4">
                    <span className="text-[10px] text-muted-foreground font-bold uppercase flex items-center gap-1">
                      <Map className="h-4 w-4 text-primary" /> Route GPS Guide
                    </span>
                    <span className="text-xs font-bold text-white">Estimated Distance: 1.8 km (6 mins)</span>
                  </div>

                  {/* SVG Route Map */}
                  <div className="h-40 rounded-xl bg-white/[0.02] border border-white/5 relative overflow-hidden flex items-center justify-center p-4">
                    <svg viewBox="0 0 400 150" className="w-full h-full">
                      {/* Grid routes lines */}
                      <path d="M 10 10 L 390 10 M 10 75 L 390 75 M 10 140 L 390 140 M 80 10 L 80 140 M 320 10 L 320 140" stroke="rgba(255,255,255,0.03)" strokeWidth="4" />
                      
                      {/* Routing path */}
                      <path d="M 80 75 L 200 75 C 250 75, 250 110, 320 110" fill="none" stroke="var(--color-primary)" strokeWidth="4" strokeDasharray="6 4" className="animate-[dash_10s_linear_infinite]" />
                      
                      {/* Pickup marker */}
                      <circle cx="80" cy="75" r="6" fill="#a855f7" stroke="white" strokeWidth="1.5" />
                      <text x="60" y="60" fill="rgba(255,255,255,0.5)" fontSize="8" fontWeight="bold">Store Pickup</text>

                      {/* Drop marker */}
                      <circle cx="320" cy="110" r="6" fill="var(--color-secondary)" stroke="white" strokeWidth="1.5" />
                      <text x="310" y="130" fill="rgba(255,255,255,0.5)" fontSize="8" fontWeight="bold">Customer Home</text>
                    </svg>
                  </div>
                </div>
              )}

            </div>

            {/* Right interaction widget */}
            <div className="md:col-span-4 space-y-4">
              
              {/* Pickup confirmation */}
              {active.status === "ASSIGNED" ? (
                <div className="rounded-2xl border border-white/5 bg-card p-6 space-y-4">
                  <h3 className="text-xs font-bold text-white uppercase">Dispatch Pickup</h3>
                  <p className="text-[10px] text-muted-foreground leading-relaxed">
                    Verify package contents at the vendor storefront. Once you pack and collect the order, confirm pickup below.
                  </p>
                  <button
                    onClick={() => handleConfirmPickup(active.order.id)}
                    disabled={updatingId === active.order.id}
                    className="w-full h-11 flex items-center justify-center gap-1.5 rounded-xl bg-primary hover:bg-primary/95 text-xs font-semibold text-white transition disabled:opacity-50"
                  >
                    {updatingId === active.order.id ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Verifying Pickup...
                      </>
                    ) : (
                      "Confirm Store Pickup"
                    )}
                  </button>
                </div>
              ) : (
                /* OTP Verification doorstep Drop */
                <div className="rounded-2xl border border-white/5 bg-card p-6 space-y-4">
                  <h3 className="text-xs font-bold text-white uppercase flex items-center gap-1.5">
                    <Lock className="h-4 w-4 text-secondary" /> Dropoff Verification
                  </h3>
                  <p className="text-[10px] text-muted-foreground leading-relaxed">
                    Request the delivery OTP from the customer at their doorstep. Entering this code signs delivery completion.
                  </p>
                  
                  <form onSubmit={handleVerifyOTP} className="space-y-3">
                    <input
                      type="text"
                      maxLength={4}
                      placeholder="e.g. 1234"
                      value={otpValue}
                      onChange={(e) => setOtpValue(e.target.value.replace(/\D/g, ""))}
                      className="w-full h-11 text-center font-bold tracking-[0.5rem] rounded-xl bg-muted border border-white/10 text-white placeholder:tracking-normal placeholder:font-normal text-xs"
                      required
                    />

                    {otpError && (
                      <p className="text-[10px] font-semibold text-destructive">{otpError}</p>
                    )}

                    <button
                      type="submit"
                      disabled={otpValue.length !== 4 || updatingId === active.order.id}
                      className="w-full h-11 flex items-center justify-center gap-1.5 rounded-xl bg-secondary hover:bg-secondary/95 text-xs font-bold text-secondary-foreground transition disabled:opacity-50 shadow shadow-secondary/10"
                    >
                      {updatingId === active.order.id ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Verifying code...
                        </>
                      ) : (
                        "Verify & Drop Order"
                      )}
                    </button>
                  </form>
                </div>
              )}

              {/* Security info card */}
              <div className="rounded-2xl border border-white/5 bg-card p-4 flex gap-3 text-xs">
                <Lock className="h-5 w-5 text-secondary flex-shrink-0 mt-0.5" />
                <div>
                  <h5 className="font-semibold text-white">Demonstration Hint</h5>
                  <p className="text-[10px] text-muted-foreground mt-0.5 leading-relaxed">
                    For verification testing, the customer&apos;s generated OTP is: <span className="font-bold text-secondary font-mono bg-white/5 px-1 py-0.5 rounded">{active.otpCode}</span>
                  </p>
                </div>
              </div>

            </div>

          </div>
        </div>
      ) : (
        /* State 3: Active queue browsing */
        <div className="space-y-6">
          <div>
            <h1 className="text-2xl font-extrabold text-white tracking-tight">Available Deliveries</h1>
            <p className="text-xs text-muted-foreground mt-1">
              Select and accept packages packed and waiting at merchant storefront locations.
            </p>
          </div>

          {queue.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 border border-dashed border-white/10 rounded-3xl text-center p-6 bg-card space-y-4">
              <div className="h-12 w-12 rounded-2xl bg-white/5 flex items-center justify-center text-muted-foreground">
                📦
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-bold text-white">All queues cleared</h3>
                <p className="text-xs text-muted-foreground max-w-xs">
                  No packages currently ready for courier collection. Try checking back in a few minutes.
                </p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <AnimatePresence>
                {queue.map((order) => {
                  return (
                    <motion.div
                      key={order.id}
                      layout
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className="rounded-2xl border border-white/5 bg-card p-5 flex flex-col justify-between gap-6"
                    >
                      <div className="space-y-3">
                        <div className="flex justify-between items-start gap-4">
                          <div>
                            <span className="text-[10px] text-muted-foreground font-bold uppercase">Order Package ID</span>
                            <h4 className="text-xs font-mono font-bold text-white uppercase">{order.id.substring(0, 8)}...</h4>
                          </div>
                          
                          <div className="flex items-center gap-1 text-[10px] font-bold text-secondary bg-secondary/10 border border-secondary/20 px-2 py-0.5 rounded-full uppercase">
                            <DollarSign className="h-3 w-3" /> $10.00 Pay
                          </div>
                        </div>

                        {/* Customer Neighborhood */}
                        <div className="text-xs space-y-1.5 border-t border-white/5 pt-3">
                          <div className="flex items-start gap-1.5 text-muted-foreground">
                            <MapPin className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                            <span>Destination: {order.shippingAddress.city}, {order.shippingAddress.state}</span>
                          </div>
                          <div className="flex items-center gap-1.5 text-muted-foreground">
                            <Package className="h-4 w-4 text-primary flex-shrink-0" />
                            <span>Package contents: {order.items.length} items</span>
                          </div>
                        </div>
                      </div>

                      <button
                        onClick={() => handleAcceptDelivery(order.id)}
                        disabled={updatingId === order.id}
                        className="w-full h-10 flex items-center justify-center gap-1.5 rounded-xl bg-primary hover:bg-primary/95 text-xs font-semibold text-white transition disabled:opacity-50 shadow shadow-primary/20"
                      >
                        {updatingId === order.id ? (
                          <>
                            <Loader2 className="h-4.5 w-4.5 animate-spin" />
                            Accepting Package...
                          </>
                        ) : (
                          "Accept Package Delivery"
                        )}
                      </button>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          )}

        </div>
      )}

    </div>
  );
}
