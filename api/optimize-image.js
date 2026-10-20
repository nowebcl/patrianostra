import sharp from 'sharp';

export const config = {
  api: {
    bodyParser: false
  }
};

export default async function handler(req, res) {
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    return res.status(204).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const chunks = [];
    for await (const chunk of req) {
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
    res.setHeader('Cache-Control', 'no-store');
    return res.status(200).send(webpBuffer);
  } catch (err) {
    console.error('Error optimizing image via sharp:', err);
    return res.status(500).json({ error: err.message });
  }
}
