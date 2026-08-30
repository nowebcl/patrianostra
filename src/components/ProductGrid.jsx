import React from 'react';
import { Link } from 'react-router-dom';
import { useStore } from '../context/StoreContext';
import { ProductCard } from './ProductCard';

export const ProductGrid = () => {
  const { products } = useStore();
  const featuredProducts = products.filter(p => p.isFeatured).slice(0, 4);

  return (
    <section id="catalogo" className="bg-black py-12 sm:py-16 border-b border-neutral-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="flex items-center justify-between mb-8 sm:mb-10 pb-3 border-b border-neutral-900">
          <h2 className="font-condensed text-xl sm:text-2xl font-bold tracking-[0.2em] uppercase text-neutral-200">
            DESTACADOS
          </h2>
          <Link 
            to="/catalogo" 
            className="text-xs sm:text-sm font-condensed font-semibold tracking-[0.15em] text-neutral-400 hover:text-white transition-colors duration-200 uppercase flex items-center gap-1.5 cursor-pointer"
          >
            <span>VER TODOS</span>
            <span>→</span>
          </Link>
        </div>

        {/* 4-Column Product Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
          {featuredProducts.map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>

      </div>
    </section>
  );
};
