# Theme Bundle - Status do Projeto

**Última atualização:** 29 de Janeiro de 2026

---

## Visão Geral

O **Theme Bundle** é um Theme Studio que permite aos usuários:
1. Escolher entre 13 presets de temas (Dracula, Nord, etc.)
2. Customizar cores em tempo real (Light + Dark mode separadamente)
3. Comprar via Gumroad
4. Receber acesso ao portal de customização por email
5. Baixar o tema exportado para 19 plataformas diferentes

---

## Produtos

| Produto | Preço | Descrição |
|---------|-------|-----------|
| **Single Theme** | $9 | 1 tema customizável escolhido antes da compra |
| **Full Bundle** | $49 | 13 temas pré-feitos (entrega automática Gumroad) + 1 tema customizável bônus |

---

## Funcionalidades Implementadas

### 1. Theme Studio (Frontend)

| Feature | Status | Arquivo |
|---------|--------|---------|
| Seleção de 13 presets | ✅ Completo | `src/lib/themes/registry.ts` |
| Color Picker visual com valores editáveis (HEX, RGB, HSL) | ✅ Completo | `src/components/theme/color-picker.tsx` |
| Customização em tempo real | ✅ Completo | `src/hooks/use-theme-generator.ts` |
| Preview Dashboard | ✅ Completo | `src/components/preview/preview-dashboard.tsx` |
| Light/Dark mode toggle | ✅ Completo | `src/components/theme/mode-toggle.tsx` |
| CSS Variables override | ✅ Completo | `src/components/theme/providers/theme-provider.tsx` |

### 2. Portal do Comprador (Buyer Portal)

| Feature | Status | Arquivo |
|---------|--------|---------|
| Página de login com código de verificação | ✅ Completo | `src/app/buyer/page.tsx` |
| Autenticação JWT | ✅ Completo | `src/lib/jwt.ts` |
| Painel de customização protegido | ✅ Completo | `src/app/buyer/customize/page.tsx` |
| Customização separada Light + Dark mode | ✅ Completo | Estados `lightColors` e `darkColors` |
| Preview realista (Terminal, Editor, Browser, Slack) | ✅ Completo | `src/components/preview/buyer-preview.tsx` |
| Download único (one-time use) | ✅ Completo | `src/app/api/buyer/download/route.ts` |
| ZIP dual com light/ e dark/ folders | ✅ Completo | `src/lib/zip-generator.ts` |

### 3. Sistema de Exportação (19 Plataformas)

| Categoria | Plataformas | Status |
|-----------|-------------|--------|
| **Terminais** | Alacritty, iTerm, Windows Terminal, Hyper, GNOME Terminal, Terminal.app | ✅ Completo |
| **Editores** | VS Code, Sublime Text, Vim, Emacs, JetBrains, Notepad++, Xcode, Zed | ✅ Completo |
| **Browsers** | Firefox, Chrome | ✅ Completo |
| **Apps** | Slack, Insomnia, Raycast | ✅ Completo |

**Arquivos:** `src/lib/exporters/*.ts`

### 4. Backend APIs

| API | Endpoint | Status | Descrição |
|-----|----------|--------|-----------|
| Sessions | `POST /api/sessions` | ✅ Completo | Salva config de tema no Supabase |
| Sessions | `GET /api/sessions?id=xxx` | ✅ Completo | Recupera sessão do Supabase |
| Webhook | `POST /api/webhooks/gumroad` | ✅ Completo | Recebe compra, cria acesso, envia email |
| Download | `GET /api/download?token=xxx` | ✅ Completo | Baixa ZIP com token válido |
| Buyer Auth | `POST /api/buyer/auth` | ✅ Completo | Valida email + código, retorna JWT |
| Buyer Auth | `GET /api/buyer/auth` | ✅ Completo | Verifica JWT existente |
| Buyer Download | `POST /api/buyer/download` | ✅ Completo | Gera ZIP dual e marca acesso como usado |

### 5. Geração de ZIP

| Feature | Status | Arquivo |
|---------|--------|---------|
| Gerador de ZIP com JSZip | ✅ Completo | `src/lib/zip-generator.ts` |
| **ZIP Dual (Light + Dark)** | ✅ Completo | `generateDualThemePackage()` |
| Upload para Supabase Storage | ✅ Completo | `src/lib/server/downloads-store.ts` |
| Download tokens com expiração | ✅ Completo | `src/lib/server/downloads-store.ts` |
| README incluso | ✅ Completo | Gerado dinamicamente |
| LICENSE incluso | ✅ Completo | Gerado dinamicamente |

**Estrutura do ZIP dual:**
```
theme-bundle/
├── light/
│   ├── terminals/
│   ├── editors/
│   ├── browsers/
│   └── apps/
├── dark/
│   ├── terminals/
│   ├── editors/
│   ├── browsers/
│   └── apps/
├── README.md
└── LICENSE.md
```

