# Critérios de Qualidade — Novos Players

> Requisitos mínimos que qualquer player novo da Plataforma de Mídia da Fazenda Rodeo deve atender antes de ser mergeado.

---

## 1. Arquitetura

- [ ] **Modular** — separação clara entre UI, lógica de player, e camada de rede.
- [ ] **Progressive Enhancement** — funciona no baseline (Safari HLS nativo, sem hls.js); features opcionais degradam graciosamente.
- [ ] **Separação UI × lógica** — a UI consome hooks/props; nunca manipula `HTMLMediaElement` diretamente exceto via wrapper.
- [ ] **Componentes reutilizáveis** — se for específico da superfície, é uma skin; se é comum, vai para o Media Engine.
- [ ] **SSR-safe** — nenhum acesso a `window`, `document`, `IntersectionObserver` fora de `useEffect`.
- [ ] **Same-origin proxy** — nunca fetch direto ao origin externo do cliente.
- [ ] **Origin em constante fixa no servidor** — jamais aceitar URL do cliente.

## 2. Código

- [ ] **TypeScript estrito** — sem `any` sem justificativa; contratos explícitos.
- [ ] **Sem dependências desnecessárias** — reusar `hls.js` e APIs Web padrão antes de adicionar libs.
- [ ] **Cleanup completo** — todos os listeners removidos, `hls.destroy()` chamado no unmount.
- [ ] **Race conditions tratadas** — flag `cancelled` em imports assíncronos.

## 3. Performance

- [ ] **Lazy loading obrigatório** — IntersectionObserver ou click-to-activate.
- [ ] **Dynamic import de `hls.js`** — nunca import estático no bundle inicial.
- [ ] **Sem bloqueio de LCP** — imagens poster têm dimensões fixas para evitar CLS.
- [ ] **Streaming no proxy** — nunca `await response.arrayBuffer()`.
- [ ] **Metas Core Web Vitals:**
  - LCP < 2.5s
  - INP < 200ms
  - CLS < 0.1
- [ ] **Lighthouse mobile ≥ 90.**

Detalhes: [`PERFORMANCE.md`](./PERFORMANCE.md).

## 4. Acessibilidade

- [ ] **ARIA labels** em todos os controles (play, mute, fullscreen).
- [ ] **Foco visível** — nunca `outline: none` sem alternativa.
- [ ] **Teclado** — Space (play/pause), M (mute), F (fullscreen) suportados.
- [ ] **Contraste** — controles legíveis sobre qualquer background (usa backdrop-blur).
- [ ] **Legendas** — quando disponíveis, tracks `<track kind="captions">` presentes.

## 5. Segurança

- [ ] **HTTPS em toda a stack** — página e origin.
- [ ] **CSP compatível** — não requer `unsafe-eval`.
- [ ] **Sem SSRF** — origin fixo no servidor.
- [ ] **CORS explícito** — nunca depender de CORS ausente.
- [ ] **Rate limit no edge** planejado.

Detalhes: [`SECURITY.md`](./SECURITY.md).

## 6. Documentação obrigatória

Antes do merge, cada player novo deve ter:

- [ ] Uma seção em [`TV_PLAYER.md`](./TV_PLAYER.md) ou documento equivalente descrevendo o player.
- [ ] Atualização de [`API_REFERENCE.md`](./API_REFERENCE.md) para novos endpoints.
- [ ] Atualização de [`PLAYERS_ROADMAP.md`](./PLAYERS_ROADMAP.md).
- [ ] Relatório de divergência (se divergir do baseline) — template em [`REFERENCE_ARCHITECTURE.md § 3`](./REFERENCE_ARCHITECTURE.md#3-template-de-relatório-de-divergência).

## 7. ADRs obrigatórios

Criar novo ADR em [`adr/`](./adr/) sempre que:

- Se escolhe uma biblioteca não presente hoje.
- Se abandona `hls.js` para um formato específico.
- Se muda o padrão de proxy.
- Se introduz uma nova API do browser (ex.: Doc PiP, Media Session).
- Se muda a política de cache/CORS.

## 8. Compatibilidade

- [ ] **Chrome, Edge, Firefox, Safari** — desktop e mobile.
- [ ] **Safari iOS com `playsInline`** — sem entrar em fullscreen do sistema por padrão.
- [ ] **PWA-ready** — funciona quando a página é instalada.
- [ ] **Media Session API** — integração obrigatória em V2.
- [ ] **Document Picture-in-Picture** — enhancement progressivo em V3.
- [ ] **Chromecast/AirPlay** — planejado para V3.

Ver matriz completa em [`TEST_PLAN.md`](./TEST_PLAN.md).

## 9. Checklist de aceite (pull request)

Antes de aprovar merge:

- [ ] Todos os testes manuais em [`TEST_PLAN.md § 3`](./TEST_PLAN.md#3-casos-de-regressão-manual-por-release) passam.
- [ ] Lighthouse rodado; scores dentro das metas.
- [ ] Documentação atualizada.
- [ ] ADR criado se divergência.
- [ ] Sem novos `any` no TypeScript.
- [ ] Sem novas dependências não justificadas.
- [ ] Bundle size verificado (chunk do player ≤ 150 KB gzipped).
- [ ] Revisado em pelo menos um dispositivo mobile real.

---

## 10. Regra final

> **Se um player novo não passa nesta checklist, ele não representa a plataforma.**
> A qualidade do player é a percepção do usuário sobre a marca.
