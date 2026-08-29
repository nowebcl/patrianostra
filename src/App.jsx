import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
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

// Pages
import { HomePage } from './pages/HomePage';
import { CatalogPage } from './pages/CatalogPage';
import { ProductDetailPage } from './pages/ProductDetailPage';
import { CheckoutPage } from './pages/CheckoutPage';
import { ContactPage } from './pages/ContactPage';

export function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <CartProvider>
        <div className="bg-black text-[#E5E5E5] antialiased selection:bg-[#C52222] selection:text-white min-h-screen relative flex flex-col justify-between pb-16 lg:pb-0">
          
          {/* Subtle noise grain overlay */}
          <div className="noise-overlay" />

          {/* Top Announcement Bar */}
          <AnnouncementBar />

          {/* Navigation Header */}
          <Navbar />

          {/* Application Routes */}
          <div className="flex-1">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/catalogo" element={<CatalogPage />} />
              <Route path="/producto/:id" element={<ProductDetailPage />} />
              <Route path="/checkout" element={<CheckoutPage />} />
              <Route path="/contacto" element={<ContactPage />} />
              <Route path="*" element={<HomePage />} />
            </Routes>
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
      </CartProvider>
    </BrowserRouter>
  );
}

export default App;
