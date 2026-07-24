import { query } from '../_db.js';
import { requireUser, setCors } from '../_auth.js';

export default async function handler(req, res) {
  setCors(res, 'GET, PATCH, OPTIONS');
  if (req.method === 'OPTIONS') return res.status(204).end();
  if (!['GET', 'PATCH'].includes(req.method)) return res.status(405).json({ error: 'Method not allowed' });

  const user = requireUser(req, res);
  if (!user) return;

  try {
    if (req.method === 'GET') {
      const rows = await query(
        `SELECT user_id AS userId, name, email, phone, auth_provider AS authProvider, avatar_url AS avatarUrl
         FROM users WHERE user_id = ?`, [user.userId]
      );
      if (!rows.length) return res.status(404).json({ error: 'User not found' });
      return res.status(200).json({ success: true, profile: rows[0] });
    }

    if (user.provider === 'guest') return res.status(403).json({ error: 'Guest profiles cannot be edited' });
    const { firstName, lastName, phone } = req.body || {};
    if (!firstName?.trim()) return res.status(400).json({ error: 'First name is required' });

    const name = `${firstName.trim()} ${(lastName || '').trim()}`.trim();
    await query('UPDATE users SET name = ?, phone = ? WHERE user_id = ?', [name, phone?.trim() || null, user.userId]);
    const rows = await query(
      `SELECT user_id AS userId, name, email, phone, auth_provider AS authProvider, avatar_url AS avatarUrl
       FROM users WHERE user_id = ?`, [user.userId]
    );
    return res.status(200).json({ success: true, profile: rows[0] });
  } catch (error) {
    console.error('[profile]', error);
    return res.status(500).json({ error: 'Failed to load or update profile' });
  }
}
