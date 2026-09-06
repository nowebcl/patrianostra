import React from 'react';

const collabCards = [
  { id: 'kronstadt', image: '/col1.webp', alt: 'Kronstadt No Compromise' },
  { id: 'bastion', image: '/col2.webp', alt: 'Bastión HXC Próximamente' },
  { id: 'disidencia', image: '/col3.webp', alt: 'Disidencia Punk Rock Próximamente' }
];

export const Collaborations = () => {
  return (
    <section id="colaboraciones" className="bg-black py-12 sm:py-16 border-b border-neutral-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="flex items-center justify-between mb-8 sm:mb-10 pb-3 border-b border-neutral-900">
          <h2 className="font-condensed text-xl sm:text-2xl font-bold tracking-[0.2em] uppercase text-neutral-200">
            COLABORACIONES
          </h2>
          <a 
            href="#colaboraciones" 
            className="text-xs sm:text-sm font-condensed font-semibold tracking-[0.15em] text-neutral-400 hover:text-white transition-colors duration-200 uppercase flex items-center gap-1.5"
          >
            <span>VER TODAS</span>
            <span>→</span>
          </a>
        </div>

        {/* 3-Column Collabs Grid with pure artwork images */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 sm:gap-6">
          {collabCards.map(collab => (
            <div 
              key={collab.id} 
              className="collab-card group relative bg-black overflow-hidden border border-neutral-900 hover:border-neutral-700 transition-all duration-300 shadow-2xl"
            >
              <img 
                src={collab.image} 
                alt={collab.alt} 
                loading="lazy"
                decoding="async"
                className="w-full h-auto object-cover select-none filter contrast-105 transition-transform duration-500 group-hover:scale-105"
              />
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};
