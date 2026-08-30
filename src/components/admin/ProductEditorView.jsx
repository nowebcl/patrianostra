import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, 
  Check, 
  Plus, 
  Minus, 
  Save,
  CheckCircle2
} from 'lucide-react';
import { formatCLP } from '../../utils/currency';

const PRESET_IMAGES = [
  { label: 'Hoodie Negro', url: '/producto.png' },
  { label: 'Modelo Táctico 1', url: '/hero2.png' },
  { label: 'Modelo Táctico 2', url: '/hero3.png' },
  { label: 'Banner Kronstadt', url: '/banner1.png' },
  { label: 'Colaboración Bastión', url: '/assets/images/collab_bastion_img.png' },
  { label: 'Colaboración Disidencia', url: '/assets/images/collab_disidencia_img.png' }
];

const CATEGORIES = ['Polerones', 'Camisetas', 'Pantalones', 'Accesorios'];
const SIZES = ['S', 'M', 'L', 'XL', 'XXL', 'Única'];

export const ProductEditorView = ({ productToEdit, onSave, onBack }) => {
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    originalPrice: '',
    category: 'Polerones',
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
        category: productToEdit.category === 'Hoodies' ? 'Polerones' : (productToEdit.category || 'Polerones'),
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
        description: 'Confeccionado en algodón peinado de alto gramaje con interior afelpado térmico y corte estructurado.',
        isFeatured: true
      });
    }
    setError('');
  }, [productToEdit]);

  const handleSizeToggle = (size) => {
    setFormData(prev => {
      const exists = prev.sizes.includes(size);
      if (exists) {
        if (prev.sizes.length === 1) return prev;
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
      setError('Ingresa un precio válido en pesos chilenos (ej: 59990).');
      return;
    }

    const payload = {
      ...(productToEdit || {}),
      name: formData.name.trim().toUpperCase(),
      price: Math.round(Number(formData.price)),
      originalPrice: formData.originalPrice ? Math.round(Number(formData.originalPrice)) : null,
      category: formData.category,
      stock: parseInt(formData.stock, 10) || 0,
      sizes: formData.sizes,
      image: formData.image || '/producto.png',
      gallery: [formData.image || '/producto.png', '/hero2.png'],
      badge: formData.badge || null,
      description: formData.description.trim(),
      isFeatured: formData.isFeatured,
      sku: productToEdit?.sku || `PN-${Math.floor(100 + Math.random() * 900)}`,
      gsm: productToEdit?.gsm || '380 GSM Heavyweight',
      fit: productToEdit?.fit || 'Oversize Boxy Fit'
    };

    onSave(payload);
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-16">
      
      {/* 1. Header amplio y despejado */}
      <div className="space-y-4">
        
        {/* Enlace Volver */}
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-2 text-xs font-condensed font-bold uppercase tracking-wider text-neutral-400 hover:text-white transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Volver a la lista de productos</span>
        </button>

        {/* Título & Botones de Acción */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-1">
          <div>
            <h1 className="font-condensed text-2xl sm:text-3xl font-extrabold uppercase text-white tracking-wide">
              {productToEdit ? `Editar: ${productToEdit.name}` : 'Crear Nueva Prenda'}
            </h1>
            <p className="text-xs text-neutral-400 mt-1">
              Configura los detalles, inventario y precio de la prenda en la tienda
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={onBack}
              className="px-5 py-2.5 bg-neutral-900 hover:bg-neutral-800 text-neutral-300 hover:text-white font-condensed font-bold text-xs uppercase tracking-wider rounded-xl transition-all cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              className="flex items-center gap-2 px-6 py-2.5 bg-[#C52222] hover:bg-[#a81c1c] text-white font-condensed font-bold text-xs uppercase tracking-widest rounded-xl shadow-lg shadow-[#C52222]/25 transition-all cursor-pointer active:scale-95"
            >
              <Save className="w-4 h-4" />
              <span>Guardar Prenda</span>
            </button>
          </div>
        </div>

      </div>

      {/* Alerta de Error */}
      {error && (
        <div className="p-4 bg-red-950/50 border border-red-800 text-red-200 text-xs rounded-xl font-medium">
          {error}
        </div>
      )}

      {/* 2. Formulario en 2 Columnas Espaciosas */}
      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* COLUMNA IZQUIERDA: Datos Principales (7 columnas) */}
        <div className="lg:col-span-7 bg-[#111111] border border-neutral-800/80 rounded-2xl p-6 sm:p-8 space-y-6 shadow-xl">
          
          {/* Nombre de la Prenda */}
          <div className="space-y-2">
            <label className="block text-xs font-condensed font-bold uppercase tracking-wider text-neutral-300">
              Nombre de la Prenda *
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Ej: HOODIE PATRIA NOSTRA NEGRO"
              className="w-full bg-[#0a0a0a] border border-neutral-700/80 focus:border-[#C52222] rounded-xl px-4 py-3 text-white text-sm font-semibold placeholder:text-neutral-600 focus:outline-none transition-colors"
            />
          </div>

          {/* Fila: Precios y Stock */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1">
            
            {/* Precio Normal */}
            <div className="space-y-2">
              <label className="block text-xs font-condensed font-bold uppercase tracking-wider text-neutral-300">
                Precio ($ CLP) *
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-500 font-bold">$</span>
                <input
                  type="number"
                  step="100"
                  required
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  placeholder="59990"
                  className="w-full bg-[#0a0a0a] border border-neutral-700/80 focus:border-[#C52222] rounded-xl pl-8 pr-3 py-2.5 text-white text-sm font-mono font-bold focus:outline-none transition-colors"
                />
              </div>
            </div>

            {/* Precio Oferta / Anterior */}
            <div className="space-y-2">
              <label className="block text-xs font-condensed font-bold uppercase tracking-wider text-neutral-400">
                Precio Antes (Opcional)
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-600 font-bold">$</span>
                <input
                  type="number"
                  step="100"
                  value={formData.originalPrice}
                  onChange={(e) => setFormData({ ...formData, originalPrice: e.target.value })}
                  placeholder="69990"
                  className="w-full bg-[#0a0a0a] border border-neutral-800 focus:border-[#C52222] rounded-xl pl-8 pr-3 py-2.5 text-neutral-300 text-sm font-mono focus:outline-none transition-colors"
                />
              </div>
            </div>

            {/* Stock en Bodega */}
            <div className="space-y-2">
              <label className="block text-xs font-condensed font-bold uppercase tracking-wider text-neutral-300">
                Stock (Unidades)
              </label>
              <div className="flex items-center gap-1.5 bg-[#0a0a0a] border border-neutral-700/80 rounded-xl p-1">
                <button
                  type="button"
                  onClick={() => handleStockChange(-1)}
                  className="w-8 h-8 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-white flex items-center justify-center font-bold text-xs cursor-pointer transition-colors"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <input
                  type="number"
                  min="0"
                  value={formData.stock}
                  onChange={(e) => setFormData({ ...formData, stock: Math.max(0, parseInt(e.target.value, 10) || 0) })}
                  className="w-full bg-transparent text-center font-mono font-bold text-sm text-white focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => handleStockChange(1)}
                  className="w-8 h-8 rounded-lg bg-neutral-800 hover:bg-[#C52222] text-white flex items-center justify-center font-bold text-xs cursor-pointer transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

          </div>

          {/* Categoría */}
          <div className="space-y-2 pt-2">
            <label className="block text-xs font-condensed font-bold uppercase tracking-wider text-neutral-300">
              Categoría
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {CATEGORIES.map(cat => {
                const isSelected = formData.category === cat;
                return (
                  <button
                    type="button"
                    key={cat}
                    onClick={() => setFormData({ ...formData, category: cat })}
                    className={`py-2.5 px-3 rounded-xl font-condensed font-bold text-xs uppercase tracking-wider transition-all cursor-pointer text-center ${
                      isSelected
                        ? 'bg-[#C52222] text-white shadow-md shadow-[#C52222]/20'
                        : 'bg-[#0a0a0a] border border-neutral-800 text-neutral-400 hover:text-white hover:border-neutral-700'
                    }`}
                  >
                    {cat}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Tallas Disponibles */}
          <div className="space-y-2 pt-2">
            <label className="block text-xs font-condensed font-bold uppercase tracking-wider text-neutral-300">
              Tallas Disponibles
            </label>
            <div className="flex flex-wrap gap-2">
              {SIZES.map(sz => {
                const isSelected = formData.sizes.includes(sz);
                return (
                  <button
                    type="button"
                    key={sz}
                    onClick={() => handleSizeToggle(sz)}
                    className={`px-4 py-2.5 rounded-xl font-condensed font-bold text-xs uppercase transition-all cursor-pointer flex items-center gap-1.5 ${
                      isSelected
                        ? 'bg-[#C52222] text-white shadow-md'
                        : 'bg-[#0a0a0a] border border-neutral-800 text-neutral-400 hover:text-white hover:border-neutral-700'
                    }`}
                  >
                    <span>{sz}</span>
                    {isSelected && <Check className="w-3 h-3" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Opciones adicionales: Destacado e Insignia */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-neutral-800/80">
            
            {/* Destacar en Portada */}
            <div className="flex items-center gap-3 bg-[#0a0a0a] border border-neutral-800 p-3.5 rounded-xl">
              <input
                type="checkbox"
                id="isFeaturedClean"
                checked={formData.isFeatured}
                onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
                className="w-4 h-4 accent-[#C52222] rounded cursor-pointer"
              />
              <label htmlFor="isFeaturedClean" className="text-xs font-condensed font-bold uppercase text-neutral-300 cursor-pointer">
                Destacar en la Portada (Home)
              </label>
            </div>

            {/* Insignia */}
            <div className="flex items-center justify-between bg-[#0a0a0a] border border-neutral-800 px-3.5 py-2 rounded-xl">
              <span className="text-xs font-condensed font-bold uppercase text-neutral-400">Insignia:</span>
              <select
                value={formData.badge}
                onChange={(e) => setFormData({ ...formData, badge: e.target.value })}
                className="bg-transparent text-white text-xs font-condensed font-bold uppercase cursor-pointer focus:outline-none"
              >
                <option value="" className="bg-neutral-900">Ninguna</option>
                <option value="EDICIÓN LIMITADA" className="bg-neutral-900">EDICIÓN LIMITADA</option>
                <option value="NUEVO" className="bg-neutral-900">NUEVO</option>
                <option value="OFERTA" className="bg-neutral-900">OFERTA</option>
              </select>
            </div>

          </div>

          {/* Descripción */}
          <div className="space-y-2 pt-2">
            <label className="block text-xs font-condensed font-bold uppercase tracking-wider text-neutral-300">
              Descripción de la Prenda
            </label>
            <textarea
              rows="3"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Describe el corte, tejido y características de la prenda..."
              className="w-full bg-[#0a0a0a] border border-neutral-700/80 focus:border-[#C52222] rounded-xl p-3 text-white text-xs font-sans placeholder:text-neutral-600 focus:outline-none transition-colors"
            />
          </div>

        </div>

        {/* COLUMNA DERECHA: Foto y Vista Previa (5 columnas) */}
        <div className="lg:col-span-5 bg-[#111111] border border-neutral-800/80 rounded-2xl p-6 sm:p-8 space-y-6 shadow-xl lg:sticky lg:top-8">
          
          {/* Título de Sección */}
          <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
            <span className="text-xs font-condensed font-bold uppercase tracking-wider text-white">
              Foto de la Prenda
            </span>
            <span className="text-[11px] text-neutral-500 font-sans">
              Vista previa
            </span>
          </div>

          {/* Imagen en Vivo */}
          <div className="relative aspect-square w-full max-w-xs mx-auto bg-black rounded-2xl border border-neutral-800 p-4 flex items-center justify-center overflow-hidden shadow-inner">
            <img
              src={formData.image || '/producto.png'}
              alt="Vista previa"
              className="max-h-full max-w-full object-contain"
              onError={(e) => { e.target.src = '/producto.png'; }}
            />

            {formData.badge && (
              <span className="absolute top-3 left-3 px-2 py-0.5 text-[9px] font-condensed font-bold uppercase bg-[#C52222] text-white rounded">
                {formData.badge}
              </span>
            )}
            {formData.isFeatured && (
              <span className="absolute top-3 right-3 px-2 py-0.5 text-[9px] font-condensed font-bold uppercase bg-amber-500 text-black rounded">
                ★ Portada
              </span>
            )}
          </div>

          {/* Selector Rápido de Fotos Oficiales */}
          <div className="space-y-2">
            <label className="block text-xs font-condensed font-bold uppercase tracking-wider text-neutral-400">
              Elegir foto de la marca (1 clic):
            </label>
            <div className="grid grid-cols-3 gap-2">
              {PRESET_IMAGES.map((preset, idx) => {
                const isSelected = formData.image === preset.url;
                return (
                  <button
                    type="button"
                    key={idx}
                    onClick={() => setFormData({ ...formData, image: preset.url })}
                    className={`aspect-square p-2 rounded-xl border bg-black flex items-center justify-center relative cursor-pointer transition-all ${
                      isSelected
                        ? 'border-[#C52222] ring-2 ring-[#C52222]/40 scale-102'
                        : 'border-neutral-800 hover:border-neutral-700 opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img src={preset.url} alt="" className="w-full h-full object-contain" />
                    {isSelected && (
                      <div className="absolute inset-0 bg-[#C52222]/20 flex items-center justify-center">
                        <span className="bg-[#C52222] text-white rounded-full p-0.5">
                          <Check className="w-3 h-3" />
                        </span>
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Enlace Personalizado */}
          <div className="space-y-1.5">
            <label className="block text-[11px] font-condensed font-bold uppercase tracking-wider text-neutral-400">
              O ingresa un link de imagen:
            </label>
            <input
              type="text"
              value={formData.image}
              onChange={(e) => setFormData({ ...formData, image: e.target.value })}
              placeholder="https://ejemplo.com/foto.png"
              className="w-full bg-[#0a0a0a] border border-neutral-800 focus:border-[#C52222] rounded-xl px-3 py-2 text-neutral-300 text-xs font-mono focus:outline-none transition-colors"
            />
          </div>

          {/* Botón Guardar Inferior */}
          <button
            type="submit"
            className="w-full py-3.5 bg-[#C52222] hover:bg-[#a81c1c] text-white font-condensed font-bold text-xs uppercase tracking-widest rounded-xl shadow-lg shadow-[#C52222]/25 transition-all cursor-pointer active:scale-98"
          >
            Guardar Prenda
          </button>

        </div>

      </form>

    </div>
  );
};
