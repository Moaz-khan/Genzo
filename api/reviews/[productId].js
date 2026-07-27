import { query } from '../_db.js';
import { requireUser, setCors } from '../_auth.js';

export default async function handler(req, res) {
  setCors(res, 'GET, POST, OPTIONS');
  if (req.method === 'OPTIONS') return res.status(204).end();
  if (!['GET', 'POST'].includes(req.method)) return res.status(405).json({ error: 'Method not allowed' });
  const productId = Number(req.query.productId);
  if (!Number.isInteger(productId)) return res.status(400).json({ error: 'Invalid product id' });
  try {
    await query(`CREATE TABLE IF NOT EXISTS product_reviews (id BIGINT AUTO_INCREMENT PRIMARY KEY, product_id INT NOT NULL, user_id VARCHAR(80) NOT NULL, rating TINYINT NOT NULL, review_text TEXT NOT NULL, status VARCHAR(30) NOT NULL DEFAULT 'approved', created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP, UNIQUE KEY one_review_per_user (product_id, user_id))`);
    if (req.method === 'GET') {
      const reviews = await query(`SELECT r.id, r.rating, r.review_text AS text, r.created_at AS date, u.name FROM product_reviews r JOIN users u ON u.user_id = r.user_id WHERE r.product_id = ? AND r.status = 'approved' ORDER BY r.created_at DESC`, [productId]);
      return res.status(200).json({ success: true, reviews });
    }
    const user = await requireUser(req, res);
    if (!user) return;
    const rating = Number(req.body?.rating);
    const text = req.body?.text?.trim();
    if (!Number.isInteger(rating) || rating < 1 || rating > 5 || !text || text.length > 2000) return res.status(400).json({ error: 'Rating and review text are required' });
    const purchased = await query(`SELECT oi.id FROM order_items oi JOIN orders o ON o.order_number = oi.order_number WHERE o.user_id = ? AND oi.product_id = ? LIMIT 1`, [user.userId, productId]);
    if (!purchased.length) return res.status(403).json({ error: 'You can review products you ordered only' });
    await query('INSERT INTO product_reviews (product_id, user_id, rating, review_text) VALUES (?, ?, ?, ?)', [productId, user.userId, rating, text]);
    return res.status(201).json({ success: true });
  } catch (error) {
    if (error?.code === 'ER_DUP_ENTRY') return res.status(409).json({ error: 'You already reviewed this product' });
    console.error('[reviews]', error);
    return res.status(500).json({ error: 'Could not manage reviews' });
  }
}
