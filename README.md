# InfantID — Frontend React

Frontend web do sistema InfantID — React 18 + Vite.

## Stack

| Camada | Tecnologia |
|---|---|
| Framework | React 18 |
| Bundler | Vite 6 |
| Roteamento | React Router v6 |
| HTTP | Axios |
| Estado servidor | TanStack Query (React Query v5) |
| Estilo | CSS puro (`tokens.css` — design system próprio) |
| Fonte | Inter + JetBrains Mono (Google Fonts) |

## Estrutura do projeto

```
.
├── index.html               # Entrada HTML (favicon em /public/favicon.svg, fonts, meta)
├── public/
│   └── favicon.svg          # Ícone de impressão digital teal
├── vite.config.js           # Proxy /api → backend, porta 3000
├── .env.example             # Exemplo local de configuração
├── package.json
└── src/
    ├── main.jsx             # Ponto de entrada: QueryClient + BrowserRouter
    ├── App.jsx              # Shell: Sidebar + Topbar + Routes + tema/densidade
    │
    ├── styles/
    │   ├── tokens.css       # Design system completo (cores, espaçamento, dark mode)
    │   └── global.css       # @import tokens.css
    │
    ├── api/                 # Funções Axios (uma por módulo do backend)
    │   ├── client.js        # Instância Axios + interceptor de erro + withAdminHeader()
    │   ├── cadastro.js      # /cadastro/responsaveis, /cadastro/, /cadastro/sexo/…
    │   ├── coleta.js        # /coleta/, /coleta/acronimo/, /coleta/coletista/…
    │   ├── recoleta.js      # /recoleta/, /recoleta/tipo-recoleta/…
    │   ├── endereco.js      # /endereco/buscar-estados/ → cidades → bairros → ruas
    │   ├── documentos.js    # /documentos/tipos/ (GET/POST/DELETE), /documentos/importar/
    │   │                    # getTipos() unwraps {tipos:[]} e normaliza id: t.id_tipo_documento
    │   └── relatorios.js    # /relatorios/mae, /bebe, /coletas, /recoletas, /documentos…
    │
    ├── hooks/               # React Query hooks (um por domínio)
    │   ├── usePaginatedQuery.js  # Hook genérico: page + perPage + busca server-side
    │   ├── useListQuery.js       # Hook genérico: listas estáticas (dropdowns)
    │   ├── useCadastro.js
    │   ├── useColeta.js
    │   ├── useRecoleta.js
    │   ├── useEndereco.js
    │   ├── useDocumentos.js
    │   ├── useRelatorios.js
    │   ├── useDesvinculo.js
    │   └── useToast.jsx
    │
    ├── components/          # Componentes de UI reutilizáveis
    │   ├── Icon.jsx         # 47 ícones SVG inline (sem dependência externa)
    │   ├── Sidebar.jsx      # Sidebar colapsável com NavLink ativo; logo é <img src="/favicon.svg">
    │   ├── Topbar.jsx       # Breadcrumbs, busca (⌘K), toggle dark/light
    │   ├── CommandPalette.jsx # Paleta ⌘K com busca em páginas + mães + bebês
    │   ├── FilterBar.jsx    # Barra de filtros com chips removíveis
    │   ├── Pagination.jsx   # Paginação numérica
    │   ├── Table.jsx        # Th ordenável + sortBy()
    │   ├── SearchSelect.jsx # Combobox com busca paginada via API
    │   ├── Modal.jsx        # Modal com Esc, backdrop click, footer
    │   ├── Drawer.jsx       # Painel lateral deslizante
    │   ├── Pill.jsx         # Pill de status + StatusMeter
    │   ├── Kpi.jsx          # Card de métrica
    │   ├── EmptyState.jsx   # Estado vazio com ícone
    │   └── index.js         # Barrel de exports
    │
    └── pages/               # Páginas (uma por rota)
        ├── OverviewPage.jsx          # Dashboard com KPIs e acesso rápido
        ├── CalendarPage.jsx          # Grade mensal de recoletas
        ├── CadastroMaePage.jsx       # Formulário de cadastro de mãe
        ├── CadastroBebePage.jsx      # Formulário de cadastro de bebê
        ├── NovaColetaPage.jsx        # Fluxo em 3 etapas: bebê → detalhes → confirmar
        ├── RecoletaPage.jsx          # Split-view: pendentes + formulário
        ├── DesvinculoPage.jsx        # Desvínculo com confirmação modal
        ├── ReportMaesPage.jsx        # Relatório de mães (tabela + cards + drawer)
        ├── ReportBebesPage.jsx       # Relatório de bebês
        ├── ReportColetasPage.jsx     # Relatório de coletas
        ├── ReportRecoletasPage.jsx   # Relatório de recoletas + filtro por status
        ├── RelatorioDocumentosPage.jsx # Toggle lista/pivot + drawer de detalhe
        └── SobrePage.jsx             # Sobre o projeto + admin de tipos de documento (modal multi-step)
```

