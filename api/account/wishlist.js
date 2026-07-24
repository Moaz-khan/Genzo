import { query } from '../_db.js';
import { requireUser, setCors } from '../_auth.js';

export default async function handler(req, res) {
  setCors(res, 'GET, PUT, DELETE, OPTIONS');
  if (req.method === 'OPTIONS') return res.status(204).end();
  if (!['GET', 'PUT', 'DELETE'].includes(req.method)) return res.status(405).json({ error: 'Method not allowed' });
  const user = requireUser(req, res);
  if (!user) return;
  try {
    // Keep this endpoint compatible with wishlists created before product
    // metadata was added.
    try { await query('ALTER TABLE wishlists ADD COLUMN product_name VARCHAR(255) NULL, ADD COLUMN image_url TEXT NULL'); } catch (error) {
      // TiDB returns a duplicate-column error when the migration already ran.
      if (!String(error?.message || '').toLowerCase().includes('duplicate')) throw error;
    }

    if (req.method === 'GET') {
      const rows = await query('SELECT product_id AS productId, product_name AS productName, image_url AS image FROM wishlists WHERE user_id = ?', [user.userId]);
      return res.status(200).json({ success: true, productIds: rows.map(row => Number(row.productId)), items: rows.map(row => ({ ...row, productId: Number(row.productId) })) });
    }
    const productId = Number(req.body?.productId);
    if (!Number.isInteger(productId)) return res.status(400).json({ error: 'A valid product id is required' });
    if (req.method === 'PUT') {
      await query(
        `INSERT INTO wishlists (user_id, product_id, product_name, image_url) VALUES (?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE product_name = VALUES(product_name), image_url = VALUES(image_url)`,
        [user.userId, productId, req.body?.productName || null, req.body?.image || null]
      );
    } else {
      await query('DELETE FROM wishlists WHERE user_id = ? AND product_id = ?', [user.userId, productId]);
    }
    const rows = await query('SELECT product_id AS productId, product_name AS productName, image_url AS image FROM wishlists WHERE user_id = ?', [user.userId]);
    return res.status(200).json({ success: true, productIds: rows.map(row => Number(row.productId)), items: rows.map(row => ({ ...row, productId: Number(row.productId) })) });
  } catch (error) {
    console.error('[wishlist]', error);
    return res.status(500).json({ error: 'Failed to manage wishlist' });
  }
}
