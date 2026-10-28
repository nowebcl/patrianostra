import React, { useRef, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const collabCards = [
  { 
    id: 'battle-zone', 
    image: '/collaborations/battle-zone.webp', 
    alt: 'Battle Zone Merch Oficial x Patria Nostra', 
    title: 'BATTLE ZONE',
    query: 'BATTLE ZONE' 
  },
  { 
    id: 'hobbit-italia', 
    image: '/collaborations/hobbit-italia.webp', 
    alt: 'Hobbit Italia Merch Oficial x Patria Nostra', 
    title: 'HOBBIT ITALIA',
    query: 'HOBBIT' 
  },
  { 
    id: 'tmf', 
    image: '/collaborations/tmf.webp', 
    alt: 'Tattooed Mother Fucker Merch Oficial x Patria Nostra', 
    title: 'TATTOOED MOTHER FUCKER',
    query: 'TATTOOED' 
  },
  { 
    id: 'brassic-usa', 
    image: '/collaborations/brassic-usa.webp', 
    alt: 'Brassic USA Merch Oficial x Patria Nostra', 
    title: 'BRASSIC USA',
    query: 'BRASSIC' 
  },
  { 
    id: 'total-annihilation', 
    image: '/collaborations/total-annihilation.webp', 
    alt: 'Total Annihilation Merch Oficial x Patria Nostra', 
    title: 'TOTAL ANNIHILATION',
    query: 'TOTAL ANNIHILATION' 
  },
  { 
    id: 'ahtr', 
    image: '/collaborations/ahtr.webp', 
    alt: 'AHTR Merch Oficial x Patria Nostra', 
    title: 'AHTR',
    query: 'AHTR' 
  }
];

export const Collaborations = () => {
  const sliderRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const [activeIndex, setActiveIndex] = useState(0);

  const checkScroll = () => {
    if (!sliderRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = sliderRef.current;
    setCanScrollLeft(scrollLeft > 10);
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);

    const cardWidth = sliderRef.current.firstElementChild?.offsetWidth || clientWidth;
    const newIndex = Math.round(scrollLeft / cardWidth);
    setActiveIndex(Math.min(newIndex, collabCards.length - 1));
  };

  useEffect(() => {
    const slider = sliderRef.current;
    if (!slider) return;

    checkScroll();
    slider.addEventListener('scroll', checkScroll, { passive: true });
    window.addEventListener('resize', checkScroll);

    return () => {
      slider.removeEventListener('scroll', checkScroll);
      window.removeEventListener('resize', checkScroll);
    };
  }, []);

  const scroll = (direction) => {
    if (!sliderRef.current) return;
    const container = sliderRef.current;
    const card = container.firstElementChild;
    const cardWidth = card ? card.offsetWidth + 20 : 350;
    const scrollAmount = direction === 'next' ? cardWidth : -cardWidth;

    container.scrollBy({
      left: scrollAmount,
      behavior: 'smooth'
    });
  };

  const scrollToIndex = (index) => {
    if (!sliderRef.current) return;
    const card = sliderRef.current.firstElementChild;
    const cardWidth = card ? card.offsetWidth + 20 : 350;
    sliderRef.current.scrollTo({
      left: index * cardWidth,
      behavior: 'smooth'
    });
  };

  return (
    <section id="colaboraciones" className="bg-black py-12 sm:py-16 border-b border-neutral-900 select-none">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header: Title on Left, Nav Arrows on Right (VER TODAS removed) */}
        <div className="flex items-center justify-between mb-6 sm:mb-8 pb-3 border-b border-neutral-900">
          <div className="flex items-center gap-3">
            <span className="w-2 h-2 bg-[#C52222] inline-block"></span>
            <h2 className="font-condensed text-xl sm:text-2xl font-bold tracking-[0.2em] uppercase text-neutral-200">
              COLABORACIONES
            </h2>
          </div>

          {/* Navigation Arrows */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => scroll('prev')}
              disabled={!canScrollLeft}
              className={`p-2 border transition-all duration-200 cursor-pointer ${
                canScrollLeft 
                  ? 'border-neutral-800 text-neutral-300 hover:text-white hover:border-neutral-500 hover:bg-neutral-900/80' 
                  : 'border-neutral-900/50 text-neutral-700 cursor-not-allowed opacity-40'
              }`}
              aria-label="Anterior colaboración"
            >
              <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
            <button
              onClick={() => scroll('next')}
              disabled={!canScrollRight}
              className={`p-2 border transition-all duration-200 cursor-pointer ${
                canScrollRight 
                  ? 'border-neutral-800 text-neutral-300 hover:text-white hover:border-neutral-500 hover:bg-neutral-900/80' 
                  : 'border-neutral-900/50 text-neutral-700 cursor-not-allowed opacity-40'
              }`}
              aria-label="Siguiente colaboración"
            >
              <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          </div>
        </div>

        {/* Horizontal Slider Track */}
        <div 
          ref={sliderRef}
          className="flex gap-4 sm:gap-6 overflow-x-auto scroll-smooth snap-x snap-mandatory no-scrollbar pb-4 pt-1 cursor-grab active:cursor-grabbing"
          style={{ WebkitOverflowScrolling: 'touch' }}
        >
          {collabCards.map((collab) => (
            <Link
              key={collab.id}
              to={`/catalogo?q=${encodeURIComponent(collab.query)}`}
              className="w-[84%] sm:w-[60%] md:w-[calc(50%-12px)] lg:w-[calc(33.333%-16px)] shrink-0 snap-start group block relative bg-black overflow-hidden border border-neutral-900 hover:border-neutral-600 transition-all duration-300 shadow-2xl"
            >
              <div className="relative overflow-hidden aspect-[2/1] bg-neutral-950">
                <img 
                  src={collab.image} 
                  alt={collab.alt} 
                  loading="lazy"
                  decoding="async"
                  className="w-full h-full object-cover select-none filter contrast-105 transition-transform duration-500 group-hover:scale-105"
                />
                
                {/* Subtle dark gradient overlay on hover */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                
                {/* Badge Indicator on bottom right */}
                <div className="absolute bottom-2.5 right-2.5 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-1 group-hover:translate-y-0">
                  <span className="text-[10px] font-condensed font-bold tracking-[0.2em] uppercase bg-black/90 text-white border border-neutral-600 px-2 py-0.5 shadow-lg">
                    VER MERCH →
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Slider Pagination Dots */}
        <div className="flex items-center justify-center gap-1.5 mt-4">
          {collabCards.map((_, idx) => (
            <button
              key={idx}
              onClick={() => scrollToIndex(idx)}
              className={`h-1 transition-all duration-300 cursor-pointer ${
                activeIndex === idx 
                  ? 'w-6 bg-[#C52222]' 
                  : 'w-2 bg-neutral-800 hover:bg-neutral-600'
              }`}
              aria-label={`Ir a colaboración ${idx + 1}`}
            />
          ))}
        </div>

      </div>
    </section>
  );
};
