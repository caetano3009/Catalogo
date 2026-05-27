/* ============================================================
   app.js — Lógica principal, eventos e estado da aplicação
   ============================================================ */

/* ---------- Estado ---------- */

const state = {
  items:        [],
  filterType:   'all',
  filterStatus: 'all',
  sortBy:       'recent',
  activeTab:    'collection',
  formType:     null,
  formStatus:   null,
  formRating:   0,
  editingId:    null,
};

/* ---------- Inicialização ---------- */

document.addEventListener('DOMContentLoaded', () => {
  bindFilterBar();
  bindNavTabs();
  bindModal();
  bindDetailModal();
  loadItems();
});

/* ---------- Carregar itens ---------- */

async function loadItems() {
  document.getElementById('grid').innerHTML = '<div class="loading">Carregando...</div>';
  try {
    const params = {};
    if (state.filterType   !== 'all') params.type   = state.filterType;
    if (state.filterStatus !== 'all') params.status = state.filterStatus;
    params.sort = state.sortBy;

    state.items = await api.getItems(params);
    renderGrid(state.items);
  } catch (err) {
    document.getElementById('grid').innerHTML =
      `<div class="empty-state"><div class="empty-icon">⚠️</div><div class="empty-text">${err.message}</div></div>`;
  }
}

async function loadStats() {
  try {
    const stats = await api.getStats();
    renderStats(stats);
  } catch (err) {
    document.getElementById('stats-grid').innerHTML =
      `<p style="color:var(--accent);padding:20px;">Erro ao carregar stats</p>`;
  }
}

/* ---------- Filter bar ---------- */

function bindFilterBar() {
  document.querySelectorAll('.filter-pill').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.filter-pill').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      state.filterType = btn.dataset.type;

      const labels = {
        all: 'Toda a coleção', filme: 'Filmes', jogo: 'Jogos',
        anime: 'Animes', manga: 'Mangás', livro: 'Livros', desenho: 'Desenhos',
      };
      document.getElementById('content-title').textContent = labels[state.filterType] || 'Coleção';
      loadItems();
    });
  });

  document.querySelectorAll('.status-pill').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.status-pill').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      state.filterStatus = btn.dataset.status;
      loadItems();
    });
  });

  document.getElementById('sort-select').addEventListener('change', e => {
    state.sortBy = e.target.value;
    loadItems();
  });
}

/* ---------- Nav tabs ---------- */

function bindNavTabs() {
  document.querySelectorAll('.nav-tab').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.nav-tab').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      state.activeTab = btn.dataset.tab;

      const contentEl = document.getElementById('content');
      const statsEl   = document.getElementById('stats-section');

      if (state.activeTab === 'stats') {
        contentEl.style.display = 'none';
        statsEl.style.display   = 'block';
        loadStats();
      } else {
        contentEl.style.display = 'block';
        statsEl.style.display   = 'none';
      }
    });
  });
}

/* ---------- Modal Adicionar/Editar ---------- */

function bindModal() {
  document.getElementById('btn-open-modal').addEventListener('click', () => openModal());
  document.getElementById('btn-close-modal').addEventListener('click', closeModal);
  document.getElementById('btn-cancel-modal').addEventListener('click', closeModal);

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
      state.formRating = parseInt(btn.dataset.value, 10);
      updateStarUI();
    });
  });

  // Submit
  document.getElementById('item-form').addEventListener('submit', async e => {
    e.preventDefault();
    await saveItem();
  });
}

function openModal(item = null) {
  state.editingId  = item ? item.id : null;
  state.formType   = item ? item.type   : null;
  state.formStatus = item ? item.status : null;
  state.formRating = item ? item.rating : 0;

  document.getElementById('modal-title').textContent = item ? 'Editar item' : 'Adicionar à coleção';
  document.getElementById('form-id').value      = item ? item.id    : '';
  document.getElementById('form-title').value   = item ? item.title : '';
  document.getElementById('form-year').value    = item ? (item.year || '') : '';
  document.getElementById('form-comment').value = item ? (item.comment || '') : '';

  document.querySelectorAll('.type-option').forEach(o => {
    o.classList.toggle('selected', o.dataset.type === state.formType);
  });
  document.querySelectorAll('.status-option').forEach(o => {
    o.classList.toggle('selected', o.dataset.status === state.formStatus);
  });
  updateStarUI();

  document.getElementById('modal').style.display = 'flex';
  document.getElementById('form-title').focus();
}

function closeModal() {
  document.getElementById('modal').style.display = 'none';
}

function updateStarUI() {
  document.querySelectorAll('.star-btn').forEach(btn => {
    btn.classList.toggle('filled', parseInt(btn.dataset.value, 10) <= state.formRating);
  });
}

async function saveItem() {
  const title = document.getElementById('form-title').value.trim();
  if (!title) {
    document.getElementById('form-title').focus();
    showToast('Informe o título da obra');
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

  try {
    if (state.editingId) {
      await api.updateItem(state.editingId, payload);
      showToast('Item atualizado ✓');
    } else {
      await api.createItem(payload);
      showToast('Adicionado à coleção ✓');
    }
    closeModal();
    loadItems();
  } catch (err) {
    showToast('Erro: ' + err.message);
  }
}

/* ---------- Modal Detalhes ---------- */

function bindDetailModal() {
  document.getElementById('btn-close-detail').addEventListener('click', () => {
    document.getElementById('modal-detail').style.display = 'none';
  });

  document.getElementById('modal-detail').addEventListener('click', e => {
    if (e.target === e.currentTarget)
      document.getElementById('modal-detail').style.display = 'none';
  });

  document.getElementById('btn-delete-item').addEventListener('click', async e => {
    const id = e.currentTarget.dataset.id;
    if (!confirm('Remover este item da coleção?')) return;
    try {
      await api.deleteItem(id);
      document.getElementById('modal-detail').style.display = 'none';
      showToast('Item removido');
      loadItems();
    } catch (err) {
      showToast('Erro ao remover: ' + err.message);
    }
  });

  document.getElementById('btn-edit-item').addEventListener('click', async e => {
    const id = e.currentTarget.dataset.id;
    document.getElementById('modal-detail').style.display = 'none';
    try {
      const item = await api.getItem(id);
      openModal(item);
    } catch (err) {
      showToast('Erro: ' + err.message);
    }
  });
}
