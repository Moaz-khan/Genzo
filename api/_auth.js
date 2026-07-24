import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret_change_me';

export function requireUser(req, res) {
  const authorization = req.headers.authorization || '';
  if (!authorization.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Authorization is required' });
    return null;
  }

  try {
    return jwt.verify(authorization.slice(7), JWT_SECRET);
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
