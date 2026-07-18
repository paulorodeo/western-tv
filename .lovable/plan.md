# Suite de Documentação — Arquitetura Oficial da Plataforma de Mídia Fazenda Rodeo

Documentação consolidada e definitiva. Nenhuma alteração em código de aplicação — apenas criação de arquivos `.md` e um artifact Mermaid.

## Estrutura final

```text
docs/
├── README.md                              # Índice + declaração de "Arquitetura Oficial de Referência"
├── TV_PLAYER.md                           # Prompts 1 + 2: documentação + engenharia reversa
├── PLAYER_ARCHITECTURE.md                 # Prompt 3: componentes, hooks, fluxos, ciclo de vida
├── PLAYER_REFERENCE_ARCHITECTURE.md       # Prompt 7 (renomeado): baseline oficial + rubrica de comparação
├── PLAYER_MIGRATION_GUIDE.md              # Prompt 4: guia sem duplicar código-fonte
├── PLAYER_FUTURE_ARCHITECTURE.md          # Prompt 5: núcleo compartilhado (TV/Rádio/Podcast/VOD/Clips)
├── MEDIA_ENGINE.md                        # Prompt 6: especificação dos módulos
├── API_REFERENCE.md                       # NOVO: endpoints /api/public/hls/*, /api/public/radio/*
├── PERFORMANCE.md                         # NOVO: lazy, dynamic import, streaming, cache, CWV
├── SECURITY.md                            # NOVO: CORS, CSP, mixed content, rate limit, SSRF, DRM futuro
├── TEST_PLAN.md                           # NOVO: matriz navegadores × SO × dispositivo × feature
├── PLATFORM_ARCHITECTURE.md               # NOVO: diagrama global da plataforma de mídia
├── PLAYERS_ROADMAP.md                     # Prompt 9 (funcional) + roadmap técnico em fases
├── QUALITY_CRITERIA.md                    # NOVO: critérios mínimos para novos players
└── adr/
    ├── README.md                          # Índice + template MADR
    ├── 0001-usar-hls-js.md
    ├── 0002-proxy-same-origin.md
    ├── 0003-import-dinamico-hls.md
    ├── 0004-intersection-observer-lazy.md
    ├── 0005-tanstack-start.md
    ├── 0006-streaming-vs-buffer.md
    ├── 0007-range-requests.md
    ├── 0008-media-session-api.md
    └── 0009-document-picture-in-picture.md
```

Artifact renderizável no chat: `/mnt/documents/Platform_Architecture.mmd` (diagrama global) — emitido via `<lov-artifact>` na resposta final.

## Conteúdo por arquivo

### `docs/README.md` — Índice mestre
- Declara: "Esta suite é a Arquitetura Oficial de Referência da Plataforma de Mídia da Fazenda Rodeo."
- Escopo: TV, Rádio, Podcasts, VOD, Clips, Shorts, Lives, futuros players.
- Mapa de leitura (por papel: PM, dev novo, dev migração, auditoria).
- Regra: qualquer divergência exige ADR justificando.

### `docs/TV_PLAYER.md` (Prompts 1 + 2)
Seções:
1. Escopo e objetivos
2. **Diagrama Mermaid** completo da arquitetura do TV Player
3. **Diagrama ASCII** equivalente
4. **Fluxograma end-to-end** (Mermaid + ASCII): abertura → SSR → hidratação → IntersectionObserver → activate → import dinâmico → attach HLS → GET manifesto (proxy) → GET segmentos → primeiro frame → playing
5. **Mapa de dependências** entre arquivos (Mermaid + tabela)
6. **Árvore de arquivos** exclusivos do TV Player
7. **Engenharia reversa por arquivo** — para cada um: responsabilidade / entradas / saídas / dependências / APIs / eventos / pontos de falha / reuso:
   - `src/components/LivePlayer.tsx`
   - `src/routes/api/public/hls.$.ts`
   - `src/routes/index.tsx` (integração)
   - `src/routes/__root.tsx` (metadados/fontes/shell)
   - `src/routeTree.gen.ts` (gerado)
   - `src/router.tsx`, `src/start.ts`, `src/server.ts` (bootstrap)
   - `src/styles.css` (classes usadas pelo player)
   - `package.json` (dep `hls.js@^1.6.16`)
8. Decisões-chave e cross-links para ADRs correspondentes

