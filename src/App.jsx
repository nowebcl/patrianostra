import React from 'react';
import { BrowserRouter, Routes, Route, Outlet } from 'react-router-dom';
import { StoreProvider } from './context/StoreContext';
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

// Admin Pages
import { AdminDashboardPage } from './pages/admin/AdminDashboardPage';
import { AdminLoginPage } from './pages/admin/AdminLoginPage';

// Public Store Layout (With Brand Navbar, Footer, Drawers)
function PublicLayout() {
  return (
    <div className="bg-black text-[#E5E5E5] antialiased selection:bg-[#C52222] selection:text-white min-h-screen relative flex flex-col justify-between pb-16 lg:pb-0">
      
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
