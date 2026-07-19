import React from "react";
import Link from "next/link";
import { ProductService } from "@/services/ProductService";

import ProductGallery from "./ProductGallery";
import ProductPurchaseActions from "./ProductPurchaseActions";
import { Star, ShieldAlert, ArrowLeft, Store } from "lucide-react";

interface PageProps {
  params: Promise<{
    slug: string;
  }>;
}

const MOCK_CATALOG = [
  {
    id: "prod-1",
    name: "AeroSound Pro Wireless Headphone",
    slug: "aerosound-pro-wireless-headphone",
    description: "Immerse yourself in pure auditory bliss with the AeroSound Pro. Featuring hybrid active noise cancellation, high-resolution audio drivers, and up to 40 hours of battery life, it delivers studio-quality sound wherever you go. The plush memory foam earcups ensure maximum comfort for extended listening sessions.",
    price: 1199.99,
    comparePrice: 1249.99,
    images: ["https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80"],
    stock: 15,
    specifications: {
      "Battery Life": "Up to 40 Hours",
      "Noise Cancellation": "Hybrid Active (ANC)",
      "Connectivity": "Bluetooth 5.2 & 3.5mm Aux",
      "Driver Size": "40mm Dynamic",
      "Weight": "260g",
    },
    seller: { shopName: "AeroTech Official" },
  },
  {
    id: "prod-2",
    name: "ChronoClassic Minimalist Watch",
    slug: "chronoclassic-minimalist-watch",
    description: "Crafted for elegance and precision, the ChronoClassic timepiece offers a minimalist aesthetic that complements any attire. Featuring a scratch-resistant sapphire crystal glass, a premium genuine leather strap, and a Japanese quartz movement, it blends classic craftsmanship with modern engineering.",
    price: 1129.00,
    comparePrice: 1159.00,
    images: ["https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format&fit=crop&q=80"],
    stock: 8,
    specifications: {
      "Movement": "Japanese Quartz",
      "Glass Type": "Sapphire Crystal",
      "Water Resistance": "5 ATM (50 meters)",
      "Strap Material": "Genuine Leather",
      "Case Diameter": "40mm",
    },
    seller: { shopName: "Chrono Craft" },
  },
  {
    id: "prod-3",
    name: "NovaFit Active Sports Sneaker",
    slug: "novafit-active-sports-sneaker",
    description: "Run further and faster with the NovaFit Sports Sneaker. Engineered with a breathable knit upper and a high-rebound cushioning midsole, it absorbs impact and returns energy with every step. The durable rubber outsole offers premium grip on wet and dry surfaces alike.",
    price: 1089.99,
    comparePrice: null,
    images: ["https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&auto=format&fit=crop&q=80"],
    stock: 22,
    specifications: {
      "Upper Material": "Breathable Flyknit",
      "Midsole Technology": "NovaBounce High Rebound",
      "Outsole": "Non-marking Grip Rubber",
      "Pronation": "Neutral Support",
      "Weight": "290g (Size 9)",
    },
    seller: { shopName: "Nova Apparel" },
  },
  {
    id: "prod-4",
    name: "SleekLeather Crossbody Bag",
    slug: "sleekleather-crossbody-bag",
    price: 1145.00,
    comparePrice: 1185.00,
    images: ["https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=800&auto=format&fit=crop&q=80"],
    stock: 5,
    specifications: {
      "Material": "100% Genuine Full-Grain Leather",
      "Dimensions": "9.5\" L x 7\" H x 3\" W",
      "Hardware": "Brushed Brass Zippers",
      "Strap Drop": "Adjustable (20\" - 24\")",
      "Pockets": "1 Exterior Zip, 2 Interior Slip",
    },
    seller: { shopName: "Sleek Goods" },
  },
];

