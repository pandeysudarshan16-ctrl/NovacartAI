import React from "react";
import Link from "next/link";
import { ProductService } from "@/services/ProductService";
import { prisma } from "@/core/database/prisma";
import ProductCard from "@/components/shared/ProductCard";
import CatalogFilters from "./CatalogFilters";

interface PageProps {
  searchParams: Promise<{
    categorySlug?: string;
    query?: string;
    minPrice?: string;
    maxPrice?: string;
    sort?: string;
    page?: string;
  }>;
}

const MOCK_CATALOG = [
  {
    id: "prod-1",
    name: "AeroSound Pro Wireless Headphone",
    slug: "aerosound-pro-wireless-headphone",
    price: 199.99,
    comparePrice: 249.99,
    images: ["https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&auto=format&fit=crop&q=80"],
    stock: 15,
    categoryId: "cat-electronics",
    category: { slug: "electronics", name: "Electronics" },
    seller: { shopName: "AeroTech Official" },
  },
  {
    id: "prod-2",
    name: "ChronoClassic Minimalist Watch",
    slug: "chronoclassic-minimalist-watch",
    price: 129.00,
    comparePrice: 159.00,
    images: ["https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&auto=format&fit=crop&q=80"],
    stock: 8,
    categoryId: "cat-accessories",
    category: { slug: "accessories", name: "Accessories" },
    seller: { shopName: "Chrono Craft" },
  },
  {
    id: "prod-3",
    name: "NovaFit Active Sports Sneaker",
    slug: "novafit-active-sports-sneaker",
    price: 89.99,
    comparePrice: null,
    images: ["https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&auto=format&fit=crop&q=80"],
    stock: 22,
    categoryId: "cat-fashion",
    category: { slug: "fashion", name: "Fashion" },
    seller: { shopName: "Nova Apparel" },
  },
  {
    id: "prod-4",
    name: "SleekLeather Crossbody Bag",
    slug: "sleekleather-crossbody-bag",
    price: 145.00,
    comparePrice: 185.00,
    images: ["https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=600&auto=format&fit=crop&q=80"],
    stock: 5,
    categoryId: "cat-fashion",
    category: { slug: "fashion", name: "Fashion" },
    seller: { shopName: "Sleek Goods" },
  },
];

export default async function ProductsPage({ searchParams }: PageProps) {
  const resolvedParams = await searchParams;
  const { categorySlug, query, minPrice, maxPrice, sort, page = "1" } = resolvedParams;

  // 1. Fetch categories for filter list
  const categories = await prisma.category.findMany({
    orderBy: { name: "asc" },
  });

  // 2. Fetch products matching filters
  const productService = new ProductService();
  let productsList: (typeof MOCK_CATALOG)[number][] = [];
  let totalCount = 0;

  try {
    const result = await productService.getProducts({
      categorySlug,
      query,
      minPrice,
      maxPrice,
      sort,
      page,
      limit: "12",
    });
    
    if (result.products.length > 0) {
      productsList = result.products as unknown as (typeof MOCK_CATALOG)[number][];
      totalCount = result.total;
    } else {
      // Fallback to filter simulated mock data in memory
      let filtered = [...MOCK_CATALOG];
      
      if (categorySlug) {
        filtered = filtered.filter((p) => p.category.slug === categorySlug);
      }
      if (query) {
        filtered = filtered.filter(
          (p) =>
            p.name.toLowerCase().includes(query.toLowerCase()) ||
            p.seller.shopName.toLowerCase().includes(query.toLowerCase())
        );
      }
      if (minPrice) {
        filtered = filtered.filter((p) => p.price >= parseFloat(minPrice));
      }
      if (maxPrice) {
        filtered = filtered.filter((p) => p.price <= parseFloat(maxPrice));
      }
      if (sort) {
        if (sort === "price-low") filtered.sort((a, b) => a.price - b.price);
        else if (sort === "price-high") filtered.sort((a, b) => b.price - a.price);
        else if (sort === "name-asc") filtered.sort((a, b) => a.name.localeCompare(b.name));
        else if (sort === "name-desc") filtered.sort((a, b) => b.name.localeCompare(a.name));
      }

      productsList = filtered;
      totalCount = filtered.length;
    }
  } catch {
    productsList = MOCK_CATALOG;
    totalCount = MOCK_CATALOG.length;
  }


  const pageNum = parseInt(page, 10) || 1;
  const totalPages = Math.ceil(totalCount / 12) || 1;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 flex-1 flex flex-col gap-8">
      
      {/* Title Header */}
      <div>
        <h1 className="text-3xl font-extrabold text-white tracking-tight">Marketplace Catalog</h1>
        <p className="text-xs text-muted-foreground mt-1">
          Showing {productsList.length} of {totalCount} results available in the store
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 flex-1">
        
        {/* Sidebar Filters */}
        <div className="lg:col-span-1 border border-white/5 rounded-2xl p-6 bg-card h-fit space-y-6">
          <CatalogFilters categories={categories} initialFilters={resolvedParams} />
        </div>

        {/* Product Grid Area */}
        <div className="lg:col-span-3 flex flex-col justify-between gap-8">
          
          {productsList.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 border border-dashed border-white/10 rounded-3xl text-center p-6">
              <div className="h-12 w-12 rounded-2xl bg-white/5 flex items-center justify-center text-muted-foreground mb-4">
                🔍
              </div>
              <h3 className="text-base font-bold text-white mb-2">No products match your filters</h3>
              <p className="text-xs text-muted-foreground max-w-xs mb-6">
                Try widening your price range, choosing another category, or clearing search text.
              </p>
              <Link
                href="/products"
                className="py-2 px-4 rounded-xl bg-primary hover:bg-primary/95 text-xs font-semibold text-white transition"
              >
                Clear All Filters
              </Link>
            </div>
          ) : (
            <>
              {/* Grid */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                {productsList.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="border-t border-white/5 pt-6 flex items-center justify-between gap-4">
                  <span className="text-xs text-muted-foreground">
                    Page {pageNum} of {totalPages}
                  </span>
                  <div className="flex gap-2">
                    {pageNum > 1 && (
                      <Link
                        href={{
                          pathname: "/products",
                          query: { ...resolvedParams, page: (pageNum - 1).toString() },
                        }}
                        className="py-2 px-4 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-semibold text-white border border-white/10 transition"
                      >
                        Previous
                      </Link>
                    )}
                    {pageNum < totalPages && (
                      <Link
                        href={{
                          pathname: "/products",
                          query: { ...resolvedParams, page: (pageNum + 1).toString() },
                        }}
                        className="py-2 px-4 rounded-xl bg-primary hover:bg-primary/90 text-xs font-semibold text-white transition"
                      >
                        Next
                      </Link>
                    )}
                  </div>
                </div>
              )}
            </>
          )}

        </div>
      </div>
    </div>
  );
}
