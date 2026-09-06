import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  ShoppingBag, 
  Package, 
  TrendingUp, 
  ExternalLink, 
  LogOut, 
  Menu, 
  X,
  ChevronRight,
  Boxes
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';

export const AdminLayout = ({ activeTab, setActiveTab, onOpenNewProduct, children }) => {
  const navigate = useNavigate();
  const { adminCreds, logoutAdmin, orders, products } = useStore();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const pendingCount = orders.filter(o => o.status === 'Pendiente' || o.status === 'En Preparación').length;

  const handleLogout = () => {
    logoutAdmin();
    navigate('/admin/login');
  };

  const navItems = [
    {
      id: 'orders',
      label: 'Pedidos',
      icon: ShoppingBag,
      badge: pendingCount > 0 ? pendingCount : null
    },
    {
      id: 'products',
      label: 'Productos',
      icon: Package,
      badge: products.length
    },
    {
      id: 'inventory',
      label: 'Bodega & Tallas',
      icon: Boxes,
      badge: null
    },
    {
      id: 'overview',
      label: 'Resumen',
      icon: TrendingUp,
      badge: null
    }
  ];

  return (
    <div className="min-h-screen bg-[#090909] text-neutral-200 font-sans flex flex-col md:flex-row">
      
      {/* Mobile Top Bar */}
      <div className="md:hidden bg-[#111] border-b border-neutral-800 p-4 flex items-center justify-between sticky top-0 z-40">
        <div className="flex items-center gap-3">
          <img src="/logo.png" alt="" className="w-7 h-8 object-contain" />
          <span className="font-condensed font-extrabold text-sm tracking-widest text-white uppercase">
            PATRIA NOSTRA • ADMIN
          </span>
        </div>
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="p-2 text-neutral-400 hover:text-white rounded-lg bg-black border border-neutral-800"
        >
          {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* LEFT SIDEBAR (Menú Lateral) */}
      <aside className={`
        fixed md:sticky top-0 left-0 h-screen w-64 bg-[#0d0d0d] border-r border-neutral-800/80 p-5 flex flex-col justify-between z-50 transition-transform duration-200
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        
        {/* Top: Brand Logo */}
        <div className="space-y-6">
          <div className="flex items-center gap-3 px-2 py-1">
            <div className="w-8 h-9 relative flex items-center justify-center shrink-0">
              <img 
                src="/logo.png" 
                alt="Patria Nostra Shield" 
                className="w-full h-full object-contain filter drop-shadow-[0_0_8px_rgba(197,34,34,0.4)]"
              />
            </div>
            <div>
              <span className="font-condensed font-extrabold text-base tracking-widest text-white uppercase block leading-none">
                PATRIA NOSTRA
              </span>
              <span className="text-[10px] font-condensed tracking-widest text-[#C52222] uppercase font-bold">
                PANEL ADMIN
              </span>
            </div>
          </div>

          {/* Navigation Menu Links */}
          <nav className="space-y-1">
            {navItems.map(item => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id);
                    setIsMobileMenuOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-4 py-3 rounded-xl font-condensed font-bold text-sm tracking-wider uppercase transition-all cursor-pointer ${
                    isActive
                      ? 'bg-[#C52222] text-white shadow-lg shadow-[#C52222]/20'
                      : 'text-neutral-400 hover:text-white hover:bg-neutral-900/60'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </div>

                  {item.badge !== null && (
                    <span className={`text-[11px] font-mono px-2 py-0.5 rounded-full font-bold ${
                      isActive ? 'bg-black/30 text-white' : 'bg-neutral-800 text-neutral-300'
                    }`}>
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Bottom Sidebar: Store Link & Logout */}
        <div className="pt-4 border-t border-neutral-800/80 space-y-2">
          
          <a
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="w-full flex items-center justify-between px-4 py-2.5 bg-neutral-900/60 hover:bg-neutral-800 text-neutral-300 hover:text-white rounded-xl text-xs font-condensed font-bold uppercase transition-colors"
          >
            <div className="flex items-center gap-2.5">
              <ExternalLink className="w-4 h-4 text-[#C52222]" />
              <span>Ver Tienda</span>
            </div>
            <ChevronRight className="w-3.5 h-3.5 text-neutral-500" />
          </a>

          <div className="flex items-center justify-between px-2 pt-2">
            <div className="truncate pr-2">
              <span className="text-[11px] text-neutral-400 font-mono block truncate">
                {adminCreds.email}
              </span>
            </div>
            <button
              onClick={handleLogout}
              className="p-2 text-neutral-500 hover:text-red-400 hover:bg-red-950/30 rounded-lg cursor-pointer transition-colors"
              title="Cerrar Sesión"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>

        </div>

      </aside>

      {/* Backdrop for mobile */}
      {isMobileMenuOpen && (
        <div 
          onClick={() => setIsMobileMenuOpen(false)}
          className="fixed inset-0 bg-black/70 z-40 md:hidden"
        />
      )}

      {/* MAIN VIEW AREA */}
      <main className="flex-1 p-4 sm:p-8 lg:p-10 max-w-6xl w-full mx-auto overflow-y-auto">
        {children}
      </main>

    </div>
  );
};
