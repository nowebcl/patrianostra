import React, { useState, useEffect, useRef, useMemo } from 'react';
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
  X,
  Palette,
  Tag,
  FolderPlus,
  Sparkles,
  Disc
} from 'lucide-react';
import { formatCLP } from '../../utils/currency';
import { optimizeImageFile, formatPbError } from '../../utils/imageOptimizer';
import { COLOR_DEFINITIONS, detectColorFromText } from '../../lib/pocketbase';
import { useStore } from '../../context/StoreContext';

const DEFAULT_CATEGORIES = [
  'Poleras',
  'Polerones',
  'Camisetas',
  'Pantalones',
  'Accesorios',
  'Música',
  'Vinilos',
  'CDs',
  'Casetes'
];
const SIZES = ['S', 'M', 'L', 'XL', 'XXL', 'Única'];

const MUSIC_CATEGORIES_SET = new Set(['música', 'musica', 'vinilos', 'vinilo', 'cds', 'cd', 'casetes', 'casete', 'cassettes', 'cassette']);
const isMusicCategory = (cat) => MUSIC_CATEGORIES_SET.has((cat || '').toLowerCase().trim());
const isSingleSizeCategory = (cat) => isMusicCategory(cat) || (cat || '').toLowerCase().trim() === 'accesorios';

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
  const { products } = useStore();
  const mainImageInputRef = useRef(null);
  const galleryImageInputRef = useRef(null);
  const colorImageInputRef = useRef(null);

  // Categorías dinámicas
  const [customCategories, setCustomCategories] = useState([]);
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');

  const allCategories = useMemo(() => {
    const fromStore = products ? products.map(p => p.category).filter(Boolean) : [];
    const set = new Set([...DEFAULT_CATEGORIES, ...fromStore, ...customCategories]);
    return Array.from(set).map(c => c.trim()).filter(Boolean);
  }, [products, customCategories]);

  // Colores y variantes
  const [colors, setColors] = useState(['Negro']);
  const [colorImages, setColorImages] = useState({});
  const [targetUploadColor, setTargetUploadColor] = useState(null);
  const [customColorName, setCustomColorName] = useState('');
  const [isAddingCustomColor, setIsAddingCustomColor] = useState(false);

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
  const [isSaving, setIsSaving] = useState(false);
  const [isOptimizing, setIsOptimizing] = useState(false);

  const isMusic = isMusicCategory(formData.category);

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

      const editIsMusic = isMusicCategory(productToEdit.category);

      // Colores existentes o detectados (solo para prendas)
      const initialColors = editIsMusic
        ? []
        : (Array.isArray(productToEdit.colors) && productToEdit.colors.length > 0
          ? productToEdit.colors
          : ['Negro']);
      const initialColorImages = editIsMusic
        ? {}
        : (productToEdit.colorImages && typeof productToEdit.colorImages === 'object'
          ? { ...productToEdit.colorImages }
          : {});

      setColors(initialColors);
      setColorImages(initialColorImages);

      const initialItems = rawGallery.map((url, idx) => {
        const rawName = rawImages[idx] || null;
        let assignedColor = null;
        
        // Buscar si ya está asignada a un color
        for (const [colName, colUrl] of Object.entries(initialColorImages)) {
          if (colUrl === url) {
            assignedColor = colName;
            break;
          }
        }
        // Si no está asignada, intentar detectar del nombre
        if (!assignedColor) {
          const detected = detectColorFromText(rawName || url);
          if (detected) assignedColor = detected.name;
        }

        return {
          id: `existing-${idx}-${Date.now()}-${idx}`,
          url,
          file: null,
          rawName,
          color: assignedColor || (idx === 0 ? initialColors[0] : null)
        };
      });

      // Asegurar que cada color tenga asignada una imagen si coincide
      initialColors.forEach(cName => {
        if (!initialColorImages[cName]) {
          const matchingItem = initialItems.find(it => it.color === cName);
          if (matchingItem) {
            initialColorImages[cName] = matchingItem.url;
          } else if (cName === initialColors[0] && initialItems[0]) {
            initialColorImages[cName] = initialItems[0].url;
          }
        }
      });
      setColorImages(initialColorImages);
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
        rawName: null,
        color: 'Negro'
      }];
      setImageItems(defaultItems);
      setColors(['Negro']);
      setColorImages({ 'Negro': '/producto.webp' });

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
        description: 'Polera de alta calidad confeccionada en 100% algodón peinado 240 GSM con estampados en DTF de alta calidad, resistentes e ilustraciones de máxima definición.',
        isFeatured: false
      });
      setMainImageFile(null);
      setGalleryFiles([]);
    }
    setError('');
  }, [productToEdit]);

  // Manejo de Colores
  const handleToggleColor = (colorName) => {
    if (colors.includes(colorName)) {
      if (colors.length === 1) {
        setError('La prenda debe tener al menos un color disponible.');
        return;
      }
      setColors(prev => prev.filter(c => c !== colorName));
      setColorImages(prev => {
        const next = { ...prev };
        delete next[colorName];
        return next;
      });
    } else {
      setColors(prev => [...prev, colorName]);
      // Si hay una foto que tenga ese color o sin color, asignarla
      const matchingImg = imageItems.find(it => it.color === colorName);
      if (matchingImg) {
        setColorImages(prev => ({ ...prev, [colorName]: matchingImg.url }));
      }
    }
  };

  const handleAddCustomColor = () => {
    const trimmed = customColorName.trim();
    if (!trimmed) return;
    const formatted = trimmed.charAt(0).toUpperCase() + trimmed.slice(1);
    if (!colors.includes(formatted)) {
      setColors(prev => [...prev, formatted]);
    }
    setCustomColorName('');
    setIsAddingCustomColor(false);
  };

  const handleAssignImageToColor = (colorName, imageUrl) => {
    if (!imageUrl) {
      setColorImages(prev => {
        const copy = { ...prev };
        delete copy[colorName];
        return copy;
      });
      return;
    }
    setColorImages(prev => ({ ...prev, [colorName]: imageUrl }));
    // Actualizar tag de color en el imageItem
    setImageItems(prev => prev.map(it => it.url === imageUrl ? { ...it, color: colorName } : it));
  };

  // Subir imagen específica para un color
  const handleTriggerUploadForColor = (colorName) => {
    setTargetUploadColor(colorName);
    colorImageInputRef.current?.click();
  };

  const handleColorImageUploaded = async (e) => {
    const rawFile = e.target.files?.[0];
    if (!rawFile || !targetUploadColor) return;

    setIsOptimizing(true);
    try {
      const optimizedFile = await optimizeImageFile(rawFile);
      const previewUrl = URL.createObjectURL(optimizedFile);

      const newItem = {
        id: `pc-color-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        url: previewUrl,
        file: optimizedFile,
        sizeKb: Math.max(1, Math.round(optimizedFile.size / 1024)),
        rawName: null,
        color: targetUploadColor
      };

      setImageItems(prev => {
        // Filtrar placeholders existentes (items que sean /producto.webp sin archivo)
        const filtered = prev.filter(it => 
          it && (it.file instanceof File || it.rawName || (it.url && !it.url.includes('/producto.webp') && !it.url.includes('/producto.png')))
        );
        // Si ya existía un item asignado a este color, reemplazarlo por la nueva foto
        const existingIdx = filtered.findIndex(it => it.color === targetUploadColor);
        if (existingIdx !== -1) {
          const next = [...filtered];
          next[existingIdx] = newItem;
          return next;
        }
        return [...filtered, newItem];
      });

      setColorImages(prev => {
        const next = { ...prev, [targetUploadColor]: previewUrl };
        const primaryColor = colors[0] || 'Negro';
        // Si el color primario tenía placeholder, asignarle también la nueva foto
        if (!next[primaryColor] || next[primaryColor].includes('/producto.webp') || next[primaryColor].includes('/producto.png')) {
          next[primaryColor] = previewUrl;
        }
        return next;
      });

      // Si es el primer color o foto principal vacía, ponerla de principal
      setFormData(prev => ({
        ...prev,
        image: prev.image === '/producto.webp' || prev.image === '/producto.png' || targetUploadColor === colors[0] ? previewUrl : prev.image,
        gallery: [...prev.gallery.filter(u => u !== '/producto.webp' && u !== '/producto.png'), previewUrl]
      }));
    } finally {
      setIsOptimizing(false);
      e.target.value = '';
      setTargetUploadColor(null);
    }
  };

  // Seleccionar categoría (ajustando tallas y textos automáticamente si es Música/Vinilos/CDs/Casetes)
  const handleSelectCategory = (cat) => {
    const nextIsMusic = isMusicCategory(cat);
    if (nextIsMusic) {
      setColors([]);
      setColorImages({});
    } else if (colors.length === 0) {
      setColors(['Negro']);
    }

    setFormData(prev => {
      const nextIsSingle = isSingleSizeCategory(cat);
      const nextIsMusic = isMusicCategory(cat);
      const currentStock = Math.max(1, parseInt(prev.stock, 10) || 10);

      let nextSizes = prev.sizes;
      let nextSizeStock = prev.sizeStock;

      if (nextIsSingle) {
        nextSizes = ['Única'];
        nextSizeStock = { 'Única': currentStock };
      } else if (prev.sizes.length === 1 && prev.sizes[0] === 'Única') {
        nextSizes = ['S', 'M', 'L', 'XL', 'XXL'];
        const perSize = Math.floor(currentStock / 5);
        const rem = currentStock % 5;
        nextSizeStock = {
          'S': perSize + rem,
          'M': perSize,
          'L': perSize,
          'XL': perSize,
          'XXL': perSize
        };
      }

      let nextDesc = prev.description;
      const defaultApparelDesc = 'Polera de alta calidad confeccionada en 100% algodón peinado 240 GSM con estampados en DTF de alta calidad, resistentes e ilustraciones de máxima definición.';
      const isDefaultDesc = !nextDesc || nextDesc === defaultApparelDesc || nextDesc.includes('Distribución oficial Patria Nostra') || nextDesc.includes('serigrafía');

      if (!productToEdit && isDefaultDesc) {
        const lower = cat.toLowerCase().trim();
        if (lower === 'vinilos' || lower === 'vinilo') {
          nextDesc = 'Edición en vinilo de colección de alta fidelidad. Distribución oficial Patria Nostra.';
        } else if (lower === 'cds' || lower === 'cd') {
          nextDesc = 'Edición en CD formato físico con booklet oficial. Distribución oficial Patria Nostra.';
        } else if (lower === 'casetes' || lower === 'casete') {
          nextDesc = 'Edición en casete (tape) analógico de colección. Distribución oficial Patria Nostra.';
        } else if (nextIsMusic) {
          nextDesc = 'Lanzamiento musical en formato físico oficial. Distribución oficial Patria Nostra.';
        } else if (!nextIsSingle) {
          nextDesc = defaultApparelDesc;
        }
      }

      return {
        ...prev,
        category: cat,
        sizes: nextSizes,
        sizeStock: nextSizeStock,
        stock: currentStock,
        description: nextDesc
      };
    });
  };

  // Agregar nueva categoría
  const handleAddCategory = () => {
    const trimmed = newCategoryName.trim();
    if (!trimmed) return;
    const formatted = trimmed.charAt(0).toUpperCase() + trimmed.slice(1);
    setCustomCategories(prev => Array.from(new Set([...prev, formatted])));
    handleSelectCategory(formatted);
    setNewCategoryName('');
    setIsAddingCategory(false);
  };

  // Handler: Subir Foto Principal desde el PC
  const handleMainImageChange = async (e) => {
    const rawFile = e.target.files?.[0];
    if (!rawFile) return;

    setIsOptimizing(true);
    try {
      const optimizedFile = await optimizeImageFile(rawFile);
      const previewUrl = URL.createObjectURL(optimizedFile);
      const primaryColor = colors[0] || 'Negro';

      const newItem = {
        id: `pc-main-${Date.now()}`,
        url: previewUrl,
        file: optimizedFile,
        sizeKb: Math.max(1, Math.round(optimizedFile.size / 1024)),
        rawName: null,
        color: primaryColor
      };

      setImageItems(prev => {
        // Filtrar placeholders existentes
        const realItems = prev.filter(it => 
          it && (it.file instanceof File || it.rawName || (it.url && !it.url.includes('/producto.webp') && !it.url.includes('/producto.png')))
        );
        const additionals = realItems.filter((_, idx) => idx > 0);
        return [newItem, ...additionals];
      });

      setMainImageFile(optimizedFile);
      setColorImages(prev => ({ ...prev, [primaryColor]: previewUrl }));
      setFormData(prev => ({
        ...prev,
        image: previewUrl,
        gallery: [previewUrl, ...(prev.gallery.filter(u => u !== '/producto.webp' && u !== '/producto.png'))]
      }));
    } finally {
      setIsOptimizing(false);
      e.target.value = '';
    }
  };

  // Handler: Subir Fotos Adicionales desde el PC (Múltiples)
  const handleGalleryImagesChange = async (e) => {
    const rawFiles = Array.from(e.target.files || []);
    if (rawFiles.length === 0) return;

    setIsOptimizing(true);
    try {
      const newItems = await Promise.all(
        rawFiles.map(async (rawFile, idx) => {
          const optimizedFile = await optimizeImageFile(rawFile);
          const previewUrl = URL.createObjectURL(optimizedFile);
          const detected = detectColorFromText(rawFile.name);

          return {
            id: `pc-gal-${Date.now()}-${idx}-${Math.random().toString(36).slice(2, 7)}`,
            url: previewUrl,
            file: optimizedFile,
            sizeKb: Math.max(1, Math.round(optimizedFile.size / 1024)),
            rawName: null,
            color: detected?.name || null
          };
        })
      );

      setImageItems(prev => {
        const realItems = prev.filter(it => 
          it && (it.file instanceof File || it.rawName || (it.url && !it.url.includes('/producto.webp') && !it.url.includes('/producto.png')))
        );
        return [...realItems, ...newItems];
      });
      setGalleryFiles(prev => [...prev, ...newItems.map(it => it.file)]);
      setFormData(prev => ({
        ...prev,
        image: prev.image === '/producto.webp' || prev.image === '/producto.png' ? newItems[0].url : prev.image,
        gallery: [...prev.gallery.filter(u => u !== '/producto.webp' && u !== '/producto.png'), ...newItems.map(it => it.url)]
      }));

      // Auto-vincular a colores si coincidieron
      newItems.forEach(it => {
        if (it.color && colors.includes(it.color)) {
          setColorImages(prev => ({ ...prev, [it.color]: it.url }));
        }
      });
    } finally {
      setIsOptimizing(false);
      e.target.value = '';
    }
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
      const target = prev[indexInItems];
      const next = prev.filter((_, i) => i !== indexInItems);
      
      // Limpiar de colorImages si estaba asignada
      if (target?.color) {
        setColorImages(ci => {
          const copy = { ...ci };
          if (copy[target.color] === target.url) {
            delete copy[target.color];
          }
          return copy;
        });
      }

      setFormData(f => ({
        ...f,
        gallery: next.map(it => it.url)
      }));
      return next;
    });
  };

  // Handler: Quitar foto principal
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
      const resetItem = { id: 'empty-main', url: '/producto.webp', file: null, rawName: null, color: colors[0] || 'Negro' };
      setFormData(f => ({
        ...f,
        image: '/producto.webp',
        gallery: ['/producto.webp']
      }));
      return [resetItem];
    });
  };

  const handleSizeToggle = (size) => {
    setFormData(prev => {
      const exists = prev.sizes.includes(size);
      let newSizes;
      if (exists) {
        if (prev.sizes.length === 1) return prev;
        newSizes = prev.sizes.filter(s => s !== size);
      } else {
        newSizes = sortSizes([...prev.sizes, size]);
      }

      const newSizeStock = { ...prev.sizeStock };
      if (!exists) {
        newSizeStock[size] = newSizeStock[size] || 3;
      } else {
        delete newSizeStock[size];
      }
      const newTotalStock = Object.values(newSizeStock).reduce((sum, n) => sum + (Number(n) || 0), 0);

      return {
        ...prev,
        sizes: newSizes,
        sizeStock: newSizeStock,
        stock: newTotalStock
      };
    });
  };

  const handleSizeStockChange = (size, delta) => {
    setFormData(prev => {
      const currentQty = prev.sizeStock?.[size] !== undefined ? Number(prev.sizeStock[size]) : 0;
      const nextQty = Math.max(0, currentQty + delta);
      const newSizeStock = { ...(prev.sizeStock || {}), [size]: nextQty };
      const newTotal = Object.values(newSizeStock).reduce((sum, n) => sum + (Number(n) || 0), 0);
      return {
        ...prev,
        sizeStock: newSizeStock,
        stock: newTotal
      };
    });
  };

  const handleStockChange = (delta) => {
    setFormData(prev => {
      const newTotal = Math.max(0, (parseInt(prev.stock, 10) || 0) + delta);
      const perSize = Math.floor(newTotal / (prev.sizes.length || 1));
      const rem = newTotal % (prev.sizes.length || 1);
      const newSizeStock = {};
      prev.sizes.forEach((sz, idx) => {
        newSizeStock[sz] = perSize + (idx === 0 ? rem : 0);
      });
      return {
        ...prev,
        stock: newTotal,
        sizeStock: newSizeStock
      };
    });
  };

  // Submit Handler
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.name.trim()) {
      setError('Por favor ingresa un nombre para la prenda.');
      return;
    }
    if (!formData.price || isNaN(formData.price) || Number(formData.price) <= 0) {
      setError('Ingresa un precio válido en pesos chilenos (ej: 12000).');
      return;
    }

    setIsSaving(true);
    try {
      // Filtrar items que sean placeholders si hay fotos reales
      const realItems = imageItems.filter(it => 
        it && (it.file instanceof File || it.rawName || (it.url && !it.url.includes('/producto.webp') && !it.url.includes('/producto.png')))
      );
      const effectiveItems = realItems.length > 0 ? realItems : imageItems;
      const mainItem = effectiveItems[0];
      const additionals = effectiveItems.slice(1);

      // Preparar mapeo definitivo de colores
      const activeColors = colors.length > 0 ? colors : ['Negro'];
      const finalColorImages = { ...colorImages };

      // Si algún color no tiene foto asignada o tiene placeholder, vincularlo a la principal real
      activeColors.forEach(c => {
        const currentUrl = finalColorImages[c];
        const isPlaceholder = !currentUrl || currentUrl === '/producto.webp' || currentUrl === '/producto.png';
        if (isPlaceholder && mainItem?.url) {
          finalColorImages[c] = mainItem.url;
        }
      });

      const primaryImg = (finalColorImages[activeColors[0]] && !finalColorImages[activeColors[0]].includes('/producto.webp')) 
        || (mainItem?.url && !mainItem.url.includes('/producto.webp') ? mainItem.url : null)
        || formData.image 
        || '/producto.webp';

      const catLower = (formData.category || '').toLowerCase().trim();
      const isMusicProd = isMusicCategory(catLower);
      const skuPrefix = catLower.startsWith('vinil') ? 'PN-VIN' 
        : catLower.startsWith('cd') ? 'PN-CD'
        : catLower.startsWith('caset') ? 'PN-CAS'
        : isMusicProd ? 'PN-MUS'
        : catLower.startsWith('acc') ? 'PN-ACC'
        : 'PN-POL';

      const payload = {
        ...(productToEdit || {}),
        name: formData.name.trim().toUpperCase(),
        price: Math.round(Number(formData.price)),
        originalPrice: formData.originalPrice ? Math.round(Number(formData.originalPrice)) : null,
        category: formData.category,
        stock: parseInt(formData.stock, 10) || 0,
        sizeStock: formData.sizeStock,
        sizes: formData.sizes,
        colors: isMusicProd ? [] : activeColors,
        colorImages: isMusicProd ? {} : finalColorImages,
        defaultColor: isMusicProd ? null : activeColors[0],
        specs: isMusicProd ? [] : (productToEdit?.specs || []),
        image: primaryImg,
        gallery: effectiveItems.length > 0 ? effectiveItems.map(it => it.url) : [primaryImg],
        imageItems: effectiveItems,
        mainImageFile: mainItem?.file instanceof File ? mainItem.file : null,
        galleryFiles: additionals.filter(it => it.file instanceof File).map(it => it.file),
        badge: formData.badge || null,
        description: formData.description.trim(),
        isFeatured: formData.isFeatured,
        sku: productToEdit?.sku || `${skuPrefix}-${Math.floor(100 + Math.random() * 900)}`,
        gsm: productToEdit?.gsm || (isMusicProd ? 'Edición Física Oficial' : '240 GSM Algodón Pesado'),
        fit: productToEdit?.fit || (isMusicProd ? formData.category.toUpperCase() : 'Corte Regular')
      };

      await onSave(payload);
    } catch (err) {
      console.error('Error al guardar prenda:', err);
      const detail = formatPbError(err);
      setError(`No se pudo guardar en la base de datos: ${detail}`);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-16">
      
      {/* 1. Header amplio y despejado */}
      <div className="space-y-4">
        
        {/* Enlace Volver */}
        <button
          type="button"
          onClick={onBack}
          disabled={isSaving}
          className="inline-flex items-center gap-2 text-xs font-condensed font-bold uppercase tracking-wider text-neutral-400 hover:text-white transition-colors cursor-pointer disabled:opacity-50"
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
              Configura los colores, fotos por variante, inventario y precio de la prenda
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={onBack}
              disabled={isSaving}
              className="px-5 py-2.5 bg-neutral-900 hover:bg-neutral-800 disabled:opacity-50 text-neutral-300 hover:text-white font-condensed font-bold text-xs uppercase tracking-wider rounded-xl transition-all cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isSaving || isOptimizing}
              className="flex items-center gap-2 px-6 py-2.5 bg-[#C52222] hover:bg-[#a81c1c] disabled:opacity-50 text-white font-condensed font-bold text-xs uppercase tracking-widest rounded-xl shadow-lg shadow-[#C52222]/25 transition-all cursor-pointer active:scale-95"
            >
              <Save className="w-4 h-4" />
              <span>{isOptimizing ? 'Optimizando WebP...' : isSaving ? 'Guardando en BD...' : 'Guardar Producto'}</span>
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
        
        {/* COLUMNA IZQUIERDA: Datos Principales, Categorías y Tallas (7 columnas) */}
        <div className="lg:col-span-7 bg-[#111111] border border-neutral-800/80 rounded-2xl p-6 sm:p-8 space-y-6 shadow-xl">
          
          {/* Nombre del Producto / Prenda / Música */}
          <div className="space-y-2">
            <label className="block text-xs font-condensed font-bold uppercase tracking-wider text-neutral-300">
              {isMusic ? 'Título del Álbum / Lanzamiento Musical *' : 'Nombre de la Prenda / Producto *'}
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder={isMusic ? "Ej: ORGULLO SUR - XX AÑOS (VINILO / CD / CASETE)" : "Ej: POLERA 7 MUELLES - NO TE CORTES!"}
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
                  placeholder="16000"
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
                  placeholder="20000"
                  className="w-full bg-[#0a0a0a] border border-neutral-800 focus:border-[#C52222] rounded-xl pl-8 pr-3 py-2.5 text-neutral-300 text-sm font-mono focus:outline-none transition-colors"
                />
              </div>
            </div>

            {/* Stock Total en Bodega */}
            <div className="space-y-2">
              <label className="block text-xs font-condensed font-bold uppercase tracking-wider text-neutral-300">
                Stock Total
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

          {/* Categoría con opción de Añadir Nueva Categoría */}
          <div className="space-y-2.5 pt-2">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-condensed font-bold uppercase tracking-wider text-neutral-300 flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5 text-[#C52222]" />
                <span>Categoría</span>
              </label>
              
              <button
                type="button"
                onClick={() => setIsAddingCategory(prev => !prev)}
                className="text-[11px] font-condensed font-bold text-[#C52222] hover:text-[#ff4d4d] flex items-center gap-1 uppercase tracking-wider cursor-pointer transition-colors"
              >
                <FolderPlus className="w-3.5 h-3.5" />
                <span>{isAddingCategory ? 'Cancelar' : '+ Añadir categoría nueva'}</span>
              </button>
            </div>

            {/* Input emergente para Añadir Nueva Categoría */}
            {isAddingCategory && (
              <div className="p-3 bg-[#080808] border border-[#C52222]/50 rounded-xl space-y-2 animate-in fade-in duration-200">
                <div className="text-[11px] text-neutral-300 font-condensed font-bold uppercase tracking-wider">
                  Ingresa el nombre de la nueva categoría:
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newCategoryName}
                    onChange={(e) => setNewCategoryName(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddCategory();
                      }
                    }}
                    placeholder="Ej: Chaquetas, Gorras, Parches..."
                    className="flex-1 bg-[#121212] border border-neutral-700 rounded-lg px-3 py-1.5 text-xs text-white placeholder:text-neutral-600 focus:outline-none focus:border-[#C52222]"
                    autoFocus
                  />
                  <button
                    type="button"
                    onClick={handleAddCategory}
                    className="px-4 py-1.5 bg-[#C52222] hover:bg-[#a81c1c] text-white font-condensed font-bold text-xs uppercase tracking-wider rounded-lg transition-colors cursor-pointer"
                  >
                    Agregar
                  </button>
                </div>
              </div>
            )}

            {/* Grid de Botones de Categorías */}
            <div className="flex flex-wrap gap-2">
              {allCategories.map(cat => {
                const isSelected = (formData.category || '').toLowerCase() === cat.toLowerCase();
                const isMusicOption = isMusicCategory(cat);
                return (
                  <button
                    type="button"
                    key={cat}
                    onClick={() => handleSelectCategory(cat)}
                    className={`py-2 px-3.5 rounded-xl font-condensed font-bold text-xs uppercase tracking-wider transition-all cursor-pointer text-center ${
                      isSelected
                        ? 'bg-[#C52222] text-white shadow-md shadow-[#C52222]/20 border border-[#C52222]'
                        : isMusicOption
                          ? 'bg-[#120b0b] border border-[#C52222]/40 text-neutral-200 hover:text-white hover:border-[#C52222]'
                          : 'bg-[#0a0a0a] border border-neutral-800 text-neutral-400 hover:text-white hover:border-neutral-700'
                    }`}
                  >
                    {isMusicOption ? `🎵 ${cat}` : cat}
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
              <div className="text-xs font-mono font-bold text-neutral-300">
                Total: <span className="text-[#C52222] text-sm">{formData.stock}</span> prendas
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {formData.sizes.map(sz => {
                const qty = formData.sizeStock?.[sz] !== undefined ? Number(formData.sizeStock[sz]) : 0;
                return (
                  <div key={sz} className="bg-[#121212] border border-neutral-800 rounded-xl p-2.5 flex flex-col justify-between">
                    <span className="text-xs font-condensed font-bold uppercase text-neutral-400 mb-1">
                      Talla {sz}
                    </span>
                    <div className="flex items-center justify-between gap-1">
                      <button
                        type="button"
                        onClick={() => handleSizeStockChange(sz, -1)}
                        className="w-7 h-7 bg-neutral-800 hover:bg-neutral-700 text-white rounded flex items-center justify-center font-bold text-xs cursor-pointer"
                      >
                        -
                      </button>
                      <span className="font-mono font-bold text-sm text-white">
                        {qty}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleSizeStockChange(sz, 1)}
                        className="w-7 h-7 bg-neutral-800 hover:bg-[#C52222] text-white rounded flex items-center justify-center font-bold text-xs cursor-pointer"
                      >
                        +
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Etiquetas / Colecciones & Portada */}
          <div className="space-y-4 pt-2 border-t border-neutral-900">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <label className="block text-xs font-condensed font-bold uppercase tracking-wider text-neutral-200">
                  Etiqueta de Colección / Badge del Producto
                </label>
                <p className="text-[11px] text-neutral-500 font-sans mt-0.5">
                  Asigna una etiqueta para asociar el producto a una colección (Banners, Colaboraciones, Edición Limitada).
                </p>
              </div>

              {formData.badge && (
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, badge: '' })}
                  className="text-[10px] font-condensed font-bold uppercase tracking-wider text-neutral-400 hover:text-red-400 border border-neutral-800 hover:border-red-900 px-2 py-1 rounded transition-colors self-start sm:self-auto cursor-pointer"
                >
                  ✕ Quitar Etiqueta
                </button>
              )}
            </div>

            {/* Selector Rápido de Colecciones y Badges */}
            <div className="space-y-2 bg-[#080808] border border-neutral-900 rounded-xl p-3.5">
              <span className="text-[10px] font-condensed font-bold uppercase tracking-wider text-neutral-400 block">
                Selecciona una Colección o Etiqueta Rápida:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {[
                  'ORGULLO SUR',
                  'KRONSTADT',
                  'BATTLE ZONE',
                  'HOBBIT ITALIA',
                  'BRASSIC USA',
                  'TATTOOED MOTHER FUCKER',
                  'TOTAL ANNIHILATION',
                  'AHTR',
                  'BASTIÓN',
                  'DISIDENCIA',
                  'EDICIÓN LIMITADA',
                  'NUEVO',
                  'DESTACADO',
                  'OFERTA',
                  'AGOTADO'
                ].map((tag) => {
                  const isSelected = (formData.badge || '').toUpperCase() === tag;
                  return (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => setFormData({ ...formData, badge: isSelected ? '' : tag })}
                      className={`text-[10px] font-condensed font-bold uppercase tracking-wider px-2.5 py-1 rounded-lg border transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-[#C52222] border-[#C52222] text-white shadow-md shadow-[#C52222]/30 scale-105'
                          : 'bg-[#121212] border-neutral-800 text-neutral-400 hover:text-white hover:border-neutral-600'
                      }`}
                    >
                      {tag}
                    </button>
                  );
                })}
              </div>

              {/* Campo de texto libre para etiqueta personalizada */}
              <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                <input
                  type="text"
                  value={formData.badge}
                  onChange={(e) => setFormData({ ...formData, badge: e.target.value })}
                  placeholder="O escribe aquí una etiqueta personalizada..."
                  className="flex-1 bg-[#0a0a0a] border border-neutral-800 focus:border-[#C52222] rounded-xl px-3.5 py-2 text-white text-xs placeholder:text-neutral-600 focus:outline-none"
                />
                {formData.badge && (
                  <div className="flex items-center gap-1.5 shrink-0 px-2.5 py-1.5 bg-black border border-neutral-800 rounded-lg">
                    <span className="text-[9px] font-condensed text-neutral-500 uppercase">Vista previa:</span>
                    <span className="text-[10px] font-condensed font-bold uppercase px-2 py-0.5 bg-[#C52222] text-white rounded">
                      {formData.badge}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Destacar en Portada */}
            <div>
              <label className="flex items-center gap-2.5 p-3 bg-[#0a0a0a] border border-neutral-800 rounded-xl cursor-pointer hover:border-neutral-700 transition-colors">
                <input
                  type="checkbox"
                  checked={formData.isFeatured}
                  onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
                  className="w-4 h-4 rounded text-[#C52222] focus:ring-0 bg-neutral-900 border-neutral-700 cursor-pointer"
                />
                <span className="text-xs font-condensed font-bold uppercase tracking-wider text-white">
                  Destacar en Portada de Inicio (Hero / Showcase)
                </span>
              </label>
            </div>
          </div>

          {/* Descripción de la Prenda y Activador DTF */}
          <div className="space-y-2 pt-1">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-condensed font-bold uppercase tracking-wider text-neutral-300">
                {isMusic ? 'Descripción del Disco / Edición Física' : 'Descripción de la Prenda'}
              </label>

              {/* Botón rápido para activar/desactivar texto de estampado DTF (solo para prendas) */}
              {!isMusic && (
                <button
                  type="button"
                  onClick={() => {
                    const dtfPhrase = 'Estampados en DTF de alta calidad, resistentes e ilustraciones originales concebidas con máxima definición.';
                    setFormData(prev => {
                      const current = prev.description || '';
                      if (current.includes('estampados en DTF') || current.includes('DTF de alta calidad') || current.toLowerCase().includes('dtf')) {
                        // Ya lo tiene, removemos la frase o limpiamos
                        const cleaned = current
                          .replace(dtfPhrase, '')
                          .replace(/con estampados en DTF de alta calidad, resistentes e ilustraciones de máxima definición\.?/gi, '')
                          .replace(/con serigrafía de máxima fidelidad y resistencia\.?/gi, '')
                          .replace(/estampados en DTF de alta calidad, resistentes e ilustraciones de máxima definición\.?/gi, '')
                          .trim();
                        return { ...prev, description: cleaned };
                      } else {
                        // Lo agregamos
                        const separator = current.trim() ? (current.trim().endsWith('.') ? ' ' : '. ') : '';
                        return { ...prev, description: `${current.trim()}${separator}${dtfPhrase}` };
                      }
                    });
                  }}
                  className={`px-2.5 py-1 rounded text-[11px] font-condensed font-bold uppercase tracking-wider transition-all border flex items-center gap-1.5 cursor-pointer ${
                    (formData.description || '').toLowerCase().includes('dtf')
                      ? 'bg-[#180a0a] border-[#C52222] text-[#C52222] shadow-[0_0_10px_rgba(197,34,34,0.25)]'
                      : 'bg-neutral-900 border-neutral-700 text-neutral-300 hover:text-white hover:border-neutral-500'
                  }`}
                  title="Presiona para activar o desactivar la descripción de estampado DTF"
                >
                  <Sparkles className="w-3 h-3 text-[#C52222]" />
                  <span>
                    {(formData.description || '').toLowerCase().includes('dtf') 
                      ? '✓ DTF ACTIVADO EN DESCRIPCIÓN' 
                      : '+ ACTIVAR ESTAMPADOS DTF'}
                  </span>
                </button>
              )}
            </div>

            <textarea
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder={isMusic ? "Detalles sobre la edición física, formato, libreto, booklet o sello discográfico..." : "Detalles sobre el diseño, tela, calce o confección..."}
              className="w-full bg-[#0a0a0a] border border-neutral-800 focus:border-[#C52222] rounded-xl p-3 text-white text-xs placeholder:text-neutral-600 focus:outline-none leading-relaxed"
            />

            {!isMusic && (
              <p className="text-[11px] text-neutral-500 font-sans">
                💡 Puedes activar o desactivar la mención de <strong>estampados en DTF de alta calidad y resistentes</strong> con el botón superior o editarlo libremente en el campo de texto.
              </p>
            )}
          </div>

        </div>

        {/* COLUMNA DERECHA: Colores por Prenda y Fotos por Color (5 columnas) */}
        <div className="lg:col-span-5 space-y-6">
          
          {isMusic ? (
            /* Banner informativo para Ediciones Musicales: Sin variantes de color de tela */
            <div className="bg-[#111111] border border-neutral-800/80 rounded-2xl p-5 space-y-3 shadow-xl">
              <div className="flex items-center gap-2 pb-2.5 border-b border-neutral-800/80">
                <Disc className="w-4 h-4 text-[#C52222]" />
                <span className="text-xs font-condensed font-bold uppercase tracking-wider text-white">
                  Edición Musical: {formData.category.toUpperCase()}
                </span>
              </div>
              <p className="text-xs text-neutral-400 font-sans leading-relaxed">
                Los discos, vinilos y casetes <strong>no utilizan variantes de color de tela ni especificaciones textiles</strong>. Las fotos que subas a continuación representan la edición física oficial (portada, contraportada, booklet o disco).
              </p>
            </div>
          ) : (
            /* SECCIÓN: VARIANTES POR COLOR DE LA PRENDA (MINIMAL) */
            <div className="bg-[#111111] border border-neutral-800/80 rounded-2xl p-5 space-y-4 shadow-xl">
              
              {/* Header minimal */}
              <div className="flex items-center justify-between pb-3 border-b border-neutral-800/80">
                <div className="flex items-center gap-2">
                  <Palette className="w-3.5 h-3.5 text-[#C52222]" />
                  <span className="text-xs font-condensed font-bold uppercase tracking-wider text-white">
                    Variantes por Color
                  </span>
                </div>
                <span className="text-[10px] font-mono text-neutral-400">
                  {colors.length} {colors.length === 1 ? 'color' : 'colores'}
                </span>
              </div>

              {/* Selector de Colores (Chips Minimalistas) */}
              <div className="space-y-2">
                <div className="flex flex-wrap gap-1.5">
                  {COLOR_DEFINITIONS.map(def => {
                    const isChecked = colors.includes(def.name);
                    return (
                      <button
                        key={def.name}
                        type="button"
                        onClick={() => handleToggleColor(def.name)}
                        className={`px-2.5 py-1.5 rounded-lg text-xs font-condensed font-bold uppercase tracking-wider transition-all flex items-center gap-2 cursor-pointer ${
                          isChecked
                            ? 'bg-[#1a1a1a] border border-[#C52222] text-white shadow-sm'
                            : 'bg-[#0a0a0a] border border-neutral-800/80 text-neutral-400 hover:text-white hover:border-neutral-700'
                        }`}
                      >
                        <span 
                          className="w-2.5 h-2.5 rounded-full shrink-0 border border-neutral-700/80" 
                          style={{ backgroundColor: def.hex }}
                        />
                        <span>{def.name}</span>
                        {isChecked && <Check className="w-3 h-3 text-[#C52222]" />}
                      </button>
                    );
                  })}
                </div>

                {/* Botón color personalizado */}
                {!isAddingCustomColor ? (
                  <button
                    type="button"
                    onClick={() => setIsAddingCustomColor(true)}
                    className="text-[11px] font-condensed font-bold text-neutral-400 hover:text-white flex items-center gap-1.5 uppercase tracking-wider pt-0.5 cursor-pointer transition-colors"
                  >
                    <Plus className="w-3 h-3 text-[#C52222]" />
                    <span>Color personalizado</span>
                  </button>
                ) : (
                  <div className="flex gap-1.5 pt-1">
                    <input
                      type="text"
                      value={customColorName}
                      onChange={(e) => setCustomColorName(e.target.value)}
                      placeholder="Nombre del color (ej: Beige, Olivo...)"
                      className="flex-1 bg-[#0a0a0a] border border-neutral-700 rounded-lg px-2.5 py-1 text-xs text-white placeholder:text-neutral-600 focus:outline-none focus:border-[#C52222]"
                      autoFocus
                    />
                    <button
                      type="button"
                      onClick={handleAddCustomColor}
                      className="px-3 py-1 bg-[#C52222] hover:bg-[#a81c1c] text-white font-condensed font-bold text-xs uppercase tracking-wider rounded-lg transition-colors cursor-pointer"
                    >
                      Añadir
                    </button>
                    <button
                      type="button"
                      onClick={() => { setIsAddingCustomColor(false); setCustomColorName(''); }}
                      className="px-2 py-1 bg-neutral-800 hover:bg-neutral-700 text-neutral-400 hover:text-white text-xs rounded-lg cursor-pointer"
                    >
                      ✕
                    </button>
                  </div>
                )}
              </div>

              {/* Input oculto para subida directa de foto por color */}
              <input
                ref={colorImageInputRef}
                type="file"
                accept="image/png,image/jpeg,image/webp,image/gif"
                onChange={handleColorImageUploaded}
                className="hidden"
              />

              {/* Tarjetas de Asignación de Fotos por cada Color Activo */}
              <div className="space-y-2 pt-2">
                <span className="text-[10px] font-condensed font-bold tracking-wider text-neutral-500 uppercase block">
                  Foto por cada variante:
                </span>

                {colors.map((colorName, idx) => {
                  const assignedUrl = colorImages[colorName];
                  const def = COLOR_DEFINITIONS.find(d => d.name === colorName) || { hex: '#444' };
                  const hasAssigned = !!assignedUrl && assignedUrl !== '/producto.webp' && assignedUrl !== '/producto.png';

                  return (
                    <div 
                      key={colorName}
                      className="bg-[#0c0c0c] border border-neutral-800/80 hover:border-neutral-700 rounded-xl p-2.5 flex items-center justify-between gap-3 transition-colors"
                    >
                      {/* Indicador de Color y Miniatura */}
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="relative w-11 h-11 bg-black border border-neutral-800 rounded-lg flex items-center justify-center p-0.5 shrink-0 overflow-hidden">
                          {assignedUrl ? (
                            <img 
                              src={assignedUrl} 
                              alt={colorName} 
                              onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = '/producto.webp'; }}
                              className="w-full h-full object-contain" 
                            />
                          ) : (
                            <ImageIcon className="w-4 h-4 text-neutral-600" />
                          )}
                          <span 
                            className="absolute bottom-0.5 right-0.5 w-2.5 h-2.5 rounded-full border border-neutral-800 shadow"
                            style={{ backgroundColor: def.hex }}
                            title={`Color ${colorName}`}
                          />
                        </div>

                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className="font-condensed font-bold text-xs uppercase text-white truncate">
                              {colorName}
                            </span>
                            {idx === 0 && (
                              <span className="text-[9px] font-mono uppercase text-[#ff4d4d] bg-[#C52222]/15 px-1 py-0.2 rounded border border-[#C52222]/30">
                                Principal
                              </span>
                            )}
                          </div>
                          <span className="text-[10px] font-condensed text-neutral-400 block mt-0.5">
                            {hasAssigned ? '✓ Foto asignada' : 'Sin foto asignada'}
                          </span>
                        </div>
                      </div>

                      {/* Acciones para este color */}
                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          type="button"
                          onClick={() => handleTriggerUploadForColor(colorName)}
                          title={`Subir foto de la prenda en color ${colorName}`}
                          className="px-2.5 py-1.5 bg-[#181818] hover:bg-[#C52222] text-neutral-300 hover:text-white border border-neutral-700/80 hover:border-[#C52222] rounded-lg text-[10px] font-condensed font-bold uppercase tracking-wider flex items-center gap-1 transition-all cursor-pointer"
                        >
                          <Upload className="w-3 h-3" />
                          <span>{hasAssigned ? 'Cambiar' : 'Subir Foto'}</span>
                        </button>

                        {/* Selector de foto existente en la galería */}
                        {imageItems.length > 1 && (
                          <select
                            value={assignedUrl || ''}
                            onChange={(e) => handleAssignImageToColor(colorName, e.target.value)}
                            className="bg-[#121212] border border-neutral-800 text-[10px] font-condensed text-neutral-300 rounded-lg px-2 py-1.5 focus:outline-none focus:border-[#C52222] cursor-pointer"
                            title="Vincular a una foto ya subida en la galería"
                          >
                            <option value="">De galería...</option>
                            {imageItems.map((it, itemIdx) => (
                              <option key={it.id || itemIdx} value={it.url}>
                                Foto #{itemIdx + 1} {it.color ? `(${it.color})` : ''}
                              </option>
                            ))}
                          </select>
                        )}

                        {colors.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleToggleColor(colorName)}
                            title="Quitar este color"
                            className="p-1.5 text-neutral-500 hover:text-red-400 rounded-lg hover:bg-neutral-800/60 transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

            </div>
          )}

          {/* SECCIÓN: TODAS LAS FOTOS DEL PRODUCTO */}
          <div className="bg-[#111111] border border-neutral-800/80 rounded-2xl p-6 space-y-5 shadow-xl">
            
            <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#C52222]"></span>
                <span className="text-xs font-condensed font-bold uppercase tracking-wider text-white">
                  Fotos Subidas ({imageItems.length})
                </span>
              </div>

              {/* Botón rápido subir fotos adicionales */}
              <button
                type="button"
                onClick={() => galleryImageInputRef.current?.click()}
                className="text-[10px] font-condensed font-bold text-[#C52222] hover:text-[#ff4d4d] flex items-center gap-1 uppercase tracking-wider cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ Subir fotos desde PC</span>
              </button>
            </div>

            {/* Gran Contenedor de Vista Previa Principal */}
            <div className="relative aspect-square w-full bg-black rounded-xl border-2 border-neutral-800 hover:border-neutral-700 transition-colors p-3 flex items-center justify-center overflow-hidden shadow-inner group">
              <img
                src={imageItems[0]?.url || formData.image || '/producto.png'}
                alt="Vista previa principal"
                className="max-h-full max-w-full object-contain filter contrast-105 transition-transform duration-300 group-hover:scale-105"
                onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = '/producto.webp'; }}
              />

              {/* Badges superpuestos */}
              <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10 pointer-events-none">
                <span className="px-2 py-0.5 text-[9px] font-condensed font-bold uppercase bg-black/80 text-neutral-200 border border-neutral-700 rounded backdrop-blur-sm">
                  FOTO #1 (PORTADA)
                </span>
                {imageItems[0]?.sizeKb && (
                  <span className="px-2 py-0.5 text-[9px] font-mono font-bold uppercase bg-emerald-950/90 text-emerald-300 border border-emerald-700/70 rounded shadow">
                    ✓ WebP Optimizado • {imageItems[0].sizeKb} KB
                  </span>
                )}
                {!isMusic && imageItems[0]?.color && (
                  <span className="px-2 py-0.5 text-[9px] font-condensed font-bold uppercase bg-[#C52222] text-white rounded shadow">
                    COLOR: {imageItems[0].color}
                  </span>
                )}
              </div>

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

            {/* Input oculto para fotos adicionales (múltiples) */}
            <input
              ref={galleryImageInputRef}
              type="file"
              accept="image/png,image/jpeg,image/webp,image/gif"
              multiple
              onChange={handleGalleryImagesChange}
              className="hidden"
            />

            <button
              type="button"
              onClick={() => mainImageInputRef.current?.click()}
              className="w-full py-2.5 bg-[#181818] hover:bg-[#222] text-white border border-neutral-700 hover:border-[#C52222] rounded-xl font-condensed font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <Upload className="w-3.5 h-3.5 text-[#C52222]" />
              <span>Cambiar Foto Principal desde PC</span>
            </button>

            {/* Cuadrícula de Todas las Fotos Subidas con selector de Color */}
            {imageItems.length > 1 && (
              <div className="space-y-2 pt-2">
                <span className="text-[10px] font-condensed font-bold tracking-wider text-neutral-400 uppercase block">
                  Galería completa &amp; Color asignado a cada foto:
                </span>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                  {imageItems.map((item, idx) => (
                    <div
                      key={item.id || idx}
                      className="relative bg-black rounded-lg border border-neutral-800 hover:border-neutral-700 p-2 flex flex-col justify-between overflow-hidden group shadow-sm"
                    >
                      <div className="relative aspect-square w-full flex items-center justify-center p-1 mb-2">
                        <img
                          src={item.url}
                          alt={`Foto ${idx + 1}`}
                          className="max-h-full max-w-full object-contain"
                          onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = '/producto.webp'; }}
                        />
                        <span className="absolute top-1 left-1 px-1.5 py-0.5 text-[8px] font-condensed font-bold uppercase bg-black/80 text-neutral-300 border border-neutral-700 rounded">
                          #{idx + 1}
                        </span>
                        
                        {/* Botones de acción flotantes */}
                        <div className="absolute top-1 right-1 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          {idx > 0 && (
                            <button
                              type="button"
                              onClick={() => handleMakeMainImage(idx)}
                              title="Convertir en portada principal"
                              className="p-1 bg-neutral-800 hover:bg-amber-500 hover:text-black text-neutral-300 rounded cursor-pointer"
                            >
                              <Star className="w-3 h-3" />
                            </button>
                          )}
                          {idx > 0 && (
                            <button
                              type="button"
                              onClick={() => handleRemoveAdditionalImage(idx)}
                              title="Eliminar foto"
                              className="p-1 bg-neutral-800 hover:bg-[#C52222] text-neutral-300 hover:text-white rounded cursor-pointer"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Dropdown de Color para esta foto: Solo si es prenda de vestir */}
                      {!isMusic && (
                        <div className="pt-1 border-t border-neutral-800/80">
                          <label className="text-[9px] font-condensed font-bold uppercase text-neutral-500 block mb-0.5">
                            Color asignado:
                          </label>
                          <select
                            value={item.color || ''}
                            onChange={(e) => {
                              const newCol = e.target.value;
                              setImageItems(prev => prev.map((it, i) => i === idx ? { ...it, color: newCol } : it));
                              if (newCol) {
                                setColorImages(ci => ({ ...ci, [newCol]: item.url }));
                                if (!colors.includes(newCol)) {
                                  setColors(c => [...c, newCol]);
                                }
                              }
                            }}
                            className="w-full bg-[#121212] border border-neutral-800 text-[10px] font-condensed font-bold uppercase text-white rounded p-1 focus:outline-none focus:border-[#C52222] cursor-pointer"
                          >
                            <option value="">Sin color específico</option>
                            {colors.map(c => (
                              <option key={c} value={c}>{c}</option>
                            ))}
                          </select>
                        </div>
                      )}

                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>

        </div>

      </form>

    </div>
  );
};
