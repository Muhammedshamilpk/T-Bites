"use client";

import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, Tag, Percent, Sparkles, Truck, Gift } from "lucide-react";

interface OfferSlide {
  id: string;
  badge: string;
  title: string;
  subtitle: string;
  code?: string;
  bgGradient: string;
  image?: string;
  icon: any;
}

interface Props {
  restaurantName: string;
  foodPhotos?: string[];
}

export function OffersCarousel({ restaurantName, foodPhotos = [] }: Props) {
  const defaultSlides: OfferSlide[] = [
    {
      id: "offer-1",
      badge: "LIMITED TIME OFFER",
      title: "50% OFF Up To ₹100",
      subtitle: `Valid on all first orders at ${restaurantName}`,
      code: "TBITES50",
      bgGradient: "from-red-600 via-rose-600 to-red-700",
      icon: Percent,
    },
    {
      id: "offer-2",
      badge: "FREE DELIVERY",
      title: "Zero Delivery Fee",
      subtitle: "Enjoy free doorstep delivery on orders above ₹299",
      code: "FREEDEL",
      bgGradient: "from-emerald-600 via-teal-600 to-emerald-700",
      icon: Truck,
    },
    {
      id: "offer-3",
      badge: "CHEF'S SPECIAL",
      title: "Flat 20% Cashback",
      subtitle: "Get instant T-Bites reward points on signature dishes",
      code: "SPECIAL20",
      bgGradient: "from-purple-600 via-indigo-600 to-purple-700",
      icon: Gift,
    },
  ];

  // If restaurant uploaded food photos, create visual food slides!
  const photoSlides: OfferSlide[] = foodPhotos.slice(0, 3).map((url, idx) => ({
    id: `photo-${idx}`,
    badge: "FEATURED DISH",
    title: "Freshly Prepared Daily",
    subtitle: `Taste authentic local flavours at ${restaurantName}`,
    bgGradient: "from-neutral-900 via-neutral-800 to-neutral-900",
    image: url,
    icon: Sparkles,
  }));

  const slides = [...defaultSlides, ...photoSlides];
  const [currentSlide, setCurrentSlide] = useState(0);

  // Auto-advance slides every 4 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 4000);
    return () => clearInterval(timer);
  }, [slides.length]);

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  return (
    <div className="relative rounded-3xl overflow-hidden shadow-xl mb-8 group">
      {/* Slides Viewport */}
      <div
        className="flex transition-transform duration-700 ease-out"
        style={{ transform: `translateX(-${currentSlide * 100}%)` }}
      >
        {slides.map((slide) => {
          const IconComp = slide.icon;
          return (
            <div
              key={slide.id}
              className={`w-full shrink-0 min-h-[160px] sm:min-h-[180px] p-6 sm:p-8 bg-gradient-to-r ${slide.bgGradient} text-white flex items-center justify-between relative overflow-hidden`}
            >
              {/* Background food photo if available */}
              {slide.image && (
                <>
                  <img
                    src={slide.image}
                    alt=""
                    className="absolute inset-0 w-full h-full object-cover opacity-35 scale-105 pointer-events-none"
                  />
                  <div className="absolute inset-0 bg-black/40 backdrop-blur-[1px]" />
                </>
              )}

              {/* Slide Content */}
              <div className="relative z-10 space-y-2 max-w-xl">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-[11px] font-extrabold uppercase tracking-wider border border-white/20">
                  <IconComp className="w-3.5 h-3.5 text-white animate-pulse" />
                  {slide.badge}
                </div>

                <h3 className="text-2xl sm:text-3xl font-extrabold tracking-tight drop-shadow-md">
                  {slide.title}
                </h3>

                <p className="text-xs sm:text-sm text-white/90 font-medium leading-relaxed">
                  {slide.subtitle}
                </p>

                {slide.code && (
                  <div className="pt-2 flex items-center gap-2">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-white/90">Coupon:</span>
                    <span className="px-3 py-1 rounded-lg bg-black/30 backdrop-blur-md border border-dashed border-white/40 text-white font-mono text-xs font-black tracking-widest">
                      {slide.code}
                    </span>
                  </div>
                )}
              </div>

              {/* Right Decorative Graphic */}
              {!slide.image && (
                <div className="hidden sm:flex items-center justify-center w-24 h-24 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 text-4xl shrink-0 shadow-inner">
                  🏷️
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Navigation Arrow Buttons */}
      <button
        onClick={prevSlide}
        className="absolute left-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/40 text-white hover:bg-black/70 backdrop-blur-md border border-white/20 opacity-0 group-hover:opacity-100 transition-opacity"
        aria-label="Previous slide"
      >
        <ChevronLeft className="w-5 h-5" />
      </button>

      <button
        onClick={nextSlide}
        className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/40 text-white hover:bg-black/70 backdrop-blur-md border border-white/20 opacity-0 group-hover:opacity-100 transition-opacity"
        aria-label="Next slide"
      >
        <ChevronRight className="w-5 h-5" />
      </button>

      {/* Slide Pagination Indicator Dots */}
      <div className="absolute bottom-3 inset-x-0 flex items-center justify-center gap-2 z-10">
        {slides.map((_, idx) => (
          <button
            key={idx}
            onClick={() => setCurrentSlide(idx)}
            className={`h-2 rounded-full transition-all ${
              currentSlide === idx ? "w-6 bg-white" : "w-2 bg-white/40 hover:bg-white/70"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
