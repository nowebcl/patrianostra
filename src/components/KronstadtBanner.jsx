import React, { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';

export const KronstadtBanner = () => {
  const containerRef = useRef(null);
  const layerRef = useRef(null);
  const imgRef = useRef(null);

  useEffect(() => {
    let ticking = false;

    const updateParallax = () => {
      if (!containerRef.current || !imgRef.current || !layerRef.current) return;

      const isMobile = window.innerWidth < 768;
      if (isMobile) {
        layerRef.current.style.transform = 'none';
        return;
      }

      const containerRect = containerRef.current.getBoundingClientRect();
      const windowHeight = window.innerHeight || document.documentElement.clientHeight;

      // Only calculate if the banner is in or close to the viewport
      if (containerRect.bottom > -50 && containerRect.top < windowHeight + 50) {
        const containerH = containerRect.height;
        const imgH = imgRef.current.offsetHeight;
        const maxTravel = Math.max(0, imgH - containerH);

        if (maxTravel > 0) {
          const totalDistance = windowHeight + containerH;
          const currentDistance = windowHeight - containerRect.top;
          const progress = Math.min(Math.max(currentDistance / totalDistance, 0), 1);
          const targetY = -progress * maxTravel;

          layerRef.current.style.transform = `translate3d(0, ${targetY.toFixed(2)}px, 0)`;
        } else {
          layerRef.current.style.transform = 'translate3d(0, 0, 0)';
        }
      }
    };

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          updateParallax();
          ticking = false;
        });
        ticking = true;
      }
    };

    const handleResize = () => {
      updateParallax();
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleResize, { passive: true });

    // Initial check
    updateParallax();

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <section 
      id="orgullo-sur-banner"
      ref={containerRef}
      className="relative w-full h-auto md:h-[260px] lg:h-[300px] xl:h-[320px] overflow-hidden bg-black border-y border-neutral-900 select-none group"
    >
      {/* Banner Layer: Normal flow on mobile (full visibility, zero crop), absolute parallax on desktop */}
      <div 
        ref={layerRef}
        className="relative w-full h-auto md:absolute md:inset-x-0 md:top-0 md:pointer-events-none md:will-change-transform"
        style={{ transform: 'none' }}
      >
        <img 
          ref={imgRef}
          src="/banner-os.webp" 
          alt="Orgullo Sur Official Merch x Patria Nostra" 
          loading="lazy"
          decoding="async"
          onLoad={() => {
            if (window.innerWidth >= 768 && containerRef.current && imgRef.current && layerRef.current) {
              const containerRect = containerRef.current.getBoundingClientRect();
              const windowHeight = window.innerHeight || document.documentElement.clientHeight;
              const containerH = containerRect.height;
              const imgH = imgRef.current.offsetHeight;
              const maxTravel = Math.max(0, imgH - containerH);
              if (maxTravel > 0) {
                const totalDistance = windowHeight + containerH;
                const currentDistance = windowHeight - containerRect.top;
                const progress = Math.min(Math.max(currentDistance / totalDistance, 0), 1);
                const targetY = -progress * maxTravel;
                layerRef.current.style.transform = `translate3d(0, ${targetY.toFixed(2)}px, 0)`;
              }
            }
          }}
          onError={(e) => { 
            e.currentTarget.onerror = null; 
          }}
          className="w-full h-auto block select-none filter contrast-105"
        />
      </div>

      {/* Top and Bottom Vignette (Desktop only to preserve full mobile art clarity) */}
      <div className="hidden md:block absolute inset-x-0 top-0 h-10 lg:h-14 bg-gradient-to-b from-black/80 via-black/30 to-transparent pointer-events-none z-10" />
      <div className="hidden md:block absolute inset-x-0 bottom-0 h-10 lg:h-14 bg-gradient-to-t from-black/80 via-black/30 to-transparent pointer-events-none z-10" />

      {/* Interactive Action Button */}
      <div className="absolute left-[3%] bottom-[6%] sm:left-[3.2%] sm:bottom-[8%] md:bottom-[12%] lg:bottom-[15%] z-20">
        <Link 
          to="/catalogo?tag=ORGULLO%20SUR" 
          className="inline-flex items-center gap-1.5 sm:gap-2 bg-black/90 hover:bg-neutral-900 text-neutral-200 hover:text-white border border-neutral-700 hover:border-neutral-400 font-condensed font-bold text-[9px] sm:text-xs md:text-sm tracking-[0.15em] sm:tracking-[0.2em] px-2.5 sm:px-4 md:px-6 py-1 sm:py-1.5 md:py-2.5 uppercase transition-all duration-200 shadow-2xl backdrop-blur-md cursor-pointer group-hover:border-neutral-500"
        >
          <span>VER COLECCIÓN</span>
          <span className="text-xs sm:text-sm transition-transform duration-200 group-hover:translate-x-1">→</span>
        </Link>
      </div>
    </section>
  );
};
