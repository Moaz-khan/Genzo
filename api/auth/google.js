// api/auth/google.js
// POST /api/auth/google
// Body: { name, email, googleId, avatarUrl }
// Returns: { success, user, token }
// Called when user clicks "Continue with Google"
// In production: verify Google ID Token with Google APIs

import { query } from '../_db.js';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret_change_me';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { name, email, googleId, avatarUrl } = req.body;

    if (!email || !name) {
      return res.status(400).json({ error: 'Name and email from Google are required' });
    }

    // Check if user exists
    const existing = await query('SELECT user_id, name, email, auth_provider FROM users WHERE email = ?', [email]);

    let userId;

    if (existing.length > 0) {
      // User exists — use their ID
      userId = existing[0].user_id;

      // Update avatar if changed
      if (avatarUrl) {
        await query('UPDATE users SET avatar_url = ? WHERE user_id = ?', [avatarUrl, userId]);
      }
    } else {
      // Create new Google user
      userId = `goog_${googleId || Date.now().toString(36)}_${Math.random().toString(36).slice(2, 6)}`;

      await query(
        `INSERT INTO users (user_id, name, email, auth_provider, avatar_url)
         VALUES (?, ?, ?, 'google', ?)`,
        [userId, name, email, avatarUrl || null]
      );
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
      `INSERT INTO user_tokens (user_id, token, expires_at) VALUES (?, ?, ?)`,
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
