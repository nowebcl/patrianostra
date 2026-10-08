import React from 'react';
import { BrowserRouter, Routes, Route, Outlet, Link } from 'react-router-dom';
import { StoreProvider, useStore } from './context/StoreContext';
import { CartProvider } from './context/CartContext';
import { ScrollToTop } from './components/ScrollToTop';
import { AnnouncementBar } from './components/AnnouncementBar';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { CartDrawer } from './components/CartDrawer';
import { ManifestoModal } from './components/ManifestoModal';
import { MobileMenu } from './components/MobileMenu';
import { MobileBottomNav } from './components/MobileBottomNav';
import { Toast } from './components/Toast';

// Store Public Pages
import { HomePage } from './pages/HomePage';
import { CatalogPage } from './pages/CatalogPage';
import { ProductDetailPage } from './pages/ProductDetailPage';
import { CheckoutPage } from './pages/CheckoutPage';
import { ContactPage } from './pages/ContactPage';
import { MaintenancePage } from './pages/MaintenancePage';

// Admin Pages
import { AdminDashboardPage } from './pages/admin/AdminDashboardPage';
import { AdminLoginPage } from './pages/admin/AdminLoginPage';

// Public Store Layout (With Brand Navbar, Footer, Drawers)
function PublicLayout() {
  const { isUnderConstruction, isAdminAuthenticated, setMaintenanceMode, logoutAdmin } = useStore();

  // Si la tienda está en construcción y no es un administrador autenticado, se muestra la página de mantenimiento
  if (isUnderConstruction && !isAdminAuthenticated) {
    return <MaintenancePage />;
  }

  return (
    <div className="bg-black text-[#E5E5E5] antialiased selection:bg-[#C52222] selection:text-white min-h-screen relative flex flex-col justify-between pb-16 lg:pb-0">
      
      {/* Barra de Control de Administrador (Visible SIEMPRE que haya sesión de admin activa) */}
      {isAdminAuthenticated && (
        <div className="bg-[#0c0c0c] border-b-2 border-[#C52222] text-white px-3 sm:px-6 py-2.5 text-xs font-condensed font-bold uppercase tracking-wider flex flex-wrap items-center justify-between sticky top-0 z-50 shadow-2xl backdrop-blur-md">
          
          {/* Badge & Status info */}
          <div className="flex items-center gap-2.5 py-0.5">
            <span className="flex items-center gap-1.5 px-2.5 py-1 bg-[#C52222] text-white rounded-md text-[10px] tracking-widest font-black shadow-sm">
              🛡️ MODO ADMIN
            </span>
            <div className="flex items-center gap-2 text-neutral-300 text-[11px]">
              <span className={`w-2 h-2 rounded-full ${isUnderConstruction ? 'bg-amber-400 animate-pulse' : 'bg-emerald-400'}`} />
              <span className="hidden sm:inline">
                {isUnderConstruction 
                  ? 'Modo En Construcción Activo (Público restringido)' 
                  : 'Tienda Pública Abierta'}
              </span>
              <span className="sm:hidden">
                {isUnderConstruction ? 'En Construcción' : 'Abierta'}
              </span>
            </div>
          </div>

          {/* Quick Actions & Logout */}
          <div className="flex items-center gap-2 py-0.5 ml-auto">
            <Link 
              to="/admin" 
              className="px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-white rounded-lg text-[11px] font-bold transition-all flex items-center gap-1 cursor-pointer"
            >
              <span>⚡ Panel Admin</span>
            </Link>

            <button 
              onClick={() => setMaintenanceMode(!isUnderConstruction)}
              className={`px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                isUnderConstruction 
                  ? 'bg-emerald-700 hover:bg-emerald-600 text-white' 
                  : 'bg-amber-700 hover:bg-amber-600 text-white'
              }`}
              title="Cambiar visibilidad de la tienda"
            >
              {isUnderConstruction ? '✓ Abrir Tienda' : '🔒 Poner en Construcción'}
            </button>

            <button 
              onClick={logoutAdmin}
              className="px-3 py-1.5 bg-[#C52222] hover:bg-red-800 text-white rounded-lg text-[11px] font-bold transition-all cursor-pointer flex items-center gap-1 shadow-sm"
              title="Cerrar sesión de administrador"
            >
              <span>🚪 Cerrar Sesión</span>
            </button>
          </div>

        </div>
      )}

      {/* Subtle noise grain overlay */}
      <div className="noise-overlay" />

      {/* Top Announcement Bar */}
      <AnnouncementBar />

      {/* Navigation Header */}
      <Navbar />

      {/* Application Store Routes */}
      <div className="flex-1">
        <Outlet />
      </div>

      {/* Footer */}
      <Footer />

      {/* Mobile Bottom Dock Bar (App Feel) */}
      <MobileBottomNav />

      {/* Global Modals & Drawers */}
      <CartDrawer />
      <ManifestoModal />
      <MobileMenu />
      <Toast />

    </div>
  );
}

export function App() {
  return (
    <StoreProvider>
      <CartProvider>
        <BrowserRouter>
          <ScrollToTop />
          <Routes>
            
            {/* Admin Dedicated Routes (Full-screen tactical dashboard) */}
            <Route path="/admin" element={<AdminDashboardPage />} />
            <Route path="/admin/login" element={<AdminLoginPage />} />

            {/* Public Storefront Routes */}
            <Route element={<PublicLayout />}>
              <Route path="/" element={<HomePage />} />
              <Route path="/catalogo" element={<CatalogPage />} />
              <Route path="/producto/:id" element={<ProductDetailPage />} />
              <Route path="/checkout" element={<CheckoutPage />} />
              <Route path="/contacto" element={<ContactPage />} />
              <Route path="*" element={<HomePage />} />
            </Route>

          </Routes>
        </BrowserRouter>
      </CartProvider>
    </StoreProvider>
  );
}

export default App;
