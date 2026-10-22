import React from 'react';
import { AlertTriangle, RotateCcw, Home } from 'lucide-react';

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error capturado por ErrorBoundary:', error, errorInfo);
  }

  handleReload = () => {
    window.location.reload();
  };

  handleGoHome = () => {
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-black text-neutral-200 flex flex-col items-center justify-center p-6 text-center select-none font-sans">
          <div className="w-16 h-16 rounded-2xl bg-red-950/40 border border-[#C52222]/50 flex items-center justify-center mb-6 shadow-[0_0_25px_rgba(197,34,34,0.3)]">
            <AlertTriangle className="w-8 h-8 text-[#C52222]" />
          </div>

          <span className="text-[#C52222] font-condensed font-bold text-xs uppercase tracking-[0.25em] mb-2 block">
            PATRIA NOSTRA DISTRO
          </span>

          <h1 className="font-condensed font-extrabold text-2xl sm:text-3xl text-white uppercase tracking-wider max-w-md mb-3">
            Ocurrió un inconveniente temporal
          </h1>

          <p className="text-xs sm:text-sm text-neutral-400 max-w-md mb-8 leading-relaxed">
            La vista encontró un error al inicializar los recursos. Puedes recargar la página o volver a la portada principal.
          </p>

          <div className="flex flex-col sm:flex-row items-center gap-3 w-full max-w-xs">
            <button
              onClick={this.handleReload}
              className="w-full py-3 px-5 bg-[#C52222] hover:bg-red-700 text-white font-condensed font-bold text-xs uppercase tracking-widest rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg shadow-[#C52222]/20 active:scale-95"
            >
              <RotateCcw className="w-4 h-4" />
              <span>RECARGAR PÁGINA</span>
            </button>

            <button
              onClick={this.handleGoHome}
              className="w-full py-3 px-5 bg-neutral-900 hover:bg-neutral-800 text-neutral-300 hover:text-white border border-neutral-800 font-condensed font-bold text-xs uppercase tracking-widest rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer active:scale-95"
            >
              <Home className="w-4 h-4" />
              <span>IR AL INICIO</span>
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
