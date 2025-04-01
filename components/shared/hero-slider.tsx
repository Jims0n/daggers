'use client';

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

// Define the slide data
const slides = [
  {
    id: 1,
    image: "/images/slide1.jpeg",
    title: "Urban Essentials",
    subtitle: "Premium hoodies and tracksuits for your daily style",
    cta: "Shop Collection",
    link: "/products?category=Streetwear",
    position: "left",
    textColor: "text-white",
  },
  {
    id: 2,
    image: "/images/slide2.jpeg",
    title: "Pink Edition",
    subtitle: "Stand out with our signature pastel collection",
    cta: "Explore Now",
    link: "/products?category=Casual",
    position: "right",
    textColor: "text-white",
  },
  {
    id: 3,
    image: "/images/slide3.jpeg",
    title: "Daggers Original",
    subtitle: "Iconic hoodies designed for comfort and style",
    cta: "Shop Hoodies",
    link: "/products?category=Hoodies",
    position: "center",
    textColor: "text-white",
  },
  {
    id: 4,
    image: "/images/slide4.jpeg",
    title: "Street Style",
    subtitle: "Elevate your casual look with our premium tracksuits",
    cta: "Shop Tracksuits",
    link: "/products?category=Tracksuits",
    position: "left",
    textColor: "text-white",
  }
];

export function HeroSlider() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  
  const goToNextSlide = useCallback(() => {
    if (isAnimating) return;
    
    setIsAnimating(true);
    setCurrentSlide((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
    
    setTimeout(() => {
      setIsAnimating(false);
    }, 500);
  }, [isAnimating]);
  
  // Auto-advance slides
  useEffect(() => {
    const timer = setTimeout(() => {
      goToNextSlide();
    }, 5000);
    
    return () => clearTimeout(timer);
  }, [currentSlide, goToNextSlide]);
  
  const goToPrevSlide = () => {
    if (isAnimating) return;
    
    setIsAnimating(true);
    setCurrentSlide((prev) => (prev === 0 ? slides.length - 1 : prev - 1));
    
    setTimeout(() => {
      setIsAnimating(false);
    }, 500);
  };
  
  const goToSlide = (index: number) => {
    if (isAnimating || index === currentSlide) return;
    
    setIsAnimating(true);
    setCurrentSlide(index);
    
    setTimeout(() => {
      setIsAnimating(false);
    }, 500);
  };
  
  return (
    <div className="relative h-[60vh] w-full overflow-hidden sm:h-[70vh]">
      {/* Slides */}
      {slides.map((slide, index) => (
        <div
          key={slide.id}
          className={cn(
            "absolute inset-0 transition-opacity duration-1000",
            index === currentSlide ? "opacity-100" : "opacity-0 pointer-events-none"
          )}
        >
          {/* Background Image */}
          <div className="relative h-full w-full">
            <Image
              src={slide.image}
              alt={slide.title}
              fill
              priority
              className="object-cover object-center"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-black/40" />
          </div>
          
          {/* Content */}
          <div className="absolute inset-0 flex items-center">
            <div 
              className={cn(
                "mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8",
                slide.position === "left" ? "text-left" : slide.position === "right" ? "text-right" : "text-center"
              )}
            >
              <div 
                className={cn(
                  "max-w-xl transition-all duration-700 delay-200",
                  slide.position === "left" ? "" : slide.position === "right" ? "ml-auto" : "mx-auto",
                  index === currentSlide ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
                )}
              >
                <h1 
                  className={cn(
                    "text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl", 
                    slide.textColor
                  )}
                >
                  {slide.title}
                </h1>
                <p 
                  className={cn(
                    "mt-4 text-lg sm:text-xl",
                    slide.textColor === "text-white" ? "text-gray-200" : "text-gray-700"
                  )}
                >
                  {slide.subtitle}
                </p>
                <div className="mt-8">
                  <Button asChild size="lg" className="font-medium">
                    <Link href={slide.link}>{slide.cta}</Link>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}
      
      {/* Navigation Controls */}
      <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={cn(
              "h-2 w-8 rounded-full transition-all",
              index === currentSlide
                ? "bg-white"
                : "bg-white/40 hover:bg-white/60"
            )}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
      
      {/* Arrow Controls */}
      <button
        onClick={goToPrevSlide}
        className="absolute left-4 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/20 text-white backdrop-blur-sm transition-all hover:bg-white/30"
        aria-label="Previous slide"
      >
        <ChevronLeft size={24} />
      </button>
      <button
        onClick={goToNextSlide}
        className="absolute right-4 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/20 text-white backdrop-blur-sm transition-all hover:bg-white/30"
        aria-label="Next slide"
      >
        <ChevronRight size={24} />
      </button>
    </div>
  );
} 