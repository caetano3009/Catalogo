const express  = require('express');
const bcrypt   = require('bcryptjs');
const db       = require('../database');
const router   = express.Router();

// POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const username = String(req.body.username || '').trim();
    const password = String(req.body.password || '');

    if (!username || username.length < 3)
      return res.status(400).json({ error: 'Nome de usuário deve ter ao menos 3 caracteres' });
    if (!/^[a-zA-Z0-9_]+$/.test(username))
      return res.status(400).json({ error: 'Use apenas letras, números e _' });
    if (!password || password.length < 6)
      return res.status(400).json({ error: 'Senha deve ter ao menos 6 caracteres' });

    const exists = db.prepare('SELECT id FROM users WHERE username = ?').get(username);
    if (exists) return res.status(409).json({ error: 'Nome de usuário já em uso' });

    const hash   = await bcrypt.hash(password, 10);
    const result = db.prepare('INSERT INTO users (username, password) VALUES (?, ?)').run(username, hash);

    req.session.userId   = result.lastInsertRowid;
    req.session.username = username;

    res.status(201).json({ id: result.lastInsertRowid, username });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const username = String(req.body.username || '').trim();
    const password = String(req.body.password || '');

    const user = db.prepare('SELECT * FROM users WHERE username = ?').get(username);
    if (!user) return res.status(401).json({ error: 'Usuário ou senha inválidos' });

    const ok = await bcrypt.compare(password, user.password);
    if (!ok) return res.status(401).json({ error: 'Usuário ou senha inválidos' });

    req.session.userId   = user.id;
    req.session.username = user.username;

    res.json({ id: user.id, username: user.username });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/auth/logout
router.post('/logout', (req, res) => {
  req.session.destroy(() => res.json({ ok: true }));
});

// GET /api/auth/me
router.get('/me', (req, res) => {
  if (req.session && req.session.userId)
    return res.json({ id: req.session.userId, username: req.session.username });
  res.status(401).json({ error: 'Não autenticado' });
});

module.exports = router;