## Rotas

| Path | Página |
|---|---|
| `/` | Redireciona para `/overview` |
| `/overview` | Visão Geral (dashboard) |
| `/calendario` | Calendário de recoletas |
| `/cadastro/mae` | Cadastrar mãe |
| `/cadastro/bebe` | Cadastrar bebê |
| `/coletas/nova` | Primeira coleta (stepper) |
| `/coletas/recoleta` | Registrar recoleta |
| `/relatorios/maes` | Relatório de mães |
| `/relatorios/bebes` | Relatório de bebês |
| `/relatorios/coletas` | Relatório de coletas |
| `/relatorios/recoletas` | Relatório de recoletas |
| `/relatorios/documentos` | Relatório de documentos |
| `/desvinculo` | Desvínculo de bebê |
| `/sobre` | Sobre o projeto + admin de documentos |

## Como rodar

```bash
npm install
npm run dev       # dev em http://localhost:3000
npm run build     # build de produção em dist/
npm run preview   # serve o build localmente
```

## Variáveis de ambiente

Crie um arquivo `.env.local` a partir de `.env.example`:

```
VITE_API_BASE=/api
VITE_BACKEND_TARGET=http://127.0.0.1:8000
```

Em desenvolvimento, o Vite reescreve `/api/*` → `http://127.0.0.1:8000/*` via proxy, eliminando a necessidade de configurar CORS no backend para dev.

Em produção, configure o servidor web (nginx, Caddy, etc.) para fazer o mesmo proxy.

## Design system

O arquivo `src/styles/tokens.css` contém todas as variáveis CSS do design:

- **Paleta**: fundo neutro `#fafaf9`, texto `#1c1917`, accent teal `#0d9488`
- **Dark mode**: variáveis sobrescritas via `[data-theme="dark"]` no elemento `.app`
- **Densidade**: `[data-density="compact|comfortable|spacious"]`
- **Sidebar colapsada**: `[data-collapsed="true"]`

As preferências de tema, densidade e estado da sidebar são persistidas em `localStorage`.

## Autenticação de administrador

Algumas operações em `/sobre` (gerenciar tipos de documento, importar banco) requerem uma senha de administrador. O fluxo é iniciado pelo botão "Gerenciar" e acontece em um modal multi-step:

1. **auth** — campo de senha + Cancelar/Confirmar. Antes de armazenar, a senha é hasheada via `crypto.subtle.digest('SHA-256', ...)` e convertida para hex. O hash resultante é enviado no header `X-Admin-Password` em todas as requisições admin, correspondendo ao valor de `ADMIN_PASSWORD_HASH` configurado no `.env` do backend.
2. **menu** — três ações disponíveis: Atualizar banco, Novo tipo de documento, Remover tipo de documento.
3. **add** — formulário com descrição, escopo (`bebe` ou `mae` — o valor `ambos` não é aceito pelo modelo) e flag obrigatório.
4. **remove** — select com os tipos cadastrados + confirmação de remoção.

A sessão persiste em memória (state do componente) enquanto a página estiver aberta: reabrir o modal vai direto ao menu. Um pill "Sessão ativa" aparece no cabeçalho da seção quando há sessão ativa.

## Padrão de hooks

Todos os hooks de dados seguem dois padrões base:

**`usePaginatedQuery(queryKey, fetchFn, { page, perPage, busca })`**
- Para listas paginadas server-side (relatórios)
- `placeholderData: prev => prev` evita flash ao trocar de página

**`useListQuery(queryKey, fetchFn, { enabled, params })`**
- Para dropdowns e listas estáticas
- `staleTime: 10min` evita recarregamento desnecessário

Mutations usam `useMutation` com `onSuccess` invalidando as queries relacionadas via `queryClient.invalidateQueries`.
