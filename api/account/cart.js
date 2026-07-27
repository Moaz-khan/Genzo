import { query } from '../_db.js';
import { requireUser, setCors } from '../_auth.js';

export default async function handler(req, res) {
  setCors(res, 'GET, PUT, DELETE, OPTIONS');
  if (req.method === 'OPTIONS') return res.status(204).end();
  if (!['GET', 'PUT', 'DELETE'].includes(req.method)) return res.status(405).json({ error: 'Method not allowed' });
  const user = await requireUser(req, res);
  if (!user) return;

  try {
    if (req.method === 'GET') {
      const items = await query(
        `SELECT cart_id AS cartId, product_id AS productId, product_name AS name,
                price, image_url AS image, size, quantity
         FROM cart_items WHERE user_id = ? ORDER BY updated_at DESC`, [user.userId]
      );
      return res.status(200).json({ success: true, items: items.map(item => ({ ...item, productId: Number(item.productId), price: Number(item.price), quantity: Number(item.quantity) })) });
    }

    if (req.method === 'DELETE') {
      const { cartId } = req.body || {};
      if (cartId) await query('DELETE FROM cart_items WHERE user_id = ? AND cart_id = ?', [user.userId, cartId]);
      else await query('DELETE FROM cart_items WHERE user_id = ?', [user.userId]);
    } else {
      const { cartId, productId, name, price, image, size, quantity } = req.body || {};
      if (!cartId || !Number.isInteger(Number(productId)) || !name || !size || Number(quantity) < 1 || Number(quantity) > 99) {
        return res.status(400).json({ error: 'Cart item is incomplete' });
      }
      await query(
        `INSERT INTO cart_items (user_id, cart_id, product_id, product_name, price, image_url, size, quantity)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE product_name=VALUES(product_name), price=VALUES(price), image_url=VALUES(image_url), quantity=VALUES(quantity)`,
        [user.userId, cartId, Number(productId), name, Number(price), image || null, size, Number(quantity)]
      );
    }
    const items = await query('SELECT cart_id AS cartId, product_id AS productId, product_name AS name, price, image_url AS image, size, quantity FROM cart_items WHERE user_id = ?', [user.userId]);
    return res.status(200).json({ success: true, items: items.map(item => ({ ...item, productId: Number(item.productId), price: Number(item.price), quantity: Number(item.quantity) })) });
  } catch (error) {
    console.error('[cart]', error);
    return res.status(500).json({ error: 'Failed to manage cart', detail: error instanceof Error ? error.message : 'Database error' });
  }
}
