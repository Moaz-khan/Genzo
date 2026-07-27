import { query } from '../_db.js';
import { requireUser, setCors } from '../_auth.js';

export default async function handler(req, res) {
  setCors(res, 'POST, OPTIONS');
  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  const user = await requireUser(req, res);
  if (!user) return;
  try {
    const token = (req.headers.authorization || '').slice(7);
    await query('DELETE FROM user_tokens WHERE user_id = ? AND token = ?', [user.userId, token]);
    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('[logout]', error);
    return res.status(500).json({ error: 'Could not log out' });
  }
}
