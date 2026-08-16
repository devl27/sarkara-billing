import { put, head } from '@vercel/blob';

const PASS = process.env.APP_PASSWORD || 'sarkaras80';
const BLOB_PATH = 'sarkara/config.json';

export default async function handler(req, res) {
  if (req.headers['x-app-auth'] !== PASS) {
    return res.status(401).json({ ok: false, error: 'unauthorized' });
  }
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    return res.status(503).json({ ok: false, error: 'blob-not-configured' });
  }

  if (req.method === 'GET') {
    try {
      const meta = await head(BLOB_PATH);
      // cache-buster query param so we never read a stale CDN copy
      const r = await fetch(`${meta.url}?ts=${Date.now()}`, { cache: 'no-store' });
      if (r.ok) return res.status(200).json({ ok: true, config: await r.json() });
    } catch {} // config not saved yet
    return res.status(200).json({ ok: true, config: null });
  }

  if (req.method === 'PUT') {
    const cfg = req.body;
    if (!cfg || !Array.isArray(cfg.items)) {
      return res.status(400).json({ ok: false, error: 'bad-config' });
    }
    await put(BLOB_PATH, JSON.stringify(cfg), {
      access: 'public',
      addRandomSuffix: false,
      allowOverwrite: true,
      contentType: 'application/json',
    });
    return res.status(200).json({ ok: true });
  }

  return res.status(405).json({ ok: false });
}
