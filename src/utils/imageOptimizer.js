/**
 * Utilidad de optimización y compresión de imágenes en el navegador.
 * Convierte fotos de alta resolución (móvil, cámara) a WebP optimizado (<1MB),
 * garantizando compatibilidad con PocketBase, evitando límites de tamaño (5MB)
 * y previniendo errores 413 Payload Too Large en el servidor de producción.
 */

export async function optimizeImageFile(file, options = {}) {
  const {
    maxWidth = 1600,
    maxHeight = 1600,
    quality = 0.85,
    maxSizeBytes = 1.8 * 1024 * 1024 // 1.8MB meta
  } = options;

  if (!file || !(file instanceof File || file instanceof Blob)) {
    return file;
  }

  // Archivos vectoriales o GIFs animados se preservan
  if (file.type === 'image/svg+xml' || file.type === 'image/gif') {
    return file;
  }

  // Si ya es un WebP o JPEG ligero (< 400KB), no es necesario re-comprimir
  if (file.size < 400 * 1024 && (file.type === 'image/webp' || file.type === 'image/jpeg')) {
    return file;
  }

  return new Promise((resolve) => {
    try {
      const img = new Image();
      const objectUrl = URL.createObjectURL(file);

      img.onload = () => {
        URL.revokeObjectURL(objectUrl);
        try {
          let { width, height } = img;

          // Redimensionar manteniendo proporción si excede los límites máximos
          if (width > maxWidth || height > maxHeight) {
            const ratio = Math.min(maxWidth / width, maxHeight / height);
            width = Math.round(width * ratio);
            height = Math.round(height * ratio);
          }

          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');

          if (!ctx) {
            resolve(file);
            return;
          }

          // Dibujar en canvas con suavizado de alta calidad
          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = 'high';
          ctx.drawImage(img, 0, 0, width, height);

          // Intentar WebP primero; si no soporta, fallback a JPEG
          const outputType = 'image/webp';
          canvas.toBlob(
            (blob) => {
              if (!blob) {
                resolve(file);
                return;
              }

              const originalName = file.name || 'prenda.webp';
              const baseName = originalName.replace(/\.[^/.]+$/, '');
              const cleanFileName = `${baseName.toLowerCase().replace(/[^a-z0-9_-]/g, '_')}.webp`;

              const optimizedFile = new File([blob], cleanFileName, {
                type: 'image/webp',
                lastModified: Date.now()
              });

              resolve(optimizedFile);
            },
            outputType,
            quality
          );
        } catch (canvasErr) {
          console.warn('Compresión en canvas no disponible, usando archivo original:', canvasErr);
          resolve(file);
        }
      };

      img.onerror = () => {
        URL.revokeObjectURL(objectUrl);
        resolve(file);
      };

      img.src = objectUrl;
    } catch (err) {
      console.warn('Error en optimizeImageFile:', err);
      resolve(file);
    }
  });
}

/**
 * Extrae y formatea mensajes de error detallados desde PocketBase ClientResponseError
 */
export function formatPbError(err) {
  if (!err) return 'Error desconocido al guardar en la base de datos.';

  // Error de sesión/auth
  if (err.status === 401 || err.status === 403) {
    return 'Tu sesión de administrador ha expirado o no tiene permisos. Por favor vuelve a iniciar sesión en el panel.';
  }

  // Error de validación por campos de PocketBase (err.response.data o err.data)
  const validationData = err.response?.data || err.data;
  if (validationData && typeof validationData === 'object' && Object.keys(validationData).length > 0) {
    const errorDetails = Object.entries(validationData)
      .map(([field, detail]) => {
        const msg = detail?.message || (typeof detail === 'string' ? detail : JSON.stringify(detail));
        const translatedField = {
          name: 'Nombre de prenda',
          price: 'Precio',
          originalPrice: 'Precio anterior',
          stock: 'Inventario / Stock',
          sizeStock: 'Stock por tallas',
          sizes: 'Tallas',
          category: 'Categoría',
          images: 'Imágenes / Fotos',
          image: 'Foto principal',
          gallery: 'Galería',
          sku: 'Código SKU',
          description: 'Descripción'
        }[field] || field;

        return `${translatedField}: ${msg}`;
      })
      .join(' — ');

    if (errorDetails) {
      return `Validación de base de datos fallida (${errorDetails})`;
    }
  }

  if (err.message && err.message.includes('Failed to fetch')) {
    return 'No se pudo conectar con el servidor de base de datos. Verifica tu conexión a internet o el estado del servidor.';
  }

  return err.message || err.response?.message || 'Error al comunicarse con la base de datos.';
}
