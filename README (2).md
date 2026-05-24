# Dashboard Pessoal

Dashboard de produtividade pessoal com Next.js 14, Supabase e Tailwind CSS.

## Funcionalidades

- ✅ **Tarefas** — Criar, filtrar por status/prioridade, marcar como concluída, prazo com alerta de vencido
- 📝 **Notas rápidas** — Sticky notes coloridas, fixar no topo, edição inline
- 🔖 **Bookmarks** — Salvar links com categoria, busca, favicon automático
- 🎯 **Metas** — Barra de progresso, atualização de valor, status ativo/pausado/concluído
- 🌙 **Dark mode** — Toggle claro/escuro/sistema
- 🔐 **Autenticação** — Login/cadastro com Supabase Auth, sessão persistente

---

## Deploy em 5 passos

### 1. Criar projeto no Supabase

1. Acesse [supabase.com](https://supabase.com) e crie um novo projeto
2. Vá em **SQL Editor** e execute o conteúdo de `supabase/migrations.sql`
3. Copie a **Project URL** e **anon public key** em Settings → API

### 2. Configurar variáveis de ambiente

Renomeie `.env.local.example` para `.env.local` e preencha:

```env
NEXT_PUBLIC_SUPABASE_URL=https://SEU_PROJETO.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua_anon_key_aqui
```

### 3. Instalar dependências

```bash
npm install
```

> **Nota**: Este projeto usa o pacote `geist` para fontes. Se tiver erro, instale:
> ```bash
> npm install geist
> ```

### 4. Rodar localmente

```bash
npm run dev
```

Acesse [http://localhost:3000](http://localhost:3000)

### 5. Deploy na Vercel

```bash
npm install -g vercel
vercel
```

Ou conecte o repositório em [vercel.com](https://vercel.com) e adicione as variáveis de ambiente no painel da Vercel.

---

## Estrutura do projeto

```
app/
  auth/login/       → Página de login/cadastro
  dashboard/        → Layout e página principal
  globals.css       → Design system e variáveis CSS
components/
  dashboard/        → Sidebar, Header, Stats, Notes, Goals, Bookmarks
  todo/             → Widget de tarefas
  shared/           → ThemeProvider, ThemeToggle
  ui/               → Toaster
hooks/
  use-toast.ts      → Sistema de notificações
lib/
  supabase.ts       → Client browser
  supabase-server.ts → Client server (SSR)
  store.ts          → Zustand store
  utils.ts          → Funções utilitárias
types/
  index.ts          → Tipos TypeScript
supabase/
  migrations.sql    → SQL para criar tabelas no Supabase
middleware.ts       → Proteção de rotas
```

---

## Próximos aprimoramentos

- [ ] Drag and drop nas tarefas (`@dnd-kit/core`)
- [ ] Real-time com Supabase channels
- [ ] Integração Google Calendar
- [ ] Hábitos diários com streak counter
- [ ] IA com Anthropic API para priorização automática
- [ ] Notificações de tarefas vencendo
- [ ] Export de tarefas em CSV

---

## Stack

| Tecnologia | Uso |
|---|---|
| Next.js 14 | Framework React com App Router |
| TypeScript | Tipagem estática |
| Tailwind CSS | Estilização |
| Supabase | Banco de dados + Auth |
| TanStack Query | Cache e sincronização |
| Zustand | Estado global |
| Lucide React | Ícones |
| date-fns | Manipulação de datas |
