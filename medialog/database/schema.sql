-- ============================================================
-- schema.sql — Estrutura do banco de dados Medialog
-- ============================================================
-- O banco é criado automaticamente pelo backend (database.js).
-- Este arquivo serve como referência e documentação.
-- ============================================================

-- Tabela principal de itens da coleção
CREATE TABLE IF NOT EXISTS items (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,

  -- Dados da obra
  title      TEXT    NOT NULL,
  type       TEXT    NOT NULL
               CHECK(type IN ('filme', 'jogo', 'anime', 'manga', 'livro', 'desenho')),
  year       TEXT,                         -- Ano de lançamento (opcional)

  -- Dados do usuário sobre a obra
  status     TEXT    NOT NULL
               CHECK(status IN ('concluido', 'assistindo', 'quero', 'abandonado'))
               DEFAULT 'quero',
  rating     INTEGER NOT NULL DEFAULT 3
               CHECK(rating BETWEEN 1 AND 5),
  comment    TEXT,                         -- Comentário/review (opcional)

  -- Controle
  created_at TEXT    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT    NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Índices para filtros e ordenação rápidos
CREATE INDEX IF NOT EXISTS idx_items_type       ON items(type);
CREATE INDEX IF NOT EXISTS idx_items_status     ON items(status);
CREATE INDEX IF NOT EXISTS idx_items_rating     ON items(rating DESC);
CREATE INDEX IF NOT EXISTS idx_items_created_at ON items(created_at DESC);

-- ============================================================
-- Exemplos de queries úteis
-- ============================================================

-- Buscar todos os itens de um tipo
-- SELECT * FROM items WHERE type = 'anime' ORDER BY created_at DESC;

-- Buscar itens concluídos com nota 5
-- SELECT * FROM items WHERE status = 'concluido' AND rating = 5;

-- Contagem por tipo
-- SELECT type, COUNT(*) as total FROM items GROUP BY type;

-- Média de notas
-- SELECT AVG(rating) as media FROM items WHERE rating > 0;

-- Itens adicionados nos últimos 30 dias
-- SELECT * FROM items WHERE created_at >= datetime('now', '-30 days');