### 6. Integração Gumroad

| Feature | Status | Arquivo |
|---------|--------|---------|
| URLs configuráveis via env vars | ✅ Completo | `src/lib/gumroad.ts` |
| Fluxo de compra com sessão | ✅ Completo | `src/hooks/use-purchase-flow.ts` |
| Validação de webhook | ✅ Completo | `src/lib/gumroad.ts` |
| Diferenciação Single vs Bundle | ✅ Completo | `determineProductType()` |

### 7. Supabase (Database + Storage)

| Feature | Status | Detalhes |
|---------|--------|----------|
| Projeto criado | ✅ Configurado | `yolvrvafdyaosrpycvxs` |
| Tabela `theme_sessions` | ✅ Configurado | Sessões de compra com RLS |
| Tabela `download_tokens` | ✅ Configurado | Tokens de download com RLS |
| **Tabela `buyer_access`** | ✅ Configurado | Acesso dos compradores (email, código, used) |
| Bucket `downloads` | ✅ Configurado | Storage privado para ZIPs |
| Service Role configurado | ✅ Configurado | `.env.local` |

### 8. Email Service

| Feature | Status | Arquivo |
|---------|--------|---------|
| Template HTML para download | ✅ Completo | `src/lib/email.ts` |
| **Template HTML para acesso do comprador** | ✅ Completo | `sendBuyerAccessEmail()` |
| Integração Resend | ✅ Completo | Ativado no código |

---

## Configuração Atual

### Variáveis de Ambiente Necessárias

```env
# Supabase (OBRIGATÓRIO)
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJI...

# JWT (OBRIGATÓRIO)
JWT_SECRET=sua-chave-secreta-minimo-32-caracteres

# Gumroad (OBRIGATÓRIO para produção)
GUMROAD_WEBHOOK_SECRET=seu-webhook-secret
GUMROAD_SINGLE_PRODUCT_ID=abc123
GUMROAD_BUNDLE_PRODUCT_ID=xyz789

# Resend (OBRIGATÓRIO para produção)
RESEND_API_KEY=re_xxx
RESEND_FROM_EMAIL=noreply@seudominio.com

# App URL (OBRIGATÓRIO)
NEXT_PUBLIC_APP_URL=https://seudominio.com
```

---

## Fluxo do Sistema

### Fluxo de Compra

```
1. Usuário acessa themebundle.com
2. Escolhe produto (Single $9 ou Bundle $49)
3. Customiza cores (opcional, salvo em sessão)
4. Clica em "Comprar" → Redirecionado ao Gumroad
5. Completa pagamento no Gumroad
6. Gumroad envia webhook para /api/webhooks/gumroad
7. Sistema cria buyer_access com código de 6 dígitos
8. Sistema envia email com código via Resend
```

### Fluxo de Acesso do Comprador

```
1. Comprador recebe email com código
2. Acessa /buyer
3. Digita email e código de verificação
4. Sistema valida e retorna JWT
5. Redirecionado para /buyer/customize
6. Customiza Light Mode e Dark Mode separadamente
7. Clica "Download Theme"
8. Sistema gera ZIP dual, marca acesso como usado
9. Download inicia automaticamente
10. Acesso expira (one-time use)
```

---

## Tarefas Pendentes

### Alta Prioridade (Para Lançar)

| Tarefa | Status | Notas |
|--------|--------|-------|
| Criar produtos no Gumroad | ⏳ Pendente | Single $9, Bundle $49 |
| Configurar webhook no Gumroad | ⏳ Pendente | URL: `https://seudominio.com/api/webhooks/gumroad` |
| Gerar JWT_SECRET | ⏳ Pendente | `openssl rand -base64 32` |
| Configurar Resend | ⏳ Pendente | Criar conta, verificar domínio, obter API key |
| Deploy no Vercel | ⏳ Pendente | Conectar repo GitHub |
| Aplicar migração `003_buyer_access.sql` | ⏳ Verificar | Rodar no Supabase Dashboard se não feito |

### Média Prioridade

| Tarefa | Status | Notas |
|--------|--------|-------|
| Domínio próprio | ⏳ Pendente | Configurar no Vercel |
| Testar fluxo completo | ⏳ Pendente | Compra real de $0 no Gumroad |
| SEO e meta tags | ⏳ Pendente | Open Graph, Twitter cards |

### Baixa Prioridade (Melhorias Futuras)

| Tarefa | Status | Notas |
|--------|--------|-------|
| Analytics | ⏳ Pendente | Vercel Analytics ou Plausible |
| Página de suporte/FAQ | ⏳ Pendente | |
| Mais temas | ⏳ Pendente | Adicionar novos presets |

