// api/auth/google.js
// POST /api/auth/google
// Body: { name, email, googleId, avatarUrl }
// Returns: { success, user, token }
// Called when user clicks "Continue with Google"
// In production: verify Google ID Token with Google APIs

import { query } from '../_db.js';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET;

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { name, email, googleId, avatarUrl, guestUserId, guestToken } = req.body;

    if (!email || !name) {
      return res.status(400).json({ error: 'Name and email from Google are required' });
    }

    // Check if user exists
    const existing = await query('SELECT user_id, name, email, auth_provider FROM users WHERE email = ?', [email]);

    await query(`CREATE TABLE IF NOT EXISTS user_profiles (user_id VARCHAR(80) PRIMARY KEY, phone VARCHAR(40), avatar_url TEXT, updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP)`);
    try { await query('ALTER TABLE user_profiles ADD COLUMN avatar_url TEXT NULL'); } catch (error) {
      if (!String(error?.message || '').toLowerCase().includes('duplicate')) throw error;
    }

    let userId;

    if (existing.length > 0) {
      // User exists — use their ID
      userId = existing[0].user_id;

      // Update avatar if changed
      if (avatarUrl) await query('INSERT INTO user_profiles (user_id, avatar_url) VALUES (?, ?) ON DUPLICATE KEY UPDATE avatar_url = VALUES(avatar_url)', [userId, avatarUrl]);
    } else {
      // Create new Google user
      userId = `goog_${googleId || Date.now().toString(36)}_${Math.random().toString(36).slice(2, 6)}`;
      if (guestUserId && guestToken) {
        try {
          const guest = jwt.verify(guestToken, JWT_SECRET);
          const guestRows = guest.userId === guestUserId && guest.provider === 'guest'
            ? await query('SELECT user_id FROM users WHERE user_id = ? AND auth_provider = \'guest\'', [guestUserId]) : [];
          if (guestRows.length) userId = guestUserId;
        } catch { /* use a new Google user when guest token is invalid */ }
      }

      if (userId === guestUserId) await query(`UPDATE users SET name = ?, email = ?, auth_provider = 'google' WHERE user_id = ?`, [name, email, userId]);
      else await query(`INSERT INTO users (user_id, name, email, auth_provider) VALUES (?, ?, ?, 'google')`, [userId, name, email]);
      if (avatarUrl) await query('INSERT INTO user_profiles (user_id, avatar_url) VALUES (?, ?) ON DUPLICATE KEY UPDATE avatar_url = VALUES(avatar_url)', [userId, avatarUrl]);
    }

    // Generate JWT
    const token = jwt.sign(
      { userId, email, name, provider: 'google' },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
      .toISOString()
      .slice(0, 19)
      .replace('T', ' ');

    await query(
      `INSERT INTO user_tokens (user_id, token, expires_at) VALUES (?, ?, ?)
       ON DUPLICATE KEY UPDATE token = VALUES(token), expires_at = VALUES(expires_at)`,
      [userId, token, expiresAt]
    );

    return res.status(200).json({
      success: true,
      user: { userId, name, email, authProvider: 'google', avatarUrl: avatarUrl || null },
      token,
    });

  } catch (err) {
    console.error('[google-auth]', err);
    return res.status(500).json({ error: 'Server error. Please try again.' });
  }
}
