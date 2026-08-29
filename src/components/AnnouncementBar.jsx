import React from 'react';

export const AnnouncementBar = () => {
  return (
    <div className="bg-black border-b border-neutral-900 py-2 px-4 text-center select-none sticky top-0 z-50">
      <div className="flex items-center justify-center gap-3 text-[11px] sm:text-xs font-condensed tracking-[0.25em] text-neutral-300 uppercase font-bold">
        <span className="text-[#C52222]">★</span>
        <span className="flex items-center gap-2">
          ENVÍO A TODO CHILE 🇨🇱
        </span>
        <span className="text-[#C52222]">★</span>
      </div>
    </div>
  );
};
