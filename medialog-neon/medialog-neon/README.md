# 🎬 Minha Coleção — Catálogo de Mídias

Catálogo pessoal de filmes, jogos, animes, mangás, livros e desenhos.
Design neon com paleta **Roxo · Esmeralda · Âmbar**.
100% frontend — funciona no GitHub Pages sem precisar de servidor.

---

## 🚀 Como publicar no GitHub Pages (passo a passo)

### 1. Crie um repositório no GitHub

1. Acesse [github.com](https://github.com) e faça login
2. Clique em **"New repository"**
3. Escolha um nome (ex: `minha-colecao`)
4. Deixe como **Public**
5. Clique em **"Create repository"**

### 2. Faça o upload dos arquivos

**Opção A — pelo site (mais fácil):**
1. Na página do repositório, clique em **"uploading an existing file"**
2. Arraste todos os arquivos e pastas do projeto
3. Clique em **"Commit changes"**

**Opção B — via Git:**
```bash
git init
git add .
git commit -m "primeiro commit"
git branch -M main
git remote add origin https://github.com/SEU_USUARIO/minha-colecao.git
git push -u origin main
```

### 3. Ative o GitHub Pages

1. No repositório, vá em **Settings → Pages**
2. Em **"Source"**, selecione `Deploy from a branch`
3. Escolha a branch **`main`** e pasta **`/ (root)`**
4. Clique em **Save**
5. Aguarde ~1 minuto e acesse:

```
https://SEU_USUARIO.github.io/minha-colecao/
```

---

## 📁 Estrutura

```
minha-colecao/
├── index.html       ← Página principal
├── css/
│   └── style.css    ← Estilos neon (roxo/esmeralda/âmbar)
└── js/
    ├── data.js      ← Dados salvos no localStorage do navegador
    ├── ui.js        ← Renderização dos componentes
    └── app.js       ← Lógica e eventos
```

---

## 💾 Como os dados são salvos

Os dados ficam no **localStorage** do navegador — sem servidor, sem banco de dados.
Isso significa:
- ✅ Funciona 100% no GitHub Pages
- ✅ Dados persistem entre sessões no mesmo navegador
- ⚠️ Dados são locais (não sincronizam entre dispositivos)

---

## ✨ Funcionalidades

- Adicionar/editar/remover itens da coleção
- Filtrar por tipo de mídia e status
- Ordenar por data, nota ou nome
- Avaliar com estrelas e deixar comentário
- Ver estatísticas da coleção
- Aba Stats com totais por tipo e status
