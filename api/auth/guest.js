// api/auth/guest.js
// POST /api/auth/guest
// Returns: { success, user: { userId, authProvider: 'guest' }, token }
// Creates a guest user record in DB with auto-generated unique ID

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
    // Generate unique 6-digit guest number → guest123456
    const guestNumber = Math.floor(100000 + Math.random() * 900000);
    const userId = `guest${guestNumber}`;
    const name = `Guest (${userId})`;

    // Insert guest user (no email, no password)
    await query(
      `INSERT INTO users (user_id, name, email, auth_provider)
       VALUES (?, ?, NULL, 'guest')`,
      [userId, name]
    );

    // Generate guest JWT token
    const token = jwt.sign(
      { userId, role: 'guest', provider: 'guest' },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000)
      .toISOString()
      .slice(0, 19)
      .replace('T', ' ');

    await query(
      `INSERT INTO user_tokens (user_id, token, expires_at) VALUES (?, ?, ?)`,
      [userId, token, expiresAt]
    );

    return res.status(201).json({
      success: true,
      user: {
        userId,
        name,
        email: '',
        authProvider: 'guest',
      },
      token,
    });

  } catch (err) {
    console.error('[guest]', err);
    return res.status(500).json({ error: 'Server error. Please try again.' });
  }
}
