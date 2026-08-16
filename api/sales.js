import { put, head } from '@vercel/blob';

const PASS = process.env.APP_PASSWORD || 'onam2026';
const BLOB_PATH = 'sarkara/sales.json';

async function readSales() {
  try {
    const meta = await head(BLOB_PATH);
    // cache-buster query param so we never read a stale CDN copy
    const r = await fetch(`${meta.url}?ts=${Date.now()}`, { cache: 'no-store' });
    if (!r.ok) return [];
    return await r.json();
  } catch {
    return []; // blob doesn't exist yet
  }
}

async function writeSales(sales) {
  await put(BLOB_PATH, JSON.stringify(sales), {
    access: 'public',
    addRandomSuffix: false,
    allowOverwrite: true,
    contentType: 'application/json',
  });
}

export default async function handler(req, res) {
  if (req.headers['x-app-auth'] !== PASS) {
    return res.status(401).json({ ok: false, error: 'unauthorized' });
  }
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    return res.status(503).json({ ok: false, error: 'blob-not-configured' });
  }

  if (req.method === 'GET') {
    return res.status(200).json({ ok: true, sales: await readSales() });
  }

  if (req.method === 'POST') {
    const sale = req.body;
    if (!sale || typeof sale.total !== 'number' || !sale.id) {
      return res.status(400).json({ ok: false, error: 'bad-sale' });
    }
    const sales = await readSales();
    if (!sales.some(s => s.id === sale.id)) {
      sales.push(sale);
      await writeSales(sales);
    }
    return res.status(200).json({ ok: true, count: sales.length });
  }

  if (req.method === 'DELETE') {
    await writeSales([]);
    return res.status(200).json({ ok: true });
  }

  return res.status(405).json({ ok: false });
}
