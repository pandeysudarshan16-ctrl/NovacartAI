"use client";

import React, { useEffect, useState } from "react";
import { apiClient } from "@/lib/api-client";
import { MapPin, Phone, User, Calendar, Loader2, CheckCircle2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface OrderItem {
  id: string;
  price: number;
  quantity: number;
  product: {
    name: string;
    images: string[];
  };
}

interface Order {
  id: string;
  status: string;
  createdAt: string;
  items: OrderItem[];
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
}

export default function SellerOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [fulfillingId, setFulfillingId] = useState<string | null>(null);

  const fetchOrders = async () => {
    try {
      const data = await apiClient.get<Order[]>("/api/seller/orders");
      setOrders(data);
    } catch (err) {
      console.error("Failed to load seller orders", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchOrders();
  }, []);

  const handleFulfillOrder = async (orderId: string) => {
    setFulfillingId(orderId);
    try {
      await apiClient.put(`/api/seller/orders/${orderId}/fulfill`, {});
      // Refresh order list
      await fetchOrders();
    } catch (err) {
      console.error("Fulfillment error:", err);
    } finally {
      setFulfillingId(null);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "PROCESSING":
        return (
          <span className="text-[10px] font-bold bg-blue-500/15 text-blue-400 border border-blue-500/20 px-2.5 py-0.5 rounded-full uppercase">
            In Dispatch
          </span>
        );
      case "SHIPPED":
        return (
          <span className="text-[10px] font-bold bg-purple-500/15 text-purple-400 border border-purple-500/20 px-2.5 py-0.5 rounded-full uppercase">
            In Transit
          </span>
        );
      case "DELIVERED":
        return (
          <span className="text-[10px] font-bold bg-secondary/15 text-secondary border border-secondary/20 px-2.5 py-0.5 rounded-full uppercase">
            Delivered
          </span>
        );
      default:
        return (
          <span className="text-[10px] font-bold bg-amber-500/15 text-amber-400 border border-amber-500/20 px-2.5 py-0.5 rounded-full uppercase animate-pulse">
            Pending Collection
          </span>
        );
    }
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
          <p className="text-xs text-muted-foreground">Loading orders history...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      
      {/* Title */}
      <div>
        <h1 className="text-2xl font-extrabold text-white tracking-tight">Fulfillments</h1>
        <p className="text-xs text-muted-foreground mt-1">
          Review, pack, and transition customer orders containing your listed products.
        </p>
      </div>

      {orders.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 border border-dashed border-white/10 rounded-3xl text-center p-6 bg-card">
          <div className="h-12 w-12 rounded-2xl bg-white/5 flex items-center justify-center text-muted-foreground mb-4">
            📦
          </div>
          <h3 className="text-base font-bold text-white mb-2">No active customer orders</h3>
          <p className="text-xs text-muted-foreground max-w-xs">
            Orders containing your items will appear here automatically for packing and fulfillment.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          <AnimatePresence>
            {orders.map((order) => {
              const orderSubtotal = order.items.reduce((sum, item) => sum + Number(item.price) * item.quantity, 0);
              return (
                <motion.div
                  key={order.id}
                  layout
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="rounded-2xl border border-white/5 bg-card p-6 grid grid-cols-1 lg:grid-cols-12 gap-6"
                >
                  {/* Info Column */}
                  <div className="lg:col-span-8 space-y-4">
                    
                    {/* Header */}
                    <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/5 pb-3">
                      <div className="space-y-0.5">
                        <span className="text-[10px] text-muted-foreground font-bold uppercase">Order ID</span>
                        <h4 className="text-xs font-bold text-white uppercase">{order.id}</h4>
                      </div>
                      
                      <div className="flex items-center gap-4 text-xs font-semibold text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3.5 w-3.5" />
                          {new Date(order.createdAt).toLocaleDateString()}
                        </span>
                        {getStatusBadge(order.status)}
                      </div>
                    </div>

                    {/* Items table */}
                    <div className="space-y-3">
                      <span className="text-[10px] text-muted-foreground uppercase font-bold">Your Items ({order.items.length})</span>
                      {order.items.map((item) => (
                        <div key={item.id} className="flex justify-between items-center gap-4 py-2 border-b border-white/5 last:border-0 text-xs">
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 overflow-hidden rounded-lg bg-muted flex-shrink-0 border border-white/5">
                              <img src={item.product.images[0] || "/placeholder-product.png"} alt={item.product.name} className="h-full w-full object-cover" />
                            </div>
                            <div>
                              <h5 className="font-semibold text-white">{item.product.name}</h5>
                              <p className="text-[10px] text-muted-foreground mt-0.5">Qty: {item.quantity} &times; ${Number(item.price).toFixed(2)}</p>
                            </div>
                          </div>
                          <span className="font-bold text-white">${(Number(item.price) * item.quantity).toFixed(2)}</span>
                        </div>
                      ))}
                    </div>

                  </div>

                  {/* Customer / Fulfillment Column */}
                  <div className="lg:col-span-4 rounded-xl bg-white/[0.02] border border-white/5 p-4 flex flex-col justify-between gap-6 text-xs">
                    
                    {/* Customer */}
                    <div className="space-y-3">
                      <div className="space-y-1">
                        <span className="text-[10px] text-muted-foreground font-bold uppercase">Customer Details</span>
                        <div className="flex items-center gap-2 text-white">
                          <User className="h-3.5 w-3.5 text-primary" />
                          <span className="font-semibold">{order.customer.name}</span>
                        </div>
                        <p className="text-muted-foreground pl-5">{order.customer.email}</p>
                        {order.customer.phoneNumber && (
                          <div className="flex items-center gap-2 text-muted-foreground mt-1">
                            <Phone className="h-3.5 w-3.5 text-primary pl-0.5" />
                            <span>{order.customer.phoneNumber}</span>
                          </div>
                        )}
                      </div>

                      {/* Shipping */}
                      <div className="space-y-1 border-t border-white/5 pt-3">
                        <span className="text-[10px] text-muted-foreground font-bold uppercase">Delivery Address</span>
                        <div className="flex items-start gap-2 text-muted-foreground">
                          <MapPin className="h-3.5 w-3.5 text-primary mt-0.5 flex-shrink-0" />
                          <span>
                            {order.shippingAddress.street}, {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.postalCode}, {order.shippingAddress.country}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="border-t border-white/5 pt-3 flex items-center justify-between gap-4 mt-auto">
                      <div>
                        <p className="text-[10px] uppercase text-muted-foreground">Payout Value</p>
                        <p className="text-base font-black text-secondary">${orderSubtotal.toFixed(2)}</p>
                      </div>

                      {order.status === "PENDING" || order.status === "CONFIRMED" ? (
                        <button
                          onClick={() => handleFulfillOrder(order.id)}
                          disabled={fulfillingId === order.id}
                          className="h-9 px-4 rounded-lg bg-primary hover:bg-primary/95 text-[10px] font-bold text-white transition flex items-center gap-1 shadow shadow-primary/20 disabled:opacity-50"
                        >
                          {fulfillingId === order.id ? (
                            <>
                              <Loader2 className="h-3 w-3 animate-spin" />
                              Fulfilling...
                            </>
                          ) : (
                            "Fulfill Package"
                          )}
                        </button>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-secondary">
                          <CheckCircle2 className="h-4 w-4" /> Ready for pickup
                        </span>
                      )}
                    </div>

                  </div>

                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}

    </div>
  );
}
