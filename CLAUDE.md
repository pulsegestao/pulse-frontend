# Pulse Frontend — AI Context

## Stack
React 19 · Vite 7 · React Router DOM 7 · lucide-react · inline styles (sem CSS framework)

## Routes
| Rota | Página | Acesso |
|---|---|---|
| `/` | Landing | público |
| `/login` · `/cadastro` · `/verify-email` | Auth | público |
| `/esqueci-senha` · `/redefinir-senha` | Password reset | público |
| `/dashboard` | Dashboard | autenticado |
| `/pdv` | PDV | autenticado |
| `/gerir-estoque` | GerirEstoque | autenticado |
| `/estoque/entrada` | EstoqueEntrada | autenticado |
| `/relatorios` | Relatorios | autenticado |
| `/insights` | Insights | autenticado |
| `/configuracoes` | Configuracoes | autenticado |
| `/sessao-expirada` | SessionExpired | autenticado |

Rotas autenticadas: `<AuthShell><ErrorBoundary><Página /></ErrorBoundary></AuthShell>` em `App.jsx`.
Token em `localStorage("pulse_token")` ou `sessionStorage("pulse_token")`.

## Estrutura
```
src/
├── theme/colors.js       → tokens CSS (C.blue, C.surface, etc.) — nunca hex direto
├── styles/GlobalStyles   → CSS vars :root (light) + [data-theme="dark"]
├── hooks/
│   ├── useAuth.js        → getProfile() → {userId, userName, companyId, companyName, role}
│   ├── useTheme.js       → { dark, toggle } — persiste localStorage("pulse_theme")
│   ├── useToast.js       → { success, error, warning, info } via CustomEvent
│   └── useInView.js      → IntersectionObserver para animações scroll
├── utils/errorMessage.js → friendlyError(msg) — sanitiza erros técnicos
├── services/api.js       → authRequest() + todas as funções de API
├── components/
│   ├── layout/           → Navbar, Footer (landing only)
│   ├── Toast.jsx         → ToastContainer global (ouve pulse:toast)
│   ├── ErrorBoundary.jsx → React Error Boundary
│   └── WidgetError.jsx   → estado de erro inline com retry
└── pages/[NomeDaPagina]/index.jsx  (subcomponentes em components/)
```

## Cores — obrigatório
**Sempre** `import C from "../../theme/colors"` — **nunca** hex literal em `background`/`color`.

| Token | Uso |
|---|---|
| `C.surface` | fundo de cards, modais, painéis (era "white") |
| `C.pageBg` | fundo de página (era "#F8F9FB") |
| `C.graphite` | texto principal |
| `C.mid` | texto secundário |
| `C.border` | bordas e divisores |
| `C.gray` | fundos suaves / hover |
| `C.blue · C.green` | primária / sucesso |
| `C.bluePale · C.greenPale` | fundos com destaque |

**Exceção:** `color: "white"` em texto sobre botões azuis/verdes é aceitável.

## Ícones
Exclusivamente **lucide-react** — nunca emoji como ícone de UI.
```jsx
import { NomeDoIcone } from "lucide-react";
<NomeDoIcone size={18} color={C.blue} strokeWidth={2} />
```
Tamanhos: `13-14` inline/badge · `18` cards KPI · `22-28` destaque
`strokeWidth={1.5}` decorativo grande · `strokeWidth={2}` funcional de UI

## Erros — obrigatório
| Situação | Solução |
|---|---|
| Widget falha no mount | `<WidgetError message={error} onRetry={load} />` |
| Ação falha (save/delete) | `toast.error(friendlyError(e.message))` |
| Ação sucede | `toast.success("mensagem")` |
| Validação de campo | banner inline |
| **Nunca** | `err.message` direto · `alert()` |

```js
import { useToast } from "../hooks/useToast";
const toast = useToast();
toast.error(friendlyError(e.message));
```

## Layout por tipo
- **Landing**: Navbar + Footer de `components/layout/`; animações `useInView` + classes `fade-up d1..d6`
- **Auth** (login/cadastro/etc.): sem Navbar; fundo `linear-gradient(160deg, C.bluePale, C.gray, white)`; card `maxWidth:460`
- **Autenticadas**: sem Navbar; DashboardHeader fixo h=64; fundo `C.pageBg`; `main padding:"80px 24px 48px"`; logo → `/dashboard`
- **Nível 2+** (GerirEstoque, EstoqueEntrada, Configuracoes, etc.): botão voltar `ArrowLeft` 36×36px, borda `C.border` → `/dashboard`

## Fontes
**Plus Jakarta Sans** (corpo) · **Syne** (títulos, classe `.syne`)

## API (`src/services/api.js`)
`authRequest(path, options?)` — injeta JWT, lança erro em `!res.ok`, detecta 401 → `pulse:session-expired`.
```
Auth:       registerUser · loginUser · verifyEmail · checkEmail · forgotPassword · resetPassword
Produtos:   getProducts · createProduct · updateProduct · getLowStock · updateStock(id, input)
NF-e:       previewNFe(formData) · confirmNFe(items)
NCM:        getNCMCategories()
Vendas:     registerSale(input)
Dashboard:  getDashboardSummary · getRevenueChart(period) · getTopProducts(period)
Relatórios: getProductReport(period) · getPaymentMethods(period) · getDeadStock()
Insights:   getInsights({type,severity,read,limit,offset}) · countUnreadInsights()
            markInsightRead(id) · markAllInsightsRead()
Analytics:  getCategoryBreakdown(period) · getVelocityRanking(limit)
Integr.:    getPaymentIntegrations · savePaymentIntegration · deletePaymentIntegration
            testPaymentIntegration · createPaymentIntent · getPaymentIntentStatus · cancelPaymentIntent
Config.:    getMe · updateMe · getCompanySettings · updateCompanySettings · getCompanyMembers
```

## Dark mode
CSS vars em `src/theme/colors.js` — tokens funcionam automaticamente em `[data-theme="dark"]`.
`useTheme()` em `src/hooks/useTheme.js` → `{ dark, toggle }`.
`src/styles/GlobalStyles.jsx` define `:root {}` (light) e `[data-theme="dark"] {}`.
