import { query } from '../_db.js';
import { requireUser, setCors } from '../_auth.js';

export default async function handler(req, res) {
  setCors(res, 'GET, POST, PATCH, DELETE, OPTIONS');
  if (req.method === 'OPTIONS') return res.status(204).end();
  if (!['GET', 'POST', 'PATCH', 'DELETE'].includes(req.method)) return res.status(405).json({ error: 'Method not allowed' });

  const user = requireUser(req, res);
  if (!user) return;
  const addressId = req.query.id ? Number(req.query.id) : null;

  try {
    if (req.method === 'GET') {
      const addresses = await query(
        `SELECT id, recipient_name AS recipientName, phone, address, city, province,
                postal_code AS postalCode, is_default AS isDefault
         FROM user_addresses WHERE user_id = ? ORDER BY is_default DESC, id DESC`, [user.userId]
      );
      return res.status(200).json({ success: true, addresses });
    }

    if (user.provider === 'guest') return res.status(403).json({ error: 'Guests cannot save addresses' });
    const body = req.body || {};
    if (!body.recipientName?.trim() || !body.address?.trim() || !body.city?.trim() || !body.province?.trim()) {
      return res.status(400).json({ error: 'Name, address, city, and province are required' });
    }

    if (req.method === 'POST') {
      const existing = await query('SELECT COUNT(*) AS count FROM user_addresses WHERE user_id = ?', [user.userId]);
      const isDefault = body.isDefault || Number(existing[0].count) === 0;
      if (isDefault) await query('UPDATE user_addresses SET is_default = 0 WHERE user_id = ?', [user.userId]);
      const result = await query(
        `INSERT INTO user_addresses (user_id, recipient_name, phone, address, city, province, postal_code, is_default)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [user.userId, body.recipientName.trim(), body.phone?.trim() || null, body.address.trim(), body.city.trim(), body.province.trim(), body.postalCode?.trim() || null, isDefault ? 1 : 0]
      );
      return res.status(201).json({ success: true, id: result.insertId });
    }

    if (!addressId) return res.status(400).json({ error: 'Address id is required' });
    const owns = await query('SELECT id FROM user_addresses WHERE id = ? AND user_id = ?', [addressId, user.userId]);
    if (!owns.length) return res.status(404).json({ error: 'Address not found' });

    if (req.method === 'DELETE') {
      await query('DELETE FROM user_addresses WHERE id = ? AND user_id = ?', [addressId, user.userId]);
      return res.status(200).json({ success: true });
    }

    if (body.isDefault) await query('UPDATE user_addresses SET is_default = 0 WHERE user_id = ?', [user.userId]);
    await query(
      `UPDATE user_addresses SET recipient_name = ?, phone = ?, address = ?, city = ?, province = ?, postal_code = ?, is_default = ?
       WHERE id = ? AND user_id = ?`,
      [body.recipientName.trim(), body.phone?.trim() || null, body.address.trim(), body.city.trim(), body.province.trim(), body.postalCode?.trim() || null, body.isDefault ? 1 : 0, addressId, user.userId]
    );
    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('[addresses]', error);
    return res.status(500).json({ error: 'Failed to manage addresses' });
  }
}
