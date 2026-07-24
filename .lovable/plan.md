# Revisão final — TV Player Reverse Engineering Documentation

## Situação verificada
- O arquivo `docs/TV_PLAYER_REVERSE_ENGINEERING.md` **não existe** no repositório (a criação anterior foi interrompida). Portanto, esta "revisão final" será executada como **criação já incorporando todos os critérios de qualidade** do pedido — nenhum outro documento será criado ou alterado, e nenhum código de aplicação será tocado.
- Referências reais validadas: `src/components/LivePlayer.tsx`, `src/routes/api/public/hls.$.ts`, `src/routes/index.tsx`, `src/routes/__root.tsx`, `package.json` (`hls.js@^1.6.16`, React 19, Vite 8), `vite.config.ts` (TanStack Start + Nitro/Cloudflare via `@lovable.dev/vite-tanstack-config`).

## Arquivo
- Criar `docs/TV_PLAYER_REVERSE_ENGINEERING.md` (único arquivo alterado).

## Princípios editoriais
- PT-BR, Markdown, sem emojis salvo os marcadores de status pedidos (✅ ⚠️ 🔮 ❌).
- Toda afirmação técnica é validada contra os arquivos reais acima; nada assumido.
- Separação estrita entre **arquitetura atual** e **evolução futura** — funcionalidades não implementadas aparecem apenas como roadmap.
- Trechos de código curtos, ilustrativos (assinaturas, exemplo de request/response, snippet de config), nunca cópia do projeto.
- Cross-links para docs existentes (`./TV_PLAYER.md`, `./PLAYER_ARCHITECTURE.md`, `./API_REFERENCE.md`, `./adr/`), sem duplicar conteúdo.

## Estrutura do documento

1. **Visão geral da arquitetura**
   - Stack real: TanStack Start v1 + React 19 + Vite 8 + Tailwind v4 + `hls.js@^1.6.16`, executado em Cloudflare Workers (workerd via Nitro).
   - Diagrama ASCII (Browser → Player Component → HLS Engine → Proxy/API Layer → Streaming Server) + variante Mermaid.
   - Papéis e fronteiras de cada camada.

2. **Fluxo completo de reprodução** — mount → primeiro frame
   - SSR do shell, hidratação, IntersectionObserver (`rootMargin: 200px`), import dinâmico de `hls.js`, `attachMedia`, GET `/api/public/hls/live.m3u8`, parse do manifest, GET dos segmentos `.ts` com `Range`, `appendBuffer`, evento `playing`.
   - Diagrama de sequência.

3. **Compatibilidade entre navegadores** (expandida)
   - Tabela `Navegador × Engine × Método × Observações` (Chrome/Edge/Firefox/Android → HLS.js + MSE; Safari macOS/iOS → HLS nativo; Android → HLS.js preferido, nativo como fallback).
   - Por que Safari não usa HLS.js (MSE limitado + suporte nativo `application/vnd.apple.mpegurl`), como funciona o fallback (`Hls.isSupported()` → `canPlayType()` → `error`), impacto de autoplay, `muted`, `playsInline`, fullscreen mobile (iOS não suporta Fullscreen API padrão no `<div>` — só no elemento `<video>`).

4. **Arquivos responsáveis pelo player**
   - `src/components/LivePlayer.tsx`, `src/routes/api/public/hls.$.ts`, `src/routes/index.tsx` (montagem), `src/routes/__root.tsx` (head/SEO), `src/styles.css` (animações), `package.json`, `vite.config.ts` (TanStack Start + Nitro Cloudflare).
   - Para cada: responsabilidade, dependências, entradas, saídas, comunicação com os demais.

5. **HLS e streaming**
   - Biblioteca `hls.js@^1.6.16`, import dinâmico, config real `{ lowLatencyMode: true, backBufferLength: 30 }`.
   - Manifesto `.m3u8`, segmentos `.ts/.m4s/.mp4/.key`, MIME types atribuídos pelo proxy, `Range`, gestão de buffer, tratamento de `Hls.Events.ERROR` fatal, retry via remontagem do pipeline.
   - Marcar como 🔮 futuro: ABR customizado, DVR, múltiplas fontes.

