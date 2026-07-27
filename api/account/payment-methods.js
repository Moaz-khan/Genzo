import { query } from '../_db.js';
import { requireUser, setCors } from '../_auth.js';

export default async function handler(req, res) {
  setCors(res, 'GET, POST, DELETE, OPTIONS');
  if (req.method === 'OPTIONS') return res.status(204).end();
  if (!['GET', 'POST', 'DELETE'].includes(req.method)) return res.status(405).json({ error: 'Method not allowed' });
  const user = await requireUser(req, res);
  if (!user) return;

  try {
    if (req.method === 'GET') {
      const methods = await query(
        `SELECT id, method_type AS methodType, brand, last4, label, is_default AS isDefault
         FROM saved_payment_methods WHERE user_id = ? ORDER BY is_default DESC, id DESC`, [user.userId]
      );
      return res.status(200).json({ success: true, methods });
    }
    if (user.provider === 'guest') return res.status(403).json({ error: 'Guests cannot save payment methods' });

    if (req.method === 'DELETE') {
      const id = Number(req.query.id);
      if (!Number.isInteger(id)) return res.status(400).json({ error: 'Payment method id is required' });
      await query('DELETE FROM saved_payment_methods WHERE id = ? AND user_id = ?', [id, user.userId]);
      return res.status(200).json({ success: true });
    }

    // Never accept or store card number, expiry, or CVC. A payment provider must
    // return a provider token plus non-sensitive display metadata.
    const { provider, providerToken, brand, last4, label, isDefault } = req.body || {};
    if (!provider || !providerToken || !/^[0-9]{4}$/.test(String(last4 || ''))) {
      return res.status(400).json({ error: 'Use a payment-provider token and last four digits' });
    }
    if (isDefault) await query('UPDATE saved_payment_methods SET is_default = 0 WHERE user_id = ?', [user.userId]);
    await query(
      `INSERT INTO saved_payment_methods (user_id, provider, provider_token, method_type, brand, last4, label, is_default)
       VALUES (?, ?, ?, 'card', ?, ?, ?, ?)`,
      [user.userId, provider, providerToken, brand || 'Card', String(last4), label || `${brand || 'Card'} ending in ${last4}`, isDefault ? 1 : 0]
    );
    return res.status(201).json({ success: true });
  } catch (error) {
    console.error('[payment-methods]', error);
    return res.status(500).json({ error: 'Could not manage payment methods' });
  }
}
