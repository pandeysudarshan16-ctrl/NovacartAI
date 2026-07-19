"use client";

import React, { useEffect, useState } from "react";
import { apiClient } from "@/lib/api-client";
import { User, Store, ShieldAlert, CheckCircle, XCircle, Loader2 } from "lucide-react";
import { AnimatePresence } from "framer-motion";

interface Seller {
  id: string;
  shopName: string;
  shopDescription: string | null;
  gstin: string | null;
  taxId: string | null;
  verificationStatus: "PENDING" | "APPROVED" | "REJECTED";
  createdAt: string;
  user: {
    name: string;
    email: string;
    phoneNumber: string | null;
  };
}

export default function AdminSellersPage() {
  const [sellers, setSellers] = useState<Seller[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const fetchSellers = async () => {
    try {
      const data = await apiClient.get<Seller[]>("/api/admin/sellers");
      setSellers(data);
    } catch (err) {
      console.error("Failed to load sellers", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchSellers();
  }, []);

  const handleUpdateStatus = async (sellerId: string, status: "APPROVED" | "REJECTED" | "PENDING") => {
    setUpdatingId(sellerId);
    try {
      await apiClient.put("/api/admin/sellers", { sellerId, status });
      await fetchSellers();
    } catch (err) {
      console.error("Verification update error:", err);
    } finally {
      setUpdatingId(null);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "APPROVED":
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-secondary/15 text-secondary border border-secondary/20 px-2.5 py-0.5 rounded-full uppercase">
            <CheckCircle className="h-3 w-3" /> Approved
          </span>
        );
      case "REJECTED":
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-destructive/15 text-destructive border border-destructive/20 px-2.5 py-0.5 rounded-full uppercase">
            <XCircle className="h-3 w-3" /> Suspended
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-amber-500/15 text-amber-400 border border-amber-500/20 px-2.5 py-0.5 rounded-full uppercase animate-pulse">
            <ShieldAlert className="h-3 w-3" /> Pending Verification
          </span>
        );
    }
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
          <p className="text-xs text-muted-foreground">Loading sellers directory...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      
      {/* Title */}
      <div>
        <h1 className="text-2xl font-extrabold text-white tracking-tight">Sellers Registry</h1>
        <p className="text-xs text-muted-foreground mt-1">
          Review business settings, verify tax identifiers, and moderate merchant permissions.
        </p>
      </div>

      {sellers.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 border border-dashed border-white/10 rounded-3xl text-center p-6 bg-card">
          <div className="h-12 w-12 rounded-2xl bg-white/5 flex items-center justify-center text-muted-foreground mb-4">
            🏢
          </div>
          <h3 className="text-base font-bold text-white mb-2">No registered merchants</h3>
          <p className="text-xs text-muted-foreground max-w-xs">
            Merchants registering on NovaCart AI will automatically appear in this verification list.
          </p>
        </div>
      ) : (
        <div className="rounded-2xl border border-white/5 bg-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-white/5 text-muted-foreground uppercase text-[10px] font-bold border-b border-white/5">
                  <th className="px-6 py-4">Shop details</th>
                  <th className="px-6 py-4">Owner Info</th>
                  <th className="px-6 py-4">Tax Registry</th>
                  <th className="px-6 py-4">Verification</th>
                  <th className="px-6 py-4">Onboard Date</th>
                  <th className="px-6 py-4 text-right">Verification Controls</th>
                </tr>
              </thead>
              <tbody>
                <AnimatePresence mode="popLayout">
                  {sellers.map((seller) => (
                    <tr key={seller.id} className="border-b border-white/5 hover:bg-white/[0.01] transition">
                      
                      {/* Shop Name */}
                      <td className="px-6 py-4 flex items-center gap-3">
                        <div className="h-10 w-10 overflow-hidden rounded-xl bg-muted flex items-center justify-center border border-white/5">
                          <Store className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-white truncate max-w-xs">{seller.shopName}</h4>
                          <span className="text-[10px] text-muted-foreground line-clamp-1 max-w-[15rem]">
                            {seller.shopDescription || "No description set."}
                          </span>
                        </div>
                      </td>

                      {/* Owner Info */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1.5 text-white font-semibold">
                          <User className="h-3.5 w-3.5 text-primary" />
                          {seller.user.name}
                        </div>
                        <p className="text-muted-foreground mt-0.5">{seller.user.email}</p>
                      </td>

                      {/* Tax Settings */}
                      <td className="px-6 py-4 text-muted-foreground">
                        {seller.gstin && (
                          <div className="text-[10px] uppercase font-bold text-white bg-white/5 rounded px-1.5 py-0.5 w-fit border border-white/5 mb-1">
                            GSTIN: {seller.gstin}
                          </div>
                        )}
                        {seller.taxId && (
                          <div className="text-[10px] uppercase font-bold text-white bg-white/5 rounded px-1.5 py-0.5 w-fit border border-white/5">
                            VAT: {seller.taxId}
                          </div>
                        )}
                        {!seller.gstin && !seller.taxId && <span className="text-[10px]">No tax details submitted</span>}
                      </td>

                      {/* Status */}
                      <td className="px-6 py-4">
                        {getStatusBadge(seller.verificationStatus)}
                      </td>

                      {/* Date */}
                      <td className="px-6 py-4 text-muted-foreground">
                        {new Date(seller.createdAt).toLocaleDateString()}
                      </td>

                      {/* Controls */}
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {seller.verificationStatus === "PENDING" && (
                            <>
                              <button
                                onClick={() => handleUpdateStatus(seller.id, "APPROVED")}
                                disabled={updatingId === seller.id}
                                className="h-8 px-3 rounded-lg bg-secondary hover:bg-secondary/90 text-[10px] font-bold text-secondary-foreground transition disabled:opacity-50"
                              >
                                Approve
                              </button>
                              <button
                                onClick={() => handleUpdateStatus(seller.id, "REJECTED")}
                                disabled={updatingId === seller.id}
                                className="h-8 px-3 rounded-lg bg-destructive hover:bg-destructive/90 text-[10px] font-bold text-white transition disabled:opacity-50"
                              >
                                Reject
                              </button>
                            </>
                          )}
                          {seller.verificationStatus === "APPROVED" && (
                            <button
                              onClick={() => handleUpdateStatus(seller.id, "REJECTED")}
                              disabled={updatingId === seller.id}
                              className="h-8 px-3 rounded-lg bg-amber-500/15 border border-amber-500/20 hover:bg-amber-500 hover:text-white text-amber-400 text-[10px] font-bold transition disabled:opacity-50"
                            >
                              Suspend Merchant
                            </button>
                          )}
                          {seller.verificationStatus === "REJECTED" && (
                            <button
                              onClick={() => handleUpdateStatus(seller.id, "APPROVED")}
                              disabled={updatingId === seller.id}
                              className="h-8 px-3 rounded-lg bg-secondary hover:bg-secondary/90 text-[10px] font-bold text-secondary-foreground transition disabled:opacity-50"
                            >
                              Re-Approve
                            </button>
                          )}
                        </div>
                      </td>

                    </tr>
                  ))}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
        </div>
      )}

    </div>
  );
}
