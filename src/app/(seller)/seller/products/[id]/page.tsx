"use client";

import React, { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { apiClient } from "@/lib/api-client";
import { Category } from "@prisma/client";
import { ArrowLeft, Trash2, Loader2 } from "lucide-react";

interface PageProps {
  params: Promise<{ id: string }>;
}

interface ProductData {
  name: string;
  categoryId: string;
  price: number | string;
  comparePrice: number | string | null;
  stock: number;
  description: string;
  images: string[];
  specifications: Record<string, unknown> | null;
}

export default function EditProductPage({ params }: PageProps) {
  const { id } = use(params);
  const router = useRouter();
  
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form states
  const [name, setName] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [price, setPrice] = useState("");
  const [comparePrice, setComparePrice] = useState("");
  const [stock, setStock] = useState("");
  const [description, setDescription] = useState("");
  const [images, setImages] = useState<string[]>([]);
  const [currentImageInput, setCurrentImageInput] = useState("");
  const [specifications, setSpecifications] = useState<{ key: string; value: string }[]>([]);

  useEffect(() => {
    const loadProductData = async () => {
      try {
        setLoading(true);
        // Load categories
        const cats = await apiClient.get<Category[]>("/api/categories");
        setCategories(cats);

        // Load product
        const prod = await apiClient.get<ProductData>(`/api/products/id/${id}`);
        setName(prod.name);
        setCategoryId(prod.categoryId);
        setPrice(Number(prod.price).toString());
        setComparePrice(prod.comparePrice ? Number(prod.comparePrice).toString() : "");
        setStock(prod.stock.toString());
        setDescription(prod.description);
        setImages(prod.images || []);
        
        if (prod.specifications) {
          const specList = Object.entries(prod.specifications).map(([key, value]) => ({
            key,
            value: String(value),
          }));
          setSpecifications(specList);
        } else {
          setSpecifications([{ key: "", value: "" }]);
        }
      } catch (err) {
        const errMsg = err instanceof Error ? err.message : "Failed to load product details";
        setError(errMsg);
      } finally {
        setLoading(false);
      }
    };

    loadProductData();
  }, [id]);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim()) return setError("Product name is required");
    if (!description.trim() || description.length < 10) return setError("Description must be at least 10 characters");
    if (!price || parseFloat(price) <= 0) return setError("Price must be a positive number");
    if (!stock || parseInt(stock, 10) < 0) return setError("Stock cannot be negative");
    if (images.length === 0) return setError("At least one product image is required");

    setSubmitting(true);

    const specRecord: Record<string, string> = {};
    specifications.forEach((spec) => {
      if (spec.key.trim() && spec.value.trim()) {
        specRecord[spec.key.trim()] = spec.value.trim();
      }
    });

    try {
      await apiClient.put(`/api/seller/products/${id}`, {
        name,
        categoryId,
        price: parseFloat(price),
        comparePrice: comparePrice ? parseFloat(comparePrice) : null,
        stock: parseInt(stock, 10),
        description,
        images,
        specifications: Object.keys(specRecord).length > 0 ? specRecord : null,
      });
      
      router.push("/seller/products");
    } catch (err) {
      const errMsg = err instanceof Error ? err.message : "Failed to update product details";
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
          <p className="text-xs text-muted-foreground">Loading details for editing...</p>
        </div>
      </div>
    );
  }

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
        <h1 className="text-2xl font-extrabold text-white tracking-tight">Edit Listing</h1>
        <p className="text-xs text-muted-foreground mt-1">
          Make updates to the product price, stock level, description, or media list below.
        </p>
      </div>

      {error && (
        <div className="p-4 rounded-xl border border-destructive/20 bg-destructive/10 text-xs font-semibold text-destructive">
          Error: {error}
        </div>
      )}

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
              placeholder="Product Title"
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
            <label className="text-xs font-bold text-white uppercase">Unit Price ($)</label>
            <input
              type="number"
              step="0.01"
              required
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="Price value"
              className="w-full h-10 px-4 rounded-xl bg-muted border border-white/10 focus:outline-none focus:border-primary text-xs text-white"
            />
          </div>

          {/* Compare Price */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-white uppercase">Compare Price ($ - Optional)</label>
            <input
              type="number"
              step="0.01"
              value={comparePrice}
              onChange={(e) => setComparePrice(e.target.value)}
              placeholder="Original price"
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
              placeholder="Stock units count"
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
              placeholder="Details about product..."
              className="w-full p-4 rounded-xl bg-muted border border-white/10 focus:outline-none focus:border-primary text-xs text-white"
            />
          </div>

          {/* Image URLs Section */}
          <div className="space-y-2 md:col-span-2 border-t border-white/5 pt-4">
            <label className="text-xs font-bold text-white uppercase block">Product Images</label>
            <div className="flex gap-2">
              <input
                type="url"
                placeholder="Image URL link"
                value={currentImageInput}
                onChange={(e) => setCurrentImageInput(e.target.value)}
                className="flex-1 h-10 px-4 rounded-xl bg-muted border border-white/10 focus:outline-none focus:border-primary text-xs text-white"
              />
              <button
                type="button"
                onClick={handleAddImage}
                className="h-10 px-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-xs font-semibold text-white transition flex items-center gap-1"
              >
                Add
              </button>
            </div>

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
                Add Row
              </button>
            </div>

            <div className="space-y-3">
              {specifications.map((spec, idx) => (
                <div key={idx} className="flex gap-3 items-center">
                  <input
                    type="text"
                    placeholder="e.g. Dimensions"
                    value={spec.key}
                    onChange={(e) => handleSpecChange(idx, "key", e.target.value)}
                    className="flex-1 h-10 px-4 rounded-xl bg-muted border border-white/10 focus:outline-none focus:border-primary text-xs text-white"
                  />
                  <input
                    type="text"
                    placeholder="e.g. 10 x 5 inches"
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
                Updating Listing...
              </>
            ) : (
              "Save Changes"
            )}
          </button>
        </div>

      </form>

    </div>
  );
}
