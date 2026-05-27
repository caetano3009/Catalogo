// ============================================================
// database.js — Configuração e inicialização do banco SQLite
// ============================================================

const Database = require('better-sqlite3');
const path     = require('path');

const DB_PATH = path.join(__dirname, '..', 'database', 'medialog.db');

// Abre (ou cria) o arquivo do banco
const db = new Database(DB_PATH, {
  // verbose: console.log,  // descomente para ver as queries no terminal
});

// Ativa WAL para melhor performance em leitura/escrita simultânea
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

// ── Schema ───────────────────────────────────────────────────

db.exec(`
  CREATE TABLE IF NOT EXISTS items (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    title      TEXT    NOT NULL,
    type       TEXT    NOT NULL CHECK(type IN ('filme','jogo','anime','manga','livro','desenho')),
    year       TEXT,
    status     TEXT    NOT NULL CHECK(status IN ('concluido','assistindo','quero','abandonado'))
                       DEFAULT 'quero',
    rating     INTEGER NOT NULL DEFAULT 3 CHECK(rating BETWEEN 1 AND 5),
    comment    TEXT,
    created_at TEXT    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT    NOT NULL DEFAULT CURRENT_TIMESTAMP
  );

  CREATE INDEX IF NOT EXISTS idx_items_type   ON items(type);
  CREATE INDEX IF NOT EXISTS idx_items_status ON items(status);
  CREATE INDEX IF NOT EXISTS idx_items_rating ON items(rating DESC);
`);

// ── Seed (dados de exemplo na primeira execução) ─────────────

const count = db.prepare('SELECT COUNT(*) as n FROM items').get().n;

if (count === 0) {
  const insert = db.prepare(`
    INSERT INTO items (title, type, year, status, rating, comment)
    VALUES (@title, @type, @year, @status, @rating, @comment)
  `);

  const seed = db.transaction(items => items.forEach(i => insert.run(i)));

  seed([
    { title: 'Oppenheimer',         type: 'filme',  year: '2023', status: 'concluido',  rating: 5, comment: 'Obra-prima de Nolan. Cinematografia absurda.' },
    { title: 'Dune Parte 2',        type: 'filme',  year: '2024', status: 'concluido',  rating: 4, comment: null },
    { title: 'Elden Ring',          type: 'jogo',   year: '2022', status: 'concluido',  rating: 5, comment: 'O melhor souls já feito.' },
    { title: 'Hollow Knight',       type: 'jogo',   year: '2017', status: 'assistindo', rating: 4, comment: null },
    { title: 'Frieren',             type: 'anime',  year: '2023', status: 'concluido',  rating: 5, comment: 'Surpreendeu demais. Arte linda.' },
    { title: 'Vinland Saga',        type: 'anime',  year: '2019', status: 'assistindo', rating: 4, comment: null },
    { title: 'Berserk',             type: 'manga',  year: '1989', status: 'assistindo', rating: 5, comment: null },
    { title: 'O Senhor dos Anéis',  type: 'livro',  year: '1954', status: 'concluido',  rating: 5, comment: 'Clássico eterno.' },
  ]);

  console.log('✅ Banco criado com dados de exemplo.');
}

module.exports = db;
