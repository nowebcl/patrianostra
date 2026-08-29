import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, Phone, MapPin, Send, CheckCircle2, Instagram, Music, Youtube, MessageSquare } from 'lucide-react';
import { useCart } from '../context/CartContext';

export const ContactPage = () => {
  const { showToast } = useCart();
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: 'pedido',
    message: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSubmitted(true);
    showToast('Mensaje enviado correctamente. Te responderemos en breve.');
  };

  return (
    <div className="min-h-screen bg-black text-[#E5E5E5] pt-8 pb-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Page Header */}
        <div className="border-b border-neutral-900 pb-8 mb-12">
          <span className="text-[#C52222] font-condensed font-bold tracking-[0.25em] text-xs uppercase block mb-1">
            CANAL DIRECTO • ATENCIÓN & MERCH
          </span>
          <h1 className="font-condensed text-3xl sm:text-4xl lg:text-5xl font-extrabold uppercase tracking-tight text-white mb-3">
            CONTACTO & DISTRO
          </h1>
          <p className="text-xs sm:text-sm text-neutral-400 font-sans max-w-xl leading-relaxed">
            ¿Tienes dudas sobre un pedido, disponibilidad de tallas, envíos a tu región o deseas proponer una colaboración de banda? Escríbenos directamente.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-start">
          
          {/* Left Column: Interactive Contact Form */}
          <div className="lg:col-span-7 bg-[#080808] border border-neutral-900 p-6 sm:p-8 hard-box shadow-2xl">
            
            {isSubmitted ? (
              <div className="text-center py-12 space-y-4 animate-in fade-in duration-300">
                <div className="w-14 h-14 bg-[#C52222]/10 border border-[#C52222] rounded-full flex items-center justify-center mx-auto text-[#C52222]">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h3 className="font-condensed text-2xl font-bold uppercase text-white tracking-wider">
                  ¡MENSAJE RECIBIDO!
                </h3>
                <p className="text-xs text-neutral-400 font-sans max-w-md mx-auto leading-relaxed">
                  Gracias por comunicarte, <strong className="text-white">{formData.name}</strong>. Nos pondremos en contacto contigo a <strong className="text-neutral-300">{formData.email}</strong> en menos de 24 horas hábiles.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setIsSubmitted(false);
                    setFormData({ name: '', email: '', subject: 'pedido', message: '' });
                  }}
                  className="mt-6 px-6 py-2.5 bg-[#141414] hover:bg-neutral-800 text-neutral-300 text-xs font-condensed uppercase tracking-widest border border-neutral-700 cursor-pointer"
                >
                  ENVIAR OTRO MENSAJE
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                <h2 className="font-condensed text-base font-bold tracking-[0.15em] uppercase text-neutral-200 pb-2 border-b border-neutral-900 flex items-center gap-2">
                  <Mail className="w-4 h-4 text-[#C52222]" />
                  <span>FORMULARIO DE CONTACTO</span>
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-[11px] font-condensed tracking-wider text-neutral-400 uppercase block mb-1.5">
                      NOMBRE COMPLETO *
                    </label>
                    <input 
                      required
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="Tu nombre"
                      className="w-full bg-black border border-neutral-800 text-xs font-sans text-white p-3 focus:outline-none focus:border-[#C52222]"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-condensed tracking-wider text-neutral-400 uppercase block mb-1.5">
                      CORREO ELECTRÓNICO *
                    </label>
                    <input 
                      required
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="tu@correo.com"
                      className="w-full bg-black border border-neutral-800 text-xs font-sans text-white p-3 focus:outline-none focus:border-[#C52222]"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-condensed tracking-wider text-neutral-400 uppercase block mb-1.5">
                    MOTIVO DE CONTACTO *
                  </label>
                  <select
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    className="w-full bg-black border border-neutral-800 text-xs font-condensed tracking-wider text-white p-3 focus:outline-none focus:border-[#C52222] uppercase cursor-pointer"
                  >
                    <option value="pedido">CONSULTA SOBRE PEDIDO / DESPACHO</option>
                    <option value="tallas">DUDAS SOBRE TALLAS Y GRAMAJE</option>
                    <option value="bandas">COLABORACIÓN CON BANDA / MERCH OFICIAL</option>
                    <option value="mayorista">VENTAS POR MAYOR / DISTRIBUCIÓN</option>
                    <option value="otro">OTRO ASUNTO</option>
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-condensed tracking-wider text-neutral-400 uppercase block mb-1.5">
                    MENSAJE *
                  </label>
                  <textarea 
                    required
                    rows="5"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    placeholder="Escribe aquí tu consulta o mensaje..."
                    className="w-full bg-black border border-neutral-800 text-xs font-sans text-white p-3 focus:outline-none focus:border-[#C52222] resize-none"
                  ></textarea>
                </div>

                <button 
                  type="submit"
                  className="btn-crimson w-full font-condensed font-bold text-xs tracking-[0.2em] uppercase py-4 cursor-pointer shadow-xl flex items-center justify-center gap-2 active:scale-98"
                >
                  <Send className="w-4 h-4" />
                  <span>ENVIAR MENSAJE DIRECTO</span>
                </button>
              </form>
            )}

          </div>

          {/* Right Column: Direct Info & Social Media Links */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* Direct Contact Card */}
            <div className="bg-[#080808] border border-neutral-900 p-6 space-y-4">
              <h3 className="font-condensed text-sm font-bold tracking-[0.2em] uppercase text-neutral-200 pb-2 border-b border-neutral-900">
                DATOS OFICIALES
              </h3>

              <div className="space-y-3.5 text-xs font-sans">
                <div className="flex items-start gap-3">
                  <Mail className="w-4 h-4 text-[#C52222] shrink-0 mt-0.5" />
                  <div>
                    <span className="font-condensed text-[10px] text-neutral-500 uppercase tracking-wider block">CORREO OFICIAL:</span>
                    <a href="mailto:info@patrianostra.com" className="text-neutral-200 hover:text-white transition-colors">
                      info@patrianostra.com
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <MapPin className="w-4 h-4 text-[#C52222] shrink-0 mt-0.5" />
                  <div>
                    <span className="font-condensed text-[10px] text-neutral-500 uppercase tracking-wider block">BASE & BODEGA:</span>
                    <span className="text-neutral-200">Santiago, Chile 🇨🇱</span>
                    <span className="block text-[11px] text-neutral-500 font-sans">Despachos nacionales vía Chilexpress y Starken</span>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Phone className="w-4 h-4 text-[#C52222] shrink-0 mt-0.5" />
                  <div>
                    <span className="font-condensed text-[10px] text-neutral-500 uppercase tracking-wider block">HORARIO DE ATENCIÓN:</span>
                    <span className="text-neutral-300">Lunes a Viernes: 09:00 - 19:00 hrs</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Official Social Media Networks Card */}
            <div className="bg-[#080808] border border-neutral-900 p-6 space-y-4">
              <h3 className="font-condensed text-sm font-bold tracking-[0.2em] uppercase text-neutral-200 pb-2 border-b border-neutral-900">
                REDES & COMUNIDAD OFICIAL
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                
                {/* Instagram */}
                <a 
                  href="https://www.instagram.com/patria.nostra.distro/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 bg-black border border-neutral-800 hover:border-[#C52222] p-3 text-neutral-300 hover:text-white transition-all group cursor-pointer"
                >
                  <div className="w-8 h-8 rounded bg-neutral-900 flex items-center justify-center text-[#C52222] group-hover:bg-[#C52222] group-hover:text-white transition-colors">
                    <Instagram className="w-4 h-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <span className="font-condensed font-bold text-xs uppercase tracking-wider block">INSTAGRAM</span>
                    <span className="text-[10px] text-neutral-500 truncate block">@patria.nostra.distro</span>
                  </div>
                </a>

                {/* Bandcamp / Music */}
                <a 
                  href="#colaboraciones" 
                  className="flex items-center gap-3 bg-black border border-neutral-800 hover:border-[#C52222] p-3 text-neutral-300 hover:text-white transition-all group cursor-pointer"
                >
                  <div className="w-8 h-8 rounded bg-neutral-900 flex items-center justify-center text-[#C52222] group-hover:bg-[#C52222] group-hover:text-white transition-colors">
                    <Music className="w-4 h-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <span className="font-condensed font-bold text-xs uppercase tracking-wider block">MERCH BANDAS</span>
                    <span className="text-[10px] text-neutral-500 truncate block">Kronstadt • Bastión</span>
                  </div>
                </a>

                {/* YouTube */}
                <a 
                  href="https://youtube.com" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 bg-black border border-neutral-800 hover:border-[#C52222] p-3 text-neutral-300 hover:text-white transition-all group cursor-pointer"
                >
                  <div className="w-8 h-8 rounded bg-neutral-900 flex items-center justify-center text-[#C52222] group-hover:bg-[#C52222] group-hover:text-white transition-colors">
                    <Youtube className="w-4 h-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <span className="font-condensed font-bold text-xs uppercase tracking-wider block">YOUTUBE</span>
                    <span className="text-[10px] text-neutral-500 truncate block">Videos & Lookbook</span>
                  </div>
                </a>

                {/* Direct Support */}
                <a 
                  href="mailto:info@patrianostra.com" 
                  className="flex items-center gap-3 bg-black border border-neutral-800 hover:border-[#C52222] p-3 text-neutral-300 hover:text-white transition-all group cursor-pointer"
                >
                  <div className="w-8 h-8 rounded bg-neutral-900 flex items-center justify-center text-[#C52222] group-hover:bg-[#C52222] group-hover:text-white transition-colors">
                    <MessageSquare className="w-4 h-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <span className="font-condensed font-bold text-xs uppercase tracking-wider block">SOPORTE</span>
                    <span className="text-[10px] text-neutral-500 truncate block">Atención 24/48h</span>
                  </div>
                </a>

              </div>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
};
