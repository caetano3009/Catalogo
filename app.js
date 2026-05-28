// ============================================================
// app.js — Lógica principal e eventos
// ============================================================

const state = {
  filterType:   'all',
  filterStatus: 'all',
  sortBy:       'recent',
  activeTab:    'collection',
  formType:     null,
  formStatus:   null,
  formRating:   0,
  editingId:    null,
};

// ── Init ───────────────────────────────────────────────────────

document.addEventListener('DOMContentLoaded', () => {
  initNavTabs();
  initFilterBar();
  initModal();
  initDetailModal();
  loadCollection();
});

// ── Collection ─────────────────────────────────────────────────

function loadCollection() {
  const items = DB.getAll({
    type:   state.filterType,
    status: state.filterStatus,
    sort:   state.sortBy,
  });
  renderGrid(items, openDetailModal);
}

function loadStats() {
  renderStats(DB.getStats());
}

// ── Nav tabs ───────────────────────────────────────────────────

function initNavTabs() {
  document.querySelectorAll('.nav-tab').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.nav-tab').forEach(b => {
        b.classList.remove('active');
        b.setAttribute('aria-selected', 'false');
      });
      btn.classList.add('active');
      btn.setAttribute('aria-selected', 'true');
      state.activeTab = btn.dataset.tab;

      const colEl   = document.getElementById('tab-collection');
      const statsEl = document.getElementById('tab-stats');

      if (state.activeTab === 'stats') {
        colEl.style.display   = 'none';
        statsEl.style.display = 'block';
        loadStats();
      } else {
        colEl.style.display   = 'block';
        statsEl.style.display = 'none';
      }
    });
  });
}

// ── Filter bar ─────────────────────────────────────────────────

function initFilterBar() {
  document.querySelectorAll('.filter-pill').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.filter-pill').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      state.filterType = btn.dataset.type;

      const labels = {
        all: 'TODA A COLEÇÃO', filme: 'FILMES', jogo: 'JOGOS',
        anime: 'ANIMES', manga: 'MANGÁS', livro: 'LIVROS', desenho: 'DESENHOS',
      };
      document.getElementById('content-title').textContent = labels[state.filterType] || 'COLEÇÃO';
      loadCollection();
    });
  });

  document.querySelectorAll('.status-pill').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.status-pill').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      state.filterStatus = btn.dataset.status;
      loadCollection();
    });
  });

  document.getElementById('sort-select').addEventListener('change', e => {
    state.sortBy = e.target.value;
    loadCollection();
  });
}

// ── Modal Adicionar/Editar ──────────────────────────────────────

function initModal() {
  document.getElementById('btn-open-modal').addEventListener('click', () => openModal());
  document.getElementById('btn-close-modal').addEventListener('click', closeModal);
  document.getElementById('btn-cancel').addEventListener('click', closeModal);

  document.getElementById('modal').addEventListener('click', e => {
    if (e.target === e.currentTarget) closeModal();
  });

  // Tipo
  document.querySelectorAll('.type-option').forEach(el => {
    el.addEventListener('click', () => {
      document.querySelectorAll('.type-option').forEach(o => o.classList.remove('selected'));
      el.classList.add('selected');
      state.formType = el.dataset.type;
    });
    el.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') el.click();
    });
  });

  // Status
  document.querySelectorAll('.status-option').forEach(el => {
    el.addEventListener('click', () => {
      document.querySelectorAll('.status-option').forEach(o => o.classList.remove('selected'));
      el.classList.add('selected');
      state.formStatus = el.dataset.status;
    });
  });

  // Estrelas
  document.querySelectorAll('.star-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      state.formRating = parseInt(btn.dataset.v, 10);
      updateStarUI();
    });
    btn.addEventListener('mouseenter', () => {
      const v = parseInt(btn.dataset.v, 10);
      document.querySelectorAll('.star-btn').forEach((s, i) => {
        s.classList.toggle('filled', i < v);
      });
    });
  });

  document.getElementById('star-rating').addEventListener('mouseleave', updateStarUI);

  // Submit
  document.getElementById('item-form').addEventListener('submit', async e => {
    e.preventDefault();
    saveItem();
  });

  // Esc para fechar
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') {
      closeModal();
      closeDetailModal();
    }
  });
}

function openModal(item = null) {
  state.editingId  = item ? item.id : null;
  state.formType   = item ? item.type   : null;
  state.formStatus = item ? item.status : null;
  state.formRating = item ? item.rating : 0;

  document.getElementById('modal-title').textContent = item ? 'EDITAR' : 'ADICIONAR';
  document.getElementById('form-id').value      = item ? item.id    : '';
  document.getElementById('form-title').value   = item ? item.title : '';
  document.getElementById('form-year').value    = item ? (item.year    || '') : '';
  document.getElementById('form-comment').value = item ? (item.comment || '') : '';

  document.querySelectorAll('.type-option').forEach(o => {
    o.classList.toggle('selected', o.dataset.type === state.formType);
  });
  document.querySelectorAll('.status-option').forEach(o => {
    o.classList.toggle('selected', o.dataset.status === state.formStatus);
  });
  updateStarUI();

  document.getElementById('modal').style.display = 'flex';
  setTimeout(() => document.getElementById('form-title').focus(), 50);
}

function closeModal() {
  document.getElementById('modal').style.display = 'none';
}

function updateStarUI() {
  document.querySelectorAll('.star-btn').forEach(btn => {
    btn.classList.toggle('filled', parseInt(btn.dataset.v, 10) <= state.formRating);
  });
}

function saveItem() {
  const title = document.getElementById('form-title').value.trim();
  if (!title) {
    document.getElementById('form-title').focus();
    showToast('Informe o título da obra!');
    return;
  }

  const payload = {
    title,
    type:    state.formType   || 'filme',
    year:    document.getElementById('form-year').value.trim() || String(new Date().getFullYear()),
    status:  state.formStatus || 'quero',
    rating:  state.formRating || 3,
    comment: document.getElementById('form-comment').value.trim(),
  };

  if (state.editingId) {
    DB.update(state.editingId, payload);
    showToast('✓ Item atualizado');
  } else {
    DB.create(payload);
    showToast('✓ Adicionado à coleção');
  }

  closeModal();
  loadCollection();
}

// ── Modal Detalhes ─────────────────────────────────────────────

function openDetailModal(item) {
  document.getElementById('detail-title').textContent = item.title;
  document.getElementById('detail-body').innerHTML    = renderDetailBody(item);
  document.getElementById('btn-delete').dataset.id   = item.id;
  document.getElementById('btn-edit').dataset.id     = item.id;
  document.getElementById('modal-detail').style.display = 'flex';
}

function closeDetailModal() {
  document.getElementById('modal-detail').style.display = 'none';
}

function initDetailModal() {
  document.getElementById('btn-close-detail').addEventListener('click', closeDetailModal);
  document.getElementById('modal-detail').addEventListener('click', e => {
    if (e.target === e.currentTarget) closeDetailModal();
  });

  document.getElementById('btn-delete').addEventListener('click', e => {
    const id = e.currentTarget.dataset.id;
    if (!confirm('Remover este item da coleção?')) return;
    DB.remove(id);
    closeDetailModal();
    showToast('Item removido');
    loadCollection();
  });

  document.getElementById('btn-edit').addEventListener('click', e => {
    const id   = e.currentTarget.dataset.id;
    const item = DB.getById(id);
    closeDetailModal();
    if (item) openModal(item);
  });
}