---

## Como Testar Localmente

### 1. Iniciar o servidor

```bash
cd c:\Users\rggre\theme-bundle
npm run dev
```

### 2. Criar um acesso de teste

```powershell
# PowerShell - Simular webhook do Gumroad
Invoke-RestMethod -Uri "http://localhost:3000/api/webhooks/gumroad" `
  -Method POST `
  -ContentType "application/x-www-form-urlencoded" `
  -Body "seller_id=test&product_id=bundle&product_name=Full%20Bundle&email=seu@email.com&price=4900&sale_id=test123&sale_timestamp=2026-01-29T00:00:00Z"
```

### 3. Acessar o portal do comprador

1. Abra `http://localhost:3000/buyer`
2. Digite o email e código recebido (ou veja no console do servidor)
3. Customize as cores para Light e Dark mode
4. Faça o download

### 4. Verificar no Supabase

```sql
-- Ver acessos criados
SELECT * FROM buyer_access ORDER BY created_at DESC LIMIT 5;

-- Ver se foi marcado como usado
SELECT id, email, used, created_at FROM buyer_access WHERE email = 'seu@email.com';
```

---

## Estrutura de Arquivos

```
src/
├── app/
│   ├── api/
│   │   ├── buyer/
│   │   │   ├── auth/route.ts           # Login do comprador
│   │   │   └── download/route.ts       # Download dual
│   │   ├── download/route.ts           # Download com token
│   │   ├── sessions/route.ts           # API de sessões
│   │   └── webhooks/gumroad/route.ts   # Webhook handler
│   ├── buyer/
│   │   ├── page.tsx                    # Login do comprador
│   │   └── customize/page.tsx          # Painel de customização
│   ├── layout.tsx
│   └── page.tsx
│
├── components/
│   ├── preview/
│   │   ├── buyer-preview.tsx           # Preview realista (Terminal, Editor, etc)
│   │   └── ...
│   ├── sections/                       # Seções da landing page
│   ├── theme/
│   │   ├── color-picker.tsx            # Picker com valores editáveis
│   │   ├── theme-customizer.tsx        # Painel de customização
│   │   └── ...
│   └── ui/                             # Componentes Shadcn/ui
│
├── hooks/
│   ├── use-theme-generator.ts          # Estado das cores HSL
│   ├── use-purchase-flow.ts            # Fluxo de compra
│   └── use-theme.ts
│
└── lib/
    ├── server/
    │   ├── supabase.ts                 # Supabase client
    │   ├── sessions-store.ts           # Session CRUD
    │   ├── downloads-store.ts          # Storage + tokens
    │   ├── buyer-access-store.ts       # Acesso dos compradores
    │   └── index.ts
    │
    ├── exporters/
    │   ├── types.ts                    # ThemeConfig, DualThemeConfig
    │   └── *.ts                        # 19 exportadores
    │
    ├── themes/                         # Definições dos 13 presets
    ├── color-utils.ts                  # Conversões HSL/HEX/RGB
    ├── email.ts                        # Service de email (Resend)
    ├── jwt.ts                          # JWT para autenticação
    ├── gumroad.ts                      # Validação + URLs
    └── zip-generator.ts                # Gerador de pacotes (single e dual)

supabase/
├── migrations/
│   ├── 001_initial_schema.sql          # theme_sessions, download_tokens
│   ├── 002_storage_bucket.sql          # Instruções do bucket
│   └── 003_buyer_access.sql            # Tabela buyer_access
└── README.md
```

---

## Stack Técnica

| Tecnologia | Uso |
|------------|-----|
| Next.js 14 | Framework full-stack |
| React 18 | UI Library |
| TypeScript | Type safety |
| Tailwind CSS | Styling |
| Shadcn/ui | Component library |
| JSZip | Geração de ZIP |
| jose | JWT (edge-compatible) |
| Supabase | Database (Postgres) + Storage |
| Resend | Email service |
| Vercel | Hosting |
| Gumroad | Payment processing |

---

## Checklist de Lançamento

- [ ] Criar conta Gumroad (se não tiver)
- [ ] Criar produto "Single Theme" ($9)
- [ ] Criar produto "Full Bundle" ($49)
- [ ] Anotar IDs dos produtos
- [ ] Deploy no Vercel
- [ ] Configurar variáveis de ambiente no Vercel
- [ ] Configurar webhook do Gumroad (URL do Vercel + /api/webhooks/gumroad)
- [ ] Configurar Resend (API key, verificar domínio)
- [ ] Testar compra de $0
- [ ] Verificar email recebido
- [ ] Testar fluxo completo de customização
- [ ] Lançar! 🚀

---

## Contato

Projeto desenvolvido para venda de temas customizáveis para desenvolvedores.
