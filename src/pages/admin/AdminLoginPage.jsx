import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ShieldCheck, Lock, User, ArrowLeft, Eye, EyeOff, Sparkles, Key, AlertCircle } from 'lucide-react';
import { useStore } from '../../context/StoreContext';

export const AdminLoginPage = () => {
  const navigate = useNavigate();
  const { loginAdmin, isAdminAuthenticated, adminCreds } = useStore();

  const [username, setUsername] = useState('admin@patrianostra.cl');
  const [password, setPassword] = useState('admin123');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isAdminAuthenticated) {
      navigate('/admin');
    }
  }, [isAdminAuthenticated, navigate]);

  const handleSubmit = (e) => {
    e.preventDefault();
    setErrorMessage('');
    setIsLoading(true);

    setTimeout(() => {
      const res = loginAdmin(username, password);
      setIsLoading(false);
      if (res.success) {
        navigate('/admin');
      } else {
        setErrorMessage(res.message || 'Credenciales inválidas. Verifica tu usuario y contraseña.');
      }
    }, 400);
  };

  const handleFillCredentials = () => {
    setUsername(adminCreds.email || 'admin@patrianostra.cl');
    setPassword(adminCreds.password || 'admin123');
    setErrorMessage('');
  };

  return (
    <div className="min-h-screen bg-[#050505] text-[#E5E5E5] flex flex-col justify-between selection:bg-[#C52222] selection:text-white relative">
      
      {/* Header link */}
      <div className="p-6 max-w-6xl mx-auto w-full flex items-center justify-between">
        <Link 
          to="/"
          className="flex items-center gap-2 text-neutral-400 hover:text-white text-xs font-condensed font-bold tracking-widest uppercase transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>VOLVER A LA TIENDA</span>
        </Link>

        <div className="flex items-center gap-2 text-[11px] font-condensed text-neutral-500 tracking-wider uppercase">
          <ShieldCheck className="w-4 h-4 text-[#C52222]" />
          <span>ACCESO RESTRINGIDO A PERSONAL AUTORIZADO</span>
        </div>
      </div>

      {/* Main Form Center */}
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-[#0a0a0a] border border-neutral-800 rounded-xl p-6 sm:p-8 shadow-2xl space-y-6 relative overflow-hidden animate-in fade-in zoom-in-95 duration-300">
          
          {/* Top Crimson Accent Line */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-[#C52222]" />

          {/* Logo & Header */}
          <div className="text-center space-y-2">
            <div className="w-14 h-16 mx-auto mb-3">
              <img 
                src="/logo.png" 
                alt="Patria Nostra" 
                className="w-full h-full object-contain filter drop-shadow-[0_0_12px_rgba(197,34,34,0.5)]"
              />
            </div>
            <span className="text-[#C52222] font-condensed font-bold text-xs tracking-[0.25em] uppercase block">
              PORTAL DE GESTIÓN
            </span>
            <h1 className="font-condensed text-2xl sm:text-3xl font-extrabold uppercase text-white tracking-wider">
              PANEL ADMINISTRADOR
            </h1>
            <p className="text-xs text-neutral-500 font-sans">
              Ingresa tus credenciales oficiales para administrar el catálogo, pedidos e inventario.
            </p>
          </div>

          {/* Error Message */}
          {errorMessage && (
            <div className="bg-red-950/40 border border-red-800/80 p-3 rounded text-red-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4 text-xs font-sans">
            
            {/* Username / Email */}
            <div>
              <label className="font-condensed font-bold text-neutral-400 uppercase tracking-wider block mb-1.5 flex items-center justify-between">
                <span>USUARIO O EMAIL</span>
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-neutral-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  required
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="admin@patrianostra.cl"
                  className="w-full bg-black border border-neutral-800 rounded pl-9 pr-3 py-3 text-white focus:outline-none focus:border-[#C52222]"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="font-condensed font-bold text-neutral-400 uppercase tracking-wider block mb-1.5 flex items-center justify-between">
                <span>CONTRASEÑA</span>
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-neutral-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  required
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-black border border-neutral-800 rounded pl-9 pr-10 py-3 text-white font-mono focus:outline-none focus:border-[#C52222]"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-white p-1"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 bg-[#C52222] hover:bg-[#a81c1c] disabled:opacity-50 text-white font-condensed font-bold text-xs uppercase tracking-[0.2em] rounded shadow-xl shadow-[#C52222]/30 transition-all cursor-pointer flex items-center justify-center gap-2 active:scale-98"
            >
              {isLoading ? (
                <span>INICIANDO SESIÓN...</span>
              ) : (
                <span>INGRESAR AL PANEL →</span>
              )}
            </button>

          </form>

          {/* Quick Demo Helper Card */}
          <div className="bg-[#0e0e0e] border border-neutral-800/80 p-4 rounded-lg space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <span className="font-condensed font-bold uppercase tracking-wider text-neutral-400 flex items-center gap-1.5 text-[11px]">
                <Key className="w-3.5 h-3.5 text-[#C52222]" />
                CREDENCIALES DE ACCESO:
              </span>
              <button
                type="button"
                onClick={handleFillCredentials}
                className="text-[#C52222] hover:underline text-[10px] font-condensed font-bold uppercase cursor-pointer"
              >
                AUTO-COMPLETAR
              </button>
            </div>
            <div className="text-[11px] text-neutral-300 font-mono space-y-0.5 bg-black/60 p-2 rounded border border-neutral-900">
              <p>Usuario: <strong className="text-white">{adminCreds.email}</strong> o <strong className="text-white">{adminCreds.username}</strong></p>
              <p>Clave: <strong className="text-[#C52222]">{adminCreds.password}</strong></p>
            </div>
          </div>

        </div>
      </div>

      {/* Footer copyright */}
      <div className="p-4 text-center text-xs text-neutral-600 font-mono">
        Patria Nostra Distro Chile • Panel de Control v1.0
      </div>

    </div>
  );
};
