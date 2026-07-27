import jwt from 'jsonwebtoken';
import { query } from './_db.js';

const JWT_SECRET = process.env.JWT_SECRET;

export async function requireUser(req, res) {
  if (!JWT_SECRET) {
    res.status(500).json({ error: 'Authentication is not configured on the server' });
    return null;
  }
  const authorization = req.headers.authorization || '';
  if (!authorization.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Authorization is required' });
    return null;
  }

  try {
    const token = authorization.slice(7);
    const decoded = jwt.verify(token, JWT_SECRET);
    const rows = await query('SELECT user_id FROM user_tokens WHERE user_id = ? AND token = ? AND expires_at > NOW()', [decoded.userId, token]);
    if (!rows.length) {
      res.status(401).json({ error: 'Session has expired or was revoked' });
      return null;
    }
    return decoded;
  } catch {
    res.status(401).json({ error: 'Invalid or expired session' });
    return null;
  }
}

export function setCors(res, methods = 'GET, PATCH, POST, DELETE, OPTIONS') {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', methods);
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
}
