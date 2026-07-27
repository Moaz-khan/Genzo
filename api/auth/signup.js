// api/auth/signup.js
// POST /api/auth/signup
// Body: { firstName, lastName, email, password }
// Returns: { success, user: { userId, name, email, authProvider }, token }

import { query } from '../_db.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET;

export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { firstName, lastName, email, password, guestUserId, guestToken } = req.body;

    if (!email || !password || !firstName) {
      return res.status(400).json({ error: 'First name, email, and password are required' });
    }

    // Check if email already exists
    const existing = await query('SELECT user_id FROM users WHERE email = ?', [email]);
    if (existing.length > 0) {
      return res.status(409).json({ error: 'This email is already registered. Please log in.' });
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 12);

    let userId = `usr_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`;
    const name = `${firstName} ${lastName || ''}`.trim();

    // Claim the current guest account only when its signed token proves ownership.
    if (guestUserId && guestToken) {
      try {
        const guest = jwt.verify(guestToken, JWT_SECRET);
        if (guest.userId === guestUserId && guest.provider === 'guest') {
          const guestRows = await query('SELECT user_id FROM users WHERE user_id = ? AND auth_provider = \'guest\'', [guestUserId]);
          if (guestRows.length) userId = guestUserId;
        }
      } catch { /* create a normal account when the guest token is invalid */ }
    }

    // Insert user
    if (userId === guestUserId) {
      await query(`UPDATE users SET name = ?, email = ?, password_hash = ?, auth_provider = 'local' WHERE user_id = ?`, [name, email, passwordHash, userId]);
    } else {
      await query(`INSERT INTO users (user_id, name, email, password_hash, auth_provider) VALUES (?, ?, ?, ?, 'local')`, [userId, name, email, passwordHash]);
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId, email, name, provider: 'local' },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Store token in DB
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
      .toISOString()
      .slice(0, 19)
      .replace('T', ' ');

    await query(
      `INSERT INTO user_tokens (user_id, token, expires_at) VALUES (?, ?, ?)
       ON DUPLICATE KEY UPDATE token = VALUES(token), expires_at = VALUES(expires_at)`,
      [userId, token, expiresAt]
    );

    return res.status(201).json({
      success: true,
      user: { userId, name, email, authProvider: 'local' },
      token,
    });

  } catch (err) {
    console.error('[signup]', err);
    return res.status(500).json({ error: 'Server error. Please try again.' });
  }
}
