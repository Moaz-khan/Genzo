// api/auth/reset-password.js
// POST /api/auth/reset-password
// Body: { email, otp, newPassword }
// Returns: { success, message }
// Verifies the OTP, updates the password, and clears all active sessions.

import { query } from '../_db.js';
import bcrypt from 'bcryptjs';
import { setCors } from '../_auth.js';

export default async function handler(req, res) {
  setCors(res, 'POST, OPTIONS');
  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const email = (req.body?.email || '').toLowerCase().trim();
    const { otp, newPassword } = req.body || {};

    if (!email || !otp || !newPassword) {
      return res.status(400).json({ error: 'Email, OTP, and new password are required' });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({ error: 'Password must be at least 8 characters long' });
    }

    // Verify OTP
    const tokens = await query(
      `SELECT otp, expires_at FROM password_reset_tokens
       WHERE email = ? AND otp = ? AND used = FALSE AND expires_at > NOW()
       ORDER BY created_at DESC LIMIT 1`,
      [email, otp]
    );

    if (!tokens.length) {
      return res.status(401).json({ error: 'Invalid or expired verification code' });
    }

    // Hash new password
    const passwordHash = await bcrypt.hash(newPassword, 12);

    // Update password
    const result = await query(
      "UPDATE users SET password_hash = ?, auth_provider = 'local' WHERE email = ?",
      [passwordHash, email]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Account not found' });
    }

    // Mark OTP as used
    await query('UPDATE password_reset_tokens SET used = TRUE WHERE email = ? AND otp = ?', [email, otp]);

    // Clear all sessions for security (forces re-login)
    const user = await query('SELECT user_id FROM users WHERE email = ?', [email]);
    if (user.length) {
      await query('DELETE FROM user_tokens WHERE user_id = ?', [user[0].user_id]);
    }

    return res.status(200).json({
      success: true,
      message: 'Password updated successfully. Please log in with your new password.',
    });
  } catch (err) {
    console.error('[reset-password]', err);
    return res.status(500).json({ error: 'Server error. Please try again.' });
  }
}
