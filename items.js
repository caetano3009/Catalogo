const express       = require('express');
const db            = require('../database');
const { requireAuth } = require('../middleware/auth');
const router        = express.Router();

const VALID_TYPES  = ['filme','jogo','anime','manga','livro','desenho'];
const VALID_STATUS = ['concluido','assistindo','quero','abandonado'];

function validate(body) {
  const errors = [];
  if (!body.title || !String(body.title).trim()) errors.push('title obrigatório');
  if (!VALID_TYPES.includes(body.type))           errors.push('type inválido');
  if (!VALID_STATUS.includes(body.status))        errors.push('status inválido');
  const r = Number(body.rating);
  if (!r || r < 1 || r > 5)                       errors.push('rating deve ser 1-5');
  return errors;
}

// GET /api/items
router.get('/', requireAuth, (req, res) => {
  try {
    const uid  = req.session.userId;
    const { type, status, sort = 'recent' } = req.query;
    const sorts = { recent: 'created_at DESC', rating: 'rating DESC, created_at DESC', name: 'title COLLATE NOCASE ASC' };
    const order = sorts[sort] || sorts.recent;

    let sql    = 'SELECT * FROM items WHERE user_id = ?';
    const p    = [uid];
    if (type   && VALID_TYPES.includes(type))   { sql += ' AND type = ?';   p.push(type); }
    if (status && VALID_STATUS.includes(status)) { sql += ' AND status = ?'; p.push(status); }
    sql += ` ORDER BY ${order}`;

    res.json(db.prepare(sql).all(...p));
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// GET /api/items/:id
router.get('/:id', requireAuth, (req, res) => {
  const item = db.prepare('SELECT * FROM items WHERE id = ? AND user_id = ?').get(req.params.id, req.session.userId);
  if (!item) return res.status(404).json({ error: 'Item não encontrado' });
  res.json(item);
});

// POST /api/items
router.post('/', requireAuth, (req, res) => {
  const errors = validate(req.body);
  if (errors.length) return res.status(400).json({ errors });
  try {
    const { title, type, year, status, rating, comment } = req.body;
    const r = db.prepare(`
      INSERT INTO items (user_id, title, type, year, status, rating, comment)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(req.session.userId, String(title).trim(), type, year || null, status, Number(rating), comment || null);
    res.status(201).json(db.prepare('SELECT * FROM items WHERE id = ?').get(r.lastInsertRowid));
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// PUT /api/items/:id
router.put('/:id', requireAuth, (req, res) => {
  const existing = db.prepare('SELECT * FROM items WHERE id = ? AND user_id = ?').get(req.params.id, req.session.userId);
  if (!existing) return res.status(404).json({ error: 'Item não encontrado' });
  const errors = validate(req.body);
  if (errors.length) return res.status(400).json({ errors });
  try {
    const { title, type, year, status, rating, comment } = req.body;
    db.prepare(`
      UPDATE items SET title=?,type=?,year=?,status=?,rating=?,comment=?,updated_at=CURRENT_TIMESTAMP
      WHERE id=? AND user_id=?
    `).run(String(title).trim(), type, year || null, status, Number(rating), comment || null, req.params.id, req.session.userId);
    res.json(db.prepare('SELECT * FROM items WHERE id = ?').get(req.params.id));
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// DELETE /api/items/:id
router.delete('/:id', requireAuth, (req, res) => {
  const existing = db.prepare('SELECT id FROM items WHERE id = ? AND user_id = ?').get(req.params.id, req.session.userId);
  if (!existing) return res.status(404).json({ error: 'Item não encontrado' });
  db.prepare('DELETE FROM items WHERE id = ? AND user_id = ?').run(req.params.id, req.session.userId);
  res.json({ ok: true });
});

// GET /api/items/stats/summary
router.get('/stats/summary', requireAuth, (req, res) => {
  try {
    const uid = req.session.userId;
    const total    = db.prepare('SELECT COUNT(*) as n FROM items WHERE user_id=?').get(uid).n;
    const avgRaw   = db.prepare('SELECT AVG(rating) as a FROM items WHERE user_id=? AND rating>0').get(uid).a;
    const byType   = {};
    const byStatus = {};
    db.prepare('SELECT type, COUNT(*) as n FROM items WHERE user_id=? GROUP BY type').all(uid).forEach(r => byType[r.type] = r.n);
    db.prepare('SELECT status, COUNT(*) as n FROM items WHERE user_id=? GROUP BY status').all(uid).forEach(r => byStatus[r.status] = r.n);
    res.json({ total, avg_rating: avgRaw, by_type: byType, by_status: byStatus });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
