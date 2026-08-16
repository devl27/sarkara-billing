const USER = process.env.APP_USERNAME || 'sarkara';
const PASS = process.env.APP_PASSWORD || 'onam2026';

export default function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ ok: false });
  const { username, password } = req.body || {};
  if (username === USER && password === PASS) return res.status(200).json({ ok: true });
  return res.status(401).json({ ok: false });
}
