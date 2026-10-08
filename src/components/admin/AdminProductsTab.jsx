import React, { useState, useMemo } from 'react';
import { 
  Plus, 
  Search, 
  Edit2, 
  Trash2, 
  ExternalLink, 
  Minus, 
  CheckCircle2,
  Package,
  ArrowUpDown
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { formatCLP } from '../../utils/currency';
import { sortSizes } from '../../utils/sizes';
import { ProductEditorView } from './ProductEditorView';

const CATEGORIES = ['TODOS', 'POLERAS', 'POLERONES', 'CAMISETAS', 'PANTALONES', 'ACCESORIOS'];

export const AdminProductsTab = ({ isEditing, setIsEditing, productToEdit, setProductToEdit }) => {
  const { products, addProduct, updateProduct, deleteProduct, adjustStock } = useStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('TODOS');
  const [sortBy, setSortBy] = useState('newest');
  const [productToDelete, setProductToDelete] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);

  const showNotification = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2500);
  };

  const filteredProducts = useMemo(() => {
    const list = products.filter(p => {
      if (selectedCategory !== 'TODOS') {
        const cat = p.category?.toUpperCase();
        const sel = selectedCategory.toUpperCase();
        if (sel === 'POLERAS' || sel === 'CAMISETAS') {
          if (cat !== 'POLERAS' && cat !== 'CAMISETAS') return false;
        } else if (sel === 'POLERONES') {
          if (cat !== 'POLERONES' && cat !== 'HOODIES') return false;
        } else if (cat !== sel) {
          return false;
        }
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchName = p.name?.toLowerCase().includes(q);
        const matchCat = p.category?.toLowerCase().includes(q);
        const matchSku = p.sku?.toLowerCase().includes(q);
        if (!matchName && !matchCat && !matchSku) return false;
      }
      return true;
    });

    return list.slice().sort((a, b) => {
      if (sortBy === 'newest') {
        const timeA = a.created ? new Date(a.created).getTime() : 0;
        const timeB = b.created ? new Date(b.created).getTime() : 0;
        if (timeA !== timeB) return timeB - timeA;
        return products.indexOf(a) - products.indexOf(b);
      }
      if (sortBy === 'oldest') {
        const timeA = a.created ? new Date(a.created).getTime() : 0;
        const timeB = b.created ? new Date(b.created).getTime() : 0;
        if (timeA !== timeB) return timeA - timeB;
        return products.indexOf(b) - products.indexOf(a);
      }
      if (sortBy === 'stock-asc') {
        return (a.stock || 0) - (b.stock || 0);
      }
      if (sortBy === 'stock-desc') {
        return (b.stock || 0) - (a.stock || 0);
      }
      if (sortBy === 'price-desc') {
        return (b.price || 0) - (a.price || 0);
      }
      if (sortBy === 'price-asc') {
        return (a.price || 0) - (b.price || 0);
      }
      if (sortBy === 'name-asc') {
        return (a.name || '').localeCompare(b.name || '');
      }
      return 0;
    });
  }, [products, selectedCategory, searchQuery, sortBy]);

  const handleSaveProduct = async (formData) => {
    try {
      if (productToEdit) {
        await updateProduct(productToEdit.id, formData);
        showNotification(`"${formData.name}" actualizado en la base de datos`);
      } else {
        await addProduct(formData);
        showNotification(`¡"${formData.name}" creado con éxito en la base de datos!`);
      }
      setIsEditing(false);
      setProductToEdit(null);
    } catch (err) {
      console.error('Error al guardar prenda en base de datos:', err);
      throw err;
    }
  };

  const confirmDelete = async () => {
    if (productToDelete) {
      try {
        await deleteProduct(productToDelete.id);
        showNotification(`Prenda eliminada`);
        setProductToDelete(null);
      } catch (err) {
        console.error('Error al eliminar prenda:', err);
        alert('Error al eliminar prenda en la base de datos: ' + (err?.message || err));
      }
    }
  };

  // IF EDITING OR CREATING: Render Full Screen Editor View
  if (isEditing) {
    return (
      <ProductEditorView
        productToEdit={productToEdit}
        onSave={handleSaveProduct}
        onBack={() => {
          setIsEditing(false);
          setProductToEdit(null);
        }}
      />
    );
  }

  return (
    <div className="space-y-6">
      
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#151515] border border-[#C52222] text-white px-5 py-3 rounded-xl shadow-2xl flex items-center gap-2 text-xs font-condensed font-bold uppercase tracking-wider animate-in slide-in-from-bottom-2">
          <CheckCircle2 className="w-4 h-4 text-[#C52222]" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Clean Top Header */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="font-condensed text-2xl sm:text-3xl font-extrabold uppercase text-white tracking-wide">
            Productos &amp; Stock
          </h1>
          <p className="text-xs text-neutral-400">
            {products.length} prendas en total
          </p>
        </div>

        <button
          onClick={() => {
            setProductToEdit(null);
            setIsEditing(true);
          }}
          className="flex items-center gap-2 px-5 py-2.5 bg-[#C52222] hover:bg-[#a81c1c] text-white font-condensed font-bold text-xs uppercase tracking-widest rounded-xl shadow-md transition-all cursor-pointer active:scale-95 shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Nueva Prenda</span>
        </button>
      </div>

      {/* Filter, Search & Sorting Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 bg-[#111] p-3 rounded-2xl border border-neutral-800/80">
        
        {/* Left: Search & Sorting */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 flex-1">
          {/* Search */}
          <div className="relative flex-1 min-w-[200px]">
            <Search className="w-4 h-4 text-neutral-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar por nombre, categoría o SKU..."
              className="w-full bg-[#181818] border border-neutral-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder:text-neutral-500 focus:outline-none focus:border-[#C52222] transition-colors"
            />
          </div>

          {/* Sort Selector */}
          <div className="relative shrink-0 flex items-center">
            <ArrowUpDown className="w-3.5 h-3.5 text-[#C52222] absolute left-3 pointer-events-none" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="appearance-none bg-[#181818] border border-neutral-800 hover:border-neutral-700 text-white text-xs font-condensed font-bold uppercase tracking-wider rounded-xl pl-8 pr-8 py-2 focus:outline-none focus:border-[#C52222] cursor-pointer transition-all"
            >
              <option value="newest" className="bg-[#151515] text-white">⚡ Últimos subidos (Más recientes)</option>
              <option value="oldest" className="bg-[#151515] text-white">⏳ Primeros subidos (Más antiguos)</option>
              <option value="stock-asc" className="bg-[#151515] text-white">⚠️ Menor stock primero</option>
              <option value="stock-desc" className="bg-[#151515] text-white">📦 Mayor stock primero</option>
              <option value="price-desc" className="bg-[#151515] text-white">💎 Mayor precio</option>
              <option value="price-asc" className="bg-[#151515] text-white">🏷️ Menor precio</option>
              <option value="name-asc" className="bg-[#151515] text-white">🔤 Nombre (A - Z)</option>
            </select>
            <div className="absolute right-3 pointer-events-none text-[10px] text-neutral-400">▼</div>
          </div>
        </div>

        {/* Right: Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 lg:pb-0">
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-condensed font-bold uppercase transition-all whitespace-nowrap cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-[#C52222] text-white shadow-sm'
                  : 'bg-[#181818] border border-neutral-800 text-neutral-400 hover:text-white'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

      </div>

      {/* Products Grid */}
      {filteredProducts.length === 0 ? (
        <div className="bg-[#111] border border-neutral-800 rounded-2xl p-10 text-center text-neutral-400 space-y-2">
          <Package className="w-10 h-10 text-neutral-600 mx-auto" />
          <p className="font-condensed text-sm font-bold uppercase text-white">No se encontraron prendas</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredProducts.map(product => {
            const stock = product.stock || 0;
            const isOut = stock <= 0;
            const isLow = stock < 10 && stock > 0;

            return (
              <div 
                key={product.id}
                className="bg-[#111111] border border-neutral-800/80 hover:border-neutral-700 rounded-2xl p-4 flex flex-col justify-between transition-all"
              >
                <div>
                  
                  {/* Image & Badges */}
                  <div className="relative aspect-square w-full bg-[#050505] rounded-xl border border-neutral-900 p-2 mb-3 flex items-center justify-center overflow-hidden">
                    <img
                      src={product.image || '/producto.png'}
                      alt={product.name}
                      className="max-h-full max-w-full object-contain"
                      onError={(e) => { e.target.src = '/producto.png'; }}
                    />
                    
                    {product.badge && (
                      <span className="absolute top-2 left-2 px-2 py-0.5 text-[9px] font-condensed font-bold uppercase bg-[#C52222] text-white rounded">
                        {product.badge}
                      </span>
                    )}

                    {product.isFeatured && (
                      <span className="absolute top-2 right-2 px-2 py-0.5 text-[9px] font-condensed font-bold uppercase bg-amber-500 text-black rounded">
                        ★ Portada
                      </span>
                    )}
                  </div>

                  {/* Title, Category, SKU & Date */}
                  <div className="flex items-center justify-between gap-1 mb-1 text-[10px] font-condensed uppercase tracking-wider text-neutral-500 font-bold">
                    <span className="truncate">
                      {product.category} {product.sku ? `• ${product.sku}` : ''}
                    </span>
                    {product.created && (
                      <span className="text-[9px] font-mono text-neutral-400 bg-neutral-900 px-1.5 py-0.5 rounded border border-neutral-800 shrink-0" title={`Subido: ${new Date(product.created).toLocaleString('es-CL')}`}>
                        {new Date(product.created).toLocaleDateString('es-CL', { day: '2-digit', month: 'short' })}
                      </span>
                    )}
                  </div>

                  <h3 className="font-condensed font-extrabold text-sm text-white uppercase truncate mb-1">
                    {product.name}
                  </h3>

                  <div className="font-mono text-lg font-extrabold text-[#C52222] mb-3">
                    {formatCLP(product.price)}
                  </div>

                </div>

                {/* Direct Stock & Actions */}
                <div className="space-y-2 pt-2 border-t border-neutral-800/80">
                  
                  {/* Stock Bar */}
                  <div className="bg-[#080808] border border-neutral-800/80 rounded-xl px-3 py-2 flex items-center justify-between">
                    <span className={`text-[11px] font-condensed font-bold uppercase ${
                      isOut ? 'text-red-400' : isLow ? 'text-amber-400' : 'text-emerald-400'
                    }`}>
                      {isOut ? 'Agotado' : isLow ? 'Stock Bajo' : 'En Stock'}
                    </span>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => adjustStock(product.id, -1)}
                        disabled={stock <= 0}
                        className="w-7 h-7 bg-neutral-800 hover:bg-neutral-700 disabled:opacity-30 text-white rounded-lg flex items-center justify-center font-bold text-xs cursor-pointer"
                        title="-1"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="w-8 text-center font-mono font-bold text-sm text-white">
                        {stock}
                      </span>
                      <button
                        onClick={() => adjustStock(product.id, 1)}
                        className="w-7 h-7 bg-neutral-800 hover:bg-[#C52222] text-white rounded-lg flex items-center justify-center font-bold text-xs cursor-pointer"
                        title="+1"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                  </div>

                  {/* Size Stock Badges Preview */}
                  {product.sizes && product.sizes.length > 0 && (
                    <div className="flex flex-wrap items-center gap-1">
                      {sortSizes(product.sizes).map(sz => {
                        const szStock = product.sizeStock?.[sz] !== undefined ? Number(product.sizeStock[sz]) : 0;
                        const isSzOut = szStock <= 0;
                        return (
                          <span 
                            key={sz}
                            className={`text-[10px] font-mono px-2 py-0.5 rounded border ${
                              isSzOut 
                                ? 'bg-red-950/30 text-red-400 border-red-900/50 line-through' 
                                : szStock <= 2 
                                  ? 'bg-amber-950/30 text-amber-300 border-amber-900/50' 
                                  : 'bg-black text-neutral-300 border-neutral-800'
                            }`}
                            title={`Talla ${sz}: ${szStock} unidades disponibles`}
                          >
                            <span className="font-condensed font-bold uppercase">{sz}:</span> {szStock}
                          </span>
                        );
                      })}
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        setProductToEdit(product);
                        setIsEditing(true);
                      }}
                      className="flex-1 py-1.5 bg-[#181818] hover:bg-[#C52222] text-neutral-300 hover:text-white rounded-lg text-center text-[11px] font-condensed font-bold uppercase flex items-center justify-center gap-1 transition-colors cursor-pointer"
                    >
                      <Edit2 className="w-3 h-3" />
                      <span>Editar</span>
                    </button>

                    <a
                      href={`/producto/${product.id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1.5 bg-[#181818] hover:bg-neutral-800 text-neutral-400 hover:text-white rounded-lg transition-colors"
                      title="Ver en Tienda"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>

                    <button
                      onClick={() => setProductToDelete(product)}
                      className="p-1.5 text-neutral-500 hover:text-red-400 hover:bg-red-950/30 rounded-lg transition-colors cursor-pointer"
                      title="Eliminar"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                </div>

              </div>
            );
          })}
        </div>
      )}

      {/* Delete Confirmation Popup */}
      {productToDelete && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#111] border border-red-800 p-5 rounded-2xl max-w-xs w-full space-y-3 shadow-2xl text-center">
            <h3 className="font-condensed text-base font-bold uppercase text-white">¿Eliminar prenda?</h3>
            <p className="text-xs text-neutral-400">"{productToDelete.name}"</p>
            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setProductToDelete(null)}
                className="flex-1 py-2 bg-neutral-800 text-neutral-300 font-condensed font-bold uppercase text-xs rounded-lg cursor-pointer"
              >
                Cancelar
              </button>
              <button
                onClick={confirmDelete}
                className="flex-1 py-2 bg-red-700 hover:bg-red-800 text-white font-condensed font-bold uppercase text-xs rounded-lg cursor-pointer"
              >
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
