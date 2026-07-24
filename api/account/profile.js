import { query } from '../_db.js';
import { requireUser, setCors } from '../_auth.js';

export default async function handler(req, res) {
  setCors(res, 'GET, PATCH, OPTIONS');
  if (req.method === 'OPTIONS') return res.status(204).end();
  if (!['GET', 'PATCH'].includes(req.method)) return res.status(405).json({ error: 'Method not allowed' });

  const user = requireUser(req, res);
  if (!user) return;

  try {
    // Older deployments may have a users table without optional profile columns.
    // Keep profile-specific fields in a separate table so the account API works
    // with both the old and new users schema.
    await query(
      `CREATE TABLE IF NOT EXISTS user_profiles (
        user_id VARCHAR(80) PRIMARY KEY,
        phone VARCHAR(40),
        updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )`
    );

    if (req.method === 'GET') {
      const rows = await query(
        `SELECT u.user_id AS userId, u.name, u.email, u.auth_provider AS authProvider,
                p.phone, NULL AS avatarUrl
         FROM users u LEFT JOIN user_profiles p ON p.user_id = u.user_id
         WHERE u.user_id = ?`, [user.userId]
      );
      if (!rows.length) return res.status(404).json({ error: 'User not found' });
      return res.status(200).json({ success: true, profile: rows[0] });
    }

    if (user.provider === 'guest') return res.status(403).json({ error: 'Guest profiles cannot be edited' });
    const { firstName, lastName, phone } = req.body || {};
    if (!firstName?.trim()) return res.status(400).json({ error: 'First name is required' });

    const name = `${firstName.trim()} ${(lastName || '').trim()}`.trim();
    await query('UPDATE users SET name = ? WHERE user_id = ?', [name, user.userId]);
    await query(
      `INSERT INTO user_profiles (user_id, phone) VALUES (?, ?)
       ON DUPLICATE KEY UPDATE phone = VALUES(phone)`,
      [user.userId, phone?.trim() || null]
    );
    const rows = await query(
      `SELECT u.user_id AS userId, u.name, u.email, u.auth_provider AS authProvider,
              p.phone, NULL AS avatarUrl
       FROM users u LEFT JOIN user_profiles p ON p.user_id = u.user_id
       WHERE u.user_id = ?`, [user.userId]
    );
    return res.status(200).json({ success: true, profile: rows[0] });
  } catch (error) {
    console.error('[profile]', error);
    return res.status(500).json({ error: 'Failed to load or update profile', detail: error instanceof Error ? error.message : 'Database error' });
  }
}