export default async function ProductDetailPage({ params }: PageProps) {
  const { slug } = await params;

  let product: (typeof MOCK_CATALOG)[number] | null = null;

  try {
    const productService = new ProductService();
    product = (await productService.getProductBySlug(slug)) as unknown as (typeof MOCK_CATALOG)[number];
  } catch {
    // Check mock catalog
    product = MOCK_CATALOG.find((p) => p.slug === slug) || null;
  }


  if (!product) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8 text-center space-y-4">
        <ShieldAlert className="mx-auto h-12 w-12 text-destructive" />
        <h2 className="text-xl font-bold text-white">Product Not Found</h2>
        <p className="text-sm text-muted-foreground">The product slug you are trying to reach does not exist.</p>
        <Link
          href="/products"
          className="inline-block mt-4 py-2.5 px-6 rounded-xl bg-primary hover:bg-primary/95 text-xs font-semibold text-white transition"
        >
          Return to Shop Catalog
        </Link>
      </div>
    );
  }

  const specEntries = product.specifications 
    ? Object.entries(product.specifications as unknown as Record<string, string>) 
    : [];

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-12">
      
      {/* Back button */}
      <div>
        <Link href="/products" className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-white transition">
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to Catalog
        </Link>
      </div>

      {/* Main product purchase area */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 lg:gap-12">
        
        {/* Left Column: Image Gallery */}
        <div className="md:col-span-6">
          <ProductGallery images={product.images} name={product.name} />
        </div>

        {/* Right Column: Info & Buy widget */}
        <div className="md:col-span-6 space-y-6">
          
          {/* Vendor */}
          <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
            <Store className="h-4 w-4 text-primary" />
            {product.seller.shopName}
          </div>

          {/* Title */}
          <h1 className="text-3xl font-extrabold text-white tracking-tight leading-tight">
            {product.name}
          </h1>

          {/* Rating */}
          <div className="flex items-center gap-2 border-b border-white/5 pb-4">
            <div className="flex items-center gap-0.5">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className={`h-4 w-4 ${i < 4 ? "fill-secondary text-secondary" : "text-white/20"}`} />
              ))}
            </div>
            <span className="text-xs font-semibold text-white">4.2 / 5.0</span>
            <span className="text-xs text-muted-foreground border-l border-white/10 pl-2">18 Verified Customer Reviews</span>
          </div>

          {/* Description */}
          <p className="text-xs text-muted-foreground leading-relaxed">
            {product.description}
          </p>

          {/* Price Block */}
          <div className="rounded-2xl border border-white/5 bg-card p-4 flex justify-between items-center">
            <div>
              <p className="text-[10px] uppercase text-muted-foreground mb-1">Price</p>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold text-white">₹{Number(product.price).toFixed(2)}</span>
                {product.comparePrice && (
                  <span className="text-xs text-muted-foreground line-through">
                    ₹{Number(product.comparePrice).toFixed(2)}
                  </span>
                )}
              </div>
            </div>
            
            <div className="text-right">
              <p className="text-[10px] uppercase text-muted-foreground mb-1">Availability</p>
              <span className={`inline-block text-xs font-bold px-2 py-0.5 rounded-full ${
                product.stock > 0 
                  ? "bg-secondary/15 text-secondary border border-secondary/20" 
                  : "bg-destructive/15 text-destructive border border-destructive/20"
              }`}>
                {product.stock > 0 ? `${product.stock} In Stock` : "Out of Stock"}
              </span>
            </div>
          </div>

          {/* Purchase Action Panel */}
          <ProductPurchaseActions productId={product.id} stock={product.stock} />

        </div>
      </div>

      {/* Specifications Block */}
      {specEntries.length > 0 && (
        <div className="border-t border-white/5 pt-12 space-y-6">
          <h3 className="text-xl font-bold text-white">Product Specifications</h3>
          <div className="max-w-2xl rounded-2xl border border-white/5 overflow-hidden">
            <table className="w-full text-xs text-left">
              <tbody>
                {specEntries.map(([key, val], idx) => (
                  <tr key={key} className={idx % 2 === 0 ? "bg-card/50" : "bg-transparent"}>
                    <td className="px-6 py-4 font-semibold text-white border-b border-white/5 w-1/3">{key}</td>
                    <td className="px-6 py-4 text-muted-foreground border-b border-white/5">{val}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Mock Review Section */}
      <div className="border-t border-white/5 pt-12 space-y-6">
        <h3 className="text-xl font-bold text-white">Customer Reviews</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
          
          {/* Average metrics card */}
          <div className="md:col-span-4 rounded-2xl border border-white/5 bg-card p-6 h-fit space-y-4">
            <div className="text-center space-y-1">
              <div className="text-4xl font-extrabold text-white">4.2</div>
              <p className="text-xs text-muted-foreground">out of 5 stars</p>
              <div className="flex justify-center gap-0.5">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className={`h-4.5 w-4.5 ${i < 4 ? "fill-secondary text-secondary" : "text-white/20"}`} />
                ))}
              </div>
            </div>

            <div className="space-y-2 border-t border-white/5 pt-4 text-xs">
              <div className="flex items-center gap-2">
                <span className="w-12 text-muted-foreground">5 star</span>
                <div className="flex-1 h-2 rounded-full bg-white/5 overflow-hidden">
                  <div className="h-full bg-secondary rounded-full" style={{ width: "65%" }} />
                </div>
                <span className="w-8 text-right text-muted-foreground">65%</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-12 text-muted-foreground">4 star</span>
                <div className="flex-1 h-2 rounded-full bg-white/5 overflow-hidden">
                  <div className="h-full bg-secondary rounded-full" style={{ width: "20%" }} />
                </div>
                <span className="w-8 text-right text-muted-foreground">20%</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-12 text-muted-foreground">3 star</span>
                <div className="flex-1 h-2 rounded-full bg-white/5 overflow-hidden">
                  <div className="h-full bg-secondary rounded-full" style={{ width: "10%" }} />
                </div>
                <span className="w-8 text-right text-muted-foreground">10%</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-12 text-muted-foreground">2 star</span>
                <div className="flex-1 h-2 rounded-full bg-white/5 overflow-hidden">
                  <div className="h-full bg-secondary rounded-full" style={{ width: "5%" }} />
                </div>
                <span className="w-8 text-right text-muted-foreground">5%</span>
              </div>
            </div>
          </div>

          {/* Review Feed list */}
          <div className="md:col-span-8 space-y-4">
            <div className="rounded-2xl border border-white/5 bg-card p-6 space-y-3">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <h4 className="text-xs font-bold text-white">Emily R.</h4>
                  <div className="flex gap-0.5 mt-1">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="h-3 w-3 fill-secondary text-secondary" />
                    ))}
                  </div>
                </div>
                <span className="text-[10px] text-muted-foreground">2 days ago</span>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Extremely high quality build. Exceeded my expectations. Shipping was incredibly fast too, had to verify with OTP at my doorstep which was very cool and secure!
              </p>
            </div>

            <div className="rounded-2xl border border-white/5 bg-card p-6 space-y-3">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <h4 className="text-xs font-bold text-white">David K.</h4>
                  <div className="flex gap-0.5 mt-1">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className={`h-3 w-3 ${i < 4 ? "fill-secondary text-secondary" : "text-white/20"}`} />
                    ))}
                  </div>
                </div>
                <span className="text-[10px] text-muted-foreground">1 week ago</span>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Product works great, exact matches with the pictures and description. The only downside was a small delay in packing, but once dispatched it reached very fast. Will recommend.
              </p>
            </div>
          </div>

        </div>
      </div>

    </div>
  );
}