6. **Proxy, CORS e servidor**
   - Rota TanStack `createFileRoute('/api/public/hls/$')` com handlers OPTIONS/GET/HEAD.
   - Origem hard-coded (`ORIGIN` fixo — mitigação de SSRF), MIME por extensão, propagação de `Content-Length`/`Content-Range`/`Accept-Ranges`/`Cache-Control`/`ETag`/`Last-Modified`, headers CORS, defaults de `Cache-Control` (`no-cache` para `.m3u8`, `public, max-age=60` para segmentos), streaming de `upstream.body`.
   - Exemplo real de request/response.

7. **Performance**
   - Lazy activation (IO), `hls.js` fora do bundle inicial (import dinâmico), streaming sem bufferização intermediária no Worker, `aspect-video` reservando espaço (sem CLS), overlay idle no lugar de poster pesado, `autoplay muted playsInline`, cache de segmentos no proxy.
   - Marcar como 🔮 futuro: preload de manifest, prefetch de segmentos, poster estático otimizado.

8. **Estados e tratamento de erros**
   - FSM `idle → loading → playing | paused | error`, eventos capturados (`playing`, `waiting`, `pause`, `error`, `Hls.Events.ERROR` fatal), overlays por estado, retry manual.
   - Marcar como 🔮 futuro: reconexão automática com backoff, telemetria de erros.

9. **Segurança**
   - `/api/public/*` bypassa auth por design (stream público). CORS `*` (recurso público). Origem fixa impede open-proxy/SSRF. Sem credenciais, cookies ou tokens.
   - Marcar como 🔮 futuro: allow-list de Referer/Origin, token assinado (HMAC/JWT), rate-limit, DRM (Widevine/FairPlay/PlayReady), autenticação de stream.

10. **Como portar para outro projeto** — checklist operacional
    - Dependências, componente, proxy, CORS, MIME, lazy, estados, testes Safari/Chrome/Firefox/Android/iOS.
    - Adaptações mínimas (trocar `ORIGIN` e `STREAM_URL`).
    - Notas para stacks alternativas (Next route handler, Express/Fastify) descritas em texto — sem colar código completo.

11. **Guia para outra IA reconstruir** — 10 etapas operacionais
    - Componente visual → `<video>` → HLS.js → proxy → CORS → MIME → lazy → estados → testes de browsers → validação de performance. Cada etapa com critério de aceite objetivo.

12. **Decisões arquiteturais e justificativas** (nova seção)
    - Uma entrada estruturada (**Decisão / Motivo / Alternativas / Consequência**) para cada:
      HLS.js com fallback nativo; proxy same-origin; streaming direto (sem buffer no Worker); import dinâmico de `hls.js`; IntersectionObserver para lazy activation; execução em Cloudflare Worker; SSR seguro (sem tocar `window` no server, dynamic import client-side).
    - Referências cruzadas aos ADRs existentes em `docs/adr/`.

13. **Limitações conhecidas da implementação atual** (nova seção)
    - Somente limitações confirmadas por leitura do código: sem DRM, sem autenticação/tokenização do stream, sem controle de acesso por usuário, sem DVR/timeshift, sem gravação, fonte única hard-coded, sem ABR customizado, sem legendas, sem analytics, sem Media Session API, sem PiP/Document PiP, sem Chromecast/AirPlay, sem reconexão automática com backoff (só retry manual), sem fullscreen no elemento `<video>` para iOS.

14. **Matriz de requisitos** (tabela final)
    - Requisito | Status (✅ / ⚠️ / ❌ futuro) | Observação
    - Inclui: HLS Streaming, HLS.js, Safari fallback nativo, Lazy loading, Proxy CORS, Range requests, SSR compatibility, Streaming Worker, Retry manual, Fullscreen, Autoplay muted, DRM, PiP, Chromecast/AirPlay, DVR, Legendas, Analytics, Reconexão automática, Media Session API, Token assinado.

15. **TV Player Reference Specification** (independente do código)
    - Requisitos funcionais, técnicos, de performance (LCP intacto, sem CLS, bundle inicial sem hls.js, TTFF alvo) e de compatibilidade — redigidos de forma que uma IA construa um equivalente sem ver o código.

16. **Critério de aprovação**
    - Checklist final validando os 4 critérios do pedido (outro dev recria, outra IA entende, decisões documentadas, melhorias futuras não quebram a arquitetura atual).

## Fora de escopo
- Nenhuma alteração em código de aplicação, outros documentos, ADRs, `package.json`, `vite.config.ts` ou assets.
