import { put, list, del, head } from '@vercel/blob';

const PASS = process.env.APP_PASSWORD || 'sarkaras80';
// each save writes a new versioned blob — overwriting a fixed pathname serves
// stale CDN copies for up to a minute, versioned pathnames are immutable
const PREFIX = 'sarkara/config-';
const LEGACY = 'sarkara/config.json';

async function listVersions() {
  const blobs = [];
  let cursor;
  do {
    const r = await list({ prefix: PREFIX, cursor, limit: 1000 });
    blobs.push(...r.blobs);
    cursor = r.cursor;
  } while (cursor);
  return blobs.sort((a, b) => a.pathname.localeCompare(b.pathname));
}

async function fetchJSON(url) {
  try {
    const r = await fetch(`${url}?ts=${Date.now()}`, { cache: 'no-store' });
    return r.ok ? await r.json() : null;
  } catch {
    return null;
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
    const versions = await listVersions();
    if (versions.length) {
      const cfg = await fetchJSON(versions[versions.length - 1].url);
      if (cfg) return res.status(200).json({ ok: true, config: cfg });
    }
    try {
      const meta = await head(LEGACY);
      const cfg = await fetchJSON(meta.url);
      if (cfg) return res.status(200).json({ ok: true, config: cfg });
    } catch {}
    return res.status(200).json({ ok: true, config: null });
  }

  if (req.method === 'PUT') {
    const cfg = req.body;
    if (!cfg || !Array.isArray(cfg.items)) {
      return res.status(400).json({ ok: false, error: 'bad-config' });
    }
    const pathname = `${PREFIX}${Date.now()}.json`;
    await put(pathname, JSON.stringify(cfg), {
      access: 'public',
      addRandomSuffix: false,
      allowOverwrite: true,
      contentType: 'application/json',
    });
    try {
      const stale = (await listVersions()).filter(b => b.pathname !== pathname);
      if (stale.length) await del(stale.map(b => b.url));
      await del((await head(LEGACY)).url);
    } catch {} // cleanup is best-effort
    return res.status(200).json({ ok: true });
  }

  return res.status(405).json({ ok: false });
}
