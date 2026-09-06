import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const heroSlides = [
  {
    image: '/hero2.webp',
    alt: 'Patria Nostra Tactical Model - Back Shield',
    imgClass: 'w-full h-full object-cover object-[60%_top] sm:object-[55%_top] lg:object-[50%_top]'
  },
  {
    image: '/hero3.webp',
    alt: 'Patria Nostra Lookbook - Flag and Hoodies',
    imgClass: 'w-full h-full object-cover sm:object-cover object-[center_15%] sm:object-[center_25%] lg:object-[center_32%]'
  }
];

export const Hero = () => {
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    }, 5500);
    return () => clearInterval(timer);
  }, []);

  return (
    <section className="relative bg-black min-h-[640px] sm:min-h-[740px] lg:min-h-[820px] flex items-center overflow-hidden border-b border-neutral-900">
      
      {/* Large Master Hero Background Model Slider (Right Side Dominant) with Ken Burns Zoom */}
      <div className="absolute right-0 top-0 bottom-0 w-full lg:w-[68%] xl:w-[65%] h-full pointer-events-none select-none z-0 overflow-hidden flex justify-end items-end">
        {heroSlides.map((slide, index) => {
          const isActive = index === currentSlide;
          return (
            <div 
              key={slide.image} 
              className={`absolute inset-0 w-full h-full transition-opacity duration-1000 ease-in-out ${
                isActive ? 'opacity-100 z-10' : 'opacity-0 z-0'
              }`}
            >
              <img 
                src={slide.image} 
                alt={slide.alt} 
                className={`${slide.imgClass} filter contrast-105 brightness-95 transition-transform duration-[6500ms] ease-out ${
                  isActive ? 'scale-105' : 'scale-100'
                }`}
              />
            </div>
          );
        })}
        
        {/* Multi-stage Black Gradients for seamless feathered blend */}
        <div className="absolute inset-y-0 left-0 w-2/5 bg-gradient-to-r from-black via-black/80 to-transparent z-20"></div>
        <div className="absolute inset-x-0 bottom-0 h-20 sm:h-24 bg-gradient-to-t from-black via-black/75 to-transparent z-20"></div>
        <div className="absolute inset-x-0 top-0 h-16 sm:h-20 bg-gradient-to-b from-black/80 to-transparent z-20"></div>

        {/* Subtle Slide Indicators */}
        <div className="absolute bottom-6 right-8 z-30 flex items-center gap-2 pointer-events-auto">
          {heroSlides.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentSlide(idx)}
              className={`h-1 transition-all duration-300 cursor-pointer ${
                idx === currentSlide ? 'w-8 bg-[#C52222]' : 'w-3 bg-neutral-700 hover:bg-neutral-500'
              }`}
              aria-label={`Slide ${idx + 1}`}
            />
          ))}
        </div>
      </div>

      {/* Foreground Content Layer */}
      <div className="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full py-16 lg:py-24">
        <div className="max-w-xl lg:max-w-2xl">
          
          {/* Subtitle Tag */}
          <div className="mb-4 sm:mb-6">
            <span className="text-[#C52222] font-condensed font-bold tracking-[0.25em] text-xs sm:text-sm uppercase inline-block">
              HONOR - LEALTAD - RESISTENCIA
            </span>
          </div>

          {/* Main Gothic Title (Enlarged to match reference proportions) */}
          <h1 className="font-gothic text-7xl sm:text-8xl lg:text-[7.5rem] font-bold text-white leading-[0.9] tracking-tight mb-6 sm:mb-8 select-none drop-shadow-[0_4px_16px_rgba(0,0,0,0.8)]">
            patria<br />nostra
          </h1>

          {/* Descriptive Manifesto Paragraph */}
          <p className="text-neutral-400 font-sans text-xs sm:text-sm md:text-base leading-relaxed max-w-md mb-8 sm:mb-10 font-normal">
            Streetwear underground inspirado en la historia.<br />
            La resistencia y el honor son nuestras formas.<br />
            <span className="text-neutral-300 font-medium">No es moda. Es identidad.</span>
          </p>

          {/* Action Button */}
          <div>
            <Link 
              to="/catalogo" 
              className="btn-crimson btn-brutalist bg-[#9E1B1B] hover:bg-[#C52222] text-white font-condensed font-bold text-sm tracking-[0.2em] uppercase px-8 py-4 hard-box inline-flex items-center gap-3 transition-all duration-200 glow-red-sm"
            >
              <span>VER COLECCIÓN</span>
              <span className="text-base">→</span>
            </Link>
          </div>

        </div>
      </div>

    </section>
  );
};
