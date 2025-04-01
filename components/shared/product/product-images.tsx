'use client';

import Image from "next/image";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { ChevronLeft, ChevronRight, ZoomIn } from "lucide-react";

const ProductImages = ({ images }: { images: string[] }) => {
  const [current, setCurrent] = useState(0);
  const [isZoomed, setIsZoomed] = useState(false);

  const goToNext = () => {
    setCurrent((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  const goToPrev = () => {
    setCurrent((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const toggleZoom = () => {
    setIsZoomed((prev) => !prev);
  };

  return (
    <div className="space-y-4">
      {/* Main Image Container */}
      <div className="group relative aspect-square overflow-hidden rounded-md bg-gray-100">
        {/* Main Image */}
        <div 
          className={cn(
            "relative h-full w-full transition-all duration-500",
            isZoomed ? "cursor-zoom-out scale-125" : "cursor-zoom-in"
          )}
          onClick={toggleZoom}
        >
          {images.map((image, idx) => (
            <div 
              key={image} 
              className={cn(
                "absolute inset-0 transition-opacity duration-500",
                idx === current ? "opacity-100" : "opacity-0"
              )}
            >
              <Image
                src={image}
                alt={`Product image ${idx + 1}`}
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                priority={idx === 0}
                className="object-contain"
              />
            </div>
          ))}
        </div>

        {/* Zoom Icon */}
        <button 
          onClick={toggleZoom}
          className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full bg-white/80 text-black opacity-0 shadow-md backdrop-blur-sm transition-opacity group-hover:opacity-100"
          aria-label="Zoom image"
        >
          <ZoomIn size={16} />
        </button>

        {/* Navigation Buttons (only show when more than one image) */}
        {images.length > 1 && (
          <>
            <button
              onClick={(e) => {
                e.stopPropagation();
                goToPrev();
              }}
              className="absolute left-4 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-white/80 text-black opacity-0 shadow-md backdrop-blur-sm transition-opacity group-hover:opacity-100"
              aria-label="Previous image"
            >
              <ChevronLeft size={16} />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                goToNext();
              }}
              className="absolute right-4 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-white/80 text-black opacity-0 shadow-md backdrop-blur-sm transition-opacity group-hover:opacity-100"
              aria-label="Next image"
            >
              <ChevronRight size={16} />
            </button>
          </>
        )}
      </div>

      {/* Thumbnails */}
      {images.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-2">
          {images.map((image, index) => (
            <button
              key={image}
              onClick={() => setCurrent(index)}
              className={cn(
                "relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-md border-2 transition-all",
                current === index ? "border-black" : "border-transparent hover:border-gray-300"
              )}
              aria-label={`View image ${index + 1}`}
            >
              <Image
                src={image}
                alt={`Thumbnail ${index + 1}`}
                fill
                sizes="80px"
                className="object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProductImages;