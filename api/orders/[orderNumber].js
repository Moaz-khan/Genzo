import { query } from '../_db.js';
import { requireUser, setCors } from '../_auth.js';

export default async function handler(req, res) {
  setCors(res, 'GET, PATCH, OPTIONS');
  if (req.method === 'OPTIONS') return res.status(204).end();
  if (!['GET', 'PATCH'].includes(req.method)) return res.status(405).json({ error: 'Method not allowed' });
  const user = await requireUser(req, res);
  if (!user) return;
  const orderNumber = req.query.orderNumber;

  try {
    const orders = await query(
      `SELECT order_number, status, guest_name, guest_email, guest_phone, shipping_address,
              city, province, postal_code, payment_method, subtotal, shipping_fee, total_amount, created_at
       FROM orders WHERE order_number = ? AND user_id = ?`, [orderNumber, user.userId]
    );
    if (!orders.length) return res.status(404).json({ error: 'Order not found' });
    const order = orders[0];
    if (req.method === 'PATCH') {
      if (req.body?.status !== 'cancelled' || !['pending', 'processing'].includes(order.status)) {
        return res.status(400).json({ error: 'This order cannot be cancelled' });
      }
      await query('UPDATE orders SET status = ? WHERE order_number = ? AND user_id = ?', ['cancelled', orderNumber, user.userId]);
      return res.status(200).json({ success: true, status: 'cancelled' });
    }
    const items = await query(
      `SELECT product_id AS productId, product_name AS name, image_url AS image, size, price, quantity
       FROM order_items WHERE order_number = ?`, [orderNumber]
    );
    return res.status(200).json({ success: true, order: {
      orderNumber: order.order_number, status: order.status, total: Number(order.total_amount), shipping: Number(order.shipping_fee), subtotal: Number(order.subtotal), paymentMethod: order.payment_method,
      shippingInfo: { name: order.guest_name, email: order.guest_email, phone: order.guest_phone, address: order.shipping_address, city: order.city, province: order.province, postalCode: order.postal_code },
      date: new Date(order.created_at).toISOString(), items: items.map(item => ({ ...item, productId: Number(item.productId), price: Number(item.price), quantity: Number(item.quantity), cartId: `${item.productId}_${item.size}` })),
    }});
  } catch (error) {
    console.error('[order-detail]', error);
    return res.status(500).json({ error: 'Could not load order' });
  }
}
