import React from 'react';

export const AnnouncementBar = () => {
  return (
    <div className="bg-black border-b border-neutral-900 py-2 px-4 text-center select-none sticky top-0 z-50">
      <div className="flex items-center justify-center gap-3 text-[11px] sm:text-xs font-condensed tracking-[0.25em] text-neutral-300 uppercase font-bold">
        {/* Cruz celta / solar con cruz contenida estrictamente en el círculo */}
        <svg 
          viewBox="0 0 24 24" 
          className="w-3.5 h-3.5 text-[#C52222] shrink-0" 
          fill="none" 
          stroke="currentColor" 
          strokeWidth="2"
        >
          <circle cx="12" cy="12" r="9" />
          <line x1="12" y1="3" x2="12" y2="21" />
          <line x1="3" y1="12" x2="21" y2="12" />
        </svg>

        <span className="flex items-center gap-2">
          ENVÍO A TODO CHILE 🇨🇱
        </span>

        {/* Cruz celta / solar con cruz contenida estrictamente en el círculo */}
        <svg 
          viewBox="0 0 24 24" 
          className="w-3.5 h-3.5 text-[#C52222] shrink-0" 
          fill="none" 
          stroke="currentColor" 
          strokeWidth="2"
        >
          <circle cx="12" cy="12" r="9" />
          <line x1="12" y1="3" x2="12" y2="21" />
          <line x1="3" y1="12" x2="21" y2="12" />
        </svg>
      </div>
    </div>
  );
};
