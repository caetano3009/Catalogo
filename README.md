# 🎬 Minha Coleção — com Login

Catálogo de mídias com sistema de login real.
Backend: Node.js + Express + SQLite.
Deploy gratuito no Railway.

---

## 🚀 Deploy no Railway (gratuito)

### 1. Crie uma conta
Acesse [railway.app](https://railway.app) e faça login com sua conta GitHub.

### 2. Suba o código no GitHub

```bash
git init
git add .
git commit -m "primeiro commit"
git branch -M main
git remote add origin https://github.com/SEU_USUARIO/medialog.git
git push -u origin main
```

### 3. Crie o projeto no Railway

1. Em [railway.app/new](https://railway.app/new), clique **"Deploy from GitHub repo"**
2. Selecione o repositório
3. Railway detecta o `package.json` e já configura automaticamente

### 4. Configure a variável de ambiente

No painel do Railway, vá em **Variables** e adicione:
```
SESSION_SECRET = qualquer_string_longa_e_aleatoria_aqui
NODE_ENV = production
```

### 5. Pronto!

Railway vai gerar um link como:
```
https://medialog-production.up.railway.app
```

---

## 💻 Rodar localmente

```bash
npm install
npm start
# Acesse http://localhost:3000
```

Modo dev com auto-reload:
```bash
npm run dev
```

---

## 📁 Estrutura

```
medialog/
├── server.js          ← Servidor Express
├── database.js        ← SQLite (criado em /data automaticamente)
├── middleware/
│   └── auth.js        ← Proteção de rotas
├── routes/
│   ├── auth.js        ← /api/auth (login, registro, logout)
│   └── items.js       ← /api/items (CRUD por usuário)
├── public/
│   └── index.html     ← Frontend completo
└── data/              ← Gerado automaticamente
    ├── medialog.db    ← Banco de dados
    └── sessions.db    ← Sessões
```

---

## 🔌 API

| Método | Rota                    | Descrição              |
|--------|-------------------------|------------------------|
| POST   | /api/auth/register      | Criar conta            |
| POST   | /api/auth/login         | Entrar                 |
| POST   | /api/auth/logout        | Sair                   |
| GET    | /api/auth/me            | Usuário logado         |
| GET    | /api/items              | Listar itens           |
| POST   | /api/items              | Criar item             |
| PUT    | /api/items/:id          | Editar item            |
| DELETE | /api/items/:id          | Remover item           |
| GET    | /api/items/stats/summary| Estatísticas           |
