/**
 * Utilidad de optimización y compresión estricta de imágenes.
 * Convierte fotos pesadas (2MB, 5MB, 10MB+) a WebP/JPEG ultra-ligero (~40KB - 90KB),
 * corrigiendo el bug de Safari/iOS WebKit donde canvas.toBlob('image/webp')
 * hacía fallback silencioso a PNG sin comprimir de ~1.7MB.
 */

function canvasToBlobAsync(canvas, mimeType, quality) {
  return new Promise((resolve) => {
    try {
      canvas.toBlob(
        (blob) => resolve(blob || null),
        mimeType,
        quality
      );
    } catch {
      resolve(null);
    }
  });
}

function createScaledCanvas(img, maxW, maxH, bgColor = '#050505') {
  let width = img.naturalWidth || img.width || 800;
  let height = img.naturalHeight || img.height || 800;

  if (width > maxW || height > maxH) {
    const ratio = Math.min(maxW / width, maxH / height);
    width = Math.max(1, Math.round(width * ratio));
    height = Math.max(1, Math.round(height * ratio));
  }

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d', { alpha: false });

  if (!ctx) return null;

  // Fondo oscuro sólido (#050505) idéntico a las tarjetas de la tienda
  // Elimina el canal alfa (RGBA -> RGB), reduciendo el peso un 60% y evitando PNGs gigantes
  ctx.fillStyle = bgColor;
  ctx.fillRect(0, 0, width, height);

  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(img, 0, 0, width, height);

  return canvas;
}

export async function optimizeImageFile(file, options = {}) {
  const {
    maxWidth = 650,
    maxHeight = 650,
    quality = 0.70,
    maxSizeBytes = 35 * 1024 // Meta estricta: <= 35 KB (carga ultra-rápida instantánea)
  } = options;

  if (!file || !(file instanceof File || file instanceof Blob)) {
    return file;
  }

  // Archivos vectoriales se preservan
  if (file.type === 'image/svg+xml') {
    return file;
  }

  const originalName = file.name || 'producto.webp';
  const baseName = originalName
    .replace(/\.[^/.]+$/, '')
    .toLowerCase()
    .replace(/[^a-z0-9_-]/g, '_') || 'producto';

  // Solo omitir si YA es un WebP real verificado y pesa menos de 35 KB
  if (file.type === 'image/webp' && file.size > 0 && file.size <= 35 * 1024) {
    return file;
  }

  return new Promise((resolve) => {
    try {
      const img = new Image();
      const objectUrl = URL.createObjectURL(file);

      img.onload = async () => {
        URL.revokeObjectURL(objectUrl);
        try {
          const canvas = createScaledCanvas(img, maxWidth, maxHeight);
          if (!canvas) {
            resolve(file);
            return;
          }

          // 1. Intentar codificación nativa a WebP
          let blob = await canvasToBlobAsync(canvas, 'image/webp', quality);

          // Verificar que el navegador REALMENTE haya codificado en image/webp
          // (Safari/iOS hace fallback silencioso a image/png de ~1.7MB si no soporta encode WebP)
          const isTrueWebP = blob && blob.type === 'image/webp';

          if (isTrueWebP) {
            // Si aún supera el peso meta (~100KB), recomprimir con menor calidad / dimensión
            if (blob.size > maxSizeBytes) {
              const tighterBlob = await canvasToBlobAsync(canvas, 'image/webp', 0.64);
              if (tighterBlob && tighterBlob.type === 'image/webp' && tighterBlob.size < blob.size) {
                blob = tighterBlob;
              }
            }
            if (blob.size > maxSizeBytes) {
              const smallerCanvas = createScaledCanvas(img, 640, 640);
              if (smallerCanvas) {
                const smallerBlob = await canvasToBlobAsync(smallerCanvas, 'image/webp', 0.62);
                if (smallerBlob && smallerBlob.type === 'image/webp' && smallerBlob.size < blob.size) {
                  blob = smallerBlob;
                }
              }
            }

            const optimizedWebP = new File([blob], `${baseName}.webp`, {
              type: 'image/webp',
              lastModified: Date.now()
            });
            resolve(optimizedWebP);
            return;
          }

          // 2. Fallback para Safari / iOS / navegadores sin encoder WebP en Canvas:
          // Codificar primero en JPEG de alta eficiencia (~50-75 KB) que el 100% de navegadores soporta
          let jpegBlob = await canvasToBlobAsync(canvas, 'image/jpeg', quality);
          if (jpegBlob && jpegBlob.size > maxSizeBytes) {
            const tighterJpeg = await canvasToBlobAsync(canvas, 'image/jpeg', 0.65);
            if (tighterJpeg && tighterJpeg.size < jpegBlob.size) {
              jpegBlob = tighterJpeg;
            }
          }
          if (jpegBlob && jpegBlob.size > maxSizeBytes) {
            const smallerCanvas = createScaledCanvas(img, 640, 640);
            if (smallerCanvas) {
              const smallerJpeg = await canvasToBlobAsync(smallerCanvas, 'image/jpeg', 0.62);
              if (smallerJpeg && smallerJpeg.size < jpegBlob.size) {
                jpegBlob = smallerJpeg;
              }
            }
          }

          if (jpegBlob && jpegBlob.type === 'image/jpeg') {
            // Intentar conversión rápida a WebP en servidor (/api/optimize-image) si está disponible
            try {
              const resp = await fetch('/api/optimize-image', {
                method: 'POST',
                headers: { 'Content-Type': 'image/jpeg' },
                body: jpegBlob
              });
              if (resp.ok && resp.headers.get('content-type')?.includes('image/webp')) {
                const serverWebpBlob = await resp.blob();
                if (serverWebpBlob && serverWebpBlob.size > 0 && serverWebpBlob.size < 150 * 1024) {
                  resolve(
                    new File([serverWebpBlob], `${baseName}.webp`, {
                      type: 'image/webp',
                      lastModified: Date.now()
                    })
                  );
                  return;
                }
              }
            } catch {
              // Si el endpoint no está disponible, usar el JPEG ligero (~55KB) directamente
            }

            // Entregar JPEG genuino (~55KB) con extensión .jpg real (nunca un PNG de 1.7MB disfrazado)
            const optimizedJpeg = new File([jpegBlob], `${baseName}.jpg`, {
              type: 'image/jpeg',
              lastModified: Date.now()
            });
            resolve(optimizedJpeg);
            return;
          }

          resolve(file);
        } catch (canvasErr) {
          console.warn('Error comprimiendo imagen en canvas:', canvasErr);
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
          name: 'Nombre del producto',
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
