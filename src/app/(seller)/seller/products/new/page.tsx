"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { apiClient } from "@/lib/api-client";
import { Category } from "@prisma/client";
import { ArrowLeft, Plus, Trash2, Loader2 } from "lucide-react";

// Preset Unsplash URLs for quick demo seeding
const MOCK_IMAGE_PRESETS = [
  "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=800&auto=format&fit=crop"
];

export default function NewProductPage() {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form states
  const [name, setName] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [price, setPrice] = useState("");
  const [comparePrice, setComparePrice] = useState("");
  const [stock, setStock] = useState("");
  const [description, setDescription] = useState("");
  
  // Dynamic arrays
  const [images, setImages] = useState<string[]>([]);
  const [currentImageInput, setCurrentImageInput] = useState("");
  
  const [specifications, setSpecifications] = useState<{ key: string; value: string }[]>([
    { key: "", value: "" }
  ]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const data = await apiClient.get<Category[]>("/api/categories");
        setCategories(data);
        if (data.length > 0) setCategoryId(data[0].id);
      } catch (err) {
        console.error("Failed to load categories", err);
      } finally {
        setLoadingCategories(false);
      }
    };
    fetchCategories();
  }, []);

  const handleAddImage = () => {
    if (currentImageInput.trim() && currentImageInput.startsWith("http")) {
      setImages([...images, currentImageInput.trim()]);
      setCurrentImageInput("");
    }
  };

  const handleRemoveImage = (idx: number) => {
    setImages(images.filter((_, i) => i !== idx));
  };

  const handleAddSpecRow = () => {
    setSpecifications([...specifications, { key: "", value: "" }]);
  };

  const handleRemoveSpecRow = (idx: number) => {
    setSpecifications(specifications.filter((_, i) => i !== idx));
  };

  const handleSpecChange = (idx: number, field: "key" | "value", val: string) => {
    setSpecifications(
      specifications.map((spec, i) => (i === idx ? { ...spec, [field]: val } : spec))
    );
  };

  const loadPresetImages = () => {
    setImages([...images, ...MOCK_IMAGE_PRESETS]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim()) return setError("Product name is required");
    if (!description.trim() || description.length < 10) return setError("Description must be at least 10 characters");
    if (!price || parseFloat(price) <= 0) return setError("Price must be a positive number");
    if (!stock || parseInt(stock, 10) < 0) return setError("Stock cannot be negative");
    if (images.length === 0) return setError("At least one product image is required");

    setSubmitting(true);

    // Build specs record
    const specRecord: Record<string, string> = {};
    specifications.forEach((spec) => {
      if (spec.key.trim() && spec.value.trim()) {
        specRecord[spec.key.trim()] = spec.value.trim();
      }
    });

    try {
      await apiClient.post("/api/seller/products", {
        name,
        categoryId,
        price: parseFloat(price),
        comparePrice: comparePrice ? parseFloat(comparePrice) : undefined,
        stock: parseInt(stock, 10),
        description,
        images,
        specifications: Object.keys(specRecord).length > 0 ? specRecord : undefined,
      });
      
      router.push("/seller/products");
    } catch (err) {
      const errMsg = err instanceof Error ? err.message : "Failed to create product listings";
      setError(errMsg);
    } finally {
      setSubmitting(false);
    }

  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      
      {/* Back button */}
      <div>
        <Link href="/seller/products" className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-white transition">
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to Inventory
        </Link>
      </div>

      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-white tracking-tight">Create Listing</h1>
        <p className="text-xs text-muted-foreground mt-1">
          Complete the product details form below. New listings will be queued for administrator validation.
        </p>
      </div>

      {error && (
        <div className="p-4 rounded-xl border border-destructive/20 bg-destructive/10 text-xs font-semibold text-destructive">
          Error: {error}
        </div>
      )}

      {loadingCategories ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6 bg-card border border-white/5 p-6 rounded-2xl">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Title */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-white uppercase">Product Name</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="AeroSound Headphone..."
                className="w-full h-10 px-4 rounded-xl bg-muted border border-white/10 focus:outline-none focus:border-primary text-xs text-white"
              />
            </div>

            {/* Category Select */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-white uppercase">Category</label>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full h-10 px-3 rounded-xl bg-muted border border-white/10 focus:outline-none focus:border-primary text-xs text-white"
              >
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Price */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-white uppercase">Unit Price (₹)</label>
              <input
                type="number"
                step="0.01"
                required
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="99.99"
                className="w-full h-10 px-4 rounded-xl bg-muted border border-white/10 focus:outline-none focus:border-primary text-xs text-white"
              />
            </div>

            {/* Compare Price */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-white uppercase">Compare Price (₹ - Optional)</label>
              <input
                type="number"
                step="0.01"
                value={comparePrice}
                onChange={(e) => setComparePrice(e.target.value)}
                placeholder="129.99"
                className="w-full h-10 px-4 rounded-xl bg-muted border border-white/10 focus:outline-none focus:border-primary text-xs text-white"
              />
            </div>

            {/* Stock */}
            <div className="space-y-2 md:col-span-2">
              <label className="text-xs font-bold text-white uppercase">Available Inventory Stock</label>
              <input
                type="number"
                required
                value={stock}
                onChange={(e) => setStock(e.target.value)}
                placeholder="25"
                className="w-full h-10 px-4 rounded-xl bg-muted border border-white/10 focus:outline-none focus:border-primary text-xs text-white"
              />
            </div>

            {/* Description */}
            <div className="space-y-2 md:col-span-2">
              <label className="text-xs font-bold text-white uppercase">Product Description</label>
              <textarea
                required
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Write detailed specifications or highlights about this product..."
                className="w-full p-4 rounded-xl bg-muted border border-white/10 focus:outline-none focus:border-primary text-xs text-white"
              />
            </div>

            {/* Image URLs Section */}
            <div className="space-y-2 md:col-span-2 border-t border-white/5 pt-4">
              <div className="flex justify-between items-center">
                <label className="text-xs font-bold text-white uppercase">Product Images</label>
                <button
                  type="button"
                  onClick={loadPresetImages}
                  className="text-[10px] font-semibold text-primary hover:underline"
                >
                  Load Mock Image Presets
                </button>
              </div>

              {/* Add image sub-form */}
              <div className="flex gap-2">
                <input
                  type="url"
                  placeholder="https://images.unsplash.com/..."
                  value={currentImageInput}
                  onChange={(e) => setCurrentImageInput(e.target.value)}
                  className="flex-1 h-10 px-4 rounded-xl bg-muted border border-white/10 focus:outline-none focus:border-primary text-xs text-white"
                />
                <button
                  type="button"
                  onClick={handleAddImage}
                  className="h-10 px-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-xs font-semibold text-white transition flex items-center gap-1"
                >
                  <Plus className="h-4 w-4" /> Add
                </button>
              </div>

              {/* List of images */}
              {images.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-2">
                  {images.map((img, idx) => (
                    <div key={idx} className="relative aspect-square rounded-xl overflow-hidden bg-muted group border border-white/10">
                      <img src={img} alt="preview" className="h-full w-full object-cover" />
                      <button
                        type="button"
                        onClick={() => handleRemoveImage(idx)}
                        className="absolute right-2 top-2 p-1.5 rounded-lg bg-destructive/80 text-white hover:bg-destructive transition opacity-0 group-hover:opacity-100"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Specifications Section */}
            <div className="space-y-4 md:col-span-2 border-t border-white/5 pt-4">
              <div className="flex justify-between items-center">
                <label className="text-xs font-bold text-white uppercase">Technical Specifications</label>
                <button
                  type="button"
                  onClick={handleAddSpecRow}
                  className="inline-flex items-center gap-1 text-[10px] font-bold text-primary hover:underline"
                >
                  <Plus className="h-3.5 w-3.5" /> Add Row
                </button>
              </div>

              {/* Rows */}
              <div className="space-y-3">
                {specifications.map((spec, idx) => (
                  <div key={idx} className="flex gap-3 items-center">
                    <input
                      type="text"
                      placeholder="e.g. Battery Life"
                      value={spec.key}
                      onChange={(e) => handleSpecChange(idx, "key", e.target.value)}
                      className="flex-1 h-10 px-4 rounded-xl bg-muted border border-white/10 focus:outline-none focus:border-primary text-xs text-white"
                    />
                    <input
                      type="text"
                      placeholder="e.g. 40 Hours"
                      value={spec.value}
                      onChange={(e) => handleSpecChange(idx, "value", e.target.value)}
                      className="flex-1 h-10 px-4 rounded-xl bg-muted border border-white/10 focus:outline-none focus:border-primary text-xs text-white"
                    />
                    {specifications.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveSpecRow(idx)}
                        className="p-2.5 rounded-lg bg-destructive/10 text-destructive hover:bg-destructive hover:text-white transition"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* Submit button */}
          <div className="border-t border-white/5 pt-6">
            <button
              type="submit"
              disabled={submitting}
              className="w-full h-11 flex items-center justify-center gap-2 rounded-xl bg-primary hover:bg-primary/95 text-xs font-semibold text-white transition shadow shadow-primary/20 disabled:opacity-50"
            >
              {submitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Creating Listing...
                </>
              ) : (
                "Submit Listing"
              )}
            </button>
          </div>

        </form>
      )}

    </div>
  );
}
