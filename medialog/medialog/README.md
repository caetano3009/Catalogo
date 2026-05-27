# 🎬 Medialog

Seu catálogo pessoal de filmes, jogos, animes, mangás, livros e desenhos.
Inspirado no Letterboxd, mas para todos os tipos de mídia.

---

## 📁 Estrutura do projeto

```
medialog/
├── frontend/
│   ├── index.html        ← Página principal
│   ├── css/
│   │   └── style.css     ← Todos os estilos
│   └── js/
│       ├── api.js        ← Comunicação com o backend
│       ├── ui.js         ← Renderização de componentes
│       └── app.js        ← Lógica principal e eventos
│
├── backend/
│   ├── server.js         ← Servidor Express (API REST)
│   ├── database.js       ← Conexão e inicialização do SQLite
│   └── package.json      ← Dependências Node.js
│
└── database/
    ├── schema.sql        ← Estrutura do banco (referência)
    └── medialog.db       ← Arquivo SQLite (criado automaticamente)
```

---

## 🚀 Como rodar

### Pré-requisitos
- [Node.js](https://nodejs.org/) versão 18 ou superior

### 1. Instalar dependências

```bash
cd backend
npm install
```

### 2. Iniciar o servidor

```bash
npm start
```

O servidor sobe em **http://localhost:3000** e serve o frontend automaticamente.
O banco de dados é criado em `database/medialog.db` na primeira execução com dados de exemplo.

### Modo desenvolvimento (auto-reload)

```bash
npm run dev
```

---

## 🔌 API REST

| Método | Endpoint          | Descrição                     |
|--------|-------------------|-------------------------------|
| GET    | /api/items        | Lista itens (suporta filtros) |
| GET    | /api/items/:id    | Retorna um item               |
| POST   | /api/items        | Cria novo item                |
| PUT    | /api/items/:id    | Atualiza um item              |
| DELETE | /api/items/:id    | Remove um item                |
| GET    | /api/stats        | Estatísticas gerais           |

### Parâmetros de filtro (GET /api/items)

| Parâmetro | Valores possíveis                                        |
|-----------|----------------------------------------------------------|
| type      | filme, jogo, anime, manga, livro, desenho                |
| status    | concluido, assistindo, quero, abandonado                 |
| sort      | recent (padrão), rating, name                            |

### Exemplo de payload (POST/PUT)

```json
{
  "title":   "Frieren",
  "type":    "anime",
  "year":    "2023",
  "status":  "concluido",
  "rating":  5,
  "comment": "Obra linda, surpreendeu muito."
}
```

---

## 🗄️ Banco de dados

- **SQLite** via `better-sqlite3` — sem necessidade de instalar servidor de banco
- Arquivo gerado em `database/medialog.db`
- Consulte `database/schema.sql` para ver a estrutura completa

---

## 🛠️ Próximas features sugeridas

- [ ] Busca por título
- [ ] Suporte a múltiplos usuários com login
- [ ] Integração com API do TMDB (filmes), IGDB (jogos) e Jikan (animes)
- [ ] Upload de capa personalizada
- [ ] Exportar coleção em CSV
- [ ] Página de perfil pública
