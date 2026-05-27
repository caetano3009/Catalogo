/* ============================================================
   api.js — Comunicação com o backend (fetch wrapper)
   ============================================================ */

const API_BASE = 'http://localhost:3000/api';

const api = {

  async getItems(params = {}) {
    const query = new URLSearchParams(params).toString();
    const res = await fetch(`${API_BASE}/items${query ? '?' + query : ''}`);
    if (!res.ok) throw new Error('Erro ao buscar itens');
    return res.json();
  },

  async getItem(id) {
    const res = await fetch(`${API_BASE}/items/${id}`);
    if (!res.ok) throw new Error('Item não encontrado');
    return res.json();
  },

  async createItem(data) {
    const res = await fetch(`${API_BASE}/items`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Erro ao criar item');
    return res.json();
  },

  async updateItem(id, data) {
    const res = await fetch(`${API_BASE}/items/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Erro ao atualizar item');
    return res.json();
  },

  async deleteItem(id) {
    const res = await fetch(`${API_BASE}/items/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Erro ao remover item');
    return res.json();
  },

  async getStats() {
    const res = await fetch(`${API_BASE}/stats`);
    if (!res.ok) throw new Error('Erro ao buscar stats');
    return res.json();
  },

};
