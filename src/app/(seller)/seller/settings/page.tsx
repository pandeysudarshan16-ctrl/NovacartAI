"use client";

import React, { useEffect, useState } from "react";
import { apiClient } from "@/lib/api-client";
import { Store, ShieldCheck, CreditCard, Loader2 } from "lucide-react";

export default function SellerSettingsPage() {
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form states
  const [shopName, setShopName] = useState("");
  const [shopDescription, setShopDescription] = useState("");
  const [gstin, setGstin] = useState("");
  const [taxId, setTaxId] = useState("");
  const [shopLogo, setShopLogo] = useState("");
  const [shopBanner, setShopBanner] = useState("");

  interface SellerProfileData {
    shopName: string;
    shopDescription: string | null;
    gstin: string | null;
    taxId: string | null;
    shopLogo: string | null;
    shopBanner: string | null;
  }

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const data = await apiClient.get<SellerProfileData>("/api/seller/profile");
        setShopName(data.shopName);
        setShopDescription(data.shopDescription || "");
        setGstin(data.gstin || "");
        setTaxId(data.taxId || "");
        setShopLogo(data.shopLogo || "");
        setShopBanner(data.shopBanner || "");
      } catch (err) {
        console.error("Settings load error:", err);
        setError("Failed to load settings profile");
      } finally {
        setLoading(false);
      }
    };
    loadProfile();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    if (!shopName.trim()) return setError("Shop name is required");

    setSubmitting(true);
    try {
      await apiClient.put("/api/seller/profile", {
        shopName,
        shopDescription,
        gstin,
        taxId,
        shopLogo,
        shopBanner,
      });
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      const errMsg = err instanceof Error ? err.message : "Failed to update profile settings";
      setError(errMsg);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
          <p className="text-xs text-muted-foreground">Loading settings details...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      
      {/* Title */}
      <div>
        <h1 className="text-2xl font-extrabold text-white tracking-tight">Shop Settings</h1>
        <p className="text-xs text-muted-foreground mt-1">
          Edit your public storefront parameters, GSTIN compliance tokens, and billing configuration.
        </p>
      </div>

      {success && (
        <div className="p-4 rounded-xl border border-secondary/20 bg-secondary/15 text-xs font-semibold text-secondary">
          Success: Store settings saved and updated successfully.
        </div>
      )}

      {error && (
        <div className="p-4 rounded-xl border border-destructive/20 bg-destructive/10 text-xs font-semibold text-destructive">
          Error: {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6 bg-card border border-white/5 p-6 rounded-2xl">
        
        {/* Basic settings */}
        <div className="space-y-4">
          <h3 className="text-xs font-bold text-white uppercase border-b border-white/5 pb-2 flex items-center gap-1.5">
            <Store className="h-4 w-4 text-primary" /> Storefront Styling
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] uppercase font-bold text-muted-foreground">Shop Name</label>
              <input
                type="text"
                required
                value={shopName}
                onChange={(e) => setShopName(e.target.value)}
                placeholder="Shop name"
                className="w-full h-10 px-4 rounded-xl bg-muted border border-white/10 focus:outline-none focus:border-primary text-xs text-white"
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] uppercase font-bold text-muted-foreground">Logo URL</label>
              <input
                type="url"
                value={shopLogo}
                onChange={(e) => setShopLogo(e.target.value)}
                placeholder="https://..."
                className="w-full h-10 px-4 rounded-xl bg-muted border border-white/10 focus:outline-none focus:border-primary text-xs text-white"
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <label className="text-[10px] uppercase font-bold text-muted-foreground">Banner URL</label>
              <input
                type="url"
                value={shopBanner}
                onChange={(e) => setShopBanner(e.target.value)}
                placeholder="https://..."
                className="w-full h-10 px-4 rounded-xl bg-muted border border-white/10 focus:outline-none focus:border-primary text-xs text-white"
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <label className="text-[10px] uppercase font-bold text-muted-foreground">Shop Description</label>
              <textarea
                rows={3}
                value={shopDescription}
                onChange={(e) => setShopDescription(e.target.value)}
                placeholder="Describe your shop offerings..."
                className="w-full p-4 rounded-xl bg-muted border border-white/10 focus:outline-none focus:border-primary text-xs text-white"
              />
            </div>
          </div>
        </div>

        {/* Compliance settings */}
        <div className="space-y-4 pt-6 border-t border-white/5">
          <h3 className="text-xs font-bold text-white uppercase border-b border-white/5 pb-2 flex items-center gap-1.5">
            <ShieldCheck className="h-4 w-4 text-primary" /> Tax Compliance Verification
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] uppercase font-bold text-muted-foreground">GSTIN Number (India)</label>
              <input
                type="text"
                value={gstin}
                onChange={(e) => setGstin(e.target.value)}
                placeholder="22AAAAA1111A1Z1"
                className="w-full h-10 px-4 rounded-xl bg-muted border border-white/10 focus:outline-none focus:border-primary text-xs text-white uppercase"
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] uppercase font-bold text-muted-foreground">General VAT / Business Tax ID</label>
              <input
                type="text"
                value={taxId}
                onChange={(e) => setTaxId(e.target.value)}
                placeholder="EU123456789"
                className="w-full h-10 px-4 rounded-xl bg-muted border border-white/10 focus:outline-none focus:border-primary text-xs text-white uppercase"
              />
            </div>
          </div>
        </div>

        {/* Payout configuration */}
        <div className="space-y-4 pt-6 border-t border-white/5">
          <h3 className="text-xs font-bold text-white uppercase border-b border-white/5 pb-2 flex items-center gap-1.5">
            <CreditCard className="h-4 w-4 text-primary" /> Payout Banking Details
          </h3>
          <p className="text-[10px] text-muted-foreground leading-relaxed">
            NovaCart AI uses platform escrow to capture checkout charges. Funds are distributed to your connected bank account on a bi-weekly cycle.
          </p>
          <div className="p-4 rounded-xl bg-white/5 border border-white/5 text-[10px] font-semibold text-muted-foreground text-center">
            Escrow Status: <span className="text-secondary font-bold">CONNECTED</span> (Bank Account ending in ...8890)
          </div>
        </div>

        {/* Submit */}
        <div className="border-t border-white/5 pt-6">
          <button
            type="submit"
            disabled={submitting}
            className="w-full h-11 flex items-center justify-center gap-2 rounded-xl bg-primary hover:bg-primary/95 text-xs font-semibold text-primary-foreground transition shadow shadow-primary/20 disabled:opacity-50"
          >
            {submitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Saving Store Settings...
              </>
            ) : (
              "Save Store Settings"
            )}
          </button>
        </div>

      </form>

    </div>
  );
}
