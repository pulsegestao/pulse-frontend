# Pulse Gestão — Frontend

Interface web do **Pulse Gestão**, plataforma de controle de estoque com PDV integrado e inteligência artificial para pequenos negócios brasileiros.

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
- Backend rodando em `http://localhost:8080`

---

## Instalação e execução

```bash
# 1. Instalar dependências
npm install

# 2. Iniciar servidor de desenvolvimento
npm run dev

# 3. Build de produção
npm run build

# 4. Preview do build
npm run preview
```

O servidor de desenvolvimento sobe em `http://localhost:5173` por padrão.

---

## Rotas

| Rota | Componente | Acesso | Descrição |
|---|---|---|---|
| `/` | `pages/Landing` | público | Landing page completa |
| `/login` | `pages/Login` | público | Autenticação |
| `/cadastro` | `pages/Cadastro` | público | Registro em 2 etapas |
| `/verify-email` | `pages/VerifyEmail` | público | Confirmação de conta |
| `/dashboard` | `pages/Dashboard` | autenticado | Painel principal com KPIs |
| `/gerir-estoque` | `pages/GerirEstoque` | autenticado | CRUD de produtos |
| `/estoque-entrada` | `pages/EstoqueEntrada` | autenticado | Entrada manual ou via CSV |
| `/configuracoes` | `pages/Configuracoes` | autenticado | Perfil, empresa, equipe e preferências |

Rotas autenticadas são protegidas por `AuthShell` — redireciona para `/login` se não houver token JWT válido.

---

## Estrutura de pastas

```
src/
├── components/
│   ├── layout/
│   │   ├── Navbar.jsx            # Navbar fixa com scroll detection (landing)
│   │   └── Footer.jsx            # Rodapé (landing)
│   ├── ui/
│   │   ├── DashboardMockup.jsx   # Preview visual do dashboard (landing)
│   │   └── MiniChart.jsx         # Gráfico SVG decorativo (landing)
│   ├── Toast.jsx                 # Container de toasts globais
│   ├── ErrorBoundary.jsx         # React Error Boundary com tela amigável
│   └── WidgetError.jsx           # Estado de erro para cards/widgets com retry
│
├── hooks/
│   ├── useInView.js              # IntersectionObserver para animações de scroll
│   ├── useAuth.js                # getProfile(), getToken(), removeToken()
│   ├── useTheme.js               # { dark, toggle } com persistência localStorage
│   └── useToast.js               # { success, error, warning, info } via CustomEvent
│
├── pages/
│   ├── Landing/
│   ├── Login/
│   ├── Cadastro/
│   │   └── steps/               # StepOne.jsx, StepTwo.jsx
│   ├── VerifyEmail/
│   ├── Dashboard/
│   │   └── components/          # DashboardHeader, MetricsCards, SalesChart,
│   │                              LowStockTable, TopProducts, QuickActions
│   ├── GerirEstoque/
│   ├── EstoqueEntrada/
│   │   └── components/          # ManualEntry, CsvPreview
│   └── Configuracoes/
│       ├── index.jsx            # Layout com sidebar de abas + ?tab= routing
│       └── tabs/                # PerfilTab, EmpresaTab, EquipeTab,
│                                  PreferenciasTab, SegurancaTab
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
├── App.jsx                      # BrowserRouter + Routes + AuthShell
└── main.jsx                     # Entry point
```

---

## Sistema de design

### Cores

Todos os valores de cor são importados de `src/theme/colors.js` como o objeto `C`. Os tokens são CSS custom properties — suportam dark mode automaticamente.

```js
import C from "../theme/colors";

color: C.blue        // primária
color: C.green       // sucesso / confirmação
color: C.graphite    // texto principal
color: C.mid         // texto secundário
color: C.border      // bordas e divisores
color: C.surface     // fundo de cards e modais
color: C.pageBg      // fundo de página
color: C.gray        // fundos suaves / hover
color: C.bluePale    // fundos com destaque azul
color: C.greenPale   // fundos com destaque verde
```

**Nunca** hardcodar hex em `background` ou `color`. Usar sempre `C.*`.

### Tipografia

| Família | Uso |
|---|---|
| **Plus Jakarta Sans** | Corpo, labels, botões |
| **Syne** | Títulos e logo (classe `.syne`) |

### Ícones

Exclusivamente via `lucide-react`. Nunca usar emojis como ícones de UI.

```jsx
import { Package, TrendingUp } from "lucide-react";

// Decorativo (grande)
<Package size={24} color={C.blue} strokeWidth={1.5} />

// Funcional (UI)
<TrendingUp size={18} color={C.blue} strokeWidth={2} />

// Inline (texto)
<Package size={14} color={C.mid} strokeWidth={2} />
```

### Dark mode

Controlado via `data-theme="dark"` no `<html>`. Toggle pelo botão lua/sol no `DashboardHeader`.

```js
import { useTheme } from "../hooks/useTheme";
const { dark, toggle } = useTheme();
```

---

## Tratamento de erros

O usuário **nunca** deve ver mensagens técnicas de backend ou stack traces.

Use sempre `friendlyError(err.message)` antes de exibir qualquer mensagem de erro.

### Quando usar cada padrão

| Situação | Solução |
|---|---|
| Widget/card falha ao carregar dado no mount | `<WidgetError message={error} onRetry={load} />` |
| Ação do usuário falha (salvar, deletar) | `toast.error("mensagem")` via `useToast()` |
| Ação do usuário tem sucesso | `toast.success("mensagem")` via `useToast()` |
| Erro de validação de formulário | Banner inline contextual ao campo |
| Crash inesperado de JS | `<ErrorBoundary>` captura automaticamente |

### Toast

```js
import { useToast } from "../hooks/useToast";
const toast = useToast();
toast.success("Produto salvo.");
toast.error(friendlyError(e.message));
```

Toasts aparecem no canto superior direito, somem em 5s, máximo 3 simultâneos.

---

## Autenticação

O JWT é armazenado em `localStorage` via `useAuth.js`. O `AuthShell` em `App.jsx` verifica o token antes de renderizar qualquer rota protegida.

```js
import { getProfile, getToken, removeToken } from "../hooks/useAuth";

const profile = getProfile(); // { userId, userName, companyId, companyName, role }
```

---

## Variáveis de ambiente

| Variável | Padrão | Descrição |
|---|---|---|
| `VITE_API_URL` | `http://localhost:8080` | URL base do backend |

---

## Licença

Privado — todos os direitos reservados.
