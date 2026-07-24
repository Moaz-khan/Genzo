// api/orders/create.js
// POST /api/orders/create
// Headers: Authorization: Bearer <token>
// Body: { orderNumber, shippingInfo, paymentMethod, items, subtotal, shippingFee, total }
// Saves full order + all items to TiDB

import { query } from '../_db.js';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret_change_me';

function verifyToken(req) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) return null;
  try {
    return jwt.verify(authHeader.split(' ')[1], JWT_SECRET);
  } catch {
    return null;
  }
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const decoded = verifyToken(req);
  if (!decoded) {
    return res.status(401).json({ error: 'Unauthorized. Please log in or continue as guest.' });
  }

  try {
    const {
      orderNumber,
      shippingInfo,       // { firstName, lastName, email, phone, address, city, province, postalCode, notes }
      paymentMethod,
      items,              // [{ productId, name, image, size, price, quantity }]
      subtotal,
      shippingFee,
      total,
    } = req.body;

    if (!orderNumber || !items || items.length === 0) {
      return res.status(400).json({ error: 'Order details are incomplete' });
    }

    const userId = decoded.userId;
    const shippingAddress = `${shippingInfo.address}, ${shippingInfo.notes || ''}`.trim();

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