### `docs/PLAYER_ARCHITECTURE.md` (Prompt 3)
- Componentes React (`LivePlayer`, `RadioPlayer`) e suas árvores
- Hooks nativos usados hoje; hooks customizados propostos
- Server Routes (`hls.$.ts`, `radio.$.ts`) — contrato
- Proxy HLS — algoritmo detalhado
- Diagramas Mermaid separados: dados, eventos, renderização, rede, máquina de estados
- Ciclo de vida completo: mount → observe → activate → import → attach → play → cleanup

### `docs/PLAYER_REFERENCE_ARCHITECTURE.md` (Prompt 7, renomeado)
- Baseline oficial: quais arquivos, quais contratos, quais invariantes
- Rubrica de comparação: arquitetura, proxy, lazy, FSM, UI, a11y, performance, segurança
- **Template de relatório de divergência**: diferenças / impacto / riscos / vantagens / justificativa / plano de migração
- Regra: divergência sem ADR = débito técnico

### `docs/PLAYER_MIGRATION_GUIDE.md` (Prompt 4)
Sem duplicar código-fonte. Em vez de colar `LivePlayer.tsx`:
- Checklist de migração
- Dependências e comandos (`bun add hls.js`)
- **Estrutura esperada** de arquivos no projeto-alvo
- **Responsabilidades** de cada arquivo (aponta para `TV_PLAYER.md`)
- **Principais trechos** (assinatura de funções, contrato do proxy, hooks-chave) — snippets curtos, não arquivo inteiro
- Fluxo de execução resumido
- Pontos críticos (prefixo `/api/public/`, Range, MIME, CORS preflight, autoplay muted, `playsInline`)
- Adaptações para Next.js Route Handler, Remix resource route, Hono, Express, Workers, Node, Deno
- Erros comuns e resolução
- Validação final: `curl` + checklist visual
- Referências cruzadas: `TV_PLAYER.md`, `API_REFERENCE.md`, `SECURITY.md`

### `docs/PLAYER_FUTURE_ARCHITECTURE.md` (Prompt 5)
- Análise de duplicação atual `LivePlayer` × `RadioPlayer`
- Invariantes comuns: lazy activation, status FSM, mute/volume, retry, metadata
- Abstrair em hooks (`useMediaSource`, `useMediaStatus`, `useLazyActivation`, `useMediaSession`)
- Componentes UI headless (`MediaControls`, `StatusIndicator`)
- Estratégia de migração incremental
- Superfícies: TV, Rádio, Podcast, VOD, Clips
- Diagrama Mermaid do núcleo compartilhado

### `docs/MEDIA_ENGINE.md` (Prompt 6)
Módulos: Media Core, HLS Adapter, Audio Engine, Video Engine, Metadata Service, Media Session Service, Floating Player, Document PiP, Fullscreen Manager, Player State Manager, UI Components, Proxy Layer. Interfaces TypeScript propostas + diagrama.

### `docs/API_REFERENCE.md` (NOVO)
Para cada endpoint (`/api/public/hls/$`, `/api/public/radio/$`):
- Finalidade
- Métodos: `GET`, `HEAD`, `OPTIONS`
- Parâmetros de path (`_splat`)
- Headers aceitos (`Range`, `Content-Type`) e retornados (`Content-Type`, `Content-Length`, `Content-Range`, `Accept-Ranges`, `Cache-Control`, `ETag`, `Last-Modified`, headers CORS)
- Códigos HTTP: 200, 204 (OPTIONS), 206 (Range), 404, 5xx (falha upstream)
- Content-Type por extensão (`.m3u8`, `.ts`, `.m4s`, `.mp4`, `.aac`, `.key`)
- Exemplos `curl` de request/response
- Regras de cache (m3u8 = no-cache, segmentos = 60s)
- Comportamento em preflight CORS

### `docs/PERFORMANCE.md` (NOVO)
Cada decisão com "o quê / por quê / trade-off":
- Lazy Loading via IntersectionObserver (`rootMargin: 200px`)
- Dynamic import de `hls.js` (economia de bundle inicial)
- Bundle splitting via TanStack Start / Vite
- Tree shaking (ESM)
- Streaming via `response.body` no proxy (não bufferiza)
- Range Requests encaminhados
- Cache: `no-cache` para manifesto, `max-age=60` para segmentos, respeito a ETag/Last-Modified upstream
- BackBuffer (`backBufferLength: 30`)
- Low latency mode (`lowLatencyMode: true`)
- Core Web Vitals: impacto no LCP, INP, CLS
- Lighthouse — o que medir e alvos
- Uso de memória, CPU, rede — heurísticas
- Preload da imagem LCP (referência ao knowledge de perf)

