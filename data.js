// ============================================================
// data.js — Persistência via localStorage (GitHub Pages ready)
// ============================================================

const STORAGE_KEY = 'medialog_items';

const SEED_DATA = [
  { id: 1, title: 'Oppenheimer',        type: 'filme',  year: '2023', status: 'concluido',  rating: 5, comment: 'Obra-prima de Nolan.' },
  { id: 2, title: 'Dune Parte 2',       type: 'filme',  year: '2024', status: 'concluido',  rating: 4, comment: '' },
  { id: 3, title: 'Elden Ring',         type: 'jogo',   year: '2022', status: 'concluido',  rating: 5, comment: 'O melhor souls já feito.' },
  { id: 4, title: 'Hollow Knight',      type: 'jogo',   year: '2017', status: 'assistindo', rating: 4, comment: '' },
  { id: 5, title: 'Frieren',            type: 'anime',  year: '2023', status: 'concluido',  rating: 5, comment: 'Arte linda, surpreendeu demais.' },
  { id: 6, title: 'Vinland Saga',       type: 'anime',  year: '2019', status: 'assistindo', rating: 4, comment: '' },
  { id: 7, title: 'Berserk',            type: 'manga',  year: '1989', status: 'assistindo', rating: 5, comment: '' },
  { id: 8, title: 'O Senhor dos Anéis', type: 'livro',  year: '1954', status: 'concluido',  rating: 5, comment: 'Clássico eterno.' },
];

const DB = {
  _nextId: null,

  _load() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) return JSON.parse(raw);
    } catch (_) {}
    return null;
  },

  _save(items) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch (_) {}
  },

  _getNextId(items) {
    if (!items.length) return 1;
    return Math.max(...items.map(i => i.id)) + 1;
  },

  getAll(filters = {}) {
    let items = this._load() || SEED_DATA;

    // Seed once
    if (!this._load()) this._save(SEED_DATA);

    if (filters.type   && filters.type   !== 'all') items = items.filter(i => i.type   === filters.type);
    if (filters.status && filters.status !== 'all') items = items.filter(i => i.status === filters.status);

    const sort = filters.sort || 'recent';
    if (sort === 'rating') items = [...items].sort((a, b) => b.rating - a.rating || b.id - a.id);
    else if (sort === 'name') items = [...items].sort((a, b) => a.title.localeCompare(b.title, 'pt'));
    else items = [...items].sort((a, b) => b.id - a.id); // recent

    return items;
  },

  getById(id) {
    const items = this._load() || SEED_DATA;
    return items.find(i => i.id === Number(id)) || null;
  },

  create(data) {
    const items = this._load() || SEED_DATA;
    const item  = { ...data, id: this._getNextId(items), createdAt: Date.now() };
    items.unshift(item);
    this._save(items);
    return item;
  },

  update(id, data) {
    const items = this._load() || SEED_DATA;
    const idx   = items.findIndex(i => i.id === Number(id));
    if (idx === -1) return null;
    items[idx] = { ...items[idx], ...data, id: Number(id) };
    this._save(items);
    return items[idx];
  },

  remove(id) {
    let items = this._load() || SEED_DATA;
    items     = items.filter(i => i.id !== Number(id));
    this._save(items);
    return true;
  },

  getStats() {
    const all = this._load() || SEED_DATA;
    const byType   = {};
    const byStatus = {};
    let   ratingSum = 0, ratingCount = 0;

    all.forEach(i => {
      byType[i.type]     = (byType[i.type]     || 0) + 1;
      byStatus[i.status] = (byStatus[i.status] || 0) + 1;
      if (i.rating > 0) { ratingSum += i.rating; ratingCount++; }
    });

    return {
      total:      all.length,
      avg_rating: ratingCount ? ratingSum / ratingCount : 0,
      by_type:    byType,
      by_status:  byStatus,
    };
  },
};
