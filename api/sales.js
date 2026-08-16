import { put, list, del, head } from '@vercel/blob';

const PASS = process.env.APP_PASSWORD || 'sarkaras80';
// one blob per sale — concurrent devices can never overwrite each other's bills
const PREFIX = 'sarkara/sales/';
// aggregate file used by the first release; still read so old bills show up
const LEGACY = 'sarkara/sales.json';

async function listAll() {
  const blobs = [];
  let cursor;
  do {
    const r = await list({ prefix: PREFIX, cursor, limit: 1000 });
    blobs.push(...r.blobs);
    cursor = r.cursor;
  } while (cursor);
  return blobs;
}

async function fetchJSON(url) {
  try {
    const r = await fetch(`${url}?ts=${Date.now()}`, { cache: 'no-store' });
    return r.ok ? await r.json() : null;
  } catch {
    return null;
  }
}

async function readLegacy() {
  try {
    const meta = await head(LEGACY);
    const arr = await fetchJSON(meta.url);
    return Array.isArray(arr) ? arr : [];
  } catch {
    return [];
  }
}

export default async function handler(req, res) {
  if (req.headers['x-app-auth'] !== PASS) {
    return res.status(401).json({ ok: false, error: 'unauthorized' });
  }
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    return res.status(503).json({ ok: false, error: 'blob-not-configured' });
  }

  if (req.method === 'GET') {
    const blobs = await listAll();
    const sales = (await Promise.all(blobs.map(b => fetchJSON(b.url)))).filter(Boolean);
    const seen = new Set(sales.map(s => s.id));
    (await readLegacy()).forEach(s => { if (s.id && !seen.has(s.id)) sales.push(s); });
    sales.sort((a, b) => a.ts - b.ts);
    return res.status(200).json({ ok: true, sales });
  }

  if (req.method === 'POST') {
    const sale = req.body;
    if (!sale || typeof sale.total !== 'number' || typeof sale.id !== 'string' || !/^[\w-]+$/.test(sale.id)) {
      return res.status(400).json({ ok: false, error: 'bad-sale' });
    }
    await put(`${PREFIX}${sale.id}.json`, JSON.stringify(sale), {
      access: 'public',
      addRandomSuffix: false,
      allowOverwrite: true,
      contentType: 'application/json',
    });
    return res.status(200).json({ ok: true });
  }

  if (req.method === 'DELETE') {
    const blobs = await listAll();
    if (blobs.length) await del(blobs.map(b => b.url));
    try { await del((await head(LEGACY)).url); } catch {}
    return res.status(200).json({ ok: true });
  }

  return res.status(405).json({ ok: false });
}
