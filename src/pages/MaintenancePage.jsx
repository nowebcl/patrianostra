import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, Lock, Instagram, ExternalLink, Sparkles } from 'lucide-react';

export const MaintenancePage = () => {
  return (
    <div className="min-h-screen bg-[#050505] text-[#E5E5E5] flex flex-col justify-between relative overflow-hidden select-none">
      
      {/* Background ambient crimson light glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-[#C52222]/15 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-10 left-10 w-[300px] h-[300px] bg-[#C52222]/10 rounded-full blur-[100px] pointer-events-none" />
      
      {/* Subtle noise grain texture overlay */}
      <div className="noise-overlay" />

      {/* TOP BAR */}
      <header className="relative z-10 w-full max-w-6xl mx-auto px-4 sm:px-6 py-5 flex items-center justify-between border-b border-neutral-900/60">
        <div className="flex items-center gap-3">
          <div className="w-8 h-9 relative flex items-center justify-center shrink-0">
            <img 
              src="/logo.webp" 
              alt="Patria Nostra" 
              onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = '/logo.png'; }}
              className="w-full h-full object-contain filter drop-shadow-[0_0_8px_rgba(197,34,34,0.4)]"
            />
          </div>
          <div>
            <span className="font-condensed font-extrabold text-base tracking-widest text-white uppercase block leading-none">
              PATRIA NOSTRA
            </span>
            <span className="text-[10px] font-condensed tracking-widest text-neutral-400 uppercase font-semibold">
              DISTRO SUBTERRÁNEA • CHILE
            </span>
          </div>
        </div>

        {/* Status Badge */}
        <div className="flex items-center gap-2">
          <div className="hidden sm:flex items-center gap-2 px-3 py-1 bg-neutral-950 border border-neutral-800/80 rounded-full text-[11px] font-mono text-neutral-400">
            <span className="w-2 h-2 rounded-full bg-[#C52222] animate-pulse" />
            <span>DESPLIEGUE EN CURSO</span>
          </div>

          {/* Discreet Admin Login Link */}
          <Link
            to="/admin/login"
            className="flex items-center gap-1.5 px-3 py-1.5 bg-neutral-900/60 hover:bg-neutral-800 border border-neutral-800 text-neutral-400 hover:text-white rounded-lg text-xs font-condensed font-bold uppercase tracking-wider transition-all"
            title="Acceso exclusivo para administradores"
          >
            <Lock className="w-3.5 h-3.5 text-[#C52222]" />
            <span className="hidden sm:inline">ACCESO ADMIN</span>
          </Link>
        </div>
      </header>

      {/* MAIN SHOWCASE */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center px-4 py-8 sm:py-12 max-w-4xl mx-auto w-full text-center">
        
        {/* Poster / Artwork Container */}
        <div className="relative group max-w-md w-full mb-6 sm:mb-8 animate-in fade-in zoom-in-95 duration-700">
          
          {/* Subtle perimeter glow */}
          <div className="absolute -inset-1 bg-gradient-to-b from-[#C52222]/30 via-neutral-800/20 to-[#C52222]/20 rounded-2xl blur-lg opacity-75 group-hover:opacity-100 transition duration-1000 group-hover:duration-200" />
          
          <div className="relative bg-[#080808] border border-neutral-800/90 rounded-2xl p-2.5 sm:p-3.5 shadow-2xl overflow-hidden flex items-center justify-center">
            <img 
              src="/en-construccion.jpg" 
              alt="Patria Nostra - ¡Pronto inauguración!" 
              className="max-h-[58vh] sm:max-h-[68vh] w-auto max-w-full object-contain rounded-xl filter drop-shadow-[0_10px_25px_rgba(0,0,0,0.9)]"
            />
          </div>
        </div>

        {/* Narrative & Announcement */}
        <div className="space-y-3 max-w-xl mx-auto px-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#C52222]/15 border border-[#C52222]/40 rounded-full text-xs font-condensed font-bold uppercase tracking-widest text-[#E5E5E5]">
            <Sparkles className="w-3.5 h-3.5 text-[#C52222]" />
            <span>LANZAMIENTO OFICIAL EN PREPARACIÓN</span>
          </div>

          <h1 className="font-condensed font-extrabold text-2xl sm:text-3xl text-white uppercase tracking-wider">
            NUESTRA TIENDA ONLINE ABRIRÁ MUY PRONTO
          </h1>

          <p className="text-xs sm:text-sm text-neutral-400 font-sans leading-relaxed">
            Estamos afinando los últimos detalles de confección, catálogo y bodega. 
            Sé de los primeros en enterarte cuando liberemos el stock exclusivo.
          </p>

          {/* Social CTA Button */}
          <div className="pt-3 flex flex-wrap items-center justify-center gap-3">
            <a
              href="https://www.instagram.com/patria.nostra.distro/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2.5 px-6 py-3 bg-[#C52222] hover:bg-[#a81c1c] text-white font-condensed font-bold text-xs uppercase tracking-widest rounded-xl shadow-lg shadow-[#C52222]/25 transition-all transform active:scale-95 cursor-pointer"
            >
              <Instagram className="w-4 h-4" />
              <span>SÍGUENOS EN INSTAGRAM @PATRIA.NOSTRA.DISTRO</span>
              <ExternalLink className="w-3.5 h-3.5 opacity-70" />
            </a>
          </div>
        </div>

      </main>

      {/* FOOTER */}
      <footer className="relative z-10 w-full max-w-6xl mx-auto px-4 sm:px-6 py-4 border-t border-neutral-900/60 flex flex-col sm:flex-row items-center justify-between text-[11px] font-condensed tracking-wider text-neutral-500 uppercase gap-2">
        <div className="flex items-center gap-2">
          <span>© 2026 PATRIA NOSTRA. IDENTIDAD Y RESISTENCIA.</span>
        </div>

        <div className="flex items-center gap-4">
          <Link
            to="/admin/login"
            className="hover:text-neutral-300 transition-colors flex items-center gap-1.5"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-[#C52222]" />
            <span>ACCESO PERSONAL AUTORIZADO</span>
          </Link>
        </div>
      </footer>

    </div>
  );
};
