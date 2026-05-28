// ============================================================
// ui.js — Renderização de componentes
// ============================================================

const TYPES = {
  filme:   { label: 'Filme',   icon: '🎬', bg: 'var(--t-filme-bg)',   bc: 'var(--t-filme-bc)',   tc: 'var(--t-filme-tc)'   },
  jogo:    { label: 'Jogo',    icon: '🎮', bg: 'var(--t-jogo-bg)',    bc: 'var(--t-jogo-bc)',    tc: 'var(--t-jogo-tc)'    },
  anime:   { label: 'Anime',   icon: '📺', bg: 'var(--t-anime-bg)',   bc: 'var(--t-anime-bc)',   tc: 'var(--t-anime-tc)'   },
  manga:   { label: 'Mangá',   icon: '📖', bg: 'var(--t-manga-bg)',   bc: 'var(--t-manga-bc)',   tc: 'var(--t-manga-tc)'   },
  livro:   { label: 'Livro',   icon: '📚', bg: 'var(--t-livro-bg)',   bc: 'var(--t-livro-bc)',   tc: 'var(--t-livro-tc)'   },
  desenho: { label: 'Desenho', icon: '🖼️', bg: 'var(--t-desenho-bg)', bc: 'var(--t-desenho-bc)', tc: 'var(--t-desenho-tc)' },
};

const STATUS_COLORS = {
  concluido:  'var(--s-concluido)',
  assistindo: 'var(--s-assistindo)',
  quero:      'var(--s-quero)',
  abandonado: 'var(--s-abandonado)',
};

const STATUS_LABELS = {
  concluido:  'Concluído',
  assistindo: 'Em andamento',
  quero:      'Quero ver',
  abandonado: 'Abandonado',
};

// ── Stars ──────────────────────────────────────────────────────

function renderStars(rating, size = 10) {
  return [1, 2, 3, 4, 5]
    .map(s => `<span class="star${s <= rating ? '' : ' empty'}" style="font-size:${size}px;">★</span>`)
    .join('');
}

// ── Card ───────────────────────────────────────────────────────

function renderCard(item, onClickFn) {
  const t  = TYPES[item.type] || TYPES.filme;
  const sc = STATUS_COLORS[item.status] || 'var(--s-quero)';

  const card = document.createElement('div');
  card.className = 'card';
  card.setAttribute('role', 'listitem');
  card.setAttribute('tabindex', '0');
  card.setAttribute('aria-label', `${item.title} — ${STATUS_LABELS[item.status]}`);
  card.dataset.id = item.id;

  card.innerHTML = `
    <div class="card-cover" style="background:${t.bg};">
      <span aria-hidden="true">${t.icon}</span>
      <div class="card-type-badge"
           style="background:${t.bg}; color:${t.tc}; border-color:${t.bc};">
        ${t.label}
      </div>
      <div class="card-status-dot" style="background:${sc}; color:${sc};" aria-hidden="true"></div>
    </div>
    <div class="card-body">
      <div class="card-title">${escHtml(item.title)}</div>
      <div class="card-meta">${item.year || '—'} · ${STATUS_LABELS[item.status]}</div>
      <div class="card-stars">
        ${renderStars(item.rating)}
        <span class="card-score">${item.rating}.0</span>
      </div>
    </div>
  `;

  card.addEventListener('click', () => onClickFn(item));
  card.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') onClickFn(item); });

  return card;
}

// ── Grid ───────────────────────────────────────────────────────

function renderGrid(items, onCardClick) {
  const grid  = document.getElementById('grid');
  const count = document.getElementById('content-count');
  grid.innerHTML = '';
  count.textContent = `· ${items.length} ${items.length === 1 ? 'item' : 'itens'}`;

  if (!items.length) {
    grid.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">🔍</div>
        <div class="empty-text">Nenhum item encontrado</div>
      </div>`;
    return;
  }

  items.forEach(item => grid.appendChild(renderCard(item, onCardClick)));
}

// ── Detail modal body ──────────────────────────────────────────

function renderDetailBody(item) {
  const t  = TYPES[item.type] || TYPES.filme;
  const sc = STATUS_COLORS[item.status] || 'var(--s-quero)';
  return `
    <div class="detail-cover" style="background:${t.bg};" aria-hidden="true">${t.icon}</div>
    <div class="detail-meta-row">
      <span class="detail-badge" style="background:${t.bg}; color:${t.tc}; border-color:${t.bc};">${t.label}</span>
      <span class="sdot" style="--dc:${sc};" aria-hidden="true"></span>
      <span style="font-size:12px; font-weight:600; color:${sc};">${STATUS_LABELS[item.status]}</span>
      ${item.year ? `<span class="detail-year">${item.year}</span>` : ''}
    </div>
    <div class="card-stars" style="margin-bottom:4px;">
      ${renderStars(item.rating, 15)}
      <span class="card-score" style="font-size:12px; margin-left:6px;">${item.rating}.0 / 5</span>
    </div>
    ${item.comment ? `<div class="detail-comment">"${escHtml(item.comment)}"</div>` : ''}
  `;
}

// ── Stats ──────────────────────────────────────────────────────

function renderStats(stats) {
  const el = document.getElementById('stats-grid');
  const t  = stats.by_type   || {};
  const s  = stats.by_status || {};

  const cards = [
    { label: 'Total',        value: stats.total || 0,             sub: 'na coleção' },
    { label: 'Concluídos',   value: s.concluido  || 0,            sub: '✅' },
    { label: 'Em andamento', value: s.assistindo || 0,            sub: '🔵' },
    { label: 'Quero ver',    value: s.quero      || 0,            sub: '🟡' },
    { label: 'Nota média',   value: stats.avg_rating ? stats.avg_rating.toFixed(1) : '—', sub: '★ geral' },
    { label: 'Filmes',    value: t.filme   || 0, sub: '🎬' },
    { label: 'Jogos',     value: t.jogo    || 0, sub: '🎮' },
    { label: 'Animes',    value: t.anime   || 0, sub: '📺' },
    { label: 'Mangás',    value: t.manga   || 0, sub: '📖' },
    { label: 'Livros',    value: t.livro   || 0, sub: '📚' },
    { label: 'Desenhos',  value: t.desenho || 0, sub: '🖼️' },
  ];

  el.innerHTML = cards.map(c => `
    <div class="stat-card">
      <div class="stat-label">${c.label}</div>
      <div class="stat-value">${c.value}</div>
      <div class="stat-sub">${c.sub}</div>
    </div>
  `).join('');
}

// ── Toast ──────────────────────────────────────────────────────

function showToast(msg, duration = 2600) {
  const t = document.createElement('div');
  t.className = 'toast';
  t.textContent = msg;
  document.body.appendChild(t);
  setTimeout(() => t.remove(), duration);
}

// ── Escape ─────────────────────────────────────────────────────

function escHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
