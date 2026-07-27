// api/auth/forgot-password.js
// POST /api/auth/forgot-password
// Body: { email }
// Returns: { success, message }
// Generates a 6-digit OTP and stores it in password_reset_tokens table.
// In production, OTP would be sent via email/SMS.

import { query } from '../_db.js';
import { setCors } from '../_auth.js';

export default async function handler(req, res) {
  setCors(res, 'POST, OPTIONS');
  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { email: rawEmail, otp } = req.body || {};
    const email = (rawEmail || '').toLowerCase().trim();

    // Ensure the password_reset_tokens table exists
    await query(
      `CREATE TABLE IF NOT EXISTS password_reset_tokens (
        email VARCHAR(255) NOT NULL,
        otp VARCHAR(6) NOT NULL,
        expires_at DATETIME NOT NULL,
        used BOOLEAN NOT NULL DEFAULT FALSE,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (email, otp)
      )`
    );

    // If OTP is provided, verify it
    if (otp) {
      if (!email) return res.status(400).json({ error: 'Email is required' });
      const tokens = await query(
        `SELECT otp, expires_at FROM password_reset_tokens
         WHERE email = ? AND otp = ? AND used = FALSE AND expires_at > NOW()
         ORDER BY created_at DESC LIMIT 1`,
        [email, otp]
      );
      if (!tokens.length) {
        return res.status(401).json({ error: 'Invalid or expired verification code' });
      }
      return res.status(200).json({ success: true, message: 'Code verified' });
    }

    // Otherwise, generate and send a new OTP
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ error: 'A valid email address is required' });
    }

    // Ensure the user exists (not a guest)
    const users = await query('SELECT user_id FROM users WHERE email = ? AND auth_provider != \'guest\'', [email]);
    if (!users.length) {
      return res.status(404).json({ error: 'No account found with this email address' });
    }

    // Invalidate previous unused OTPs for this email
    await query('DELETE FROM password_reset_tokens WHERE email = ? AND used = FALSE', [email]);

    // Generate 6-digit OTP
    const newOtp = String(Math.floor(100000 + Math.random() * 900000));
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000) // 15 minutes
      .toISOString()
      .slice(0, 19)
      .replace('T', ' ');

    await query(
      'INSERT INTO password_reset_tokens (email, otp, expires_at) VALUES (?, ?, ?)',
      [email, newOtp, expiresAt]
    );

    // In production, send OTP via email here.
    console.log(`[forgot-password] OTP for ${email}: ${newOtp}`);

    return res.status(200).json({
      success: true,
      message: 'A verification code has been sent to your email',
    });
  } catch (err) {
    console.error('[forgot-password]', err);
    return res.status(500).json({ error: 'Server error. Please try again.' });
  }
}
