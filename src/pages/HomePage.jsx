import React from 'react';
import { Hero } from '../components/Hero';
import { KronstadtBanner } from '../components/KronstadtBanner';
import { ProductGrid } from '../components/ProductGrid';
import { Collaborations } from '../components/Collaborations';
import { ManifestoSection } from '../components/ManifestoSection';

export const HomePage = () => {
  return (
    <main>
      {/* 1. Hero Section with Ken Burns Slider */}
      <Hero />

      {/* 2. Full-Bleed Kronstadt Collaboration Banner */}
      <KronstadtBanner />

      {/* 3. Featured Products */}
      <ProductGrid />

      {/* 4. Collaborations Grid */}
      <Collaborations />

      {/* 5. Manifesto / Lookbook Editorial */}
      <ManifestoSection />
    </main>
  );
};
