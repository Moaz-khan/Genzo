// api/orders/create.js
// POST /api/orders/create
// Headers: Authorization: Bearer <token>
// Body: { orderNumber, shippingInfo, paymentMethod, items, subtotal, shippingFee, total }
// Saves full order + all items to TiDB

import { query } from '../_db.js';
import { requireUser, setCors } from '../_auth.js';

export default async function handler(req, res) {
  setCors(res, 'POST, OPTIONS');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const decoded = await requireUser(req, res);
  if (!decoded) {
    return res.status(401).json({ error: 'Unauthorized. Please log in or continue as guest.' });
  }

  try {
    const { orderNumber, shippingInfo, paymentMethod } = req.body;
    const allowedPayments = new Set(['cod', 'jazzcash', 'easypaisa', 'bank', 'card']);
    if (!allowedPayments.has(paymentMethod)) return res.status(400).json({ error: 'Unsupported payment method' });
    if (!orderNumber || !/^GZ-[0-9]{6}$/.test(orderNumber) || !shippingInfo?.address || !shippingInfo?.city || !shippingInfo?.province) {
      return res.status(400).json({ error: 'Shipping and order details are incomplete' });
    }

    const storedItems = await query(
      `SELECT product_id AS productId, product_name AS name, image_url AS image, size, price, quantity
       FROM cart_items WHERE user_id = ?`, [decoded.userId]
    );
    const items = storedItems.map(item => ({ ...item, productId: Number(item.productId), price: Number(item.price), quantity: Number(item.quantity) }));
    const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const shippingFee = subtotal >= 5000 ? 0 : 250;
    const total = subtotal + shippingFee;

    if (!items.length) {
      return res.status(400).json({ error: 'Order details are incomplete' });
    }

    const userId = decoded.userId;
    const addressLines = [shippingInfo.address];
    if (shippingInfo.city) addressLines.push(shippingInfo.city);
    if (shippingInfo.province) addressLines.push(shippingInfo.province);
    if (shippingInfo.postalCode) addressLines.push(shippingInfo.postalCode);
    let shippingAddress = addressLines.join(', ');
    if (shippingInfo.notes) shippingAddress += ` (Notes: ${shippingInfo.notes})`;

    // Insert order
    await query(
      `INSERT INTO orders
         (order_number, user_id, guest_name, guest_email, guest_phone,
          shipping_address, city, province, postal_code,
          payment_method, subtotal, shipping_fee, total_amount, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'processing')`,
      [
        orderNumber,
        userId,
        `${shippingInfo.firstName} ${shippingInfo.lastName}`.trim(),
        shippingInfo.email || null,
        shippingInfo.phone || null,
        shippingAddress,
        shippingInfo.city,
        shippingInfo.province,
        shippingInfo.postalCode || null,
        paymentMethod,
        subtotal,
        shippingFee,
        total,
      ]
    );

    // Insert order items
    for (const item of items) {
      await query(
        `INSERT INTO order_items
           (order_number, product_id, product_name, image_url, size, price, quantity)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          orderNumber,
          item.productId,
          item.name,
          item.image || null,
          item.size || 'One Size',
          item.price,
          item.quantity,
        ]
      );
    }

    await query('DELETE FROM cart_items WHERE user_id = ?', [userId]);

    return res.status(201).json({
      success: true,
      orderNumber,
      message: 'Order placed successfully!',
    });

  } catch (err) {
    console.error('[create-order]', err);
    return res.status(500).json({ error: 'Failed to save order. Please try again.' });
  }
}
