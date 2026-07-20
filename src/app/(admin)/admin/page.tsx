"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { apiClient } from "@/lib/api-client";
import { 
  TrendingUp, 
  DollarSign, 
  Users, 
  PackageCheck, 
  Clock, 
  Loader2 
} from "lucide-react";
import { motion } from "framer-motion";

interface AdminMetrics {
  gmv: number;
  commissionEarned: number;
  sellersCount: number;
  customersCount: number;
  pendingProducts: number;
  pendingSellers: number;
}

export default function AdminDashboardPage() {
  const [metrics, setMetrics] = useState<AdminMetrics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const data = await apiClient.get<AdminMetrics>("/api/admin/metrics");
        setMetrics(data);
      } catch (err) {
        console.error("Failed to load platform metrics", err);
      } finally {
        setLoading(false);
      }
    };
    fetchMetrics();
  }, []);

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
          <p className="text-xs text-muted-foreground">Loading platform statistics...</p>
        </div>
      </div>
    );
  }

  const cards = [
    {
      name: "Gross Merchandise Value (GMV)",
      value: `$${(metrics?.gmv || 0).toFixed(2)}`,
      icon: DollarSign,
      color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
    },
    {
      name: "Commissions Collected (8.5%)",
      value: `$${(metrics?.commissionEarned || 0).toFixed(2)}`,
      icon: TrendingUp,
      color: "text-primary bg-primary/10 border-primary/20",
    },
    {
      name: "Registered Vendors",
      value: metrics?.sellersCount || 0,
      icon: Users,
      color: "text-blue-400 bg-blue-500/10 border-blue-500/20",
    },
    {
      name: "Customer Accounts",
      value: metrics?.customersCount || 0,
      icon: PackageCheck,
      color: "text-purple-400 bg-purple-500/10 border-purple-500/20",
    },
  ];

  return (
    <div className="space-y-8">
      
      {/* Welcome Banner */}
      <div>
        <h1 className="text-2xl font-extrabold text-white tracking-tight">Platform Insights</h1>
        <p className="text-xs text-muted-foreground mt-1">
          Monitor marketplace transactions, platform commissions, user growth, and validation queues.
        </p>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {cards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <motion.div
              key={card.name}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              className="rounded-2xl border border-white/5 bg-card p-6 flex items-center justify-between gap-4"
            >
              <div className="space-y-1">
                <p className="text-[10px] uppercase font-bold text-muted-foreground">{card.name}</p>
                <p className="text-2xl font-black text-white tracking-tight">{card.value}</p>
              </div>
              <div className={`flex h-12 w-12 items-center justify-center rounded-xl border ${card.color}`}>
                <Icon className="h-5 w-5" />
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* SVGs Sales Trends & Actionable Verification Backlog */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* GMV SVG Chart */}
        <div className="lg:col-span-2 rounded-2xl border border-white/5 bg-card p-6 space-y-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">Gross Transaction Volume</h3>
              <p className="text-[10px] text-muted-foreground">Monthly marketplace GMV metrics</p>
            </div>
            <span className="text-xs font-bold text-secondary bg-secondary/10 border border-secondary/20 px-2 py-0.5 rounded-full">
              Platform Growth: Stable
            </span>
          </div>

          {/* SVG Vector Dual Chart */}
          <div className="h-60 w-full relative">
            <svg viewBox="0 0 500 200" className="w-full h-full overflow-visible">
              {/* Grid Lines */}
              <line x1="0" y1="180" x2="500" y2="180" stroke="rgba(255,255,255,0.05)" strokeDasharray="4 4" />
              <line x1="0" y1="120" x2="500" y2="120" stroke="rgba(255,255,255,0.05)" strokeDasharray="4 4" />
              <line x1="0" y1="60" x2="500" y2="60" stroke="rgba(255,255,255,0.05)" strokeDasharray="4 4" />
              
              {/* GMV Line Path */}
              <path
                d="M 0 170 C 50 150, 100 160, 150 110 C 200 60, 250 100, 300 80 C 350 40, 400 90, 450 60 C 475 40, 500 30, 500 30"
                fill="none"
                stroke="var(--color-primary)"
                strokeWidth="3.5"
                strokeLinecap="round"
              />

              {/* Commission Line Path */}
              <path
                d="M 0 180 C 50 175, 100 177, 150 170 C 200 160, 250 168, 300 164 C 350 155, 400 162, 450 158 C 475 152, 500 150, 500 150"
                fill="none"
                stroke="#a855f7"
                strokeWidth="2"
                strokeLinecap="round"
                strokeDasharray="4 2"
              />

              <circle cx="150" cy="110" r="4.5" fill="var(--color-primary)" stroke="white" strokeWidth="1" />
              <circle cx="300" cy="80" r="4.5" fill="var(--color-primary)" stroke="white" strokeWidth="1" />
              <circle cx="450" cy="60" r="4.5" fill="var(--color-primary)" stroke="white" strokeWidth="1" />
            </svg>
          </div>

          <div className="flex justify-between text-[10px] text-muted-foreground uppercase font-bold px-2">
            <span>Jan</span>
            <span>Feb</span>
            <span>Mar</span>
            <span>Apr</span>
            <span>May</span>
            <span>Jun</span>
          </div>
        </div>

        {/* Backlog review queues */}
        <div className="rounded-2xl border border-white/5 bg-card p-6 flex flex-col justify-between gap-6">
          <div className="space-y-1">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">Moderation Backlog</h3>
            <p className="text-[10px] text-muted-foreground">Verification queues awaiting attention</p>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-white/5 pb-3 gap-4">
              <div className="flex items-center gap-2">
                <Clock className="h-4.5 w-4.5 text-amber-400" />
                <span className="text-xs text-muted-foreground">Pending Products</span>
              </div>
              <span className="text-xs font-bold text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2.5 py-0.5 rounded-full">
                {metrics?.pendingProducts || 0} items
              </span>
            </div>

            <div className="flex items-center justify-between pb-1 gap-4">
              <div className="flex items-center gap-2">
                <Clock className="h-4.5 w-4.5 text-amber-400 animate-pulse" />
                <span className="text-xs text-muted-foreground">Pending Sellers</span>
              </div>
              <span className="text-xs font-bold text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2.5 py-0.5 rounded-full">
                {metrics?.pendingSellers || 0} applications
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 mt-4">
            <Link
              href="/admin/products"
              className="py-2.5 rounded-xl bg-primary hover:bg-primary/90 text-[10px] font-bold text-primary-foreground text-center transition"
            >
              Verify Products
            </Link>
            <Link
              href="/admin/sellers"
              className="py-2.5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-[10px] font-bold text-white text-center transition"
            >
              Verify Sellers
            </Link>
          </div>
        </div>

      </div>

    </div>
  );
}
