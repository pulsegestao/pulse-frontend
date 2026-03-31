# Pulse Gestão — Frontend

Interface web do **Pulse Gestão**, plataforma de controle de estoque com PDV integrado, relatórios analíticos e inteligência artificial para pequenos negócios brasileiros.

---

## Stack

| Tecnologia | Versão | Função |
|---|---|---|
| [React](https://react.dev/) | 19 | UI library |
| [Vite](https://vitejs.dev/) | 7 | Bundler e dev server |
| [React Router DOM](https://reactrouter.com/) | 7 | Roteamento client-side |
| [Lucide React](https://lucide.dev/) | latest | Ícones |

---

## Pré-requisitos

- Node.js `>= 20`
- npm `>= 9`
- Backend rodando em `http://localhost:8080` (configurável via `VITE_API_URL`)

---

## Instalação e execução

```bash
# 1. Instalar dependências
npm install

# 2. Copiar variáveis de ambiente
cp .env.example .env

# 3. Iniciar servidor de desenvolvimento
npm run dev

# 4. Build de produção
npm run build

# 5. Preview do build
npm run preview
```

O servidor de desenvolvimento sobe em `http://localhost:5173` por padrão.

---

## Variáveis de ambiente

| Variável | Padrão | Descrição |
|---|---|---|
| `VITE_API_URL` | `http://localhost:8080` | URL base do backend |

---

## Rotas

| Rota | Componente | Acesso | Descrição |
|---|---|---|---|
| `/` | `pages/Landing` | público | Landing page completa com seções de marketing |
| `/login` | `pages/Login` | público | Autenticação |
| `/cadastro` | `pages/Cadastro` | público | Registro em 2 etapas (usuário + empresa) |
| `/verify-email` | `pages/VerifyEmail` | público | Confirmação de conta via token do email |
| `/esqueci-senha` | `pages/EsqueciSenha` | público | Solicitação de redefinição de senha |
| `/redefinir-senha` | `pages/RedefinirSenha` | público | Redefinição via token do email |
| `/dashboard` | `pages/Dashboard` | autenticado | Painel principal com KPIs e gráficos |
| `/pdv` | `pages/PDV` | autenticado | Ponto de Venda com múltiplos métodos de pagamento |
| `/gerir-estoque` | `pages/GerirEstoque` | autenticado | Listagem e gestão de produtos com coluna de fornecedor |
| `/estoque/entrada` | `pages/EstoqueEntrada` | autenticado | Entrada manual ou via NF-e XML |
| `/reposicao` | `pages/Reposicao` | manager+ | Lista de ordens de compra |
| `/reposicao/novo` | `pages/Reposicao/NovoPedido` | manager+ | Nova ordem de compra com sugestão via IA e vínculo inline de fornecedor |
| `/reposicao/:id` | `pages/Reposicao/ConfirmarRecebimento` | manager+ | Confirmar recebimento parcial ou total |
| `/relatorios` | `pages/Relatorios` | autenticado | Relatórios analíticos por período |
| `/relatorios/prazo` | `pages/VendasPrazo` | autenticado | Gestão de recebíveis (vendas a prazo) |
| `/insights` | `pages/Insights` | autenticado | Feed de alertas e analytics de produto |
| `/configuracoes` | `pages/Configuracoes` | autenticado | Perfil, empresa, equipe, fornecedores, segurança e integrações |
| `/sessao-expirada` | `pages/SessionExpired` | autenticado | Tela de sessão expirada |

Rotas autenticadas são envolvidas por `<AuthShell>` — redireciona para `/login` em caso de sessão inativa.
Rotas com acesso `manager+` usam `<RoleGuard>` — redireciona para `/dashboard` se role for `employee`.

---

## Estrutura de pastas

```
src/
├── components/
│   ├── layout/
│   │   ├── Navbar.jsx            # Navbar com scroll detection (landing)
│   │   ├── Footer.jsx            # Rodapé (landing)
│   │   └── QuickActionsBar.jsx   # Barra de ações rápidas nas páginas internas
│   ├── ui/
│   │   ├── DashboardMockup.jsx   # Preview visual do dashboard (landing)
│   │   └── MiniChart.jsx         # Gráfico SVG decorativo (landing)
│   ├── Toast.jsx                 # Container de toasts globais
│   ├── ErrorBoundary.jsx         # React Error Boundary com tela amigável
│   └── WidgetError.jsx           # Estado de erro para cards/widgets com retry
│
├── hooks/
│   ├── useAuth.js                # getProfile(), isAuthenticated(), getToken(), removeToken()
│   ├── useTheme.js               # { dark, toggle } com persistência em localStorage
│   ├── useToast.js               # { success, error, warning, info } via CustomEvent
│   └── useInView.js              # IntersectionObserver para animações de scroll (landing)
│
├── pages/
│   ├── Landing/
│   │   ├── index.jsx
│   │   └── sections/             # Hero, Features, Problem, Solution, Pricing,
│   │                               Testimonials, CTABanner, AISection, StatsTicker
│   ├── Login/
│   ├── Cadastro/
│   │   └── steps/                # StepOne.jsx (dados pessoais), StepTwo.jsx (empresa)
│   ├── VerifyEmail/
│   ├── EsqueciSenha/
│   ├── RedefinirSenha/
│   ├── SessionExpired/
│   ├── Dashboard/
│   │   └── components/           # DashboardHeader, MetricsCards, SalesChart,
│   │                               LowStockTable, TopProducts, QuickActions
│   ├── PDV/
│   │   └── index.jsx             # Busca de produto, carrinho, múltiplos métodos
│   │                               (dinheiro/troco, pix, débito, crédito, a prazo),
│   │                               cliente vinculado, integração com maquininha MP
│   ├── GerirEstoque/
│   │   └── components/           # MetricCards, ProductTable (colunas: fornecedor, custo médio, margem)
│   ├── EstoqueEntrada/
│   │   └── components/           # NFeUpload, NFePreviewTable, ManualEntry
│   ├── Reposicao/
│   │   ├── index.jsx             # Lista de ordens de compra com status badges
│   │   ├── NovoPedido.jsx        # Nova ordem: busca de produtos, sugestão IA,
│   │   │                           vínculo inline de fornecedor (LinkSupplierModal),
│   │   │                           agrupamento por fornecedor, envio via WhatsApp/email/PDF
│   │   └── ConfirmarRecebimento.jsx # Recebimento parcial ou total com qty_received e unit_cost
│   ├── Relatorios/
│   │   └── components/           # ProductReport, PaymentMethods, DeadStock, PrazoCard
│   ├── VendasPrazo/
│   │   └── index.jsx             # Tabs Pendentes / Recebidas / Devolvidas,
│   │                               modal de recebimento com PIX, dinheiro, cartão e maquininha
│   ├── Insights/
│   │   └── components/           # InsightFeed, InsightsSummary, InsightCard,
│   │                               VelocityRanking, CategoryBreakdown
│   └── Configuracoes/
│       ├── index.jsx             # Layout com sidebar de abas + ?tab= routing
│       └── tabs/
│           ├── PerfilTab.jsx     # Nome e avatar do usuário
│           ├── EmpresaTab.jsx    # Nome, tipo, CNPJ e chave PIX
│           ├── EquipeTab.jsx     # Membros da empresa com roles
│           ├── FornecedoresTab.jsx # CRUD de fornecedores com canal preferido (WhatsApp/email/PDF)
│           ├── SegurancaTab.jsx  # Alteração de senha
│           ├── PreferenciasTab.jsx # Tema (claro/escuro)
│           └── IntegracoesTab.jsx  # Integrações de pagamento (MercadoPago)
│
├── services/
│   └── api.js                   # authRequest() + todas as funções de API
│
├── styles/
│   └── GlobalStyles.jsx         # Estilos globais, fontes e animações
│
├── theme/
│   └── colors.js                # Tokens de cor centralizados (CSS vars)
│
├── utils/
│   └── errorMessage.js          # friendlyError() — sanitiza erros técnicos
│
├── App.jsx                      # BrowserRouter + Routes + AuthShell + SessionGuard
└── main.jsx                     # Entry point
```

---

## API (`src/services/api.js`)

Todas as chamadas passam por `authRequest(path, options?)`, que injeta o JWT, lança erro em resposta não-ok e dispara o evento `pulse:session-expired` em caso de 401.

| Grupo | Funções |
|---|---|
| **Auth** | `registerUser` · `loginUser` · `verifyEmail` · `checkEmail` · `forgotPassword` · `resetPassword` |
| **Produtos** | `getProducts` · `createProduct` · `updateProduct` · `getLowStock` · `updateStock(id, input)` |
| **NF-e** | `previewNFe(formData)` · `confirmNFe(items)` |
| **Clientes** | `searchCustomers(q)` · `createCustomer(input)` |
| **Vendas** | `registerSale(input)` · `getSalesPrazo(status)` · `receiveSale(id, receivedVia)` · `returnSale(id, returnStock)` |
| **Fornecedores** | `getSuppliers` · `createSupplier(input)` · `updateSupplier(id, input)` · `deleteSupplier(id)` |
| **Reposição** | `getPurchaseOrders` · `getPurchaseOrder(id)` · `createPurchaseOrder(input)` · `updatePurchaseOrder(id, input)` · `suggestPurchaseOrder` · `sendPurchaseOrder(id)` · `confirmPurchaseOrderReceipt(id, items)` · `cancelPurchaseOrder(id)` |
| **Dashboard** | `getDashboardSummary` · `getRevenueChart(period)` · `getTopProducts(period)` |
| **Relatórios** | `getProductReport(period)` · `getPaymentMethods(period)` · `getDeadStock` · `getPrazoReport` |
| **Insights** | `getInsights({type, severity, read, limit, offset})` · `countUnreadInsights` · `markInsightRead(id)` · `markAllInsightsRead` |
| **Analytics** | `getCategoryBreakdown(period)` · `getVelocityRanking(limit)` |
| **Configurações** | `getMe` · `updateMe(input)` · `getCompanySettings` · `updateCompanySettings(input)` · `getCompanyMembers` |
| **Integrações** | `getPaymentIntegrations` · `savePaymentIntegration(data)` · `deletePaymentIntegration(provider)` · `testPaymentIntegration(provider)` · `createPaymentIntent(data)` · `getPaymentIntentStatus(id)` · `cancelPaymentIntent(id)` |
| **NCM** | `getNCMCategories` |

---

## Sistema de design

### Cores

Todos os valores de cor são importados de `src/theme/colors.js` como o objeto `C`. Os tokens são CSS custom properties — o dark mode é suportado automaticamente via `[data-theme="dark"]`.

```js
import C from "../../theme/colors";

color: C.blue          // primária — ações e links
color: C.green         // sucesso, confirmação, positivo
color: C.graphite      // texto principal
color: C.mid           // texto secundário / labels
color: C.border        // bordas e divisores
color: C.surface       // fundo de cards, modais e painéis
color: C.pageBg        // fundo da página
color: C.gray          // fundos suaves e estados de hover
color: C.bluePale      // destaque azul suave (ativo, selecionado)
color: C.greenPale     // destaque verde suave (confirmação)
color: C.amberPale     // destaque âmbar (pendente, atenção)
```

**Nunca** usar hex literal em `background` ou `color`. Usar sempre `C.*`.

### Tipografia

| Família | Uso |
|---|---|
| **Plus Jakarta Sans** | Corpo, labels, botões |
| **Syne** | Títulos e logo (classe `.syne`) |

### Ícones

Exclusivamente via `lucide-react`. Nunca usar emojis como elementos de UI.

```jsx
import { Package, TrendingUp } from "lucide-react";

// Decorativo (grande, contexto visual)
<Package size={24} color={C.blue} strokeWidth={1.5} />

// Funcional (UI, botões, ações)
<TrendingUp size={18} color={C.blue} strokeWidth={2} />

// Inline (texto, badges)
<Package size={14} color={C.mid} strokeWidth={2} />
```

---

## Layout por tipo de página

| Tipo | Estrutura |
|---|---|
| **Landing** | `Navbar` + seções + `Footer`; animações `useInView` com classes `fade-up d1..d6` |
| **Auth** (login, cadastro, senha) | Sem Navbar; gradiente `bluePale → gray → white`; card centralizado `maxWidth: 460` |
| **Autenticadas** | Sem Navbar; `DashboardHeader` fixo (`h=64`); fundo `C.pageBg`; `main padding: "80px 24px 48px"` |
| **Nível 2+** (configurações, estoque, relatórios, reposição) | Botão voltar `ArrowLeft` 36×36px, borda `C.border`, navega para tela pai |

---

## Tratamento de erros

O usuário **nunca** deve ver mensagens técnicas de backend ou stack traces.

Use sempre `friendlyError(err.message)` antes de exibir qualquer erro ao usuário.

| Situação | Solução |
|---|---|
| Widget/card falha ao carregar no mount | `<WidgetError message={error} onRetry={load} />` |
| Ação do usuário falha (salvar, deletar) | `toast.error(friendlyError(e.message))` |
| Ação do usuário tem sucesso | `toast.success("mensagem")` |
| Erro de validação de formulário | Banner inline contextual ao campo |
| Crash inesperado de JavaScript | `<ErrorBoundary>` captura e exibe tela amigável |

```js
import { useToast } from "../../hooks/useToast";
import { friendlyError } from "../../utils/errorMessage";

const toast = useToast();
toast.success("Produto salvo.");
toast.error(friendlyError(e.message));
```

Toasts aparecem no canto superior direito, somem em 5s, máximo 3 simultâneos.

---

## Autenticação

O JWT é armazenado em `localStorage` (padrão) ou `sessionStorage` (opção "lembrar de mim" desativada). O `SessionGuard` em `App.jsx` escuta o evento `pulse:session-expired` e redireciona para `/sessao-expirada` quando o token expira.

```js
import { getProfile, isAuthenticated } from "../../hooks/useAuth";

const { userId, userName, companyId, companyName, role } = getProfile();
```

---

## Dark mode

Controlado via `data-theme="dark"` no elemento raiz. Toggle pelo botão no `DashboardHeader`. Estado persiste em `localStorage("pulse_theme")`.

```js
import { useTheme } from "../../hooks/useTheme";

const { dark, toggle } = useTheme();
```

---

## Licença

Privado — todos os direitos reservados.
