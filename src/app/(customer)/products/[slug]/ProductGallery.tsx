"use client";

import React, { useState } from "react";

interface ProductGalleryProps {
  images: string[];
  name: string;
}

export default function ProductGallery({ images, name }: ProductGalleryProps) {
  const [selectedImage, setSelectedImage] = useState(images[0] || "/placeholder-product.png");

  return (
    <div className="space-y-4">
      {/* Main Large Image Display */}
      <div className="aspect-square overflow-hidden rounded-3xl border border-white/5 bg-card">
        <img
          src={selectedImage}
          alt={name}
          className="h-full w-full object-cover transition-transform duration-300 hover:scale-105"
        />
      </div>

      {/* Thumbnails list */}
      {images.length > 1 && (
        <div className="flex gap-4 overflow-x-auto py-2">
          {images.map((img, idx) => (
            <button
              key={idx}
              onClick={() => setSelectedImage(img)}
              className={`h-20 w-20 flex-shrink-0 overflow-hidden rounded-xl border-2 transition ${
                selectedImage === img ? "border-primary" : "border-transparent bg-card hover:border-white/20"
              }`}
            >
              <img src={img} alt={`${name} thumbnail ${idx}`} className="h-full w-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
