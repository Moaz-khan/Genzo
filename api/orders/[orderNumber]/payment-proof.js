import { query } from '../../_db.js';
import { requireUser, setCors } from '../../_auth.js';

export default async function handler(req, res) {
  setCors(res, 'POST, GET, OPTIONS');
  if (req.method === 'OPTIONS') return res.status(204).end();
  if (!['POST', 'GET'].includes(req.method)) return res.status(405).json({ error: 'Method not allowed' });
  const user = await requireUser(req, res);
  if (!user) return;
  const orderNumber = req.query.orderNumber;

  try {
    const owns = await query('SELECT order_number, guest_name, guest_email, guest_phone, shipping_address, city, province, postal_code FROM orders WHERE order_number = ? AND user_id = ?', [orderNumber, user.userId]);
    if (!owns.length) return res.status(404).json({ error: 'Order not found' });

    if (req.method === 'GET') {
      const rows = await query(`SELECT id, file_name AS fileName, mime_type AS mimeType, file_size AS fileSize, status, created_at AS createdAt FROM payment_proofs WHERE order_number = ? ORDER BY created_at DESC`, [orderNumber]);
      return res.status(200).json({ success: true, proofs: rows });
    }

    const { fileName, mimeType, dataUrl } = req.body || {};
    if (!dataUrl || !/^data:image\/(png|jpeg|jpg|webp);base64,/i.test(dataUrl)) return res.status(400).json({ error: 'A PNG, JPG, or WEBP image is required' });
    const base64 = dataUrl.split(',')[1] || '';
    const fileSize = Math.ceil((base64.length * 3) / 4);
    if (fileSize > 3 * 1024 * 1024) return res.status(413).json({ error: 'Payment proof must be smaller than 3MB' });

    await query(
      `INSERT INTO payment_proofs (order_number, user_id, customer_name, customer_email, customer_phone, shipping_address, city, province, postal_code, file_name, mime_type, file_size, image_data, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending')`,
      [orderNumber, user.userId, owns[0].guest_name, owns[0].guest_email, owns[0].guest_phone, owns[0].shipping_address, owns[0].city, owns[0].province, owns[0].postal_code, String(fileName || 'payment-proof'), String(mimeType || 'image/jpeg'), fileSize, dataUrl]
    );
    return res.status(201).json({ success: true, message: 'Payment proof uploaded for verification' });
  } catch (error) {
    console.error('[payment-proof]', error);
    return res.status(500).json({ error: 'Could not save payment proof' });
  }
}
