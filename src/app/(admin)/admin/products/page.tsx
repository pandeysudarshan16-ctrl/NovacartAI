"use client";

import React, { useEffect, useState } from "react";
import { apiClient } from "@/lib/api-client";
import { Product, Category } from "@prisma/client";
import { ShieldAlert, Loader2, CheckCircle2, XCircle } from "lucide-react";
import { AnimatePresence } from "framer-motion";

interface ModeratedProduct extends Product {
  category: Category;
  seller: {
    shopName: string;
  };
}

export default function AdminProductsPage() {
  const [products, setProducts] = useState<ModeratedProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const fetchProducts = async () => {
    try {
      const data = await apiClient.get<ModeratedProduct[]>("/api/admin/products");
      setProducts(data);
    } catch (err) {
      console.error("Failed to load products for moderation", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchProducts();
  }, []);

  const handleUpdateStatus = async (productId: string, status: "APPROVED" | "REJECTED" | "PENDING") => {
    setUpdatingId(productId);
    try {
      await apiClient.put("/api/admin/products", { productId, status });
      await fetchProducts();
    } catch (err) {
      console.error("Moderation status update error:", err);
    } finally {
      setUpdatingId(null);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "APPROVED":
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-secondary/15 text-secondary border border-secondary/20 px-2.5 py-0.5 rounded-full uppercase">
            <CheckCircle2 className="h-3.5 w-3.5" /> Approved
          </span>
        );
      case "REJECTED":
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-destructive/15 text-destructive border border-destructive/20 px-2.5 py-0.5 rounded-full uppercase">
            <XCircle className="h-3.5 w-3.5" /> Suspended
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-amber-500/15 text-amber-400 border border-amber-500/20 px-2.5 py-0.5 rounded-full uppercase animate-pulse">
            <ShieldAlert className="h-3.5 w-3.5" /> Pending Approval
          </span>
        );
    }
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
          <p className="text-xs text-muted-foreground">Loading review queue...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      
      {/* Title */}
      <div>
        <h1 className="text-2xl font-extrabold text-white tracking-tight">Product Moderation</h1>
        <p className="text-xs text-muted-foreground mt-1">
          Review new vendor listings, inspect prices/images, and verify catalog compliance.
        </p>
      </div>

      {products.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 border border-dashed border-white/10 rounded-3xl text-center p-6 bg-card">
          <div className="h-12 w-12 rounded-2xl bg-white/5 flex items-center justify-center text-muted-foreground mb-4">
            🔍
          </div>
          <h3 className="text-base font-bold text-white mb-2">No listings to moderate</h3>
          <p className="text-xs text-muted-foreground max-w-xs">
            Product listings created by sellers will appear in this moderation queue for administrator approval.
          </p>
        </div>
      ) : (
        <div className="rounded-2xl border border-white/5 bg-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-white/5 text-muted-foreground uppercase text-[10px] font-bold border-b border-white/5">
                  <th className="px-6 py-4">Product Details</th>
                  <th className="px-6 py-4">Category</th>
                  <th className="px-6 py-4">Seller Store</th>
                  <th className="px-6 py-4">Price / Stock</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Moderation Actions</th>
                </tr>
              </thead>
              <tbody>
                <AnimatePresence mode="popLayout">
                  {products.map((product) => (
                    <tr key={product.id} className="border-b border-white/5 hover:bg-white/[0.01] transition">
                      
                      {/* Product details */}
                      <td className="px-6 py-4 flex items-center gap-3">
                        <div className="h-10 w-10 overflow-hidden rounded-lg bg-muted border border-white/5 flex-shrink-0">
                          <img
                            src={product.images[0] || "/placeholder-product.png"}
                            alt={product.name}
                            className="h-full w-full object-cover"
                          />
                        </div>
                        <div className="min-w-0">
                          <h4 className="font-semibold text-white truncate max-w-xs">{product.name}</h4>
                          <span className="text-[10px] text-muted-foreground line-clamp-1 max-w-[15rem]">
                            {product.description}
                          </span>
                        </div>
                      </td>

                      {/* Category */}
                      <td className="px-6 py-4 text-muted-foreground font-medium">
                        {product.category.name}
                      </td>

                      {/* Shop */}
                      <td className="px-6 py-4 text-white font-semibold">
                        {product.seller.shopName}
                      </td>

                      {/* Price / Stock */}
                      <td className="px-6 py-4 text-muted-foreground">
                        <span className="font-bold text-white block">${Number(product.price).toFixed(2)}</span>
                        <span>{product.stock} units in stock</span>
                      </td>

                      {/* Status */}
                      <td className="px-6 py-4">
                        {getStatusBadge(product.status)}
                      </td>

                      {/* Action buttons */}
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {product.status === "PENDING" && (
                            <>
                              <button
                                onClick={() => handleUpdateStatus(product.id, "APPROVED")}
                                disabled={updatingId === product.id}
                                className="h-8 px-3 rounded-lg bg-secondary hover:bg-secondary/90 text-[10px] font-bold text-secondary-foreground transition disabled:opacity-50"
                              >
                                Approve
                              </button>
                              <button
                                onClick={() => handleUpdateStatus(product.id, "REJECTED")}
                                disabled={updatingId === product.id}
                                className="h-8 px-3 rounded-lg bg-destructive hover:bg-destructive/90 text-[10px] font-bold text-white transition disabled:opacity-50"
                              >
                                Reject
                              </button>
                            </>
                          )}
                          {product.status === "APPROVED" && (
                            <button
                              onClick={() => handleUpdateStatus(product.id, "REJECTED")}
                              disabled={updatingId === product.id}
                              className="h-8 px-3 rounded-lg bg-destructive/10 border border-destructive/20 hover:bg-destructive hover:text-white text-destructive text-[10px] font-bold transition disabled:opacity-50"
                            >
                              Suspend Listing
                            </button>
                          )}
                          {product.status === "REJECTED" && (
                            <button
                              onClick={() => handleUpdateStatus(product.id, "APPROVED")}
                              disabled={updatingId === product.id}
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
