import { query } from '../_db.js';
import bcrypt from 'bcryptjs';
import { requireUser, setCors } from '../_auth.js';

export default async function handler(req, res) {
  setCors(res, 'POST, OPTIONS');
  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  const user = await requireUser(req, res);
  if (!user) return;
  if (user.provider === 'guest') return res.status(403).json({ error: 'Guest accounts do not have passwords' });

  try {
    const { currentPassword, newPassword } = req.body || {};
    if (!currentPassword || !newPassword || newPassword.length < 8) {
      return res.status(400).json({ error: 'Current password and a new password of at least 8 characters are required' });
    }
    const rows = await query('SELECT password_hash FROM users WHERE user_id = ?', [user.userId]);
    if (!rows.length || !rows[0].password_hash || !(await bcrypt.compare(currentPassword, rows[0].password_hash))) {
      return res.status(401).json({ error: 'Current password is incorrect' });
    }
    await query('UPDATE users SET password_hash = ? WHERE user_id = ?', [await bcrypt.hash(newPassword, 12), user.userId]);
    await query('DELETE FROM user_tokens WHERE user_id = ?', [user.userId]);
    return res.status(200).json({ success: true, message: 'Password updated. Please log in again.' });
  } catch (error) {
    console.error('[password]', error);
    return res.status(500).json({ error: 'Failed to update password' });
  }
}
