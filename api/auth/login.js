// api/auth/login.js
// POST /api/auth/login
// Body: { email, password }
// Returns: { success, user: { userId, name, email, authProvider }, token }

import { query } from '../_db.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET;

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { email, password, guestUserId, guestToken } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // Find user by email
    const users = await query(
      'SELECT user_id, name, email, password_hash, auth_provider FROM users WHERE email = ?',
      [email]
    );

    let user;

    if (users.length === 0) {
      // Check if this is a guest-to-local conversion
      if (guestUserId && guestToken) {
        try {
          const guest = jwt.verify(guestToken, JWT_SECRET);
          if (guest.userId === guestUserId && guest.provider === 'guest') {
            const guestRows = await query(
              'SELECT user_id, name, email, password_hash, auth_provider FROM users WHERE user_id = ? AND auth_provider = \'guest\'',
              [guestUserId]
            );
            if (guestRows.length) {
              // Convert guest account: set email and password
              const passwordHash = await bcrypt.hash(password, 12);
              await query(
                `UPDATE users SET name = ?, email = ?, password_hash = ?, auth_provider = 'local' WHERE user_id = ?`,
                [`${guestRows[0].name}`, email, passwordHash, guestUserId]
              );
              user = {
                user_id: guestUserId,
                name: guestRows[0].name,
                email: email,
                password_hash: passwordHash,
                auth_provider: 'local',
              };
            }
          }
        } catch {
          // Invalid guest token — proceed to normal error
        }
      }
      if (!user) {
        return res.status(401).json({ error: 'No account found with this email. Please sign up first.' });
      }
    } else {
      user = users[0];
    }

    // Check if account was created with Google (no password)
    if (user.auth_provider === 'google') {
      return res.status(400).json({ error: 'This account uses Google login. Please click "Continue with Google".' });
    }

    // Verify password (always verify even for guest conversions since we just set the hash)
    const isValid = await bcrypt.compare(password, user.password_hash);
    if (!isValid) {
      return res.status(401).json({ error: 'Incorrect password. Please try again.' });
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user.user_id, email: user.email, name: user.name, provider: 'local' },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Update token in DB
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
      .toISOString()
      .slice(0, 19)
      .replace('T', ' ');

    await query(
      `INSERT INTO user_tokens (user_id, token, expires_at) VALUES (?, ?, ?)
       ON DUPLICATE KEY UPDATE token = VALUES(token), expires_at = VALUES(expires_at)`,
      [user.user_id, token, expiresAt]
    );

    return res.status(200).json({
      success: true,
      user: {
        userId: user.user_id,
        name: user.name,
        email: user.email,
        authProvider: user.auth_provider,
      },
      token,
    });

  } catch (err) {
    console.error('[login]', err);
    return res.status(500).json({ error: 'Server error. Please try again.' });
  }
}
