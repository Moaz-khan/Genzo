import { query } from './_db.js';
import { setCors } from './_auth.js';

export default async function handler(req, res) {
  setCors(res, 'POST, OPTIONS');
  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  const { name, email, subject, message } = req.body || {};
  if (!name?.trim() || !email?.trim() || !message?.trim()) return res.status(400).json({ error: 'Name, email, and message are required' });
  if (message.length > 5000) return res.status(400).json({ error: 'Message is too long' });
  try {
    await query(`CREATE TABLE IF NOT EXISTS contact_messages (id BIGINT AUTO_INCREMENT PRIMARY KEY, name VARCHAR(160) NOT NULL, email VARCHAR(255) NOT NULL, subject VARCHAR(120), message TEXT NOT NULL, status VARCHAR(30) NOT NULL DEFAULT 'new', created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP)`);
    await query('INSERT INTO contact_messages (name, email, subject, message) VALUES (?, ?, ?, ?)', [name.trim(), email.trim().toLowerCase(), subject?.trim() || null, message.trim()]);
    return res.status(201).json({ success: true, message: 'Message received' });
  } catch (error) {
    console.error('[contact]', error);
    return res.status(500).json({ error: 'Could not send message' });
  }
}
