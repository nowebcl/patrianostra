import React, { useState, useEffect } from 'react';
import { X, Image, Check, Plus, Minus, Sparkles } from 'lucide-react';

const PRESET_IMAGES = [
  { label: 'Hoodie / Polerón Negro', url: '/producto.png' },
  { label: 'Modelo Táctico 1', url: '/hero2.png' },
  { label: 'Modelo Táctico 2', url: '/hero3.png' },
  { label: 'Banner Kronstadt', url: '/banner1.png' },
  { label: 'Colaboración Bastión', url: '/assets/images/collab_bastion_img.png' },
  { label: 'Colaboración Disidencia', url: '/assets/images/collab_disidencia_img.png' }
];

const CATEGORIES = ['Hoodies', 'Camisetas', 'Pantalones', 'Accesorios'];
const SIZES = ['S', 'M', 'L', 'XL', 'XXL', 'Única'];

export const ProductModal = ({ isOpen, onClose, onSave, productToEdit }) => {
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    originalPrice: '',
    category: 'Hoodies',
    stock: 15,
    sizes: ['S', 'M', 'L', 'XL'],
    image: '/producto.png',
    badge: '',
    description: '',
    isFeatured: true
  });

  const [error, setError] = useState('');

  useEffect(() => {
    if (productToEdit) {
      setFormData({
        name: productToEdit.name || '',
        price: productToEdit.price !== undefined ? String(productToEdit.price) : '',
        originalPrice: productToEdit.originalPrice ? String(productToEdit.originalPrice) : '',
        category: productToEdit.category || 'Hoodies',
        stock: productToEdit.stock !== undefined ? Number(productToEdit.stock) : 10,
        sizes: Array.isArray(productToEdit.sizes) ? productToEdit.sizes : ['S', 'M', 'L', 'XL'],
        image: productToEdit.image || '/producto.png',
        badge: productToEdit.badge || '',
        description: productToEdit.description || '',
        isFeatured: !!productToEdit.isFeatured
      });
    } else {
      setFormData({
        name: '',
        price: '59990',
        originalPrice: '',
        category: 'Polerones',
        stock: 15,
        sizes: ['S', 'M', 'L', 'XL'],
        image: '/producto.png',
        badge: 'EDICIÓN LIMITADA',
        description: 'Confeccionado en algodón premium peinado con corte estructurado y serigrafía de alta densidad.',
        isFeatured: true
      });
    }
    setError('');
  }, [productToEdit, isOpen]);

  if (!isOpen) return null;

  const handleSizeToggle = (size) => {
    setFormData(prev => {
      const exists = prev.sizes.includes(size);
      if (exists) {
        if (prev.sizes.length === 1) return prev; // Keep at least one
        return { ...prev, sizes: prev.sizes.filter(s => s !== size) };
      } else {
        return { ...prev, sizes: [...prev.sizes, size] };
      }
    });
  };

  const handleStockChange = (delta) => {
    setFormData(prev => ({
      ...prev,
      stock: Math.max(0, (Number(prev.stock) || 0) + delta)
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setError('Por favor ingresa un nombre para la prenda.');
      return;
    }
    if (!formData.price || isNaN(formData.price) || Number(formData.price) <= 0) {
      setError('Ingresa un precio válido (ej: 49.00).');
      return;
    }

    const payload = {
      name: formData.name.trim().toUpperCase(),
      price: parseFloat(formData.price),
      originalPrice: formData.originalPrice ? parseFloat(formData.originalPrice) : null,
      category: formData.category,
      stock: parseInt(formData.stock, 10) || 0,
      sizes: formData.sizes,
      image: formData.image || '/producto.png',
      gallery: [formData.image || '/producto.png', '/hero2.png'],
      badge: formData.badge || null,
      description: formData.description.trim(),
      isFeatured: formData.isFeatured,
      sku: productToEdit?.sku || `PN-${Math.floor(100 + Math.random() * 900)}`,
      gsm: productToEdit?.gsm || '320 GSM Heavyweight',
      fit: productToEdit?.fit || 'Relaxed Fit'
    };

    onSave(payload);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-[#111111] border border-neutral-800 w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between p-5 sm:p-6 border-b border-neutral-800 bg-[#161616]">
          <div>
            <span className="text-[#C52222] font-condensed font-bold text-xs tracking-widest uppercase block">
              {productToEdit ? 'EDITAR PRENDA' : '+ AGREGAR NUEVA PRENDA'}
            </span>
            <h2 className="font-condensed text-xl sm:text-2xl font-bold uppercase text-white tracking-wide">
              {productToEdit ? productToEdit.name : 'DATOS DE LA PRENDA'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-neutral-400 hover:text-white hover:bg-neutral-800 rounded-full cursor-pointer transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Error alert */}
        {error && (
          <div className="mx-6 mt-4 p-3 bg-red-950/60 border border-red-800 text-red-200 text-xs rounded-lg">
            {error}
          </div>
        )}

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-5 text-xs">
          
          {/* 1. Name */}
          <div>
            <label className="font-condensed font-bold text-neutral-300 uppercase tracking-wider block mb-1.5 text-sm">
              1. Nombre de la prenda *
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Ej: HOODIE PATRIA NOSTRA NEGRO"
              className="w-full bg-[#0a0a0a] border border-neutral-700 rounded-xl p-3 text-white text-sm focus:outline-none focus:border-[#C52222]"
            />
          </div>

          {/* 2. Category & Price in 2 Columns */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            {/* Category */}
            <div>
              <label className="font-condensed font-bold text-neutral-300 uppercase tracking-wider block mb-1.5 text-sm">
                2. Categoría
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full bg-[#0a0a0a] border border-neutral-700 rounded-xl p-3 text-white text-sm focus:outline-none focus:border-[#C52222] cursor-pointer"
              >
                {CATEGORIES.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            {/* Price */}
            <div>
              <label className="font-condensed font-bold text-neutral-300 uppercase tracking-wider block mb-1.5 text-sm">
                3. Precio en Pesos ($ CLP) *
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400 font-bold">$</span>
                <input
                  type="number"
                  step="10"
                  required
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  placeholder="59990"
                  className="w-full bg-[#0a0a0a] border border-neutral-700 rounded-xl pl-8 pr-3 py-3 text-white text-sm font-mono font-bold focus:outline-none focus:border-[#C52222]"
                />
              </div>
            </div>

          </div>

          {/* 3. Stock with direct +/- buttons */}
          <div className="bg-[#0a0a0a] border border-neutral-800 rounded-xl p-4 flex items-center justify-between">
            <div>
              <label className="font-condensed font-bold text-white uppercase tracking-wider text-sm block">
                4. Unidades en Stock (Bodega)
              </label>
              <p className="text-[11px] text-neutral-400">
                Cantidad disponible para venta en la tienda
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => handleStockChange(-1)}
                className="w-9 h-9 bg-neutral-800 hover:bg-neutral-700 text-white rounded-lg flex items-center justify-center font-bold text-base cursor-pointer"
              >
                <Minus className="w-4 h-4" />
              </button>
              <input
                type="number"
                min="0"
                value={formData.stock}
                onChange={(e) => setFormData({ ...formData, stock: Math.max(0, parseInt(e.target.value, 10) || 0) })}
                className="w-16 bg-[#161616] border border-neutral-700 rounded-lg py-1.5 text-center font-mono font-bold text-base text-white focus:outline-none focus:border-[#C52222]"
              />
              <button
                type="button"
                onClick={() => handleStockChange(1)}
                className="w-9 h-9 bg-neutral-800 hover:bg-[#C52222] text-white rounded-lg flex items-center justify-center font-bold text-base cursor-pointer"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* 4. Sizes Pills */}
          <div>
            <label className="font-condensed font-bold text-neutral-300 uppercase tracking-wider block mb-1.5 text-sm">
              5. Tallas Disponibles
            </label>
            <div className="flex flex-wrap gap-2">
              {SIZES.map(sz => {
                const isSelected = formData.sizes.includes(sz);
                return (
                  <button
                    type="button"
                    key={sz}
                    onClick={() => handleSizeToggle(sz)}
                    className={`px-4 py-2.5 rounded-xl font-condensed font-bold text-xs uppercase transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-[#C52222] text-white shadow-md'
                        : 'bg-[#0a0a0a] border border-neutral-800 text-neutral-400 hover:border-neutral-600'
                    }`}
                  >
                    {sz} {isSelected && '✓'}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 5. Image Selector with 1-click presets */}
          <div>
            <label className="font-condensed font-bold text-neutral-300 uppercase tracking-wider block mb-1.5 text-sm">
              6. Foto de la Prenda
            </label>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 mb-2">
              {PRESET_IMAGES.map((preset, idx) => (
                <button
                  type="button"
                  key={idx}
                  onClick={() => setFormData({ ...formData, image: preset.url })}
                  className={`aspect-square p-1 rounded-xl border bg-black flex flex-col items-center justify-center relative overflow-hidden cursor-pointer transition-all ${
                    formData.image === preset.url ? 'border-[#C52222] ring-2 ring-[#C52222]/50' : 'border-neutral-800 hover:border-neutral-700'
                  }`}
                >
                  <img src={preset.url} alt="" className="w-full h-full object-contain" />
                  {formData.image === preset.url && (
                    <div className="absolute inset-0 bg-[#C52222]/20 flex items-center justify-center">
                      <span className="bg-[#C52222] text-white rounded-full p-0.5">
                        <Check className="w-3.5 h-3.5" />
                      </span>
                    </div>
                  )}
                </button>
              ))}
            </div>
            <input
              type="text"
              value={formData.image}
              onChange={(e) => setFormData({ ...formData, image: e.target.value })}
              placeholder="O pega el link de una imagen externa (https://...)"
              className="w-full bg-[#0a0a0a] border border-neutral-800 rounded-xl p-2.5 text-neutral-300 text-xs font-mono focus:outline-none focus:border-[#C52222]"
            />
          </div>

          {/* 6. Optional Badge / Featured */}
          <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-t border-neutral-800">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="isFeaturedSimple"
                checked={formData.isFeatured}
                onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
                className="w-4 h-4 accent-[#C52222] rounded cursor-pointer"
              />
              <label htmlFor="isFeaturedSimple" className="font-condensed font-bold uppercase text-neutral-300 cursor-pointer">
                Mostrar en portada destacada
              </label>
            </div>

            <div className="flex items-center gap-2">
              <span className="font-condensed text-neutral-400 uppercase text-xs">Etiqueta:</span>
              <select
                value={formData.badge}
                onChange={(e) => setFormData({ ...formData, badge: e.target.value })}
                className="bg-[#0a0a0a] border border-neutral-700 rounded-lg px-2.5 py-1 text-white text-xs font-condensed uppercase cursor-pointer"
              >
                <option value="">Normal</option>
                <option value="LIMITED">LIMITED (Edición Limitada)</option>
                <option value="NEW">NUEVO</option>
                <option value="SALE">OFERTA</option>
              </select>
            </div>
          </div>

          {/* Submit Buttons */}
          <div className="pt-4 flex items-center justify-end gap-3 border-t border-neutral-800">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-3 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 font-condensed font-bold uppercase tracking-wider rounded-xl cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-8 py-3 bg-[#C52222] hover:bg-[#a81c1c] text-white font-condensed font-bold text-sm uppercase tracking-widest rounded-xl shadow-lg shadow-[#C52222]/30 transition-all cursor-pointer active:scale-95"
            >
              {productToEdit ? 'Guardar Cambios' : 'Guardar y Publicar'}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
