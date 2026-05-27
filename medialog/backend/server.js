// ============================================================
// server.js — Backend Medialog (Node.js + Express + SQLite)
// ============================================================
// Instalar dependências: npm install
// Rodar: node server.js  ou  npm start
// ============================================================

const express  = require('express');
const cors     = require('cors');
const path     = require('path');
const db       = require('./database');

const app  = express();
const PORT = process.env.PORT || 3000;

// ── Middlewares ──────────────────────────────────────────────

app.use(cors());
app.use(express.json());

// Serve o frontend estático
app.use(express.static(path.join(__dirname, '..', 'frontend')));

// ── Helpers ──────────────────────────────────────────────────

const VALID_TYPES   = ['filme', 'jogo', 'anime', 'manga', 'livro', 'desenho'];
const VALID_STATUS  = ['concluido', 'assistindo', 'quero', 'abandonado'];
const VALID_SORTS   = ['recent', 'rating', 'name'];

function validate(body) {
  const errors = [];
  if (!body.title || String(body.title).trim() === '')
    errors.push('title é obrigatório');
  if (!VALID_TYPES.includes(body.type))
    errors.push(`type inválido. Use: ${VALID_TYPES.join(', ')}`);
  if (!VALID_STATUS.includes(body.status))
    errors.push(`status inválido. Use: ${VALID_STATUS.join(', ')}`);
  const rating = Number(body.rating);
  if (!rating || rating < 1 || rating > 5)
    errors.push('rating deve ser entre 1 e 5');
  return errors;
}

// ── Rotas — Items ────────────────────────────────────────────

// GET /api/items?type=&status=&sort=
app.get('/api/items', (req, res) => {
  try {
    const { type, status, sort = 'recent' } = req.query;

    const sortMap = {
      recent: 'created_at DESC',
      rating: 'rating DESC, created_at DESC',
      name:   'title COLLATE NOCASE ASC',
    };

    const orderBy = sortMap[VALID_SORTS.includes(sort) ? sort : 'recent'];

    let sql    = 'SELECT * FROM items WHERE 1=1';
    const params = [];

    if (type && VALID_TYPES.includes(type)) {
      sql += ' AND type = ?';
      params.push(type);
    }
    if (status && VALID_STATUS.includes(status)) {
      sql += ' AND status = ?';
      params.push(status);
    }

    sql += ` ORDER BY ${orderBy}`;

    const items = db.prepare(sql).all(...params);
    res.json(items);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/items/:id
app.get('/api/items/:id', (req, res) => {
  try {
    const item = db.prepare('SELECT * FROM items WHERE id = ?').get(req.params.id);
    if (!item) return res.status(404).json({ error: 'Item não encontrado' });
    res.json(item);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/items
app.post('/api/items', (req, res) => {
  try {
    const errors = validate(req.body);
    if (errors.length) return res.status(400).json({ errors });

    const { title, type, year, status, rating, comment } = req.body;
    const stmt = db.prepare(`
      INSERT INTO items (title, type, year, status, rating, comment)
      VALUES (?, ?, ?, ?, ?, ?)
    `);
    const result = stmt.run(
      String(title).trim(),
      type,
      year ? String(year).trim() : null,
      status,
      Number(rating),
      comment ? String(comment).trim() : null,
    );

    const newItem = db.prepare('SELECT * FROM items WHERE id = ?').get(result.lastInsertRowid);
    res.status(201).json(newItem);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/items/:id
app.put('/api/items/:id', (req, res) => {
  try {
    const existing = db.prepare('SELECT * FROM items WHERE id = ?').get(req.params.id);
    if (!existing) return res.status(404).json({ error: 'Item não encontrado' });

    const errors = validate(req.body);
    if (errors.length) return res.status(400).json({ errors });

    const { title, type, year, status, rating, comment } = req.body;
    db.prepare(`
      UPDATE items
      SET title = ?, type = ?, year = ?, status = ?, rating = ?, comment = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(
      String(title).trim(),
      type,
      year ? String(year).trim() : null,
      status,
      Number(rating),
      comment ? String(comment).trim() : null,
      req.params.id,
    );

    const updated = db.prepare('SELECT * FROM items WHERE id = ?').get(req.params.id);
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/items/:id
app.delete('/api/items/:id', (req, res) => {
  try {
    const existing = db.prepare('SELECT * FROM items WHERE id = ?').get(req.params.id);
    if (!existing) return res.status(404).json({ error: 'Item não encontrado' });

    db.prepare('DELETE FROM items WHERE id = ?').run(req.params.id);
    res.json({ success: true, deleted_id: Number(req.params.id) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── Rota Stats ───────────────────────────────────────────────

// GET /api/stats
app.get('/api/stats', (req, res) => {
  try {
    const total      = db.prepare('SELECT COUNT(*) as n FROM items').get().n;
    const avgRating  = db.prepare('SELECT AVG(rating) as avg FROM items WHERE rating > 0').get().avg;

    const byType = {};
    db.prepare('SELECT type, COUNT(*) as n FROM items GROUP BY type').all()
      .forEach(r => { byType[r.type] = r.n; });

    const byStatus = {};
    db.prepare('SELECT status, COUNT(*) as n FROM items GROUP BY status').all()
      .forEach(r => { byStatus[r.status] = r.n; });

    res.json({ total, avg_rating: avgRating, by_type: byType, by_status: byStatus });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── Fallback SPA ─────────────────────────────────────────────

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'frontend', 'index.html'));
});

// ── Start ─────────────────────────────────────────────────────

app.listen(PORT, () => {
  console.log(`\n🚀 Medialog rodando em http://localhost:${PORT}\n`);
});
