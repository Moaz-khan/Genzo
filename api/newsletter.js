import { query } from './_db.js';
import { setCors } from './_auth.js';

export default async function handler(req, res) {
  setCors(res, 'POST, OPTIONS');
  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  const email = req.body?.email?.trim().toLowerCase();
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return res.status(400).json({ error: 'A valid email is required' });
  try {
    await query(`CREATE TABLE IF NOT EXISTS newsletter_subscribers (email VARCHAR(255) PRIMARY KEY, subscribed_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP)`);
    await query('INSERT IGNORE INTO newsletter_subscribers (email) VALUES (?)', [email]);
    return res.status(200).json({ success: true, message: 'You are subscribed' });
  } catch (error) {
    console.error('[newsletter]', error);
    return res.status(500).json({ error: 'Could not subscribe' });
  }
}
