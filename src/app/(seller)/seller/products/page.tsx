"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { apiClient } from "@/lib/api-client";
import { Product, Category } from "@prisma/client";
import { Plus, Edit3, Eye, Loader2, EyeOff } from "lucide-react";

export default function SellerProductsPage() {
  const [products, setProducts] = useState<(Product & { category: Category })[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const data = await apiClient.get<(Product & { category: Category })[]>("/api/seller/products");
        setProducts(data);
      } catch (err) {
        console.error("Failed to load seller products", err);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  const handleToggleActive = async (productId: string, currentActive: boolean) => {
    try {
      const updated = await apiClient.put<Product>(`/api/seller/products/${productId}`, {
        isActive: !currentActive,
      });
      setProducts(
        products.map((p) => (p.id === productId ? { ...p, isActive: updated.isActive } : p))
      );
    } catch (err) {
      console.error("Failed to toggle product status", err);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "APPROVED":
        return (
          <span className="inline-block text-[10px] font-bold bg-secondary/15 text-secondary border border-secondary/20 px-2 py-0.5 rounded-full uppercase">
            Approved
          </span>
        );
      case "REJECTED":
        return (
          <span className="inline-block text-[10px] font-bold bg-destructive/15 text-destructive border border-destructive/20 px-2 py-0.5 rounded-full uppercase">
            Rejected
          </span>
        );
      default:
        return (
          <span className="inline-block text-[10px] font-bold bg-amber-500/15 text-amber-400 border border-amber-500/20 px-2 py-0.5 rounded-full uppercase">
            Pending Review
          </span>
        );
    }
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
          <p className="text-xs text-muted-foreground">Loading products list...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">Product Inventory</h1>
          <p className="text-xs text-muted-foreground mt-1">
            Manage your listings, stock count, prices, and monitor verification approvals.
          </p>
        </div>
        <Link
          href="/seller/products/new"
          className="inline-flex h-10 items-center justify-center rounded-xl bg-primary hover:bg-primary/95 px-4 text-xs font-semibold text-white transition shadow shadow-primary/20 gap-1.5"
        >
          <Plus className="h-4 w-4" />
          Add Product
        </Link>
      </div>

      {/* Grid / Table */}
      {products.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 border border-dashed border-white/10 rounded-3xl text-center p-6 bg-card">
          <div className="h-12 w-12 rounded-2xl bg-white/5 flex items-center justify-center text-muted-foreground mb-4">
            📦
          </div>
          <h3 className="text-base font-bold text-white mb-2">No products in your catalog</h3>
          <p className="text-xs text-muted-foreground max-w-xs mb-6">
            Get started by adding your first product to our marketplace catalog.
          </p>
          <Link
            href="/seller/products/new"
            className="py-2.5 px-4 rounded-xl bg-primary hover:bg-primary/95 text-xs font-semibold text-white transition"
          >
            Add First Product
          </Link>
        </div>
      ) : (
        <div className="rounded-2xl border border-white/5 bg-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-white/5 text-muted-foreground uppercase text-[10px] font-bold border-b border-white/5">
                  <th className="px-6 py-4">Item Details</th>
                  <th className="px-6 py-4">Category</th>
                  <th className="px-6 py-4">Price</th>
                  <th className="px-6 py-4">Stock</th>
                  <th className="px-6 py-4">Verification</th>
                  <th className="px-6 py-4">Visible</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map((product) => (
                  <tr key={product.id} className="border-b border-white/5 hover:bg-white/[0.01] transition">
                    <td className="px-6 py-4 flex items-center gap-3">
                      <div className="h-10 w-10 overflow-hidden rounded-lg bg-muted flex-shrink-0 border border-white/5">
                        <img
                          src={product.images[0] || "/placeholder-product.png"}
                          alt={product.name}
                          className="h-full w-full object-cover"
                        />
                      </div>
                      <div className="min-w-0">
                        <h4 className="font-semibold text-white truncate max-w-xs">{product.name}</h4>
                        <span className="text-[10px] text-muted-foreground">ID: {product.id.substring(0, 8)}...</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-muted-foreground font-medium">
                      {product.category.name}
                    </td>
                    <td className="px-6 py-4 font-bold text-white">
                      ₹{Number(product.price).toFixed(2)}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`font-semibold ${product.stock <= 0 ? "text-destructive" : "text-white"}`}>
                        {product.stock} units
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {getStatusBadge(product.status)}
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => handleToggleActive(product.id, product.isActive)}
                        className={`p-1.5 rounded-lg border transition ${
                          product.isActive
                            ? "bg-secondary/10 border-secondary/20 text-secondary hover:bg-secondary/20"
                            : "bg-white/5 border-white/5 text-muted-foreground hover:bg-white/10"
                        }`}
                        title={product.isActive ? "Hide from public catalog" : "Show in public catalog"}
                      >
                        {product.isActive ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                      </button>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Link
                        href={`/seller/products/${product.id}`}
                        className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 hover:bg-white/5 text-muted-foreground hover:text-white transition"
                        title="Edit product"
                      >
                        <Edit3 className="h-4 w-4" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

    </div>
  );
}
