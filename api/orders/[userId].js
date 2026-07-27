// api/orders/[userId].js
// GET /api/orders/:userId
// Headers: Authorization: Bearer <token>
// Returns all orders for a user with their items

import { query } from '../_db.js';
import { requireUser, setCors } from '../_auth.js';


export default async function handler(req, res) {
  setCors(res, 'GET, OPTIONS');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  const decoded = await requireUser(req, res);
  if (!decoded) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const { userId } = req.query;

  // Security: users can only fetch their own orders
  if (decoded.userId !== userId) {
    return res.status(403).json({ error: 'Forbidden' });
  }

  try {
    // Get all orders for this user
    const orders = await query(
      `SELECT order_number, status, total_amount, shipping_fee, payment_method, created_at
       FROM orders
       WHERE user_id = ?
       ORDER BY created_at DESC`,
      [userId]
    );

    // Get all items for these orders
    const result = [];
    for (const order of orders) {
      const items = await query(
        `SELECT product_id, product_name, image_url, size, price, quantity
         FROM order_items WHERE order_number = ?`,
        [order.order_number]
      );

      result.push({
        orderNumber: order.order_number,
        status: order.status,
        total: parseFloat(order.total_amount),
        shipping: parseFloat(order.shipping_fee),
        paymentMethod: order.payment_method,
        date: new Date(order.created_at).toLocaleDateString('en-GB', {
          day: 'numeric', month: 'short', year: 'numeric'
        }),
        items: items.map(item => ({
          productId: item.product_id,
          name: item.product_name,
          image: item.image_url,
          size: item.size,
          price: parseFloat(item.price),
          quantity: item.quantity,
          cartId: `${item.product_id}_${item.size}`,
        })),
      });
    }

    return res.status(200).json({ success: true, orders: result });

  } catch (err) {
    console.error('[get-orders]', err);
    return res.status(500).json({ error: 'Failed to fetch orders.' });
  }
}
