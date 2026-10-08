import React from 'react';
import { Instagram } from 'lucide-react';

export const MaintenancePage = () => {
  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-4 sm:p-6 select-none">
      
      {/* Central Artwork (Pure seamless blend with black background) */}
      <div className="flex items-center justify-center max-w-sm sm:max-w-md w-full">
        <img 
          src="/en-construccion.jpg" 
          alt="Patria Nostra - Pronto inauguración" 
          className="max-h-[62vh] sm:max-h-[68vh] w-auto max-w-full object-contain"
        />
      </div>

      {/* Clean Minimal Title */}
      <h1 className="font-condensed font-extrabold text-lg sm:text-xl text-neutral-200 uppercase tracking-[0.25em] text-center mt-6 mb-4">
        PRONTO EN LÍNEA
      </h1>

      {/* Instagram Link */}
      <a
        href="https://www.instagram.com/patria.nostra.distro/"
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-2.5 px-6 py-2.5 bg-neutral-950/80 hover:bg-neutral-900 border border-neutral-800 hover:border-[#C52222] text-neutral-300 hover:text-white font-condensed font-bold text-xs uppercase tracking-[0.2em] rounded-xl transition-all duration-300 cursor-pointer shadow-lg active:scale-95"
      >
        <Instagram className="w-4 h-4 text-[#C52222]" />
        <span>@PATRIA.NOSTRA.DISTRO</span>
      </a>

    </div>
  );
};
