"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Category } from "@prisma/client";
import { SlidersHorizontal, Search } from "lucide-react";

interface CatalogFiltersProps {
  categories: Category[];
  initialFilters: {
    categorySlug?: string;
    query?: string;
    minPrice?: string;
    maxPrice?: string;
    sort?: string;
  };
}

export default function CatalogFilters({ categories, initialFilters }: CatalogFiltersProps) {
  const router = useRouter();

  const [query, setQuery] = useState(initialFilters.query || "");
  const [categorySlug, setCategorySlug] = useState(initialFilters.categorySlug || "");
  const [minPrice, setMinPrice] = useState(initialFilters.minPrice || "");
  const [maxPrice, setMaxPrice] = useState(initialFilters.maxPrice || "");
  const [sort, setSort] = useState(initialFilters.sort || "newest");

  const handleApplyFilters = (e: React.FormEvent) => {
    e.preventDefault();

    const params = new URLSearchParams();
    if (query.trim()) params.set("query", query.trim());
    if (categorySlug) params.set("categorySlug", categorySlug);
    if (minPrice) params.set("minPrice", minPrice);
    if (maxPrice) params.set("maxPrice", maxPrice);
    if (sort) params.set("sort", sort);

    router.push(`/products?${params.toString()}`);
  };

  const handleClear = () => {
    setQuery("");
    setCategorySlug("");
    setMinPrice("");
    setMaxPrice("");
    setSort("newest");
    router.push("/products");
  };

  return (
    <form onSubmit={handleApplyFilters} className="space-y-6">
      
      {/* Header */}
      <div className="flex items-center justify-between gap-2 border-b border-white/5 pb-4">
        <div className="flex items-center gap-2 font-bold text-sm text-white">
          <SlidersHorizontal className="h-4 w-4 text-primary" />
          Filter & Sort
        </div>
        <button
          type="button"
          onClick={handleClear}
          className="text-[10px] font-semibold text-primary hover:underline"
        >
          Reset All
        </button>
      </div>

      {/* Search Input */}
      <div className="space-y-2">
        <label className="text-xs font-semibold text-white">Search Keywords</label>
        <div className="relative">
          <input
            type="text"
            placeholder="Keyword search..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full h-9 pl-9 pr-3 rounded-xl bg-muted border border-white/10 focus:outline-none focus:border-primary/50 text-xs text-white"
          />
          <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
        </div>
      </div>

      {/* Sort Select */}
      <div className="space-y-2">
        <label className="text-xs font-semibold text-white">Sort By</label>
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value)}
          className="w-full h-9 px-3 rounded-xl bg-muted border border-white/10 focus:outline-none focus:border-primary/50 text-xs text-white"
        >
          <option value="newest">Newest Arrivals</option>
          <option value="price-low">Price: Low to High</option>
          <option value="price-high">Price: High to Low</option>
          <option value="name-asc">Alphabetical: A-Z</option>
          <option value="name-desc">Alphabetical: Z-A</option>
        </select>
      </div>

      {/* Category List */}
      <div className="space-y-2">
        <label className="text-xs font-semibold text-white">Categories</label>
        <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
          <label className="flex items-center gap-2 text-xs text-muted-foreground hover:text-white cursor-pointer py-1">
            <input
              type="radio"
              name="category"
              checked={categorySlug === ""}
              onChange={() => setCategorySlug("")}
              className="accent-primary h-3.5 w-3.5"
            />
            All Categories
          </label>
          {categories.map((cat) => (
            <label
              key={cat.id}
              className="flex items-center gap-2 text-xs text-muted-foreground hover:text-white cursor-pointer py-1"
            >
              <input
                type="radio"
                name="category"
                checked={categorySlug === cat.slug}
                onChange={() => setCategorySlug(cat.slug)}
                className="accent-primary h-3.5 w-3.5"
              />
              {cat.name}
            </label>
          ))}
        </div>
      </div>

      {/* Price Range */}
      <div className="space-y-2">
        <label className="text-xs font-semibold text-white">Price Range (₹)</label>
        <div className="grid grid-cols-2 gap-2">
          <input
            type="number"
            placeholder="Min"
            value={minPrice}
            onChange={(e) => setMinPrice(e.target.value)}
            className="w-full h-9 px-3 rounded-xl bg-muted border border-white/10 focus:outline-none focus:border-primary/50 text-xs text-white"
          />
          <input
            type="number"
            placeholder="Max"
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value)}
            className="w-full h-9 px-3 rounded-xl bg-muted border border-white/10 focus:outline-none focus:border-primary/50 text-xs text-white"
          />
        </div>
      </div>

      {/* Apply Button */}
      <button
        type="submit"
        className="w-full py-2.5 rounded-xl bg-primary hover:bg-primary/90 text-xs font-semibold text-primary-foreground transition shadow shadow-primary/15"
      >
        Apply Filters
      </button>

    </form>
  );
}
