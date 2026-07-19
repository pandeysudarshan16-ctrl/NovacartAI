"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { apiClient } from "@/lib/api-client";
import { 
  DollarSign, 
  Package, 
  ShoppingBag, 
  AlertTriangle, 
  TrendingUp,
  Loader2 
} from "lucide-react";
import { motion } from "framer-motion";

interface Metrics {
  revenue: number;
  unitsSold: number;
  activeProducts: number;
  pendingOrders: number;
  outOfStockCount: number;
}

export default function SellerDashboardPage() {
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const data = await apiClient.get<Metrics>("/api/seller/metrics");
        setMetrics(data);
      } catch (err) {
        console.error("Failed to load dashboard metrics", err);
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
          <p className="text-xs text-muted-foreground">Loading sales dashboard...</p>
        </div>
      </div>
    );
  }

  const kpis = [
    {
      name: "Gross Earnings",
      value: `$${(metrics?.revenue || 0).toFixed(2)}`,
      icon: DollarSign,
      color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
    },
    {
      name: "Units Dispatched",
      value: metrics?.unitsSold || 0,
      icon: ShoppingBag,
      color: "text-blue-400 bg-blue-500/10 border-blue-500/20",
    },
    {
      name: "Active Inventory",
      value: metrics?.activeProducts || 0,
      icon: Package,
      color: "text-primary bg-primary/10 border-primary/20",
    },
    {
      name: "Pending Orders",
      value: metrics?.pendingOrders || 0,
      icon: AlertTriangle,
      color: "text-amber-400 bg-amber-500/10 border-amber-500/20",
    },
  ];

  return (
    <div className="space-y-8">
      
      {/* Welcome Banner */}
      <div>
        <h1 className="text-2xl font-extrabold text-white tracking-tight">Sales Overview</h1>
        <p className="text-xs text-muted-foreground mt-1">
          Monitor your gross platform earnings, inventory statuses, and pending order packages.
        </p>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {kpis.map((kpi, idx) => {
          const Icon = kpi.icon;
          return (
            <motion.div
              key={kpi.name}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              className="rounded-2xl border border-white/5 bg-card p-6 flex items-center justify-between gap-4"
            >
              <div className="space-y-1">
                <p className="text-[10px] uppercase font-bold text-muted-foreground">{kpi.name}</p>
                <p className="text-2xl font-black text-white tracking-tight">{kpi.value}</p>
              </div>
              <div className={`flex h-12 w-12 items-center justify-center rounded-xl border ${kpi.color}`}>
                <Icon className="h-5 w-5" />
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* SVG Sales Trend Chart & Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* SVG Chart Card */}
        <div className="lg:col-span-2 rounded-2xl border border-white/5 bg-card p-6 space-y-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">Earnings Trend</h3>
              <p className="text-[10px] text-muted-foreground">Monthly sales performance overview</p>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-secondary font-bold">
              <TrendingUp className="h-4 w-4" />
              +14.2% MoM
            </div>
          </div>

          {/* SVG Vector Chart */}
          <div className="h-60 w-full relative">
            <svg viewBox="0 0 500 200" className="w-full h-full overflow-visible">
              <defs>
                <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--color-primary)" stopOpacity="0.35" />
                  <stop offset="100%" stopColor="var(--color-primary)" stopOpacity="0" />
                </linearGradient>
              </defs>
              
              {/* Grid Lines */}
              <line x1="0" y1="180" x2="500" y2="180" stroke="rgba(255,255,255,0.05)" strokeDasharray="4 4" />
              <line x1="0" y1="120" x2="500" y2="120" stroke="rgba(255,255,255,0.05)" strokeDasharray="4 4" />
              <line x1="0" y1="60" x2="500" y2="60" stroke="rgba(255,255,255,0.05)" strokeDasharray="4 4" />
              
              {/* Fill Under Path */}
              <path
                d="M 0 180 C 50 140, 100 160, 150 90 C 200 20, 250 80, 300 50 C 350 20, 400 110, 450 70 C 475 50, 500 40, 500 40 L 500 180 L 0 180 Z"
                fill="url(#chartGradient)"
              />
              
              {/* Chart Line Path */}
              <path
                d="M 0 180 C 50 140, 100 160, 150 90 C 200 20, 250 80, 300 50 C 350 20, 400 110, 450 70 C 475 50, 500 40, 500 40"
                fill="none"
                stroke="var(--color-primary)"
                strokeWidth="3.5"
                strokeLinecap="round"
              />

              {/* Data points */}
              <circle cx="150" cy="90" r="5" fill="var(--color-primary)" stroke="white" strokeWidth="1.5" />
              <circle cx="300" cy="50" r="5" fill="var(--color-primary)" stroke="white" strokeWidth="1.5" />
              <circle cx="450" cy="70" r="5" fill="var(--color-primary)" stroke="white" strokeWidth="1.5" />
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

        {/* Inventory Status Summary */}
        <div className="rounded-2xl border border-white/5 bg-card p-6 flex flex-col justify-between gap-6">
          <div className="space-y-1">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">Inventory Health</h3>
            <p className="text-[10px] text-muted-foreground">Listing statuses and stock levels</p>
          </div>

          <div className="space-y-4">
            <div className="flex justify-between items-center gap-4 border-b border-white/5 pb-3">
              <span className="text-xs text-muted-foreground">Out of Stock Listings</span>
              <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
                (metrics?.outOfStockCount || 0) > 0 
                  ? "bg-destructive/15 text-destructive border border-destructive/20" 
                  : "bg-secondary/15 text-secondary border border-secondary/20"
              }`}>
                {metrics?.outOfStockCount || 0}
              </span>
            </div>
            <div className="flex justify-between items-center gap-4 border-b border-white/5 pb-3">
              <span className="text-xs text-muted-foreground">Under Review Products</span>
              <span className="text-xs font-bold text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2.5 py-0.5 rounded-full">
                Pending Approval
              </span>
            </div>
            <div className="flex justify-between items-center gap-4">
              <span className="text-xs text-muted-foreground">Platform Commissions</span>
              <span className="text-xs font-bold text-white">8.5% Flat Rate</span>
            </div>
          </div>

          <Link
            href="/seller/products"
            className="w-full text-center py-2.5 rounded-xl border border-white/10 hover:bg-white/5 text-xs font-semibold text-white transition"
          >
            Manage Product Catalog
          </Link>
        </div>

      </div>

    </div>
  );
}
