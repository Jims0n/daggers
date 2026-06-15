'use client';

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

const slides = [
  {
    id: 1,
    image: "/images/scafslide1.jpeg",
    title: "SCARF SEASON",
    subtitle: "The Daggers Leopard Scarf is here",
    cta: "Shop Now",
    link: "/product/daggers-leopard-scarf",
  },
  {
    id: 2,
    image: "/images/scafslide2.jpeg",
    title: "ACCESSORISE",
    subtitle: "Premium accessories for the bold",
    cta: "View Scarf",
    link: "/product/daggers-leopard-scarf",
  },
  {
    id: 3,
    image: "/images/slide1.jpeg",
    title: "PEOPLE LIKE US",
    subtitle: "Premium streetwear for those who move different",
    cta: "Shop Now",
    link: "/search",
  },
  {
    id: 4,
    image: "/images/slide2.jpeg",
    title: "NEW DROP",
    subtitle: "The latest from Daggers — limited pieces, unlimited style",
    cta: "View Collection",
    link: "/search",
  },
  {
    id: 5,
    image: "/images/slide3.jpeg",
    title: "DAGGERS ORIGINAL",
    subtitle: "Designed for comfort. Built for the streets.",
    cta: "Shop Hoodies",
    link: "/search?category=Hoodies",
  },
];

export function HeroSlider() {
  const [current, setCurrent] = useState(0);
  const [prev, setPrev] = useState<number | null>(null);

  const goTo = useCallback((index: number) => {
    if (index === current) return;
    setPrev(current);
    setCurrent(index);
  }, [current]);

  // Auto-advance
  useEffect(() => {
    const timer = setInterval(() => {
      setPrev(current);
      setCurrent((c) => (c + 1) % slides.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [current]);

  // Clear prev after transition completes
  useEffect(() => {
    if (prev === null) return;
    const t = setTimeout(() => setPrev(null), 900);
    return () => clearTimeout(t);
  }, [prev]);

  const slide = slides[current];

  return (
    <div className="relative h-[85vh] w-full overflow-hidden bg-black">
      {/* Previous slide (fading out underneath) */}
      {prev !== null && (
        <div className="absolute inset-0 z-0">
          <Image
            src={slides[prev].image}
            alt={slides[prev].title}
            fill
            className="object-cover object-top"
          />
        </div>
      )}

      {/* Current slide (fading in on top) */}
      <div
        key={slide.id}
        className="absolute inset-0 z-10 animate-in fade-in duration-700"
      >
        <Image
          src={slide.image}
          alt={slide.title}
          fill
          priority
          className="object-cover object-top"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-black/10" />
      </div>

      {/* Content */}
      <div className="absolute inset-0 z-20 flex items-end pointer-events-none">
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20 sm:pb-28">
          <div
            key={slide.id}
            className="max-w-md animate-in slide-in-from-bottom-4 fade-in duration-500"
          >
            <h1 className="font-display text-4xl sm:text-5xl md:text-6xl font-bold text-white uppercase tracking-tight leading-[0.95]">
              {slide.title}
            </h1>
            <p className="mt-3 text-sm sm:text-base text-white/70">
              {slide.subtitle}
            </p>
            <Link
              href={slide.link}
              className="pointer-events-auto inline-flex items-center gap-2 mt-6 px-6 py-3 bg-white text-black text-xs font-semibold uppercase tracking-widest hover:bg-white/90 transition-colors"
            >
              {slide.cta}
              <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </div>

      {/* Indicators */}
      <div className="absolute bottom-8 right-4 sm:right-8 z-20 flex items-center gap-2">
        <span className="text-[10px] text-white/40 font-mono mr-1">
          {String(current + 1).padStart(2, '0')}/{String(slides.length).padStart(2, '0')}
        </span>
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => goTo(i)}
            className={cn(
              "h-0.5 transition-all duration-500",
              i === current ? "w-6 bg-white" : "w-3 bg-white/25 hover:bg-white/50"
            )}
            aria-label={`Slide ${i + 1}`}
          />
        ))}
      </div>
    </div>
  );
} 