### `docs/SECURITY.md` (NOVO)
- CORS: por que `*` funciona aqui (proxy same-origin do ponto de vista do browser), quando restringir
- CSP recomendada (`media-src 'self'`, `connect-src 'self'`)
- HTTPS obrigatório (Mixed Content bloqueia HLS em página HTTPS)
- Proxy same-origin como mitigação de CORS upstream
- Headers de segurança recomendados (`X-Content-Type-Options`, `Referrer-Policy`)
- Cache — evitar cache de conteúdo autenticado
- Rate limit (proposto para futuro — Cloudflare)
- **SSRF**: proxy hoje tem ORIGIN fixo (seguro); alerta explícito para NUNCA aceitar URL do cliente
- Signed URLs (futuro)
- DRM/Widevine/FairPlay (futuro)
- Prevenção de abuso: hotlinking, embed não autorizado

### `docs/TEST_PLAN.md` (NOVO)
- Matriz de navegadores: Chrome, Edge, Firefox, Safari, Brave
- Matriz de SO: Windows, macOS, Linux, Android, iOS
- Dispositivos: Desktop, Tablet, Smartphone, Smart TV
- Funcionalidades: reprodução, autoplay muted, fullscreen, PiP, reconexão, troca de rede, ABR, perda de conexão, Media Session, PWA
- Casos de teste com passos e critério de aceitação
- Regressão manual + oportunidades de automação (Playwright)

### `docs/PLATFORM_ARCHITECTURE.md` (NOVO)
- **Diagrama Mermaid global**: Browser → Media Engine → (Video Engine / Audio Engine) → Media Session → Floating Player → Doc PiP → Proxy Layer → Cloudflare → HLS Origin → Storage
- Equivalente em ASCII
- Responsabilidade de cada camada
- Fronteiras de contrato entre camadas

### `docs/PLAYERS_ROADMAP.md` (Prompt 9 + roadmap técnico)
Duas partes:

**A) Roadmap funcional** — tabela por player:
- TV: Floating, PiP, Chromecast, AirPlay, DVR, ABR automática, Legendas
- Rádio: Media Session, Floating, Doc PiP, PWA, Equalizador, Favoritos, Histórico, Compartilhamento, Sleep Timer
Colunas: Feature / Prioridade (MVP/V2/V3) / Complexidade / Dependências / Notas

**B) Roadmap técnico** — fases arquiteturais:
- Fase 1 — TV Player (atual)
- Fase 2 — Radio Player (atual)
- Fase 3 — Media Session API
- Fase 4 — Floating Player
- Fase 5 — Document Picture-in-Picture
- Fase 6 — Media Engine
- Fase 7 — Player compartilhado (TV/Rádio/Podcast/Clips/VOD)

Diagrama Mermaid gantt + tabela de dependências entre fases.

### `docs/QUALITY_CRITERIA.md` (NOVO)
Requisitos mínimos para qualquer player novo:
- Arquitetura modular
- Progressive enhancement
- Separação UI × lógica
- TypeScript estrito
- Componentes reutilizáveis
- SSR-safe (sem `window` em módulo)
- Lazy loading obrigatório
- Metas de performance (LCP, INP)
- Acessibilidade (ARIA, teclado, foco)
- Documentação obrigatória (link para template)
- ADR obrigatório para desvios
- Compatibilidade: PWA, Media Session, Doc PiP, Chromecast/AirPlay (futuro)
- Checklist de aceite antes de merge

### `docs/adr/` (Prompt 8)
`README.md` com índice + template MADR (Contexto / Decisão / Alternativas / Consequências / Status / Data). Nove ADRs (listados na árvore acima), cada um curto e focado.

## Entrega no chat
- Resposta curta listando os documentos criados agrupados por eixo (Referência, Guias, Segurança/Performance/Testes, Roadmap, ADRs)
- Renderização inline do diagrama global via `<lov-artifact>`

## Fora do escopo
- Nenhuma alteração em `.tsx`/`.ts` de runtime
- Nenhuma instalação de dependência
- Media Engine é especificado, não implementado
