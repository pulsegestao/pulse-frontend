# Pulse Gestão — Frontend

Interface web do **Pulse Gestão**, plataforma de controle de estoque com PDV integrado e inteligência artificial para pequenos negócios brasileiros.

> Este repositório contém apenas o frontend. Nenhuma chamada de API real está implementada neste estágio.

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

| Rota | Componente | Descrição |
|---|---|---|
| `/` | `pages/Landing` | Landing page completa |
| `/cadastro` | `pages/Cadastro` | Fluxo de cadastro em 2 etapas |

---

## Estrutura de pastas

```
src/
├── components/
│   ├── layout/
│   │   ├── Navbar.jsx          # Navbar fixa com scroll detection
│   │   └── Footer.jsx          # Rodapé com links e contato
│   └── ui/
│       ├── DashboardMockup.jsx # Preview visual do dashboard
│       └── MiniChart.jsx       # Gráfico SVG decorativo
│
├── hooks/
│   └── useInView.js            # IntersectionObserver para animações de scroll
│
├── pages/
│   ├── Landing/
│   │   ├── index.jsx           # Composição da landing page
│   │   └── sections/
│   │       ├── Hero.jsx
│   │       ├── Problem.jsx
│   │       ├── Solution.jsx
│   │       ├── Features.jsx
│   │       ├── AISection.jsx
│   │       ├── StatsTicker.jsx
│   │       ├── Testimonials.jsx
│   │       ├── Pricing.jsx
│   │       └── CTABanner.jsx
│   └── Cadastro/
│       ├── index.jsx           # Container com stepper e estado do fluxo
│       └── steps/
│           ├── StepOne.jsx     # Etapa 1: dados da conta
│           └── StepTwo.jsx     # Etapa 2: dados do negócio
│
├── styles/
│   └── GlobalStyles.jsx        # Estilos globais, fontes e animações
│
├── theme/
│   └── colors.js               # Tokens de cor centralizados
│
├── App.jsx                     # BrowserRouter + Routes
└── main.jsx                    # Entry point
```

---

## Sistema de design

### Cores

Todos os valores de cor são importados do arquivo central `src/theme/colors.js` como o objeto `C`.

```js
import C from "../theme/colors";

// Uso
color: C.blue        // #1E3A8A — primária
color: C.green       // #16A34A — confirmação / sucesso
color: C.graphite    // #1F2937 — texto principal
color: C.mid         // #6B7280 — texto secundário
color: C.border      // #E5E7EB — bordas e divisores
color: C.gray        // #F3F4F6 — fundos suaves
color: C.bluePale    // #EFF4FF — fundos com destaque azul
color: C.greenPale   // #F0FDF4 — fundos com destaque verde
```

### Tipografia

| Família | Uso |
|---|---|
| **Plus Jakarta Sans** | Corpo, labels, botões |
| **Syne** | Títulos e logo (classe `.syne`) |

Carregadas via `@import` no `GlobalStyles.jsx`.

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

### Animações de scroll

Use o hook `useInView` + classes CSS para animar elementos na entrada.

```jsx
import useInView from "../hooks/useInView";

const [ref, visible] = useInView(0.15);

<div ref={ref} className={`fade-up ${visible ? "visible" : ""}`}>
  ...
</div>
```

Classes de delay disponíveis: `.d1` `.d2` `.d3` `.d4` `.d5` `.d6`

### Estilos

O projeto usa **inline styles** em vez de CSS framework. Não há Tailwind, CSS Modules ou styled-components. Toda a estilização é feita via `style={{}}` com valores dos tokens de `colors.js`.

---

## Convenções de código

- Componentes em **PascalCase**, arquivos `.jsx`
- Hooks em **camelCase**, arquivos `.js`
- Imports de cores sempre como `import C from "../theme/colors"`
- Sem CSS externo por componente — usar `GlobalStyles.jsx` para regras globais
- `strokeWidth={1.5}` para ícones decorativos, `strokeWidth={2}` para funcionais

---

## Páginas

### Landing (`/`)

Página de marketing com as seções:

1. **Hero** — headline principal, CTA e mockup do dashboard
2. **Problem** — dores do público-alvo
3. **Solution** — como o Pulse resolve cada dor
4. **Features** — funcionalidades detalhadas
5. **AI Section** — destaque para as features de inteligência artificial
6. **Stats Ticker** — ticker animado com métricas sociais
7. **Testimonials** — depoimentos de clientes
8. **Pricing** — planos e preços
9. **CTA Banner** — call-to-action final

### Cadastro (`/cadastro`)

Fluxo de registro em 2 etapas com stepper visual animado:

- **Etapa 1 — Sua conta**: Nome, email, senha, confirmação de senha, CPF (opcional)
- **Etapa 2 — Seu negócio**: Nome do negócio, tipo, CNPJ (opcional com campo condicional)

> Ao finalizar, os dados são exibidos via `console.log`. Nenhuma API é chamada.

---

## Variáveis de ambiente

Nenhuma variável de ambiente é necessária neste estágio.

---

## Licença

Privado — todos os direitos reservados.
