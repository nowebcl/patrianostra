import sharp from 'sharp';

export const config = {
  api: {
    bodyParser: false
  }
};

const MAX_IMAGE_SIZE_BYTES = 8 * 1024 * 1024; // 8 MB

export default async function handler(req, res) {
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    return res.status(204).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  // Pre-verificación por Content-Length si viene presente
  const contentLength = Number(req.headers['content-length']);
  if (contentLength && contentLength > MAX_IMAGE_SIZE_BYTES) {
    return res.status(413).json({ error: 'El archivo excede el tamaño máximo permitido (8 MB)' });
  }

  try {
    const chunks = [];
    let totalBytes = 0;

    for await (const chunk of req) {
      totalBytes += chunk.length;
      if (totalBytes > MAX_IMAGE_SIZE_BYTES) {
        return res.status(413).json({ error: 'El archivo excede el tamaño máximo permitido (8 MB)' });
      }
      chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
    }

    const inputBuffer = Buffer.concat(chunks);
    if (!inputBuffer.length) {
      return res.status(400).json({ error: 'Empty image buffer' });
    }

    const webpBuffer = await sharp(inputBuffer)
      .resize({ width: 800, height: 800, fit: 'inside', withoutEnlargement: true })
      .flatten({ background: { r: 5, g: 5, b: 5 } })
      .webp({ quality: 78, effort: 4 })
      .toBuffer();

    res.setHeader('Content-Type', 'image/webp');
    res.setHeader('Content-Length', String(webpBuffer.length));
    res.setHeader('Cache-Control', 'public, max-age=86400, stale-while-revalidate=604800');
    res.setHeader('X-Content-Type-Options', 'nosniff');
    return res.status(200).send(webpBuffer);
  } catch (err) {
    console.error('Error optimizing image via sharp:', err.message);
    return res.status(400).json({ error: 'Formato de imagen inválido o no procesable' });
  }
}
