import React, { useState, useEffect, useRef } from 'react';
import { 
  ArrowLeft, 
  Check, 
  Plus, 
  Minus, 
  Save, 
  CheckCircle2,
  Upload,
  Image as ImageIcon,
  Trash2,
  Star,
  X
} from 'lucide-react';
import { formatCLP } from '../../utils/currency';

const CATEGORIES = ['Poleras', 'Polerones', 'Camisetas', 'Pantalones', 'Accesorios'];
const SIZES = ['S', 'M', 'L', 'XL', 'XXL', 'Única'];

const SIZE_ORDER = ['XS', 'S', 'M', 'L', 'XL', 'XXL', '3XL', 'Única'];
const sortSizes = (list) => {
  if (!Array.isArray(list)) return [];
  return [...list].sort((a, b) => {
    const idxA = SIZE_ORDER.indexOf(a);
    const idxB = SIZE_ORDER.indexOf(b);
    if (idxA !== -1 && idxB !== -1) return idxA - idxB;
    if (idxA !== -1) return -1;
    if (idxB !== -1) return 1;
    return a.localeCompare(b);
  });
};

export const ProductEditorView = ({ productToEdit, onSave, onBack }) => {
  const mainImageInputRef = useRef(null);
  const galleryImageInputRef = useRef(null);

  const [formData, setFormData] = useState({
    name: '',
    price: '',
    originalPrice: '',
    category: 'Poleras',
    stock: 22,
    sizeStock: { 'S': 3, 'M': 6, 'L': 7, 'XL': 4, 'XXL': 2 },
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    image: '/producto.webp',
    gallery: ['/producto.webp'],
    badge: '',
    description: '',
    isFeatured: true
  });

  const [mainImageFile, setMainImageFile] = useState(null);
  const [galleryFiles, setGalleryFiles] = useState([]);
  const [imageItems, setImageItems] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    if (productToEdit) {
      const rawSizes = Array.isArray(productToEdit.sizes) && productToEdit.sizes.length > 0 
        ? productToEdit.sizes 
        : ['S', 'M', 'L', 'XL', 'XXL'];
      const sizes = sortSizes(rawSizes);
      
      let sizeStock = productToEdit.sizeStock;
      if (!sizeStock || typeof sizeStock !== 'object') {
        sizeStock = {};
        const total = productToEdit.stock !== undefined ? Number(productToEdit.stock) : 20;
        const perSz = Math.floor(total / sizes.length);
        const rem = total % sizes.length;
        sizes.forEach((sz, idx) => {
          sizeStock[sz] = perSz + (idx === 0 ? rem : 0);
        });
      }

      const totalStock = sizes.reduce((sum, s) => sum + (Number(sizeStock[s]) || 0), 0);
      const rawGallery = Array.isArray(productToEdit.gallery) && productToEdit.gallery.length > 0
        ? productToEdit.gallery
        : [productToEdit.image || '/producto.webp'];
      const rawImages = Array.isArray(productToEdit.rawImages) ? productToEdit.rawImages : [];

      const initialItems = rawGallery.map((url, idx) => ({
        id: `existing-${idx}-${Date.now()}-${idx}`,
        url,
        file: null,
        rawName: rawImages[idx] || null
      }));
      setImageItems(initialItems);

      setFormData({
        name: productToEdit.name || '',
        price: productToEdit.price !== undefined ? String(productToEdit.price) : '',
        originalPrice: productToEdit.originalPrice ? String(productToEdit.originalPrice) : '',
        category: productToEdit.category || 'Poleras',
        stock: totalStock,
        sizeStock,
        sizes,
        image: initialItems[0]?.url || productToEdit.image || '/producto.webp',
        gallery: rawGallery,
        badge: productToEdit.badge || '',
        description: productToEdit.description || '',
        isFeatured: !!productToEdit.isFeatured
      });
      setMainImageFile(null);
      setGalleryFiles([]);
    } else {
      const defaultItems = [{
        id: 'default-main',
        url: '/producto.webp',
        file: null,
        rawName: null
      }];
      setImageItems(defaultItems);

      setFormData({
        name: '',
        price: '12000',
        originalPrice: '',
        category: 'Poleras',
        stock: 22,
        sizeStock: { 'S': 3, 'M': 6, 'L': 7, 'XL': 4, 'XXL': 2 },
        sizes: ['S', 'M', 'L', 'XL', 'XXL'],
        image: '/producto.webp',
        gallery: ['/producto.webp'],
        badge: 'NUEVO',
        description: 'Polera de alta calidad confeccionada en 100% algodón peinado 240 GSM con serigrafía de máxima fidelidad y resistencia.',
        isFeatured: false
      });
      setMainImageFile(null);
      setGalleryFiles([]);
    }
    setError('');
  }, [productToEdit]);

  // Handler: Subir Foto Principal desde el PC
  const handleMainImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (ev) => {
      const dataUrl = ev.target.result;
      const newItem = {
        id: `pc-main-${Date.now()}`,
        url: dataUrl,
        file,
        rawName: null
      };

      setImageItems(prev => {
        const additionals = prev.slice(1);
        return [newItem, ...additionals];
      });

      setMainImageFile(file);
      setFormData(prev => ({
        ...prev,
        image: dataUrl,
        gallery: [dataUrl, ...(prev.gallery.length > 1 ? prev.gallery.slice(1) : [])]
      }));
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  // Handler: Subir Fotos Adicionales desde el PC (Múltiples)
  const handleGalleryImagesChange = (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    files.forEach((file, idx) => {
      const reader = new FileReader();
      reader.onload = (ev) => {
        const dataUrl = ev.target.result;
        const newItem = {
          id: `pc-gal-${Date.now()}-${idx}-${Math.random().toString(36).slice(2, 7)}`,
          url: dataUrl,
          file,
          rawName: null
        };

        setImageItems(prev => [...prev, newItem]);
        setFormData(prev => ({
          ...prev,
          gallery: [...prev.gallery, dataUrl]
        }));
      };
      reader.readAsDataURL(file);
    });

    setGalleryFiles(prev => [...prev, ...files]);
    e.target.value = '';
  };

  // Handler: Promover una foto adicional a Foto Principal
  const handleMakeMainImage = (indexInItems) => {
    if (indexInItems <= 0) return;
    setImageItems(prev => {
      const chosen = prev[indexInItems];
      const rest = prev.filter((_, i) => i !== indexInItems);
      const next = [chosen, ...rest];
      setFormData(f => ({
        ...f,
        image: chosen.url,
        gallery: next.map(it => it.url)
      }));
      return next;
    });
  };

  // Handler: Eliminar foto adicional
  const handleRemoveAdditionalImage = (indexInItems) => {
    if (indexInItems <= 0) return;
    setImageItems(prev => {
      const next = prev.filter((_, i) => i !== indexInItems);
      setFormData(f => ({
        ...f,
        gallery: next.map(it => it.url)
      }));
      return next;
    });
  };

  // Handler: Quitar o reiniciar foto principal
  const handleRemoveMainImage = () => {
    setImageItems(prev => {
      if (prev.length > 1) {
        const next = prev.slice(1);
        setFormData(f => ({
          ...f,
          image: next[0].url,
          gallery: next.map(it => it.url)
        }));
        return next;
      }
      const resetItem = { id: 'empty-main', url: '/producto.png', file: null, rawName: null };
      setFormData(f => ({
        ...f,
        image: '/producto.png',
        gallery: ['/producto.png']
      }));
      return [resetItem];
    });
  };

  const handleSizeToggle = (size) => {
    setFormData(prev => {
      const exists = prev.sizes.includes(size);
      if (exists && prev.sizes.length === 1) return prev; // Mantener al menos una talla

      const nextSizes = sortSizes(exists ? prev.sizes.filter(s => s !== size) : [...prev.sizes, size]);
      const nextSizeStock = { ...(prev.sizeStock || {}) };
      
      if (!exists && nextSizeStock[size] === undefined) {
        nextSizeStock[size] = 4;
      }
      
      const totalStock = nextSizes.reduce((sum, s) => sum + (Number(nextSizeStock[s]) || 0), 0);

      return {
        ...prev,
        sizes: nextSizes,
        sizeStock: nextSizeStock,
        stock: totalStock
      };
    });
  };

  const handleSizeStockChange = (sz, delta) => {
    setFormData(prev => {
      const current = prev.sizeStock?.[sz] !== undefined ? Number(prev.sizeStock[sz]) : 0;
      const nextSizeStock = {
        ...(prev.sizeStock || {}),
        [sz]: Math.max(0, current + delta)
      };
      const totalStock = prev.sizes.reduce((sum, s) => sum + (Number(nextSizeStock[s]) || 0), 0);
      return {
        ...prev,
        sizeStock: nextSizeStock,
        stock: totalStock
      };
    });
  };

  const handleSizeStockInput = (sz, val) => {
    const num = Math.max(0, parseInt(val, 10) || 0);
    setFormData(prev => {
      const nextSizeStock = {
        ...(prev.sizeStock || {}),
        [sz]: num
      };
      const totalStock = prev.sizes.reduce((sum, s) => sum + (Number(nextSizeStock[s]) || 0), 0);
      return {
        ...prev,
        sizeStock: nextSizeStock,
        stock: totalStock
      };
    });
  };

  const handleBatchAddStock = (delta) => {
    setFormData(prev => {
      const nextSizeStock = { ...(prev.sizeStock || {}) };
      prev.sizes.forEach(sz => {
        const current = Number(nextSizeStock[sz]) || 0;
        nextSizeStock[sz] = Math.max(0, current + delta);
      });
      const totalStock = prev.sizes.reduce((sum, s) => sum + (Number(nextSizeStock[s]) || 0), 0);
      return {
        ...prev,
        sizeStock: nextSizeStock,
        stock: totalStock
      };
    });
  };

  const handleStockChange = (delta) => {
    setFormData(prev => {
      const nextTotal = Math.max(0, (Number(prev.stock) || 0) + delta);
      // Ajustar uniformemente entre las tallas activas
      const perSize = Math.floor(nextTotal / (prev.sizes.length || 1));
      const rem = nextTotal % (prev.sizes.length || 1);
      const nextSizeStock = {};
      prev.sizes.forEach((sz, idx) => {
        nextSizeStock[sz] = perSize + (idx === 0 ? rem : 0);
      });
      return {
        ...prev,
        stock: nextTotal,
        sizeStock: nextSizeStock
      };
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setError('Por favor ingresa un nombre para la prenda.');
      return;
    }
    if (!formData.price || isNaN(formData.price) || Number(formData.price) <= 0) {
      setError('Ingresa un precio válido en pesos chilenos (ej: 12000).');
      return;
    }

    const mainItem = imageItems[0];
    const additionals = imageItems.slice(1);

    const payload = {
      ...(productToEdit || {}),
      name: formData.name.trim().toUpperCase(),
      price: Math.round(Number(formData.price)),
      originalPrice: formData.originalPrice ? Math.round(Number(formData.originalPrice)) : null,
      category: formData.category,
      stock: parseInt(formData.stock, 10) || 0,
      sizeStock: formData.sizeStock,
      sizes: formData.sizes,
      image: mainItem?.url || formData.image || '/producto.webp',
      gallery: imageItems.length > 0 ? imageItems.map(it => it.url) : [formData.image || '/producto.webp'],
      imageItems,
      mainImageFile: mainItem?.file || null,
      galleryFiles: additionals.filter(it => it.file !== null).map(it => it.file),
      badge: formData.badge || null,
      description: formData.description.trim(),
      isFeatured: formData.isFeatured,
      sku: productToEdit?.sku || `PN-POL-${Math.floor(100 + Math.random() * 900)}`,
      gsm: productToEdit?.gsm || '240 GSM Algodón Pesado',
      fit: productToEdit?.fit || 'Corte Regular'
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

          {/* Gestión de Stock Individual por Talla */}
          <div className="space-y-4 pt-2 bg-[#0c0c0c] border border-neutral-800 p-5 rounded-2xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-neutral-800/80">
              <div>
                <label className="block text-xs font-condensed font-bold uppercase tracking-wider text-white">
                  Stock Individual por Talla
                </label>
                <p className="text-xs text-neutral-400 mt-0.5">
                  Ajusta la cantidad exacta disponible para cada talla
                </p>
              </div>

              <div className="flex items-center gap-2 self-start sm:self-auto flex-wrap">
                <button
                  type="button"
                  onClick={() => handleBatchAddStock(5)}
                  className="px-2.5 py-1.5 bg-neutral-900 hover:bg-neutral-800 text-neutral-300 hover:text-white rounded-lg text-[11px] font-condensed font-bold uppercase transition-colors cursor-pointer border border-neutral-800 active:scale-95"
                  title="Sumar +5 a todas las tallas"
                >
                  +5 a todas
                </button>
                <button
                  type="button"
                  onClick={() => handleBatchAddStock(10)}
                  className="px-2.5 py-1.5 bg-neutral-900 hover:bg-neutral-800 text-neutral-300 hover:text-white rounded-lg text-[11px] font-condensed font-bold uppercase transition-colors cursor-pointer border border-neutral-800 active:scale-95"
                  title="Sumar +10 a todas las tallas"
                >
                  +10 a todas
                </button>
                <div className="bg-black px-3.5 py-1.5 rounded-lg border border-neutral-800 whitespace-nowrap">
                  <span className="text-xs font-mono text-neutral-400">
                    Total: <strong className="text-white font-bold text-sm ml-1">{formData.stock} u.</strong>
                  </span>
                </div>
              </div>
            </div>

            {/* Grid de tallas ordenadas y limpias */}
            <div className="flex flex-wrap gap-3">
              {sortSizes(formData.sizes).map(sz => {
                const szQty = formData.sizeStock?.[sz] !== undefined ? formData.sizeStock[sz] : 0;
                const isOut = szQty <= 0;
                const isLow = szQty > 0 && szQty <= 2;

                return (
                  <div 
                    key={sz} 
                    className={`flex-1 min-w-[130px] bg-black border rounded-xl p-3 flex flex-col justify-between transition-all ${
                      isOut 
                        ? 'border-red-900/50 bg-red-950/10' 
                        : isLow 
                          ? 'border-amber-900/50 bg-amber-950/10' 
                          : 'border-neutral-800 hover:border-neutral-700'
                    }`}
                  >
                    {/* Header: Talla & Estado */}
                    <div className="flex items-center justify-between w-full mb-2.5">
                      <span className="font-condensed font-extrabold text-sm uppercase text-white tracking-wider">
                        TALLA {sz}
                      </span>
                      <span className={`text-[9px] font-condensed font-bold uppercase px-1.5 py-0.5 rounded ${
                        isOut ? 'text-red-400 bg-red-500/10' : isLow ? 'text-amber-400 bg-amber-500/10' : 'text-emerald-400 bg-emerald-500/10'
                      }`}>
                        {isOut ? 'Agotada' : isLow ? 'Bajo' : 'En Stock'}
                      </span>
                    </div>

                    {/* Stepper limpio y sin desbordes */}
                    <div className="flex items-center w-full bg-[#111] border border-neutral-800 rounded-lg p-1">
                      <button
                        type="button"
                        onClick={() => handleSizeStockChange(sz, -1)}
                        disabled={szQty <= 0}
                        className="w-7 h-7 rounded bg-neutral-900 hover:bg-neutral-800 disabled:opacity-20 text-neutral-300 hover:text-white flex items-center justify-center font-bold text-xs cursor-pointer transition-colors active:scale-90 shrink-0"
                        title="Restar 1"
                      >
                        <Minus className="w-3 h-3" />
                      </button>

                      <input
                        type="number"
                        min="0"
                        value={szQty}
                        onChange={(e) => handleSizeStockInput(sz, e.target.value)}
                        className="flex-1 min-w-0 text-center font-mono font-bold text-sm text-white bg-transparent focus:outline-none focus:text-[#C52222]"
                      />

                      <button
                        type="button"
                        onClick={() => handleSizeStockChange(sz, 1)}
                        className="w-7 h-7 rounded bg-neutral-900 hover:bg-[#C52222] text-neutral-300 hover:text-white flex items-center justify-center font-bold text-xs cursor-pointer transition-colors active:scale-90 shrink-0"
                        title="Sumar 1"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>

                    {/* Conteo en texto inferior */}
                    <div className="text-center mt-2">
                      <span className="text-[10px] font-mono text-neutral-500">
                        {szQty} {szQty === 1 ? 'unidad' : 'unidades'}
                      </span>
                    </div>
                  </div>
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

        {/* COLUMNA DERECHA: Foto Principal y Fotos Adicionales (5 columnas) */}
        <div className="lg:col-span-5 bg-[#111111] border border-neutral-800/80 rounded-2xl p-5 sm:p-7 space-y-6 shadow-xl lg:sticky lg:top-8">
          
          {/* Título Superior */}
          <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
            <div className="flex items-center gap-2">
              <ImageIcon className="w-4 h-4 text-[#C52222]" />
              <span className="text-xs font-condensed font-bold uppercase tracking-wider text-white">
                Imágenes de la Prenda
              </span>
            </div>
            <span className="text-[10px] font-condensed font-bold uppercase tracking-wider text-neutral-400 bg-neutral-900 border border-neutral-800 px-2 py-0.5 rounded">
              {imageItems.length} {imageItems.length === 1 ? 'Foto' : 'Fotos'}
            </span>
          </div>

          {/* 1. SECCIÓN: FOTO PRINCIPAL (PORTADA) */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#C52222]"></span>
                <span className="text-xs font-condensed font-bold uppercase tracking-wider text-white">
                  1. Foto Principal (Portada)
                </span>
              </div>
              <span className="text-[9px] font-condensed font-bold uppercase bg-[#C52222]/20 text-[#ff4d4d] border border-[#C52222]/40 px-2 py-0.5 rounded">
                Principal
              </span>
            </div>

            {/* Gran Contenedor de Vista Previa Principal */}
            <div className="relative aspect-square w-full bg-black rounded-xl border-2 border-neutral-800 hover:border-neutral-700 transition-colors p-3 flex items-center justify-center overflow-hidden shadow-inner group">
              <img
                src={imageItems[0]?.url || formData.image || '/producto.png'}
                alt="Vista previa principal"
                className="max-h-full max-w-full object-contain filter contrast-105 transition-transform duration-300 group-hover:scale-105"
                onError={(e) => { e.target.src = '/producto.png'; }}
              />

              {/* Badges superpuestos */}
              <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10 pointer-events-none">
                <span className="px-2 py-0.5 text-[9px] font-condensed font-bold uppercase bg-black/80 text-neutral-200 border border-neutral-700 rounded backdrop-blur-sm">
                  FOTO #1
                </span>
                {formData.badge && (
                  <span className="px-2 py-0.5 text-[9px] font-condensed font-bold uppercase bg-[#C52222] text-white rounded shadow">
                    {formData.badge}
                  </span>
                )}
              </div>

              {formData.isFeatured && (
                <span className="absolute top-3 right-3 px-2 py-0.5 text-[9px] font-condensed font-bold uppercase bg-amber-500 text-black font-bold rounded shadow z-10 pointer-events-none">
                  ★ Portada
                </span>
              )}

              {/* Botón Quitar Foto Principal flotante si existe personalizada */}
              {imageItems.length > 0 && imageItems[0]?.url && imageItems[0]?.url !== '/producto.webp' && imageItems[0]?.url !== '/producto.png' && (
                <button
                  type="button"
                  onClick={handleRemoveMainImage}
                  title="Quitar foto principal"
                  className="absolute bottom-3 right-3 bg-black/85 hover:bg-[#C52222] text-neutral-300 hover:text-white p-2 rounded-lg border border-neutral-700 transition-all opacity-80 hover:opacity-100 cursor-pointer shadow-lg"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Input oculto para foto principal */}
            <input
              ref={mainImageInputRef}
              type="file"
              accept="image/png,image/jpeg,image/webp,image/gif"
              onChange={handleMainImageChange}
              className="hidden"
            />

            {/* Botón Destacado: Subir Foto Principal desde el PC */}
            <button
              type="button"
              onClick={() => mainImageInputRef.current?.click()}
              className="w-full py-3 bg-[#181818] hover:bg-[#222222] text-white border border-neutral-700 hover:border-[#C52222] rounded-xl font-condensed font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2.5 transition-all shadow-md group cursor-pointer active:scale-98"
            >
              <Upload className="w-4 h-4 text-[#C52222] group-hover:scale-110 transition-transform" />
              <span>
                {imageItems[0]?.file ? 'Cambiar Foto Principal (PC)' : 'Subir Foto Principal desde el PC'}
              </span>
            </button>

            {/* Indicador de archivo cargado desde el PC */}
            {imageItems[0]?.file && (
              <div className="text-[11px] text-emerald-400 bg-emerald-950/40 border border-emerald-800/60 rounded-lg px-3 py-1.5 flex items-center gap-2 font-sans">
                <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span className="truncate">Archivo cargado: <strong>{imageItems[0].file.name}</strong></span>
              </div>
            )}
          </div>

          {/* 2. SECCIÓN: FOTOS ADICIONALES (OPCIONAL) */}
          <div className="border-t border-neutral-800/90 pt-5 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-condensed font-bold uppercase tracking-wider text-white block">
                  2. Fotos Adicionales
                </span>
                <span className="text-[11px] text-neutral-400 font-sans">
                  Espalda, detalles o ángulos secundarios
                </span>
              </div>
              <span className="px-2 py-0.5 rounded text-[9px] font-condensed font-bold uppercase bg-neutral-800 text-neutral-300 border border-neutral-700">
                Opcional · {imageItems.slice(1).length}
              </span>
            </div>

            {/* Input oculto para fotos adicionales (múltiples) */}
            <input
              ref={galleryImageInputRef}
              type="file"
              accept="image/png,image/jpeg,image/webp,image/gif"
              multiple
              onChange={handleGalleryImagesChange}
              className="hidden"
            />

            {/* Botón: Añadir Fotos Adicionales desde el PC */}
            <button
              type="button"
              onClick={() => galleryImageInputRef.current?.click()}
              className="w-full py-2.5 bg-black/60 hover:bg-neutral-800 text-neutral-300 hover:text-white border border-dashed border-neutral-700 hover:border-neutral-500 rounded-xl font-condensed font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer active:scale-98"
            >
              <Plus className="w-4 h-4 text-neutral-400" />
              <span>+ Subir Fotos Adicionales desde el PC</span>
            </button>

            {/* Cuadrícula de Miniaturas Adicionales */}
            {imageItems.slice(1).length > 0 ? (
              <div className="grid grid-cols-3 gap-2.5 pt-1">
                {imageItems.slice(1).map((item, idx) => {
                  const actualIndex = idx + 1;
                  return (
                    <div
                      key={item.id || idx}
                      className="relative aspect-square bg-black rounded-lg border border-neutral-800 hover:border-neutral-600 p-1.5 flex items-center justify-center overflow-hidden group shadow-sm"
                    >
                      <img
                        src={item.url}
                        alt={`Foto adicional ${actualIndex + 1}`}
                        className="max-h-full max-w-full object-contain filter contrast-105"
                        onError={(e) => { e.target.src = '/producto.png'; }}
                      />

                      {/* Badge con número de foto */}
                      <span className="absolute top-1 left-1 px-1.5 py-0.5 text-[8px] font-condensed font-bold uppercase bg-black/80 text-neutral-300 border border-neutral-700 rounded pointer-events-none">
                        #{actualIndex + 1}
                      </span>

                      {/* Overlay de acciones (Hacer Principal y Eliminar) */}
                      <div className="absolute inset-0 bg-black/80 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1.5 p-1">
                        <button
                          type="button"
                          onClick={() => handleMakeMainImage(actualIndex)}
                          title="Convertir en Foto Principal"
                          className="p-1.5 bg-neutral-800 hover:bg-amber-500 hover:text-black text-neutral-300 rounded transition-colors cursor-pointer"
                        >
                          <Star className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleRemoveAdditionalImage(actualIndex)}
                          title="Eliminar foto"
                          className="p-1.5 bg-neutral-800 hover:bg-[#C52222] text-neutral-300 hover:text-white rounded transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="bg-black/30 border border-neutral-800/60 rounded-xl p-3 text-center">
                <p className="text-[11px] text-neutral-500 font-sans">
                  Sin fotos adicionales. Si deseas mostrar más ángulos en la tienda, agrégalas con el botón de arriba.
                </p>
              </div>
            )}
          </div>

          {/* Desplegable Opcional: Pegar URL Directa */}
          <details className="group border-t border-neutral-800/70 pt-3 text-[11px]">
            <summary className="text-neutral-500 hover:text-neutral-300 cursor-pointer transition-colors select-none font-sans flex items-center justify-between">
              <span>Opción avanzada: Link o URL externa de imagen</span>
              <span className="text-[10px] group-open:rotate-180 transition-transform">▼</span>
            </summary>
            <div className="mt-2.5 space-y-1.5">
              <input
                type="text"
                value={formData.image}
                onChange={(e) => {
                  const url = e.target.value;
                  setFormData(prev => ({ ...prev, image: url }));
                  setImageItems(prev => {
                    const main = { id: `manual-${Date.now()}`, url, file: null, rawName: null };
                    return [main, ...prev.slice(1)];
                  });
                }}
                placeholder="https://... o /1x/polera.webp"
                className="w-full bg-[#0a0a0a] border border-neutral-800 focus:border-[#C52222] rounded-lg px-3 py-2 text-neutral-300 text-xs font-mono focus:outline-none transition-colors"
              />
              <p className="text-[10px] text-neutral-600 font-sans">
                Puedes pegar una URL web directa si no deseas subir archivos desde tu PC.
              </p>
            </div>
          </details>

          {/* Botón Guardar Inferior */}
          <button
            type="submit"
            className="w-full py-3.5 bg-[#C52222] hover:bg-[#a81c1c] text-white font-condensed font-bold text-xs uppercase tracking-widest rounded-xl shadow-lg shadow-[#C52222]/25 transition-all cursor-pointer active:scale-98 flex items-center justify-center gap-2"
          >
            <Save className="w-4 h-4" />
            <span>{productToEdit ? 'Guardar Cambios de la Prenda' : 'Publicar Prenda en Catálogo'}</span>
          </button>

        </div>

      </form>

    </div>
  );
};
