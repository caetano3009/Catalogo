/* ============================================================
   ui.js — Renderização e helpers de interface
   ============================================================ */

const TYPES = {
  filme:   { label: 'Filme',   icon: '🎬', bg: '#FCEBEB', textColor: '#A32D2D' },
  jogo:    { label: 'Jogo',    icon: '🎮', bg: '#E6F1FB', textColor: '#185FA5' },
  anime:   { label: 'Anime',   icon: '📺', bg: '#EEEDFE', textColor: '#3C3489' },
  manga:   { label: 'Mangá',   icon: '📖', bg: '#FAECE7', textColor: '#993C1D' },
  livro:   { label: 'Livro',   icon: '📚', bg: '#E1F5EE', textColor: '#085041' },
  desenho: { label: 'Desenho', icon: '🖼️', bg: '#FBEAF0', textColor: '#72243E' },
};

const STATUS_COLORS = {
  concluido:  '#1D9E75',
  assistindo: '#378ADD',
  quero:      '#EF9F27',
  abandonado: '#E24B4A',
};

const STATUS_LABELS = {
  concluido:  'Concluído',
  assistindo: 'Em andamento',
  quero:      'Quero ver',
  abandonado: 'Abandonado',
};

/* ---------- Cards ---------- */

function renderStars(rating, size = 11) {
  return [1, 2, 3, 4, 5]
    .map(s => `<span class="star${s <= rating ? '' : ' empty'}" style="font-size:${size}px;">★</span>`)
    .join('');
}

function renderCard(item) {
  const t = TYPES[item.type] || TYPES.filme;
  const div = document.createElement('div');
  div.className = 'card';
  div.dataset.id = item.id;
  div.innerHTML = `
    <div class="card-cover" style="background:${t.bg};">
      <span>${t.icon}</span>
      <div class="card-type-badge" style="background:${t.bg};color:${t.textColor};">${t.label}</div>
      <div class="card-status-dot" style="background:${STATUS_COLORS[item.status] || '#999'};"></div>
    </div>
    <div class="card-body">
      <div class="card-title">${escapeHtml(item.title)}</div>
      <div class="card-meta">${item.year || '—'} · ${STATUS_LABELS[item.status] || item.status}</div>
      <div class="card-stars">
        ${renderStars(item.rating)}
        <span class="card-score">${item.rating}.0</span>
      </div>
    </div>
  `;
  return div;
}

function renderGrid(items) {
  const grid = document.getElementById('grid');
  grid.innerHTML = '';

  document.getElementById('content-count').textContent =
    ` · ${items.length} ${items.length === 1 ? 'item' : 'itens'}`;

  if (!items.length) {
    grid.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">🔍</div>
        <div class="empty-text">Nenhum item encontrado</div>
      </div>`;
    return;
  }

  items.forEach(item => {
    const card = renderCard(item);
    card.addEventListener('click', () => openDetailModal(item));
    grid.appendChild(card);
  });
}

/* ---------- Detail modal ---------- */

function openDetailModal(item) {
  const t = TYPES[item.type] || TYPES.filme;
  document.getElementById('detail-title').textContent = item.title;
  document.getElementById('detail-body').innerHTML = `
    <div class="detail-cover" style="background:${t.bg};">${t.icon}</div>
    <div class="detail-meta-row">
      <span class="detail-badge" style="background:${t.bg};color:${t.textColor};">${t.label}</span>
      <span class="detail-status-badge">
        <span class="sdot" style="background:${STATUS_COLORS[item.status]};"></span>
        ${STATUS_LABELS[item.status]}
      </span>
      ${item.year ? `<span style="font-size:12px;color:var(--text-tertiary);">${item.year}</span>` : ''}
    </div>
    <div class="card-stars" style="margin-bottom:4px;">
      ${renderStars(item.rating, 16)}
      <span class="card-score" style="font-size:13px;margin-left:5px;">${item.rating}.0 / 5</span>
    </div>
    ${item.comment ? `<div class="detail-comment">${escapeHtml(item.comment)}</div>` : ''}
  `;
  document.getElementById('btn-delete-item').dataset.id = item.id;
  document.getElementById('btn-edit-item').dataset.id   = item.id;
  document.getElementById('modal-detail').style.display = 'flex';
}

/* ---------- Stats ---------- */

function renderStats(stats) {
  const container = document.getElementById('stats-grid');
  const typeStats = stats.by_type || {};
  const statusStats = stats.by_status || {};

  const cards = [
    { label: 'Total na coleção', value: stats.total || 0, sub: 'itens' },
    { label: 'Concluídos',       value: statusStats.concluido  || 0, sub: STATUS_LABELS.concluido },
    { label: 'Em andamento',     value: statusStats.assistindo || 0, sub: STATUS_LABELS.assistindo },
    { label: 'Quero ver',        value: statusStats.quero      || 0, sub: STATUS_LABELS.quero },
    { label: 'Filmes',    value: typeStats.filme   || 0, sub: '🎬' },
    { label: 'Jogos',     value: typeStats.jogo    || 0, sub: '🎮' },
    { label: 'Animes',    value: typeStats.anime   || 0, sub: '📺' },
    { label: 'Mangás',    value: typeStats.manga   || 0, sub: '📖' },
    { label: 'Livros',    value: typeStats.livro   || 0, sub: '📚' },
    { label: 'Desenhos',  value: typeStats.desenho || 0, sub: '🖼️' },
    { label: 'Nota média', value: stats.avg_rating ? stats.avg_rating.toFixed(1) : '—', sub: '⭐ média geral' },
  ];

  container.innerHTML = cards.map(c => `
    <div class="stat-card">
      <div class="stat-label">${c.label}</div>
      <div class="stat-value">${c.value}</div>
      <div class="stat-sub">${c.sub}</div>
    </div>
  `).join('');
}

/* ---------- Toast ---------- */

function showToast(msg, duration = 2500) {
  const t = document.createElement('div');
  t.className = 'toast';
  t.textContent = msg;
  document.body.appendChild(t);
  setTimeout(() => t.remove(), duration);
}

/* ---------- Utils ---------- */

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
