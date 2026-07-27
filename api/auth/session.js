import { query } from '../_db.js';
import { requireUser, setCors } from '../_auth.js';

export default async function handler(req, res) {
  setCors(res, 'GET, OPTIONS');
  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });
  const user = await requireUser(req, res);
  if (!user) return;
  try {
    const rows = await query(
      `SELECT u.user_id AS userId, u.name, u.email, u.auth_provider AS authProvider,
              p.avatar_url AS avatarUrl
       FROM users u LEFT JOIN user_profiles p ON p.user_id = u.user_id
       WHERE u.user_id = ?`, [user.userId]
    );
    if (!rows.length) return res.status(404).json({ error: 'User not found' });
    return res.status(200).json({ success: true, user: rows[0] });
  } catch (error) {
    console.error('[session]', error);
    return res.status(500).json({ error: 'Could not load session' });
  }
}
